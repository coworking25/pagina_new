-- ==========================================
-- ENCONTRAR LAS 22 CITAS FALTANTES
-- ==========================================

-- 1. Total real en property_appointments
SELECT 'Total en tabla' as descripcion, COUNT(*) as total
FROM property_appointments;

-- 2. Las que están en la vista
SELECT 'Total en vista' as descripcion, COUNT(*) as total
FROM v_all_appointments
WHERE source = 'property';

-- 3. Ver si hay problema con advisor_id
SELECT 
    'Citas con advisor_id NULL' as descripcion,
    COUNT(*) as cantidad
FROM property_appointments
WHERE advisor_id IS NULL;

-- 4. Ver si hay problema con el JOIN de advisor
SELECT 
    'Citas SIN advisor válido (JOIN falla)' as descripcion,
    COUNT(*) as cantidad
FROM property_appointments pa
LEFT JOIN advisors a ON a.id = pa.advisor_id
WHERE a.id IS NULL;

-- 5. Comparar: ver todas las citas directamente
SELECT 
    'Query directa (sin vista)' as metodo,
    COUNT(*) as total
FROM property_appointments pa
LEFT JOIN properties p ON p.id = pa.property_id
LEFT JOIN advisors a ON a.id = pa.advisor_id;

-- 6. Ver si hay error de conversión en appointment_type
SELECT 
    'Por appointment_type' as descripcion,
    appointment_type,
    COUNT(*) as cantidad
FROM property_appointments
GROUP BY appointment_type;

-- 7. Ver si hay valores NULL problemáticos
SELECT 
    'Citas con appointment_date NULL' as descripcion,
    COUNT(*) as cantidad
FROM property_appointments
WHERE appointment_date IS NULL;

-- 8. MOSTRAR LAS 22 FALTANTES - IDs que NO están en la vista
SELECT 
    'IDs faltantes - primeros 10' as descripcion,
    pa.id,
    pa.client_name,
    pa.status,
    pa.appointment_type,
    pa.appointment_date,
    pa.property_id,
    pa.advisor_id
FROM property_appointments pa
WHERE pa.id::TEXT NOT IN (
    SELECT id FROM v_all_appointments WHERE source = 'property'
)
LIMIT 10;
