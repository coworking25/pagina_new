-- SQL para ejecutar directamente en Supabase Dashboard
-- Ve a: https://gfczfjpyyyyvteyrvhgt.supabase.co/project/gfczfjpyyyyvteyrvhgt/sql

-- 1. Agregar la columna cover_image a la tabla properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 2. Crear un comentario para documentar el campo
COMMENT ON COLUMN properties.cover_image IS 'URL de la imagen de portada seleccionada para mostrar en las listas y tarjetas de propiedades';

-- 3. Actualizar propiedades existentes para que tengan como cover_image la primera imagen de su array
UPDATE properties 
SET cover_image = (
  CASE 
    WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
    THEN images->>0 
    ELSE NULL 
  END
)
WHERE cover_image IS NULL;

-- 4. Crear índice para mejorar el rendimiento (opcional)
CREATE INDEX IF NOT EXISTS idx_properties_cover_image ON properties(cover_image) WHERE cover_image IS NOT NULL;

-- 5. Verificar que todo funcionó correctamente
SELECT id, title, cover_image, jsonb_array_length(images) as image_count 
FROM properties 
LIMIT 5;
