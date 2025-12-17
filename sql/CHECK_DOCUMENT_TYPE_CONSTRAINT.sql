-- =====================================================
-- VERIFICAR CONSTRAINT DE document_type
-- =====================================================

-- Ver la constraint de document_type
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'clients'
  AND con.conname LIKE '%document_type%';

-- Ver valores únicos existentes en document_type
SELECT DISTINCT document_type 
FROM clients 
ORDER BY document_type;
