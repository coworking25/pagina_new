-- =====================================================
-- ARREGLAR RLS PARA PERMITIR ACCESO ANÓNIMO A CONTRACTS Y PAYMENTS
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Este script permite que el dashboard admin acceda a contracts y payments
-- usando la clave anónima (ANON_KEY)

-- OPCIÓN 1: Agregar políticas para acceso anónimo (MÁS SEGURO)
-- =====================================================

-- Política para que CUALQUIER usuario autenticado o anónimo pueda ver contracts
DROP POLICY IF EXISTS "Allow anon access to contracts" ON contracts;
CREATE POLICY "Allow anon access to contracts" ON contracts
  FOR SELECT
  USING (true);

-- Política para que CUALQUIER usuario pueda insertar/actualizar contracts
DROP POLICY IF EXISTS "Allow anon write to contracts" ON contracts;
CREATE POLICY "Allow anon write to contracts" ON contracts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Política para que CUALQUIER usuario autenticado o anónimo pueda ver payments
DROP POLICY IF EXISTS "Allow anon access to payments" ON payments;
CREATE POLICY "Allow anon access to payments" ON payments
  FOR SELECT
  USING (true);

-- Política para que CUALQUIER usuario pueda insertar/actualizar payments
DROP POLICY IF EXISTS "Allow anon write to payments" ON payments;
CREATE POLICY "Allow anon write to payments" ON payments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- OPCIÓN 2 (ALTERNATIVA): Deshabilitar RLS completamente (MENOS SEGURO)
-- =====================================================
-- Solo descomentar si la opción 1 no funciona

-- ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICAR POLÍTICAS ACTUALES
-- =====================================================

-- Ver todas las políticas en contracts
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('contracts', 'payments')
ORDER BY tablename, policyname;
