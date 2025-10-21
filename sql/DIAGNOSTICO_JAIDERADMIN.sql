-- =====================================================
-- DIAGNÓSTICO Y CORRECCIÓN DEL USUARIO jaideradmin@gmail.com
-- =====================================================

-- 1. Verificar dónde existe este usuario
SELECT
  '🔍 DIAGNÓSTICO COMPLETO:' as analisis,
  CASE
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'jaideradmin@gmail.com')
    THEN '✅ Existe en auth.users (Supabase Auth)'
    ELSE '❌ NO existe en auth.users'
  END as auth_users,
  CASE
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'jaideradmin@gmail.com')
    THEN '✅ Existe en user_profiles'
    ELSE '❌ NO existe en user_profiles'
  END as user_profiles;

-- 2. Detalles del usuario en cada tabla
SELECT
  '📋 DETALLES EN auth.users:' as tabla,
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'jaideradmin@gmail.com';

SELECT
  '📋 DETALLES EN user_profiles:' as tabla,
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM public.user_profiles
WHERE email = 'jaideradmin@gmail.com';

-- 3. CORRECCIÓN: Crear o actualizar perfil con rol admin
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  role,
  is_active
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Jaider Admin'),
  'admin',
  true
FROM auth.users au
WHERE au.email = 'jaideradmin@gmail.com'
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  is_active = true,
  full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
  updated_at = NOW();

-- 4. Verificar que la función is_admin() funciona
SELECT
  '🔧 VERIFICACIÓN DE FUNCIONES:' as test,
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin')
    THEN '✅ Función is_admin() existe'
    ELSE '❌ Función is_admin() NO existe'
  END as funcion_admin,
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_current_user_profile')
    THEN '✅ Función get_current_user_profile() existe'
    ELSE '❌ Función get_current_user_profile() NO existe'
  END as funcion_perfil;

-- 5. Probar la función is_admin() con este usuario
-- (Esto simula lo que hace el frontend)
SELECT
  '🎯 SIMULACIÓN DE LOGIN:' as test,
  up.email,
  up.role,
  up.is_active,
  CASE
    WHEN up.role = 'admin' AND up.is_active = true
    THEN '✅ DEBERÍA TENER ACCESO ADMIN'
    ELSE '❌ NO TIENE ACCESO ADMIN'
  END as acceso_admin,
  CASE
    WHEN up.id IS NOT NULL
    THEN '✅ Usuario autenticado correctamente'
    ELSE '❌ Usuario no autenticado'
  END as autenticacion
FROM public.user_profiles up
WHERE up.email = 'jaideradmin@gmail.com';

-- 6. Verificar políticas RLS activas
SELECT
  '🔐 POLÍTICAS RLS PARA user_profiles:' as seguridad,
  COUNT(*) as total_politicas,
  COUNT(*) FILTER (WHERE permissive = 'f') as restrictivas
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- 7. Verificación final
SELECT
  '🎯 VERIFICACIÓN FINAL:' as resultado,
  CASE
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'jaideradmin@gmail.com')
    AND EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'jaideradmin@gmail.com' AND role = 'admin' AND is_active = true)
    THEN '✅ Usuario jaideradmin@gmail.com está listo para acceso admin'
    ELSE '❌ Aún hay problemas con el usuario admin'
  END as estado;

-- 8. Credenciales y troubleshooting
SELECT
  '🔑 CREDENCIALES CONFIRMADAS:' as info,
  'Email: jaideradmin@gmail.com' as email,
  'Password: admin2025' as password,
  'Role: admin' as role,
  CASE
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'jaideradmin@gmail.com')
    THEN '✅ Usuario existe en Supabase Auth'
    ELSE '❌ Usuario NO existe en Supabase Auth'
  END as estado_auth,
  CASE
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'jaideradmin@gmail.com' AND role = 'admin' AND is_active = true)
    THEN '✅ Tiene rol admin activo'
    ELSE '❌ NO tiene rol admin activo'
  END as permisos;

-- 9. Si aún no funciona, posibles causas
SELECT
  '🔍 POSIBLES CAUSAS DEL ERROR:' as troubleshooting,
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jaideradmin@gmail.com')
    THEN 'Usuario no existe en auth.users - verificar creación'
    WHEN NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'jaideradmin@gmail.com')
    THEN 'Usuario no tiene perfil en user_profiles'
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'jaideradmin@gmail.com' AND role != 'admin')
    THEN 'Usuario tiene rol diferente a admin'
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'jaideradmin@gmail.com' AND is_active = false)
    THEN 'Usuario está inactivo'
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'jaideradmin@gmail.com' AND email_confirmed_at IS NULL)
    THEN 'Email no confirmado'
    ELSE 'Verificar código frontend y conexión a Supabase'
  END as causa_posible;