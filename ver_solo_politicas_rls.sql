-- ===================================================================
-- VER SOLO POLÍTICAS RLS DE LA TABLA CLIENTS
-- ===================================================================

SELECT 
  policyname as politica,
  cmd as comando,
  qual as condicion_using,
  with_check as condicion_with_check
FROM pg_policies
WHERE tablename = 'clients'
ORDER BY cmd, policyname;
