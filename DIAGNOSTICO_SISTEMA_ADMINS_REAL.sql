-- ===================================================================
-- DIAGNÓSTICO COMPLETO: SISTEMA DE AUTENTICACIÓN DE ADMINS
-- ===================================================================
-- Fecha: 20 de Octubre, 2025
-- Objetivo: Identificar cómo funciona la autenticación de administradores

-- ===================================================================
-- PASO 1: VER FUNCIONES RPC QUE VALIDAN ADMIN
-- ===================================================================

SELECT '🔍 PASO 1: Funciones RPC de Autenticación' as seccion;

-- Ver funciones is_admin e is_advisor
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname IN ('is_admin', 'is_advisor')
ORDER BY proname;

-- ===================================================================
-- PASO 2: VER TU USUARIO ACTUAL DE SUPABASE AUTH
-- ===================================================================

SELECT '👤 PASO 2: Tu Usuario Actual' as seccion;

SELECT 
  'Tu ID de sesión:' as info,
  auth.uid() as user_id,
  auth.jwt() ->> 'email' as email,
  auth.jwt() ->> 'role' as auth_role;

-- ===================================================================
-- PASO 3: VER USUARIOS EN auth.users (Supabase Auth)
-- ===================================================================

SELECT '📋 PASO 3: Usuarios en Supabase Auth' as seccion;

-- Ver todos los usuarios en auth.users
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at,
  last_sign_in_at,
  confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- ===================================================================
-- PASO 4: BUSCAR TABLA DE PERFILES/USUARIOS DEL SISTEMA
-- ===================================================================

SELECT '🔎 PASO 4: Tablas que podrían contener admins' as seccion;

-- Listar todas las tablas que podrían contener usuarios/admins
SELECT 
  table_name,
  CASE 
    WHEN table_name LIKE '%user%' OR table_name LIKE '%admin%' OR table_name LIKE '%profile%'
    THEN '✅ POSIBLE TABLA DE ADMINS'
    ELSE '❓ Otra tabla'
  END as relevancia
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (
    table_name LIKE '%user%' 
    OR table_name LIKE '%admin%' 
    OR table_name LIKE '%profile%'
    OR table_name LIKE '%auth%'
  )
ORDER BY table_name;

-- ===================================================================
-- PASO 5: VER CONTENIDO DE TABLAS SOSPECHOSAS
-- ===================================================================

SELECT '📊 PASO 5: Contenido de Tablas' as seccion;

-- Ver estructura de user_profiles
SELECT 
  '🔍 Estructura de user_profiles:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Ver contenido de user_profiles
SELECT 
  '📋 Contenido de user_profiles:' as info,
  *
FROM user_profiles
ORDER BY created_at DESC;

-- Ver estructura de active_users
SELECT 
  '🔍 Estructura de active_users:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'active_users'
ORDER BY ordinal_position;

-- Ver contenido de active_users
SELECT 
  '📋 Contenido de active_users:' as info,
  *
FROM active_users
ORDER BY created_at DESC
LIMIT 20;

-- ===================================================================
-- PASO 6: VER ADVISORS (para descartar confusión)
-- ===================================================================

SELECT '👥 PASO 6: Advisors (asesores de propiedades)' as seccion;

SELECT 
  'Estos son ASESORES, NO admins del sistema:' as nota,
  *
FROM advisors
ORDER BY created_at DESC;

-- ===================================================================
-- PASO 7: BUSCAR EL EMAIL DE DIEGO ADMIN
-- ===================================================================

SELECT '🔍 PASO 7: Buscar diegoadmin@gmail.com' as seccion;

-- Buscar en auth.users
SELECT 
  'Encontrado en auth.users:' as ubicacion,
  id,
  email,
  raw_user_meta_data,
  created_at
FROM auth.users
WHERE email = 'diegoadmin@gmail.com';

-- Buscar en advisors (por si acaso)
SELECT 
  'Encontrado en advisors:' as ubicacion,
  *
FROM advisors
WHERE email = 'diegoadmin@gmail.com';

-- Buscar en user_profiles
SELECT 
  'Encontrado en user_profiles:' as ubicacion,
  *
FROM user_profiles
WHERE email = 'diegoadmin@gmail.com';

-- Buscar en active_users
SELECT 
  'Encontrado en active_users:' as ubicacion,
  *
FROM active_users
WHERE email = 'diegoadmin@gmail.com';

-- ===================================================================
-- PASO 8: VERIFICAR POLÍTICAS RLS
-- ===================================================================

SELECT '🔒 PASO 8: Políticas RLS Activas' as seccion;

SELECT 
  tablename,
  policyname,
  cmd,
  qual as "USING_clause"
FROM pg_policies
WHERE tablename IN ('user_profiles', 'active_users', 'profiles', 'clients', 'properties')
ORDER BY tablename, cmd;

-- ===================================================================
-- RESULTADO ESPERADO
-- ===================================================================

/*
Con este script sabremos:

1. ✅ Cómo funcionan las funciones is_admin() e is_advisor()
2. ✅ Tu usuario actual (auth.uid y email)
3. ✅ Todos los usuarios en Supabase Auth
4. ✅ Qué tabla contiene los admins del sistema
5. ✅ Si diegoadmin@gmail.com existe y dónde
6. ✅ Si admincoworkin@inmobiliaria.com existe
7. ✅ Qué políticas RLS están activas

PRÓXIMO PASO:
Una vez ejecutes este script, sabremos exactamente:
- Qué tabla usar para agregar admins
- Cómo está estructurada
- Dónde están los emails de admin actuales
- Cómo dar acceso a nuevos admins

EJECUTA ESTE SCRIPT Y COMPARTE LOS RESULTADOS.
*/
