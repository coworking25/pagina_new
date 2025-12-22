-- =====================================================
-- SISTEMA AUTOMÁTICO DE ALERTAS DE PAGOS
-- Genera notificaciones cuando los pagos están próximos a vencer
-- =====================================================

-- =====================================================
-- FUNCIÓN: Generar alertas de pagos próximos a vencer
-- Se ejecuta diariamente para verificar pagos pendientes
-- =====================================================

CREATE OR REPLACE FUNCTION generate_payment_due_notifications()
RETURNS TABLE (
    notifications_created INTEGER,
    notifications_details TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_payment_record RECORD;
    v_notification_id UUID;
    v_count INTEGER := 0;
    v_details TEXT := '';
    v_days_until_due INTEGER;
    v_property_name VARCHAR;
BEGIN
    -- Buscar pagos pendientes que vencen en los próximos 7 días
    FOR v_payment_record IN 
        SELECT 
            p.id as payment_id,
            p.contract_id,
            p.payment_date,
            p.amount,
            c.client_id,
            pr.name as property_name,
            pr.code as property_code,
            EXTRACT(DAY FROM (p.payment_date - CURRENT_DATE)) as days_until_due
        FROM payments p
        JOIN contracts c ON p.contract_id = c.id
        JOIN properties pr ON c.property_id = pr.id
        WHERE p.status = 'pending'
        AND p.payment_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days')
        AND NOT EXISTS (
            -- No crear notificación duplicada si ya existe una reciente
            SELECT 1 FROM client_notifications cn
            WHERE cn.client_id = c.client_id
            AND cn.related_payment_id = p.id
            AND cn.type = 'payment_due'
            AND cn.created_at > (CURRENT_DATE - INTERVAL '2 days')
        )
        ORDER BY p.payment_date ASC
    LOOP
        v_days_until_due := v_payment_record.days_until_due::INTEGER;
        
        -- Crear notificación según los días restantes
        IF v_days_until_due <= 1 THEN
            -- URGENTE: Vence hoy o mañana
            v_notification_id := create_client_notification(
                v_payment_record.client_id,
                'payment_due',
                '🔴 Pago Urgente: Vence ' || 
                CASE 
                    WHEN v_days_until_due = 0 THEN 'HOY'
                    ELSE 'MAÑANA'
                END,
                'Tu pago de $' || TO_CHAR(v_payment_record.amount, 'FM999,999,990.00') || 
                ' para la propiedad ' || v_payment_record.property_name || 
                ' (' || v_payment_record.property_code || ')' ||
                ' vence ' || 
                CASE 
                    WHEN v_days_until_due = 0 THEN 'hoy'
                    ELSE 'mañana'
                END || 
                '. Por favor, realiza el pago a la brevedad para evitar recargos.',
                v_payment_record.payment_id,
                v_payment_record.contract_id,
                NULL,
                'urgent'
            );
        ELSIF v_days_until_due <= 3 THEN
            -- ALTO: Vence en 2-3 días
            v_notification_id := create_client_notification(
                v_payment_record.client_id,
                'payment_due',
                '⏰ Pago Próximo: Vence en ' || v_days_until_due || ' días',
                'Tu pago de $' || TO_CHAR(v_payment_record.amount, 'FM999,999,990.00') || 
                ' para la propiedad ' || v_payment_record.property_name || 
                ' (' || v_payment_record.property_code || ')' ||
                ' vence en ' || v_days_until_due || ' días. Recuerda realizar el pago a tiempo.',
                v_payment_record.payment_id,
                v_payment_record.contract_id,
                NULL,
                'high'
            );
        ELSE
            -- NORMAL: Vence en 4-7 días
            v_notification_id := create_client_notification(
                v_payment_record.client_id,
                'payment_due',
                '📅 Recordatorio: Pago próximo en ' || v_days_until_due || ' días',
                'Tu pago de $' || TO_CHAR(v_payment_record.amount, 'FM999,999,990.00') || 
                ' para la propiedad ' || v_payment_record.property_name || 
                ' (' || v_payment_record.property_code || ')' ||
                ' vence el ' || TO_CHAR(v_payment_record.payment_date, 'DD/MM/YYYY') || '.',
                v_payment_record.payment_id,
                v_payment_record.contract_id,
                NULL,
                'normal'
            );
        END IF;
        
        v_count := v_count + 1;
        v_details := v_details || 
            '- Cliente: ' || v_payment_record.client_id || 
            ', Propiedad: ' || v_payment_record.property_code || 
            ', Vence en: ' || v_days_until_due || ' días' || E'\n';
        
        RAISE NOTICE 'Notificación creada: ID=%, Cliente=%, Días=%', 
            v_notification_id, v_payment_record.client_id, v_days_until_due;
    END LOOP;
    
    -- Retornar resultado
    notifications_created := v_count;
    notifications_details := COALESCE(v_details, 'No se crearon notificaciones');
    
    RETURN NEXT;
END;
$$;

-- =====================================================
-- FUNCIÓN: Generar alertas de pagos vencidos
-- Se ejecuta diariamente para verificar pagos atrasados
-- =====================================================

CREATE OR REPLACE FUNCTION generate_payment_overdue_notifications()
RETURNS TABLE (
    notifications_created INTEGER,
    notifications_details TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_payment_record RECORD;
    v_notification_id UUID;
    v_count INTEGER := 0;
    v_details TEXT := '';
    v_days_overdue INTEGER;
BEGIN
    -- Buscar pagos vencidos (hasta 30 días de atraso)
    FOR v_payment_record IN 
        SELECT 
            p.id as payment_id,
            p.contract_id,
            p.payment_date,
            p.amount,
            c.client_id,
            pr.name as property_name,
            pr.code as property_code,
            EXTRACT(DAY FROM (CURRENT_DATE - p.payment_date)) as days_overdue
        FROM payments p
        JOIN contracts c ON p.contract_id = c.id
        JOIN properties pr ON c.property_id = pr.id
        WHERE p.status = 'pending'
        AND p.payment_date < CURRENT_DATE
        AND p.payment_date >= (CURRENT_DATE - INTERVAL '30 days')
        AND NOT EXISTS (
            -- No crear notificación duplicada si ya existe una reciente
            SELECT 1 FROM client_notifications cn
            WHERE cn.client_id = c.client_id
            AND cn.related_payment_id = p.id
            AND cn.type = 'payment_overdue'
            AND cn.created_at > (CURRENT_DATE - INTERVAL '2 days')
        )
        ORDER BY p.payment_date ASC
    LOOP
        v_days_overdue := v_payment_record.days_overdue::INTEGER;
        
        -- Crear notificación urgente de pago vencido
        v_notification_id := create_client_notification(
            v_payment_record.client_id,
            'payment_overdue',
            '🔴 PAGO VENCIDO: ' || v_days_overdue || ' día' || CASE WHEN v_days_overdue > 1 THEN 's' ELSE '' END || ' de atraso',
            'ATENCIÓN: Tu pago de $' || TO_CHAR(v_payment_record.amount, 'FM999,999,990.00') || 
            ' para la propiedad ' || v_payment_record.property_name || 
            ' (' || v_payment_record.property_code || ')' ||
            ' está vencido desde hace ' || v_days_overdue || ' día' || CASE WHEN v_days_overdue > 1 THEN 's' ELSE '' END || '.' ||
            ' Por favor, regulariza tu situación a la brevedad. Pueden aplicarse recargos por mora.',
            v_payment_record.payment_id,
            v_payment_record.contract_id,
            NULL,
            'urgent'
        );
        
        v_count := v_count + 1;
        v_details := v_details || 
            '- Cliente: ' || v_payment_record.client_id || 
            ', Propiedad: ' || v_payment_record.property_code || 
            ', Vencido hace: ' || v_days_overdue || ' días' || E'\n';
        
        RAISE NOTICE 'Notificación de vencimiento creada: ID=%, Cliente=%, Días vencidos=%', 
            v_notification_id, v_payment_record.client_id, v_days_overdue;
    END LOOP;
    
    -- Retornar resultado
    notifications_created := v_count;
    notifications_details := COALESCE(v_details, 'No se crearon notificaciones de pagos vencidos');
    
    RETURN NEXT;
END;
$$;

-- =====================================================
-- FUNCIÓN: Generar alertas de contratos próximos a vencer
-- Se ejecuta semanalmente para verificar contratos
-- =====================================================

CREATE OR REPLACE FUNCTION generate_contract_expiring_notifications()
RETURNS TABLE (
    notifications_created INTEGER,
    notifications_details TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_contract_record RECORD;
    v_notification_id UUID;
    v_count INTEGER := 0;
    v_details TEXT := '';
    v_days_until_expiry INTEGER;
BEGIN
    -- Buscar contratos que vencen en los próximos 60 días
    FOR v_contract_record IN 
        SELECT 
            c.id as contract_id,
            c.client_id,
            c.end_date,
            pr.name as property_name,
            pr.code as property_code,
            EXTRACT(DAY FROM (c.end_date - CURRENT_DATE)) as days_until_expiry
        FROM contracts c
        JOIN properties pr ON c.property_id = pr.id
        WHERE c.status = 'active'
        AND c.end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '60 days')
        AND NOT EXISTS (
            -- No crear notificación duplicada si ya existe una reciente
            SELECT 1 FROM client_notifications cn
            WHERE cn.client_id = c.client_id
            AND cn.related_contract_id = c.id
            AND cn.type = 'contract_expiring'
            AND cn.created_at > (CURRENT_DATE - INTERVAL '7 days')
        )
        ORDER BY c.end_date ASC
    LOOP
        v_days_until_expiry := v_contract_record.days_until_expiry::INTEGER;
        
        -- Crear notificación según los días restantes
        IF v_days_until_expiry <= 30 THEN
            -- ALTO: Vence en 30 días o menos
            v_notification_id := create_client_notification(
                v_contract_record.client_id,
                'contract_expiring',
                '📋 Contrato por Vencer: ' || v_days_until_expiry || ' días restantes',
                'Tu contrato para la propiedad ' || v_contract_record.property_name || 
                ' (' || v_contract_record.property_code || ')' ||
                ' vence el ' || TO_CHAR(v_contract_record.end_date, 'DD/MM/YYYY') || 
                ' (en ' || v_days_until_expiry || ' días). ' ||
                'Por favor, contacta a tu asesor para renovar o finalizar el contrato.',
                NULL,
                v_contract_record.contract_id,
                NULL,
                'high'
            );
        ELSE
            -- NORMAL: Vence en más de 30 días
            v_notification_id := create_client_notification(
                v_contract_record.client_id,
                'contract_expiring',
                '📋 Aviso: Contrato próximo a vencer',
                'Tu contrato para la propiedad ' || v_contract_record.property_name || 
                ' (' || v_contract_record.property_code || ')' ||
                ' vence el ' || TO_CHAR(v_contract_record.end_date, 'DD/MM/YYYY') || '.' ||
                ' Te recomendamos planificar la renovación con anticipación.',
                NULL,
                v_contract_record.contract_id,
                NULL,
                'normal'
            );
        END IF;
        
        v_count := v_count + 1;
        v_details := v_details || 
            '- Cliente: ' || v_contract_record.client_id || 
            ', Propiedad: ' || v_contract_record.property_code || 
            ', Vence en: ' || v_days_until_expiry || ' días' || E'\n';
        
        RAISE NOTICE 'Notificación de contrato creada: ID=%, Cliente=%, Días=%', 
            v_notification_id, v_contract_record.client_id, v_days_until_expiry;
    END LOOP;
    
    -- Retornar resultado
    notifications_created := v_count;
    notifications_details := COALESCE(v_details, 'No se crearon notificaciones de contratos');
    
    RETURN NEXT;
END;
$$;

-- =====================================================
-- FUNCIÓN MAESTRA: Ejecutar todas las alertas automáticas
-- =====================================================

CREATE OR REPLACE FUNCTION run_automatic_notifications()
RETURNS TABLE (
    task VARCHAR,
    notifications_created INTEGER,
    details TEXT,
    execution_time TIMESTAMP
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_result RECORD;
BEGIN
    v_start_time := NOW();
    
    -- 1. Pagos próximos a vencer
    RAISE NOTICE '=== Generando alertas de pagos próximos a vencer ===';
    FOR v_result IN 
        SELECT * FROM generate_payment_due_notifications()
    LOOP
        task := 'Pagos próximos a vencer';
        notifications_created := v_result.notifications_created;
        details := v_result.notifications_details;
        execution_time := v_start_time;
        RETURN NEXT;
    END LOOP;
    
    -- 2. Pagos vencidos
    RAISE NOTICE '=== Generando alertas de pagos vencidos ===';
    FOR v_result IN 
        SELECT * FROM generate_payment_overdue_notifications()
    LOOP
        task := 'Pagos vencidos';
        notifications_created := v_result.notifications_created;
        details := v_result.notifications_details;
        execution_time := NOW();
        RETURN NEXT;
    END LOOP;
    
    -- 3. Contratos próximos a vencer
    RAISE NOTICE '=== Generando alertas de contratos próximos a vencer ===';
    FOR v_result IN 
        SELECT * FROM generate_contract_expiring_notifications()
    LOOP
        task := 'Contratos próximos a vencer';
        notifications_created := v_result.notifications_created;
        details := v_result.notifications_details;
        execution_time := NOW();
        RETURN NEXT;
    END LOOP;
    
    RAISE NOTICE '=== Proceso de notificaciones automáticas completado ===';
END;
$$;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON FUNCTION generate_payment_due_notifications IS 
'Genera notificaciones para pagos que vencen en los próximos 7 días. Prioridad según días restantes: urgente (0-1 días), alta (2-3 días), normal (4-7 días)';

COMMENT ON FUNCTION generate_payment_overdue_notifications IS 
'Genera notificaciones urgentes para pagos vencidos (hasta 30 días de atraso)';

COMMENT ON FUNCTION generate_contract_expiring_notifications IS 
'Genera notificaciones para contratos que vencen en los próximos 60 días. Alta prioridad si vence en 30 días o menos';

COMMENT ON FUNCTION run_automatic_notifications IS 
'Función maestra que ejecuta todas las tareas automáticas de notificaciones. Devuelve un resumen de cada tarea';

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================

/*
EJECUCIÓN MANUAL:
-----------------
Para probar el sistema manualmente:

1. Ejecutar todas las alertas:
   SELECT * FROM run_automatic_notifications();

2. Solo alertas de pagos próximos:
   SELECT * FROM generate_payment_due_notifications();

3. Solo alertas de pagos vencidos:
   SELECT * FROM generate_payment_overdue_notifications();

4. Solo alertas de contratos:
   SELECT * FROM generate_contract_expiring_notifications();


AUTOMATIZACIÓN CON CRON (Supabase):
------------------------------------
Para automatizar con pg_cron (requiere extensión habilitada):

-- Habilitar extensión
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Ejecutar diariamente a las 8:00 AM
SELECT cron.schedule(
    'automatic-payment-notifications',
    '0 8 * * *',  -- Cron expression: cada día a las 8 AM
    $$SELECT * FROM run_automatic_notifications()$$
);

-- Ver tareas programadas
SELECT * FROM cron.job;

-- Desactivar tarea
SELECT cron.unschedule('automatic-payment-notifications');


ALTERNATIVA: EDGE FUNCTIONS
----------------------------
Si no tienes acceso a pg_cron, puedes usar Supabase Edge Functions
para ejecutar estas funciones periódicamente.

Crear función en: supabase/functions/automatic-notifications/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const { data, error } = await supabase.rpc('run_automatic_notifications')
  
  return new Response(
    JSON.stringify({ data, error }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})

Luego configurar GitHub Actions o un servicio externo para llamar
a esta función cada día.


MONITOREO:
----------
Ver últimas notificaciones creadas:

SELECT 
    cn.type,
    cn.priority,
    cn.created_at,
    c.full_name as client_name,
    cn.title
FROM client_notifications cn
JOIN clients c ON cn.client_id = c.id
WHERE cn.created_at > (NOW() - INTERVAL '24 hours')
ORDER BY cn.created_at DESC;

*/
