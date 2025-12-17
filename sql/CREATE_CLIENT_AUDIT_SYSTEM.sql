-- =====================================================
-- SISTEMA DE AUDITORÍA DE CAMBIOS EN CLIENTES
-- =====================================================
-- Registra todas las modificaciones realizadas a los clientes
-- para tener trazabilidad completa

-- =====================================================
-- 1. CREAR TABLA DE AUDITORÍA
-- =====================================================

CREATE TABLE IF NOT EXISTS client_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Referencias
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES advisors(id), -- Quién hizo el cambio
  
  -- Acción realizada
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'status_changed', etc.
  entity_type VARCHAR(50) DEFAULT 'client', -- 'client', 'credentials', 'payment_config', etc.
  
  -- Campos modificados (JSON)
  changed_fields JSONB, -- Array de campos que cambiaron: ["email", "phone"]
  old_values JSONB, -- Valores anteriores
  new_values JSONB, -- Valores nuevos
  
  -- Información adicional
  change_summary TEXT, -- Resumen legible: "Email cambiado de xxx@mail.com a yyy@mail.com"
  
  -- Metadata de la sesión
  ip_address INET, -- IP desde donde se hizo el cambio
  user_agent TEXT, -- Navegador/dispositivo
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. ÍNDICES PARA CONSULTAS RÁPIDAS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_audit_log_client_id ON client_audit_log(client_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by ON client_audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON client_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON client_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_type ON client_audit_log(entity_type);

-- Índice compuesto para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_audit_log_client_date ON client_audit_log(client_id, created_at DESC);

-- =====================================================
-- 3. TRIGGER AUTOMÁTICO PARA TABLA CLIENTS
-- =====================================================

-- Función que registra cambios automáticamente
CREATE OR REPLACE FUNCTION log_client_changes()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields_array TEXT[] := ARRAY[]::TEXT[];
  old_values_json JSONB := '{}'::jsonb;
  new_values_json JSONB := '{}'::jsonb;
  change_summary_text TEXT := '';
  current_user_id UUID;
BEGIN
  -- Obtener ID del usuario actual (si está disponible)
  BEGIN
    current_user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    current_user_id := NULL;
  END;

  -- Para INSERT (creación)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO client_audit_log (
      client_id,
      changed_by,
      action,
      entity_type,
      new_values,
      change_summary
    ) VALUES (
      NEW.id,
      current_user_id,
      'created',
      'client',
      to_jsonb(NEW),
      'Cliente creado: ' || NEW.full_name
    );
    RETURN NEW;
  END IF;

  -- Para UPDATE (modificación)
  IF TG_OP = 'UPDATE' THEN
    -- Detectar qué campos cambiaron
    IF OLD.full_name != NEW.full_name THEN
      changed_fields_array := array_append(changed_fields_array, 'full_name');
      old_values_json := old_values_json || jsonb_build_object('full_name', OLD.full_name);
      new_values_json := new_values_json || jsonb_build_object('full_name', NEW.full_name);
      change_summary_text := change_summary_text || 'Nombre: ' || OLD.full_name || ' → ' || NEW.full_name || '; ';
    END IF;

    IF OLD.email IS DISTINCT FROM NEW.email THEN
      changed_fields_array := array_append(changed_fields_array, 'email');
      old_values_json := old_values_json || jsonb_build_object('email', OLD.email);
      new_values_json := new_values_json || jsonb_build_object('email', NEW.email);
      change_summary_text := change_summary_text || 'Email: ' || COALESCE(OLD.email, 'null') || ' → ' || COALESCE(NEW.email, 'null') || '; ';
    END IF;

    IF OLD.phone != NEW.phone THEN
      changed_fields_array := array_append(changed_fields_array, 'phone');
      old_values_json := old_values_json || jsonb_build_object('phone', OLD.phone);
      new_values_json := new_values_json || jsonb_build_object('phone', NEW.phone);
      change_summary_text := change_summary_text || 'Teléfono: ' || OLD.phone || ' → ' || NEW.phone || '; ';
    END IF;

    IF OLD.status != NEW.status THEN
      changed_fields_array := array_append(changed_fields_array, 'status');
      old_values_json := old_values_json || jsonb_build_object('status', OLD.status);
      new_values_json := new_values_json || jsonb_build_object('status', NEW.status);
      change_summary_text := change_summary_text || 'Estado: ' || OLD.status || ' → ' || NEW.status || '; ';
    END IF;

    IF OLD.client_type != NEW.client_type THEN
      changed_fields_array := array_append(changed_fields_array, 'client_type');
      old_values_json := old_values_json || jsonb_build_object('client_type', OLD.client_type);
      new_values_json := new_values_json || jsonb_build_object('client_type', NEW.client_type);
      change_summary_text := change_summary_text || 'Tipo: ' || OLD.client_type || ' → ' || NEW.client_type || '; ';
    END IF;

    IF OLD.address IS DISTINCT FROM NEW.address THEN
      changed_fields_array := array_append(changed_fields_array, 'address');
      old_values_json := old_values_json || jsonb_build_object('address', OLD.address);
      new_values_json := new_values_json || jsonb_build_object('address', NEW.address);
    END IF;

    IF OLD.monthly_income IS DISTINCT FROM NEW.monthly_income THEN
      changed_fields_array := array_append(changed_fields_array, 'monthly_income');
      old_values_json := old_values_json || jsonb_build_object('monthly_income', OLD.monthly_income);
      new_values_json := new_values_json || jsonb_build_object('monthly_income', NEW.monthly_income);
    END IF;

    -- Solo registrar si hubo cambios
    IF array_length(changed_fields_array, 1) > 0 THEN
      INSERT INTO client_audit_log (
        client_id,
        changed_by,
        action,
        entity_type,
        changed_fields,
        old_values,
        new_values,
        change_summary
      ) VALUES (
        NEW.id,
        current_user_id,
        'updated',
        'client',
        to_jsonb(changed_fields_array),
        old_values_json,
        new_values_json,
        TRIM(change_summary_text)
      );
    END IF;

    RETURN NEW;
  END IF;

  -- Para DELETE (eliminación)
  IF TG_OP = 'DELETE' THEN
    INSERT INTO client_audit_log (
      client_id,
      changed_by,
      action,
      entity_type,
      old_values,
      change_summary
    ) VALUES (
      OLD.id,
      current_user_id,
      'deleted',
      'client',
      to_jsonb(OLD),
      'Cliente eliminado: ' || OLD.full_name
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. CREAR TRIGGERS
-- =====================================================

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS client_audit_trigger ON clients;

-- Crear trigger para tabla clients
CREATE TRIGGER client_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON clients
FOR EACH ROW EXECUTE FUNCTION log_client_changes();

-- =====================================================
-- 5. POLÍTICAS RLS (Row Level Security)
-- =====================================================

ALTER TABLE client_audit_log ENABLE ROW LEVEL SECURITY;

-- Los asesores pueden ver el log de auditoría de sus clientes
CREATE POLICY "Advisors can view audit log"
  ON client_audit_log FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = client_audit_log.client_id
    )
  );

-- El sistema puede insertar logs
CREATE POLICY "System can insert audit logs"
  ON client_audit_log FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 6. FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para obtener historial de un cliente
CREATE OR REPLACE FUNCTION get_client_audit_history(p_client_id UUID, p_limit INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  action VARCHAR(50),
  changed_by_name VARCHAR(255),
  change_summary TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cal.id,
    cal.action,
    COALESCE(a.full_name, 'Sistema') as changed_by_name,
    cal.change_summary,
    cal.created_at
  FROM client_audit_log cal
  LEFT JOIN advisors a ON cal.changed_by = a.id
  WHERE cal.client_id = p_client_id
  ORDER BY cal.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar cambio manual (para tablas relacionadas)
CREATE OR REPLACE FUNCTION log_manual_change(
  p_client_id UUID,
  p_action VARCHAR(50),
  p_entity_type VARCHAR(50),
  p_change_summary TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Obtener ID del usuario actual
  BEGIN
    current_user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    current_user_id := NULL;
  END;

  INSERT INTO client_audit_log (
    client_id,
    changed_by,
    action,
    entity_type,
    old_values,
    new_values,
    change_summary
  ) VALUES (
    p_client_id,
    current_user_id,
    p_action,
    p_entity_type,
    p_old_values,
    p_new_values,
    p_change_summary
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. COMENTARIOS
-- =====================================================

COMMENT ON TABLE client_audit_log IS 'Registro de auditoría de cambios en clientes';
COMMENT ON COLUMN client_audit_log.action IS 'Tipo de acción: created, updated, deleted, status_changed';
COMMENT ON COLUMN client_audit_log.changed_fields IS 'Array JSON de campos que cambiaron';
COMMENT ON COLUMN client_audit_log.old_values IS 'Valores anteriores en formato JSON';
COMMENT ON COLUMN client_audit_log.new_values IS 'Valores nuevos en formato JSON';
COMMENT ON COLUMN client_audit_log.change_summary IS 'Resumen legible del cambio';

-- =====================================================
-- 8. EJEMPLO DE USO
-- =====================================================

/*
-- Ver historial de un cliente
SELECT * FROM get_client_audit_history('uuid-del-cliente');

-- Registrar cambio manual en credenciales
SELECT log_manual_change(
  'uuid-del-cliente',
  'credentials_updated',
  'client_portal_credentials',
  'Contraseña cambiada por el usuario',
  '{"password_changed": true}'::jsonb,
  NULL
);

-- Consulta directa de cambios recientes
SELECT 
  cal.created_at,
  cal.action,
  c.full_name as client_name,
  COALESCE(a.full_name, 'Sistema') as changed_by,
  cal.change_summary
FROM client_audit_log cal
LEFT JOIN clients c ON cal.client_id = c.id
LEFT JOIN advisors a ON cal.changed_by = a.id
WHERE cal.created_at >= NOW() - INTERVAL '7 days'
ORDER BY cal.created_at DESC
LIMIT 100;
*/

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

SELECT '✅ Sistema de auditoría de clientes creado exitosamente' as status;
