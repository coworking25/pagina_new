-- =====================================================
-- DESHABILITAR RLS PARA TODAS LAS TABLAS DE PAGOS
-- Solo para desarrollo/testing
-- =====================================================

-- Deshabilitar RLS en payment_schedules
ALTER TABLE payment_schedules DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en payment_receipts
ALTER TABLE payment_receipts DISABLE ROW LEVEL SECURITY;

-- Verificar que ambas tablas tengan RLS deshabilitado
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('payment_schedules', 'payment_receipts')
  AND schemaname = 'public';

-- Resultado esperado:
-- payment_schedules | false
-- payment_receipts  | false
