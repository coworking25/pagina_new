-- =====================================================
-- SCRIPT: GENERAR PAGOS MENSUALES DESDE CONTRATO
-- Fecha: 2026-01-14
-- Propósito: Crear pagos mensuales automáticamente
-- =====================================================

-- 1. Verificar contratos del cliente
SELECT 
    id,
    client_id,
    property_id,
    start_date,
    end_date,
    monthly_rent,
    payment_day
FROM contracts
WHERE client_id = '331a25ea-5f6c-4aa1-84d6-86d744c0c38e'
ORDER BY start_date DESC;

-- 2. FUNCIÓN: Generar pagos mensuales desde contrato
CREATE OR REPLACE FUNCTION generate_monthly_payments(
    p_contract_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE(
    payment_month TEXT,
    due_date DATE,
    amount NUMERIC,
    inserted BOOLEAN
) AS $$
DECLARE
    v_contract RECORD;
    v_current_date DATE;
    v_payment_day INTEGER;
    v_due_date DATE;
    v_existing_count INTEGER;
BEGIN
    -- Obtener información del contrato
    SELECT 
        c.id,
        c.client_id,
        c.property_id,
        COALESCE(p_start_date, c.start_date) as start_date,
        COALESCE(p_end_date, c.end_date) as end_date,
        c.monthly_rent,
        COALESCE(c.payment_day, 5) as payment_day
    INTO v_contract
    FROM contracts c
    WHERE c.id = p_contract_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contrato no encontrado: %', p_contract_id;
    END IF;

    v_payment_day := v_contract.payment_day;
    v_current_date := DATE_TRUNC('month', v_contract.start_date);

    -- Generar pagos mes a mes
    WHILE v_current_date <= v_contract.end_date LOOP
        -- Calcular fecha de vencimiento (día del pago del mes actual)
        v_due_date := DATE_TRUNC('month', v_current_date) + (v_payment_day - 1) * INTERVAL '1 day';
        
        -- Verificar si ya existe un pago para este mes
        SELECT COUNT(*) INTO v_existing_count
        FROM payment_schedules
        WHERE client_id = v_contract.client_id
          AND DATE_TRUNC('month', due_date) = DATE_TRUNC('month', v_due_date)
          AND payment_concept LIKE '%Renta%';

        -- Si no existe, crear el pago
        IF v_existing_count = 0 THEN
            INSERT INTO payment_schedules (
                client_id,
                property_id,
                payment_concept,
                amount,
                currency,
                due_date,
                status,
                paid_amount,
                notes
            ) VALUES (
                v_contract.client_id,
                v_contract.property_id,
                'Renta ' || TO_CHAR(v_due_date, 'TMMonth YYYY'),
                v_contract.monthly_rent,
                'COP',
                v_due_date,
                CASE 
                    WHEN v_due_date < CURRENT_DATE THEN 'overdue'
                    ELSE 'pending'
                END,
                0,
                'Pago generado automáticamente desde contrato'
            );

            RETURN QUERY SELECT 
                TO_CHAR(v_due_date, 'TMMonth YYYY')::TEXT,
                v_due_date,
                v_contract.monthly_rent,
                true;
        ELSE
            RETURN QUERY SELECT 
                TO_CHAR(v_due_date, 'TMMonth YYYY')::TEXT,
                v_due_date,
                v_contract.monthly_rent,
                false;
        END IF;

        -- Siguiente mes
        v_current_date := v_current_date + INTERVAL '1 month';
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- 3. EJEMPLO: Generar pagos para un contrato específico
-- Reemplaza 'TU_CONTRACT_ID' con el ID real del contrato

-- Primero, obtener el contract_id
DO $$
DECLARE
    v_contract_id UUID;
    v_result RECORD;
BEGIN
    -- Buscar el contrato más reciente del cliente
    SELECT id INTO v_contract_id
    FROM contracts
    WHERE client_id = '331a25ea-5f6c-4aa1-84d6-86d744c0c38e'
    ORDER BY start_date DESC
    LIMIT 1;

    IF v_contract_id IS NOT NULL THEN
        RAISE NOTICE 'Generando pagos para contrato: %', v_contract_id;
        
        -- Generar pagos
        FOR v_result IN 
            SELECT * FROM generate_monthly_payments(v_contract_id)
        LOOP
            IF v_result.inserted THEN
                RAISE NOTICE '✅ Creado: % - $% (Vence: %)', 
                    v_result.payment_month, 
                    v_result.amount, 
                    v_result.due_date;
            ELSE
                RAISE NOTICE 'ℹ️  Ya existe: % - $% (Vence: %)', 
                    v_result.payment_month, 
                    v_result.amount, 
                    v_result.due_date;
            END IF;
        END LOOP;
    ELSE
        RAISE NOTICE '⚠️ No se encontró contrato para el cliente';
    END IF;
END $$;

-- 4. Verificar pagos generados
SELECT 
    TO_CHAR(due_date, 'YYYY-MM') as mes,
    payment_concept,
    amount,
    due_date,
    status
FROM payment_schedules
WHERE client_id = '331a25ea-5f6c-4aa1-84d6-86d744c0c38e'
ORDER BY due_date;

-- 5. Resumen de pagos por mes
SELECT 
    TO_CHAR(due_date, 'TMMonth YYYY') as mes,
    COUNT(*) as total_pagos,
    SUM(amount) as monto_total,
    STRING_AGG(payment_concept, ', ') as conceptos
FROM payment_schedules
WHERE client_id = '331a25ea-5f6c-4aa1-84d6-86d744c0c38e'
GROUP BY TO_CHAR(due_date, 'YYYY-MM'), TO_CHAR(due_date, 'TMMonth YYYY')
ORDER BY MIN(due_date);

-- 6. Script alternativo si NO hay contrato
-- Generar pagos mensuales manualmente para 12 meses

-- ✅ SCRIPT ACTIVADO: Generación manual de pagos mensuales
DO $$
DECLARE
    v_start_date DATE := '2026-01-01';
    v_end_date DATE := '2026-12-31';
    v_current_date DATE := v_start_date;
    v_payment_day INTEGER := 5; -- Día del mes para pago (día 5 de cada mes)
    v_monthly_amount NUMERIC := 1500000; -- Monto mensual de renta
BEGIN
    WHILE v_current_date <= v_end_date LOOP
        INSERT INTO payment_schedules (
            client_id,
            payment_concept,
            amount,
            currency,
            due_date,
            status,
            paid_amount,
            notes
        ) VALUES (
            '331a25ea-5f6c-4aa1-84d6-86d744c0c38e',
            'Renta ' || TO_CHAR(v_current_date, 'TMMonth YYYY'),
            v_monthly_amount,
            'COP',
            DATE_TRUNC('month', v_current_date) + (v_payment_day - 1) * INTERVAL '1 day',
            CASE 
                WHEN (DATE_TRUNC('month', v_current_date) + (v_payment_day - 1) * INTERVAL '1 day') < CURRENT_DATE THEN 'overdue'
                ELSE 'pending'
            END,
            0,
            'Pago mensual generado automáticamente'
        )
        ON CONFLICT DO NOTHING; -- Evitar duplicados

        v_current_date := v_current_date + INTERVAL '1 month';
    END LOOP;

    RAISE NOTICE '✅ Pagos mensuales generados exitosamente';
END $$;

-- 7. Mensaje final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ================================================';
    RAISE NOTICE '✅ SISTEMA DE PAGOS MENSUALES CONFIGURADO';
    RAISE NOTICE '✅ ================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Función creada: generate_monthly_payments(contract_id)';
    RAISE NOTICE '';
    RAISE NOTICE 'Para generar pagos de un contrato nuevo:';
    RAISE NOTICE '  SELECT * FROM generate_monthly_payments(''contract_id_aqui'');';
    RAISE NOTICE '';
END $$;
