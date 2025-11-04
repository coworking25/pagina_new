-- ==========================================
-- AGREGAR COLUMNA ESTRATO A PROPIEDADES
-- ==========================================
-- Fecha: 4 de Noviembre de 2025
-- Descripción: Agregar campo de estrato socioeconómico a la tabla properties
-- ==========================================

-- Paso 1: Agregar columna estrato (valores de 1 a 6)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS estrato INTEGER;

-- Paso 2: Eliminar constraint anterior si existe (por si acaso)
ALTER TABLE properties
DROP CONSTRAINT IF EXISTS check_estrato_range;

-- Paso 3: Agregar constraint para validar que el estrato esté entre 1 y 6
ALTER TABLE properties
ADD CONSTRAINT check_estrato_range 
CHECK (estrato IS NULL OR (estrato >= 1 AND estrato <= 6));

-- Paso 4: Agregar comentario a la columna
COMMENT ON COLUMN properties.estrato IS 'Estrato socioeconómico de la propiedad (1-6)';

-- Paso 5: Eliminar índice anterior si existe
DROP INDEX IF EXISTS idx_properties_estrato;

-- Paso 6: Crear índice para mejorar búsquedas por estrato
CREATE INDEX idx_properties_estrato 
ON properties(estrato) 
WHERE estrato IS NOT NULL;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

-- Verificar que la columna se creó correctamente
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'properties' 
  AND column_name = 'estrato';

-- Verificar el constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'check_estrato_range';

-- ==========================================
-- QUERIES ÚTILES
-- ==========================================

-- Obtener distribución de propiedades por estrato
SELECT 
  estrato,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
FROM properties
WHERE estrato IS NOT NULL
GROUP BY estrato
ORDER BY estrato;

-- Obtener propiedades sin estrato asignado
SELECT 
  id,
  code,
  title,
  location,
  type
FROM properties
WHERE estrato IS NULL
LIMIT 10;

-- ==========================================
-- ROLLBACK (Si es necesario)
-- ==========================================

/*
-- ADVERTENCIA: Esto eliminará la columna y todos los datos de estrato

-- Eliminar constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS check_estrato_range;

-- Eliminar índice
DROP INDEX IF EXISTS idx_properties_estrato;

-- Eliminar columna
ALTER TABLE properties DROP COLUMN IF EXISTS estrato;
*/

COMMIT;
