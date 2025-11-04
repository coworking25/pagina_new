-- Query para ver el STATUS actual de todas las propiedades
SELECT 
  id,
  code,
  title,
  availability_type,
  status,
  deleted_at
FROM properties
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 50;

-- Ver distribución de status
SELECT 
  status,
  COUNT(*) as cantidad
FROM properties
WHERE deleted_at IS NULL
GROUP BY status
ORDER BY cantidad DESC;

-- Ver combinación de availability_type y status
SELECT 
  availability_type,
  status,
  COUNT(*) as cantidad
FROM properties
WHERE deleted_at IS NULL
GROUP BY availability_type, status
ORDER BY availability_type, status;
