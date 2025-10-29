-- ==========================================
-- CORRECCIÓN: Permitir NULL en campo price
-- Para compatibilidad con el sistema de disponibilidad dual
-- ==========================================

-- Permitir valores NULL en el campo price
ALTER TABLE properties
ALTER COLUMN price DROP NOT NULL;

-- Verificar que el cambio se aplicó
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'properties'
AND column_name = 'price';