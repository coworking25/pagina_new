-- =====================================================
-- MIGRACIÓN: SISTEMA DE NOTIFICACIONES - FASE 3
-- =====================================================
-- Esta migración crea las tablas necesarias para el sistema
-- de notificaciones, recordatorios y scheduler automático

-- =====================================================
-- TABLA: notification_preferences
-- =====================================================
-- Almacena las preferencias de notificación de cada usuario
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('client', 'advisor', 'admin')),

  -- Canales de comunicación habilitados
  email_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,

  -- Tipos de notificaciones específicas
  appointment_reminders BOOLEAN DEFAULT true,
  payment_notifications BOOLEAN DEFAULT true,
  contract_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  system_alerts BOOLEAN DEFAULT true,

  -- Configuración de timing para recordatorios
  reminder_timings TEXT[] DEFAULT ARRAY['24_hours_before', '1_hour_before'],

  -- Horarios de silencio
  quiet_hours_start TEXT, -- HH:MM format
  quiet_hours_end TEXT,   -- HH:MM format

  -- Zona horaria del usuario
  timezone TEXT DEFAULT 'America/Bogota',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, user_type)
);

-- =====================================================
-- TABLA: notifications
-- =====================================================
-- Almacena todas las notificaciones programadas y enviadas
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN (
    'appointment_reminder', 'appointment_confirmation', 'appointment_rescheduled',
    'appointment_cancelled', 'payment_due', 'contract_expiring', 'follow_up',
    'marketing', 'system_alert'
  )),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),

  -- Destinatario
  recipient_id TEXT NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('client', 'advisor', 'admin')),
  recipient_email TEXT,
  recipient_phone TEXT,

  -- Contenido
  subject TEXT,
  message TEXT NOT NULL,
  template_id TEXT,

  -- Canales de envío
  channels TEXT[] NOT NULL,

  -- Referencias a entidades relacionadas
  appointment_id TEXT,
  property_id BIGINT,
  contract_id TEXT,
  payment_id TEXT,

  -- Programación
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,

  -- Metadatos
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Información adicional
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: notification_logs
-- =====================================================
-- Registra el historial de envío de cada notificación
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms', 'push', 'in_app')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
  provider_response JSONB,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cost DECIMAL(10,4), -- Costo de envío si aplica

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: reminder_rules
-- =====================================================
-- Define las reglas para envío automático de recordatorios
CREATE TABLE IF NOT EXISTS reminder_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'appointment_reminder', 'payment_due', 'contract_expiring', 'follow_up'
  )),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('appointment', 'payment', 'contract')),
  timing TEXT NOT NULL CHECK (timing IN ('1_hour_before', '24_hours_before', '1_week_before', 'custom')),
  custom_hours_before INTEGER, -- Para timing 'custom'
  is_active BOOLEAN DEFAULT true,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  channels TEXT[] NOT NULL,
  template_id TEXT,

  -- Condiciones adicionales
  conditions JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: scheduled_tasks
-- =====================================================
-- Para el sistema de scheduler de tareas
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN (
    'send_notification', 'send_reminder', 'check_overdue', 'cleanup_old_notifications'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,

  -- Parámetros de la tarea
  params JSONB DEFAULT '{}',

  -- Resultados
  result JSONB,
  error_message TEXT,

  -- Reintentos
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_notifications_status_scheduled ON notifications(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_appointment ON notifications(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_contract ON notifications(contract_id);
CREATE INDEX IF NOT EXISTS idx_notifications_payment ON notifications(payment_id);

-- Índices para notification_logs
CREATE INDEX IF NOT EXISTS idx_notification_logs_notification ON notification_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);

-- Índices para reminder_rules
CREATE INDEX IF NOT EXISTS idx_reminder_rules_active ON reminder_rules(is_active, entity_type);

-- Índices para scheduled_tasks
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status_scheduled ON scheduled_tasks(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_type ON scheduled_tasks(type);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar reglas de recordatorios por defecto
INSERT INTO reminder_rules (name, type, entity_type, timing, is_active, priority, channels, template_id) VALUES
('Recordatorio 24h antes de cita', 'appointment_reminder', 'appointment', '24_hours_before', true, 'normal', ARRAY['email', 'whatsapp'], 'appointment_reminder'),
('Recordatorio 1h antes de cita', 'appointment_reminder', 'appointment', '1_hour_before', true, 'high', ARRAY['whatsapp'], 'appointment_reminder'),
('Pago pendiente', 'payment_due', 'payment', 'custom', true, 'urgent', ARRAY['email', 'whatsapp'], 'payment_due'),
('Contrato por vencer (60 días)', 'contract_expiring', 'contract', 'custom', true, 'high', ARRAY['email', 'whatsapp'], 'contract_expiring'),
('Seguimiento post-cita (7 días)', 'follow_up', 'appointment', 'custom', true, 'normal', ARRAY['email', 'whatsapp'], 'follow_up')
ON CONFLICT DO NOTHING;

-- Actualizar custom_hours_before para reglas específicas
UPDATE reminder_rules SET custom_hours_before = -24 WHERE timing = '24_hours_before';
UPDATE reminder_rules SET custom_hours_before = -1 WHERE timing = '1_hour_before';
UPDATE reminder_rules SET custom_hours_before = 0 WHERE type = 'payment_due'; -- Inmediato para pagos pendientes
UPDATE reminder_rules SET custom_hours_before = -1440 WHERE type = 'contract_expiring'; -- 60 días antes
UPDATE reminder_rules SET custom_hours_before = 10080 WHERE type = 'follow_up'; -- 7 días después

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas para notification_preferences
CREATE POLICY "Users can view their own preferences" ON notification_preferences
  FOR SELECT USING (
    CASE
      WHEN user_type = 'client' THEN EXISTS (
        SELECT 1 FROM clients WHERE id::text = user_id AND auth.uid()::text = id::text
      )
      WHEN user_type = 'advisor' THEN EXISTS (
        SELECT 1 FROM advisors WHERE id = user_id AND auth.uid()::text = id
      )
      ELSE auth.role() = 'admin'
    END
  );

CREATE POLICY "Users can update their own preferences" ON notification_preferences
  FOR UPDATE USING (
    CASE
      WHEN user_type = 'client' THEN EXISTS (
        SELECT 1 FROM clients WHERE id::text = user_id AND auth.uid()::text = id::text
      )
      WHEN user_type = 'advisor' THEN EXISTS (
        SELECT 1 FROM advisors WHERE id = user_id AND auth.uid()::text = id
      )
      ELSE auth.role() = 'admin'
    END
  );

-- Políticas para notifications (los usuarios pueden ver sus propias notificaciones)
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (
    CASE
      WHEN recipient_type = 'client' THEN EXISTS (
        SELECT 1 FROM clients WHERE id::text = recipient_id AND auth.uid()::text = id::text
      )
      WHEN recipient_type = 'advisor' THEN EXISTS (
        SELECT 1 FROM advisors WHERE id = recipient_id AND auth.uid()::text = id
      )
      ELSE auth.role() = 'admin'
    END
  );

-- Políticas para reminder_rules (solo admins pueden gestionar)
CREATE POLICY "Only admins can manage reminder rules" ON reminder_rules
  FOR ALL USING (auth.role() = 'admin');

-- Políticas para scheduled_tasks (solo admins pueden ver)
CREATE POLICY "Only admins can view scheduled tasks" ON scheduled_tasks
  FOR SELECT USING (auth.role() = 'admin');

-- Políticas para notification_logs (solo admins pueden ver)
CREATE POLICY "Only admins can view notification logs" ON notification_logs
  FOR SELECT USING (auth.role() = 'admin');

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para limpiar notificaciones antiguas (se ejecuta automáticamente)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Eliminar notificaciones enviadas hace más de 30 días
  DELETE FROM notifications
  WHERE status IN ('sent', 'delivered', 'cancelled')
    AND created_at < NOW() - INTERVAL '30 days';

  -- Eliminar logs antiguos
  DELETE FROM notification_logs
  WHERE sent_at < NOW() - INTERVAL '30 days';

  -- Eliminar tareas completadas antiguas
  DELETE FROM scheduled_tasks
  WHERE status = 'completed'
    AND completed_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Función para obtener estadísticas de notificaciones
CREATE OR REPLACE FUNCTION get_notification_stats(
  p_user_id TEXT DEFAULT NULL,
  p_user_type TEXT DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_sent BIGINT,
  total_failed BIGINT,
  total_pending BIGINT,
  delivery_rate DECIMAL,
  avg_response_time INTERVAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status IN ('sent', 'delivered')) as total_sent,
    COUNT(*) FILTER (WHERE status = 'failed') as total_failed,
    COUNT(*) FILTER (WHERE status = 'pending') as total_pending,
    CASE
      WHEN COUNT(*) > 0 THEN
        ROUND(
          (COUNT(*) FILTER (WHERE status IN ('sent', 'delivered'))::DECIMAL /
           COUNT(*)::DECIMAL) * 100,
          2
        )
      ELSE 0
    END as delivery_rate,
    AVG(delivered_at - sent_at) FILTER (WHERE delivered_at IS NOT NULL AND sent_at IS NOT NULL) as avg_response_time
  FROM notifications
  WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND (p_user_id IS NULL OR recipient_id = p_user_id)
    AND (p_user_type IS NULL OR recipient_type = p_user_type);
END;
$$;

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminder_rules_updated_at
  BEFORE UPDATE ON reminder_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_tasks_updated_at
  BEFORE UPDATE ON scheduled_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migración del sistema de notificaciones completada exitosamente';
  RAISE NOTICE '📋 Tablas creadas: notification_preferences, notifications, notification_logs, reminder_rules, scheduled_tasks';
  RAISE NOTICE '🔒 Políticas RLS configuradas para seguridad';
  RAISE NOTICE '⚡ Funciones y triggers creados para automatización';
  RAISE NOTICE '📊 Datos iniciales insertados (reglas de recordatorios por defecto)';
END $$;