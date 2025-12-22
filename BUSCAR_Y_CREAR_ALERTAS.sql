-- =====================================================
-- PASO 1: BUSCAR ID CORRECTO DEL CLIENTE
-- =====================================================

SELECT 
    id,
    full_name,
    email,
    phone,
    document_number,
    created_at
FROM clients
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- COPIA EL ID (UUID) DEL CLIENTE QUE QUIERAS PROBAR
-- Y REEMPLAZA 'PEGA_AQUI_EL_UUID' EN EL SCRIPT DE ABAJO
-- =====================================================

-- Ejemplo de cómo debería verse:
-- '12345678-1234-1234-1234-123456789abc'

-- =====================================================
-- SCRIPT DE ALERTAS CON PLACEHOLDER
-- Reemplaza 'PEGA_AQUI_EL_UUID' con el ID real
-- =====================================================

-- Alerta 1: ALTA SEVERIDAD - Pago próximo a vencer (3 días)
INSERT INTO client_alerts (
    client_id,
    alert_type,
    severity,
    title,
    message,
    action_url,
    expires_at
) VALUES (
    'PEGA_AQUI_EL_UUID'::UUID,
    'payment_reminder',
    'high',
    '💰 Pago Próximo a Vencer',
    'Tu pago de arriendo vence en 3 días (25 de Diciembre). El monto es de $18,500.00',
    '/cliente/pagos',
    NOW() + INTERVAL '7 days'
);

-- Alerta 2: ALTA SEVERIDAD - Pago vencido
INSERT INTO client_alerts (
    client_id,
    alert_type,
    severity,
    title,
    message,
    action_url,
    expires_at
) VALUES (
    'PEGA_AQUI_EL_UUID'::UUID,
    'payment_overdue',
    'high',
    '⚠️ Pago Vencido',
    'Tienes un pago vencido desde el 15 de Diciembre por $18,500.00. Por favor realiza el pago lo antes posible.',
    '/cliente/pagos',
    NOW() + INTERVAL '30 days'
);

-- Alerta 3: MEDIA SEVERIDAD - Documento por expirar
INSERT INTO client_alerts (
    client_id,
    alert_type,
    severity,
    title,
    message,
    action_url,
    expires_at
) VALUES (
    'PEGA_AQUI_EL_UUID'::UUID,
    'document_expiring',
    'medium',
    '📄 Documento Próximo a Expirar',
    'Tu cédula de identidad expira en 30 días. Por favor actualiza tus documentos.',
    '/cliente/documentos',
    NOW() + INTERVAL '45 days'
);

-- Alerta 4: ALTA SEVERIDAD - Contrato próximo a vencer
INSERT INTO client_alerts (
    client_id,
    alert_type,
    severity,
    title,
    message,
    action_url,
    expires_at
) VALUES (
    'PEGA_AQUI_EL_UUID'::UUID,
    'contract_expiring',
    'high',
    '📋 Contrato por Vencer',
    'Tu contrato de arriendo vence en 15 días. Contacta con nosotros para renovar.',
    '/cliente/contratos',
    NOW() + INTERVAL '30 days'
);

-- Alerta 5: BAJA SEVERIDAD - Información general
INSERT INTO client_alerts (
    client_id,
    alert_type,
    severity,
    title,
    message,
    action_url
) VALUES (
    'PEGA_AQUI_EL_UUID'::UUID,
    'general',
    'low',
    'ℹ️ Actualización del Sistema',
    'Hemos actualizado nuestro portal de clientes con nuevas funcionalidades. Explora las mejoras en tu dashboard.',
    '/cliente/dashboard'
);

-- Alerta 6: ALTA SEVERIDAD - Alerta urgente
INSERT INTO client_alerts (
    client_id,
    alert_type,
    severity,
    title,
    message,
    action_url,
    expires_at
) VALUES (
    'PEGA_AQUI_EL_UUID'::UUID,
    'urgent',
    'high',
    '🚨 Acción Requerida Inmediatamente',
    'Se requiere tu firma en el contrato de renovación. Por favor acude a nuestras oficinas antes del 28 de Diciembre.',
    '/cliente/contratos',
    NOW() + INTERVAL '5 days'
);

-- Alerta 7: MEDIA SEVERIDAD - Recordatorio de pago (ya leída)
INSERT INTO client_alerts (
    client_id,
    alert_type,
    severity,
    title,
    message,
    action_url,
    is_read,
    read_at
) VALUES (
    'PEGA_AQUI_EL_UUID'::UUID,
    'payment_reminder',
    'medium',
    '💰 Recordatorio de Pago',
    'Recuerda que tu próximo pago vence el 5 de Enero 2026.',
    '/cliente/pagos',
    true,
    NOW() - INTERVAL '2 hours'
);

-- Alerta 8: BAJA SEVERIDAD - Información (ya leída)
INSERT INTO client_alerts (
    client_id,
    alert_type,
    severity,
    title,
    message,
    is_read,
    read_at
) VALUES (
    'PEGA_AQUI_EL_UUID'::UUID,
    'general',
    'low',
    'ℹ️ Horario de Atención Navidad',
    'Durante las fiestas navideñas (24-25 Dic) nuestras oficinas permanecerán cerradas. Retomaremos el 26 de Diciembre.',
    true,
    NOW() - INTERVAL '1 day'
);

-- =====================================================
-- VERIFICAR QUE SE CREARON
-- =====================================================

SELECT 
    id,
    alert_type,
    severity,
    title,
    is_read,
    expires_at,
    created_at
FROM client_alerts
WHERE client_id = 'PEGA_AQUI_EL_UUID'::UUID
ORDER BY created_at DESC;

-- =====================================================
-- VERIFICAR CONTADORES
-- =====================================================

SELECT 
    COUNT(*) as total_alertas,
    SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END) as no_leidas,
    SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as alta_severidad,
    SUM(CASE WHEN alert_type = 'urgent' THEN 1 ELSE 0 END) as urgentes,
    SUM(CASE WHEN expires_at IS NOT NULL AND expires_at > NOW() THEN 1 ELSE 0 END) as con_expiracion
FROM client_alerts
WHERE client_id = 'PEGA_AQUI_EL_UUID'::UUID;

-- Debería mostrar: 8 totales, 6 no leídas, 4 alta severidad, 1 urgente

-- =====================================================
-- BUSCAR CREDENCIALES DEL CLIENTE PARA LOGIN
-- =====================================================

SELECT 
    cpc.email,
    c.full_name,
    cpc.must_change_password,
    cpc.portal_access_enabled
FROM client_portal_credentials cpc
JOIN clients c ON c.id = cpc.client_id
WHERE cpc.client_id = 'PEGA_AQUI_EL_UUID'::UUID;

-- =====================================================
-- SI NO APARECEN ALERTAS EN EL PORTAL:
-- 1. Verifica que el cliente tenga credenciales de portal
-- 2. Verifica que estés logueado con ese cliente
-- 3. Revisa la consola del navegador (F12) por errores
-- 4. Habilita Realtime en Supabase Dashboard
-- =====================================================

-- =====================================================
-- LIMPIAR ALERTAS DE PRUEBA (OPCIONAL)
-- =====================================================

-- DELETE FROM client_alerts WHERE client_id = 'PEGA_AQUI_EL_UUID'::UUID;
