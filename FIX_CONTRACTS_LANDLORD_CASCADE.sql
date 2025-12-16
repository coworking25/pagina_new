-- =====================================================
-- FIX: Agregar ON DELETE CASCADE a landlord_id en contracts
-- =====================================================
-- Este script corrige el constraint de landlord_id para que
-- permita eliminación en cascada cuando se elimina un cliente
-- que es propietario (landlord)
-- =====================================================

-- PASO 1: Eliminar el constraint antiguo
ALTER TABLE contracts 
DROP CONSTRAINT IF EXISTS contracts_landlord_id_fkey;

-- PASO 2: Agregar el nuevo constraint con ON DELETE CASCADE
ALTER TABLE contracts 
ADD CONSTRAINT contracts_landlord_id_fkey 
FOREIGN KEY (landlord_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;

-- Verificar los constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
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
WHERE tc.table_name = 'contracts' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'clients';
