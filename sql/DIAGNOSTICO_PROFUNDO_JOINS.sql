-- ==========================================
-- DIAGNÓSTICO PROFUNDO: Por qué solo 12 de 34
-- ==========================================

-- 1. Total en property_appointments
SELECT 'Total en property_appointments' as descripcion, COUNT(*) as total
FROM property_appointments;

-- 2. Distribución por status
SELECT 'Por status' as descripcion, status, COUNT(*) as cantidad
FROM property_appointments
GROUP BY status
ORDER BY cantidad DESC;

-- 3. Verificar si hay property_id NULL o inválidos
SELECT 
    'Property IDs problemáticos' as descripcion,
    COUNT(*) as total_con_problema
FROM property_appointments
WHERE property_id IS NULL 
   OR property_id::TEXT = '' 
   OR property_id::TEXT = '0';

-- 4. Verificar si hay advisor_id NULL o inválidos  
SELECT 
    'Advisor IDs problemáticos' as descripcion,
    COUNT(*) as total_con_problema
FROM property_appointments
WHERE advisor_id IS NULL 
   OR advisor_id::TEXT = '';

-- 5. Ver cuántas tienen property válido
SELECT 
    'Con property_id válido que hace JOIN' as descripcion,
    COUNT(*) as cantidad
FROM property_appointments pa
INNER JOIN properties p ON p.id = pa.property_id;

-- 6. Ver cuántas NO tienen property válido
SELECT 
    'SIN property_id válido (no hacen JOIN)' as descripcion,
    COUNT(*) as cantidad
FROM property_appointments pa
LEFT JOIN properties p ON p.id = pa.property_id
WHERE p.id IS NULL;

-- 7. Muestra de las que NO hacen JOIN
SELECT 
    pa.id,
    pa.property_id,
    pa.client_name,
    pa.status,
    pa.appointment_date
FROM property_appointments pa
LEFT JOIN properties p ON p.id = pa.property_id
WHERE p.id IS NULL
LIMIT 10;
