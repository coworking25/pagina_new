-- ==========================================
-- DIAGNOSTICAR POR QUÉ FALTAN 22 CITAS
-- ==========================================

-- 1. Ver total de citas en property_appointments
SELECT 
    'Total en property_appointments' as descripcion,
    COUNT(*) as total
FROM property_appointments;

-- 2. Ver distribución por status
SELECT 
    'Distribución por status' as descripcion,
    status,
    COUNT(*) as cantidad
FROM property_appointments
GROUP BY status
ORDER BY cantidad DESC;

-- 3. Ver las que están siendo filtradas (las 22 que faltan)
SELECT 
    'Citas filtradas (excluidas de la vista)' as descripcion,
    status,
    COUNT(*) as cantidad
FROM property_appointments
WHERE status = 'cancelled'
GROUP BY status;

-- 4. Ver si hay valores NULL en status
SELECT 
    'Citas con status NULL' as descripcion,
    COUNT(*) as cantidad
FROM property_appointments
WHERE status IS NULL;

-- 5. Ver todos los valores únicos de status
SELECT DISTINCT status 
FROM property_appointments
ORDER BY status;
