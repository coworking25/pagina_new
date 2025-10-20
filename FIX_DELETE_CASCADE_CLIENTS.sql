-- ===================================================================
-- FIX: Eliminación en Cascada para Clientes
-- ===================================================================
-- PROBLEMA: No se pueden eliminar clientes porque hay registros relacionados
-- SOLUCIÓN: Actualizar las foreign keys con ON DELETE CASCADE
-- ===================================================================

BEGIN;

-- ===================================================================
-- 1. VERIFICAR FOREIGN KEYS ACTUALES
-- ===================================================================

SELECT 
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'clients'
ORDER BY tc.table_name;

-- ===================================================================
-- 2. ELIMINAR CONSTRAINTS EXISTENTES
-- ===================================================================

-- CLIENT_PORTAL_CREDENTIALS
ALTER TABLE client_portal_credentials 
DROP CONSTRAINT IF EXISTS client_portal_credentials_client_id_fkey;

-- CLIENT_DOCUMENTS
ALTER TABLE client_documents 
DROP CONSTRAINT IF EXISTS client_documents_client_id_fkey;

-- CLIENT_PAYMENT_CONFIG
ALTER TABLE client_payment_config 
DROP CONSTRAINT IF EXISTS client_payment_config_client_id_fkey;

-- CLIENT_REFERENCES
ALTER TABLE client_references 
DROP CONSTRAINT IF EXISTS client_references_client_id_fkey;

-- CLIENT_CONTRACT_INFO
ALTER TABLE client_contract_info 
DROP CONSTRAINT IF EXISTS client_contract_info_client_id_fkey;

-- CLIENT_PROPERTY_RELATIONS
ALTER TABLE client_property_relations 
DROP CONSTRAINT IF EXISTS client_property_relations_client_id_fkey;

-- CLIENT_COMMUNICATIONS
ALTER TABLE client_communications 
DROP CONSTRAINT IF EXISTS client_communications_client_id_fkey;

-- CLIENT_ALERTS
ALTER TABLE client_alerts 
DROP CONSTRAINT IF EXISTS client_alerts_client_id_fkey;

-- CONTRACTS
ALTER TABLE contracts 
DROP CONSTRAINT IF EXISTS contracts_client_id_fkey;

-- PAYMENTS
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_client_id_fkey;

-- ===================================================================
-- 3. CREAR CONSTRAINTS CON ON DELETE CASCADE
-- ===================================================================

-- CLIENT_PORTAL_CREDENTIALS
ALTER TABLE client_portal_credentials 
ADD CONSTRAINT client_portal_credentials_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;

-- CLIENT_DOCUMENTS
ALTER TABLE client_documents 
ADD CONSTRAINT client_documents_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;

-- CLIENT_PAYMENT_CONFIG
ALTER TABLE client_payment_config 
ADD CONSTRAINT client_payment_config_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;

-- CLIENT_REFERENCES
ALTER TABLE client_references 
ADD CONSTRAINT client_references_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;

-- CLIENT_CONTRACT_INFO
ALTER TABLE client_contract_info 
ADD CONSTRAINT client_contract_info_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;

-- CLIENT_PROPERTY_RELATIONS
ALTER TABLE client_property_relations 
ADD CONSTRAINT client_property_relations_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;

-- CLIENT_COMMUNICATIONS
ALTER TABLE client_communications 
ADD CONSTRAINT client_communications_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;

-- CLIENT_ALERTS
ALTER TABLE client_alerts 
ADD CONSTRAINT client_alerts_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;

-- CONTRACTS
ALTER TABLE contracts 
ADD CONSTRAINT contracts_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;

-- PAYMENTS
ALTER TABLE payments 
ADD CONSTRAINT payments_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;

COMMIT;

-- ===================================================================
-- 4. VERIFICAR CAMBIOS
-- ===================================================================

SELECT 
  tc.table_name,
  tc.constraint_name,
  rc.delete_rule,
  CASE 
    WHEN rc.delete_rule = 'CASCADE' THEN '✅ CASCADE OK'
    ELSE '❌ NO CASCADE'
  END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'clients'
ORDER BY tc.table_name;

-- ===================================================================
-- 5. TEST DE ELIMINACIÓN (OPCIONAL - DESCOMENTAR PARA PROBAR)
-- ===================================================================

/*
-- Crear un cliente de prueba
DO $$
DECLARE
  test_client_id uuid;
BEGIN
  -- Insertar cliente de prueba
  INSERT INTO clients (
    full_name,
    document_type,
    document_number,
    phone,
    email,
    client_type,
    status
  ) VALUES (
    'Cliente de Prueba - ELIMINAR',
    'cedula',
    '999999999',
    '999-999-9999',
    'test-delete@test.com',
    'renter',
    'inactive'
  ) RETURNING id INTO test_client_id;
  
  RAISE NOTICE 'Cliente de prueba creado con ID: %', test_client_id;
  
  -- Insertar datos relacionados
  INSERT INTO client_portal_credentials (client_id, email, password_hash)
  VALUES (test_client_id, 'test-delete@test.com', 'hash123');
  
  INSERT INTO client_documents (client_id, document_type, file_name, file_url, file_size)
  VALUES (test_client_id, 'cedula_frente', 'test.pdf', 'http://test.com/test.pdf', 1000);
  
  RAISE NOTICE 'Datos relacionados creados';
  
  -- Intentar eliminar
  DELETE FROM clients WHERE id = test_client_id;
  
  RAISE NOTICE '✅ Cliente eliminado exitosamente con CASCADE';
  
  -- Verificar que los datos relacionados también se eliminaron
  IF NOT EXISTS (SELECT 1 FROM client_portal_credentials WHERE client_id = test_client_id) THEN
    RAISE NOTICE '✅ Credenciales eliminadas en CASCADE';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM client_documents WHERE client_id = test_client_id) THEN
    RAISE NOTICE '✅ Documentos eliminados en CASCADE';
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Test falló: %', SQLERRM;
END $$;
*/

-- ===================================================================
-- RESULTADO ESPERADO
-- ===================================================================

/*
ANTES:
- DELETE FROM clients WHERE id = 'xxx';
- ERROR: update or delete on table "clients" violates foreign key constraint
- DETAIL: Key (id) is still referenced from table "client_portal_credentials"

DESPUÉS:
- DELETE FROM clients WHERE id = 'xxx';
- ✅ DELETE 1
- ✅ Todas las tablas relacionadas se eliminan automáticamente (CASCADE)

TABLAS AFECTADAS POR CASCADE:
1. client_portal_credentials
2. client_documents
3. client_payment_config
4. client_references
5. client_contract_info
6. client_property_relations
7. client_communications
8. client_alerts
9. contracts
10. payments

Al eliminar un cliente, TODOS sus registros relacionados se eliminan automáticamente.
*/

-- ===================================================================
-- IMPORTANTE: BACKUP ANTES DE USAR EN PRODUCCIÓN
-- ===================================================================

/*
⚠️ PRECAUCIÓN:
- Esta configuración elimina PERMANENTEMENTE todos los datos relacionados
- No hay forma de recuperar los datos después de eliminar
- Hacer backup de la base de datos antes de aplicar
- Usar con cuidado en producción

✅ VENTAJAS:
- Mantiene integridad referencial
- No deja registros huérfanos
- Limpieza automática
- Funciona desde el código sin cambios

❌ DESVENTAJAS:
- Eliminación permanente
- No hay soft delete
- Puede eliminar datos importantes sin querer

ALTERNATIVA (SOFT DELETE):
En lugar de DELETE, usar UPDATE para marcar como eliminado:
UPDATE clients SET status = 'deleted', deleted_at = NOW() WHERE id = 'xxx';
*/
