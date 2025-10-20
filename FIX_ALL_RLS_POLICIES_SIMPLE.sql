-- ===================================================================
-- FIX COMPLETO: POLÍTICAS RLS SIN WITH CHECK
-- ===================================================================
-- Versión simplificada - ejecutar directamente en Supabase SQL Editor
-- ===================================================================

-- 1. CLIENTS
DROP POLICY IF EXISTS "Admins have full access to clients" ON clients;
CREATE POLICY "Admins have full access to clients" 
ON clients
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- 2. CLIENT_DOCUMENTS
DROP POLICY IF EXISTS "Admins have full access to documents" ON client_documents;
CREATE POLICY "Admins have full access to documents" 
ON client_documents
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- 3. CLIENT_PROPERTY_RELATIONS (ya está bien, pero por consistencia)
DROP POLICY IF EXISTS "Admins have full access to property relations" ON client_property_relations;
CREATE POLICY "Admins have full access to property relations" 
ON client_property_relations
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- 4. CLIENT_PORTAL_CREDENTIALS
DROP POLICY IF EXISTS "Admins have full access to credentials" ON client_portal_credentials;
CREATE POLICY "Admins have full access to credentials" 
ON client_portal_credentials
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- 5. CLIENT_COMMUNICATIONS (si existe)
DROP POLICY IF EXISTS "Admins have full access to communications" ON client_communications;
CREATE POLICY "Admins have full access to communications" 
ON client_communications
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- 6. CLIENT_ALERTS (si existe)
DROP POLICY IF EXISTS "Admins have full access to alerts" ON client_alerts;
CREATE POLICY "Admins have full access to alerts" 
ON client_alerts
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- 7. CLIENT_PAYMENT_CONFIG (si existe)
DROP POLICY IF EXISTS "Admins have full access to payment configs" ON client_payment_config;
CREATE POLICY "Admins have full access to payment configs" 
ON client_payment_config
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- 8. CLIENT_REFERENCES (si existe)
DROP POLICY IF EXISTS "Admins have full access to references" ON client_references;
CREATE POLICY "Admins have full access to references" 
ON client_references
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- 9. CLIENT_CONTRACT_INFO (si existe)
DROP POLICY IF EXISTS "Admins have full access to contract info" ON client_contract_info;
CREATE POLICY "Admins have full access to contract info" 
ON client_contract_info
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- ===================================================================
-- VERIFICACIÓN: Ejecutar después del fix
-- ===================================================================

SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN with_check IS NULL THEN '❌ FALTA WITH CHECK'
    ELSE '✅ WITH CHECK OK'
  END as status
FROM pg_policies 
WHERE tablename IN (
  'clients',
  'client_portal_credentials',
  'client_documents',
  'client_property_relations',
  'client_communications',
  'client_alerts',
  'client_payment_config',
  'client_references',
  'client_contract_info'
)
AND policyname LIKE '%Admin%'
ORDER BY tablename;

-- ===================================================================
-- RESULTADO ESPERADO: Todas las políticas deben mostrar "✅ WITH CHECK OK"
-- ===================================================================
