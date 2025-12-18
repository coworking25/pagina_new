-- =====================================================
-- STORAGE: Bucket para Recibos de Pago
-- Fecha: Diciembre 17, 2025
-- Descripción: Crea el bucket de almacenamiento para
-- los recibos de pago con políticas de seguridad
-- =====================================================

-- PASO 1: Crear el bucket (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts',
  'payment-receipts',
  true, -- Público para que los URLs funcionen
  10485760, -- 10MB máximo por archivo
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- PASO 2: Políticas de seguridad para Storage

-- Política: Los administradores pueden ver todos los recibos
CREATE POLICY "Admins can view all receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-receipts'
  AND EXISTS (
    SELECT 1 FROM advisors
    WHERE id = auth.uid()
  )
);

-- Política: Los asesores pueden ver recibos de sus clientes
CREATE POLICY "Advisors can view their clients receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-receipts'
  AND EXISTS (
    SELECT 1 FROM clients c
    WHERE c.assigned_advisor_id = auth.uid()
    AND storage.objects.name LIKE 'receipts/' || c.id::text || '/%'
  )
);

-- Política: Los administradores y asesores pueden subir recibos
CREATE POLICY "Admins and advisors can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-receipts'
  AND EXISTS (
    SELECT 1 FROM advisors
    WHERE id = auth.uid()
  )
);

-- Política: Los administradores pueden actualizar cualquier recibo
CREATE POLICY "Admins can update all receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payment-receipts'
  AND EXISTS (
    SELECT 1 FROM advisors
    WHERE id = auth.uid()
  )
);

-- Política: Los administradores pueden eliminar cualquier recibo
CREATE POLICY "Admins can delete all receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-receipts'
  AND EXISTS (
    SELECT 1 FROM advisors
    WHERE id = auth.uid()
  )
);

-- =====================================================
-- VALIDACIÓN
-- =====================================================

-- Verificar que el bucket se creó correctamente
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'payment-receipts';

-- Verificar políticas
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
AND schemaname = 'storage'
AND policyname LIKE '%receipts%';
