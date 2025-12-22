-- =====================================================
-- CREAR ALERTAS DE PRUEBA PARA ADMINISTRADORES
-- Script automático - No requiere edición manual
-- =====================================================

DO $$
DECLARE
    v_admin_id UUID;
    v_admin_name TEXT;
    v_admin_email TEXT;
BEGIN
    -- =====================================================
    -- PASO 1: Encontrar primer usuario administrador
    -- =====================================================
    
    SELECT id, full_name, email
    INTO v_admin_id, v_admin_name, v_admin_email
    FROM user_profiles
    WHERE role IN ('admin', 'super_admin')
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION '❌ No se encontró ningún usuario administrador';
    END IF;

    RAISE NOTICE '✅ Usuario administrador encontrado:';
    RAISE NOTICE '   ID: %', v_admin_id;
    RAISE NOTICE '   Nombre: %', v_admin_name;
    RAISE NOTICE '   Email: %', v_admin_email;
    RAISE NOTICE '';

    -- =====================================================
    -- PASO 2: Crear alertas de prueba variadas
    -- =====================================================

    -- 1. Nueva cita agendada (ALTA SEVERIDAD, NO LEÍDA)
    INSERT INTO admin_alerts (
        user_id, alert_type, severity, title, message, action_url,
        related_appointment_id, is_read, expires_at
    ) VALUES (
        v_admin_id,
        'new_appointment',
        'high',
        '📅 Nueva Cita Agendada',
        'Juan Pérez ha agendado una cita para visitar la propiedad "Oficina Premium Centro" el 15 de diciembre a las 10:00 AM.',
        '/admin/appointments',
        NULL,
        false,
        NOW() + INTERVAL '7 days'
    );

    -- 2. Pago vencido (ALTA SEVERIDAD, NO LEÍDA)
    INSERT INTO admin_alerts (
        user_id, alert_type, severity, title, message, action_url,
        related_client_id, is_read, expires_at
    ) VALUES (
        v_admin_id,
        'payment_overdue',
        'high',
        '⚠️ Pago Vencido - Urgente',
        'El cliente "María González" tiene un pago vencido desde hace 15 días por $25,000. Contactar inmediatamente.',
        '/admin/clients',
        NULL,
        false,
        NOW() + INTERVAL '3 days'
    );

    -- 3. Contrato por vencer (MEDIA SEVERIDAD, NO LEÍDA)
    INSERT INTO admin_alerts (
        user_id, alert_type, severity, title, message, action_url,
        related_client_id, is_read, expires_at
    ) VALUES (
        v_admin_id,
        'contract_expiring',
        'medium',
        '📄 Contrato Próximo a Vencer',
        'El contrato de "Carlos Rodríguez" para la propiedad "Sala de Juntas B" vence en 30 días. Considerar renovación.',
        '/admin/clients',
        NULL,
        false,
        NOW() + INTERVAL '30 days'
    );

    -- 4. Nueva consulta de servicio (MEDIA SEVERIDAD, NO LEÍDA)
    INSERT INTO admin_alerts (
        user_id, alert_type, severity, title, message, action_url,
        is_read, expires_at
    ) VALUES (
        v_admin_id,
        'new_inquiry',
        'medium',
        '💬 Nueva Consulta de Servicio',
        'Laura Martínez está interesada en el plan "Espacio Flexible". Requiere atención en las próximas 24 horas.',
        '/admin/service-inquiries',
        false,
        NOW() + INTERVAL '2 days'
    );

    -- 5. Nuevo cliente registrado (BAJA SEVERIDAD, NO LEÍDA)
    INSERT INTO admin_alerts (
        user_id, alert_type, severity, title, message, action_url,
        is_read
    ) VALUES (
        v_admin_id,
        'new_client',
        'low',
        '👤 Nuevo Cliente Registrado',
        'Roberto Sánchez se ha registrado en el portal de clientes. Bienvenida pendiente.',
        '/admin/clients',
        false
    );

    -- 6. Pago recibido (BAJA SEVERIDAD, NO LEÍDA)
    INSERT INTO admin_alerts (
        user_id, alert_type, severity, title, message, action_url,
        is_read
    ) VALUES (
        v_admin_id,
        'payment_received',
        'low',
        '💰 Pago Recibido',
        'Se ha recibido el pago de $15,000 de "Ana López" correspondiente al mes de diciembre.',
        '/admin/clients',
        false
    );

    -- 7. Tarea asignada (MEDIA SEVERIDAD, NO LEÍDA)
    INSERT INTO admin_alerts (
        user_id, alert_type, severity, title, message, action_url,
        is_read, expires_at
    ) VALUES (
        v_admin_id,
        'task_assigned',
        'medium',
        '📋 Nueva Tarea Asignada',
        'Se te ha asignado la tarea: "Actualizar contrato de Oficina 305". Fecha límite: 20 de diciembre.',
        '/admin/dashboard',
        false,
        NOW() + INTERVAL '5 days'
    );

    -- 8. Propiedad inactiva (BAJA SEVERIDAD, NO LEÍDA)
    INSERT INTO admin_alerts (
        user_id, alert_type, severity, title, message, action_url,
        related_property_id, is_read
    ) VALUES (
        v_admin_id,
        'property_inactive',
        'low',
        '🏢 Propiedad Inactiva',
        'La propiedad "Oficina 201" ha estado inactiva por más de 60 días. Considerar actualizar o remover.',
        '/admin/properties',
        NULL,
        false
    );

    -- 9. Alerta del sistema (ALTA SEVERIDAD, NO LEÍDA, EXPIRA PRONTO - 12 horas)
    INSERT INTO admin_alerts (
        user_id, alert_type, severity, title, message, action_url,
        is_read, expires_at
    ) VALUES (
        v_admin_id,
        'system_alert',
        'high',
        '🔔 Mantenimiento Programado',
        'El sistema estará en mantenimiento el 18 de diciembre de 2:00 AM a 4:00 AM. Notificar a los clientes.',
        '/admin/dashboard',
        false,
        NOW() + INTERVAL '12 hours'  -- Esta expirará pronto (badge naranja)
    );

    -- 10. Cita cancelada (MEDIA SEVERIDAD, LEÍDA)
    INSERT INTO admin_alerts (
        user_id, alert_type, severity, title, message, action_url,
        is_read, read_at
    ) VALUES (
        v_admin_id,
        'appointment_cancelled',
        'medium',
        '❌ Cita Cancelada',
        'Pedro Ramírez ha cancelado su cita del 10 de diciembre para la Sala de Conferencias A.',
        '/admin/appointments',
        true,
        NOW() - INTERVAL '1 hour'
    );

    -- 11. Pago recibido anterior (BAJA SEVERIDAD, LEÍDA)
    INSERT INTO admin_alerts (
        user_id, alert_type, severity, title, message, action_url,
        is_read, read_at
    ) VALUES (
        v_admin_id,
        'payment_received',
        'low',
        '💰 Pago Anterior Procesado',
        'El pago de $10,000 de "Sofía Torres" fue procesado exitosamente.',
        '/admin/clients',
        true,
        NOW() - INTERVAL '2 days'
    );

    -- =====================================================
    -- PASO 3: Verificar creación
    -- =====================================================

    RAISE NOTICE '';
    RAISE NOTICE '✅ ¡11 alertas creadas exitosamente!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 RESUMEN DE ALERTAS CREADAS:';
    RAISE NOTICE '   • 9 alertas NO LEÍDAS';
    RAISE NOTICE '   • 2 alertas LEÍDAS';
    RAISE NOTICE '';
    RAISE NOTICE '📈 POR SEVERIDAD:';
    RAISE NOTICE '   • Alta: 3 alertas (🔴)';
    RAISE NOTICE '   • Media: 4 alertas (🟡)';
    RAISE NOTICE '   • Baja: 4 alertas (🔵)';
    RAISE NOTICE '';
    RAISE NOTICE '📋 POR TIPO:';
    RAISE NOTICE '   • Nueva Cita: 1';
    RAISE NOTICE '   • Cita Cancelada: 1';
    RAISE NOTICE '   • Nuevo Cliente: 1';
    RAISE NOTICE '   • Pago Recibido: 2';
    RAISE NOTICE '   • Pago Vencido: 1';
    RAISE NOTICE '   • Contrato Vence: 1';
    RAISE NOTICE '   • Nueva Consulta: 1';
    RAISE NOTICE '   • Propiedad Inactiva: 1';
    RAISE NOTICE '   • Alerta del Sistema: 1';
    RAISE NOTICE '   • Tarea Asignada: 1';
    RAISE NOTICE '';
    RAISE NOTICE '🔔 ALERTA ESPECIAL:';
    RAISE NOTICE '   • 1 alerta expira en menos de 24 horas (badge naranja)';
    RAISE NOTICE '';
    RAISE NOTICE '👤 ACCESO AL SISTEMA:';
    RAISE NOTICE '   📧 Email: %', v_admin_email;
    RAISE NOTICE '   🔑 Usa tu contraseña de admin para iniciar sesión';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Ve a /admin/alerts para ver todas las alertas';
    RAISE NOTICE '✅ El badge mostrará 9 alertas no leídas';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR: %', SQLERRM;
        RAISE EXCEPTION 'Falló la creación de alertas';
END $$;

-- =====================================================
-- CONSULTA FINAL: Ver alertas creadas
-- =====================================================

SELECT 
    aa.id,
    aa.alert_type,
    aa.severity,
    aa.title,
    aa.is_read,
    CASE 
        WHEN aa.expires_at IS NOT NULL AND aa.expires_at < NOW() + INTERVAL '24 hours' 
        THEN '⚠️ EXPIRA PRONTO'
        ELSE '✅ OK'
    END as estado_expiracion,
    aa.created_at
FROM admin_alerts aa
ORDER BY aa.created_at DESC
LIMIT 20;

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================
