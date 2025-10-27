-- =====================================================
-- SISTEMA DE CITAS/CALENDARIO - FASE 6
-- =====================================================

-- Tabla principal de citas
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,

    -- Relaciones
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    advisor_id UUID REFERENCES advisors(id) ON DELETE SET NULL,
    property_id BIGINT REFERENCES properties(id) ON DELETE SET NULL,

    -- Ubicación y tipo
    location VARCHAR(500),
    appointment_type VARCHAR(50) DEFAULT 'meeting', -- meeting, viewing, consultation, etc.
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled, no_show

    -- Información de contacto
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),

    -- Google Calendar sync
    google_event_id VARCHAR(255),
    google_calendar_id VARCHAR(255),
    last_synced_at TIMESTAMP WITH TIME ZONE,

    -- Recordatorios
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,

    -- Notas y seguimiento
    notes TEXT,
    internal_notes TEXT, -- Solo para administradores
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT,

    -- Metadatos
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_status CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    CONSTRAINT valid_appointment_type CHECK (appointment_type IN ('meeting', 'viewing', 'consultation', 'valuation', 'follow_up', 'other'))
);

-- Tabla de disponibilidad de asesores
CREATE TABLE IF NOT EXISTS advisor_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE,

    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    UNIQUE(advisor_id, day_of_week, start_time, end_time)
);

-- Tabla de excepciones de disponibilidad (días específicos no disponibles)
CREATE TABLE IF NOT EXISTS availability_exceptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE,

    exception_date DATE NOT NULL,
    is_available BOOLEAN DEFAULT FALSE,
    start_time TIME,
    end_time TIME,
    reason TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_exception_time CHECK (
        (is_available = FALSE) OR
        (is_available = TRUE AND start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
    )
);

-- Tabla de configuración de calendario
CREATE TABLE IF NOT EXISTS calendar_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración por defecto
INSERT INTO calendar_settings (setting_key, setting_value, description) VALUES
('google_calendar_enabled', 'false'::jsonb, 'Habilitar sincronización con Google Calendar'),
('google_calendar_id', 'null'::jsonb, 'ID del calendario de Google Calendar'),
('default_appointment_duration', '60'::jsonb, 'Duración por defecto de citas en minutos'),
('reminder_hours_before', '24'::jsonb, 'Horas antes para enviar recordatorio'),
('working_hours_start', '"09:00"'::jsonb, 'Hora de inicio de jornada laboral'),
('working_hours_end', '"17:00"'::jsonb, 'Hora de fin de jornada laboral'),
('timezone', '"America/Bogota"'::jsonb, 'Zona horaria por defecto'),
('reminder_enabled', 'true'::jsonb, 'Habilitar sistema de recordatorios automáticos'),
('follow_up_reminder_days', '7'::jsonb, 'Días para recordar seguimientos pendientes')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_advisor_id ON appointments(advisor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_property_id ON appointments(property_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_range ON appointments(start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_advisor_availability_advisor_day ON advisor_availability(advisor_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_advisor_date ON availability_exceptions(advisor_id, exception_date);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Crear tabla profiles si no existe
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asegurar que la tabla advisors tenga la columna user_id
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para appointments
CREATE POLICY "Users can view appointments they created or are assigned to" ON appointments
    FOR SELECT USING (
        auth.uid() = created_by OR
        advisor_id IN (
            SELECT id FROM advisors WHERE user_id = auth.uid()
        ) OR
        client_id IN (
            SELECT id FROM clients WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update appointments they created or are assigned to" ON appointments
    FOR UPDATE USING (
        auth.uid() = created_by OR
        advisor_id IN (
            SELECT id FROM advisors WHERE user_id = auth.uid()
        )
    );

-- Políticas para advisor_availability
CREATE POLICY "Advisors can view their own availability" ON advisor_availability
    FOR SELECT USING (
        advisor_id IN (
            SELECT id FROM advisors WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Advisors can manage their own availability" ON advisor_availability
    FOR ALL USING (
        advisor_id IN (
            SELECT id FROM advisors WHERE user_id = auth.uid()
        )
    );

-- Políticas para availability_exceptions
CREATE POLICY "Advisors can view their own exceptions" ON availability_exceptions
    FOR SELECT USING (
        advisor_id IN (
            SELECT id FROM advisors WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Advisors can manage their own exceptions" ON availability_exceptions
    FOR ALL USING (
        advisor_id IN (
            SELECT id FROM advisors WHERE user_id = auth.uid()
        )
    );

-- Políticas para calendar_settings (solo admins)
CREATE POLICY "Only admins can view calendar settings" ON calendar_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can manage calendar settings" ON calendar_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para verificar conflictos de horario
CREATE OR REPLACE FUNCTION check_appointment_conflicts(
    p_advisor_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_exclude_appointment_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO conflict_count
    FROM appointments
    WHERE advisor_id = p_advisor_id
        AND status NOT IN ('cancelled', 'completed')
        AND (
            (start_time <= p_start_time AND end_time > p_start_time) OR
            (start_time < p_end_time AND end_time >= p_end_time) OR
            (start_time >= p_start_time AND end_time <= p_end_time)
        )
        AND (p_exclude_appointment_id IS NULL OR id != p_exclude_appointment_id);

    RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener disponibilidad de un asesor en una fecha específica
CREATE OR REPLACE FUNCTION get_advisor_availability(
    p_advisor_id UUID,
    p_date DATE
) RETURNS TABLE (
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN
) AS $$
DECLARE
    day_of_week_num INTEGER;
BEGIN
    day_of_week_num := EXTRACT(DOW FROM p_date);

    -- Primero verificar excepciones específicas
    IF EXISTS (
        SELECT 1 FROM availability_exceptions
        WHERE advisor_id = p_advisor_id
            AND exception_date = p_date
    ) THEN
        RETURN QUERY
        SELECT
            ae.start_time,
            ae.end_time,
            ae.is_available
        FROM availability_exceptions ae
        WHERE ae.advisor_id = p_advisor_id
            AND ae.exception_date = p_date;
    ELSE
        -- Retornar disponibilidad regular
        RETURN QUERY
        SELECT
            aa.start_time,
            aa.end_time,
            aa.is_available
        FROM advisor_availability aa
        WHERE aa.advisor_id = p_advisor_id
            AND aa.day_of_week = day_of_week_num;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para crear cita con validaciones
CREATE OR REPLACE FUNCTION create_appointment_with_validation(
    p_title VARCHAR(255),
    p_description TEXT,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_advisor_id UUID,
    p_client_id UUID DEFAULT NULL,
    p_property_id BIGINT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_appointment_id UUID;
BEGIN
    -- Validar que no hay conflictos
    IF NOT check_appointment_conflicts(p_advisor_id, p_start_time, p_end_time) THEN
        RAISE EXCEPTION 'Conflicto de horario: El asesor ya tiene una cita programada en este horario';
    END IF;

    -- Crear la cita
    INSERT INTO appointments (
        title, description, start_time, end_time,
        advisor_id, client_id, property_id, created_by
    ) VALUES (
        p_title, p_description, p_start_time, p_end_time,
        p_advisor_id, p_client_id, p_property_id, COALESCE(p_created_by, auth.uid())
    ) RETURNING id INTO new_appointment_id;

    RETURN new_appointment_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SISTEMA DE RECORDATORIOS AUTOMÁTICOS
-- =====================================================

-- Función para enviar recordatorios de citas próximas
CREATE OR REPLACE FUNCTION send_appointment_reminders()
RETURNS TABLE (
    appointment_id UUID,
    client_email VARCHAR(255),
    advisor_email VARCHAR(255),
    reminder_type VARCHAR(50)
) AS $$
DECLARE
    reminder_hours INTEGER := 24; -- Horas antes para enviar recordatorio
    appointment_record RECORD;
BEGIN
    -- Obtener configuración de horas de recordatorio
    SELECT (setting_value->>0)::INTEGER INTO reminder_hours
    FROM calendar_settings
    WHERE setting_key = 'reminder_hours_before';

    -- Si no hay configuración, usar 24 horas por defecto
    IF reminder_hours IS NULL THEN
        reminder_hours := 24;
    END IF;

    -- Crear tabla temporal para resultados
    CREATE TEMP TABLE reminder_results (
        appointment_id UUID,
        client_email VARCHAR(255),
        advisor_email VARCHAR(255),
        reminder_type VARCHAR(50)
    );

    -- Encontrar citas que necesitan recordatorios
    FOR appointment_record IN
        SELECT
            a.id,
            a.title,
            a.start_time,
            a.end_time,
            a.appointment_type,
            a.location,
            a.contact_email as client_email,
            c.email as client_table_email,
            ad.email as advisor_email,
            a.reminder_sent,
            a.created_by
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN advisors ad ON a.advisor_id = ad.id
        WHERE a.status IN ('scheduled', 'confirmed')
            AND a.start_time > NOW()
            AND a.start_time <= NOW() + INTERVAL '1 hour' * reminder_hours
            AND a.reminder_sent = FALSE
    LOOP
        -- Determinar email del cliente (usar contact_email o email de tabla clients)
        DECLARE
            final_client_email VARCHAR(255) := COALESCE(appointment_record.client_email, appointment_record.client_table_email);
            final_advisor_email VARCHAR(255) := appointment_record.advisor_email;
        BEGIN
            -- Insertar resultado en tabla temporal
            INSERT INTO reminder_results (appointment_id, client_email, advisor_email, reminder_type)
            VALUES (appointment_record.id, final_client_email, final_advisor_email, 'upcoming_appointment');

            -- Marcar como recordatorio enviado
            UPDATE appointments
            SET reminder_sent = TRUE, reminder_sent_at = NOW()
            WHERE id = appointment_record.id;
        END;
    END LOOP;

    -- Retornar resultados
    RETURN QUERY SELECT * FROM reminder_results;

    -- Limpiar tabla temporal
    DROP TABLE reminder_results;
END;
$$ LANGUAGE plpgsql;

-- Función para enviar recordatorios de seguimiento
CREATE OR REPLACE FUNCTION send_follow_up_reminders()
RETURNS TABLE (
    appointment_id UUID,
    client_email VARCHAR(255),
    advisor_email VARCHAR(255),
    reminder_type VARCHAR(50)
) AS $$
DECLARE
    appointment_record RECORD;
BEGIN
    -- Crear tabla temporal para resultados
    CREATE TEMP TABLE follow_up_results (
        appointment_id UUID,
        client_email VARCHAR(255),
        advisor_email VARCHAR(255),
        reminder_type VARCHAR(50)
    );

    -- Encontrar citas completadas que necesitan seguimiento
    FOR appointment_record IN
        SELECT
            a.id,
            a.title,
            a.start_time,
            a.end_time,
            a.appointment_type,
            a.follow_up_required,
            a.contact_email as client_email,
            c.email as client_table_email,
            ad.email as advisor_email,
            a.created_by
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN advisors ad ON a.advisor_id = ad.id
        WHERE a.status = 'completed'
            AND a.follow_up_required = TRUE
            AND a.end_time < NOW()
            AND a.end_time > NOW() - INTERVAL '7 days' -- Solo citas de la última semana
    LOOP
        -- Determinar email del cliente
        DECLARE
            final_client_email VARCHAR(255) := COALESCE(appointment_record.client_email, appointment_record.client_table_email);
            final_advisor_email VARCHAR(255) := appointment_record.advisor_email;
        BEGIN
            -- Insertar resultado en tabla temporal
            INSERT INTO follow_up_results (appointment_id, client_email, advisor_email, reminder_type)
            VALUES (appointment_record.id, final_client_email, final_advisor_email, 'follow_up_required');
        END;
    END LOOP;

    -- Retornar resultados
    RETURN QUERY SELECT * FROM follow_up_results;

    -- Limpiar tabla temporal
    DROP TABLE follow_up_results;
END;
$$ LANGUAGE plpgsql;

-- Función principal para procesar todos los recordatorios
CREATE OR REPLACE FUNCTION process_all_reminders()
RETURNS TABLE (
    reminder_type VARCHAR(50),
    appointments_count INTEGER,
    details JSONB
) AS $$
DECLARE
    upcoming_reminders RECORD;
    follow_up_reminders RECORD;
    total_upcoming INTEGER := 0;
    total_follow_up INTEGER := 0;
BEGIN
    -- Procesar recordatorios de citas próximas
    SELECT COUNT(*) INTO total_upcoming FROM send_appointment_reminders();

    -- Procesar recordatorios de seguimiento
    SELECT COUNT(*) INTO total_follow_up FROM send_follow_up_reminders();

    -- Retornar resumen
    RETURN QUERY
    SELECT
        'upcoming_appointments'::VARCHAR(50) as reminder_type,
        total_upcoming as appointments_count,
        jsonb_build_object(
            'message', 'Recordatorios de citas próximas enviados',
            'timestamp', NOW()
        ) as details
    UNION ALL
    SELECT
        'follow_up_reminders'::VARCHAR(50) as reminder_type,
        total_follow_up as appointments_count,
        jsonb_build_object(
            'message', 'Recordatorios de seguimiento identificados',
            'timestamp', NOW()
        ) as details;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advisor_availability_updated_at
    BEFORE UPDATE ON advisor_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_settings_updated_at
    BEFORE UPDATE ON calendar_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Insertar disponibilidad por defecto para asesores existentes
INSERT INTO advisor_availability (advisor_id, day_of_week, start_time, end_time, is_available)
SELECT
    a.id,
    day_of_week,
    '09:00'::TIME,
    '17:00'::TIME,
    TRUE
FROM advisors a
CROSS JOIN generate_series(1, 5) AS day_of_week -- Lunes a Viernes
ON CONFLICT (advisor_id, day_of_week, start_time, end_time) DO NOTHING;

-- Insertar algunas citas de ejemplo
INSERT INTO appointments (
    title, description, start_time, end_time, advisor_id, client_id,
    appointment_type, status, created_by
) VALUES
(
    'Visita propiedad Calle 123',
    'Visita guiada a la propiedad en alquiler',
    NOW() + INTERVAL '2 days 10:00',
    NOW() + INTERVAL '2 days 11:00',
    (SELECT id FROM advisors LIMIT 1),
    (SELECT id FROM clients LIMIT 1),
    'viewing',
    'scheduled',
    (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE appointments IS 'Tabla principal para gestionar citas y eventos del calendario';
COMMENT ON TABLE advisor_availability IS 'Disponibilidad semanal de los asesores';
COMMENT ON TABLE availability_exceptions IS 'Excepciones específicas de disponibilidad (días festivos, vacaciones, etc.)';
COMMENT ON TABLE calendar_settings IS 'Configuración general del sistema de calendario';

-- =====================================================
-- INSTRUCCIONES PARA EL SISTEMA DE RECORDATORIOS
-- =====================================================
/*
SISTEMA DE RECORDATORIOS AUTOMÁTICOS
====================================

Este sistema incluye funciones para enviar recordatorios automáticos de citas:

1. send_appointment_reminders()
   - Envía recordatorios de citas próximas (por defecto 24 horas antes)
   - Marca las citas como recordatorio enviado
   - Retorna lista de recordatorios enviados

2. send_follow_up_reminders()
   - Identifica citas completadas que necesitan seguimiento
   - Retorna lista de recordatorios de seguimiento

3. process_all_reminders()
   - Función principal que ejecuta todos los tipos de recordatorios
   - Retorna resumen de actividades realizadas

CONFIGURACIÓN:
- reminder_hours_before: Horas antes para enviar recordatorio (default: 24)
- reminder_enabled: Habilitar/deshabilitar recordatorios (default: true)
- follow_up_reminder_days: Días para recordar seguimientos (default: 7)

USO RECOMENDADO:
- Ejecutar process_all_reminders() diariamente con un cron job
- O usar Supabase Edge Functions para automatizar el proceso
- Integrar con servicios de email como SendGrid o Resend

EJEMPLO DE EJECUCIÓN:
SELECT * FROM process_all_reminders();
*/