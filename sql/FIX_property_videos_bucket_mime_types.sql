-- ==========================================
-- FIX: Agregar soporte para thumbnails JPEG en bucket property-videos
-- ==========================================
-- Fecha: 4 de Noviembre de 2025
-- Problema: El bucket solo acepta videos pero no thumbnails (JPEG)
-- Error: "mime type image/jpeg is not supported"
-- ==========================================

-- Actualizar los tipos MIME permitidos en el bucket
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'video/mp4',
  'video/webm', 
  'video/quicktime',
  'video/x-msvideo',
  'image/jpeg',      -- ✅ AGREGADO para thumbnails
  'image/jpg',       -- ✅ AGREGADO alternativa JPEG
  'image/png',       -- ✅ AGREGADO opcional para thumbnails PNG
  'image/webp'       -- ✅ AGREGADO opcional para thumbnails WebP
]
WHERE id = 'property-videos';

-- Verificar que el cambio se aplicó correctamente
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'property-videos';

-- ==========================================
-- RESULTADO ESPERADO:
-- ==========================================
-- El bucket ahora debe mostrar:
-- allowed_mime_types: {
--   "video/mp4",
--   "video/webm",
--   "video/quicktime",
--   "video/x-msvideo",
--   "image/jpeg",
--   "image/jpg",
--   "image/png",
--   "image/webp"
-- }
-- ==========================================

COMMIT;
