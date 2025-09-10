-- SQL SEGURO para configurar políticas RLS en Supabase Storage
-- Ejecutar en el SQL Editor de Supabase

-- PASO 1: Verificar que el bucket existe
DO $$
BEGIN
  -- Crear bucket si no existe
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('property-images', 'property-images', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
  
  RAISE NOTICE 'Bucket property-images verificado/creado';
END $$;

-- PASO 2: Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Permitir subida de imágenes de propiedades" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura de imágenes de propiedades" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización de imágenes de propiedades" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación de imágenes de propiedades" ON storage.objects;

-- PASO 3: Crear políticas nuevas
-- Política para INSERT (subir archivos)
CREATE POLICY "Permitir subida de imágenes de propiedades" ON storage.objects
  FOR INSERT 
  WITH CHECK (bucket_id = 'property-images');

-- Política para SELECT (leer archivos)
CREATE POLICY "Permitir lectura de imágenes de propiedades" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'property-images');

-- Política para UPDATE (actualizar archivos)
CREATE POLICY "Permitir actualización de imágenes de propiedades" ON storage.objects
  FOR UPDATE 
  USING (bucket_id = 'property-images')
  WITH CHECK (bucket_id = 'property-images');

-- Política para DELETE (eliminar archivos)
CREATE POLICY "Permitir eliminación de imágenes de propiedades" ON storage.objects
  FOR DELETE 
  USING (bucket_id = 'property-images');

-- PASO 4: Habilitar RLS en la tabla storage.objects (si no está habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- PASO 5: Verificación final
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'property-images';

-- Ver políticas creadas
SELECT 
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%propiedades%';

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Configuración de Storage completada exitosamente!';
  RAISE NOTICE '📁 Bucket: property-images configurado como público';
  RAISE NOTICE '🔐 Políticas RLS creadas para todas las operaciones';
  RAISE NOTICE '🚀 Ahora puedes subir imágenes sin problemas!';
END $$;
