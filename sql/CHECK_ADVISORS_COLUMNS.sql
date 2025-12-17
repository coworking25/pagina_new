-- =====================================================
-- VERIFICAR ESTRUCTURA DE LA TABLA ADVISORS
-- =====================================================

-- Ver todas las columnas de la tabla advisors
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'advisors'
ORDER BY ordinal_position;

-- Ver algunos registros para entender los datos
SELECT * FROM advisors LIMIT 5;
