-- =====================================================
-- CONFIGURACIÓN DE BUCKET DE STORAGE PARA DOCUMENTOS
-- =====================================================
-- Este script debe ejecutarse en Supabase SQL Editor
-- con privilegios de service_role

-- PASO 1: Crear el bucket 'client-documents'
-- Nota: Esto normalmente se hace desde la UI de Supabase, pero aquí está el comando
-- Si ya existe el bucket, este comando fallará (ignorar el error)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-documents',
  'client-documents',
  false, -- Privado (no público)
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 2: Crear políticas RLS para el bucket
-- =====================================================

-- Política 1: Service role puede hacer TODO (INSERT, SELECT, UPDATE, DELETE)
CREATE POLICY "Service role full access to client documents"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'client-documents')
WITH CHECK (bucket_id = 'client-documents');

-- Política 2: Usuarios autenticados pueden VER solo sus propios documentos
-- (Opcional - descomenta si necesitas que los clientes accedan a sus documentos)
/*
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- Política 3: Usuarios autenticados pueden SUBIR sus propios documentos
-- (Opcional - descomenta si necesitas que los clientes suban documentos)
/*
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- Política 4: Usuarios autenticados pueden ELIMINAR sus propios documentos
-- (Opcional - descomenta si necesitas que los clientes eliminen documentos)
/*
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'client-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- =====================================================
-- PASO 3: Verificar que el bucket se creó correctamente
-- =====================================================

SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'client-documents';

-- =====================================================
-- PASO 4: Verificar las políticas creadas
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects' 
  AND policyname LIKE '%client%';

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
ESTRUCTURA DE CARPETAS:
- Los archivos se guardan con la estructura: {client_id}/{document_type}_{timestamp}.{ext}
- Ejemplo: a1b2c3d4-e5f6-7890-abcd-ef1234567890/cedula_frente_1729123456789.jpg

SEGURIDAD:
- El bucket es PRIVADO (public = false)
- Solo service_role tiene acceso completo
- Las URLs públicas generadas son firmadas y temporales

LÍMITES:
- Tamaño máximo: 5MB por archivo
- Tipos permitidos: JPG, PNG, PDF
- Sin límite de cantidad de archivos por cliente

ACCESO DESDE LA API:
La función uploadClientDocument() en clientsApi.ts maneja:
1. Validación de tipo de archivo
2. Validación de tamaño
3. Generación de nombre único
4. Subida al bucket
5. Generación de URL pública
6. Registro en tabla client_documents

PARA GENERAR URLS FIRMADAS (TEMPORALES):
const { data, error } = await supabase.storage
  .from('client-documents')
  .createSignedUrl('path/to/file.jpg', 3600); // 1 hora

PARA DESCARGAR UN ARCHIVO:
const { data, error } = await supabase.storage
  .from('client-documents')
  .download('path/to/file.jpg');
*/
