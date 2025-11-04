-- ==========================================
-- ACTUALIZAR VISTA - MOSTRAR TODAS LAS CITAS
-- ==========================================
-- Solo ejecuta este script después de ver el diagnóstico

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
LEFT JOIN properties p ON p.id = pa.property_id
LEFT JOIN advisors a ON a.id = pa.advisor_id
-- SIN FILTRO - mostrar todas las citas independientemente del status

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
LEFT JOIN properties p ON p.id = apt.property_id
LEFT JOIN advisors a ON a.id = apt.advisor_id
WHERE apt.property_appointment_id IS NULL;

COMMENT ON VIEW v_all_appointments IS 
'Vista combinada de TODAS las citas de property_appointments y appointments (sin duplicar las sincronizadas)';

-- Verificar resultado
SELECT 
    source,
    status,
    COUNT(*) as cantidad
FROM v_all_appointments
GROUP BY source, status
ORDER BY source, status;

-- Total por fuente
SELECT 
    source,
    COUNT(*) as total_citas
FROM v_all_appointments
GROUP BY source;
