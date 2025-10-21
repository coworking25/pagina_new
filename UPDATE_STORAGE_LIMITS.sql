-- ===================================================================
-- ACTUALIZAR LÍMITES DE STORAGE EN TODOS LOS BUCKETS
-- ===================================================================

-- Actualizar bucket 'clients' a 20MB y agregar tipos de Excel
UPDATE storage.buckets
SET 
  file_size_limit = 20971520, -- 20MB (20 * 1024 * 1024)
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed'
  ]
WHERE id = 'clients';

-- Actualizar bucket 'properties' a 10MB (imágenes)
UPDATE storage.buckets
SET file_size_limit = 10485760 -- 10MB (10 * 1024 * 1024)
WHERE id = 'properties';

-- Verificar cambios
SELECT 
  '✅ LÍMITES ACTUALIZADOS' as resultado,
  id as bucket,
  ROUND(file_size_limit / 1024.0 / 1024.0, 1) || ' MB' as limite_tamaño,
  cardinality(allowed_mime_types) as tipos_permitidos
FROM storage.buckets
WHERE id IN ('clients', 'properties')
ORDER BY id;

-- Ver tipos de archivo permitidos
SELECT 
  '📋 TIPOS PERMITIDOS' as info,
  id as bucket,
  unnest(allowed_mime_types) as tipo_mime
FROM storage.buckets
WHERE id = 'clients'
ORDER BY tipo_mime;
