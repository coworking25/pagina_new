-- ===================================================================
-- ACTUALIZAR TABLA client_documents PARA STORAGE
-- ===================================================================

-- Agregar columna storage_path si no existe
ALTER TABLE client_documents 
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Agregar columna mime_type si no existe  
ALTER TABLE client_documents
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);

-- Verificar estructura actualizada
SELECT 
  '✅ ESTRUCTURA ACTUALIZADA' as resultado,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_documents'
ORDER BY ordinal_position;
