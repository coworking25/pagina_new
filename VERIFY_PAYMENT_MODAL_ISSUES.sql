-- =====================================================
-- SCRIPT: VERIFICACIÓN DE PROBLEMAS EN MODAL DE PAGOS
-- Fecha: 2026-01-14
-- =====================================================

-- 1. Verificar si existe la función register_tenant_payment
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'register_tenant_payment'
    ) THEN
        RAISE NOTICE '✅ Función register_tenant_payment existe';
    ELSE
        RAISE NOTICE '❌ Función register_tenant_payment NO existe';
    END IF;
END $$;

-- 2. Verificar parámetros de la función
SELECT 
    p.proname AS function_name,
    pg_get_function_arguments(p.oid) AS parameters,
    pg_get_function_result(p.oid) AS return_type
FROM pg_proc p
WHERE p.proname = 'register_tenant_payment';

-- 3. Verificar que la tabla payments tiene todas las columnas necesarias
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
AND column_name IN (
    'contract_id',
    'client_id',
    'payment_type',
    'payment_direction',
    'amount',
    'gross_amount',
    'admin_deduction',
    'agency_commission',
    'net_amount',
    'status',
    'due_date',
    'payment_date',
    'payment_method',
    'transaction_reference',
    'period_start',
    'period_end',
    'recipient_type',
    'related_payment_id',
    'notes'
)
ORDER BY column_name;

-- 4. Verificar que la tabla contracts tiene todas las columnas necesarias
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'contracts'
AND column_name IN (
    'id',
    'client_id',
    'landlord_id',
    'property_id',
    'monthly_rent',
    'administration_fee',
    'admin_included_in_rent',
    'admin_paid_by',
    'admin_payment_method',
    'admin_landlord_percentage',
    'agency_commission_percentage',
    'agency_commission_fixed'
)
ORDER BY column_name;

-- 5. Verificar si existe la función calculate_payment_breakdown
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'calculate_payment_breakdown'
    ) THEN
        RAISE NOTICE '✅ Función calculate_payment_breakdown existe';
    ELSE
        RAISE NOTICE '❌ Función calculate_payment_breakdown NO existe';
    END IF;
END $$;

-- 6. Verificar permisos
SELECT 
    routine_name,
    routine_schema,
    specific_name
FROM information_schema.routines
WHERE routine_name IN ('register_tenant_payment', 'calculate_payment_breakdown')
  AND routine_schema = 'public';

-- 7. Intentar hacer un test con datos de ejemplo (solo SELECT, no INSERT)
-- Buscar un contrato real para probar
SELECT 
    c.id,
    c.client_id,
    c.landlord_id,
    c.monthly_rent,
    c.administration_fee,
    c.admin_included_in_rent,
    c.admin_paid_by,
    c.admin_payment_method,
    c.admin_landlord_percentage,
    c.agency_commission_percentage,
    c.agency_commission_fixed
FROM contracts c
WHERE c.status = 'active'
LIMIT 5;

-- 8. Verificar si hay algún error en los logs recientes (si tienes acceso)
-- Nota: Esto puede no funcionar en todas las instalaciones
SELECT *
FROM pg_stat_statements
WHERE query LIKE '%register_tenant_payment%'
ORDER BY calls DESC
LIMIT 10;
