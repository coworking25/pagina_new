-- ============================================
-- SISTEMA DE ALERTAS AUTOMÁTICAS DE PAGOS
-- Versión: 1.0
-- Fecha: 2025-11-12
-- ============================================

-- Este script crea un sistema completo de alertas automáticas para:
-- 1. Recordatorios de pagos próximos a vencer
-- 2. Alertas de pagos vencidos
-- 3. Notificaciones de pagos recibidos
-- 4. Alertas para pagar al propietario
-- 5. Recordatorios de administración pendiente

-- ============================================
-- PARTE 1: FUNCIÓN PARA GENERAR ALERTAS DE PAGOS PRÓXIMOS
-- ============================================

CREATE OR REPLACE FUNCTION generate_upcoming_payment_alerts()
RETURNS INTEGER AS $$
DECLARE
    v_alert_count INTEGER := 0;
    v_payment RECORD;
    v_days_before INTEGER := 5; -- Alertar 5 días antes
BEGIN
    -- Buscar pagos pendientes que vencen en los próximos días
    FOR v_payment IN
        SELECT 
            p.id as payment_id,
            p.client_id,
            p.contract_id,
            p.due_date,
            p.amount,
            p.payment_type,
            c.contract_number,
            cl.full_name,
            cl.email,
            prop.title as property_title,
            prop.code as property_code
        FROM payments p
        JOIN contracts c ON p.contract_id = c.id
        JOIN clients cl ON p.client_id = cl.id
        LEFT JOIN properties prop ON c.property_id::text = prop.id::text
        WHERE 
            p.status = 'pending'
            AND p.payment_direction = 'incoming'
            AND p.due_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + v_days_before)
            -- No crear alertas duplicadas
            AND NOT EXISTS (
                SELECT 1 FROM client_alerts ca
                WHERE ca.payment_id = p.id
                AND ca.alert_type = 'payment_reminder'
                AND ca.created_at::date = CURRENT_DATE
            )
    LOOP
        -- Crear alerta de recordatorio
        INSERT INTO client_alerts (
            client_id,
            contract_id,
            payment_id,
            alert_type,
            title,
            description,
            priority,
            due_date,
            auto_generated
        ) VALUES (
            v_payment.client_id,
            v_payment.contract_id,
            v_payment.payment_id,
            'payment_reminder',
            'Recordatorio de Pago Próximo',
            FORMAT('Su pago de %s por $%s vence el %s. Propiedad: %s (%s)',
                CASE v_payment.payment_type
                    WHEN 'rent' THEN 'arriendo'
                    WHEN 'administration' THEN 'administración'
                    WHEN 'deposit' THEN 'depósito'
                    ELSE v_payment.payment_type
                END,
                v_payment.amount,
                TO_CHAR(v_payment.due_date, 'DD/MM/YYYY'),
                v_payment.property_title,
                v_payment.property_code
            ),
            'medium',
            v_payment.due_date,
            true
        );
        
        v_alert_count := v_alert_count + 1;
    END LOOP;
    
    RETURN v_alert_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_upcoming_payment_alerts IS 
    'Genera alertas automáticas para pagos que vencen en los próximos 5 días';

-- ============================================
-- PARTE 2: FUNCIÓN PARA GENERAR ALERTAS DE PAGOS VENCIDOS
-- ============================================

CREATE OR REPLACE FUNCTION generate_overdue_payment_alerts()
RETURNS INTEGER AS $$
DECLARE
    v_alert_count INTEGER := 0;
    v_payment RECORD;
BEGIN
    -- Buscar pagos vencidos
    FOR v_payment IN
        SELECT 
            p.id as payment_id,
            p.client_id,
            p.contract_id,
            p.due_date,
            p.amount,
            p.payment_type,
            (CURRENT_DATE - p.due_date) as days_overdue,
            c.contract_number,
            cl.full_name,
            cl.email,
            prop.title as property_title,
            prop.code as property_code
        FROM payments p
        JOIN contracts c ON p.contract_id = c.id
        JOIN clients cl ON p.client_id = cl.id
        LEFT JOIN properties prop ON c.property_id::text = prop.id::text
        WHERE 
            p.status = 'pending'
            AND p.payment_direction = 'incoming'
            AND p.due_date < CURRENT_DATE
            -- No crear alertas duplicadas hoy
            AND NOT EXISTS (
                SELECT 1 FROM client_alerts ca
                WHERE ca.payment_id = p.id
                AND ca.alert_type = 'payment_overdue'
                AND ca.created_at::date = CURRENT_DATE
            )
    LOOP
        -- Crear alerta de pago vencido
        INSERT INTO client_alerts (
            client_id,
            contract_id,
            payment_id,
            alert_type,
            title,
            description,
            priority,
            due_date,
            auto_generated
        ) VALUES (
            v_payment.client_id,
            v_payment.contract_id,
            v_payment.payment_id,
            'payment_overdue',
            '⚠️ Pago Vencido',
            FORMAT('Su pago de %s por $%s está vencido desde hace %s días (venció el %s). Por favor realice el pago lo antes posible. Propiedad: %s (%s)',
                CASE v_payment.payment_type
                    WHEN 'rent' THEN 'arriendo'
                    WHEN 'administration' THEN 'administración'
                    WHEN 'deposit' THEN 'depósito'
                    ELSE v_payment.payment_type
                END,
                v_payment.amount,
                v_payment.days_overdue,
                TO_CHAR(v_payment.due_date, 'DD/MM/YYYY'),
                v_payment.property_title,
                v_payment.property_code
            ),
            'high',
            v_payment.due_date,
            true
        );
        
        v_alert_count := v_alert_count + 1;
    END LOOP;
    
    RETURN v_alert_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_overdue_payment_alerts IS 
    'Genera alertas automáticas para pagos vencidos';

-- ============================================
-- PARTE 3: FUNCIÓN TRIGGER PARA NOTIFICAR CUANDO SE RECIBE UN PAGO
-- ============================================

CREATE OR REPLACE FUNCTION notify_payment_received()
RETURNS TRIGGER AS $$
DECLARE
    v_contract RECORD;
    v_property RECORD;
BEGIN
    -- Solo procesar si es un pago incoming que cambió a 'paid'
    IF NEW.payment_direction = 'incoming' 
       AND NEW.status = 'paid' 
       AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
        
        -- Obtener información del contrato y propiedad
        SELECT 
            c.*,
            cl_tenant.full_name as tenant_name,
            cl_tenant.email as tenant_email,
            cl_landlord.full_name as landlord_name,
            cl_landlord.email as landlord_email
        INTO v_contract
        FROM contracts c
        LEFT JOIN clients cl_tenant ON c.client_id = cl_tenant.id
        LEFT JOIN clients cl_landlord ON c.landlord_id = cl_landlord.id
        WHERE c.id = NEW.contract_id;
        
        -- Obtener información de la propiedad
        SELECT * INTO v_property
        FROM properties
        WHERE id::text = v_contract.property_id::text;
        
        -- Alerta para el inquilino (confirmación de pago recibido)
        INSERT INTO client_alerts (
            client_id,
            contract_id,
            payment_id,
            alert_type,
            title,
            description,
            priority,
            auto_generated
        ) VALUES (
            NEW.client_id,
            NEW.contract_id,
            NEW.id,
            'payment_received',
            '✅ Pago Recibido',
            FORMAT('Hemos recibido su pago de %s por $%s. Fecha: %s. Propiedad: %s (%s). Gracias por su puntualidad.',
                CASE NEW.payment_type
                    WHEN 'rent' THEN 'arriendo'
                    WHEN 'administration' THEN 'administración'
                    WHEN 'deposit' THEN 'depósito'
                    ELSE NEW.payment_type
                END,
                NEW.amount,
                TO_CHAR(NEW.payment_date, 'DD/MM/YYYY'),
                COALESCE(v_property.title, 'N/A'),
                COALESCE(v_property.code, 'N/A')
            ),
            'low',
            true
        );
        
        -- Alerta para el propietario (notificación de pago recibido)
        IF v_contract.landlord_id IS NOT NULL THEN
            INSERT INTO client_alerts (
                client_id,
                contract_id,
                payment_id,
                alert_type,
                title,
                description,
                priority,
                auto_generated
            ) VALUES (
                v_contract.landlord_id,
                NEW.contract_id,
                NEW.id,
                'payment_notification',
                '💰 Pago del Inquilino Recibido',
                FORMAT('Se ha recibido el pago de arriendo del inquilino %s por $%s (bruto). Monto neto a recibir: $%s. Propiedad: %s (%s)',
                    v_contract.tenant_name,
                    COALESCE(NEW.gross_amount, NEW.amount),
                    COALESCE(NEW.net_amount, NEW.amount),
                    COALESCE(v_property.title, 'N/A'),
                    COALESCE(v_property.code, 'N/A')
                ),
                'medium',
                true
            );
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION notify_payment_received IS 
    'Trigger que notifica automáticamente cuando se recibe un pago';

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_notify_payment_received ON payments;
CREATE TRIGGER trigger_notify_payment_received
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION notify_payment_received();

-- ============================================
-- PARTE 4: FUNCIÓN PARA EJECUTAR TODAS LAS ALERTAS DIARIAS
-- ============================================

CREATE OR REPLACE FUNCTION run_daily_payment_alerts()
RETURNS TABLE (
    upcoming_alerts INTEGER,
    overdue_alerts INTEGER,
    total_alerts INTEGER
) AS $$
DECLARE
    v_upcoming INTEGER;
    v_overdue INTEGER;
BEGIN
    -- Generar alertas de pagos próximos
    SELECT generate_upcoming_payment_alerts() INTO v_upcoming;
    
    -- Generar alertas de pagos vencidos
    SELECT generate_overdue_payment_alerts() INTO v_overdue;
    
    RETURN QUERY SELECT 
        v_upcoming,
        v_overdue,
        v_upcoming + v_overdue;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION run_daily_payment_alerts IS 
    'Ejecuta todas las funciones de generación de alertas diarias.
     Retorna el número de alertas generadas por tipo.
     Esta función debe ejecutarse diariamente mediante un cron job o pg_cron.';

-- ============================================
-- PARTE 5: CONFIGURAR PG_CRON (OPCIONAL)
-- ============================================

-- Si tienes pg_cron instalado, puedes programar la ejecución diaria:
-- SELECT cron.schedule(
--     'daily-payment-alerts',
--     '0 8 * * *', -- Ejecutar todos los días a las 8:00 AM
--     'SELECT run_daily_payment_alerts();'
-- );

-- Para ver los trabajos programados:
-- SELECT * FROM cron.job;

-- Para eliminar un trabajo:
-- SELECT cron.unschedule('daily-payment-alerts');

-- ============================================
-- PARTE 6: FUNCIÓN PARA LIMPIAR ALERTAS ANTIGUAS
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_old_alerts()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Eliminar alertas leídas de más de 90 días
    DELETE FROM client_alerts
    WHERE 
        is_read = true
        AND created_at < (CURRENT_DATE - INTERVAL '90 days');
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Marcar como leídas las alertas de pagos completados de más de 30 días
    UPDATE client_alerts
    SET is_read = true
    WHERE 
        is_read = false
        AND alert_type IN ('payment_received', 'payment_reminder')
        AND created_at < (CURRENT_DATE - INTERVAL '30 days')
        AND payment_id IN (
            SELECT id FROM payments WHERE status = 'paid'
        );
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_alerts IS 
    'Limpia alertas antiguas leídas (>90 días) y marca como leídas las alertas de pagos completados (>30 días)';

-- ============================================
-- PARTE 7: GRANTS Y PERMISOS
-- ============================================

GRANT EXECUTE ON FUNCTION generate_upcoming_payment_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION generate_overdue_payment_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION notify_payment_received TO authenticated;
GRANT EXECUTE ON FUNCTION run_daily_payment_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_alerts TO authenticated;

-- ============================================
-- PARTE 8: EJEMPLOS DE USO
-- ============================================

-- Ejecutar manualmente las alertas del día:
-- SELECT * FROM run_daily_payment_alerts();

-- Generar solo alertas de pagos próximos:
-- SELECT generate_upcoming_payment_alerts();

-- Generar solo alertas de pagos vencidos:
-- SELECT generate_overdue_payment_alerts();

-- Limpiar alertas antiguas:
-- SELECT cleanup_old_alerts();

-- Ver alertas generadas hoy:
-- SELECT 
--     ca.*,
--     c.contract_number,
--     cl.full_name as client_name,
--     p.amount as payment_amount,
--     p.due_date
-- FROM client_alerts ca
-- LEFT JOIN contracts c ON ca.contract_id = c.id
-- LEFT JOIN clients cl ON ca.client_id = cl.id
-- LEFT JOIN payments p ON ca.payment_id = p.id
-- WHERE ca.created_at::date = CURRENT_DATE
-- AND ca.auto_generated = true
-- ORDER BY ca.created_at DESC;

-- ============================================
-- PARTE 9: VERIFICACIÓN
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'SISTEMA DE ALERTAS AUTOMÁTICAS INSTALADO';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Funciones creadas:';
    RAISE NOTICE '  ✅ generate_upcoming_payment_alerts()';
    RAISE NOTICE '  ✅ generate_overdue_payment_alerts()';
    RAISE NOTICE '  ✅ notify_payment_received() [TRIGGER]';
    RAISE NOTICE '  ✅ run_daily_payment_alerts()';
    RAISE NOTICE '  ✅ cleanup_old_alerts()';
    RAISE NOTICE '';
    RAISE NOTICE 'Uso:';
    RAISE NOTICE '  SELECT * FROM run_daily_payment_alerts();';
    RAISE NOTICE '';
    RAISE NOTICE 'Trigger activo:';
    RAISE NOTICE '  ✅ trigger_notify_payment_received';
    RAISE NOTICE '     Se dispara al recibir pagos';
    RAISE NOTICE '===========================================';
END $$;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

COMMIT;
