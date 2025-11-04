-- ==========================================
-- MIGRACIÓN: Agregar Sincronización entre Citas
-- ==========================================
-- Fecha: 2025-01-04
-- Propósito: Conectar property_appointments con appointments para sincronización

-- 1️⃣ Agregar columna de referencia a property_appointments en appointments
-- 🔧 FIX: Usar UUID en lugar de VARCHAR para coincidir con property_appointments.id
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS property_appointment_id UUID REFERENCES property_appointments(id) ON DELETE CASCADE;

-- 2️⃣ Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_appointments_property_appointment_id 
ON appointments(property_appointment_id);

-- 3️⃣ Agregar comentario
COMMENT ON COLUMN appointments.property_appointment_id IS 
'ID de la cita original de property_appointments si fue sincronizada desde la web';

-- 4️⃣ Verificar estructura
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'appointments' 
  AND column_name = 'property_appointment_id';

-- 5️⃣ Mostrar citas que pueden sincronizarse
SELECT 
    COUNT(*) as total_property_appointments,
    COUNT(DISTINCT advisor_id) as asesores_con_citas
FROM property_appointments
WHERE status != 'cancelled';

-- ==========================================
-- SCRIPT OPCIONAL: Sincronización Inicial
-- ==========================================
-- Ejecutar SOLO si quieres sincronizar citas existentes

/*
-- Crear citas en appointments desde property_appointments existentes
INSERT INTO appointments (
    title,
    description,
    start_time,
    end_time,
    all_day,
    advisor_id,
    property_id,
    location,
    appointment_type,
    status,
    contact_name,
    contact_email,
    contact_phone,
    notes,
    internal_notes,
    reminder_sent,
    follow_up_required,
    property_appointment_id,
    created_at,
    updated_at
)
SELECT 
    CONCAT('Cita - ', COALESCE(p.title, 'Propiedad')) as title,
    COALESCE(pa.special_requests, 'Cita agendada desde la web') as description,
    pa.appointment_date as start_time,
    pa.appointment_date + INTERVAL '1 hour' as end_time,
    false as all_day,
    pa.advisor_id,
    pa.property_id::VARCHAR,  -- 🔧 Convertir BIGINT a VARCHAR
    p.location,
    CASE 
        WHEN pa.appointment_type = 'viewing' THEN 'viewing'
        WHEN pa.appointment_type = 'consultation' THEN 'consultation'
        ELSE 'meeting'
    END as appointment_type,
    CASE 
        WHEN pa.status = 'confirmed' THEN 'confirmed'
        WHEN pa.status = 'completed' THEN 'completed'
        WHEN pa.status = 'cancelled' THEN 'cancelled'
        WHEN pa.status = 'no_show' THEN 'no_show'
        ELSE 'scheduled'
    END as status,
    pa.client_name as contact_name,
    pa.client_email,
    pa.client_phone,
    pa.special_requests as notes,
    CONCAT('Sincronizada desde property_appointment #', pa.id) as internal_notes,
    false as reminder_sent,
    false as follow_up_required,
    pa.id as property_appointment_id,
    pa.created_at,
    pa.updated_at
FROM property_appointments pa
LEFT JOIN properties p ON p.id = pa.property_id  -- 🔧 Ambos BIGINT - compatibles
WHERE pa.status != 'cancelled'  -- 🔧 Filtrar canceladas
  AND NOT EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.property_appointment_id = pa.id
  );

-- Verificar sincronización
SELECT 
    'Property Appointments' as tabla,
    COUNT(*) as total
FROM property_appointments
WHERE status != 'cancelled'
UNION ALL
SELECT 
    'Appointments Sincronizadas' as tabla,
    COUNT(*) as total
FROM appointments
WHERE property_appointment_id IS NOT NULL;
*/

-- ==========================================
-- VISTA COMBINADA (OPCIONAL)
-- ==========================================
-- Vista que combina ambos tipos de citas

CREATE OR REPLACE VIEW v_all_appointments AS
SELECT 
    'property' as source,
    pa.id::VARCHAR as id,
    CONCAT('Cita - ', COALESCE(p.title, 'Propiedad')) as title,
    pa.appointment_date as start_time,
    pa.appointment_date + INTERVAL '1 hour' as end_time,
    false as all_day,
    pa.advisor_id,
    a.name as advisor_name,
    pa.property_id::VARCHAR as property_id,
    p.title as property_title,
    p.location,
    pa.appointment_type::VARCHAR as appointment_type,
    pa.status::VARCHAR as status,
    pa.client_name as contact_name,
    pa.client_email as contact_email,
    pa.client_phone as contact_phone,
    pa.special_requests as notes,
    pa.created_at,
    pa.updated_at
FROM property_appointments pa
LEFT JOIN properties p ON p.id = pa.property_id
LEFT JOIN advisors a ON a.id = pa.advisor_id
WHERE pa.status != 'cancelled'  -- 🔧 Filtrar por status en lugar de deleted_at

UNION ALL

SELECT 
    'calendar' as source,
    apt.id::VARCHAR as id,
    apt.title,
    apt.start_time,
    apt.end_time,
    apt.all_day,
    apt.advisor_id,
    a.name as advisor_name,
    apt.property_id,
    p.title as property_title,
    apt.location,
    apt.appointment_type::VARCHAR,
    apt.status::VARCHAR,
    apt.contact_name,
    apt.contact_email,
    apt.contact_phone,
    apt.notes,
    apt.created_at,
    apt.updated_at
FROM appointments apt
LEFT JOIN properties p ON p.id::BIGINT = apt.property_id::BIGINT
LEFT JOIN advisors a ON a.id = apt.advisor_id
WHERE apt.property_appointment_id IS NULL;

-- Ejemplo de uso de la vista:
-- SELECT * FROM v_all_appointments WHERE advisor_id = 'xxx' ORDER BY start_time DESC;

COMMENT ON VIEW v_all_appointments IS 
'Vista combinada de citas de property_appointments y appointments (sin duplicar las sincronizadas)';
