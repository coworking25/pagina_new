-- ==========================================
-- CONFIGURAR HORARIO LABORAL DE ASESORES
-- Lunes a Viernes: 9:00 AM - 5:00 PM
-- ==========================================

-- Verificar si existe la tabla advisor_availability
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'advisor_availability'
);

-- Eliminar configuraciones anteriores (opcional)
-- DELETE FROM advisor_availability;

-- Configurar horario para TODOS los asesores
-- Lunes (1) a Viernes (5): 9:00 AM - 5:00 PM
-- Sábado (6) y Domingo (0): NO disponible

INSERT INTO advisor_availability (advisor_id, day_of_week, is_available, start_time, end_time)
SELECT 
    a.id as advisor_id,
    dow as day_of_week,
    CASE 
        WHEN dow BETWEEN 1 AND 5 THEN true  -- Lunes a Viernes: DISPONIBLE
        ELSE false                           -- Sábado y Domingo: NO DISPONIBLE
    END as is_available,
    CASE 
        WHEN dow BETWEEN 1 AND 5 THEN '09:00'::TIME  -- Hora inicio: 9:00 AM
        ELSE NULL
    END as start_time,
    CASE 
        WHEN dow BETWEEN 1 AND 5 THEN '17:00'::TIME  -- Hora fin: 5:00 PM
        ELSE NULL
    END as end_time
FROM advisors a
CROSS JOIN generate_series(0, 6) dow  -- 0=Domingo, 1=Lunes, ..., 6=Sábado
ON CONFLICT (advisor_id, day_of_week) 
DO UPDATE SET
    is_available = EXCLUDED.is_available,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time;

-- Verificar configuración
SELECT 
    a.name as asesor,
    CASE av.day_of_week
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
    END as dia,
    av.is_available as disponible,
    av.start_time as hora_inicio,
    av.end_time as hora_fin
FROM advisor_availability av
JOIN advisors a ON a.id = av.advisor_id
ORDER BY a.name, av.day_of_week;

-- Resumen por asesor
SELECT 
    a.name as asesor,
    COUNT(CASE WHEN av.is_available THEN 1 END) as dias_disponibles,
    MIN(av.start_time) as primera_hora,
    MAX(av.end_time) as ultima_hora
FROM advisor_availability av
JOIN advisors a ON a.id = av.advisor_id
GROUP BY a.name
ORDER BY a.name;

-- ==========================================
-- RESULTADO ESPERADO:
-- Cada asesor debe tener:
-- - 5 días disponibles (Lunes a Viernes)
-- - Hora inicio: 09:00
-- - Hora fin: 17:00
-- - Sábado y Domingo: NO disponibles
-- ==========================================
