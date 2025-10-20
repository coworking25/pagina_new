-- ===================================================================
-- CONFIGURACIÓN DE STORAGE PARA DOCUMENTOS DE CLIENTES
-- ===================================================================

-- 1. CREAR BUCKET PARA CLIENTES (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clients',
  'clients',
  false, -- Privado (solo usuarios autenticados)
  10485760, -- 10MB máximo por archivo
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-rar-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- 2. POLÍTICAS RLS PARA EL BUCKET CLIENTS
-- ===================================================================

-- Permitir a admins subir archivos
DROP POLICY IF EXISTS "Admins can upload client files" ON storage.objects;
CREATE POLICY "Admins can upload client files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'clients' AND
  is_admin()
);

-- Permitir a admins ver archivos
DROP POLICY IF EXISTS "Admins can view client files" ON storage.objects;
CREATE POLICY "Admins can view client files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'clients' AND
  is_admin()
);

-- Permitir a admins actualizar archivos
DROP POLICY IF EXISTS "Admins can update client files" ON storage.objects;
CREATE POLICY "Admins can update client files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'clients' AND
  is_admin()
);

-- Permitir a admins eliminar archivos
DROP POLICY IF EXISTS "Admins can delete client files" ON storage.objects;
CREATE POLICY "Admins can delete client files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'clients' AND
  is_admin()
);

-- Permitir a clientes ver solo sus propios archivos
DROP POLICY IF EXISTS "Clients can view own files" ON storage.objects;
CREATE POLICY "Clients can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'clients' AND
  (storage.foldername(name))[1] = (
    SELECT id::text 
    FROM clients 
    WHERE id = get_authenticated_client_id()
  )
);

-- ===================================================================
-- 3. VERIFICAR CONFIGURACIÓN
-- ===================================================================

SELECT 
  '✅ BUCKET CREADO' as resultado,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'clients';

SELECT 
  '✅ POLÍTICAS CREADAS' as resultado,
  policyname as politica,
  cmd as comando
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%client%'
ORDER BY cmd, policyname;
