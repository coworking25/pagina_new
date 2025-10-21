-- Ver estructura real de las tablas problemáticas

SELECT 
  'client_payment_config' as tabla,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_payment_config'
ORDER BY ordinal_position;

SELECT 
  'client_contract_info' as tabla,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_contract_info'
ORDER BY ordinal_position;
