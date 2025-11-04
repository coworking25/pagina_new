-- ==========================================
-- ACTUALIZAR VISTA - MOSTRAR TODAS LAS CITAS
-- Incluso las que NO tienen property válido
-- ==========================================

DROP VIEW IF EXISTS v_all_appointments CASCADE;

CREATE OR REPLACE VIEW v_all_appointments AS
-- Citas desde property_appointments (web)
SELECT 
    'property'::TEXT as source,
    pa.id::TEXT as id,
    CASE 
        WHEN p.title IS NOT NULL THEN CONCAT('Cita - ', p.title)
        ELSE CONCAT('Cita - Propiedad ID: ', COALESCE(pa.property_id::TEXT, 'Sin especificar'))
    END as title,
    pa.appointment_date as start_time,
    pa.appointment_date + INTERVAL '1 hour' as end_time,
    false as all_day,
    pa.advisor_id::TEXT as advisor_id,
    COALESCE(a.name, 'Sin asesor') as advisor_name,
    COALESCE(pa.property_id::TEXT, 'N/A') as property_id,
    COALESCE(p.title, 'Propiedad no encontrada') as property_title,
    COALESCE(p.location, 'Ubicación no disponible') as location,
    pa.appointment_type::TEXT as appointment_type,
    pa.status::TEXT as status,
    pa.client_name as contact_name,
    pa.client_email as contact_email,
    pa.client_phone as contact_phone,
    COALESCE(pa.special_requests, '') as notes,
    pa.created_at,
    pa.updated_at
FROM property_appointments pa
LEFT JOIN properties p ON p.id = pa.property_id       -- LEFT JOIN incluye aunque no exista property
LEFT JOIN advisors a ON a.id = pa.advisor_id          -- LEFT JOIN incluye aunque no exista advisor
-- SIN FILTRO WHERE - mostrar TODAS las citas

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
    COALESCE(apt.property_id::TEXT, 'N/A') as property_id,
    COALESCE(p.title, 'Propiedad no encontrada') as property_title,
    COALESCE(apt.location, 'Ubicación no disponible') as location,
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
WHERE apt.property_appointment_id IS NULL;  -- Evitar duplicados

COMMENT ON VIEW v_all_appointments IS 
'Vista combinada de TODAS las citas - incluye citas sin property válido';

-- Verificar resultado
SELECT 
    'Total por fuente' as descripcion,
    source,
    COUNT(*) as total_citas
FROM v_all_appointments
GROUP BY source
ORDER BY source;

-- Ver distribución con/sin property
SELECT 
    'Citas con/sin property' as descripcion,
    source,
    CASE 
        WHEN property_title = 'Propiedad no encontrada' THEN 'Sin property válido'
        ELSE 'Con property válido'
    END as tiene_property,
    COUNT(*) as cantidad
FROM v_all_appointments
GROUP BY source, tiene_property
ORDER BY source, tiene_property;
