-- =====================================================
-- ANÁLISIS Y LIMPIEZA DE TABLA system_users
-- =====================================================
-- Esta tabla es OBSOLETA y ya NO se usa en el sistema actual
-- El sistema ahora usa: auth.users + user_profiles

-- =====================================================
-- PASO 1: VERIFICAR SI LA TABLA EXISTE
-- =====================================================

SELECT 
  'system_users' as tabla,
  COUNT(*) as total_registros
FROM system_users;

-- =====================================================
-- PASO 2: VER QUÉ HAY EN system_users (si existe)
-- =====================================================

SELECT 
  id,
  email,
  full_name,
  role,
  status,
  created_at,
  last_login_at
FROM system_users
ORDER BY created_at DESC;

-- =====================================================
-- PASO 3: VERIFICAR USUARIOS ACTUALES CORRECTOS
-- =====================================================

SELECT 
  au.id,
  au.email as "Email (Auth)",
  up.full_name as "Nombre Completo",
  up.role as "Rol",
  up.is_active as "Activo",
  au.email_confirmed_at as "Email Confirmado",
  up.last_login_at as "Último Login"
FROM auth.users au
JOIN user_profiles up ON up.id = au.id
WHERE up.role IN ('admin', 'advisor')
ORDER BY up.created_at DESC;

-- =====================================================
-- PASO 4: VERIFICAR SI HAY REFERENCIAS A system_users
-- =====================================================

-- Buscar tablas que tengan foreign keys a system_users
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'system_users';

-- =====================================================
-- PASO 5: ELIMINAR LA TABLA system_users (SOLO SI ESTÁ SEGURO)
-- =====================================================

-- ⚠️ ADVERTENCIA: Esto eliminará la tabla permanentemente
-- ⚠️ Solo ejecuta esto si estás SEGURO que no la necesitas

-- Descomenta estas líneas para ejecutar:

-- DROP TABLE IF EXISTS user_sessions CASCADE;
-- DROP TABLE IF EXISTS auth_logs CASCADE; 
-- DROP TABLE IF EXISTS system_users CASCADE;

-- NOTA: El CASCADE eliminará también las tablas relacionadas
-- que tienen foreign keys a system_users

-- =====================================================
-- PASO 6: VERIFICAR QUE SOLO QUEDEN LAS TABLAS CORRECTAS
-- =====================================================

SELECT 
  table_name,
  CASE 
    WHEN table_name = 'user_profiles' THEN '✅ USAR ESTA'
    WHEN table_name = 'system_users' THEN '❌ OBSOLETA'
    ELSE '❓ Revisar'
  END as estado
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('system_users', 'user_profiles', 'user_sessions')
ORDER BY table_name;

-- =====================================================
-- RESUMEN
-- =====================================================

/*
SISTEMA ACTUAL (CORRECTO):
- auth.users          → Autenticación de Supabase
- user_profiles       → Datos adicionales de usuarios

SISTEMA OBSOLETO (YA NO SE USA):
- system_users        → Tabla antigua de usuarios
- user_sessions       → Sesiones antiguas
- auth_logs           → Logs antiguos (si existe)

RECOMENDACIÓN:
1. Verifica que todos tus usuarios estén en user_profiles
2. Verifica que no haya referencias a system_users
3. Si todo está bien, elimina system_users
4. Esto limpiará la base de datos y evitará confusiones
*/
