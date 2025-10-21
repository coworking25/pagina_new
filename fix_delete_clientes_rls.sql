-- ===================================================================
-- SOLUCIÓN: HABILITAR DELETE EN TODAS LAS TABLAS DE CLIENTES
-- ===================================================================
-- Fecha: 20 de Octubre, 2025
-- Problema: Clientes "eliminados" vuelven a aparecer porque RLS bloquea DELETE

-- ===================================================================
-- ESTRATEGIA: Usar políticas "FOR ALL" que incluyen DELETE
-- ===================================================================

-- ===================================================================
-- 1. TABLA: clients
-- ===================================================================

-- Eliminar política existente si existe
DROP POLICY IF EXISTS "Admins have full access to clients" ON clients;

-- Crear política FOR ALL (incluye SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admins have full access to clients" 
ON clients
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- ===================================================================
-- 2. TABLA: client_portal_credentials
-- ===================================================================

DROP POLICY IF EXISTS "Admins have full access to credentials" ON client_portal_credentials;

CREATE POLICY "Admins have full access to credentials" 
ON client_portal_credentials
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- ===================================================================
-- 3. TABLA: client_documents
-- ===================================================================

DROP POLICY IF EXISTS "Admins have full access to documents" ON client_documents;

CREATE POLICY "Admins have full access to documents" 
ON client_documents
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- ===================================================================
-- 4. TABLA: client_payment_config
-- ===================================================================

DROP POLICY IF EXISTS "Admins have full access to payment configs" ON client_payment_config;

CREATE POLICY "Admins have full access to payment configs" 
ON client_payment_config
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- ===================================================================
-- 5. TABLA: client_references
-- ===================================================================

DROP POLICY IF EXISTS "Admins have full access to references" ON client_references;

CREATE POLICY "Admins have full access to references" 
ON client_references
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- ===================================================================
-- 6. TABLA: client_contract_info
-- ===================================================================

DROP POLICY IF EXISTS "Admins have full access to contract info" ON client_contract_info;

CREATE POLICY "Admins have full access to contract info" 
ON client_contract_info
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- ===================================================================
-- 7. TABLA: client_property_relations
-- ===================================================================

DROP POLICY IF EXISTS "Admins have full access to property relations" ON client_property_relations;

CREATE POLICY "Admins have full access to property relations" 
ON client_property_relations
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- ===================================================================
-- 8. VERIFICAR QUE TODAS LAS TABLAS TENGAN ON DELETE CASCADE
-- ===================================================================

-- Nota: No podemos modificar FOREIGN KEYS existentes directamente
-- Primero hay que eliminarlos y recrearlos con CASCADE

-- Lista de constraints que necesitan CASCADE:
-- (Verificar con el script de diagnóstico cuáles no tienen CASCADE)

-- ===================================================================
-- EJEMPLO: Re-crear FK con CASCADE (si es necesario)
-- ===================================================================

-- Para client_portal_credentials
DO $$ 
BEGIN
  -- Eliminar constraint existente si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'client_portal_credentials_client_id_fkey'
  ) THEN
    ALTER TABLE client_portal_credentials 
    DROP CONSTRAINT client_portal_credentials_client_id_fkey;
  END IF;
  
  -- Crear nueva constraint con CASCADE
  ALTER TABLE client_portal_credentials
  ADD CONSTRAINT client_portal_credentials_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
END $$;

-- Para client_documents
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'client_documents_client_id_fkey'
  ) THEN
    ALTER TABLE client_documents 
    DROP CONSTRAINT client_documents_client_id_fkey;
  END IF;
  
  ALTER TABLE client_documents
  ADD CONSTRAINT client_documents_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
END $$;

-- Para client_payment_config
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'client_payment_config_client_id_fkey'
  ) THEN
    ALTER TABLE client_payment_config 
    DROP CONSTRAINT client_payment_config_client_id_fkey;
  END IF;
  
  ALTER TABLE client_payment_config
  ADD CONSTRAINT client_payment_config_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
END $$;

-- Para client_references
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'client_references_client_id_fkey'
  ) THEN
    ALTER TABLE client_references 
    DROP CONSTRAINT client_references_client_id_fkey;
  END IF;
  
  ALTER TABLE client_references
  ADD CONSTRAINT client_references_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
END $$;

-- Para client_contract_info
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'client_contract_info_client_id_fkey'
  ) THEN
    ALTER TABLE client_contract_info 
    DROP CONSTRAINT client_contract_info_client_id_fkey;
  END IF;
  
  ALTER TABLE client_contract_info
  ADD CONSTRAINT client_contract_info_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
END $$;

-- Para client_property_relations
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'client_property_relations_client_id_fkey'
  ) THEN
    ALTER TABLE client_property_relations 
    DROP CONSTRAINT client_property_relations_client_id_fkey;
  END IF;
  
  ALTER TABLE client_property_relations
  ADD CONSTRAINT client_property_relations_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
END $$;

-- ===================================================================
-- 9. VERIFICACIÓN FINAL
-- ===================================================================

SELECT 
  '✅ VERIFICACIÓN POST-FIX' as seccion;

-- Verificar políticas DELETE
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'ALL' THEN '✅ FOR ALL (incluye DELETE)'
    WHEN cmd = 'DELETE' THEN '✅ DELETE ESPECÍFICO'
    ELSE '❌ NO TIENE DELETE'
  END as permite_delete
FROM pg_policies 
WHERE tablename LIKE 'client%'
  AND (cmd = 'ALL' OR cmd = 'DELETE')
ORDER BY tablename;

-- Verificar CASCADE
SELECT 
  tc.table_name as tabla_hijo,
  ccu.table_name as tabla_padre,
  rc.delete_rule,
  CASE 
    WHEN rc.delete_rule = 'CASCADE' THEN '✅ CASCADE OK'
    ELSE '❌ NO TIENE CASCADE'
  END as estado
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name LIKE 'client%'
ORDER BY tc.table_name;

-- ===================================================================
-- RESULTADO ESPERADO
-- ===================================================================

/*
Después de ejecutar este script:

✅ Todas las tablas de clientes tendrán políticas FOR ALL
✅ Todos los FOREIGN KEYS tendrán ON DELETE CASCADE
✅ Los advisors autenticados podrán eliminar clientes
✅ Al eliminar un cliente, se eliminan todos sus datos relacionados automáticamente
✅ Los clientes eliminados NO volverán a aparecer

CÓMO PROBAR:
1. Refrescar la aplicación (F5)
2. Intentar eliminar un cliente
3. Debe aparecer "Cliente eliminado correctamente"
4. Refrescar la página (F5)
5. El cliente ya NO debe aparecer
*/
