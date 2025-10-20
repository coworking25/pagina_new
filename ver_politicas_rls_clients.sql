-- ===================================================================
-- VER POLÍTICAS RLS DE LA TABLA CLIENTS
-- ===================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as comando,
  qual as using_check,
  with_check
FROM pg_policies
WHERE tablename = 'clients'
ORDER BY cmd, policyname;

-- ===================================================================
-- VERIFICAR SI DIEGO ES ADMIN AHORA
-- ===================================================================

SELECT 
  '👤 SESIÓN ACTUAL' as info,
  auth.uid()::text as id,
  auth.jwt() ->> 'email' as email,
  CASE WHEN is_admin() THEN '✅ ES ADMIN' ELSE '❌ NO ES ADMIN' END as estado_admin
UNION ALL
SELECT 
  '🔍 DIEGO EN user_profiles',
  id::text,
  email,
  'Role: ' || role || ' | Activo: ' || CASE WHEN is_active THEN '✅' ELSE '❌' END
FROM user_profiles
WHERE email = 'diegoadmin@gmail.com';
