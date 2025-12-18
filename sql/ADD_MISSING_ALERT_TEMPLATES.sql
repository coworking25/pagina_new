-- Agregar plantillas faltantes para todos los tipos de alertas

INSERT INTO payment_alert_templates (name, alert_type, channel, subject_template, message_template) VALUES

-- Email reminder 1 day
('email_reminder_1_day', 'reminder_1_day', 'email',
  '⚠️ Recordatorio: Pago vence MAÑANA',
  'Hola {client_name},

Tu pago vence MAÑANA:

📅 Concepto: {payment_concept}
💰 Monto: ${amount}
📆 Fecha de vencimiento: {due_date}

Por favor, realiza el pago mañana para evitar cargos adicionales.

Saludos,
Equipo de Administración'),

-- Email reminder 3 days
('email_reminder_3_days', 'reminder_3_days', 'email',
  'Recordatorio: Pago próximo en 3 días',
  'Hola {client_name},

Te recordamos que tienes un pago próximo en 3 días:

📅 Concepto: {payment_concept}
💰 Monto: ${amount}
📆 Fecha de vencimiento: {due_date}
⏰ Días restantes: 3

Por favor, realiza el pago antes de la fecha de vencimiento.

Saludos,
Equipo de Administración'),

-- Email overdue 1 day
('email_overdue_1_day', 'overdue_1_day', 'email',
  '⚠️ URGENTE: Pago vencido hace 1 día',
  'Hola {client_name},

Tu pago está VENCIDO hace 1 día:

📅 Concepto: {payment_concept}
💰 Monto original: ${amount}
💵 Pagado: ${paid_amount}
⚠️ Saldo pendiente: ${remaining_amount}
📆 Venció el: {due_date}

Por favor, regulariza tu pago urgentemente.

Saludos,
Equipo de Administración'),

-- Email overdue 7 days
('email_overdue_7_days', 'overdue_7_days', 'email',
  '🚨 URGENTE: Pago vencido hace 7 días',
  'Hola {client_name},

Tu pago está VENCIDO hace 7 días:

📅 Concepto: {payment_concept}
💰 Monto original: ${amount}
💵 Pagado: ${paid_amount}
⚠️ Saldo pendiente: ${remaining_amount}
📆 Venció el: {due_date}
⏰ Días vencidos: 7

Por favor, regulariza tu pago urgentemente para evitar consecuencias.

Saludos,
Equipo de Administración'),

-- Email overdue 15 days
('email_overdue_15_days', 'overdue_15_days', 'email',
  '🚨 ACCIÓN REQUERIDA: Pago vencido hace 15 días',
  'Hola {client_name},

Tu pago está VENCIDO hace 15 días:

📅 Concepto: {payment_concept}
💰 Monto original: ${amount}
💵 Pagado: ${paid_amount}
⚠️ Saldo pendiente: ${remaining_amount}
📆 Venció el: {due_date}
⏰ Días vencidos: 15

Este es un recordatorio urgente. Por favor, ponte en contacto con nosotros inmediatamente.

Saludos,
Equipo de Administración'),

-- Email partial payment
('email_partial_payment_received', 'partial_payment_received', 'email',
  '💰 Pago parcial recibido',
  'Hola {client_name},

Hemos recibido tu pago parcial:

📅 Concepto: {payment_concept}
💰 Monto recibido: ${paid_amount}
⚠️ Saldo pendiente: ${remaining_amount}
📆 Fecha de pago: {due_date}

Gracias por tu abono. Recuerda completar el pago restante.

Saludos,
Equipo de Administración'),

-- WhatsApp reminder 1 day
('whatsapp_reminder_1_day', 'reminder_1_day', 'whatsapp',
  NULL,
  '⚠️ *Recordatorio de Pago*

Hola {client_name}, 

Tu pago vence *MAÑANA*:

📅 *{payment_concept}*
💰 Monto: *${amount}*
📆 Vence: *{due_date}*

Por favor, realiza el pago mañana.'),

-- WhatsApp reminder 7 days
('whatsapp_reminder_7_days', 'reminder_7_days', 'whatsapp',
  NULL,
  '🔔 *Recordatorio de Pago*

Hola {client_name}, 

Tienes un pago próximo en *7 días*:

📅 *{payment_concept}*
💰 Monto: *${amount}*
📆 Vence: *{due_date}*

Por favor, realiza el pago antes del vencimiento.'),

-- WhatsApp overdue 3 days
('whatsapp_overdue_3_days', 'overdue_3_days', 'whatsapp',
  NULL,
  '🚨 *PAGO VENCIDO*

Hola {client_name},

Tu pago está vencido hace *3 días*:

📅 *{payment_concept}*
💰 Monto: *${amount}*
⚠️ Saldo: *${remaining_amount}*
⏰ Vencido hace: *3 días*

Por favor, regulariza tu pago urgentemente.'),

-- WhatsApp overdue 7 days
('whatsapp_overdue_7_days', 'overdue_7_days', 'whatsapp',
  NULL,
  '🚨 *PAGO VENCIDO - URGENTE*

Hola {client_name},

Tu pago está vencido hace *7 días*:

📅 *{payment_concept}*
💰 Monto: *${amount}*
⚠️ Saldo: *${remaining_amount}*
⏰ Vencido hace: *7 días*

Por favor, regulariza tu pago urgentemente.'),

-- WhatsApp overdue 15 days
('whatsapp_overdue_15_days', 'overdue_15_days', 'whatsapp',
  NULL,
  '🚨 *ACCIÓN REQUERIDA*

Hola {client_name},

Tu pago está vencido hace *15 días*:

📅 *{payment_concept}*
💰 Monto: *${amount}*
⚠️ Saldo: *${remaining_amount}*

Comunícate con nosotros urgentemente.'),

-- WhatsApp partial payment
('whatsapp_partial_payment_received', 'partial_payment_received', 'whatsapp',
  NULL,
  '💰 *Pago Parcial Recibido*

Hola {client_name},

Confirmamos el recibo de tu pago parcial:

📅 *{payment_concept}*
💰 Abonado: *${paid_amount}*
⚠️ Saldo: *${remaining_amount}*

¡Gracias! Recuerda completar el saldo pendiente.');

-- Verificar
SELECT 
  channel, 
  COUNT(*) as total
FROM payment_alert_templates
WHERE is_active = true
GROUP BY channel;

SELECT 
  alert_type,
  COUNT(*) as templates_count
FROM payment_alert_templates  
WHERE is_active = true
GROUP BY alert_type
ORDER BY alert_type;
