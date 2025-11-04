-- ==========================================
-- SCRIPT COMPLETO: CALENDARIO Y HORARIOS
-- ==========================================

-- PASO 1: Eliminar tabla vieja y recrear
DROP TABLE IF EXISTS advisor_availability CASCADE;

CREATE TABLE advisor_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    advisor_id UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_time_range_availability CHECK (end_time > start_time),
    CONSTRAINT unique_advisor_day UNIQUE(advisor_id, day_of_week)
);

-- PASO 2: Crear índices
CREATE INDEX IF NOT EXISTS idx_advisor_availability_advisor 
ON advisor_availability(advisor_id);

CREATE INDEX IF NOT EXISTS idx_advisor_availability_day 
ON advisor_availability(day_of_week);

-- PASO 3: Configurar horario Lunes a Viernes 9:00 AM - 5:00 PM
INSERT INTO advisor_availability (advisor_id, day_of_week, is_available, start_time, end_time)
SELECT 
    a.id as advisor_id,
    dow as day_of_week,
    CASE 
        WHEN dow BETWEEN 1 AND 5 THEN true   -- Lunes (1) a Viernes (5)
        ELSE false                            -- Sábado (6) y Domingo (0)
    END as is_available,
    '09:00:00'::TIME as start_time,          -- 🔧 Mismo horario para todos
    '17:00:00'::TIME as end_time             -- 🔧 Pero is_available controla disponibilidad
FROM advisors a
CROSS JOIN generate_series(0, 6) dow;

-- PASO 4: Verificar configuración
SELECT 
    a.name as asesor,
    CASE av.day_of_week
        WHEN 0 THEN '0-Domingo'
        WHEN 1 THEN '1-Lunes'
        WHEN 2 THEN '2-Martes'
        WHEN 3 THEN '3-Miércoles'
        WHEN 4 THEN '4-Jueves'
        WHEN 5 THEN '5-Viernes'
        WHEN 6 THEN '6-Sábado'
    END as dia,
    av.day_of_week,
    av.is_available as disponible,
    av.start_time as inicio,
    av.end_time as fin
FROM advisor_availability av
JOIN advisors a ON a.id = av.advisor_id
ORDER BY a.name, av.day_of_week;

-- PASO 5: Resumen
SELECT 
    a.name as asesor,
    COUNT(CASE WHEN av.is_available THEN 1 END) as dias_laborales,
    STRING_AGG(
        CASE 
            WHEN av.is_available THEN 
                CASE av.day_of_week
                    WHEN 1 THEN 'Lun'
                    WHEN 2 THEN 'Mar'
                    WHEN 3 THEN 'Mié'
                    WHEN 4 THEN 'Jue'
                    WHEN 5 THEN 'Vie'
                END
        END, 
        ', ' 
        ORDER BY av.day_of_week
    ) as dias,
    MIN(CASE WHEN av.is_available THEN av.start_time END) as hora_inicio,
    MAX(CASE WHEN av.is_available THEN av.end_time END) as hora_fin
FROM advisor_availability av
JOIN advisors a ON a.id = av.advisor_id
GROUP BY a.name, a.id
ORDER BY a.name;

-- ==========================================
-- RESULTADO ESPERADO:
-- Cada asesor debe tener:
-- - 5 días laborales (Lunes a Viernes)
-- - Horario: 09:00:00 a 17:00:00
-- - Sábado y Domingo marcados como NO disponibles
-- ==========================================
