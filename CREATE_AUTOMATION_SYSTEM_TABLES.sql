-- =====================================================
-- SISTEMA DE AUTOMATIZACIÓN - TABLAS PRINCIPALES
-- =====================================================
-- Este sistema crea alertas automáticas, recordatorios programados
-- y workflows para mejorar la eficiencia operativa
-- =====================================================

-- =====================================================
-- 1. TABLA AUTOMATION_RULES (Reglas de Automatización)
-- =====================================================
DROP TABLE IF EXISTS automation_logs CASCADE;
DROP TABLE IF EXISTS automation_schedules CASCADE;
DROP TABLE IF EXISTS automation_rules CASCADE;

CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información básica
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
    'alert_generation',      -- Generar alertas automáticamente
    'reminder',              -- Recordatorios programados
    'workflow',              -- Workflows complejos
    'escalation',            -- Escalación de alertas no leídas
    'notification',          -- Notificaciones push/email
    'task_creation'          -- Creación automática de tareas
  )),
  
  -- Trigger (cuándo se ejecuta)
  trigger_event VARCHAR(50) NOT NULL CHECK (trigger_event IN (
    'payment_created',       -- Cuando se crea un pago
    'payment_overdue',       -- Cuando un pago se vence
    'contract_expiring',     -- Cuando contrato está por vencer
    'appointment_created',   -- Cuando se crea una cita
    'appointment_reminder',  -- Recordatorio de cita
    'client_created',        -- Nuevo cliente
    'document_expiring',     -- Documento por vencer
    'scheduled',             -- Ejecutar en horario programado
    'manual'                 -- Ejecución manual
  )),
  
  -- Condiciones (JSON con criterios)
  conditions JSONB DEFAULT '{}'::jsonb,
  -- Ejemplo: {"days_before": 7, "severity": "high", "client_type": "tenant"}
  
  -- Acciones (JSON con acciones a ejecutar)
  actions JSONB NOT NULL,
  -- Ejemplo: {
  --   "create_client_alert": {
  --     "alert_type": "payment_reminder",
  --     "severity": "medium",
  --     "title": "Recordatorio de pago",
  --     "message": "Tu pago vence en {days} días"
  --   },
  --   "send_push_notification": true,
  --   "send_email": false
  -- }
  
  -- Configuración
  target_user_type VARCHAR(20) CHECK (target_user_type IN ('client', 'admin', 'both')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Límites y control
  max_executions_per_day INTEGER,
  cooldown_minutes INTEGER DEFAULT 60,
  
  -- Metadatos
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_executed_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_automation_rules_active ON automation_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_automation_rules_trigger ON automation_rules(trigger_event);
CREATE INDEX idx_automation_rules_type ON automation_rules(rule_type);
CREATE INDEX idx_automation_rules_priority ON automation_rules(priority DESC);

-- Comentarios
COMMENT ON TABLE automation_rules IS 'Reglas de automatización configurables';
COMMENT ON COLUMN automation_rules.conditions IS 'Criterios para ejecutar la regla (JSON)';
COMMENT ON COLUMN automation_rules.actions IS 'Acciones a ejecutar cuando se cumplen las condiciones (JSON)';
COMMENT ON COLUMN automation_rules.cooldown_minutes IS 'Tiempo mínimo entre ejecuciones para el mismo objeto';

-- =====================================================
-- 2. TABLA AUTOMATION_SCHEDULES (Tareas Programadas)
-- =====================================================
CREATE TABLE automation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referencias
  rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  
  -- Programación
  schedule_type VARCHAR(20) NOT NULL CHECK (schedule_type IN (
    'once',          -- Una sola vez
    'daily',         -- Diariamente
    'weekly',        -- Semanalmente
    'monthly',       -- Mensualmente
    'cron'           -- Expresión cron personalizada
  )),
  
  -- Configuración de horario
  execute_at TIME,                    -- Hora de ejecución (para daily)
  day_of_week INTEGER[],             -- Días de la semana (0-6, para weekly)
  day_of_month INTEGER[],            -- Días del mes (1-31, para monthly)
  cron_expression VARCHAR(100),      -- Expresión cron (para cron)
  timezone VARCHAR(50) DEFAULT 'America/Bogota',
  
  -- Fechas
  start_date DATE NOT NULL,
  end_date DATE,
  next_execution TIMESTAMPTZ,
  
  -- Estado
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX idx_automation_schedules_rule ON automation_schedules(rule_id);
CREATE INDEX idx_automation_schedules_next ON automation_schedules(next_execution) 
  WHERE is_active = true;
CREATE INDEX idx_automation_schedules_active ON automation_schedules(is_active);

COMMENT ON TABLE automation_schedules IS 'Programación de ejecución de reglas de automatización';

-- =====================================================
-- 3. TABLA AUTOMATION_LOGS (Logs de Ejecución)
-- =====================================================
CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referencias
  rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES automation_schedules(id) ON DELETE SET NULL,
  
  -- Información de ejecución
  execution_status VARCHAR(20) NOT NULL CHECK (execution_status IN (
    'success',
    'error',
    'partial',
    'skipped'
  )),
  
  -- Detalles
  trigger_data JSONB,          -- Datos que dispararon la regla
  execution_result JSONB,      -- Resultado de la ejecución
  error_message TEXT,          -- Mensaje de error si falló
  
  -- Métricas
  items_processed INTEGER DEFAULT 0,
  alerts_created INTEGER DEFAULT 0,
  notifications_sent INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  
  -- Timestamps
  executed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX idx_automation_logs_rule ON automation_logs(rule_id);
CREATE INDEX idx_automation_logs_executed ON automation_logs(executed_at DESC);
CREATE INDEX idx_automation_logs_status ON automation_logs(execution_status);
CREATE INDEX idx_automation_logs_rule_date ON automation_logs(rule_id, executed_at DESC);

COMMENT ON TABLE automation_logs IS 'Historial de ejecuciones de reglas de automatización';

-- =====================================================
-- 4. TRIGGERS Y FUNCIONES
-- =====================================================

-- Trigger para actualizar updated_at en automation_rules
CREATE OR REPLACE FUNCTION update_automation_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_automation_rules_updated_at
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_automation_rules_updated_at();

-- Trigger para actualizar updated_at en automation_schedules
CREATE OR REPLACE FUNCTION update_automation_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_automation_schedules_updated_at
  BEFORE UPDATE ON automation_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_automation_schedules_updated_at();

-- =====================================================
-- 5. FUNCIÓN: Calcular próxima ejecución
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_next_execution(
  p_schedule_id UUID
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_schedule automation_schedules%ROWTYPE;
  v_next_exec TIMESTAMPTZ;
  v_base_time TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_schedule FROM automation_schedules WHERE id = p_schedule_id;
  
  IF NOT FOUND OR NOT v_schedule.is_active THEN
    RETURN NULL;
  END IF;
  
  v_base_time := COALESCE(v_schedule.next_execution, NOW());
  
  CASE v_schedule.schedule_type
    WHEN 'once' THEN
      RETURN NULL; -- Ya se ejecutó
      
    WHEN 'daily' THEN
      v_next_exec := v_base_time + INTERVAL '1 day';
      v_next_exec := DATE(v_next_exec) + v_schedule.execute_at;
      
    WHEN 'weekly' THEN
      v_next_exec := v_base_time + INTERVAL '7 days';
      
    WHEN 'monthly' THEN
      v_next_exec := v_base_time + INTERVAL '1 month';
      
    ELSE
      v_next_exec := v_base_time + INTERVAL '1 day';
  END CASE;
  
  -- Verificar end_date
  IF v_schedule.end_date IS NOT NULL AND DATE(v_next_exec) > v_schedule.end_date THEN
    RETURN NULL;
  END IF;
  
  RETURN v_next_exec;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. FUNCIÓN: Ejecutar regla de automatización
-- =====================================================
CREATE OR REPLACE FUNCTION execute_automation_rule(
  p_rule_id UUID,
  p_trigger_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_rule automation_rules%ROWTYPE;
  v_log_id UUID;
  v_start_time TIMESTAMPTZ;
  v_alerts_created INTEGER := 0;
  v_actions JSONB;
  v_admin RECORD;
  v_processed_message TEXT;
  v_processed_title TEXT;
BEGIN
  v_start_time := clock_timestamp();
  
  -- Obtener regla
  SELECT * INTO v_rule FROM automation_rules WHERE id = p_rule_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Regla no encontrada o inactiva: %', p_rule_id;
  END IF;
  
  -- Obtener acciones
  v_actions := v_rule.actions;
  
  -- CREAR ALERTAS DE CLIENTE
  IF v_actions ? 'create_client_alert' AND p_trigger_data ? 'client_id' THEN
    -- Procesar plantilla del mensaje
    v_processed_title := v_actions->'create_client_alert'->>'title';
    v_processed_message := v_actions->'create_client_alert'->>'message';
    
    -- Reemplazar variables en el título
    v_processed_title := REPLACE(v_processed_title, '{{client_name}}', COALESCE(p_trigger_data->>'client_name', ''));
    v_processed_title := REPLACE(v_processed_title, '{{amount}}', COALESCE(p_trigger_data->>'amount', ''));
    v_processed_title := REPLACE(v_processed_title, '{{date}}', COALESCE(p_trigger_data->>'date', ''));
    
    -- Reemplazar variables en el mensaje
    v_processed_message := REPLACE(v_processed_message, '{{client_name}}', COALESCE(p_trigger_data->>'client_name', ''));
    v_processed_message := REPLACE(v_processed_message, '{{amount}}', COALESCE(p_trigger_data->>'amount', ''));
    v_processed_message := REPLACE(v_processed_message, '{{due_date}}', COALESCE(p_trigger_data->>'due_date', ''));
    v_processed_message := REPLACE(v_processed_message, '{{days}}', COALESCE(p_trigger_data->>'days', ''));
    v_processed_message := REPLACE(v_processed_message, '{{date}}', COALESCE(p_trigger_data->>'date', ''));
    v_processed_message := REPLACE(v_processed_message, '{{time}}', COALESCE(p_trigger_data->>'time', ''));
    v_processed_message := REPLACE(v_processed_message, '{{property_address}}', COALESCE(p_trigger_data->>'property_address', ''));
    
    -- Insertar alerta de cliente
    INSERT INTO client_alerts (
      client_id,
      alert_type,
      severity,
      title,
      message,
      action_url
    )
    VALUES (
      (p_trigger_data->>'client_id')::UUID,
      v_actions->'create_client_alert'->>'alert_type',
      v_actions->'create_client_alert'->>'severity',
      v_processed_title,
      v_processed_message,
      v_actions->'create_client_alert'->>'action_url'
    );
    
    v_alerts_created := v_alerts_created + 1;
  END IF;
  
  -- CREAR ALERTAS DE ADMIN
  IF v_actions ? 'create_admin_alert' THEN
    -- Procesar plantilla del mensaje
    v_processed_title := v_actions->'create_admin_alert'->>'title';
    v_processed_message := v_actions->'create_admin_alert'->>'message';
    
    -- Reemplazar variables en el título
    v_processed_title := REPLACE(v_processed_title, '{{client_name}}', COALESCE(p_trigger_data->>'client_name', ''));
    v_processed_title := REPLACE(v_processed_title, '{{amount}}', COALESCE(p_trigger_data->>'amount', ''));
    v_processed_title := REPLACE(v_processed_title, '{{date}}', COALESCE(p_trigger_data->>'date', ''));
    
    -- Reemplazar variables en el mensaje
    v_processed_message := REPLACE(v_processed_message, '{{client_name}}', COALESCE(p_trigger_data->>'client_name', ''));
    v_processed_message := REPLACE(v_processed_message, '{{amount}}', COALESCE(p_trigger_data->>'amount', ''));
    v_processed_message := REPLACE(v_processed_message, '{{due_date}}', COALESCE(p_trigger_data->>'due_date', ''));
    v_processed_message := REPLACE(v_processed_message, '{{days}}', COALESCE(p_trigger_data->>'days', ''));
    v_processed_message := REPLACE(v_processed_message, '{{date}}', COALESCE(p_trigger_data->>'date', ''));
    v_processed_message := REPLACE(v_processed_message, '{{time}}', COALESCE(p_trigger_data->>'time', ''));
    v_processed_message := REPLACE(v_processed_message, '{{property_address}}', COALESCE(p_trigger_data->>'property_address', 'No especificada'));
    
    -- Insertar alerta para todos los admins activos
    FOR v_admin IN 
      SELECT id FROM user_profiles WHERE role = 'admin' AND is_active = true
    LOOP
      INSERT INTO admin_alerts (
        user_id,
        alert_type,
        severity,
        title,
        message,
        action_url,
        related_client_id,
        related_appointment_id,
        related_payment_id
      )
      VALUES (
        v_admin.id,
        v_actions->'create_admin_alert'->>'alert_type',
        v_actions->'create_admin_alert'->>'severity',
        v_processed_title,
        v_processed_message,
        v_actions->'create_admin_alert'->>'action_url',
        (p_trigger_data->>'client_id')::UUID,
        (p_trigger_data->>'appointment_id')::UUID,
        (p_trigger_data->>'payment_id')::UUID
      );
      
      v_alerts_created := v_alerts_created + 1;
    END LOOP;
  END IF;
  
  -- Crear log
  INSERT INTO automation_logs (
    rule_id, 
    trigger_data, 
    execution_status,
    alerts_created,
    execution_time_ms
  )
  VALUES (
    p_rule_id, 
    p_trigger_data, 
    'success',
    v_alerts_created,
    EXTRACT(MILLISECOND FROM clock_timestamp() - v_start_time)::INTEGER
  )
  RETURNING id INTO v_log_id;
  
  -- Actualizar last_executed_at
  UPDATE automation_rules 
  SET last_executed_at = NOW() 
  WHERE id = p_rule_id;
  
  RETURN v_log_id;
  
EXCEPTION WHEN OTHERS THEN
  -- Registrar error
  INSERT INTO automation_logs (
    rule_id, 
    trigger_data, 
    execution_status,
    error_message,
    alerts_created,
    execution_time_ms
  )
  VALUES (
    p_rule_id, 
    p_trigger_data, 
    'error',
    SQLERRM,
    v_alerts_created,
    EXTRACT(MILLISECOND FROM clock_timestamp() - v_start_time)::INTEGER
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. DESHABILITAR RLS (Sistema administrativo)
-- =====================================================
ALTER TABLE automation_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. VERIFICACIÓN
-- =====================================================
SELECT 
  'automation_rules' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'automation_rules'
UNION ALL
SELECT 
  'automation_schedules',
  COUNT(*)
FROM information_schema.columns
WHERE table_name = 'automation_schedules'
UNION ALL
SELECT 
  'automation_logs',
  COUNT(*)
FROM information_schema.columns
WHERE table_name = 'automation_logs';

SELECT '✅ Sistema de automatización creado exitosamente' as status;
