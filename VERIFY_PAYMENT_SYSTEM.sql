-- ============================================
-- SCRIPT DE VERIFICACIÓN DEL SISTEMA DE PAGOS
-- Ejecutar en Supabase SQL Editor
-- ============================================

DO $$
DECLARE
    v_contracts_cols INTEGER;
    v_payments_cols INTEGER;
    v_functions_count INTEGER;
    v_triggers_count INTEGER;
    v_indexes_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '  VERIFICACIÓN DEL SISTEMA DE PAGOS';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    
    -- ============================================
    -- 1. VERIFICAR COLUMNAS EN CONTRACTS
    -- ============================================
    SELECT COUNT(*) INTO v_contracts_cols
    FROM information_schema.columns
    WHERE table_name = 'contracts'
    AND column_name IN (
        'admin_included_in_rent',
        'admin_paid_by',
        'admin_payment_method',
        'admin_landlord_percentage',
        'agency_commission_percentage',
        'agency_commission_fixed'
    );
    
    RAISE NOTICE '1. COLUMNAS EN TABLA CONTRACTS';
    RAISE NOTICE '   Esperadas: 6 columnas';
    RAISE NOTICE '   Encontradas: % columnas', v_contracts_cols;
    
    IF v_contracts_cols = 6 THEN
        RAISE NOTICE '   ✅ CORRECTO';
    ELSE
        RAISE NOTICE '   ❌ FALTAN COLUMNAS';
    END IF;
    RAISE NOTICE '';
    
    -- ============================================
    -- 2. VERIFICAR COLUMNAS EN PAYMENTS
    -- ============================================
    SELECT COUNT(*) INTO v_payments_cols
    FROM information_schema.columns
    WHERE table_name = 'payments'
    AND column_name IN (
        'gross_amount',
        'admin_deduction',
        'agency_commission',
        'net_amount',
        'payment_direction',
        'related_payment_id',
        'recipient_type'
    );
    
    RAISE NOTICE '2. COLUMNAS EN TABLA PAYMENTS';
    RAISE NOTICE '   Esperadas: 7 columnas';
    RAISE NOTICE '   Encontradas: % columnas', v_payments_cols;
    
    IF v_payments_cols = 7 THEN
        RAISE NOTICE '   ✅ CORRECTO';
    ELSE
        RAISE NOTICE '   ❌ FALTAN COLUMNAS';
    END IF;
    RAISE NOTICE '';
    
    -- ============================================
    -- 3. VERIFICAR FUNCIONES
    -- ============================================
    SELECT COUNT(*) INTO v_functions_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN (
        'calculate_payment_breakdown',
        'register_tenant_payment',
        'generate_upcoming_payment_alerts',
        'generate_overdue_payment_alerts',
        'notify_payment_received',
        'run_daily_payment_alerts',
        'cleanup_old_alerts'
    );
    
    RAISE NOTICE '3. FUNCIONES POSTGRESQL';
    RAISE NOTICE '   Esperadas: 7 funciones';
    RAISE NOTICE '   Encontradas: % funciones', v_functions_count;
    
    IF v_functions_count = 7 THEN
        RAISE NOTICE '   ✅ CORRECTO';
        RAISE NOTICE '   - calculate_payment_breakdown()';
        RAISE NOTICE '   - register_tenant_payment()';
        RAISE NOTICE '   - generate_upcoming_payment_alerts()';
        RAISE NOTICE '   - generate_overdue_payment_alerts()';
        RAISE NOTICE '   - notify_payment_received()';
        RAISE NOTICE '   - run_daily_payment_alerts()';
        RAISE NOTICE '   - cleanup_old_alerts()';
    ELSE
        RAISE NOTICE '   ❌ FALTAN FUNCIONES';
    END IF;
    RAISE NOTICE '';
    
    -- ============================================
    -- 4. VERIFICAR TRIGGERS
    -- ============================================
    SELECT COUNT(*) INTO v_triggers_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name = 'trigger_notify_payment_received';
    
    RAISE NOTICE '4. TRIGGERS';
    RAISE NOTICE '   Esperados: 1 trigger';
    RAISE NOTICE '   Encontrados: % trigger(s)', v_triggers_count;
    
    IF v_triggers_count = 1 THEN
        RAISE NOTICE '   ✅ CORRECTO - trigger_notify_payment_received activo';
    ELSE
        RAISE NOTICE '   ❌ TRIGGER NO ENCONTRADO';
    END IF;
    RAISE NOTICE '';
    
    -- ============================================
    -- 5. VERIFICAR ÍNDICES
    -- ============================================
    SELECT COUNT(*) INTO v_indexes_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname IN (
        'idx_payments_direction',
        'idx_payments_recipient',
        'idx_payments_related',
        'idx_contracts_admin_config'
    );
    
    RAISE NOTICE '5. ÍNDICES';
    RAISE NOTICE '   Esperados: 4 índices';
    RAISE NOTICE '   Encontrados: % índices', v_indexes_count;
    
    IF v_indexes_count >= 4 THEN
        RAISE NOTICE '   ✅ CORRECTO';
    ELSE
        RAISE NOTICE '   ⚠️  ALGUNOS ÍNDICES PUEDEN FALTAR (no crítico)';
    END IF;
    RAISE NOTICE '';
    
    -- ============================================
    -- 6. VERIFICAR VISTA
    -- ============================================
    IF EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_schema = 'public'
        AND table_name = 'payment_breakdown_report'
    ) THEN
        RAISE NOTICE '6. VISTAS';
        RAISE NOTICE '   ✅ payment_breakdown_report creada';
    ELSE
        RAISE NOTICE '6. VISTAS';
        RAISE NOTICE '   ❌ payment_breakdown_report NO ENCONTRADA';
    END IF;
    RAISE NOTICE '';
    
    -- ============================================
    -- RESUMEN FINAL
    -- ============================================
    RAISE NOTICE '==============================================';
    RAISE NOTICE '  RESUMEN';
    RAISE NOTICE '==============================================';
    
    IF v_contracts_cols = 6 
       AND v_payments_cols = 7 
       AND v_functions_count = 7 
       AND v_triggers_count = 1 THEN
        RAISE NOTICE '✅ SISTEMA COMPLETAMENTE INSTALADO';
        RAISE NOTICE '';
        RAISE NOTICE 'Puedes comenzar a usar:';
        RAISE NOTICE '  - Registrar pagos con desglose automático';
        RAISE NOTICE '  - Ver extractos con breakdown en portal cliente';
        RAISE NOTICE '  - Generar alertas automáticas';
        RAISE NOTICE '';
        RAISE NOTICE 'Para probar alertas ejecuta:';
        RAISE NOTICE '  SELECT * FROM run_daily_payment_alerts();';
    ELSE
        RAISE NOTICE '⚠️  INSTALACIÓN INCOMPLETA';
        RAISE NOTICE '';
        RAISE NOTICE 'Revisa los errores arriba y vuelve a ejecutar:';
        RAISE NOTICE '  1. ADD_PAYMENT_ADMINISTRATION_COLUMNS.sql';
        RAISE NOTICE '  2. ADD_AUTOMATIC_PAYMENT_ALERTS.sql';
    END IF;
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
END $$;

-- ============================================
-- PRUEBA RÁPIDA DE FUNCIONES
-- ============================================

-- Probar cálculo de breakdown (necesitas un contract_id real)
-- SELECT * FROM calculate_payment_breakdown(
--     'tu-contract-id-aqui'::uuid,
--     1000000
-- );

-- Probar generación de alertas
-- SELECT * FROM run_daily_payment_alerts();

-- Ver alertas generadas
-- SELECT * FROM client_alerts 
-- WHERE auto_generated = true 
-- ORDER BY created_at DESC 
-- LIMIT 10;
