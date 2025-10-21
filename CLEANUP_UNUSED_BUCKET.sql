-- ===================================================================
-- ELIMINAR BUCKET INNECESARIO client-documents
-- ===================================================================

-- Verificar buckets existentes
SELECT 
  name,
  id,
  public,
  created_at
FROM storage.buckets
ORDER BY name;

-- Eliminar bucket client-documents si existe (solo usamos 'clients')
DELETE FROM storage.buckets
WHERE name = 'client-documents';

-- Verificar que solo quede el bucket 'clients'
SELECT 
  '✅ Buckets después de limpieza' as resultado,
  name,
  public
FROM storage.buckets
ORDER BY name;
