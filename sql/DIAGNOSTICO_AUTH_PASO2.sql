-- =====================================================
-- DIAGNÓSTICO COMPLETO DEL SISTEMA DE AUTENTICACIÓN
-- PASO 2: Validar sistema de autenticación
-- =====================================================

-- 1. Verificar usuarios en system_users (si existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_users') THEN
    RAISE NOTICE '📋 USUARIOS EN system_users:';
    PERFORM * FROM system_users;
  ELSE
    RAISE NOTICE '❌ Tabla system_users no existe';
  END IF;
END $$;

-- 2. Verificar usuarios en auth.users y user_profiles
SELECT
  '🔍 USUARIOS EN SISTEMA:' as info,
  COUNT(*) as total
FROM auth.users
UNION ALL
SELECT
  '👤 PERFILES EN user_profiles:',
  COUNT(*)
FROM public.user_profiles
UNION ALL
SELECT
  '✅ USUARIOS ACTIVOS:',
  COUNT(*)
FROM public.user_profiles
WHERE is_active = true;

-- 3. Detalle de todos los usuarios
SELECT
  au.id,
  au.email,
  au.email_confirmed_at,
  COALESCE(up.full_name, 'Sin perfil') as full_name,
  COALESCE(up.role, 'Sin rol') as role,
  COALESCE(up.is_active::text, 'Sin estado') as is_active,
  au.created_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC;

-- 4. Verificar roles disponibles
SELECT
  role,
  COUNT(*) as cantidad,
  COUNT(*) FILTER (WHERE is_active = true) as activos
FROM public.user_profiles
GROUP BY role
ORDER BY role;

-- 5. Verificar políticas RLS activas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname IN ('public', 'auth')
ORDER BY tablename, policyname;

-- 6. Verificar funciones de autenticación
SELECT
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc
WHERE proname IN ('is_admin', 'is_advisor', 'get_current_user_profile', 'update_last_login')
ORDER BY proname;

-- 7. Verificar si hay usuarios con problemas de acceso
SELECT
  '🚨 POSIBLES PROBLEMAS:' as alerta,
  CASE
    WHEN COUNT(*) = 0 THEN 'No hay usuarios en auth.users'
    WHEN COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) > 0 THEN 'Hay usuarios sin email confirmado'
    WHEN COUNT(*) FILTER (WHERE up.id IS NULL) > 0 THEN 'Hay usuarios sin perfil en user_profiles'
    ELSE 'Sistema parece estar bien configurado'
  END as diagnostico
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id;

-- 8. Verificar configuración de RLS
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'properties', 'advisors', 'clients', 'service_inquiries', 'property_appointments')
ORDER BY tablename;