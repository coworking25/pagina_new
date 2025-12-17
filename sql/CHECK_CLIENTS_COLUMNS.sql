-- =====================================================
-- VERIFICAR ESTRUCTURA DE LA TABLA CLIENTS
-- =====================================================

-- Ver todas las columnas de la tabla clients
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'clients'
ORDER BY ordinal_position;
