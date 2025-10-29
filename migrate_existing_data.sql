-- ==========================================
-- MIGRACIÓN MANUAL DE DATOS EXISTENTES
-- Ejecutar después de la migración de esquema
-- ==========================================

-- Migrar datos del campo 'price' al campo 'sale_price' para propiedades existentes
UPDATE properties
SET sale_price = price
WHERE availability_type = 'sale'
AND sale_price IS NULL
AND price IS NOT NULL;

-- Verificar que la migración se aplicó correctamente
SELECT
  code,
  title,
  price as precio_antiguo,
  availability_type,
  sale_price as precio_venta,
  rent_price as precio_arriendo
FROM properties
WHERE availability_type IS NOT NULL
LIMIT 5;