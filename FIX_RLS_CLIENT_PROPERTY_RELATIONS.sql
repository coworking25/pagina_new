-- ===================================================================
-- FIX: RLS POLICIES FOR CLIENT_PROPERTY_RELATIONS
-- ===================================================================
-- PROBLEMA: La política de admins solo permite SELECT, no INSERT
-- SOLUCIÓN: Agregar WITH CHECK para permitir INSERT/UPDATE/DELETE
-- ===================================================================

-- 1. Verificar estado actual
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'client_property_relations'
ORDER BY policyname;

-- 2. Eliminar política existente defectuosa
DROP POLICY IF EXISTS "Admins have full access to property relations" ON client_property_relations;

-- 3. Crear política correcta con WITH CHECK
CREATE POLICY "Admins have full access to property relations" 
ON client_property_relations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM advisors 
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM advisors 
    WHERE id = auth.uid()
  )
);

-- 4. Verificar que la política se creó correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ USING presente'
    ELSE '❌ USING faltante'
  END as using_check,
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ WITH CHECK presente'
    ELSE '❌ WITH CHECK faltante'
  END as with_check_status
FROM pg_policies 
WHERE tablename = 'client_property_relations'
  AND policyname = 'Admins have full access to property relations';

-- 5. Test de inserción (ejecutar como admin)
-- NOTA: Reemplazar los IDs con valores reales de tu base de datos
/*
DO $$
DECLARE
  test_client_id uuid;
  test_property_id uuid;
BEGIN
  -- Obtener IDs de prueba
  SELECT id INTO test_client_id FROM clients LIMIT 1;
  SELECT id INTO test_property_id FROM properties LIMIT 1;
  
  -- Intentar inserción
  INSERT INTO client_property_relations (
    client_id,
    property_id,
    relation_type,
    status
  ) VALUES (
    test_client_id,
    test_property_id,
    'tenant',
    'active'
  ) RETURNING id;
  
  RAISE NOTICE 'Test de inserción: ✅ EXITOSO';
  
  -- Limpiar test
  DELETE FROM client_property_relations 
  WHERE client_id = test_client_id 
    AND property_id = test_property_id;
    
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test de inserción: ❌ ERROR - %', SQLERRM;
END $$;
*/

-- 6. Resumen de políticas de todas las tablas de clientes
SELECT 
  tablename,
  COUNT(*) as total_policies,
  COUNT(*) FILTER (WHERE cmd = 'ALL') as full_access_policies,
  COUNT(*) FILTER (WHERE cmd = 'SELECT') as select_policies,
  COUNT(*) FILTER (WHERE cmd = 'INSERT') as insert_policies,
  COUNT(*) FILTER (WHERE cmd = 'UPDATE') as update_policies,
  COUNT(*) FILTER (WHERE cmd = 'DELETE') as delete_policies
FROM pg_policies 
WHERE tablename IN (
  'clients',
  'client_portal_credentials',
  'client_documents',
  'client_payment_config',
  'client_references',
  'client_contract_info',
  'client_property_relations'
)
GROUP BY tablename
ORDER BY tablename;

-- ===================================================================
-- EXPLICACIÓN DEL PROBLEMA
-- ===================================================================

/*
❌ POLÍTICA ANTIGUA (INCORRECTA):
CREATE POLICY "Admins have full access to property relations" 
ON client_property_relations
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

Problema: Solo tiene USING, que funciona para:
- SELECT ✅
- UPDATE ✅ (parcial)
- DELETE ✅ (parcial)
- INSERT ❌ (FALLA - necesita WITH CHECK)

✅ POLÍTICA NUEVA (CORRECTA):
CREATE POLICY "Admins have full access to property relations" 
ON client_property_relations
FOR ALL
USING (...)
WITH CHECK (...);

USING: Se evalúa al LEER/ACTUALIZAR/ELIMINAR
WITH CHECK: Se evalúa al INSERTAR/ACTUALIZAR nuevos valores

Con ambos, ahora funciona:
- SELECT ✅
- INSERT ✅
- UPDATE ✅
- DELETE ✅
*/

-- ===================================================================
-- VERIFICACIÓN ADICIONAL - OTRAS TABLAS
-- ===================================================================

-- Verificar que todas las políticas de admins tengan WITH CHECK
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN with_check IS NULL THEN '⚠️ FALTA WITH CHECK'
    ELSE '✅ WITH CHECK OK'
  END as status
FROM pg_policies 
WHERE tablename IN (
  'clients',
  'client_portal_credentials',
  'client_documents',
  'client_payment_config',
  'client_references',
  'client_contract_info',
  'client_property_relations'
)
AND policyname LIKE '%Admin%'
AND cmd IN ('ALL', 'INSERT', 'UPDATE')
ORDER BY 
  CASE WHEN with_check IS NULL THEN 0 ELSE 1 END,
  tablename;

-- ===================================================================
-- FIX COMPLETO PARA TODAS LAS TABLAS (SI NECESARIO)
-- ===================================================================

-- Si aparecen más tablas sin WITH CHECK, ejecutar esto:

-- CLIENT_PORTAL_CREDENTIALS
DROP POLICY IF EXISTS "Admins have full access to credentials" ON client_portal_credentials;
CREATE POLICY "Admins have full access to credentials" 
ON client_portal_credentials
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- CLIENT_DOCUMENTS
DROP POLICY IF EXISTS "Admins have full access to documents" ON client_documents;
CREATE POLICY "Admins have full access to documents" 
ON client_documents
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- CLIENT_PAYMENT_CONFIG
DROP POLICY IF EXISTS "Admins have full access to payment configs" ON client_payment_config;
CREATE POLICY "Admins have full access to payment configs" 
ON client_payment_config
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- CLIENT_REFERENCES
DROP POLICY IF EXISTS "Admins have full access to references" ON client_references;
CREATE POLICY "Admins have full access to references" 
ON client_references
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- CLIENT_CONTRACT_INFO
DROP POLICY IF EXISTS "Admins have full access to contract info" ON client_contract_info;
CREATE POLICY "Admins have full access to contract info" 
ON client_contract_info
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- CLIENTS (tabla principal)
DROP POLICY IF EXISTS "Admins have full access to clients" ON clients;
CREATE POLICY "Admins have full access to clients" 
ON clients
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- ===================================================================
-- RESULTADO ESPERADO
-- ===================================================================

/*
Después de ejecutar este script:

✅ Todas las tablas de clientes tendrán políticas RLS correctas
✅ Los admins podrán INSERT/UPDATE/DELETE sin errores 403
✅ El wizard podrá crear clientes con relaciones de propiedades
✅ No más errores: "new row violates row-level security policy"

PASOS:
1. Copiar este script
2. Abrir Supabase SQL Editor
3. Ejecutar todo el script
4. Verificar que no haya errores
5. Probar crear cliente desde el wizard
*/
