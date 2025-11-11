-- ============================================
-- VERIFICAR CONSTRAINT DE communication_type
-- ============================================

-- Obtener la definición del constraint
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'client_communications'
  AND con.contype = 'c'  -- CHECK constraint
  AND con.conname LIKE '%communication_type%';
