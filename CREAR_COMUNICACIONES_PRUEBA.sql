-- ============================================
-- CREAR COMUNICACIONES DE PRUEBA
-- Cliente: Juan Pérez (f183c02b-4a97-4ad3-9e45-2bb9500f3024)
-- ============================================

-- Eliminar comunicaciones existentes del cliente de prueba
DELETE FROM client_communications 
WHERE client_id = 'f183c02b-4a97-4ad3-9e45-2bb9500f3024';

-- 1. Mensaje de bienvenida del sistema (alta prioridad, no leído - sin read_at)
INSERT INTO client_communications (
  client_id,
  sender_type,
  subject,
  description,
  communication_type,
  priority,
  status,
  category,
  communication_date
) VALUES (
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024',
  'system',
  'Bienvenido al Portal de Clientes',
  'Hola Juan, bienvenido a tu nuevo portal de clientes. Aquí podrás consultar tus contratos, pagos, documentos y mucho más. Si tienes alguna pregunta, no dudes en contactarnos.',
  'email',
  'high',
  'completed',
  'general',
  NOW() - INTERVAL '1 hour'
);

-- 2. Recordatorio de pago del admin (prioridad normal, no leído - sin read_at)
INSERT INTO client_communications (
  client_id,
  sender_type,
  subject,
  description,
  communication_type,
  priority,
  status,
  category,
  communication_date
) VALUES (
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024',
  'admin',
  'Recordatorio: Próximo pago de arriendo',
  'Estimado cliente, te recordamos que tu próximo pago de arriendo por valor de $1,650,000 vence el 15 de este mes. Puedes realizar el pago a través de los medios habituales. Gracias por tu puntualidad.',
  'whatsapp',
  'normal',
  'completed',
  'payment',
  NOW() - INTERVAL '3 hours'
);

-- 3. Solicitud de documentos (prioridad alta, no leído - sin read_at)
INSERT INTO client_communications (
  client_id,
  sender_type,
  subject,
  description,
  communication_type,
  priority,
  status,
  category,
  communication_date
) VALUES (
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024',
  'admin',
  'Actualización de documentos requerida',
  'Hola Juan, hemos notado que tu copia de cédula está próxima a vencer. Por favor, actualiza tu documentación en la sección de "Documentos" lo antes posible. Si tienes alguna duda, contáctanos.',
  'email',
  'high',
  'completed',
  'document',
  NOW() - INTERVAL '6 hours'
);

-- 4. Información sobre mantenimiento (prioridad baja, leído - con read_at)
INSERT INTO client_communications (
  client_id,
  sender_type,
  subject,
  description,
  communication_type,
  priority,
  status,
  read_at,
  category,
  communication_date
) VALUES (
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024',
  'admin',
  'Mantenimiento programado en el edificio',
  'Estimados residentes, les informamos que se realizará mantenimiento en las áreas comunes el próximo sábado de 8:00 AM a 12:00 PM. Puede haber interrupciones temporales en el servicio de agua. Agradecemos su comprensión.',
  'sms',
  'low',
  'completed',
  NOW() - INTERVAL '1 day',
  'maintenance',
  NOW() - INTERVAL '2 days'
);

-- 5. Confirmación de renovación de contrato (prioridad normal, leído - con read_at)
INSERT INTO client_communications (
  client_id,
  sender_type,
  subject,
  description,
  communication_type,
  priority,
  status,
  read_at,
  category,
  communication_date
) VALUES (
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024',
  'admin',
  'Renovación de contrato - Información importante',
  'Juan, tu contrato de arrendamiento vence en 60 días. Te contactaremos próximamente para discutir las opciones de renovación. Si deseas renovar o tienes preguntas, por favor háznoslo saber con anticipación.',
  'call',
  'normal',
  'completed',
  NOW() - INTERVAL '3 days',
  'contract',
  NOW() - INTERVAL '5 days'
);

-- Verificar comunicaciones creadas
SELECT 
  id,
  sender_type,
  subject,
  priority,
  status,
  category,
  communication_date,
  read_at
FROM client_communications
WHERE client_id = 'f183c02b-4a97-4ad3-9e45-2bb9500f3024'
ORDER BY communication_date DESC;

-- ============================================
-- RESULTADO ESPERADO: 5 comunicaciones creadas
-- - 3 no leídas (sin read_at): 1 alta, 1 normal, 1 alta
-- - 2 leídas (con read_at): 1 baja, 1 normal
-- Status: Todos 'completed'
-- Categorías: general, payment, document, maintenance, contract
-- ============================================
