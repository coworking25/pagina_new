-- Req 50: Activar Triggers de Auditoría
-- Este script activa el registro de cambios para las tablas críticas

-- 1. Propiedades
DROP TRIGGER IF EXISTS audit_properties_trigger ON properties;
CREATE TRIGGER audit_properties_trigger
AFTER INSERT OR UPDATE OR DELETE ON properties
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- 2. Citas
DROP TRIGGER IF EXISTS audit_appointments_trigger ON appointments;
CREATE TRIGGER audit_appointments_trigger
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- 3. Clientes
DROP TRIGGER IF EXISTS audit_clients_trigger ON clients;
CREATE TRIGGER audit_clients_trigger
AFTER INSERT OR UPDATE OR DELETE ON clients
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- 4. Amenidades (Nuevo Req 77)
DROP TRIGGER IF EXISTS audit_amenities_trigger ON amenities;
CREATE TRIGGER audit_amenities_trigger
AFTER INSERT OR UPDATE OR DELETE ON amenities
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- 5. Asesores (Advisors)
DROP TRIGGER IF EXISTS audit_advisors_trigger ON advisors;
CREATE TRIGGER audit_advisors_trigger
AFTER INSERT OR UPDATE OR DELETE ON advisors
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- 6. Configuraciones (Settings)
DROP TRIGGER IF EXISTS audit_settings_trigger ON settings;
CREATE TRIGGER audit_settings_trigger
AFTER INSERT OR UPDATE OR DELETE ON settings
FOR EACH ROW EXECUTE FUNCTION log_audit_event();
