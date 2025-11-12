-- ============================================
-- CREAR ALERTAS DE PRUEBA PARA CLIENTE
-- Script para generar alertas de diferentes tipos
-- Cliente: Juan Pérez (f183c02b-4a97-4ad3-9e45-2bb9500f3024)
-- ============================================

-- Eliminar alertas existentes del cliente de prueba (si las hay)
DELETE FROM client_alerts 
WHERE client_id = 'f183c02b-4a97-4ad3-9e45-2bb9500f3024';

-- 1. Alerta de recordatorio de pago (severidad media)
INSERT INTO client_alerts (
  client_id,
  alert_type,
  severity,
  title,
  description,
  priority,
  status,
  expires_at,
  created_at,
  updated_at
) VALUES (
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024',
  'payment_reminder',
  'medium',
  'Próximo pago en 5 días',
  'Tu pago de arriendo por $1,650,000 vence el 15 de este mes. Recuerda realizar el pago a tiempo para evitar recargos.',
  'medium',
  'active',
  NOW() + INTERVAL '7 days',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
);

-- 2. Alerta de documento próximo a vencer (severidad baja)
INSERT INTO client_alerts (
  client_id,
  alert_type,
  severity,
  title,
  description,
  priority,
  status,
  expires_at,
  created_at,
  updated_at
) VALUES (
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024',
  'document_expiring',
  'low',
  'Documento próximo a vencer',
  'Tu copia de cédula vence en 30 días. Por favor, actualiza tu documentación en la sección de documentos.',
  'low',
  'active',
  NOW() + INTERVAL '30 days',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- 3. Alerta urgente de pago vencido (severidad alta)
INSERT INTO client_alerts (
  client_id,
  alert_type,
  severity,
  title,
  description,
  priority,
  status,
  expires_at,
  created_at,
  updated_at
) VALUES (
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024',
  'payment_overdue',
  'high',
  '¡Atención! Pago vencido',
  'Tienes un pago vencido desde hace 3 días por valor de $1,650,000. Por favor, regulariza tu situación lo antes posible.',
  'high',
  'active',
  NOW() + INTERVAL '14 days',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '3 hours'
);

-- 4. Alerta general informativa (severidad baja)
INSERT INTO client_alerts (
  client_id,
  alert_type,
  severity,
  title,
  description,
  priority,
  status,
  expires_at,
  created_at,
  updated_at
) VALUES (
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024',
  'general',
  'low',
  'Nueva funcionalidad disponible',
  'Ahora puedes descargar tus extractos mensuales directamente desde el portal. Visita la sección de extractos para más información.',
  'low',
  'active',
  NOW() + INTERVAL '15 days',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '6 hours'
);

-- 5. Alerta de contrato próximo a vencer (severidad media)
INSERT INTO client_alerts (
  client_id,
  alert_type,
  severity,
  title,
  description,
  priority,
  status,
  expires_at,
  created_at,
  updated_at
) VALUES (
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024',
  'contract_expiring',
  'medium',
  'Contrato próximo a renovación',
  'Tu contrato de arrendamiento vence en 60 días. Contacta con tu asesor para iniciar el proceso de renovación.',
  'medium',
  'active',
  NOW() + INTERVAL '60 days',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '12 hours'
);

-- Verificar alertas creadas
SELECT 
  id,
  alert_type,
  severity,
  title,
  description,
  status,
  created_at,
  expires_at
FROM client_alerts
WHERE client_id = 'f183c02b-4a97-4ad3-9e45-2bb9500f3024'
ORDER BY created_at DESC;

-- ============================================
-- RESULTADO ESPERADO: 5 alertas creadas
-- - 1 alta (pago vencido)
-- - 2 medias (recordatorio pago, contrato)
-- - 2 bajas (documento, general)
-- ============================================
