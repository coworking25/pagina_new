-- =====================================================
-- VERIFICAR CONSTRAINT DE client_type
-- =====================================================

-- Ver la constraint de client_type
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'clients'
  AND con.conname LIKE '%client_type%';

-- Ver valores únicos existentes en client_type
SELECT DISTINCT client_type 
FROM clients 
ORDER BY client_type;
