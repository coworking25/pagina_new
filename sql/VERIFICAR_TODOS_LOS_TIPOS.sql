-- ==========================================
-- VERIFICAR TODOS LOS TIPOS DE DATOS
-- ==========================================

-- Verificar advisors
SELECT 
    'advisors.id' as campo,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'advisors' AND column_name = 'id'

UNION ALL

-- Verificar property_appointments
SELECT 
    'property_appointments.id' as campo,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'property_appointments' AND column_name = 'id'

UNION ALL

SELECT 
    'property_appointments.property_id' as campo,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'property_appointments' AND column_name = 'property_id'

UNION ALL

SELECT 
    'property_appointments.advisor_id' as campo,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'property_appointments' AND column_name = 'advisor_id'

UNION ALL

-- Verificar appointments
SELECT 
    'appointments.id' as campo,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'appointments' AND column_name = 'id'

UNION ALL

SELECT 
    'appointments.advisor_id' as campo,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'appointments' AND column_name = 'advisor_id'

UNION ALL

SELECT 
    'appointments.property_id' as campo,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'appointments' AND column_name = 'property_id'

UNION ALL

-- Verificar properties
SELECT 
    'properties.id' as campo,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'properties' AND column_name = 'id';
