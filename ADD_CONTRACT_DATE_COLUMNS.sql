-- ===================================================================
-- AGREGAR COLUMNAS DE FECHAS A client_contract_info
-- ===================================================================

-- Agregar columnas para fechas del contrato
ALTER TABLE client_contract_info 
ADD COLUMN IF NOT EXISTS start_date DATE;

ALTER TABLE client_contract_info 
ADD COLUMN IF NOT EXISTS end_date DATE;

ALTER TABLE client_contract_info 
ADD COLUMN IF NOT EXISTS contract_type VARCHAR(50);

ALTER TABLE client_contract_info 
ADD COLUMN IF NOT EXISTS contract_duration_months INTEGER;

-- Verificar que se agregaron correctamente
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'client_contract_info'
  AND column_name IN ('start_date', 'end_date', 'contract_type', 'contract_duration_months')
ORDER BY ordinal_position;
