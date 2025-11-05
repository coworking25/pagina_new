-- ✅ VERIFICAR TODAS LAS CITAS EN LA BASE DE DATOS

-- 1. Ver todas las citas en la tabla appointments
SELECT 
    id,
    title,
    start_time,
    end_time,
    status,
    contact_name,
    contact_phone,
    advisor_id,
    property_id,
    created_at
FROM appointments
ORDER BY created_at DESC;

-- 2. Ver todas las citas en la tabla property_appointments (si existe)
SELECT 
    id,
    client_name,
    client_email,
    client_phone,
    appointment_date,
    appointment_type,
    status,
    advisor_id,
    property_id,
    created_at
FROM property_appointments
ORDER BY created_at DESC;

-- 3. Contar citas en ambas tablas
SELECT 
    'appointments' as tabla,
    COUNT(*) as total_citas
FROM appointments
UNION ALL
SELECT 
    'property_appointments' as tabla,
    COUNT(*) as total_citas
FROM property_appointments;

-- 4. Verificar si hay citas que NO se sincronizaron
-- Citas en appointments que NO están en property_appointments
SELECT 
    a.id,
    a.title,
    a.start_time,
    a.contact_name,
    'Solo en appointments' as estado
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 
    FROM property_appointments pa 
    WHERE pa.client_name = a.contact_name 
    AND DATE(pa.appointment_date) = DATE(a.start_time)
);

-- 5. Citas en property_appointments que NO están en appointments
SELECT 
    pa.id,
    pa.client_name,
    pa.appointment_date,
    'Solo en property_appointments' as estado
FROM property_appointments pa
WHERE NOT EXISTS (
    SELECT 1 
    FROM appointments a 
    WHERE a.contact_name = pa.client_name 
    AND DATE(a.start_time) = DATE(pa.appointment_date)
);
