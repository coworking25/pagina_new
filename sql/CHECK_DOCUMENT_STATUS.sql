-- Ver constraint de status en client_documents
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'client_documents'
  AND con.conname LIKE '%status%';

-- Ver valores únicos existentes
SELECT DISTINCT status 
FROM client_documents 
WHERE status IS NOT NULL
ORDER BY status;
