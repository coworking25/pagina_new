-- Actualizar propiedades existentes con estrato por defecto
-- Este script asigna estrato 3 a todas las propiedades que no tienen estrato definido

UPDATE properties
SET estrato = 3
WHERE estrato IS NULL;

-- Verificar el resultado
SELECT 
  code,
  title,
  estrato,
  location
FROM properties
ORDER BY created_at DESC
LIMIT 10;
