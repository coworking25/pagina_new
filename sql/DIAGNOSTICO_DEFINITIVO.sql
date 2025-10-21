-- =====================================================
-- PRUEBA DEFINITIVA: Simular login y verificar is_admin()
-- =====================================================

-- PASO 1: Verificar estado actual del usuario
SELECT
  '🔍 ESTADO ACTUAL DEL USUARIO:' as analisis,
  CASE
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'jaideradmin@gmail.com')
    THEN '✅ Existe en auth.users'
    ELSE '❌ NO existe en auth.users'
  END as auth_users,
  CASE
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'jaideradmin@gmail.com')
    THEN '✅ Existe en user_profiles'
    ELSE '❌ NO existe en user_profiles'
  END as user_profiles;

-- PASO 2: Detalles del usuario
SELECT
  '👤 DETALLES EN auth.users:' as tabla,
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'jaideradmin@gmail.com';

SELECT
  '👤 DETALLES EN user_profiles:' as tabla,
  id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  last_login_at
FROM public.user_profiles
WHERE email = 'jaideradmin@gmail.com';

-- PASO 3: Simular lo que hace el frontend
-- El frontend llama a supabase.rpc('is_admin')
-- Esta función usa auth.uid() para obtener el ID del usuario actual
-- Pero en el SQL Editor no hay sesión activa, así que auth.uid() retorna NULL

-- Para probar correctamente, necesitamos simular una sesión
-- Esto es lo que realmente sucede cuando el usuario está logueado:

-- Simulación: Si el usuario jaideradmin@gmail.com estuviera logueado,
-- auth.uid() retornaría su ID. Vamos a probar la lógica manualmente:

SELECT
  '🎯 SIMULACIÓN DE is_admin() PARA USUARIO LOGUEADO:' as test,
  up.email,
  up.role,
  up.is_active,
  CASE
    WHEN up.role = 'admin' AND up.is_active = true
    THEN '✅ is_admin() DEBERÍA RETORNAR TRUE'
    ELSE '❌ is_admin() RETORNARÍA FALSE'
  END as resultado_esperado,
  CASE
    WHEN up.id IS NOT NULL AND up.role = 'admin' AND up.is_active = true
    THEN '✅ USUARIO PUEDE ACCEDER A ADMIN'
    ELSE '❌ USUARIO NO PUEDE ACCEDER A ADMIN'
  END as acceso_admin
FROM public.user_profiles up
WHERE up.email = 'jaideradmin@gmail.com';

-- PASO 4: Verificar función is_admin() existe y es correcta
SELECT
  '🔧 VERIFICACIÓN DE FUNCIÓN is_admin():',
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin')
    THEN '✅ Función existe'
    ELSE '❌ Función NO existe'
  END as funcion_existe,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_language l ON p.prolang = l.oid
      WHERE p.proname = 'is_admin' AND l.lanname = 'plpgsql'
    )
    THEN '✅ Función está en PL/pgSQL'
    ELSE '❌ Función no está en PL/pgSQL'
  END as lenguaje_correcto;

-- PASO 5: Verificar permisos de ejecución
SELECT
  '🔐 PERMISOS DE EJECUCIÓN:' as seguridad,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.role_routine_grants
      WHERE routine_name = 'is_admin'
      AND grantee = 'authenticated'
    )
    THEN '✅ Usuarios autenticados pueden ejecutar'
    ELSE '❌ Usuarios autenticados NO pueden ejecutar'
  END as permisos_autenticados;

-- PASO 6: Diagnóstico final
SELECT
  '🎯 DIAGNÓSTICO FINAL:' as resultado,
  CASE
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'jaideradmin@gmail.com')
    AND EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'jaideradmin@gmail.com' AND role = 'admin' AND is_active = true)
    AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin')
    THEN '✅ TODO ESTÁ CONFIGURADO CORRECTAMENTE - EL PROBLEMA ESTÁ EN EL FRONTEND'
    ELSE '❌ HAY PROBLEMAS EN LA CONFIGURACIÓN'
  END as estado_general,
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jaideradmin@gmail.com')
    THEN 'Usuario no existe en Supabase Auth'
    WHEN NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'jaideradmin@gmail.com')
    THEN 'Usuario no tiene perfil en user_profiles'
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'jaideradmin@gmail.com' AND role != 'admin')
    THEN 'Usuario no tiene rol admin'
    WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'jaideradmin@gmail.com' AND is_active = false)
    THEN 'Usuario está inactivo'
    WHEN NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin')
    THEN 'Función is_admin() no existe'
    ELSE 'Problema en el frontend: sesión no activa o error de conexión'
  END as problema_identificado;