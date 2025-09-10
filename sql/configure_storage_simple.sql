-- SQL SIMPLIFICADO para configurar Storage (sin permisos de admin)
-- Ejecutar en el SQL Editor de Supabase
-- Proyecto: gfczfjpyyyyvteyrvhgt

-- PASO 1: Verificar buckets existentes (solo lectura)
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets;

-- PASO 2: Verificar si el bucket property-images existe
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'property-images';

-- PASO 3: Intentar crear bucket (puede fallar si ya existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- PASO 4: Hacer el bucket público si no lo está
UPDATE storage.buckets 
SET public = true 
WHERE id = 'property-images';

-- PASO 5: Ver políticas actuales en storage.objects
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
