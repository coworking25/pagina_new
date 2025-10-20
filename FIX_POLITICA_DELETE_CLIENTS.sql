-- ===================================================================
-- CORREGIR POLÍTICA RLS DE DELETE EN TABLA CLIENTS
-- ===================================================================
-- Problema: La política "Admins have full access to clients" verifica
-- la tabla "advisors" en lugar de usar is_admin()
-- 
-- Solución: Reemplazar la política para que use is_admin() correctamente
-- ===================================================================

-- 1. ELIMINAR la política incorrecta
DROP POLICY IF EXISTS "Admins have full access to clients" ON clients;

-- 2. CREAR la política correcta que usa is_admin()
CREATE POLICY "Admins have full access to clients"
ON clients
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ===================================================================
-- VERIFICAR QUE LA POLÍTICA SE APLICÓ CORRECTAMENTE
-- ===================================================================

SELECT 
  '✅ POLÍTICA ACTUALIZADA' as resultado,
  policyname as politica,
  cmd as comando,
  qual as condicion_using,
  with_check as condicion_with_check
FROM pg_policies
WHERE tablename = 'clients' 
  AND policyname = 'Admins have full access to clients';
