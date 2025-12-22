-- =====================================================
-- SCRIPT AUTOMÁTICO: CREAR ALERTAS PARA PRIMER CLIENTE
-- No requiere edición manual
-- =====================================================

-- Ejecuta este script completo en Supabase SQL Editor

DO $$
DECLARE
    v_client_id UUID;
    v_client_name TEXT;
    v_client_email TEXT;
BEGIN
    -- Buscar el primer cliente con credenciales de portal
    SELECT c.id, c.full_name, cpc.email
    INTO v_client_id, v_client_name, v_client_email
    FROM clients c
    JOIN client_portal_credentials cpc ON cpc.client_id = c.id
    WHERE cpc.portal_access_enabled = true
    ORDER BY c.created_at DESC
    LIMIT 1;

    -- Verificar que se encontró un cliente
    IF v_client_id IS NULL THEN
        RAISE NOTICE '❌ No se encontró ningún cliente con credenciales de portal';
        RAISE NOTICE 'ℹ️  Debes crear un cliente primero desde el panel admin';
        RETURN;
    END IF;

    RAISE NOTICE '✅ Cliente encontrado: % (ID: %)', v_client_name, v_client_id;
    RAISE NOTICE '📧 Email: %', v_client_email;
    RAISE NOTICE '🔔 Creando 8 alertas de prueba...';
    RAISE NOTICE '';

    -- Limpiar alertas existentes del cliente (opcional)
    DELETE FROM client_alerts WHERE client_id = v_client_id;

    -- Alerta 1: ALTA SEVERIDAD - Pago próximo a vencer
    INSERT INTO client_alerts (client_id, alert_type, severity, title, message, action_url, expires_at)
    VALUES (v_client_id, 'payment_reminder', 'high', '💰 Pago Próximo a Vencer',
            'Tu pago de arriendo vence en 3 días (25 de Diciembre). El monto es de $18,500.00',
            '/cliente/pagos', NOW() + INTERVAL '7 days');

    -- Alerta 2: ALTA SEVERIDAD - Pago vencido
    INSERT INTO client_alerts (client_id, alert_type, severity, title, message, action_url, expires_at)
    VALUES (v_client_id, 'payment_overdue', 'high', '⚠️ Pago Vencido',
            'Tienes un pago vencido desde el 15 de Diciembre por $18,500.00. Por favor realiza el pago lo antes posible.',
            '/cliente/pagos', NOW() + INTERVAL '30 days');

    -- Alerta 3: MEDIA SEVERIDAD - Documento por expirar
    INSERT INTO client_alerts (client_id, alert_type, severity, title, message, action_url, expires_at)
    VALUES (v_client_id, 'document_expiring', 'medium', '📄 Documento Próximo a Expirar',
            'Tu cédula de identidad expira en 30 días. Por favor actualiza tus documentos.',
            '/cliente/documentos', NOW() + INTERVAL '45 days');

    -- Alerta 4: ALTA SEVERIDAD - Contrato próximo a vencer
    INSERT INTO client_alerts (client_id, alert_type, severity, title, message, action_url, expires_at)
    VALUES (v_client_id, 'contract_expiring', 'high', '📋 Contrato por Vencer',
            'Tu contrato de arriendo vence en 15 días. Contacta con nosotros para renovar.',
            '/cliente/contratos', NOW() + INTERVAL '30 days');

    -- Alerta 5: BAJA SEVERIDAD - Información general
    INSERT INTO client_alerts (client_id, alert_type, severity, title, message, action_url)
    VALUES (v_client_id, 'general', 'low', 'ℹ️ Actualización del Sistema',
            'Hemos actualizado nuestro portal de clientes con nuevas funcionalidades. Explora las mejoras en tu dashboard.',
            '/cliente/dashboard');

    -- Alerta 6: ALTA SEVERIDAD - Alerta urgente
    INSERT INTO client_alerts (client_id, alert_type, severity, title, message, action_url, expires_at)
    VALUES (v_client_id, 'urgent', 'high', '🚨 Acción Requerida Inmediatamente',
            'Se requiere tu firma en el contrato de renovación. Por favor acude a nuestras oficinas antes del 28 de Diciembre.',
            '/cliente/contratos', NOW() + INTERVAL '5 days');

    -- Alerta 7: MEDIA SEVERIDAD - Recordatorio (ya leída)
    INSERT INTO client_alerts (client_id, alert_type, severity, title, message, action_url, is_read, read_at)
    VALUES (v_client_id, 'payment_reminder', 'medium', '💰 Recordatorio de Pago',
            'Recuerda que tu próximo pago vence el 5 de Enero 2026.',
            '/cliente/pagos', true, NOW() - INTERVAL '2 hours');

    -- Alerta 8: BAJA SEVERIDAD - Información (ya leída)
    INSERT INTO client_alerts (client_id, alert_type, severity, title, message, is_read, read_at)
    VALUES (v_client_id, 'general', 'low', 'ℹ️ Horario de Atención Navidad',
            'Durante las fiestas navideñas (24-25 Dic) nuestras oficinas permanecerán cerradas. Retomaremos el 26 de Diciembre.',
            true, NOW() - INTERVAL '1 day');

    RAISE NOTICE '';
    RAISE NOTICE '✅ 8 alertas creadas correctamente';
    RAISE NOTICE '📊 6 no leídas, 2 leídas';
    RAISE NOTICE '⚠️  4 alta severidad, 1 media, 3 baja';
    RAISE NOTICE '';
    RAISE NOTICE '🌐 Ahora prueba en el portal:';
    RAISE NOTICE '1. Abre http://localhost:5173/login';
    RAISE NOTICE '2. Login con: %', v_client_email;
    RAISE NOTICE '3. Verás badge amarillo con "6" en Mis Alertas';
    RAISE NOTICE '4. Click en "Mis Alertas" para ver todas';
    RAISE NOTICE '';
    RAISE NOTICE '🔔 Habilita Realtime en Supabase:';
    RAISE NOTICE 'Dashboard → Database → Replication → client_alerts (toggle ON)';

END $$;

-- =====================================================
-- VERIFICAR ALERTAS CREADAS
-- =====================================================

SELECT 
    c.full_name as cliente,
    COUNT(*) as total_alertas,
    SUM(CASE WHEN ca.is_read = false THEN 1 ELSE 0 END) as no_leidas,
    SUM(CASE WHEN ca.severity = 'high' THEN 1 ELSE 0 END) as alta_severidad,
    SUM(CASE WHEN ca.alert_type = 'urgent' THEN 1 ELSE 0 END) as urgentes
FROM client_alerts ca
JOIN clients c ON c.id = ca.client_id
GROUP BY c.full_name;

-- Ver las alertas creadas
SELECT 
    alert_type,
    severity,
    title,
    is_read,
    created_at
FROM client_alerts
WHERE client_id = (
    SELECT c.id FROM clients c
    JOIN client_portal_credentials cpc ON cpc.client_id = c.id
    WHERE cpc.portal_access_enabled = true
    ORDER BY c.created_at DESC
    LIMIT 1
)
ORDER BY created_at DESC;
