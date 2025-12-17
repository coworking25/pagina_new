-- =====================================================
-- FIX: TRIGGER DE AUDITORÍA PARA DELETE
-- =====================================================
-- El problema es que el trigger se ejecuta AFTER DELETE
-- pero intenta insertar en client_audit_log con un client_id
-- que ya no existe en la tabla clients

-- Solución: Cambiar el trigger a BEFORE DELETE para capturar
-- los datos antes de eliminar

-- 1. Eliminar el trigger actual
DROP TRIGGER IF EXISTS client_audit_trigger ON clients;

-- 2. Recrear el trigger como BEFORE para DELETE y AFTER para INSERT/UPDATE
CREATE TRIGGER client_audit_trigger
  AFTER INSERT OR UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION log_client_changes();

CREATE TRIGGER client_audit_trigger_before_delete
  BEFORE DELETE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION log_client_changes();

SELECT '✅ Triggers de auditoría actualizados correctamente' as status;
