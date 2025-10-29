-- =====================================================
-- SISTEMA DE NOTIFICACIONES - CREACIÓN DE TABLAS
-- Ejecutar en Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Tabla de preferencias de notificación
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type VARCHAR(50) NOT NULL DEFAULT 'client',
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  reminder_24h BOOLEAN DEFAULT true,
  reminder_1h BOOLEAN DEFAULT true,
  reminder_15m BOOLEAN DEFAULT false,
  timezone VARCHAR(50) DEFAULT 'America/Bogota',
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, user_type)
);

-- 2. Tabla principal de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  recipient_id VARCHAR(255) NOT NULL,
  recipient_type VARCHAR(50) DEFAULT 'client',
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(50),
  message TEXT NOT NULL,
  channels JSONB DEFAULT '["email"]',
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de logs de notificaciones
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  channel VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed', 'delivered', 'read')),
  provider_response JSONB,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de reglas de recordatorios
CREATE TABLE IF NOT EXISTS reminder_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('appointment_reminder', 'payment_reminder', 'contract_reminder', 'system_alert')),
  trigger_event VARCHAR(100) NOT NULL,
  timing_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  message_template TEXT NOT NULL,
  channels JSONB DEFAULT '["email"]',
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de tareas programadas
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_type VARCHAR(100) NOT NULL,
  reference_id VARCHAR(255),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 1,
  payload JSONB DEFAULT '{}',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA MEJOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_notification_logs_notification_id ON notification_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON scheduled_tasks(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_scheduled_at ON scheduled_tasks(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_type ON scheduled_tasks(task_type);

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas para notification_preferences
CREATE POLICY "Users can view own preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all preferences" ON notification_preferences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Políticas para notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = recipient_id OR recipient_type = 'admin');

CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Políticas para notification_logs
CREATE POLICY "Admins can view all logs" ON notification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Políticas para reminder_rules
CREATE POLICY "Admins can manage reminder rules" ON reminder_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Políticas para scheduled_tasks
CREATE POLICY "Admins can manage scheduled tasks" ON scheduled_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- DATOS INICIALES - REGLAS DE RECORDATORIOS
-- =====================================================

INSERT INTO reminder_rules (name, type, trigger_event, timing_minutes, is_active, message_template, channels, conditions) VALUES
('Recordatorio 24 horas antes', 'appointment_reminder', 'appointment_created', 1440, true,
 'Recordatorio: Tienes una cita programada para mañana a las {appointment_time}. Propiedad: {property_title}',
 '["email", "push"]', '{"status": "confirmed"}'),

('Recordatorio 1 hora antes', 'appointment_reminder', 'appointment_created', 60, true,
 'Recordatorio: Tu cita está programada para dentro de 1 hora. Dirección: {property_address}',
 '["email", "sms", "push"]', '{"status": "confirmed"}'),

('Recordatorio 15 minutos antes', 'appointment_reminder', 'appointment_created', 15, false,
 'Tu cita comienza en 15 minutos. Te esperamos en {property_address}',
 '["sms", "push"]', '{"status": "confirmed"}'),

('Recordatorio de pago pendiente', 'payment_reminder', 'contract_created', 2880, true,
 'Recordatorio: Tienes un pago pendiente por el contrato de {property_title}. Monto: ${contract_amount}',
 '["email", "whatsapp"]', '{"payment_status": "pending"}'),

('Recordatorio de contrato próximo a vencer', 'contract_reminder', 'contract_created', 10080, true,
 'Tu contrato de {property_title} vence en 7 días. Revisa los términos de renovación.',
 '["email"]', '{"status": "active"}')

ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- FUNCIÓN PARA ESTADÍSTICAS
-- =====================================================

CREATE OR REPLACE FUNCTION get_notification_stats()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'total_notifications', (SELECT COUNT(*) FROM notifications),
    'pending_notifications', (SELECT COUNT(*) FROM notifications WHERE status = 'pending'),
    'sent_today', (SELECT COUNT(*) FROM notifications WHERE DATE(sent_at) = CURRENT_DATE),
    'failed_last_24h', (SELECT COUNT(*) FROM notifications WHERE status = 'failed' AND created_at > NOW() - INTERVAL '24 hours'),
    'active_reminder_rules', (SELECT COUNT(*) FROM reminder_rules WHERE is_active = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

-- Si llegaste aquí sin errores, ¡las tablas se crearon exitosamente!
-- Ahora puedes ejecutar el script de verificación para confirmar.