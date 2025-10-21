-- =====================================================
-- VERIFICACIÓN ESPECÍFICA DEL USUARIO diegoadmin@gmail.com
-- =====================================================

-- 1. Verificar si existe en auth.users
SELECT
  '🔍 BÚSQUEDA EN auth.users:' as busqueda,
  CASE
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'diegoadmin@gmail.com')
    THEN '✅ Usuario encontrado en auth.users'
    ELSE '❌ Usuario NO encontrado en auth.users'
  END as resultado;

-- 2. Detalles del usuario en auth.users
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data,
  last_sign_in_at
FROM auth.users
WHERE email = 'diegoadmin@gmail.com';

-- 3. Verificar si existe en user_profiles
SELECT
  '👤 BÚSQUEDA EN user_profiles:' as busqueda,
  CASE
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com')
    THEN '✅ Perfil encontrado en user_profiles'
    ELSE '❌ Perfil NO encontrado en user_profiles'
  END as resultado;

-- 4. Detalles del perfil
SELECT
  id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
FROM public.user_profiles
WHERE email = 'diegoadmin@gmail.com';

-- 5. Verificar si existe en system_users (sistema antiguo)
SELECT
  '⚙️ BÚSQUEDA EN system_users:' as busqueda,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_users')
    AND EXISTS (SELECT 1 FROM system_users WHERE email = 'diegoadmin@gmail.com')
    THEN '✅ Usuario encontrado en system_users'
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_users')
    AND NOT EXISTS (SELECT 1 FROM system_users WHERE email = 'diegoadmin@gmail.com')
    THEN '❌ Usuario NO encontrado en system_users'
    ELSE '⚠️ Tabla system_users no existe'
  END as resultado;

-- 6. Si existe en system_users, mostrar detalles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_users') THEN
    IF EXISTS (SELECT 1 FROM system_users WHERE email = 'diegoadmin@gmail.com') THEN
      RAISE NOTICE '📋 DETALLES EN system_users:';
      PERFORM id, email, password_hash, full_name, role, status
      FROM system_users
      WHERE email = 'diegoadmin@gmail.com';
    END IF;
  END IF;
END $$;

-- 7. Diagnóstico de posibles problemas
SELECT
  '🔧 DIAGNÓSTICO:' as diagnostico,
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'diegoadmin@gmail.com')
    THEN '❌ El usuario no existe en auth.users - necesita ser creado'
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'diegoadmin@gmail.com')
    AND NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com')
    THEN '⚠️ Usuario existe en auth.users pero no tiene perfil en user_profiles'
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com')
    AND (SELECT role FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com') != 'admin'
    THEN '⚠️ Usuario tiene perfil pero no tiene rol de admin'
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com')
    AND (SELECT is_active FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com') = false
    THEN '🚫 Usuario existe pero está inactivo'
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'diegoadmin@gmail.com')
    AND (SELECT email_confirmed_at FROM auth.users WHERE email = 'diegoadmin@gmail.com') IS NULL
    THEN '📧 Usuario existe pero no ha confirmado su email'
    ELSE '✅ Usuario parece estar correctamente configurado'
  END as estado;

-- 8. Recomendaciones
SELECT
  '💡 RECOMENDACIONES:' as consejos,
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'diegoadmin@gmail.com')
    THEN 'Crear usuario en Supabase Auth Dashboard o usar SQL para insertarlo'
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'diegoadmin@gmail.com')
    AND NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com')
    THEN 'Crear perfil en user_profiles con rol admin'
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com')
    AND (SELECT role FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com') != 'admin'
    THEN 'Cambiar rol a admin en user_profiles'
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com')
    AND (SELECT is_active FROM public.user_profiles WHERE email = 'diegoadmin@gmail.com') = false
    THEN 'Activar usuario en user_profiles'
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'diegoadmin@gmail.com')
    AND (SELECT email_confirmed_at FROM auth.users WHERE email = 'diegoadmin@gmail.com') IS NULL
    THEN 'Confirmar email del usuario'
    ELSE 'Verificar credenciales de login y configuración del frontend'
  END as solucion;