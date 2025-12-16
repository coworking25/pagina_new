-- =====================================================
-- CREAR TABLA auth_logs PARA AUDITORÍA
-- =====================================================
-- Esta tabla registra eventos de autenticación para auditoría
-- =====================================================

-- Crear la tabla auth_logs
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('login', 'logout', 'failed_login', 'password_reset', 'email_change', 'signup', 'password_change')),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON public.auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_action ON public.auth_logs(action);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON public.auth_logs(created_at);

-- Habilitar Row Level Security
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Política: Solo admins pueden ver todos los logs
CREATE POLICY "Admins can view all auth logs"
  ON public.auth_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Política: Los usuarios pueden ver sus propios logs
CREATE POLICY "Users can view their own auth logs"
  ON public.auth_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Política: El sistema puede insertar logs (sin autenticación requerida para logging)
CREATE POLICY "System can insert auth logs"
  ON public.auth_logs
  FOR INSERT
  WITH CHECK (true);

-- Verificar que la tabla se creó correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'auth_logs'
ORDER BY ordinal_position;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Tabla auth_logs creada correctamente';
    RAISE NOTICE '📋 La tabla registrará eventos de autenticación';
    RAISE NOTICE '🔒 Row Level Security habilitado';
    RAISE NOTICE '👥 Admins pueden ver todos los logs';
    RAISE NOTICE '👤 Usuarios pueden ver sus propios logs';
END $$;
