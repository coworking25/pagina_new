-- SQL para configurar políticas RLS en Supabase Storage
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear política para permitir INSERT (subir archivos)
CREATE POLICY "Permitir subida de imágenes de propiedades" ON storage.objects
  FOR INSERT 
  WITH CHECK (bucket_id = 'property-images');

-- 2. Crear política para permitir SELECT (ver archivos)
CREATE POLICY "Permitir lectura de imágenes de propiedades" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'property-images');

-- 3. Crear política para permitir UPDATE (actualizar archivos)
CREATE POLICY "Permitir actualización de imágenes de propiedades" ON storage.objects
  FOR UPDATE 
  USING (bucket_id = 'property-images');

-- 4. Crear política para permitir DELETE (eliminar archivos)
CREATE POLICY "Permitir eliminación de imágenes de propiedades" ON storage.objects
  FOR DELETE 
  USING (bucket_id = 'property-images');

-- 5. Verificar que el bucket tenga RLS habilitado
UPDATE storage.buckets 
SET public = true 
WHERE id = 'property-images';

-- 6. Verificar políticas existentes (alternativas de consulta)
-- Opción A: Ver todas las políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects';

-- Opción B: Ver información del bucket
SELECT * FROM storage.buckets WHERE id = 'property-images';

-- Opción C: Verificar si el bucket existe y es público
SELECT id, name, public FROM storage.buckets WHERE id = 'property-images';
