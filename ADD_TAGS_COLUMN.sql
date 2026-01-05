-- Req 76: Etiquetado/Categorías de Propiedades (Tags)

-- 1. Agregar columna tags a la tabla properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 2. Crear índice GIN para búsquedas rápidas por tags
CREATE INDEX IF NOT EXISTS idx_properties_tags ON properties USING GIN (tags);

-- 3. Comentario explicativo
COMMENT ON COLUMN properties.tags IS 'Array de etiquetas personalizadas para la propiedad (ej: Oportunidad, Remodelado)';
