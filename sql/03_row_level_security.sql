-- =====================================================
-- FASE 1.3: ROW LEVEL SECURITY (RLS) PARA PORTAL DE CLIENTES
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Fecha: 15 Octubre 2025

-- IMPORTANTE: RLS asegura que cada cliente solo vea SUS propios datos

-- =====================================================
-- 1. HABILITAR RLS EN TABLAS RELEVANTES
-- =====================================================

-- Ya deberían estar habilitadas, pero por si acaso:
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_property_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_credentials ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. CREAR FUNCIÓN HELPER para obtener client_id del usuario autenticado
-- =====================================================

CREATE OR REPLACE FUNCTION get_authenticated_client_id()
RETURNS UUID AS $$
BEGIN
  -- Obtener client_id desde la sesión de auth
  -- Supabase almacena el email en auth.email()
  RETURN (
    SELECT client_id 
    FROM client_credentials 
    WHERE email = auth.email() 
      AND is_active = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. POLÍTICAS PARA CLIENTES (Portal de Clientes)
-- =====================================================

-- 3.1 CLIENTS - Clientes pueden ver solo su información
DROP POLICY IF EXISTS "Clients can view own profile" ON clients;
CREATE POLICY "Clients can view own profile" ON clients
  FOR SELECT
  USING (id = get_authenticated_client_id());

DROP POLICY IF EXISTS "Clients can update own profile" ON clients;
CREATE POLICY "Clients can update own profile" ON clients
  FOR UPDATE
  USING (id = get_authenticated_client_id())
  WITH CHECK (id = get_authenticated_client_id());

-- 3.2 CONTRACTS - Clientes pueden ver sus contratos
DROP POLICY IF EXISTS "Clients can view own contracts" ON contracts;
CREATE POLICY "Clients can view own contracts" ON contracts
  FOR SELECT
  USING (
    client_id = get_authenticated_client_id() 
    OR landlord_id = get_authenticated_client_id()
  );

-- 3.3 PAYMENTS - Clientes pueden ver sus pagos
DROP POLICY IF EXISTS "Clients can view own payments" ON payments;
CREATE POLICY "Clients can view own payments" ON payments
  FOR SELECT
  USING (
    client_id = get_authenticated_client_id() 
    OR beneficiary_id = get_authenticated_client_id()
  );

-- 3.4 CLIENT_COMMUNICATIONS - Clientes pueden ver sus comunicaciones
DROP POLICY IF EXISTS "Clients can view own communications" ON client_communications;
CREATE POLICY "Clients can view own communications" ON client_communications
  FOR SELECT
  USING (client_id = get_authenticated_client_id());

DROP POLICY IF EXISTS "Clients can create communications" ON client_communications;
CREATE POLICY "Clients can create communications" ON client_communications
  FOR INSERT
  WITH CHECK (client_id = get_authenticated_client_id());

-- 3.5 CLIENT_ALERTS - Clientes pueden ver sus alertas
DROP POLICY IF EXISTS "Clients can view own alerts" ON client_alerts;
CREATE POLICY "Clients can view own alerts" ON client_alerts
  FOR SELECT
  USING (client_id = get_authenticated_client_id());

-- 3.6 CLIENT_DOCUMENTS - Clientes pueden ver sus documentos
DROP POLICY IF EXISTS "Clients can view own documents" ON client_documents;
CREATE POLICY "Clients can view own documents" ON client_documents
  FOR SELECT
  USING (client_id = get_authenticated_client_id());

-- 3.7 CLIENT_PROPERTY_RELATIONS - Clientes pueden ver sus propiedades
DROP POLICY IF EXISTS "Clients can view own property relations" ON client_property_relations;
CREATE POLICY "Clients can view own property relations" ON client_property_relations
  FOR SELECT
  USING (client_id = get_authenticated_client_id());

-- 3.8 CLIENT_CREDENTIALS - Clientes pueden ver/actualizar sus credenciales
DROP POLICY IF EXISTS "Clients can view own credentials" ON client_credentials;
CREATE POLICY "Clients can view own credentials" ON client_credentials
  FOR SELECT
  USING (client_id = get_authenticated_client_id());

DROP POLICY IF EXISTS "Clients can update own credentials" ON client_credentials;
CREATE POLICY "Clients can update own credentials" ON client_credentials
  FOR UPDATE
  USING (client_id = get_authenticated_client_id())
  WITH CHECK (client_id = get_authenticated_client_id());

-- =====================================================
-- 4. POLÍTICAS PARA ADMINISTRADORES (Dashboard Admin)
-- =====================================================

-- Los administradores tienen acceso completo
-- SIMPLIFICADO: Si existe un advisor con ese ID, tiene acceso

DROP POLICY IF EXISTS "Admins have full access to clients" ON clients;
CREATE POLICY "Admins have full access to clients" ON clients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins have full access to contracts" ON contracts;
CREATE POLICY "Admins have full access to contracts" ON contracts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins have full access to payments" ON payments;
CREATE POLICY "Admins have full access to payments" ON payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins have full access to communications" ON client_communications;
CREATE POLICY "Admins have full access to communications" ON client_communications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins have full access to alerts" ON client_alerts;
CREATE POLICY "Admins have full access to alerts" ON client_alerts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins have full access to documents" ON client_documents;
CREATE POLICY "Admins have full access to documents" ON client_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins have full access to property relations" ON client_property_relations;
CREATE POLICY "Admins have full access to property relations" ON client_property_relations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins have full access to credentials" ON client_credentials;
CREATE POLICY "Admins have full access to credentials" ON client_credentials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = auth.uid()
    )
  );

-- =====================================================
-- 5. VERIFICACIÓN DE POLÍTICAS
-- =====================================================

-- Ver todas las políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'clients', 
    'contracts', 
    'payments', 
    'client_communications',
    'client_alerts',
    'client_documents',
    'client_property_relations',
    'client_credentials'
  )
ORDER BY tablename, policyname;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Los clientes solo pueden VER sus datos, no modificar (excepto perfil y credenciales)
-- 2. Los administradores tienen acceso completo a todo
-- 3. Las políticas usan get_authenticated_client_id() para seguridad
-- 4. Si un cliente intenta acceder a datos de otro, recibirá 0 resultados

-- ✅ Script completado
-- Siguiente paso: 04_extract_functions.sql
