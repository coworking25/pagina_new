-- Script para verificar el estado actual de la base de datos
-- Ejecuta estos comandos en el SQL Editor de Supabase para diagnosticar

-- 1. Verificar qué datos hay en el campo images
SELECT 
    id, 
    code, 
    title, 
    images,
    jsonb_array_length(images) as image_count
FROM properties 
ORDER BY code 
LIMIT 5;

-- 2. Verificar estructura del campo images de la primera propiedad
SELECT 
    code,
    images,
    jsonb_typeof(images) as images_type,
    jsonb_array_length(images) as array_length
FROM properties 
WHERE code = 'CA-001';

-- 3. Verificar si hay buckets creados
SELECT * FROM storage.buckets;

-- 4. Verificar políticas de storage
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 5. Verificar archivos en el bucket property-images (si existe)
SELECT 
    name,
    bucket_id,
    created_at
FROM storage.objects 
WHERE bucket_id = 'property-images'
ORDER BY name
LIMIT 10;
