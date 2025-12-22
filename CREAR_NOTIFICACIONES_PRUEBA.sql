-- =====================================================
-- CREAR 8 NOTIFICACIONES DE PRUEBA PARA SANTIAGO SANCHEZ
-- Ejecuta este script completo en Supabase SQL Editor
-- =====================================================

-- Notificación 1: URGENTE - Nueva cita
SELECT create_admin_notification(
    '9ef7a833-c6f3-4627-9866-3ce9e8fa782b'::UUID,
    'new_appointment',
    '📅 Nueva Cita Urgente',
    'Nueva cita agendada con Carlos Propietario para hoy a las 3:00 PM en Departamento Centro',
    NULL, NULL, NULL, NULL, NULL,
    'urgent'
);

-- Notificación 2: ALTA - Cita cancelada
SELECT create_admin_notification(
    '9ef7a833-c6f3-4627-9866-3ce9e8fa782b'::UUID,
    'appointment_cancelled',
    '❌ Cita Cancelada',
    'La cita con María García programada para mañana ha sido cancelada por el cliente',
    NULL, NULL, NULL, NULL, NULL,
    'high'
);

-- Notificación 3: NORMAL - Pago recibido
SELECT create_admin_notification(
    '9ef7a833-c6f3-4627-9866-3ce9e8fa782b'::UUID,
    'payment_received',
    '💰 Pago Recibido',
    'Se ha recibido el pago de $18,500.00 de Carlos Propietario para el mes de Diciembre 2025',
    NULL, NULL, NULL, NULL, NULL,
    'normal'
);

-- Notificación 4: ALTA - Pago atrasado
SELECT create_admin_notification(
    '9ef7a833-c6f3-4627-9866-3ce9e8fa782b'::UUID,
    'payment_overdue',
    '⚠️ Pago Atrasado',
    'El cliente Juan Pérez tiene un pago vencido hace 5 días por $25,000.00',
    NULL, NULL, NULL, NULL, NULL,
    'high'
);

-- Notificación 5: NORMAL - Nuevo cliente
SELECT create_admin_notification(
    '9ef7a833-c6f3-4627-9866-3ce9e8fa782b'::UUID,
    'new_client',
    '👤 Nuevo Cliente Registrado',
    'Se ha registrado un nuevo cliente: Ana Martínez (ana.martinez@example.com)',
    NULL, NULL, NULL, NULL, NULL,
    'normal'
);

-- Notificación 6: ALTA - Contrato por vencer
SELECT create_admin_notification(
    '9ef7a833-c6f3-4627-9866-3ce9e8fa782b'::UUID,
    'contract_expiring',
    '📋 Contrato por Vencer',
    'El contrato del cliente Pedro López vence en 15 días. Contactar para renovación.',
    NULL, NULL, NULL, NULL, NULL,
    'high'
);

-- Notificación 7: NORMAL - Nueva consulta
SELECT create_admin_notification(
    '9ef7a833-c6f3-4627-9866-3ce9e8fa782b'::UUID,
    'new_inquiry',
    '💬 Nueva Consulta de Servicio',
    'Nueva consulta recibida: "Estoy interesado en rentar un departamento en la zona centro"',
    NULL, NULL, NULL, NULL, NULL,
    'normal'
);

-- Notificación 8: BAJA - Nueva propiedad
SELECT create_admin_notification(
    '9ef7a833-c6f3-4627-9866-3ce9e8fa782b'::UUID,
    'new_property',
    '🏠 Nueva Propiedad Agregada',
    'Se ha agregado la propiedad "Casa Moderna en Las Condes" al sistema',
    NULL, NULL, NULL, NULL, NULL,
    'low'
);

-- =====================================================
-- VERIFICAR QUE SE CREARON
-- =====================================================

SELECT 
    id,
    type,
    title,
    priority,
    is_read,
    created_at
FROM admin_notifications
WHERE user_id = '9ef7a833-c6f3-4627-9866-3ce9e8fa782b'::UUID
ORDER BY created_at DESC;

-- =====================================================
-- VERIFICAR CONTADORES
-- =====================================================

SELECT 
    COUNT(*) as total_notificaciones,
    SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as no_leidas,
    SUM(CASE WHEN priority IN ('high', 'urgent') THEN 1 ELSE 0 END) as prioritarias,
    SUM(CASE WHEN is_dismissed = TRUE THEN 1 ELSE 0 END) as descartadas
FROM admin_notifications
WHERE user_id = '9ef7a833-c6f3-4627-9866-3ce9e8fa782b'::UUID;

-- Debería mostrar: 8 totales, 8 no leídas, 4 prioritarias, 0 descartadas

-- =====================================================
-- MENSAJE DE ÉXITO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 8 notificaciones creadas para Santiago Sanchez';
    RAISE NOTICE '📱 Ahora abre http://localhost:5173/login';
    RAISE NOTICE '🔐 Login: santiagosanchezcoworking@gmail.com';
    RAISE NOTICE '🔔 Deberías ver el badge con "8" en la campana';
END $$;
