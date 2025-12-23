-- =====================================================
-- REGLAS DE AUTOMATIZACIÓN PREDEFINIDAS
-- Inserta reglas comunes listas para usar
-- =====================================================

-- =====================================================
-- 1. RECORDATORIO DE PAGO (7 días antes)
-- =====================================================
INSERT INTO automation_rules (
  name,
  description,
  rule_type,
  trigger_event,
  conditions,
  actions,
  target_user_type,
  priority,
  is_active
) VALUES (
  'Recordatorio de Pago - 7 días antes',
  'Envía alerta a clientes 7 días antes del vencimiento de pago',
  'reminder',
  'scheduled',
  '{
    "days_before": 7,
    "payment_status": ["pending"],
    "execute_time": "09:00"
  }'::jsonb,
  '{
    "create_client_alert": {
      "alert_type": "payment_reminder",
      "severity": "medium",
      "title": "Recordatorio: Pago próximo a vencer",
      "message": "Tu pago de arriendo vence en 7 días ({{due_date}}). Monto: ${{amount}}",
      "action_url": "/cliente/pagos"
    },
    "send_push_notification": true,
    "send_email": false
  }'::jsonb,
  'client',
  7,
  true
);

-- =====================================================
-- 2. RECORDATORIO DE PAGO (3 días antes)
-- =====================================================
INSERT INTO automation_rules (
  name,
  description,
  rule_type,
  trigger_event,
  conditions,
  actions,
  target_user_type,
  priority,
  is_active
) VALUES (
  'Recordatorio de Pago - 3 días antes',
  'Envía alerta urgente 3 días antes del vencimiento',
  'reminder',
  'scheduled',
  '{
    "days_before": 3,
    "payment_status": ["pending"],
    "execute_time": "10:00"
  }'::jsonb,
  '{
    "create_client_alert": {
      "alert_type": "payment_reminder",
      "severity": "high",
      "title": "⚠️ Pago próximo a vencer",
      "message": "Tu pago vence en 3 días ({{due_date}}). Por favor realiza el pago a tiempo para evitar recargos. Monto: ${{amount}}",
      "action_url": "/cliente/pagos"
    },
    "send_push_notification": true,
    "send_email": true
  }'::jsonb,
  'client',
  9,
  true
);

-- =====================================================
-- 3. PAGO VENCIDO
-- =====================================================
INSERT INTO automation_rules (
  name,
  description,
  rule_type,
  trigger_event,
  conditions,
  actions,
  target_user_type,
  priority,
  is_active
) VALUES (
  'Alerta de Pago Vencido',
  'Genera alertas cuando un pago se vence',
  'alert_generation',
  'payment_overdue',
  '{
    "execute_time": "08:00"
  }'::jsonb,
  '{
    "create_client_alert": {
      "alert_type": "payment_overdue",
      "severity": "high",
      "title": "❌ Pago Vencido",
      "message": "Tu pago venció el {{due_date}}. Monto pendiente: ${{amount}} + recargo por mora. Por favor contacta a tu asesor.",
      "action_url": "/cliente/pagos"
    },
    "create_admin_alert": {
      "alert_type": "payment_overdue",
      "severity": "high",
      "title": "Pago Vencido - {{client_name}}",
      "message": "Cliente {{client_name}} tiene un pago vencido. Monto: ${{amount}}",
      "action_url": "/admin/payments"
    },
    "send_push_notification": true,
    "send_email": true
  }'::jsonb,
  'both',
  10,
  true
);

-- =====================================================
-- 4. CONTRATO POR VENCER (30 días)
-- =====================================================
INSERT INTO automation_rules (
  name,
  description,
  rule_type,
  trigger_event,
  conditions,
  actions,
  target_user_type,
  priority,
  is_active
) VALUES (
  'Contrato por Vencer - 30 días',
  'Notifica cuando un contrato está por vencer en 30 días',
  'reminder',
  'scheduled',
  '{
    "days_before": 30,
    "contract_status": ["active"],
    "execute_time": "10:00"
  }'::jsonb,
  '{
    "create_client_alert": {
      "alert_type": "contract_expiring",
      "severity": "medium",
      "title": "Contrato por Vencer",
      "message": "Tu contrato vence el {{end_date}} (en 30 días). Por favor contacta a tu asesor para renovación.",
      "action_url": "/cliente/contratos"
    },
    "create_admin_alert": {
      "alert_type": "contract_expiring",
      "severity": "medium",
      "title": "Contrato por vencer - {{client_name}}",
      "message": "El contrato de {{client_name}} vence en 30 días ({{end_date}})",
      "action_url": "/admin/contracts"
    },
    "send_push_notification": true
  }'::jsonb,
  'both',
  6,
  true
);

-- =====================================================
-- 5. RECORDATORIO DE CITA (1 día antes)
-- =====================================================
INSERT INTO automation_rules (
  name,
  description,
  rule_type,
  trigger_event,
  conditions,
  actions,
  target_user_type,
  priority,
  is_active
) VALUES (
  'Recordatorio de Cita - 1 día antes',
  'Envía recordatorio 24 horas antes de una cita',
  'reminder',
  'scheduled',
  '{
    "days_before": 1,
    "appointment_status": ["scheduled", "confirmed"],
    "execute_time": "18:00"
  }'::jsonb,
  '{
    "create_client_alert": {
      "alert_type": "general",
      "severity": "medium",
      "title": "📅 Recordatorio de Cita",
      "message": "Tienes una cita mañana a las {{time}} para ver la propiedad {{property_address}}",
      "action_url": "/cliente/citas"
    },
    "send_push_notification": true,
    "send_email": true
  }'::jsonb,
  'client',
  8,
  true
);

-- =====================================================
-- 6. NUEVA CITA PARA ADMIN
-- =====================================================
INSERT INTO automation_rules (
  name,
  description,
  rule_type,
  trigger_event,
  conditions,
  actions,
  target_user_type,
  priority,
  is_active
) VALUES (
  'Notificar Nueva Cita a Admin',
  'Notifica inmediatamente a los admins cuando se agenda una cita',
  'alert_generation',
  'appointment_created',
  '{}'::jsonb,
  '{
    "create_admin_alert": {
      "alert_type": "new_appointment",
      "severity": "medium",
      "title": "📅 Nueva Cita Agendada",
      "message": "{{client_name}} agendó una cita para el {{date}} a las {{time}} - Propiedad: {{property_address}}",
      "action_url": "/admin/appointments"
    },
    "send_push_notification": true
  }'::jsonb,
  'admin',
  7,
  true
);

-- =====================================================
-- 7. NUEVO CLIENTE REGISTRADO
-- =====================================================
INSERT INTO automation_rules (
  name,
  description,
  rule_type,
  trigger_event,
  conditions,
  actions,
  target_user_type,
  priority,
  is_active
) VALUES (
  'Notificar Nuevo Cliente',
  'Alerta a admins cuando se registra un nuevo cliente',
  'alert_generation',
  'client_created',
  '{}'::jsonb,
  '{
    "create_admin_alert": {
      "alert_type": "new_client",
      "severity": "low",
      "title": "👤 Nuevo Cliente Registrado",
      "message": "{{client_name}} se registró como {{client_type}}. Teléfono: {{phone}}",
      "action_url": "/admin/clients"
    },
    "send_push_notification": true
  }'::jsonb,
  'admin',
  5,
  true
);

-- =====================================================
-- 8. ESCALACIÓN DE ALERTAS NO LEÍDAS
-- =====================================================
INSERT INTO automation_rules (
  name,
  description,
  rule_type,
  trigger_event,
  conditions,
  actions,
  target_user_type,
  priority,
  is_active
) VALUES (
  'Escalar Alertas No Leídas',
  'Escala alertas de alta prioridad no leídas después de 24 horas',
  'escalation',
  'scheduled',
  '{
    "hours_unread": 24,
    "severity": ["high"],
    "execute_time": "12:00"
  }'::jsonb,
  '{
    "send_push_notification": true,
    "send_email": true,
    "notify_admin": true
  }'::jsonb,
  'both',
  9,
  true
);

-- =====================================================
-- 9. DOCUMENTO POR VENCER
-- =====================================================
INSERT INTO automation_rules (
  name,
  description,
  rule_type,
  trigger_event,
  conditions,
  actions,
  target_user_type,
  priority,
  is_active
) VALUES (
  'Documento por Vencer - 15 días',
  'Alerta cuando un documento está por vencer',
  'reminder',
  'scheduled',
  '{
    "days_before": 15,
    "document_types": ["cedula", "rut", "visa"],
    "execute_time": "09:00"
  }'::jsonb,
  '{
    "create_client_alert": {
      "alert_type": "document_expiring",
      "severity": "medium",
      "title": "📄 Documento por Vencer",
      "message": "Tu {{document_type}} vence el {{expiry_date}}. Por favor actualiza tu documento.",
      "action_url": "/cliente/documentos"
    },
    "send_push_notification": true
  }'::jsonb,
  'client',
  6,
  true
);

-- =====================================================
-- 10. REPORTE MENSUAL AUTOMÁTICO
-- =====================================================
INSERT INTO automation_rules (
  name,
  description,
  rule_type,
  trigger_event,
  conditions,
  actions,
  target_user_type,
  priority,
  is_active
) VALUES (
  'Reporte Mensual de Actividad',
  'Genera reporte mensual de pagos, citas y contratos',
  'workflow',
  'scheduled',
  '{
    "day_of_month": 1,
    "execute_time": "08:00"
  }'::jsonb,
  '{
    "create_admin_alert": {
      "alert_type": "system_alert",
      "severity": "low",
      "title": "📊 Reporte Mensual Disponible",
      "message": "El reporte del mes {{month}} está listo. Total pagos: {{payments_count}}, Citas: {{appointments_count}}",
      "action_url": "/admin/reports"
    }
  }'::jsonb,
  'admin',
  3,
  false
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 
  COUNT(*) as rules_created,
  COUNT(*) FILTER (WHERE is_active = true) as active_rules,
  COUNT(*) FILTER (WHERE target_user_type = 'client') as client_rules,
  COUNT(*) FILTER (WHERE target_user_type = 'admin') as admin_rules,
  COUNT(*) FILTER (WHERE target_user_type = 'both') as both_rules
FROM automation_rules;

SELECT '✅ 10 reglas de automatización creadas exitosamente' as status;
