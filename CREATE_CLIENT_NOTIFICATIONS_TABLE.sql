-- =====================================================
-- TABLA: client_notifications
-- Sistema de Notificaciones para Portal de Clientes
-- =====================================================

CREATE TABLE IF NOT EXISTS client_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Tipo de notificación
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'payment_due',          -- Pago próximo a vencer
        'payment_overdue',      -- Pago vencido
        'contract_expiring',    -- Contrato próximo a vencer
        'new_document',         -- Nuevo documento disponible
        'admin_message',        -- Mensaje del administrador
        'payment_received',     -- Pago recibido confirmado
        'maintenance_scheduled' -- Mantenimiento programado
    )),
    
    -- Contenido
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Referencias relacionadas (opcionales)
    related_payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    related_contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    related_document_id UUID REFERENCES client_documents(id) ON DELETE CASCADE,
    
    -- Estado
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    
    -- Prioridad
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    
    -- Índices para mejorar performance
    CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Buscar notificaciones por cliente y estado
CREATE INDEX IF NOT EXISTS idx_client_notifications_client_id ON client_notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notifications_is_read ON client_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_client_notifications_is_dismissed ON client_notifications(is_dismissed);
CREATE INDEX IF NOT EXISTS idx_client_notifications_created_at ON client_notifications(created_at DESC);

-- Índice compuesto para queries comunes (cliente + no leídas)
CREATE INDEX IF NOT EXISTS idx_client_notifications_client_unread 
ON client_notifications(client_id, is_read) 
WHERE is_dismissed = FALSE;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- NOTA: El Portal de Clientes usa autenticación personalizada con localStorage,
-- no Supabase Auth. Por eso usamos políticas permisivas y filtramos en el cliente.

ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Permitir acceso público para SELECT
-- El filtrado por client_id se hace en las consultas del cliente
CREATE POLICY "Allow public select on notifications"
ON client_notifications
FOR SELECT
USING (true);

-- Policy: Permitir actualización pública (UPDATE)
-- Las funciones RPC (mark_notification_as_read, etc.) manejan la seguridad
CREATE POLICY "Allow public update on notifications"
ON client_notifications
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy: Solo permitir INSERT desde funciones RPC o admins
-- Los clientes no crean notificaciones directamente
CREATE POLICY "Allow insert from functions"
ON client_notifications
FOR INSERT
WITH CHECK (true);

-- Policy: Permitir DELETE solo para limpieza de funciones
CREATE POLICY "Allow delete from functions"
ON client_notifications
FOR DELETE
USING (true);

-- =====================================================
-- FUNCIÓN: Crear notificación automática
-- =====================================================

CREATE OR REPLACE FUNCTION create_client_notification(
    p_client_id UUID,
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_related_payment_id UUID DEFAULT NULL,
    p_related_contract_id UUID DEFAULT NULL,
    p_related_document_id UUID DEFAULT NULL,
    p_priority VARCHAR DEFAULT 'normal'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO client_notifications (
        client_id,
        type,
        title,
        message,
        related_payment_id,
        related_contract_id,
        related_document_id,
        priority
    ) VALUES (
        p_client_id,
        p_type,
        p_title,
        p_message,
        p_related_payment_id,
        p_related_contract_id,
        p_related_document_id,
        p_priority
    )
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;

-- =====================================================
-- FUNCIÓN: Marcar como leída
-- =====================================================

CREATE OR REPLACE FUNCTION mark_notification_as_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE client_notifications
    SET is_read = TRUE,
        read_at = NOW()
    WHERE id = p_notification_id
    AND is_read = FALSE;
    
    RETURN FOUND;
END;
$$;

-- =====================================================
-- FUNCIÓN: Marcar todas como leídas
-- =====================================================

CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(p_client_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE client_notifications
    SET is_read = TRUE,
        read_at = NOW()
    WHERE client_id = p_client_id
    AND is_read = FALSE
    AND is_dismissed = FALSE;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- =====================================================
-- FUNCIÓN: Descartar notificación
-- =====================================================

CREATE OR REPLACE FUNCTION dismiss_notification(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE client_notifications
    SET is_dismissed = TRUE,
        dismissed_at = NOW()
    WHERE id = p_notification_id;
    
    RETURN FOUND;
END;
$$;

-- =====================================================
-- FUNCIÓN: Limpiar notificaciones antiguas (30 días)
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM client_notifications
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND (is_dismissed = TRUE OR is_read = TRUE);
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- =====================================================
-- TRIGGER: Notificación cuando se crea un nuevo documento
-- =====================================================

CREATE OR REPLACE FUNCTION notify_new_document()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_client_id UUID;
    v_property_name VARCHAR;
BEGIN
    -- Obtener el client_id desde el contrato relacionado con el documento
    SELECT c.client_id, p.name
    INTO v_client_id, v_property_name
    FROM contracts c
    JOIN properties p ON c.property_id = p.id
    WHERE c.id = NEW.contract_id;
    
    IF v_client_id IS NOT NULL THEN
        PERFORM create_client_notification(
            v_client_id,
            'new_document',
            '📄 Nuevo Documento Disponible',
            'Se ha subido un nuevo documento para la propiedad ' || COALESCE(v_property_name, 'tu propiedad') || '. Puedes revisarlo en la sección de Documentos.',
            NULL,
            NEW.contract_id,
            NEW.id,
            'normal'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_new_document ON client_documents;
CREATE TRIGGER trigger_notify_new_document
AFTER INSERT ON client_documents
FOR EACH ROW
EXECUTE FUNCTION notify_new_document();

-- =====================================================
-- TRIGGER: Notificación cuando se recibe un pago
-- =====================================================

CREATE OR REPLACE FUNCTION notify_payment_received()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_client_id UUID;
    v_property_name VARCHAR;
    v_amount DECIMAL;
BEGIN
    -- Solo notificar cuando el estado cambia a 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        SELECT c.client_id, p.name, NEW.amount
        INTO v_client_id, v_property_name, v_amount
        FROM contracts c
        JOIN properties p ON c.property_id = p.id
        WHERE c.id = NEW.contract_id;
        
        IF v_client_id IS NOT NULL THEN
            PERFORM create_client_notification(
                v_client_id,
                'payment_received',
                '✅ Pago Recibido',
                'Se ha confirmado el pago de $' || TO_CHAR(v_amount, 'FM999,999,990.00') || 
                ' para ' || COALESCE(v_property_name, 'tu propiedad') || 
                '. Puedes ver los detalles en la sección de Pagos.',
                NEW.id,
                NEW.contract_id,
                NULL,
                'normal'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_payment_received ON payments;
CREATE TRIGGER trigger_notify_payment_received
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION notify_payment_received();

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE client_notifications IS 'Sistema de notificaciones en tiempo real para el Portal de Clientes';
COMMENT ON COLUMN client_notifications.type IS 'Tipo de notificación: payment_due, contract_expiring, new_document, etc.';
COMMENT ON COLUMN client_notifications.priority IS 'Prioridad de la notificación: low, normal, high, urgent';
COMMENT ON COLUMN client_notifications.is_read IS 'TRUE si el cliente ha leído la notificación';
COMMENT ON COLUMN client_notifications.is_dismissed IS 'TRUE si el cliente ha descartado la notificación';

-- =====================================================
-- DATOS DE PRUEBA (Opcional - Comentar en producción)
-- =====================================================

-- Crear algunas notificaciones de ejemplo para el cliente de prueba (Carlos)
-- UNCOMMENT BELOW FOR TESTING:
/*
SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'payment_due',
    '⏰ Pago Próximo a Vencer',
    'Tu pago mensual de diciembre vence en 5 días. Recuerda realizar el pago a tiempo para evitar recargos.',
    NULL,
    NULL,
    NULL,
    'high'
);

SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'new_document',
    '📄 Nuevo Documento Disponible',
    'Se ha subido el contrato actualizado de tu propiedad. Puedes revisarlo en la sección de Documentos.',
    NULL,
    NULL,
    NULL,
    'normal'
);

SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'admin_message',
    '💬 Mensaje del Administrador',
    'Estimado propietario, le informamos que se realizará mantenimiento en el edificio el próximo sábado de 9:00 a 13:00.',
    NULL,
    NULL,
    NULL,
    'normal'
);
*/
