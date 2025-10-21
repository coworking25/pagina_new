-- ===================================================================
-- CORRECCIÓN MASIVA DE POLÍTICAS RLS - TODAS LAS TABLAS CLIENT*
-- ===================================================================
-- Problema: 9 tablas verifican "advisors" en lugar de usar is_admin()
-- Solución: Reemplazar TODAS las políticas para usar is_admin()
-- ===================================================================

-- 1. CLIENT_ALERTS
DROP POLICY IF EXISTS "Admins have full access to alerts" ON client_alerts;
CREATE POLICY "Admins have full access to alerts"
ON client_alerts FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 2. CLIENT_COMMUNICATIONS
DROP POLICY IF EXISTS "Admins have full access to communications" ON client_communications;
CREATE POLICY "Admins have full access to communications"
ON client_communications FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 3. CLIENT_CONTRACT_INFO
DROP POLICY IF EXISTS "Admins have full access to contract info" ON client_contract_info;
CREATE POLICY "Admins have full access to contract info"
ON client_contract_info FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 4. CLIENT_CREDENTIALS
DROP POLICY IF EXISTS "Admins have full access to credentials" ON client_credentials;
CREATE POLICY "Admins have full access to credentials"
ON client_credentials FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 5. CLIENT_DOCUMENTS
DROP POLICY IF EXISTS "Admins have full access to documents" ON client_documents;
CREATE POLICY "Admins have full access to documents"
ON client_documents FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 6. CLIENT_PAYMENT_CONFIG
DROP POLICY IF EXISTS "Admins have full access to payment configs" ON client_payment_config;
CREATE POLICY "Admins have full access to payment configs"
ON client_payment_config FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 7. CLIENT_PORTAL_CREDENTIALS
DROP POLICY IF EXISTS "Admins have full access to credentials" ON client_portal_credentials;
CREATE POLICY "Admins have full access to credentials"
ON client_portal_credentials FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 8. CLIENT_PROPERTY_RELATIONS
DROP POLICY IF EXISTS "Admins have full access to property relations" ON client_property_relations;
CREATE POLICY "Admins have full access to property relations"
ON client_property_relations FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 9. CLIENT_REFERENCES
DROP POLICY IF EXISTS "Admins have full access to references" ON client_references;
CREATE POLICY "Admins have full access to references"
ON client_references FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- ===================================================================
-- VERIFICACIÓN: Ver todas las políticas actualizadas
-- ===================================================================

SELECT 
  '✅ POLÍTICAS ACTUALIZADAS' as resultado,
  tablename as tabla,
  policyname as politica,
  cmd as comando,
  CASE 
    WHEN qual LIKE '%is_admin()%' THEN '✅ CORRECTO'
    WHEN qual LIKE '%advisors%' THEN '❌ SIGUE MAL'
    ELSE '⚠️ REVISAR'
  END as estado_using,
  CASE 
    WHEN with_check LIKE '%is_admin()%' THEN '✅ CORRECTO'
    WHEN with_check LIKE '%advisors%' THEN '❌ SIGUE MAL'
    WHEN with_check IS NULL THEN '➖ N/A'
    ELSE '⚠️ REVISAR'
  END as estado_with_check
FROM pg_policies
WHERE tablename LIKE 'client%'
  AND policyname LIKE '%Admins have full access%'
ORDER BY tablename;
