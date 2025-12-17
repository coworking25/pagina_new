-- =====================================================
-- VERIFICAR ESTRUCTURA DE client_portal_credentials
-- =====================================================

-- Ver todas las columnas de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_portal_credentials'
ORDER BY ordinal_position;

-- Ver algunos registros
SELECT * FROM client_portal_credentials LIMIT 3;
