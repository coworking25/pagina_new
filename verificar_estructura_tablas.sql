-- 🔍 ANÁLISIS PROFUNDO - VERIFICAR ESTRUCTURA DE TABLAS

-- ============================================
-- 1. VERIFICAR ESTRUCTURA DE property_appointments
-- ============================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'property_appointments'
ORDER BY ordinal_position;

-- ============================================
-- 2. VERIFICAR ESTRUCTURA DE appointments
-- ============================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- ============================================
-- 3. CONTAR REGISTROS EN AMBAS TABLAS
-- ============================================
SELECT 
    'property_appointments' as tabla,
    COUNT(*) as total,
    COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as activas,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as eliminadas
FROM property_appointments
UNION ALL
SELECT 
    'appointments' as tabla,
    COUNT(*) as total,
    COUNT(CASE WHEN status != 'cancelled' THEN 1 END) as activas,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as canceladas
FROM appointments;

-- ============================================
-- 4. VER TODAS LAS CITAS ACTUALES
-- ============================================
-- Property Appointments
SELECT 
    'PROPERTY' as fuente,
    id,
    client_name,
    appointment_date,
    appointment_date::date as solo_fecha,
    appointment_date::time as solo_hora,
    EXTRACT(DAY FROM appointment_date) as dia,
    EXTRACT(HOUR FROM appointment_date) as hora,
    status,
    deleted_at,
    created_at
FROM property_appointments
ORDER BY created_at DESC;

-- Appointments (Calendario)
SELECT 
    'CALENDAR' as fuente,
    id,
    title,
    start_time,
    end_time,
    start_time::date as solo_fecha_inicio,
    start_time::time as solo_hora_inicio,
    EXTRACT(DAY FROM start_time) as dia,
    EXTRACT(HOUR FROM start_time) as hora,
    status,
    internal_notes,
    created_at
FROM appointments
ORDER BY created_at DESC;

-- ============================================
-- 5. VERIFICAR SI HAY RELACIONES/FOREIGN KEYS
-- ============================================
SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND (tc.table_name = 'property_appointments' OR tc.table_name = 'appointments');

-- ============================================
-- 6. ELIMINAR TODO (SI YA LO HICISTE)
-- ============================================
-- Descomentar solo si quieres ejecutar:
/*
-- Vaciar property_appointments
TRUNCATE TABLE property_appointments CASCADE;

-- Vaciar appointments
TRUNCATE TABLE appointments CASCADE;

-- O hacer soft delete:
UPDATE property_appointments SET deleted_at = NOW() WHERE deleted_at IS NULL;
UPDATE appointments SET status = 'cancelled' WHERE status != 'cancelled';
*/

-- ============================================
-- 7. VERIFICAR QUE ESTÉN VACÍAS
-- ============================================
SELECT COUNT(*) as property_appointments_count FROM property_appointments WHERE deleted_at IS NULL;
SELECT COUNT(*) as appointments_count FROM appointments WHERE status != 'cancelled';
