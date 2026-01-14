-- =====================================================
-- AGREGAR SOPORTE PARA IMÁGENES DE RECIBOS
-- Fecha: 2026-01-14
-- Propósito: Permitir subir fotos de recibos de pago
-- =====================================================

-- 1. Agregar columna para URL de imagen del recibo
ALTER TABLE payment_schedules
ADD COLUMN IF NOT EXISTS receipt_image_url TEXT;

-- 2. Comentar la columna
COMMENT ON COLUMN payment_schedules.receipt_image_url IS 'URL de la imagen del recibo almacenada en Supabase Storage';

-- 3. Verificar que el bucket existe (ya debería existir)
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets
WHERE id = 'payment-receipts';

-- 4. Crear políticas de acceso para el bucket (si no existen)
-- Permitir lectura pública
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
    'Public read access for payment receipts',
    'payment-receipts',
    '(bucket_id = ''payment-receipts'')'
)
ON CONFLICT (name, bucket_id) DO NOTHING;

-- Permitir escritura para usuarios autenticados
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
    'Authenticated users can upload payment receipts',
    'payment-receipts',
    '((bucket_id = ''payment-receipts'') AND (auth.role() = ''authenticated''))'
)
ON CONFLICT (name, bucket_id) DO NOTHING;

-- 5. Verificar estructura actualizada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'payment_schedules'
  AND column_name = 'receipt_image_url'
ORDER BY ordinal_position;

-- 6. Mensaje final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ================================================';
    RAISE NOTICE '✅ SOPORTE DE IMÁGENES DE RECIBOS AGREGADO';
    RAISE NOTICE '✅ ================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Columna agregada:';
    RAISE NOTICE '  - receipt_image_url (TEXT)';
    RAISE NOTICE '';
    RAISE NOTICE 'Bucket de Storage:';
    RAISE NOTICE '  - payment-receipts (público para lectura)';
    RAISE NOTICE '';
    RAISE NOTICE 'Políticas de acceso:';
    RAISE NOTICE '  - Lectura pública';
    RAISE NOTICE '  - Escritura para usuarios autenticados';
    RAISE NOTICE '';
    RAISE NOTICE '📸 Los usuarios pueden subir imágenes desde el formulario';
    RAISE NOTICE '';
END $$;
