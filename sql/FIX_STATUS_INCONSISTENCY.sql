-- Script para corregir inconsistencias entre availability_type y status

-- BACKUP: Primero guardamos el estado actual en una tabla temporal
CREATE TEMP TABLE backup_properties_status AS
SELECT id, code, title, availability_type, status, sale_price, rent_price
FROM properties
WHERE deleted_at IS NULL;

-- CORRECCIÓN 1: Propiedades que son SOLO ARRIENDO pero tienen status incorrecto
UPDATE properties
SET status = 'rent'
WHERE deleted_at IS NULL
  AND availability_type = 'rent'
  AND status NOT IN ('rent', 'rented')
  AND rent_price IS NOT NULL
  AND rent_price > 0;

-- CORRECCIÓN 2: Propiedades que son SOLO VENTA pero tienen status incorrecto
UPDATE properties
SET status = 'sale'
WHERE deleted_at IS NULL
  AND availability_type = 'sale'
  AND status NOT IN ('sale', 'sold')
  AND sale_price IS NOT NULL
  AND sale_price > 0;

-- CORRECCIÓN 3: Propiedades que son VENTA Y ARRIENDO (both) pero tienen status incorrecto
UPDATE properties
SET status = 'both'
WHERE deleted_at IS NULL
  AND availability_type = 'both'
  AND status NOT IN ('both')
  AND sale_price IS NOT NULL
  AND sale_price > 0
  AND rent_price IS NOT NULL
  AND rent_price > 0;

-- VERIFICACIÓN: Mostrar propiedades actualizadas
SELECT 
  'Propiedades actualizadas' as descripcion,
  COUNT(*) as cantidad
FROM properties p
LEFT JOIN backup_properties_status b ON p.id = b.id
WHERE p.deleted_at IS NULL
  AND p.status != b.status;

-- RESULTADO: Mostrar estado final
SELECT 
  id,
  code,
  title,
  availability_type,
  status,
  sale_price,
  rent_price,
  CASE 
    WHEN availability_type = 'rent' AND status IN ('rent', 'rented') THEN '✅ CORRECTO - Arriendo'
    WHEN availability_type = 'sale' AND status IN ('sale', 'sold') THEN '✅ CORRECTO - Venta'
    WHEN availability_type = 'both' AND status = 'both' THEN '✅ CORRECTO - Ambos'
    ELSE '⚠️ Revisar manualmente'
  END as estado_final
FROM properties
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20;
