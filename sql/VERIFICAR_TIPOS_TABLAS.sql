-- ==========================================
-- VERIFICAR TIPOS DE DATOS DE LAS TABLAS
-- ==========================================

-- 1. Verificar estructura de properties
SELECT 
    column_name, 
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'properties' 
  AND column_name = 'id';

-- 2. Verificar estructura de property_appointments
SELECT 
    column_name, 
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'property_appointments' 
  AND column_name IN ('id', 'property_id', 'advisor_id');

-- 3. Verificar estructura de appointments
SELECT 
    column_name, 
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'appointments' 
  AND column_name IN ('id', 'property_id', 'advisor_id');

-- 4. Verificar estructura de advisors
SELECT 
    column_name, 
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'advisors' 
  AND column_name = 'id';
