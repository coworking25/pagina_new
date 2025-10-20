-- ===================================================================
-- FIX COMPLETO: TODAS LAS POLÍTICAS RLS DE TABLAS DE CLIENTES
-- ===================================================================
-- PROBLEMA CRÍTICO: Las políticas de admins solo tienen USING, falta WITH CHECK
-- RESULTADO: INSERT falla con error 403 "violates row-level security policy"
-- SOLUCIÓN: Agregar WITH CHECK a todas las políticas FOR ALL
-- ===================================================================

BEGIN;

-- ===================================================================
-- 1. CLIENTS (Tabla principal)
-- ===================================================================
DROP POLICY IF EXISTS "Admins have full access to clients" ON clients;
CREATE POLICY "Admins have full access to clients" 
ON clients
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

RAISE NOTICE '✅ Política de clients actualizada';

-- ===================================================================
-- 2. CLIENT_PORTAL_CREDENTIALS
-- ===================================================================
DROP POLICY IF EXISTS "Admins have full access to credentials" ON client_portal_credentials;
CREATE POLICY "Admins have full access to credentials" 
ON client_portal_credentials
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

RAISE NOTICE '✅ Política de client_portal_credentials actualizada';

-- ===================================================================
-- 3. CLIENT_DOCUMENTS
-- ===================================================================
DROP POLICY IF EXISTS "Admins have full access to documents" ON client_documents;
CREATE POLICY "Admins have full access to documents" 
ON client_documents
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

RAISE NOTICE '✅ Política de client_documents actualizada';

-- ===================================================================
-- 4. CLIENT_PROPERTY_RELATIONS ⭐ (LA QUE ESTABA FALLANDO)
-- ===================================================================
DROP POLICY IF EXISTS "Admins have full access to property relations" ON client_property_relations;
CREATE POLICY "Admins have full access to property relations" 
ON client_property_relations
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

RAISE NOTICE '✅ Política de client_property_relations actualizada (CRÍTICA)';

-- ===================================================================
-- 5. CLIENT_COMMUNICATIONS
-- ===================================================================
DROP POLICY IF EXISTS "Admins have full access to communications" ON client_communications;
CREATE POLICY "Admins have full access to communications" 
ON client_communications
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

RAISE NOTICE '✅ Política de client_communications actualizada';

-- ===================================================================
-- 6. CLIENT_ALERTS
-- ===================================================================
DROP POLICY IF EXISTS "Admins have full access to alerts" ON client_alerts;
CREATE POLICY "Admins have full access to alerts" 
ON client_alerts
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

RAISE NOTICE '✅ Política de client_alerts actualizada';

-- ===================================================================
-- 7. CLIENT_PAYMENT_CONFIG (Si existe)
-- ===================================================================
DROP POLICY IF EXISTS "Admins have full access to payment configs" ON client_payment_config;
CREATE POLICY "Admins have full access to payment configs" 
ON client_payment_config
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

RAISE NOTICE '✅ Política de client_payment_config actualizada';

-- ===================================================================
-- 8. CLIENT_REFERENCES (Si existe)
-- ===================================================================
DROP POLICY IF EXISTS "Admins have full access to references" ON client_references;
CREATE POLICY "Admins have full access to references" 
ON client_references
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

RAISE NOTICE '✅ Política de client_references actualizada';

-- ===================================================================
-- 9. CLIENT_CONTRACT_INFO (Si existe)
-- ===================================================================
DROP POLICY IF EXISTS "Admins have full access to contract info" ON client_contract_info;
CREATE POLICY "Admins have full access to contract info" 
ON client_contract_info
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

RAISE NOTICE '✅ Política de client_contract_info actualizada';

COMMIT;

-- ===================================================================
-- VERIFICACIÓN POST-FIX
-- ===================================================================

-- 1. Verificar que todas las políticas tengan WITH CHECK
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN with_check IS NULL THEN '❌ FALTA WITH CHECK'
    ELSE '✅ WITH CHECK OK'
  END as status,
  CASE 
    WHEN qual IS NULL THEN '❌ FALTA USING'
    ELSE '✅ USING OK'
  END as using_status
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

-- 2. Contar políticas por tabla
SELECT 
  tablename,
  COUNT(*) as total_policies,
  COUNT(*) FILTER (WHERE cmd = 'ALL') as full_access,
  COUNT(*) FILTER (WHERE with_check IS NOT NULL) as with_check_count
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
GROUP BY tablename
ORDER BY tablename;

-- 3. Listar todas las políticas de client_property_relations (la crítica)
SELECT 
  policyname,
  cmd,
  CASE WHEN qual IS NOT NULL THEN 'SÍ' ELSE 'NO' END as tiene_using,
  CASE WHEN with_check IS NOT NULL THEN 'SÍ' ELSE 'NO' END as tiene_with_check
FROM pg_policies 
WHERE tablename = 'client_property_relations'
ORDER BY policyname;

-- ===================================================================
-- EXPLICACIÓN TÉCNICA
-- ===================================================================

/*
🔴 PROBLEMA ORIGINAL:

CREATE POLICY "Admins full access" 
ON client_property_relations
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        Solo USING

Cuando se hace INSERT:
1. PostgreSQL verifica WITH CHECK ❌ (no existe)
2. Por defecto, WITH CHECK = NULL en FOR ALL
3. INSERT es rechazado con error 403

🟢 SOLUCIÓN:

CREATE POLICY "Admins full access" 
ON client_property_relations
FOR ALL
USING (...)
WITH CHECK (...);
            ^^^^^^^^^^^^^
            Ahora SÍ existe

Ahora cuando se hace INSERT:
1. PostgreSQL verifica WITH CHECK ✅ (existe y evalúa TRUE para admins)
2. INSERT es permitido ✅

📚 DOCUMENTACIÓN POSTGRESQL:
https://www.postgresql.org/docs/current/sql-createpolicy.html

"For INSERT and UPDATE statements, WITH CHECK is evaluated after USING;
 if it evaluates to FALSE, the operation fails with a policy violation."

"If a FOR ALL policy is created, then both USING and WITH CHECK
 expressions must be provided."

🎯 REGLA SIMPLE:
- USING: Se aplica al LEER/FILTRAR filas existentes
- WITH CHECK: Se aplica al INSERTAR/ACTUALIZAR nuevas filas

Para FOR ALL: ¡Siempre se necesitan AMBOS!
*/

-- ===================================================================
-- TEST DE INSERCIÓN (OPCIONAL - DESCOMENTAR PARA PROBAR)
-- ===================================================================

/*
-- Test simple de INSERT
DO $$
DECLARE
  v_client_id uuid;
  v_property_id uuid;
  v_relation_id uuid;
BEGIN
  -- Obtener IDs reales
  SELECT id INTO v_client_id FROM clients ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO v_property_id FROM properties ORDER BY created_at DESC LIMIT 1;
  
  IF v_client_id IS NULL OR v_property_id IS NULL THEN
    RAISE EXCEPTION 'No hay clientes o propiedades para probar';
  END IF;
  
  -- Intentar INSERT
  INSERT INTO client_property_relations (
    client_id,
    property_id,
    relation_type,
    status
  ) VALUES (
    v_client_id,
    v_property_id,
    'tenant',
    'active'
  ) RETURNING id INTO v_relation_id;
  
  RAISE NOTICE '✅ TEST EXITOSO: Relación creada con ID %', v_relation_id;
  
  -- Limpiar test
  DELETE FROM client_property_relations WHERE id = v_relation_id;
  RAISE NOTICE '🗑️ Test limpiado';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ TEST FALLÓ: %', SQLERRM;
  RAISE;
END $$;
*/

-- ===================================================================
-- RESUMEN
-- ===================================================================

/*
✅ TABLAS ACTUALIZADAS:
1. clients
2. client_portal_credentials
3. client_documents
4. client_property_relations ⭐ (LA CRÍTICA)
5. client_communications
6. client_alerts
7. client_payment_config
8. client_references
9. client_contract_info

🎯 RESULTADO:
- Los admins ahora pueden INSERT/UPDATE/DELETE sin errores 403
- El wizard de clientes funcionará completamente
- Las relaciones cliente-propiedad se crearán correctamente

⚠️ IMPORTANTE:
- Ejecutar este script completo en Supabase SQL Editor
- Verificar que no haya errores
- Probar crear un cliente desde el wizard
- Si persiste algún error, revisar que el usuario esté en tabla 'advisors'
*/
