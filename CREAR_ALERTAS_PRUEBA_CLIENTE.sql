-- =====================================================
-- CREAR ALERTAS DE PRUEBA PARA CLIENTE CARLOS
-- Ejecuta este script en Supabase SQL Editor
-- =====================================================

-- PASO 1: Verificar ID del cliente Carlos
SELECT 
  id,
  full_name,
  email,
  document_number
FROM clients
WHERE full_name ILIKE '%carlos%'
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- SCRIPT PARA CARLOS PROPIETARIO
-- ID: a33e7bcd-02dc-4f26-a71b-7d07f4fdd4c3
-- =====================================================

-- Alerta 1: ALTA - Pago próximo a vencer
INSERT INTO client_alerts (
  client_id,
  alert_type,
  severity,
  title,
  message,
  action_url,
  expires_at
) VALUES (
  'a33e7bcd-02dc-4f26-a71b-7d07f4fdd4c3',
  'payment_reminder',
  'high',
  '💰 Pago próximo a vencer',
  'Tu pago de arriendo vence en 3 días (25 de Diciembre). Monto: $18,500.00',
  '/cliente/pagos',
  NOW() + INTERVAL '7 days'
);

-- Alerta 2: ALTA - Pago vencido
INSERT INTO client_alerts (
  client_id,
  alert_type,
  severity,
  title,
  message,
  action_url,
  expires_at
) VALUES (
  'a33e7bcd-02dc-4f26-a71b-7d07f4fdd4c3',
  'payment_overdue',
  'high',
  '⚠️ Pago Vencido',
  'Tu pago de servicios está vencido hace 2 días. Por favor realiza el pago lo antes posible.',
  '/cliente/pagos',
  NOW() + INTERVAL '30 days'
);

-- Alerta 3: MEDIA - Documento por expirar
INSERT INTO client_alerts (
  client_id,
  alert_type,
  severity,
  title,
  message,
  action_url,
  expires_at
) VALUES (
  'a33e7bcd-02dc-4f26-a71b-7d07f4fdd4c3',
  'document_expiring',
  'medium',
  '📄 Documento próximo a expirar',
  'Tu cédula de identidad expira en 15 días. Por favor actualiza el documento en tu perfil.',
  '/cliente/documentos',
  NOW() + INTERVAL '15 days'
);

-- Alerta 4: ALTA - Contrato por vencer
INSERT INTO client_alerts (
  client_id,
  alert_type,
  severity,
  title,
  message,
  action_url,
  expires_at
) VALUES (
  'a33e7bcd-02dc-4f26-a71b-7d07f4fdd4c3',
  'contract_expiring',
  'high',
  '📋 Contrato por vencer',
  'Tu contrato de arrendamiento vence en 30 días. Contacta con nosotros para renovar.',
  '/cliente/contratos',
  NOW() + INTERVAL '30 days'
);

-- Alerta 5: BAJA - Información general
INSERT INTO client_alerts (
  client_id,
  alert_type,
  severity,
  title,
  message,
  action_url,
  expires_at
) VALUES (
  'a33e7bcd-02dc-4f26-a71b-7d07f4fdd4c3',
  'general',
  'low',
  'ℹ️ Nueva información disponible',
  'Hemos actualizado nuestra política de privacidad. Revisa los cambios en tu perfil.',
  '/cliente/perfil',
  NOW() + INTERVAL '60 days'
);

-- Alerta 6: MEDIA - Mantenimiento programado
INSERT INTO client_alerts (
  client_id,
  alert_type,
  severity,
  title,
  message,
  action_url
) VALUES (
  'a33e7bcd-02dc-4f26-a71b-7d07f4fdd4c3',
  'general',
  'medium',
  '🔧 Mantenimiento Programado',
  'Se realizará mantenimiento en el edificio el día 28 de Diciembre de 9:00 AM a 1:00 PM.',
  NULL
);

-- Alerta 7: URGENTE - Alerta importante
INSERT INTO client_alerts (
  client_id,
  alert_type,
  severity,
  title,
  message,
  action_url,
  expires_at
) VALUES (
  'a33e7bcd-02dc-4f26-a71b-7d07f4fdd4c3',
  'urgent',
  'high',
  '🚨 Acción Requerida Urgente',
  'Detectamos actividad inusual en tu cuenta. Por favor verifica tu información de contacto.',
  '/cliente/perfil',
  NOW() + INTERVAL '3 days'
);

-- Alerta 8: BAJA - Recordatorio
INSERT INTO client_alerts (
  client_id,
  alert_type,
  severity,
  title,
  message,
  action_url,
  expires_at
) VALUES (
  'a33e7bcd-02dc-4f26-a71b-7d07f4fdd4c3',
  'general',
  'low',
  '📅 Recordatorio',
  'Recuerda que puedes descargar tus extractos mensuales desde el portal.',
  '/cliente/extractos',
  NOW() + INTERVAL '90 days'
);

-- =====================================================
-- VERIFICAR QUE SE CREARON
-- =====================================================

SELECT 
  id,
  alert_type,
  severity,
  title,
  is_read,
  expires_at,
  created_at
FROM client_alerts
WHERE client_id = 'a33e7bcd-02dc-4f26-a71b-7d07f4fdd4c3'
ORDER BY created_at DESC;

-- =====================================================
-- VERIFICAR CONTADORES
-- =====================================================

SELECT 
  COUNT(*) as total_alertas,
  SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as no_leidas,
  SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as alta_severidad,
  SUM(CASE WHEN alert_type = 'urgent' THEN 1 ELSE 0 END) as urgentes
FROM client_alerts
WHERE client_id = 'a33e7bcd-02dc-4f26-a71b-7d07f4fdd4c3'
AND (expires_at IS NULL OR expires_at > NOW());

-- Debería mostrar: 8 totales, 8 no leídas, 4 alta severidad, 1 urgente

-- =====================================================
-- MENSAJE DE ÉXITO
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ 8 alertas creadas para Carlos Propietario';
  RAISE NOTICE '📱 Ahora abre http://localhost:5173/login';
  RAISE NOTICE '🔐 Login con las credenciales de Carlos';
  RAISE NOTICE '🔔 Deberías ver el badge con "8" en "Mis Alertas"';
  RAISE NOTICE '📋 Navega a /cliente/alertas para ver todas las alertas';
END $$;

-- =====================================================
-- COMANDOS ÚTILES PARA TESTING
-- =====================================================

-- Marcar una alerta como leída
-- UPDATE client_alerts SET is_read = true, read_at = NOW() WHERE id = 'TU_ALERT_ID_AQUI';

-- Descartar una alerta (marcar como expirada)
-- UPDATE client_alerts SET expires_at = NOW() WHERE id = 'TU_ALERT_ID_AQUI';

-- Eliminar todas las alertas de prueba
-- DELETE FROM client_alerts WHERE client_id = 'a33e7bcd-02dc-4f26-a71b-7d07f4fdd4c3';

-- Resetear alertas (marcar todas como no leídas)
-- UPDATE client_alerts SET is_read = false, read_at = NULL WHERE client_id = 'a33e7bcd-02dc-4f26-a71b-7d07f4fdd4c3';
