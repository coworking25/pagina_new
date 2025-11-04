-- ==========================================
-- SCRIPT DE SINCRONIZACIÓN - EJECUTAR ESTE
-- ==========================================
-- Fecha: 2025-01-04
-- Propósito: Conectar property_appointments con appointments

-- ==========================================
-- PASO 0: VERIFICAR TIPOS DE DATOS PRIMERO
-- ==========================================

-- Ver tipos reales de las columnas
SELECT 
    'properties.id' as campo,
    data_type,
    udt_name as tipo_postgresql
FROM information_schema.columns
WHERE table_name = 'properties' AND column_name = 'id'

UNION ALL

SELECT 
    'property_appointments.property_id' as campo,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'property_appointments' AND column_name = 'property_id'

UNION ALL

SELECT 
    'appointments.property_id' as campo,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'appointments' AND column_name = 'property_id';

-- ==========================================
-- IMPORTANTE: MIRA EL RESULTADO ARRIBA
-- Si ves tipos diferentes, necesitamos ajustar
-- ==========================================

-- ==========================================
-- DIAGNÓSTICO BASADO EN TUS RESULTADOS:
-- properties.id = BIGINT ✅
-- advisors.id = UUID ✅
-- property_appointments.property_id = VARCHAR ❌ (debe ser BIGINT)
-- property_appointments.advisor_id = VARCHAR ❌ (debe ser UUID)
-- appointments.property_id = BIGINT ✅
-- appointments.advisor_id = UUID ✅
-- 
-- SOLUCIÓN: Corregir tipos de datos en property_appointments
-- ==========================================

-- ==========================================
-- PASO 1: ELIMINAR VISTA SI EXISTE (para permitir cambios en tablas)
-- ==========================================

DROP VIEW IF EXISTS v_all_appointments CASCADE;

-- ==========================================
-- PASO 2: CORREGIR TIPO DE DATO EN property_appointments
-- ==========================================

-- 🔧 CORRECCIÓN 1: property_id (VARCHAR → BIGINT)
ALTER TABLE property_appointments 
DROP CONSTRAINT IF EXISTS property_appointments_property_id_fkey;

ALTER TABLE property_appointments 
ALTER COLUMN property_id TYPE BIGINT USING property_id::BIGINT;

ALTER TABLE property_appointments 
ADD CONSTRAINT property_appointments_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES properties(id);

-- 🔧 CORRECCIÓN 2: advisor_id (VARCHAR → UUID)
ALTER TABLE property_appointments 
DROP CONSTRAINT IF EXISTS property_appointments_advisor_id_fkey;

ALTER TABLE property_appointments 
ALTER COLUMN advisor_id TYPE UUID USING advisor_id::UUID;

ALTER TABLE property_appointments 
ADD CONSTRAINT property_appointments_advisor_id_fkey 
FOREIGN KEY (advisor_id) REFERENCES advisors(id);

-- Verificar los cambios
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'property_appointments' 
  AND column_name IN ('property_id', 'advisor_id')
ORDER BY column_name;

-- ==========================================
-- PASO 3: Agregar columna de sincronización
-- ==========================================
-- Solo si aún no existe

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS property_appointment_id UUID REFERENCES property_appointments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_appointments_property_appointment_id 
ON appointments(property_appointment_id);

COMMENT ON COLUMN appointments.property_appointment_id IS 
'ID de la cita original de property_appointments si fue sincronizada desde la web';

-- ==========================================
-- PASO 4: Verificar que se creó correctamente
-- ==========================================

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'appointments' 
  AND column_name = 'property_appointment_id';

-- ==========================================
-- PASO 5: Crear vista combinada
-- ==========================================
-- Ahora que todos los tipos son correctos, el JOIN funciona perfectamente

CREATE OR REPLACE VIEW v_all_appointments AS
-- Citas desde property_appointments (web)
SELECT 
    'property'::TEXT as source,
    pa.id::TEXT as id,
    CONCAT('Cita - ', COALESCE(p.title, 'Propiedad')) as title,
    pa.appointment_date as start_time,
    pa.appointment_date + INTERVAL '1 hour' as end_time,
    false as all_day,
    pa.advisor_id::TEXT as advisor_id,
    COALESCE(a.name, 'Sin asesor') as advisor_name,
    pa.property_id::TEXT as property_id,
    p.title as property_title,
    COALESCE(p.location, '') as location,
    pa.appointment_type::TEXT as appointment_type,
    pa.status::TEXT as status,
    pa.client_name as contact_name,
    pa.client_email as contact_email,
    pa.client_phone as contact_phone,
    COALESCE(pa.special_requests, '') as notes,
    pa.created_at,
    pa.updated_at
FROM property_appointments pa
LEFT JOIN properties p ON p.id = pa.property_id       -- ✅ BIGINT = BIGINT
LEFT JOIN advisors a ON a.id = pa.advisor_id          -- ✅ UUID = UUID
-- 🔧 Eliminar filtro restrictivo - mostrar TODAS las citas (incluso pending, confirmed, etc.)
-- WHERE pa.status != 'cancelled'  -- ❌ Esto excluye demasiadas citas

UNION ALL

-- Citas desde appointments (calendario)
SELECT 
    'calendar'::TEXT as source,
    apt.id::TEXT as id,
    apt.title,
    apt.start_time,
    apt.end_time,
    apt.all_day,
    apt.advisor_id::TEXT as advisor_id,
    COALESCE(a.name, 'Sin asesor') as advisor_name,
    apt.property_id::TEXT as property_id,
    p.title as property_title,
    COALESCE(apt.location, '') as location,
    apt.appointment_type::TEXT as appointment_type,
    apt.status::TEXT as status,
    apt.contact_name,
    apt.contact_email,
    apt.contact_phone,
    COALESCE(apt.notes, '') as notes,
    apt.created_at,
    apt.updated_at
FROM appointments apt
LEFT JOIN properties p ON p.id = apt.property_id      -- ✅ BIGINT = BIGINT
LEFT JOIN advisors a ON a.id = apt.advisor_id         -- ✅ UUID = UUID (si advisor_id es UUID en appointments)
WHERE apt.property_appointment_id IS NULL;

COMMENT ON VIEW v_all_appointments IS 
'Vista combinada de citas de property_appointments y appointments (sin duplicar las sincronizadas)';

-- ==========================================
-- PASO 6: Verificar que funciona
-- ==========================================

SELECT 
    source,
    COUNT(*) as total_citas,
    COUNT(DISTINCT advisor_id) as total_asesores
FROM v_all_appointments
GROUP BY source
ORDER BY source;

-- ==========================================
-- RESULTADO ESPERADO
-- ==========================================
-- Deberías ver algo como:
-- source    | total_citas | total_asesores
-- ---------+-------------+---------------
-- calendar |      X      |       Y
-- property |      Z      |       W
-- ==========================================

