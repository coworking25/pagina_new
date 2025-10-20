-- ========================================
-- EJECUTAR ESTE SQL EN SUPABASE DASHBOARD
-- ========================================
-- URL: https://gfczfjpyyyyvteyrvhgt.supabase.co/project/gfczfjpyyyyvteyrvhgt/sql
-- Instrucciones: Copiar todo este SQL y pegarlo en el SQL Editor de Supabase

-- 1. Agregar la columna cover_image a la tabla properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 2. Documentar el campo
COMMENT ON COLUMN properties.cover_image IS 'URL de la imagen de portada seleccionada para mostrar en las listas y tarjetas de propiedades';

-- 3. Actualizar propiedades existentes (la primera imagen del array será la portada)
UPDATE properties 
SET cover_image = (
  CASE 
    WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
    THEN images->>0 
    ELSE NULL 
  END
)
WHERE cover_image IS NULL;

-- 4. Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_properties_cover_image ON properties(cover_image) WHERE cover_image IS NOT NULL;

-- 5. Verificar que todo funcionó
SELECT 
  id, 
  code,
  title, 
  cover_image IS NOT NULL as tiene_portada,
  jsonb_array_length(images) as cantidad_imagenes,
  cover_image
FROM properties 
ORDER BY id DESC
LIMIT 10;

-- ========================================
-- RESULTADO ESPERADO:
-- Deberías ver una tabla con:
-- - id, code, title
-- - tiene_portada = true (si tiene imágenes)
-- - cantidad_imagenes = número de imágenes
-- - cover_image = URL de la primera imagen
-- ========================================
