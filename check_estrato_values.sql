-- Verificar valores de estrato en propiedades existentes
SELECT 
  id,
  code,
  title,
  estrato,
  created_at
FROM properties
ORDER BY created_at DESC
LIMIT 20;
