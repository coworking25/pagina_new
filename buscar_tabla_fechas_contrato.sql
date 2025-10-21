-- ===================================================================
-- BUSCAR DÓNDE DEBERÍAN IR LAS FECHAS DEL CONTRATO
-- ===================================================================

-- Buscar todas las tablas que tengan columnas con 'start' o 'end' o 'date'
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name LIKE '%client%'
  AND (
    column_name LIKE '%start%' 
    OR column_name LIKE '%end%' 
    OR column_name LIKE '%date%'
    OR column_name LIKE '%fecha%'
    OR column_name LIKE '%inicio%'
    OR column_name LIKE '%fin%'
  )
ORDER BY table_name, ordinal_position;

-- Verificar si existe la tabla client_property_relations
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'client_property_relations'
ORDER BY ordinal_position;
