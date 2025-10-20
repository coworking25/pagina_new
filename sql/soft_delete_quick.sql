-- =====================================================
-- SCRIPT RÁPIDO PARA AGREGAR SOFT DELETE
-- Ejecutar en SQL Editor de Supabase
-- =====================================================

-- Agregar columna deleted_at a las tablas principales
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE property_appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE service_inquiries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_advisors_deleted_at ON advisors(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON clients(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_properties_deleted_at ON properties(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_property_appointments_deleted_at ON property_appointments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_inquiries_deleted_at ON service_inquiries(deleted_at) WHERE deleted_at IS NULL;

-- Verificar que las columnas se crearon
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND column_name = 'deleted_at'
    AND table_name IN ('advisors', 'clients', 'properties', 'property_appointments', 'service_inquiries')
ORDER BY table_name;