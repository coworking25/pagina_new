-- =====================================================
-- SCRIPT: PRUEBA DE FUNCIÓN register_tenant_payment
-- Fecha: 2026-01-14
-- Propósito: Probar que la función funciona correctamente
-- =====================================================

-- PASO 1: Seleccionar un contrato de prueba
-- Buscar un contrato activo con todos los datos necesarios
SELECT 
    c.id,
    c.contract_number,
    c.client_id,
    c.landlord_id,
    c.monthly_rent,
    c.administration_fee,
    c.admin_included_in_rent,
    c.admin_paid_by,
    c.admin_payment_method,
    c.admin_landlord_percentage,
    c.agency_commission_percentage,
    c.agency_commission_fixed,
    cl.name as client_name
FROM contracts c
LEFT JOIN clients cl ON cl.id = c.client_id
WHERE c.status = 'active'
  AND c.monthly_rent IS NOT NULL
  AND c.monthly_rent > 0
LIMIT 5;

-- NOTA: Copiar el ID del contrato de arriba para usarlo abajo
-- Reemplaza 'CONTRACT_ID_AQUI' con el UUID real

-- PASO 2: Probar cálculo de desglose
-- Esto NO inserta datos, solo calcula
SELECT * FROM calculate_payment_breakdown(
    'CONTRACT_ID_AQUI'::UUID,  -- Reemplazar con ID real
    1500000.00  -- Monto bruto de ejemplo
);

-- PASO 3: Ver si la función existe y sus parámetros
SELECT 
    p.proname AS function_name,
    pg_get_function_arguments(p.oid) AS parameters,
    pg_get_function_result(p.oid) AS return_type
FROM pg_proc p
WHERE p.proname = 'register_tenant_payment';

-- PASO 4: Verificar permisos
SELECT 
    routine_name,
    routine_schema,
    specific_name,
    security_type
FROM information_schema.routines
WHERE routine_name = 'register_tenant_payment'
  AND routine_schema = 'public';

-- PASO 5: PRUEBA REAL (Descomenta solo si quieres insertar datos de prueba)
/*
SELECT register_tenant_payment(
    'CONTRACT_ID_AQUI'::UUID,  -- p_contract_id: Reemplazar con ID real
    1500000.00,                -- p_gross_amount: Monto recibido
    '2026-01-14'::DATE,        -- p_payment_date: Fecha de hoy
    'bank_transfer',           -- p_payment_method
    'TEST-TRX-001',            -- p_transaction_reference
    '2026-01-01'::DATE,        -- p_period_start
    '2026-01-31'::DATE         -- p_period_end
);
*/

-- PASO 6: Ver los pagos creados (después de ejecutar el paso 5)
/*
SELECT 
    p.id,
    p.payment_direction,
    p.payment_type,
    p.amount,
    p.gross_amount,
    p.admin_deduction,
    p.agency_commission,
    p.net_amount,
    p.status,
    p.payment_date,
    p.recipient_type,
    p.notes
FROM payments p
ORDER BY p.created_at DESC
LIMIT 10;
*/

-- PASO 7: Ver alertas creadas (después de ejecutar el paso 5)
/*
SELECT 
    a.id,
    a.alert_type,
    a.title,
    a.description,
    a.priority,
    a.status,
    a.due_date,
    a.auto_generated
FROM client_alerts a
WHERE a.auto_generated = true
ORDER BY a.created_at DESC
LIMIT 5;
*/

-- =====================================================
-- DIAGNÓSTICO COMPLETO
-- =====================================================

-- Verificar estructura de tabla payments
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- Verificar estructura de tabla contracts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'contracts'
AND column_name LIKE 'admin%' OR column_name LIKE 'agency%'
ORDER BY column_name;

-- Verificar que no hay restricciones que impidan insertar
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    CASE con.contype
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 't' THEN 'TRIGGER'
        ELSE con.contype::text
    END AS constraint_description,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_namespace nsp ON nsp.oid = con.connamespace
WHERE con.conrelid = 'payments'::regclass
  AND nsp.nspname = 'public';

-- =====================================================
-- SOLUCIÓN DE PROBLEMAS COMUNES
-- =====================================================

-- Si la función no existe, ejecutar:
-- \i ADD_PAYMENT_ADMINISTRATION_COLUMNS.sql

-- Si falta alguna columna, ejecutar:
/*
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gross_amount DECIMAL(15,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS admin_deduction DECIMAL(15,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS agency_commission DECIMAL(15,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS net_amount DECIMAL(15,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_direction VARCHAR(20) CHECK (payment_direction IN ('incoming', 'outgoing'));
ALTER TABLE payments ADD COLUMN IF NOT EXISTS related_payment_id UUID REFERENCES payments(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(20) CHECK (recipient_type IN ('landlord', 'admin', 'agency', 'utility_company', 'other'));
*/

-- Si faltan permisos:
/*
GRANT EXECUTE ON FUNCTION register_tenant_payment TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_payment_breakdown TO authenticated;
*/
