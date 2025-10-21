-- ============================================
-- FIX RLS POLICIES - TABLAS DE CLIENTES
-- ============================================
-- Fecha: 20 de Octubre, 2025
-- Problema: 403 Forbidden al crear datos desde el Wizard
-- Causa: Políticas RLS muy restrictivas o inexistentes

-- ============================================
-- TABLA: client_property_relations
-- ============================================

-- 1. Eliminar políticas existentes (si existen)
DROP POLICY IF EXISTS "admin_client_property_relations_all" ON client_property_relations;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON client_property_relations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON client_property_relations;

-- 2. Crear política permisiva para usuarios autenticados
CREATE POLICY "admin_full_access_client_property_relations"
ON client_property_relations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- TABLA: client_portal_credentials
-- ============================================

DROP POLICY IF EXISTS "admin_client_portal_credentials_all" ON client_portal_credentials;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON client_portal_credentials;

CREATE POLICY "admin_full_access_client_portal_credentials"
ON client_portal_credentials
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- TABLA: client_payment_config
-- ============================================

DROP POLICY IF EXISTS "admin_client_payment_config_all" ON client_payment_config;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON client_payment_config;

CREATE POLICY "admin_full_access_client_payment_config"
ON client_payment_config
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- TABLA: client_references
-- ============================================

DROP POLICY IF EXISTS "admin_client_references_all" ON client_references;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON client_references;

CREATE POLICY "admin_full_access_client_references"
ON client_references
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- TABLA: client_contract_info
-- ============================================

DROP POLICY IF EXISTS "admin_client_contract_info_all" ON client_contract_info;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON client_contract_info;

CREATE POLICY "admin_full_access_client_contract_info"
ON client_contract_info
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- TABLA: client_documents
-- ============================================

DROP POLICY IF EXISTS "admin_client_documents_all" ON client_documents;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON client_documents;

CREATE POLICY "admin_full_access_client_documents"
ON client_documents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- VERIFICAR QUE RLS ESTÉ HABILITADO
-- ============================================

-- Verificar que RLS esté activo en todas las tablas
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'client_%'
ORDER BY tablename;

-- ============================================
-- VERIFICAR POLÍTICAS CREADAS
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename LIKE 'client_%'
ORDER BY tablename, policyname;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
⚠️ ESTAS POLÍTICAS SON PERMISIVAS (USANDO true)
   - Permiten acceso completo a usuarios autenticados
   - Son adecuadas para el panel de administración
   - En producción, considera políticas más restrictivas

✅ SIGUIENTE PASO:
   1. Ejecuta este script en Supabase SQL Editor
   2. Verifica que no haya errores
   3. Vuelve a probar el Wizard
   4. Deberías ver 7/7 secciones guardadas

📝 SI ALGUNA TABLA NO EXISTE:
   - Verás un error: "relation does not exist"
   - Elimina esa sección del script
   - O crea la tabla primero
*/
