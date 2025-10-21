-- ===================================================================
-- VER CONSTRAINT DEL CAMPO STATUS EN CLIENT_DOCUMENTS
-- ===================================================================

-- Ver la definición del constraint
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'client_documents'
  AND con.contype = 'c'
  AND con.conname LIKE '%status%';

-- Ver los valores actuales de status en la tabla
SELECT DISTINCT status
FROM client_documents
ORDER BY status;

-- Ver la estructura completa del campo status
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'client_documents'
  AND column_name = 'status';
