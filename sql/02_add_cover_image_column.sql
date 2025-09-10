-- Agregar columna cover_image a la tabla properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Comentario sobre el campo
COMMENT ON COLUMN properties.cover_image IS 'URL de la imagen de portada seleccionada para la propiedad';

-- Crear índice para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_properties_cover_image ON properties(cover_image);

-- Actualizar las propiedades existentes para que tengan como cover_image la primera imagen de su array
UPDATE properties 
SET cover_image = (
  CASE 
    WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
    THEN images->>0 
    ELSE NULL 
  END
)
WHERE cover_image IS NULL;
