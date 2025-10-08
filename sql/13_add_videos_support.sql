-- ==========================================
-- SOPORTE DE VIDEOS PARA PROPIEDADES
-- ==========================================
-- Este script agrega las columnas necesarias para manejar videos
-- junto con las imágenes en las propiedades
-- Ejecutar en: Supabase SQL Editor
-- ==========================================

-- 1. AGREGAR COLUMNA PARA VIDEOS
-- Array de objetos JSON con metadata de videos
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb;

-- 2. AGREGAR COLUMNA PARA VIDEO DE PORTADA (OPCIONAL)
-- Similar a cover_image, permite destacar un video
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS cover_video TEXT;

-- 3. COMENTARIOS PARA DOCUMENTACIÓN
COMMENT ON COLUMN properties.videos IS 'Array JSON de videos de la propiedad con metadata (url, thumbnail, duration, etc)';
COMMENT ON COLUMN properties.cover_video IS 'URL del video destacado de la propiedad';

-- 4. ÍNDICES PARA MEJORAR QUERIES
-- Índice GIN para búsquedas en el campo JSONB de videos
CREATE INDEX IF NOT EXISTS idx_properties_videos 
ON properties USING GIN (videos);

-- ==========================================
-- CREAR BUCKET PARA VIDEOS
-- ==========================================
-- NOTA: Esto debe ejecutarse en la consola de Supabase Storage
-- O usar la interfaz web de Supabase

-- Verificar si el bucket existe
DO $$
BEGIN
  -- Crear bucket si no existe
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'property-videos',
    'property-videos',
    true,
    104857600, -- 100MB en bytes
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ==========================================
-- POLÍTICAS RLS PARA VIDEOS
-- ==========================================
-- NOTA: Las políticas se crean sin IF NOT EXISTS porque puede causar errores
-- Si ya existen, simplemente ignora el error o elimínalas primero

-- Eliminar políticas antiguas si existen (opcional)
DROP POLICY IF EXISTS "Videos públicos para lectura" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir videos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar videos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar videos" ON storage.objects;

-- 1. Política de lectura pública
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Videos públicos para lectura'
  ) THEN
    CREATE POLICY "Videos públicos para lectura"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'property-videos');
  END IF;
END $$;

-- 2. Política de inserción para usuarios autenticados
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Usuarios autenticados pueden subir videos'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden subir videos"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'property-videos' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- 3. Política de actualización para usuarios autenticados
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Usuarios autenticados pueden actualizar videos'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden actualizar videos"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'property-videos' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- 4. Política de eliminación para usuarios autenticados
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Usuarios autenticados pueden eliminar videos'
  ) THEN
    CREATE POLICY "Usuarios autenticados pueden eliminar videos"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'property-videos' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- ==========================================
-- VERIFICACIÓN
-- ==========================================

-- Verificar que las columnas se crearon correctamente
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'properties' 
  AND column_name IN ('videos', 'cover_video')
ORDER BY ordinal_position;

-- Verificar que el bucket existe
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'property-videos';

-- Verificar políticas del bucket
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects' 
  AND policyname LIKE '%video%'
ORDER BY policyname;

-- ==========================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ==========================================

-- Actualizar una propiedad de ejemplo con videos
-- NOTA: Reemplazar los IDs y URLs con datos reales

/*
UPDATE properties
SET videos = '[
  {
    "url": "https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-videos/CA-001/recorrido-exterior.mp4",
    "thumbnail": "https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-videos/CA-001/recorrido-exterior-thumb.jpg",
    "title": "Recorrido Exterior",
    "duration": 120,
    "size": 15728640,
    "uploaded_at": "2024-10-08T10:30:00Z"
  },
  {
    "url": "https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-videos/CA-001/recorrido-interior.mp4",
    "thumbnail": "https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-videos/CA-001/recorrido-interior-thumb.jpg",
    "title": "Recorrido Interior",
    "duration": 180,
    "size": 23592960,
    "uploaded_at": "2024-10-08T10:45:00Z"
  }
]'::jsonb,
cover_video = 'https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-videos/CA-001/recorrido-exterior.mp4'
WHERE code = 'CA-001';
*/

-- ==========================================
-- FUNCIONES HELPER (OPCIONAL)
-- ==========================================

-- Función para obtener el número de videos de una propiedad
CREATE OR REPLACE FUNCTION get_property_video_count(property_id BIGINT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_array_length(videos), 0)
    FROM properties
    WHERE id = property_id
  );
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si una propiedad tiene videos
CREATE OR REPLACE FUNCTION has_videos(property_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_array_length(videos), 0) > 0
    FROM properties
    WHERE id = property_id
  );
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- QUERIES ÚTILES
-- ==========================================

-- Listar propiedades con videos
SELECT 
  id,
  code,
  title,
  jsonb_array_length(videos) as video_count,
  cover_video IS NOT NULL as has_cover_video
FROM properties
WHERE jsonb_array_length(videos) > 0
ORDER BY id;

-- Obtener estadísticas de videos
SELECT 
  COUNT(*) as total_properties,
  COUNT(CASE WHEN jsonb_array_length(videos) > 0 THEN 1 END) as properties_with_videos,
  SUM(jsonb_array_length(videos)) as total_videos,
  ROUND(AVG(jsonb_array_length(videos)), 2) as avg_videos_per_property
FROM properties;

-- ==========================================
-- ROLLBACK (Si es necesario deshacer cambios)
-- ==========================================

/*
-- ADVERTENCIA: Esto eliminará las columnas y todos los datos de videos

-- Eliminar columnas
ALTER TABLE properties DROP COLUMN IF EXISTS videos;
ALTER TABLE properties DROP COLUMN IF EXISTS cover_video;

-- Eliminar funciones
DROP FUNCTION IF EXISTS get_property_video_count(BIGINT);
DROP FUNCTION IF EXISTS has_videos(BIGINT);

-- Eliminar políticas
DROP POLICY IF EXISTS "Videos públicos para lectura" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir videos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar videos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar videos" ON storage.objects;

-- NOTA: No se elimina el bucket automáticamente por seguridad
-- Debe eliminarse manualmente desde la interfaz de Supabase si es necesario
*/

-- ==========================================
-- FIN DEL SCRIPT
-- ==========================================

COMMIT;
