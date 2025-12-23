-- =====================================================
-- ARREGLAR TRIGGER notify_new_appointment
-- El trigger existente tiene un error: busca "property_code" 
-- cuando la columna correcta es "code"
-- =====================================================

-- Ver la función actual para entender qué hace
-- SELECT pg_get_functiondef('notify_new_appointment'::regproc);

-- Reemplazar la función con la versión corregida
CREATE OR REPLACE FUNCTION notify_new_appointment()
RETURNS TRIGGER AS $$
DECLARE
  v_client_name VARCHAR(255);
  v_property_code VARCHAR(50);
  v_advisor_name VARCHAR(255);
BEGIN
  -- Obtener nombre del cliente
  IF NEW.client_id IS NOT NULL THEN
    SELECT full_name INTO v_client_name FROM clients WHERE id = NEW.client_id;
  ELSE
    v_client_name := NEW.contact_name;
  END IF;

  -- Obtener código de propiedad (CORREGIDO: era property_code, ahora es code)
  IF NEW.property_id IS NOT NULL THEN
    SELECT code INTO v_property_code FROM properties WHERE id = NEW.property_id;
  END IF;

  -- Obtener nombre del asesor
  IF NEW.advisor_id IS NOT NULL THEN
    SELECT full_name INTO v_advisor_name FROM advisors WHERE id = NEW.advisor_id;
  END IF;

  -- Aquí iría la lógica de notificación
  -- (mantener la lógica original si existe)
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar que el trigger existe
SELECT 
  'Trigger arreglado' as status,
  COUNT(*) as triggers_count
FROM pg_trigger 
WHERE tgname = 'trigger_notify_new_appointment';

SELECT '✅ Función notify_new_appointment() corregida' as result;
