-- =====================================================
-- VERIFICACIÓN FINAL DEL SISTEMA DE USUARIOS
-- Después de ejecutar las correcciones
-- =====================================================

-- 1. Verificar que todos los usuarios tienen perfiles
SELECT
  '🔍 VERIFICACIÓN COMPLETA:' as diagnostico,
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.user_profiles)
    THEN '✅ Todos los usuarios tienen perfiles'
    ELSE '❌ Faltan perfiles para algunos usuarios'
  END as perfiles,
  CASE
    WHEN (SELECT COUNT(*) FROM public.user_profiles WHERE role IS NOT NULL AND is_active = true) = (SELECT COUNT(*) FROM public.user_profiles)
    THEN '✅ Todos los perfiles están completos y activos'
    ELSE '❌ Algunos perfiles están incompletos o inactivos'
  END as completitud;

-- 2. Lista completa de usuarios que pueden hacer login
SELECT
  au.email,
  COALESCE(up.role, 'SIN ROL') as role,
  CASE WHEN up.is_active THEN '✅ ACTIVO' ELSE '❌ INACTIVO' END as estado,
  CASE
    WHEN up.role = 'admin' THEN '👑 Puede gestionar usuarios'
    WHEN up.role = 'advisor' THEN '🏠 Puede gestionar propiedades'
    WHEN up.role = 'user' THEN '👤 Acceso básico'
    ELSE '❓ Rol desconocido'
  END as permisos
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
ORDER BY up.role, au.email;

-- 3. Verificar roles disponibles
SELECT
  '📊 DISTRIBUCIÓN DE ROLES:' as info,
  role,
  COUNT(*) as cantidad,
  STRING_AGG(email, ', ') as usuarios
FROM public.user_profiles
WHERE is_active = true
GROUP BY role
ORDER BY role;

-- 4. Verificar que las funciones de autenticación funcionan
SELECT
  '🔧 FUNCIONES DE AUTENTICACIÓN:' as funciones,
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN '✅' ELSE '❌' END || ' is_admin() existe' as admin_check,
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_advisor') THEN '✅' ELSE '❌' END || ' is_advisor() existe' as advisor_check,
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_current_user_profile') THEN '✅' ELSE '❌' END || ' get_current_user_profile() existe' as profile_check;

-- 5. Verificar políticas RLS
SELECT
  '🔐 POLÍTICAS RLS:' as seguridad,
  COUNT(*) || ' políticas activas' as total_politicas,
  COUNT(*) FILTER (WHERE permissive = false) || ' restrictivas' as restrictivas,
  COUNT(*) FILTER (WHERE permissive = true) || ' permisivas' as permisivas
FROM pg_policies
WHERE schemaname = 'public';

-- 6. Verificar tablas críticas
SELECT
  '📋 TABLAS CRÍTICAS:' as tablas,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN '✅' ELSE '❌' END || ' user_profiles' as user_profiles,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auth_logs') THEN '✅' ELSE '❌' END || ' auth_logs' as auth_logs,
  CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles') THEN '✅' ELSE '❌' END || ' RLS en user_profiles' as rls_user_profiles;

-- 7. Próximos pasos recomendados
SELECT
  '🎯 PRÓXIMOS PASOS:' as plan,
  '1. Probar login con cada usuario' as paso1,
  '2. Verificar permisos en el dashboard' as paso2,
  '3. Crear modal de gestión de usuarios' as paso3,
  '4. Implementar cambio de roles y contraseñas' as paso4;

-- 8. Resumen ejecutivo
DO $$
DECLARE
  total_users INTEGER;
  active_admins INTEGER;
  active_advisors INTEGER;
  active_clients INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM auth.users;
  SELECT COUNT(*) INTO active_admins FROM public.user_profiles WHERE role = 'admin' AND is_active = true;
  SELECT COUNT(*) INTO active_advisors FROM public.user_profiles WHERE role = 'advisor' AND is_active = true;
  SELECT COUNT(*) INTO active_clients FROM public.user_profiles WHERE role = 'user' AND is_active = true;

  RAISE NOTICE '📊 RESUMEN EJECUTIVO:';
  RAISE NOTICE '👥 Total de usuarios: %', total_users;
  RAISE NOTICE '👑 Administradores activos: %', active_admins;
  RAISE NOTICE '🏠 Asesores activos: %', active_advisors;
  RAISE NOTICE '👤 Clientes activos: %', active_clients;

  IF active_admins > 0 THEN
    RAISE NOTICE '✅ Sistema listo para gestión de usuarios';
  ELSE
    RAISE NOTICE '⚠️ Advertencia: No hay administradores activos';
  END IF;
END $$;