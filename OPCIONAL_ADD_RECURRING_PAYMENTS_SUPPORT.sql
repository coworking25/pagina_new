-- =====================================================
-- OPCIONAL: Agregar soporte de pagos recurrentes
-- Fecha: 2026-01-14
-- Nota: Estas columnas NO son requeridas para el funcionamiento actual
-- =====================================================

-- ⚠️ ADVERTENCIA:
-- El código TypeScript define campos is_recurring y recurrence_frequency
-- PERO estas columnas NO existen actualmente en payment_schedules
-- 
-- El sistema funciona sin ellas, pero si se intentan guardar datos
-- recurrentes desde el formulario, dará error.
--
-- Opciones:
-- 1. ✅ RECOMENDADO: Eliminar campos is_recurring del TypeScript (más limpio)
-- 2. ⚙️ Ejecutar este script para agregar las columnas a la BD

-- =====================================================
-- OPCIÓN 2: Agregar columnas de recurrencia
-- =====================================================

-- 1. Agregar columna is_recurring
ALTER TABLE payment_schedules
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- 2. Agregar columna recurrence_frequency  
ALTER TABLE payment_schedules
ADD COLUMN IF NOT EXISTS recurrence_frequency VARCHAR(20) CHECK (
  recurrence_frequency IN ('monthly', 'quarterly', 'yearly', NULL)
);

-- 3. Comentar las columnas
COMMENT ON COLUMN payment_schedules.is_recurring IS 'Indica si el pago se repite automáticamente';
COMMENT ON COLUMN payment_schedules.recurrence_frequency IS 'Frecuencia de recurrencia: monthly, quarterly, yearly';

-- 4. Verificar estructura actualizada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'payment_schedules'
  AND column_name IN ('is_recurring', 'recurrence_frequency')
ORDER BY ordinal_position;

-- 5. Actualizar pagos existentes (si lo deseas)
-- Por defecto, todos los pagos serán no-recurrentes
UPDATE payment_schedules
SET is_recurring = FALSE
WHERE is_recurring IS NULL;

-- =====================================================
-- PRUEBA: Crear un pago recurrente
-- =====================================================

/*
INSERT INTO payment_schedules (
    client_id,
    payment_concept,
    amount,
    currency,
    due_date,
    status,
    paid_amount,
    notes,
    is_recurring,
    recurrence_frequency
) VALUES (
    '331a25ea-5f6c-4aa1-84d6-86d744c0c38e',
    'Renta mensual recurrente',
    1500000,
    'COP',
    '2026-02-05',
    'pending',
    0,
    'Pago configurado como recurrente mensual',
    true,
    'monthly'
);
*/

-- =====================================================
-- FUNCIÓN: Generar próxima instancia de pago recurrente
-- =====================================================

CREATE OR REPLACE FUNCTION generate_next_recurring_payment(
    p_payment_schedule_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_payment RECORD;
    v_next_due_date DATE;
    v_new_id UUID;
BEGIN
    -- Obtener pago original
    SELECT * INTO v_payment
    FROM payment_schedules
    WHERE id = p_payment_schedule_id
      AND is_recurring = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pago no encontrado o no es recurrente: %', p_payment_schedule_id;
    END IF;
    
    -- Calcular próxima fecha según frecuencia
    v_next_due_date := CASE v_payment.recurrence_frequency
        WHEN 'monthly' THEN v_payment.due_date + INTERVAL '1 month'
        WHEN 'quarterly' THEN v_payment.due_date + INTERVAL '3 months'
        WHEN 'yearly' THEN v_payment.due_date + INTERVAL '1 year'
        ELSE NULL
    END;
    
    IF v_next_due_date IS NULL THEN
        RAISE EXCEPTION 'Frecuencia de recurrencia inválida: %', v_payment.recurrence_frequency;
    END IF;
    
    -- Crear nuevo pago
    INSERT INTO payment_schedules (
        client_id,
        property_id,
        payment_concept,
        amount,
        currency,
        due_date,
        status,
        paid_amount,
        notes,
        is_recurring,
        recurrence_frequency,
        parent_schedule_id
    ) VALUES (
        v_payment.client_id,
        v_payment.property_id,
        v_payment.payment_concept,
        v_payment.amount,
        v_payment.currency,
        v_next_due_date,
        'pending',
        0,
        'Generado automáticamente desde pago recurrente',
        v_payment.is_recurring,
        v_payment.recurrence_frequency,
        p_payment_schedule_id
    ) RETURNING id INTO v_new_id;
    
    RAISE NOTICE 'Nuevo pago recurrente creado: % (vence: %)', v_new_id, v_next_due_date;
    
    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-generar próximo pago al marcar como pagado
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_generate_next_recurring()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el pago se marca como 'paid' y es recurrente
    IF NEW.status = 'paid' AND OLD.status != 'paid' AND NEW.is_recurring = TRUE THEN
        -- Generar siguiente instancia
        PERFORM generate_next_recurring_payment(NEW.id);
        
        RAISE NOTICE 'Trigger: Generando próximo pago recurrente para %', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS auto_generate_recurring_payment ON payment_schedules;
CREATE TRIGGER auto_generate_recurring_payment
    AFTER UPDATE ON payment_schedules
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_next_recurring();

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ================================================';
    RAISE NOTICE '✅ SOPORTE DE PAGOS RECURRENTES AGREGADO';
    RAISE NOTICE '✅ ================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Columnas agregadas:';
    RAISE NOTICE '  - is_recurring (BOOLEAN)';
    RAISE NOTICE '  - recurrence_frequency (VARCHAR)';
    RAISE NOTICE '';
    RAISE NOTICE 'Función creada:';
    RAISE NOTICE '  - generate_next_recurring_payment(payment_id)';
    RAISE NOTICE '';
    RAISE NOTICE 'Trigger creado:';
    RAISE NOTICE '  - auto_generate_recurring_payment';
    RAISE NOTICE '    (genera automáticamente al marcar como pagado)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE:';
    RAISE NOTICE '  El formulario de pagos ya tiene los campos';
    RAISE NOTICE '  de recurrencia implementados en TypeScript';
    RAISE NOTICE '';
END $$;
