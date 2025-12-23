-- =====================================================
-- TRIGGERS AUTOMÁTICOS PARA AUTOMATIZACIÓN
-- Se ejecutan cuando ocurren eventos en la base de datos
-- =====================================================

-- =====================================================
-- 1. TRIGGER: Nueva Cita Creada
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_appointment_created()
RETURNS TRIGGER AS $$
DECLARE
  v_rule automation_rules%ROWTYPE;
  v_client_name VARCHAR(255);
  v_property_address TEXT;
BEGIN
  -- Obtener nombre del cliente
  IF NEW.client_id IS NOT NULL THEN
    SELECT full_name INTO v_client_name FROM clients WHERE id = NEW.client_id;
  ELSE
    v_client_name := COALESCE(NEW.contact_name, 'Cliente sin nombre');
  END IF;

  -- Obtener dirección de propiedad
  IF NEW.property_id IS NOT NULL THEN
    SELECT location INTO v_property_address FROM properties WHERE id = NEW.property_id;
  ELSE
    v_property_address := COALESCE(NEW.location, 'No especificada');
  END IF;

  -- Buscar reglas activas para este evento
  FOR v_rule IN 
    SELECT * FROM automation_rules 
    WHERE trigger_event = 'appointment_created' 
    AND is_active = true
    ORDER BY priority DESC
  LOOP
    -- Ejecutar regla
    PERFORM execute_automation_rule(
      v_rule.id,
      jsonb_build_object(
        'appointment_id', NEW.id,
        'client_id', NEW.client_id,
        'client_name', v_client_name,
        'property_id', NEW.property_id,
        'property_address', v_property_address,
        'date', (NEW.start_time AT TIME ZONE 'America/Mexico_City')::DATE,
        'time', (NEW.start_time AT TIME ZONE 'America/Mexico_City')::TIME,
        'start_time', NEW.start_time,
        'status', NEW.status
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a la tabla appointments
DROP TRIGGER IF EXISTS after_appointment_insert ON appointments;
CREATE TRIGGER after_appointment_insert
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_appointment_created();

COMMENT ON FUNCTION trigger_appointment_created() IS 
  'Ejecuta reglas de automatización cuando se crea una cita';

-- =====================================================
-- 2. TRIGGER: Nuevo Cliente Creado
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_client_created()
RETURNS TRIGGER AS $$
DECLARE
  v_rule automation_rules%ROWTYPE;
BEGIN
  -- Buscar reglas activas para este evento
  FOR v_rule IN 
    SELECT * FROM automation_rules 
    WHERE trigger_event = 'client_created' 
    AND is_active = true
    ORDER BY priority DESC
  LOOP
    -- Ejecutar regla
    PERFORM execute_automation_rule(
      v_rule.id,
      jsonb_build_object(
        'client_id', NEW.id,
        'client_name', NEW.full_name,
        'client_type', NEW.client_type,
        'phone', NEW.phone,
        'email', NEW.email,
        'status', NEW.status
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a la tabla clients
DROP TRIGGER IF EXISTS after_client_insert ON clients;
CREATE TRIGGER after_client_insert
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION trigger_client_created();

COMMENT ON FUNCTION trigger_client_created() IS 
  'Ejecuta reglas de automatización cuando se crea un cliente';

-- =====================================================
-- 3. TRIGGER: Nuevo Pago Creado
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_payment_created()
RETURNS TRIGGER AS $$
DECLARE
  v_rule automation_rules%ROWTYPE;
BEGIN
  -- Buscar reglas activas para este evento
  FOR v_rule IN 
    SELECT * FROM automation_rules 
    WHERE trigger_event = 'payment_created' 
    AND is_active = true
    ORDER BY priority DESC
  LOOP
    -- Ejecutar regla
    PERFORM execute_automation_rule(
      v_rule.id,
      jsonb_build_object(
        'payment_id', NEW.id,
        'client_id', NEW.client_id,
        'contract_id', NEW.contract_id,
        'amount', NEW.amount,
        'due_date', NEW.due_date,
        'payment_type', NEW.payment_type,
        'status', NEW.status
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a la tabla payments
DROP TRIGGER IF EXISTS after_payment_insert ON payments;
CREATE TRIGGER after_payment_insert
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_payment_created();

COMMENT ON FUNCTION trigger_payment_created() IS 
  'Ejecuta reglas de automatización cuando se crea un pago';

-- =====================================================
-- 4. FUNCIÓN: Verificar Pagos Vencidos (Diaria)
-- =====================================================
CREATE OR REPLACE FUNCTION check_overdue_payments()
RETURNS INTEGER AS $$
DECLARE
  v_payment payments%ROWTYPE;
  v_client clients%ROWTYPE;
  v_count INTEGER := 0;
  v_rule automation_rules%ROWTYPE;
BEGIN
  -- Buscar pagos vencidos hoy
  FOR v_payment IN 
    SELECT * FROM payments 
    WHERE status = 'pending' 
    AND due_date = CURRENT_DATE
  LOOP
    -- Obtener cliente
    SELECT * INTO v_client FROM clients WHERE id = v_payment.client_id;
    
    -- Buscar reglas para pagos vencidos
    FOR v_rule IN 
      SELECT * FROM automation_rules 
      WHERE trigger_event = 'payment_overdue' 
      AND is_active = true
      ORDER BY priority DESC
    LOOP
      -- Ejecutar regla
      PERFORM execute_automation_rule(
        v_rule.id,
        jsonb_build_object(
          'payment_id', v_payment.id,
          'client_id', v_payment.client_id,
          'client_name', v_client.full_name,
          'contract_id', v_payment.contract_id,
          'amount', v_payment.amount,
          'due_date', v_payment.due_date,
          'payment_type', v_payment.payment_type
        )
      );
    END LOOP;
    
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_overdue_payments() IS 
  'Verifica pagos vencidos y ejecuta reglas de automatización. Ejecutar diariamente.';

-- =====================================================
-- 5. FUNCIÓN: Recordatorios de Pago (Diaria)
-- =====================================================
CREATE OR REPLACE FUNCTION send_payment_reminders()
RETURNS INTEGER AS $$
DECLARE
  v_payment payments%ROWTYPE;
  v_client clients%ROWTYPE;
  v_count INTEGER := 0;
  v_rule automation_rules%ROWTYPE;
  v_days_before INTEGER;
BEGIN
  -- Buscar reglas de recordatorio de pago programadas
  FOR v_rule IN 
    SELECT * FROM automation_rules 
    WHERE trigger_event = 'scheduled' 
    AND rule_type = 'reminder'
    AND is_active = true
    AND actions::jsonb @> '{"create_client_alert": {"alert_type": "payment_reminder"}}'::jsonb
    ORDER BY priority DESC
  LOOP
    -- Obtener días antes de la configuración
    v_days_before := (v_rule.conditions->>'days_before')::INTEGER;
    
    IF v_days_before IS NOT NULL THEN
      -- Buscar pagos que vencen en N días
      FOR v_payment IN 
        SELECT * FROM payments 
        WHERE status = 'pending' 
        AND due_date = CURRENT_DATE + (v_days_before || ' days')::INTERVAL
      LOOP
        -- Obtener cliente
        SELECT * INTO v_client FROM clients WHERE id = v_payment.client_id;
        
        -- Ejecutar regla
        PERFORM execute_automation_rule(
          v_rule.id,
          jsonb_build_object(
            'payment_id', v_payment.id,
            'client_id', v_payment.client_id,
            'client_name', v_client.full_name,
            'contract_id', v_payment.contract_id,
            'amount', v_payment.amount,
            'due_date', v_payment.due_date,
            'days', v_days_before,
            'payment_type', v_payment.payment_type
          )
        );
        
        v_count := v_count + 1;
      END LOOP;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION send_payment_reminders() IS 
  'Envía recordatorios de pago según reglas programadas. Ejecutar diariamente.';

-- =====================================================
-- 6. FUNCIÓN: Recordatorios de Contratos por Vencer
-- =====================================================
CREATE OR REPLACE FUNCTION send_contract_expiring_reminders()
RETURNS INTEGER AS $$
DECLARE
  v_contract contracts%ROWTYPE;
  v_client clients%ROWTYPE;
  v_count INTEGER := 0;
  v_rule automation_rules%ROWTYPE;
  v_days_before INTEGER;
BEGIN
  -- Buscar reglas de recordatorio de contrato
  FOR v_rule IN 
    SELECT * FROM automation_rules 
    WHERE trigger_event = 'scheduled' 
    AND rule_type = 'reminder'
    AND is_active = true
    AND actions::jsonb @> '{"create_client_alert": {"alert_type": "contract_expiring"}}'::jsonb
    ORDER BY priority DESC
  LOOP
    v_days_before := (v_rule.conditions->>'days_before')::INTEGER;
    
    IF v_days_before IS NOT NULL THEN
      -- Buscar contratos que vencen en N días
      FOR v_contract IN 
        SELECT * FROM contracts 
        WHERE status = 'active' 
        AND end_date = CURRENT_DATE + (v_days_before || ' days')::INTERVAL
      LOOP
        -- Obtener cliente
        SELECT * INTO v_client FROM clients WHERE id = v_contract.client_id;
        
        -- Ejecutar regla
        PERFORM execute_automation_rule(
          v_rule.id,
          jsonb_build_object(
            'contract_id', v_contract.id,
            'client_id', v_contract.client_id,
            'client_name', v_client.full_name,
            'end_date', v_contract.end_date,
            'days', v_days_before,
            'monthly_rent', v_contract.monthly_rent
          )
        );
        
        v_count := v_count + 1;
      END LOOP;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION send_contract_expiring_reminders() IS 
  'Envía recordatorios de contratos por vencer. Ejecutar diariamente.';

-- =====================================================
-- 7. FUNCIÓN: Recordatorios de Citas
-- =====================================================
CREATE OR REPLACE FUNCTION send_appointment_reminders()
RETURNS INTEGER AS $$
DECLARE
  v_appointment appointments%ROWTYPE;
  v_client clients%ROWTYPE;
  v_count INTEGER := 0;
  v_rule automation_rules%ROWTYPE;
  v_days_before INTEGER;
BEGIN
  -- Buscar reglas de recordatorio de cita
  FOR v_rule IN 
    SELECT * FROM automation_rules 
    WHERE trigger_event = 'scheduled' 
    AND rule_type = 'reminder'
    AND is_active = true
    AND actions::jsonb ? 'create_client_alert'
    AND actions::jsonb->'create_client_alert'->>'title' LIKE '%Cita%'
    ORDER BY priority DESC
  LOOP
    v_days_before := (v_rule.conditions->>'days_before')::INTEGER;
    
    IF v_days_before IS NOT NULL THEN
      -- Buscar citas para N días después
      FOR v_appointment IN 
        SELECT * FROM appointments 
        WHERE status IN ('scheduled', 'confirmed')
        AND (start_time AT TIME ZONE 'America/Mexico_City')::DATE = CURRENT_DATE + (v_days_before || ' days')::INTERVAL
      LOOP
        -- Obtener cliente si existe
        IF v_appointment.client_id IS NOT NULL THEN
          SELECT * INTO v_client FROM clients WHERE id = v_appointment.client_id;
          
          -- Ejecutar regla
          PERFORM execute_automation_rule(
            v_rule.id,
            jsonb_build_object(
              'appointment_id', v_appointment.id,
              'client_id', v_appointment.client_id,
              'client_name', COALESCE(v_client.full_name, v_appointment.contact_name),
              'date', (v_appointment.start_time AT TIME ZONE 'America/Mexico_City')::DATE,
              'time', (v_appointment.start_time AT TIME ZONE 'America/Mexico_City')::TIME,
              'start_time', v_appointment.start_time,
              'property_id', v_appointment.property_id
            )
          );
          
          v_count := v_count + 1;
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION send_appointment_reminders() IS 
  'Envía recordatorios de citas próximas. Ejecutar diariamente.';

-- =====================================================
-- 8. FUNCIÓN MAESTRA: Ejecutar Todas las Tareas Programadas
-- =====================================================
CREATE OR REPLACE FUNCTION run_daily_automation_tasks()
RETURNS TABLE(
  task_name TEXT,
  items_processed INTEGER,
  status TEXT
) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Verificar pagos vencidos
  BEGIN
    v_count := check_overdue_payments();
    RETURN QUERY SELECT 'check_overdue_payments'::TEXT, v_count, 'success'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'check_overdue_payments'::TEXT, 0, 'error: ' || SQLERRM;
  END;

  -- Enviar recordatorios de pago
  BEGIN
    v_count := send_payment_reminders();
    RETURN QUERY SELECT 'send_payment_reminders'::TEXT, v_count, 'success'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'send_payment_reminders'::TEXT, 0, 'error: ' || SQLERRM;
  END;

  -- Enviar recordatorios de contratos
  BEGIN
    v_count := send_contract_expiring_reminders();
    RETURN QUERY SELECT 'send_contract_expiring_reminders'::TEXT, v_count, 'success'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'send_contract_expiring_reminders'::TEXT, 0, 'error: ' || SQLERRM;
  END;

  -- Enviar recordatorios de citas
  BEGIN
    v_count := send_appointment_reminders();
    RETURN QUERY SELECT 'send_appointment_reminders'::TEXT, v_count, 'success'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'send_appointment_reminders'::TEXT, 0, 'error: ' || SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION run_daily_automation_tasks() IS 
  'Función maestra que ejecuta todas las tareas de automatización diarias. 
   Ejecutar a las 8:00 AM todos los días.
   Uso: SELECT * FROM run_daily_automation_tasks();';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 
  'Triggers automáticos creados exitosamente' as status,
  COUNT(*) FILTER (WHERE proname LIKE 'trigger_%') as trigger_functions,
  COUNT(*) FILTER (WHERE proname LIKE 'send_%' OR proname LIKE 'check_%') as scheduled_functions
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('trigger_appointment_created', 'trigger_client_created', 'trigger_payment_created', 
                'check_overdue_payments', 'send_payment_reminders', 'send_contract_expiring_reminders',
                'send_appointment_reminders', 'run_daily_automation_tasks');

SELECT '✅ Sistema de triggers automáticos creado exitosamente' as status;
SELECT '⚠️ IMPORTANTE: Configurar cron job para ejecutar run_daily_automation_tasks() diariamente a las 8:00 AM' as nota;
