-- =====================================================
-- FIX: PERMITIR changed_by NULL EN AUDIT LOG
-- =====================================================
-- El problema: changed_by tiene FK a advisors, pero no todos
-- los usuarios que editan clientes están en advisors
-- Solución: Hacer la FK nullable y opcional

-- 1. Eliminar la constraint actual
ALTER TABLE client_audit_log 
DROP CONSTRAINT IF EXISTS client_audit_log_changed_by_fkey;

-- 2. Hacer la columna nullable si no lo es
ALTER TABLE client_audit_log 
ALTER COLUMN changed_by DROP NOT NULL;

-- 3. Recrear la constraint pero con ON DELETE SET NULL
-- Esto permite que changed_by sea NULL si el asesor no existe
ALTER TABLE client_audit_log
ADD CONSTRAINT client_audit_log_changed_by_fkey 
FOREIGN KEY (changed_by) 
REFERENCES advisors(id) 
ON DELETE SET NULL;

-- 4. Crear índice parcial (solo para registros con changed_by no nulo)
DROP INDEX IF EXISTS idx_audit_log_changed_by;
CREATE INDEX idx_audit_log_changed_by 
ON client_audit_log(changed_by) 
WHERE changed_by IS NOT NULL;

-- =====================================================
-- 5. ACTUALIZAR FUNCIÓN log_client_changes
-- =====================================================
-- Modificar para intentar encontrar el asesor del usuario actual

CREATE OR REPLACE FUNCTION log_client_changes()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields_array TEXT[] := ARRAY[]::TEXT[];
  old_values_json JSONB := '{}'::jsonb;
  new_values_json JSONB := '{}'::jsonb;
  change_summary_text TEXT := '';
  current_user_id UUID;
  current_advisor_id UUID;
BEGIN
  -- Obtener ID del usuario actual
  BEGIN
    current_user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    current_user_id := NULL;
  END;

  -- ✅ NUEVO: Intentar obtener el advisor_id del usuario actual
  -- Si el usuario actual es un asesor, usar su ID
  -- Si no, dejar como NULL
  IF current_user_id IS NOT NULL THEN
    BEGIN
      SELECT id INTO current_advisor_id
      FROM advisors
      WHERE id = current_user_id
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      current_advisor_id := NULL;
    END;
  ELSE
    current_advisor_id := NULL;
  END IF;

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
      current_advisor_id, -- ✅ Puede ser NULL si no es asesor
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
    IF OLD.full_name IS DISTINCT FROM NEW.full_name THEN
      changed_fields_array := array_append(changed_fields_array, 'full_name');
      old_values_json := old_values_json || jsonb_build_object('full_name', OLD.full_name);
      new_values_json := new_values_json || jsonb_build_object('full_name', NEW.full_name);
      change_summary_text := change_summary_text || 'Nombre: ' || COALESCE(OLD.full_name, 'NULL') || ' → ' || COALESCE(NEW.full_name, 'NULL') || '; ';
    END IF;

    IF OLD.email IS DISTINCT FROM NEW.email THEN
      changed_fields_array := array_append(changed_fields_array, 'email');
      old_values_json := old_values_json || jsonb_build_object('email', OLD.email);
      new_values_json := new_values_json || jsonb_build_object('email', NEW.email);
      change_summary_text := change_summary_text || 'Email: ' || COALESCE(OLD.email, 'NULL') || ' → ' || COALESCE(NEW.email, 'NULL') || '; ';
    END IF;

    IF OLD.phone IS DISTINCT FROM NEW.phone THEN
      changed_fields_array := array_append(changed_fields_array, 'phone');
      old_values_json := old_values_json || jsonb_build_object('phone', OLD.phone);
      new_values_json := new_values_json || jsonb_build_object('phone', NEW.phone);
      change_summary_text := change_summary_text || 'Teléfono: ' || COALESCE(OLD.phone, 'NULL') || ' → ' || COALESCE(NEW.phone, 'NULL') || '; ';
    END IF;

    IF OLD.status IS DISTINCT FROM NEW.status THEN
      changed_fields_array := array_append(changed_fields_array, 'status');
      old_values_json := old_values_json || jsonb_build_object('status', OLD.status);
      new_values_json := new_values_json || jsonb_build_object('status', NEW.status);
      change_summary_text := change_summary_text || 'Estado: ' || COALESCE(OLD.status, 'NULL') || ' → ' || COALESCE(NEW.status, 'NULL') || '; ';
    END IF;

    IF OLD.client_type IS DISTINCT FROM NEW.client_type THEN
      changed_fields_array := array_append(changed_fields_array, 'client_type');
      old_values_json := old_values_json || jsonb_build_object('client_type', OLD.client_type);
      new_values_json := new_values_json || jsonb_build_object('client_type', NEW.client_type);
      change_summary_text := change_summary_text || 'Tipo: ' || COALESCE(OLD.client_type, 'NULL') || ' → ' || COALESCE(NEW.client_type, 'NULL') || '; ';
    END IF;

    IF OLD.address IS DISTINCT FROM NEW.address THEN
      changed_fields_array := array_append(changed_fields_array, 'address');
      old_values_json := old_values_json || jsonb_build_object('address', OLD.address);
      new_values_json := new_values_json || jsonb_build_object('address', NEW.address);
      change_summary_text := change_summary_text || 'Dirección actualizada; ';
    END IF;

    IF OLD.city IS DISTINCT FROM NEW.city THEN
      changed_fields_array := array_append(changed_fields_array, 'city');
      old_values_json := old_values_json || jsonb_build_object('city', OLD.city);
      new_values_json := new_values_json || jsonb_build_object('city', NEW.city);
      change_summary_text := change_summary_text || 'Ciudad: ' || COALESCE(OLD.city, 'NULL') || ' → ' || COALESCE(NEW.city, 'NULL') || '; ';
    END IF;

    IF OLD.monthly_income IS DISTINCT FROM NEW.monthly_income THEN
      changed_fields_array := array_append(changed_fields_array, 'monthly_income');
      old_values_json := old_values_json || jsonb_build_object('monthly_income', OLD.monthly_income);
      new_values_json := new_values_json || jsonb_build_object('monthly_income', NEW.monthly_income);
      change_summary_text := change_summary_text || 'Ingreso mensual actualizado; ';
    END IF;

    IF OLD.assigned_advisor_id IS DISTINCT FROM NEW.assigned_advisor_id THEN
      changed_fields_array := array_append(changed_fields_array, 'assigned_advisor_id');
      old_values_json := old_values_json || jsonb_build_object('assigned_advisor_id', OLD.assigned_advisor_id);
      new_values_json := new_values_json || jsonb_build_object('assigned_advisor_id', NEW.assigned_advisor_id);
      change_summary_text := change_summary_text || 'Asesor asignado cambiado; ';
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
        current_advisor_id, -- ✅ Puede ser NULL
        'updated',
        'client',
        to_jsonb(changed_fields_array),
        old_values_json,
        new_values_json,
        TRIM(TRAILING '; ' FROM change_summary_text)
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
      current_advisor_id, -- ✅ Puede ser NULL
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
-- 6. ACTUALIZAR FUNCIÓN log_manual_change
-- =====================================================

CREATE OR REPLACE FUNCTION log_manual_change(
  p_client_id UUID,
  p_action VARCHAR(50),
  p_entity_type VARCHAR(50),
  p_change_summary TEXT
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  current_user_id UUID;
  current_advisor_id UUID;
BEGIN
  -- Obtener usuario actual
  BEGIN
    current_user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    current_user_id := NULL;
  END;

  -- ✅ NUEVO: Buscar si el usuario es un asesor
  IF current_user_id IS NOT NULL THEN
    BEGIN
      SELECT id INTO current_advisor_id
      FROM advisors
      WHERE id = current_user_id
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      current_advisor_id := NULL;
    END;
  ELSE
    current_advisor_id := NULL;
  END IF;

  -- Insertar registro
  INSERT INTO client_audit_log (
    client_id,
    changed_by,
    action,
    entity_type,
    change_summary
  ) VALUES (
    p_client_id,
    current_advisor_id, -- ✅ Puede ser NULL
    p_action,
    p_entity_type,
    p_change_summary
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que la constraint es nullable
SELECT 
  c.column_name,
  c.is_nullable,
  c.data_type
FROM information_schema.columns c
WHERE c.table_name = 'client_audit_log'
  AND c.column_name = 'changed_by';

-- Verificar la nueva constraint
SELECT 
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  CASE con.confdeltype
    WHEN 'a' THEN 'NO ACTION'
    WHEN 'r' THEN 'RESTRICT'
    WHEN 'c' THEN 'CASCADE'
    WHEN 'n' THEN 'SET NULL'
    WHEN 'd' THEN 'SET DEFAULT'
  END AS on_delete_action
FROM pg_constraint con
JOIN pg_class cls ON con.conrelid = cls.oid
WHERE cls.relname = 'client_audit_log'
  AND con.conname LIKE '%changed_by%';

COMMENT ON TABLE client_audit_log IS 'Registra todos los cambios realizados a los clientes. changed_by puede ser NULL si el usuario no es un asesor.';
