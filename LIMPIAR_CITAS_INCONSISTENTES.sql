-- ===========================================
-- Script de Limpieza de Citas Inconsistentes
-- ===========================================
-- Fecha: 10 de octubre de 2025
-- Propósito: Limpiar citas que tienen deleted_at pero status activo
-- Ejecutar en: Supabase SQL Editor

-- 1. Verificar cuántas citas tienen deleted_at pero status pending/confirmed
SELECT 
  COUNT(*) as total_citas_inconsistentes,
  status,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as con_deleted_at
FROM property_appointments
WHERE deleted_at IS NOT NULL 
  AND status IN ('pending', 'confirmed')
GROUP BY status;

-- 2. Ver detalles de las citas inconsistentes
SELECT 
  id,
  property_id,
  status,
  client_name,
  created_at,
  deleted_at,
  EXTRACT(EPOCH FROM (NOW() - deleted_at))/86400 as dias_desde_eliminacion
FROM property_appointments
WHERE deleted_at IS NOT NULL 
  AND status IN ('pending', 'confirmed')
ORDER BY deleted_at DESC;

-- 3. OPCIONAL: Actualizar el status de citas soft-deleted a 'cancelled'
-- (Descomenta las siguientes líneas si deseas ejecutar la actualización)

/*
UPDATE property_appointments
SET 
  status = 'cancelled',
  updated_at = NOW()
WHERE deleted_at IS NOT NULL 
  AND status IN ('pending', 'confirmed');

-- Verificar la actualización
SELECT 
  COUNT(*) as total_actualizadas,
  status
FROM property_appointments
WHERE deleted_at IS NOT NULL
GROUP BY status;
*/

-- 4. Verificar la propiedad específica "Apartamento en Sabaneta - Las Lomitas"
SELECT 
  p.id as property_id,
  p.title,
  p.deleted_at as property_deleted_at,
  COUNT(pa.id) as total_citas,
  COUNT(pa.id) FILTER (WHERE pa.deleted_at IS NULL) as citas_activas,
  COUNT(pa.id) FILTER (WHERE pa.deleted_at IS NOT NULL) as citas_eliminadas,
  COUNT(pa.id) FILTER (WHERE pa.status IN ('pending', 'confirmed') AND pa.deleted_at IS NULL) as citas_pendientes_activas
FROM properties p
LEFT JOIN property_appointments pa ON p.id = pa.property_id
WHERE p.title ILIKE '%Apartamento en Sabaneta - Las Lomitas%'
GROUP BY p.id, p.title, p.deleted_at;

-- 5. Ver todas las citas de esa propiedad (incluyendo eliminadas)
SELECT 
  pa.id,
  pa.status,
  pa.client_name,
  pa.client_email,
  pa.appointment_date,
  pa.created_at,
  pa.deleted_at,
  CASE 
    WHEN pa.deleted_at IS NULL THEN 'ACTIVA'
    ELSE 'ELIMINADA'
  END as estado_real
FROM properties p
JOIN property_appointments pa ON p.id = pa.property_id
WHERE p.title ILIKE '%Apartamento en Sabaneta - Las Lomitas%'
ORDER BY pa.created_at DESC;

-- 6. OPCIONAL: Eliminar permanentemente (hard delete) citas soft-deleted hace más de 30 días
-- (Descomenta si deseas hacer limpieza profunda)

/*
DELETE FROM property_appointments
WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '30 days';
*/
