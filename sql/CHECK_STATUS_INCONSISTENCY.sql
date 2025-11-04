-- Verificar propiedades con inconsistencia entre availability_type y status

-- 1. Ver todas las propiedades con su availability_type y status
SELECT 
  id,
  code,
  title,
  availability_type,
  status,
  sale_price,
  rent_price,
  CASE 
    WHEN availability_type = 'rent' AND status NOT IN ('rent', 'rented') THEN '❌ INCONSISTENTE - Debería estar en arriendo'
    WHEN availability_type = 'sale' AND status NOT IN ('sale', 'sold') THEN '❌ INCONSISTENTE - Debería estar en venta'
    WHEN availability_type = 'both' AND status NOT IN ('both', 'sale', 'rent') THEN '❌ INCONSISTENTE - Debería estar en ambos'
    ELSE '✅ CORRECTO'
  END as estado_validacion
FROM properties
WHERE deleted_at IS NULL
ORDER BY 
  CASE 
    WHEN availability_type = 'rent' AND status NOT IN ('rent', 'rented') THEN 1
    WHEN availability_type = 'sale' AND status NOT IN ('sale', 'sold') THEN 1
    WHEN availability_type = 'both' AND status NOT IN ('both', 'sale', 'rent') THEN 1
    ELSE 2
  END,
  created_at DESC;

-- 2. Contar cuántas propiedades tienen inconsistencias
SELECT 
  'Total propiedades inconsistentes' as descripcion,
  COUNT(*) as cantidad
FROM properties
WHERE deleted_at IS NULL
  AND (
    (availability_type = 'rent' AND status NOT IN ('rent', 'rented'))
    OR (availability_type = 'sale' AND status NOT IN ('sale', 'sold'))
    OR (availability_type = 'both' AND status NOT IN ('both', 'sale', 'rent'))
  );
