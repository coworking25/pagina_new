-- =====================================================
-- HABILITAR EMAILS EN REGLAS DE AUTOMATIZACIÓN
-- Actualiza las reglas para que envíen emails
-- =====================================================

-- 1. Recordatorio de Pago - 7 días antes
UPDATE automation_rules
SET actions = jsonb_set(
  actions,
  '{send_email}',
  'true'::jsonb
)
WHERE name = 'Recordatorio de Pago - 7 días antes';

-- 2. Recordatorio de Pago - 3 días antes
UPDATE automation_rules
SET actions = jsonb_set(
  actions,
  '{send_email}',
  'true'::jsonb
)
WHERE name = 'Recordatorio de Pago - 3 días antes';

-- 3. Alerta de Pago Vencido
UPDATE automation_rules
SET actions = jsonb_set(
  actions,
  '{send_email}',
  'true'::jsonb
)
WHERE name = 'Alerta de Pago Vencido';

-- 4. Recordatorio de Cita - 1 día antes
UPDATE automation_rules
SET actions = jsonb_set(
  actions,
  '{send_email}',
  'true'::jsonb
)
WHERE name = 'Recordatorio de Cita - 1 día antes';

-- 5. Contrato próximo a vencer - 30 días
UPDATE automation_rules
SET actions = jsonb_set(
  actions,
  '{send_email}',
  'true'::jsonb
)
WHERE name = 'Contrato próximo a vencer - 30 días';

-- 6. Bienvenida a Nuevo Cliente
UPDATE automation_rules
SET actions = jsonb_set(
  actions,
  '{send_email}',
  'true'::jsonb
)
WHERE name = 'Bienvenida a Nuevo Cliente';

-- Verificar que se actualizaron correctamente
SELECT 
  name,
  rule_type,
  actions->>'send_email' as email_enabled,
  actions->'create_client_alert'->>'alert_type' as alert_type,
  is_active
FROM automation_rules
WHERE actions->>'send_email' = 'true'
ORDER BY priority;
