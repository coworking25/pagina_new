-- Script para corregir TODAS las inconsistencias de estado

-- CORRECCIÓN 1: Propiedades que son VENTA Y ARRIENDO (both) pero tienen status 'available'
UPDATE properties
SET status = 'both'
WHERE deleted_at IS NULL
  AND availability_type = 'both'
  AND status = 'available';

-- CORRECCIÓN 2: Propiedades que tienen "ARRIENDO" o "ARRIENDA" en el título pero están marcadas como 'sale'
UPDATE properties
SET 
  availability_type = 'rent',
  status = 'rent',
  sale_price = NULL,
  rent_price = COALESCE(sale_price, rent_price)  -- Mover el precio a rent_price si está en sale_price
WHERE deleted_at IS NULL
  AND (
    LOWER(title) LIKE '%arriendo%'
    OR LOWER(title) LIKE '%arrienda%'
    OR LOWER(title) LIKE '%alquiler%'
    OR LOWER(title) LIKE '%renta%'
  )
  AND availability_type = 'sale'
  AND sale_price IS NOT NULL;

-- VERIFICACIÓN: Mostrar propiedades corregidas
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
  AND (
    id IN (104, 90, 89, 86, 85, 81, 80, 76)  -- Propiedades específicas que tenían problemas
    OR availability_type = 'both'
  )
ORDER BY created_at DESC;
