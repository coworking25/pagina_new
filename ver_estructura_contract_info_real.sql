-- ===================================================================
-- VER ESTRUCTURA REAL DE client_contract_info
-- ===================================================================

SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'client_contract_info'
ORDER BY ordinal_position;

-- Ver también si hay datos de ejemplo
SELECT * FROM client_contract_info LIMIT 3;
