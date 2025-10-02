-- =====================================================
-- IMPLEMENTACIÓN DE SOFT DELETE EN TODAS LAS TABLAS
-- =====================================================

-- =====================================================
-- 1. AGREGAR CAMPO deleted_at A TODAS LAS TABLAS
-- =====================================================

-- Advisors table (ya tiene is_active, agregar deleted_at)
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Properties table (asumiendo que existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties') THEN
        ALTER TABLE properties ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Property appointments table
ALTER TABLE property_appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Contracts table
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Service inquiries table
ALTER TABLE service_inquiries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Client communications table
ALTER TABLE client_communications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Client documents table
ALTER TABLE client_documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Client alerts table
ALTER TABLE client_alerts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 2. CREAR ÍNDICES PARA deleted_at
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_advisors_deleted_at ON advisors(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON clients(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_properties_deleted_at ON properties(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_property_appointments_deleted_at ON property_appointments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_deleted_at ON contracts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payments_deleted_at ON payments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_inquiries_deleted_at ON service_inquiries(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_client_communications_deleted_at ON client_communications(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_client_documents_deleted_at ON client_documents(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_client_alerts_deleted_at ON client_alerts(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- 3. ACTUALIZAR POLÍTICAS RLS PARA INCLUIR SOFT DELETE
-- =====================================================

-- Advisors policies
DROP POLICY IF EXISTS "Advisors are viewable by authenticated users" ON advisors;
DROP POLICY IF EXISTS "Advisors are manageable by admins" ON advisors;

CREATE POLICY "Advisors are viewable by authenticated users"
  ON advisors FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Advisors are manageable by admins"
  ON advisors FOR ALL
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  ))
  WITH CHECK (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  ));

-- Clients policies
DROP POLICY IF EXISTS "Clients are viewable by authenticated users" ON clients;
DROP POLICY IF EXISTS "Clients are manageable by authenticated users" ON clients;

CREATE POLICY "Clients are viewable by authenticated users"
  ON clients FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Clients are manageable by authenticated users"
  ON clients FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Properties policies (si existe la tabla)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Properties are viewable by authenticated users" ON properties';
        EXECUTE 'DROP POLICY IF EXISTS "Properties are manageable by authenticated users" ON properties';

        EXECUTE 'CREATE POLICY "Properties are viewable by authenticated users"
          ON properties FOR SELECT
          USING (auth.role() = ''authenticated'' AND deleted_at IS NULL)';

        EXECUTE 'CREATE POLICY "Properties are manageable by authenticated users"
          ON properties FOR ALL
          USING (auth.role() = ''authenticated'')
          WITH CHECK (auth.role() = ''authenticated'')';
    END IF;
END $$;

-- Property appointments policies
DROP POLICY IF EXISTS "Property appointments are viewable by authenticated users" ON property_appointments;
DROP POLICY IF EXISTS "Property appointments are manageable by authenticated users" ON property_appointments;

CREATE POLICY "Property appointments are viewable by authenticated users"
  ON property_appointments FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Property appointments are manageable by authenticated users"
  ON property_appointments FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Contracts policies
DROP POLICY IF EXISTS "Contracts are viewable by authenticated users" ON contracts;
DROP POLICY IF EXISTS "Contracts are manageable by authenticated users" ON contracts;

CREATE POLICY "Contracts are viewable by authenticated users"
  ON contracts FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Contracts are manageable by authenticated users"
  ON contracts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Payments policies
DROP POLICY IF EXISTS "Payments are viewable by authenticated users" ON payments;
DROP POLICY IF EXISTS "Payments are manageable by authenticated users" ON payments;

CREATE POLICY "Payments are viewable by authenticated users"
  ON payments FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Payments are manageable by authenticated users"
  ON payments FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Service inquiries policies
DROP POLICY IF EXISTS "Service inquiries are viewable by authenticated users" ON service_inquiries;
DROP POLICY IF EXISTS "Service inquiries are manageable by authenticated users" ON service_inquiries;

CREATE POLICY "Service inquiries are viewable by authenticated users"
  ON service_inquiries FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Service inquiries are manageable by authenticated users"
  ON service_inquiries FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- 4. FUNCIONES PARA SOFT DELETE
-- =====================================================

-- Función para soft delete
CREATE OR REPLACE FUNCTION soft_delete_record(table_name TEXT, record_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('UPDATE %I SET deleted_at = NOW() WHERE id = $1', table_name)
    USING record_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para restaurar registro soft deleted
CREATE OR REPLACE FUNCTION restore_record(table_name TEXT, record_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('UPDATE %I SET deleted_at = NULL WHERE id = $1', table_name)
    USING record_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para hard delete (solo para administradores)
CREATE OR REPLACE FUNCTION hard_delete_record(table_name TEXT, record_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar que el usuario sea admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Solo administradores pueden hacer hard delete';
    END IF;

    EXECUTE format('DELETE FROM %I WHERE id = $1', table_name)
    USING record_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. VISTAS PARA REGISTROS ELIMINADOS (SOLO ADMINS)
-- =====================================================

-- Vista para advisors eliminados
CREATE OR REPLACE VIEW deleted_advisors AS
SELECT * FROM advisors WHERE deleted_at IS NOT NULL;

-- Vista para clients eliminados
CREATE OR REPLACE VIEW deleted_clients AS
SELECT * FROM clients WHERE deleted_at IS NOT NULL;

-- Vista para property_appointments eliminados
CREATE OR REPLACE VIEW deleted_property_appointments AS
SELECT * FROM property_appointments WHERE deleted_at IS NOT NULL;

-- Políticas para vistas de eliminados (solo admins)
ALTER VIEW deleted_advisors SET (security_barrier = true);
ALTER VIEW deleted_clients SET (security_barrier = true);
ALTER VIEW deleted_property_appointments SET (security_barrier = true);

-- =====================================================
-- 6. VERIFICACIÓN
-- =====================================================

-- Verificar que las columnas se agregaron correctamente
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND column_name = 'deleted_at'
    AND table_name IN (
        'advisors', 'clients', 'properties', 'property_appointments',
        'contracts', 'payments', 'service_inquiries', 'client_communications',
        'client_documents', 'client_alerts'
    )
ORDER BY table_name;

-- Verificar índices creados
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE '%deleted_at%'
ORDER BY tablename;