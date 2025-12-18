-- =====================================================
-- SISTEMA DE ALERTAS AUTOMÁTICAS DE PAGOS
-- Integrado con payment_schedules
-- =====================================================

-- 1. Tabla para configurar alertas de pagos
CREATE TABLE IF NOT EXISTS payment_alert_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Canales de notificación
  email_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  
  -- Configuración de alertas
  days_before_due INTEGER[] DEFAULT ARRAY[7, 3, 1], -- Alertar 7, 3 y 1 día antes
  send_on_due_date BOOLEAN DEFAULT true,
  send_overdue_alerts BOOLEAN DEFAULT true,
  overdue_alert_frequency INTEGER DEFAULT 3, -- Cada 3 días si está vencido
  
  -- Horario de envío
  preferred_time TIME DEFAULT '09:00:00',
  timezone TEXT DEFAULT 'America/Bogota',
  
  -- Contactos
  email TEXT,
  whatsapp_number TEXT,
  sms_number TEXT,
  
  -- Control
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de historial de alertas enviadas
CREATE TABLE IF NOT EXISTS payment_alerts_sent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_schedule_id UUID NOT NULL REFERENCES payment_schedules(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Tipo de alerta
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'reminder_7_days',
    'reminder_3_days', 
    'reminder_1_day',
    'due_today',
    'overdue_1_day',
    'overdue_3_days',
    'overdue_7_days',
    'overdue_15_days',
    'payment_received',
    'partial_payment_received'
  )),
  
  -- Canal y estado
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'read')),
  
  -- Contenido del mensaje
  subject TEXT,
  message TEXT NOT NULL,
  
  -- Información del pago en el momento del envío
  payment_amount DECIMAL(15, 2),
  paid_amount DECIMAL(15, 2),
  remaining_amount DECIMAL(15, 2),
  due_date DATE,
  days_overdue INTEGER DEFAULT 0,
  
  -- Tracking de envío
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Respuesta del proveedor (Resend, Twilio, etc)
  provider_message_id TEXT,
  provider_response JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de plantillas de mensajes
CREATE TABLE IF NOT EXISTS payment_alert_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  alert_type TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
  
  -- Contenido de la plantilla
  subject_template TEXT, -- Para email
  message_template TEXT NOT NULL,
  
  -- Variables disponibles: 
  -- {client_name}, {payment_concept}, {amount}, {due_date}, 
  -- {days_until_due}, {days_overdue}, {paid_amount}, {remaining_amount}
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Índices para rendimiento
CREATE INDEX idx_payment_alert_settings_client ON payment_alert_settings(client_id);
CREATE INDEX idx_payment_alert_settings_active ON payment_alert_settings(is_active);

CREATE INDEX idx_payment_alerts_sent_schedule ON payment_alerts_sent(payment_schedule_id);
CREATE INDEX idx_payment_alerts_sent_client ON payment_alerts_sent(client_id);
CREATE INDEX idx_payment_alerts_sent_status ON payment_alerts_sent(status);
CREATE INDEX idx_payment_alerts_sent_type ON payment_alerts_sent(alert_type);
CREATE INDEX idx_payment_alerts_sent_channel ON payment_alerts_sent(channel);
CREATE INDEX idx_payment_alerts_sent_date ON payment_alerts_sent(created_at);

CREATE INDEX idx_payment_alert_templates_type ON payment_alert_templates(alert_type);
CREATE INDEX idx_payment_alert_templates_channel ON payment_alert_templates(channel);

-- 5. Función para insertar configuración por defecto al crear cliente
CREATE OR REPLACE FUNCTION create_default_payment_alert_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO payment_alert_settings (
    client_id,
    email,
    whatsapp_number,
    email_enabled,
    whatsapp_enabled
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.phone, -- Asumiendo que phone es el número de WhatsApp
    true,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_default_payment_alert_settings
AFTER INSERT ON clients
FOR EACH ROW
EXECUTE FUNCTION create_default_payment_alert_settings();

-- 6. Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_payment_alert_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payment_alert_settings_timestamp
BEFORE UPDATE ON payment_alert_settings
FOR EACH ROW
EXECUTE FUNCTION update_payment_alert_settings_updated_at();

CREATE TRIGGER trigger_update_payment_alert_templates_timestamp
BEFORE UPDATE ON payment_alert_templates
FOR EACH ROW
EXECUTE FUNCTION update_payment_alert_settings_updated_at();

-- 7. Insertar plantillas por defecto
INSERT INTO payment_alert_templates (name, alert_type, channel, subject_template, message_template) VALUES

-- Recordatorios por email
('email_reminder_7_days', 'reminder_7_days', 'email', 
  'Recordatorio: Pago próximo en 7 días',
  'Hola {client_name},

Te recordamos que tienes un pago próximo:

📅 Concepto: {payment_concept}
💰 Monto: ${amount}
📆 Fecha de vencimiento: {due_date}
⏰ Días restantes: {days_until_due}

Por favor, realiza el pago antes de la fecha de vencimiento para evitar cargos adicionales.

Saludos,
Equipo de Administración'),

('email_due_today', 'due_today', 'email',
  '⚠️ Pago vence HOY',
  'Hola {client_name},

Tu pago vence HOY:

📅 Concepto: {payment_concept}
💰 Monto: ${amount}
📆 Fecha de vencimiento: {due_date}

Por favor, realiza el pago lo antes posible.

Saludos,
Equipo de Administración'),

('email_overdue', 'overdue_3_days', 'email',
  '🚨 URGENTE: Pago vencido hace {days_overdue} días',
  'Hola {client_name},

Tu pago está VENCIDO:

📅 Concepto: {payment_concept}
💰 Monto original: ${amount}
💵 Pagado: ${paid_amount}
⚠️ Saldo pendiente: ${remaining_amount}
📆 Venció el: {due_date}
⏰ Días vencidos: {days_overdue}

Por favor, regulariza tu pago urgentemente para evitar consecuencias.

Saludos,
Equipo de Administración'),

('email_payment_received', 'payment_received', 'email',
  '✅ Pago recibido - Gracias',
  'Hola {client_name},

Hemos recibido tu pago:

📅 Concepto: {payment_concept}
💰 Monto recibido: ${paid_amount}
📆 Fecha de pago: {due_date}

Gracias por tu pago puntual.

Saludos,
Equipo de Administración'),

-- Recordatorios por WhatsApp
('whatsapp_reminder_3_days', 'reminder_3_days', 'whatsapp',
  NULL,
  '🔔 *Recordatorio de Pago*

Hola {client_name}, 

Tienes un pago próximo en *3 días*:

📅 *{payment_concept}*
💰 Monto: *${amount}*
📆 Vence: *{due_date}*

Por favor, realiza el pago antes del vencimiento.'),

('whatsapp_due_today', 'due_today', 'whatsapp',
  NULL,
  '⚠️ *PAGO VENCE HOY*

Hola {client_name},

Tu pago vence *HOY*:

📅 *{payment_concept}*
💰 Monto: *${amount}*

Por favor, realiza el pago lo antes posible.'),

('whatsapp_overdue', 'overdue_1_day', 'whatsapp',
  NULL,
  '🚨 *PAGO VENCIDO*

Hola {client_name},

Tu pago está vencido:

📅 *{payment_concept}*
💰 Monto: *${amount}*
⚠️ Saldo: *${remaining_amount}*
⏰ Vencido hace: *{days_overdue} días*

Por favor, regulariza tu pago urgentemente.'),

('whatsapp_payment_received', 'payment_received', 'whatsapp',
  NULL,
  '✅ *Pago Recibido*

Hola {client_name},

Confirmamos el recibo de tu pago:

📅 *{payment_concept}*
💰 Monto: *${paid_amount}*

¡Gracias por tu pago puntual! 🙏');

-- 8. Políticas RLS
ALTER TABLE payment_alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_alerts_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_alert_templates ENABLE ROW LEVEL SECURITY;

-- Service role tiene acceso completo
CREATE POLICY "Service role full access payment_alert_settings"
ON payment_alert_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access payment_alerts_sent"
ON payment_alerts_sent FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access payment_alert_templates"
ON payment_alert_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users pueden ver todo (temporalmente)
CREATE POLICY "Authenticated can view payment_alert_settings"
ON payment_alert_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can view payment_alerts_sent"
ON payment_alerts_sent FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can view payment_alert_templates"
ON payment_alert_templates FOR SELECT TO authenticated USING (true);

-- 9. Comentarios
COMMENT ON TABLE payment_alert_settings IS 'Configuración de alertas de pago por cliente';
COMMENT ON TABLE payment_alerts_sent IS 'Historial de todas las alertas enviadas';
COMMENT ON TABLE payment_alert_templates IS 'Plantillas de mensajes para alertas';

COMMENT ON COLUMN payment_alert_settings.days_before_due IS 'Array de días antes del vencimiento para enviar recordatorios (ej: [7,3,1])';
COMMENT ON COLUMN payment_alert_settings.overdue_alert_frequency IS 'Cada cuántos días enviar alerta si está vencido';
COMMENT ON COLUMN payment_alerts_sent.alert_type IS 'Tipo de alerta: reminder_X_days, due_today, overdue_X_days, payment_received';
COMMENT ON COLUMN payment_alerts_sent.days_overdue IS 'Días de atraso en el momento del envío (0 si no está vencido)';

-- 10. Verificación
SELECT 
  'payment_alert_settings' as table_name,
  COUNT(*) as count
FROM payment_alert_settings
UNION ALL
SELECT 
  'payment_alerts_sent',
  COUNT(*)
FROM payment_alerts_sent
UNION ALL
SELECT 
  'payment_alert_templates',
  COUNT(*)
FROM payment_alert_templates;
