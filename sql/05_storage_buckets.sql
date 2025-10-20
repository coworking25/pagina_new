-- =====================================================
-- FASE 1.5: STORAGE BUCKETS PARA DOCUMENTOS
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Fecha: 15 Octubre 2025

-- NOTA: Los buckets se crean desde el Dashboard de Supabase Storage
-- Aquí están las configuraciones necesarias

-- =====================================================
-- BUCKETS A CREAR EN SUPABASE DASHBOARD
-- =====================================================

/*
1. Ir a Storage en Supabase Dashboard
2. Crear los siguientes buckets:

BUCKET 1: client-documents
- Name: client-documents
- Public: NO (privado)
- File size limit: 10MB
- Allowed MIME types: application/pdf, image/jpeg, image/png, image/jpg

BUCKET 2: client-contracts
- Name: client-contracts  
- Public: NO (privado)
- File size limit: 20MB
- Allowed MIME types: application/pdf

BUCKET 3: payment-receipts
- Name: payment-receipts
- Public: NO (privado)
- File size limit: 5MB
- Allowed MIME types: application/pdf, image/jpeg, image/png

*/

-- =====================================================
-- POLÍTICAS DE STORAGE (RLS para Buckets)
-- =====================================================

-- Estas políticas se aplican desde el Dashboard de Storage o mediante SQL

-- POLÍTICA 1: Clientes pueden ver sus documentos
-- Bucket: client-documents
-- Operation: SELECT
-- Policy: (storage.foldername(name))[1] = auth.uid()::text

-- POLÍTICA 2: Admins pueden subir/ver todos los documentos
-- Bucket: client-documents
-- Operation: ALL
-- Policy: auth.role() = 'authenticated' AND EXISTS (
--   SELECT 1 FROM advisors WHERE id = auth.uid()
-- )

-- =====================================================
-- FUNCIÓN HELPER: Obtener URL firmada de documento
-- =====================================================

CREATE OR REPLACE FUNCTION get_signed_document_url(
  p_bucket_name TEXT,
  p_file_path TEXT,
  p_expires_in INTEGER DEFAULT 3600  -- 1 hora por defecto
)
RETURNS TEXT AS $$
DECLARE
  v_url TEXT;
BEGIN
  -- Usar la función de Supabase para crear URL firmada
  -- Esta función debe ser llamada desde el backend con las credenciales correctas
  -- Por ahora retornamos el path, el backend generará la URL
  RETURN 'storage/' || p_bucket_name || '/' || p_file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIÓN: Registrar documento en base de datos
-- =====================================================

CREATE OR REPLACE FUNCTION register_client_document(
  p_client_id UUID,
  p_contract_id UUID,
  p_document_type VARCHAR,
  p_document_name VARCHAR,
  p_file_url TEXT,
  p_file_size INTEGER,
  p_mime_type VARCHAR,
  p_uploaded_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_document_id UUID;
BEGIN
  INSERT INTO client_documents (
    client_id,
    contract_id,
    document_type,
    document_name,
    file_url,
    file_size,
    mime_type,
    uploaded_by
  ) VALUES (
    p_client_id,
    p_contract_id,
    p_document_type,
    p_document_name,
    p_file_url,
    p_file_size,
    p_mime_type,
    p_uploaded_by
  )
  RETURNING id INTO v_document_id;
  
  RETURN v_document_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AGREGAR COLUMNA uploaded_by SI NO EXISTE
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_documents' 
      AND column_name = 'uploaded_by'
  ) THEN
    ALTER TABLE client_documents 
    ADD COLUMN uploaded_by UUID REFERENCES advisors(id);
  END IF;
END $$;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver estructura de client_documents
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_documents'
ORDER BY ordinal_position;

-- =====================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =====================================================

/*
ESTRUCTURA DE CARPETAS EN STORAGE:

client-documents/
  ├── {client-id}/
  │   ├── cedula.pdf
  │   ├── income-proof.pdf
  │   └── references/
  │       ├── reference-1.pdf
  │       └── reference-2.pdf

client-contracts/
  ├── {contract-id}/
  │   ├── contract-signed.pdf
  │   ├── inventory.pdf
  │   └── annexes/
  │       └── annex-1.pdf

payment-receipts/
  ├── {client-id}/
  │   └── {year}/
  │       ├── 2025-01-receipt.pdf
  │       ├── 2025-02-receipt.pdf
  │       └── ...
*/

-- ✅ Script completado
-- FASE 1 COMPLETADA - Base de Datos lista ✅
-- Siguiente paso: FASE 2 - Backend APIs
