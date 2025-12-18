-- =====================================================
-- VERIFICAR Y ARREGLAR POLÍTICAS RLS
-- Para payment_schedules
-- =====================================================

-- 1. Ver políticas actuales de payment_schedules
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'payment_schedules';

-- 2. Verificar si RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'payment_schedules';

-- 3. SOLUCIÓN TEMPORAL: Deshabilitar RLS temporalmente para pruebas
-- ⚠️ SOLO PARA DESARROLLO - NO usar en producción
ALTER TABLE payment_schedules DISABLE ROW LEVEL SECURITY;

-- 4. Verificar que ahora se pueden ver los pagos
SELECT 
  id,
  client_id,
  payment_concept,
  amount,
  due_date,
  status
FROM payment_schedules
WHERE client_id = '11111111-1111-1111-1111-111111111111'
ORDER BY due_date;

-- 5. Si funciona, crear políticas RLS correctas
-- Habilitar RLS de nuevo
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Admins full access to payment_schedules" ON payment_schedules;
DROP POLICY IF EXISTS "Advisors can view payment_schedules" ON payment_schedules;
DROP POLICY IF EXISTS "Advisors can manage payment_schedules" ON payment_schedules;
DROP POLICY IF EXISTS "Clients can view their payment_schedules" ON payment_schedules;

-- Crear política para service_role (bypass RLS)
CREATE POLICY "Service role bypass"
ON payment_schedules
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Crear política para authenticated users (permitir todo temporalmente)
CREATE POLICY "Allow all for authenticated users"
ON payment_schedules
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Verificar políticas creadas
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'payment_schedules';
