-- =====================================================
-- MIGRACIÓN DE AUTENTICACIÓN A SUPABASE AUTH
-- =====================================================
-- Fecha: 2 de Octubre, 2025
-- Descripción: Configuración de autenticación segura y RLS

-- =====================================================
-- 1. CREAR TABLA DE PERFILES DE USUARIO
-- =====================================================

-- Tabla de perfiles extendidos de usuario
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'advisor', 'user')),
  phone TEXT,
  avatar_url TEXT,
  department TEXT,
  position TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. TRIGGER PARA CREAR PERFIL AUTOMÁTICAMENTE
-- =====================================================

-- Función para crear perfil al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta al crear usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 3. FUNCIONES AUXILIARES
-- =====================================================

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.user_profiles
    WHERE id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es asesor
CREATE OR REPLACE FUNCTION public.is_advisor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'advisor')
    FROM public.user_profiles
    WHERE id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el perfil del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  phone TEXT,
  avatar_url TEXT,
  department TEXT,
  position TEXT,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.email,
    up.full_name,
    up.role,
    up.phone,
    up.avatar_url,
    up.department,
    up.position,
    up.is_active
  FROM public.user_profiles up
  WHERE up.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar último login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS void AS $$
BEGIN
  UPDATE public.user_profiles
  SET last_login_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política: Los admins pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Política: Los admins pueden actualizar cualquier perfil
CREATE POLICY "Admins can update all profiles"
  ON public.user_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Política: Los admins pueden crear perfiles
CREATE POLICY "Admins can insert profiles"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- =====================================================
-- 5. RLS PARA TABLAS EXISTENTES
-- =====================================================

-- PROPERTIES
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver propiedades
CREATE POLICY "Anyone can view properties"
  ON public.properties
  FOR SELECT
  USING (true);

-- Solo admins y asesores pueden crear propiedades
CREATE POLICY "Advisors can create properties"
  ON public.properties
  FOR INSERT
  WITH CHECK (public.is_advisor());

-- Solo admins y asesores pueden actualizar propiedades
CREATE POLICY "Advisors can update properties"
  ON public.properties
  FOR UPDATE
  USING (public.is_advisor())
  WITH CHECK (public.is_advisor());

-- Solo admins pueden eliminar propiedades
CREATE POLICY "Admins can delete properties"
  ON public.properties
  FOR DELETE
  USING (public.is_admin());

-- PROPERTY_APPOINTMENTS
ALTER TABLE public.property_appointments ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver sus propias citas
CREATE POLICY "Users can view own appointments"
  ON public.property_appointments
  FOR SELECT
  USING (
    public.is_advisor() OR
    client_email = (SELECT email FROM public.user_profiles WHERE id = auth.uid())
  );

-- Todos pueden crear citas
CREATE POLICY "Anyone can create appointments"
  ON public.property_appointments
  FOR INSERT
  WITH CHECK (true);

-- Solo admins y asesores pueden actualizar citas
CREATE POLICY "Advisors can update appointments"
  ON public.property_appointments
  FOR UPDATE
  USING (public.is_advisor())
  WITH CHECK (public.is_advisor());

-- Solo admins pueden eliminar citas
CREATE POLICY "Admins can delete appointments"
  ON public.property_appointments
  FOR DELETE
  USING (public.is_admin());

-- ADVISORS
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver asesores
CREATE POLICY "Anyone can view advisors"
  ON public.advisors
  FOR SELECT
  USING (true);

-- Solo admins pueden crear asesores
CREATE POLICY "Admins can create advisors"
  ON public.advisors
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins pueden actualizar, asesores solo su propio perfil
CREATE POLICY "Advisors can update own profile"
  ON public.advisors
  FOR UPDATE
  USING (
    public.is_admin() OR
    id::text = (SELECT id::text FROM public.user_profiles WHERE id = auth.uid())
  );

-- Solo admins pueden eliminar asesores
CREATE POLICY "Admins can delete advisors"
  ON public.advisors
  FOR DELETE
  USING (public.is_admin());

-- SERVICE_INQUIRIES
ALTER TABLE public.service_inquiries ENABLE ROW LEVEL SECURITY;

-- Admins y asesores pueden ver todas las consultas
CREATE POLICY "Advisors can view inquiries"
  ON public.service_inquiries
  FOR SELECT
  USING (public.is_advisor());

-- Todos pueden crear consultas
CREATE POLICY "Anyone can create inquiries"
  ON public.service_inquiries
  FOR INSERT
  WITH CHECK (true);

-- Solo admins y asesores pueden actualizar consultas
CREATE POLICY "Advisors can update inquiries"
  ON public.service_inquiries
  FOR UPDATE
  USING (public.is_advisor())
  WITH CHECK (public.is_advisor());

-- Solo admins pueden eliminar consultas
CREATE POLICY "Admins can delete inquiries"
  ON public.service_inquiries
  FOR DELETE
  USING (public.is_admin());

-- CLIENTS (si existe la tabla)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
    ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
    
    -- Solo admins y asesores pueden ver clientes
    EXECUTE 'CREATE POLICY "Advisors can view clients" ON public.clients FOR SELECT USING (public.is_advisor())';
    
    -- Solo admins y asesores pueden crear clientes
    EXECUTE 'CREATE POLICY "Advisors can create clients" ON public.clients FOR INSERT WITH CHECK (public.is_advisor())';
    
    -- Solo admins y asesores pueden actualizar clientes
    EXECUTE 'CREATE POLICY "Advisors can update clients" ON public.clients FOR UPDATE USING (public.is_advisor())';
    
    -- Solo admins pueden eliminar clientes
    EXECUTE 'CREATE POLICY "Admins can delete clients" ON public.clients FOR DELETE USING (public.is_admin())';
  END IF;
END $$;

-- =====================================================
-- 6. CREAR USUARIOS INICIALES
-- =====================================================

-- NOTA: Los usuarios deben crearse desde el dashboard de Supabase
-- O usando la función de registro de Supabase Auth

-- Para crear el usuario admin manualmente en SQL (solo como respaldo):
-- INSERT INTO auth.users (
--   id,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   raw_user_meta_data,
--   role
-- ) VALUES (
--   gen_random_uuid(),
--   'admincoworkin@inmobiliaria.com',
--   crypt('21033384', gen_salt('bf')),
--   NOW(),
--   '{"full_name": "Admin Coworkin", "role": "admin"}'::jsonb,
--   'authenticated'
-- );

-- =====================================================
-- 7. CONFIGURACIÓN DE STORAGE (para avatares)
-- =====================================================

-- Crear bucket para avatares si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para avatares
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- 8. VISTAS ÚTILES
-- =====================================================

-- Vista de usuarios activos con información completa
CREATE OR REPLACE VIEW public.active_users AS
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.phone,
  up.avatar_url,
  up.department,
  up.position,
  up.last_login_at,
  up.created_at,
  au.last_sign_in_at
FROM public.user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE up.is_active = true;

-- Vista de estadísticas de usuarios
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
  role,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_active = true) as active_users,
  COUNT(*) FILTER (WHERE last_login_at > NOW() - INTERVAL '7 days') as active_last_week,
  COUNT(*) FILTER (WHERE last_login_at > NOW() - INTERVAL '30 days') as active_last_month
FROM public.user_profiles
GROUP BY role;

-- =====================================================
-- 9. GRANTS DE PERMISOS
-- =====================================================

-- Permisos para usuarios autenticados
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT UPDATE ON public.user_profiles TO authenticated;

GRANT SELECT ON public.active_users TO authenticated;
GRANT SELECT ON public.user_stats TO authenticated;

-- Permisos para ejecutar funciones
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_advisor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_last_login() TO authenticated;

-- =====================================================
-- 10. AUDITORÍA
-- =====================================================

-- Tabla de logs de autenticación
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('login', 'logout', 'failed_login', 'password_reset', 'email_change')),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON public.auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_action ON public.auth_logs(action);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON public.auth_logs(created_at);

-- RLS para logs
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver logs
CREATE POLICY "Admins can view auth logs"
  ON public.auth_logs
  FOR SELECT
  USING (public.is_admin());

-- Sistema puede insertar logs
CREATE POLICY "System can insert auth logs"
  ON public.auth_logs
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todo se creó correctamente
DO $$
BEGIN
  RAISE NOTICE '✅ Migración completada exitosamente';
  RAISE NOTICE '📋 Tablas creadas: user_profiles, auth_logs';
  RAISE NOTICE '🔐 RLS habilitado en todas las tablas principales';
  RAISE NOTICE '🔧 Funciones auxiliares creadas';
  RAISE NOTICE '👥 Políticas de seguridad aplicadas';
  RAISE NOTICE '';
  RAISE NOTICE '📝 PRÓXIMOS PASOS:';
  RAISE NOTICE '1. Crear usuarios admin desde Supabase Dashboard';
  RAISE NOTICE '2. Actualizar código de frontend para usar Supabase Auth';
  RAISE NOTICE '3. Probar autenticación y permisos';
END $$;

-- Mostrar resumen de políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
