-- Verificar si el estrato se está guardando correctamente
SELECT 
  id,
  code,
  title,
  estrato,
  bedrooms,
  bathrooms,
  area,
  updated_at,
  created_at
FROM properties
ORDER BY updated_at DESC NULLS LAST, created_at DESC
LIMIT 15;
