-- Ver estructura de ambas tablas de credenciales

SELECT 
  'client_portal_credentials' as tabla,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_portal_credentials'
ORDER BY ordinal_position;

SELECT 
  'client_credentials' as tabla,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_credentials'
ORDER BY ordinal_position;
