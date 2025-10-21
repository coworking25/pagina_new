-- =====================================================
-- PRUEBA DE LA FUNCIÓN is_admin() PARA jaideradmin@gmail.com
-- =====================================================

-- 1. Verificar que la función existe
SELECT
  '🔧 VERIFICACIÓN DE FUNCIÓN:' as test,
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin')
    THEN '✅ Función is_admin() existe'
    ELSE '❌ Función is_admin() NO existe'
  END as funcion_existe;

-- 2. Probar la función directamente (simulando lo que hace el frontend)
-- Esto requiere que el usuario esté autenticado en la sesión actual
-- Si no funciona, puede ser porque no hay sesión activa

-- 3. Verificar el perfil del usuario
SELECT
  '👤 PERFIL DEL USUARIO:' as info,
  up.id,
  up.email,
  up.role,
  up.is_active,
  CASE
    WHEN up.role = 'admin' AND up.is_active = true
    THEN '✅ DEBERÍA SER ADMIN'
    ELSE '❌ NO ES ADMIN'
  END as estado_admin
FROM public.user_profiles up
WHERE up.email = 'jaideradmin@gmail.com';

-- 4. Verificar si hay algún problema con RLS
SELECT
  '🔐 POLÍTICAS RLS ACTIVAS:' as seguridad,
  COUNT(*) as total_politicas,
  COUNT(*) FILTER (WHERE permissive = 'f') as restrictivas
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- 5. Verificar configuración de Supabase (variables de entorno)
-- Esto no se puede verificar desde SQL, pero podemos confirmar que la conexión funciona

-- 6. Si la función is_admin() no funciona, posible causa:
SELECT
  '🔍 POSIBLES CAUSAS DEL ERROR:' as troubleshooting,
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin')
    THEN 'Función is_admin() no existe en la base de datos'
    WHEN NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'jaideradmin@gmail.com')
    THEN 'Usuario no tiene perfil en user_profiles'
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'jaideradmin@gmail.com' AND role != 'admin')
    THEN 'Usuario tiene rol diferente a admin'
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'jaideradmin@gmail.com' AND is_active = false)
    THEN 'Usuario está inactivo'
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'jaideradmin@gmail.com' AND email_confirmed_at IS NULL)
    THEN 'Email no confirmado en Supabase Auth'
    ELSE 'Verificar configuración del frontend y conexión a Supabase'
  END as causa_posible;

-- 7. Verificar que podemos acceder a las tablas necesarias
SELECT
  '📊 ACCESO A TABLAS:' as test,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles')
    THEN '✅ Tabla user_profiles existe'
    ELSE '❌ Tabla user_profiles NO existe'
  END as tabla_profiles,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
    THEN '✅ Tabla auth.users existe'
    ELSE '❌ Tabla auth.users NO existe'
  END as tabla_auth_users;