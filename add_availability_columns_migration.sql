-- ==========================================
-- MIGRACIÓN: Agregar campos para disponibilidad dual de propiedades
-- Fecha: 29 de octubre de 2025
-- ==========================================

-- Permitir valores NULL en el campo price para compatibilidad con el nuevo sistema
ALTER TABLE properties
ALTER COLUMN price DROP NOT NULL;

-- Agregar columna para tipo de disponibilidad
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS availability_type TEXT DEFAULT 'sale'
CHECK (availability_type IN ('sale', 'rent', 'both'));

-- Agregar columna para precio de venta
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(15,2);

-- Agregar columna para precio de arriendo
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS rent_price DECIMAL(15,2);

-- ==========================================
-- MIGRACIÓN DE DATOS EXISTENTES
-- ==========================================

-- Para propiedades existentes que tienen un precio único,
-- asumir que son para venta y copiar el precio actual
UPDATE properties
SET
  availability_type = 'sale',
  sale_price = price
WHERE availability_type IS NULL AND price IS NOT NULL;

-- ==========================================
-- COMENTARIOS
-- ==========================================

COMMENT ON COLUMN properties.availability_type IS 'Tipo de disponibilidad: sale (solo venta), rent (solo arriendo), both (venta y arriendo)';
COMMENT ON COLUMN properties.sale_price IS 'Precio de venta en COP (opcional si availability_type es rent)';
COMMENT ON COLUMN properties.rent_price IS 'Precio de arriendo en COP (opcional si availability_type es sale)';

-- ==========================================
-- ÍNDICES PARA MEJOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_properties_availability_type ON properties(availability_type);
CREATE INDEX IF NOT EXISTS idx_properties_sale_price ON properties(sale_price) WHERE sale_price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_rent_price ON properties(rent_price) WHERE rent_price IS NOT NULL;

-- ==========================================
-- POLÍTICAS RLS (si aplican)
-- ==========================================

-- Nota: Las políticas RLS existentes deberían funcionar con los nuevos campos
-- ya que no cambian la estructura de seguridad