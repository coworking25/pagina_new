-- =====================================================
-- SISTEMA DE NOTIFICACIONES PARA ADMIN
-- Similar al Portal de Clientes pero para usuarios admin
-- =====================================================

-- 1. CREAR TABLA DE NOTIFICACIONES PARA ADMIN
DROP TABLE IF EXISTS admin_notifications CASCADE;

CREATE TABLE admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'new_appointment',
        'appointment_cancelled',
        'appointment_rescheduled',
        'new_client',
        'payment_received',
        'payment_overdue',
        'contract_expiring',
        'contract_expired',
        'new_property',
        'property_inactive',
        'new_inquiry',
        'system_alert',
        'task_assigned'
    )),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    related_client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    related_property_id BIGINT REFERENCES properties(id) ON DELETE CASCADE,
    related_payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    related_contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE
);

-- 2. CREAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_admin_notifications_user_id ON admin_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_priority ON admin_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_user_unread ON admin_notifications(user_id, is_read) WHERE is_read = FALSE;

-- 3. HABILITAR RLS
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS RLS (permisivas para admin)
DROP POLICY IF EXISTS "Allow public select on admin notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Allow public update on admin notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Allow public insert on admin notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Allow public delete on admin notifications" ON admin_notifications;

CREATE POLICY "Allow public select on admin notifications"
ON admin_notifications FOR SELECT
USING (true);

CREATE POLICY "Allow public update on admin notifications"
ON admin_notifications FOR UPDATE
USING (true);

CREATE POLICY "Allow public insert on admin notifications"
ON admin_notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public delete on admin notifications"
ON admin_notifications FOR DELETE
USING (true);

-- 5. FUNCIÓN: Crear notificación
CREATE OR REPLACE FUNCTION create_admin_notification(
    p_user_id UUID,
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_related_appointment_id UUID DEFAULT NULL,
    p_related_client_id UUID DEFAULT NULL,
    p_related_property_id BIGINT DEFAULT NULL,
    p_related_payment_id UUID DEFAULT NULL,
    p_related_contract_id UUID DEFAULT NULL,
    p_priority VARCHAR DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO admin_notifications (
        user_id,
        type,
        title,
        message,
        related_appointment_id,
        related_client_id,
        related_property_id,
        related_payment_id,
        related_contract_id,
        priority
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_related_appointment_id,
        p_related_client_id,
        p_related_property_id,
        p_related_payment_id,
        p_related_contract_id,
        p_priority
    )
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- 6. FUNCIÓN: Marcar como leída
CREATE OR REPLACE FUNCTION mark_admin_notification_as_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE admin_notifications
    SET is_read = TRUE,
        read_at = NOW()
    WHERE id = p_notification_id
    AND is_read = FALSE;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 7. FUNCIÓN: Marcar todas como leídas
CREATE OR REPLACE FUNCTION mark_all_admin_notifications_as_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    UPDATE admin_notifications
    SET is_read = TRUE,
        read_at = NOW()
    WHERE user_id = p_user_id
    AND is_read = FALSE;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- 8. FUNCIÓN: Descartar notificación
CREATE OR REPLACE FUNCTION dismiss_admin_notification(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE admin_notifications
    SET is_dismissed = TRUE,
        dismissed_at = NOW()
    WHERE id = p_notification_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 9. FUNCIÓN: Limpiar notificaciones antiguas (30+ días)
CREATE OR REPLACE FUNCTION cleanup_old_admin_notifications()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM admin_notifications
    WHERE (is_dismissed = TRUE OR is_read = TRUE)
    AND created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 10. FUNCIÓN: Crear notificación para todos los admins
CREATE OR REPLACE FUNCTION create_notification_for_all_admins(
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_priority VARCHAR DEFAULT 'normal'
)
RETURNS INTEGER AS $$
DECLARE
    v_admin_record RECORD;
    v_count INTEGER := 0;
BEGIN
    -- Iterar sobre todos los usuarios con role 'admin'
    FOR v_admin_record IN 
        SELECT id FROM user_profiles WHERE role = 'admin'
    LOOP
        PERFORM create_admin_notification(
            v_admin_record.id,
            p_type,
            p_title,
            p_message,
            NULL, NULL, NULL, NULL, NULL,
            p_priority
        );
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS AUTOMÁTICOS
-- =====================================================

-- TRIGGER 1: Notificar cuando se crea una nueva cita
DROP TRIGGER IF EXISTS trigger_notify_new_appointment ON appointments;
DROP FUNCTION IF EXISTS notify_new_appointment();

CREATE OR REPLACE FUNCTION notify_new_appointment()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_record RECORD;
    v_client_name TEXT;
    v_property_code TEXT;
BEGIN
    -- Obtener nombre del cliente
    SELECT full_name INTO v_client_name
    FROM clients
    WHERE id = NEW.client_id;
    
    -- Obtener código de propiedad
    SELECT property_code INTO v_property_code
    FROM properties
    WHERE id = NEW.property_id;
    
    -- Crear notificación para todos los admins
    FOR v_admin_record IN 
        SELECT id FROM user_profiles WHERE role = 'admin'
    LOOP
        PERFORM create_admin_notification(
            v_admin_record.id,
            'new_appointment',
            '📅 Nueva Cita Agendada',
            format('Nueva cita con %s para la propiedad %s el %s',
                COALESCE(v_client_name, 'Cliente'),
                COALESCE(v_property_code, 'Propiedad'),
                TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY HH24:MI')
            ),
            NEW.id,
            NEW.client_id,
            NEW.property_id,
            NULL,
            NULL,
            'normal'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_appointment
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION notify_new_appointment();

-- TRIGGER 2: Notificar cuando se cancela una cita
DROP TRIGGER IF EXISTS trigger_notify_cancelled_appointment ON appointments;
DROP FUNCTION IF EXISTS notify_cancelled_appointment();

CREATE OR REPLACE FUNCTION notify_cancelled_appointment()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_record RECORD;
    v_client_name TEXT;
BEGIN
    -- Solo si cambió a cancelled
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        SELECT full_name INTO v_client_name
        FROM clients
        WHERE id = NEW.client_id;
        
        FOR v_admin_record IN 
            SELECT id FROM system_users WHERE role = 'admin'
        LOOP
            PERFORM create_admin_notification(
                v_admin_record.id,
                'appointment_cancelled',
                '❌ Cita Cancelada',
                format('La cita con %s programada para %s ha sido cancelada',
                    COALESCE(v_client_name, 'Cliente'),
                    TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY HH24:MI')
                ),
                NEW.id,
                NEW.client_id,
                NEW.property_id,
                NULL,
                NULL,
                'high'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_cancelled_appointment
AFTER UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION notify_cancelled_appointment();

-- TRIGGER 3: Notificar cuando se recibe un pago
DROP TRIGGER IF EXISTS trigger_notify_payment_received ON payments;
DROP FUNCTION IF EXISTS notify_payment_received_admin();

CREATE OR REPLACE FUNCTION notify_payment_received_admin()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_record RECORD;
    v_client_name TEXT;
BEGIN
    -- Solo cuando el status cambia a 'completed'
    IF (TG_OP = 'INSERT' AND NEW.status = 'completed') OR
       (TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed') THEN
        
        SELECT full_name INTO v_client_name
        FROM clients
        WHERE id = NEW.client_id;
        
        FOR v_admin_record IN 
            SELECT id FROM system_users WHERE role = 'admin'
        LOOP
            PERFORM create_admin_notification(
                v_admin_record.id,
                'payment_received',
                '💰 Pago Recibido',
                format('Se ha recibido el pago de $%s de %s',
                    TO_CHAR(NEW.amount, 'FM999,999,999.00'),
                    COALESCE(v_client_name, 'Cliente')
                ),
                NULL,
                NEW.client_id,
                NULL,
                NEW.id,
                NEW.contract_id,
                'normal'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_payment_received
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION notify_payment_received_admin();

-- TRIGGER 4: Notificar cuando se crea un nuevo cliente
DROP TRIGGER IF EXISTS trigger_notify_new_client ON clients;
DROP FUNCTION IF EXISTS notify_new_client();

CREATE OR REPLACE FUNCTION notify_new_client()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_record RECORD;
BEGIN
    FOR v_admin_record IN 
        SELECT id FROM system_users WHERE role = 'admin'
    LOOP
        PERFORM create_admin_notification(
            v_admin_record.id,
            'new_client',
            '👤 Nuevo Cliente Registrado',
            format('Se ha registrado un nuevo cliente: %s (%s)',
                NEW.full_name,
                NEW.email
            ),
            NULL,
            NEW.id,
            NULL,
            NULL,
            NULL,
            'normal'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_client
AFTER INSERT ON clients
FOR EACH ROW
EXECUTE FUNCTION notify_new_client();

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE admin_notifications IS 'Notificaciones para usuarios administradores del sistema';
COMMENT ON COLUMN admin_notifications.type IS 'Tipo de notificación: new_appointment, payment_received, etc.';
COMMENT ON COLUMN admin_notifications.priority IS 'Prioridad: low, normal, high, urgent';
COMMENT ON FUNCTION create_admin_notification IS 'Crear una notificación para un administrador específico';
COMMENT ON FUNCTION create_notification_for_all_admins IS 'Crear una notificación para todos los administradores';

-- =====================================================
-- MENSAJE DE ÉXITO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Tabla admin_notifications creada exitosamente';
    RAISE NOTICE '✅ 5 funciones SQL creadas';
    RAISE NOTICE '✅ 4 triggers automáticos creados';
    RAISE NOTICE '✅ 6 índices creados para mejor rendimiento';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Siguiente paso: Ejecutar el archivo TypeScript para integración';
END $$;
