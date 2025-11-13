
-- =====================================================
-- CERRAR CONEXIONES ACTIVAS ANTES DE ELIMINAR
-- =====================================================
-- 1. Identifica procesos activos que usan las tablas obsoletas:
--
-- SELECT pid, usename, application_name, client_addr, state, query
-- FROM pg_stat_activity
-- WHERE datname = current_database()
--   AND state = 'active'
--   AND (
--     query ILIKE '%system_users%' OR
--     query ILIKE '%user_sessions%' OR
--     query ILIKE '%auth_logs%'
--   );
--
-- 2. Termina cada proceso usando:
-- (Reemplaza 12345 por el PID real que te muestra la consulta anterior)
--
-- SELECT pg_terminate_backend(12345);
--
-- Repite para cada PID que esté usando las tablas obsoletas.
--
-- Cuando no haya procesos activos, ejecuta los DROP TABLE uno por uno.


-- Ver cuántos registros hay en cada tabla obsoleta
SELECT 'system_users' as tabla, COUNT(*) as registros FROM system_users
UNION ALL
SELECT 'user_sessions' as tabla, COUNT(*) as registros FROM user_sessions;

-- Ver usuarios actuales CORRECTOS
SELECT 
  au.email,
  up.full_name,
  up.role,
  up.is_active
FROM auth.users au
JOIN user_profiles up ON up.id = au.id
WHERE up.role IN ('admin', 'advisor');

-- =====================================================
-- ELIMINAR TABLAS OBSOLETAS
-- =====================================================

-- ⚠️ EJECUTA ESTO SOLO DESPUÉS DE VERIFICAR QUE TODO ESTÁ BIEN

-- Paso 1: Eliminar user_sessions (maneja sesiones antiguas)
DROP TABLE IF EXISTS user_sessions CASCADE;

-- Paso 2: Eliminar auth_logs si existe
DROP TABLE IF EXISTS auth_logs CASCADE;

-- Paso 3: Eliminar system_users (tabla antigua de usuarios)
DROP TABLE IF EXISTS system_users CASCADE;

-- =====================================================
-- VERIFICACIÓN POST-ELIMINACIÓN
-- =====================================================

-- Confirmar que solo queda user_profiles
SELECT 
  table_name,
  '✅ Correcto - Esta es la tabla que usamos' as estado
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'user_profiles';

-- Verificar que las obsoletas ya no existen
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'system_users')
    THEN '✅ system_users eliminada correctamente'
    ELSE '❌ system_users todavía existe'
  END as resultado_system_users,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_sessions')
    THEN '✅ user_sessions eliminada correctamente'
    ELSE '❌ user_sessions todavía existe'
  END as resultado_user_sessions;

-- =====================================================
-- RESUMEN
-- =====================================================

/*
✅ TABLAS ELIMINADAS (obsoletas):
- system_users   → Ya no se usa, reemplazada por auth.users + user_profiles
- user_sessions  → Ya no se usa, Supabase Auth maneja las sesiones
- auth_logs      → Ya no se usa

✅ TABLAS QUE QUEDAN (correctas):
- auth.users     → Autenticación de Supabase (tabla del sistema)
- user_profiles  → Datos adicionales de usuarios (nuestra tabla)

NOTA: 
- El sistema seguirá funcionando perfectamente
- AdminLayout ahora usa useAuth() correctamente
- Ya no habrá confusión con datos antiguos
*/
