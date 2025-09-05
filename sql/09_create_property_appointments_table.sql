-- Crear tabla para las citas de clientes interesados en propiedades
CREATE TABLE IF NOT EXISTS property_appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Información del cliente
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    
    -- Información de la propiedad y la cita
    property_id BIGINT REFERENCES public.properties(id),
    advisor_id UUID REFERENCES public.advisors(id),
    appointment_date TIMESTAMPTZ NOT NULL,
    appointment_type VARCHAR(50) NOT NULL, -- 'visita', 'consulta', 'avaluo', 'asesoria'
    visit_type VARCHAR(50) NOT NULL, -- 'presencial', 'virtual', 'mixta'
    attendees INTEGER DEFAULT 1,
    special_requests TEXT,
    
    -- Preferencias de contacto
    contact_method VARCHAR(50) DEFAULT 'whatsapp', -- 'whatsapp', 'phone', 'email'
    marketing_consent BOOLEAN DEFAULT FALSE,
    
    -- Estado de la cita
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    
    -- Campos para seguimiento
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Campos adicionales
    notes TEXT,
    feedback_rating INTEGER,
    feedback_comments TEXT
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_property_appointments_created_at ON property_appointments(created_at);
CREATE INDEX IF NOT EXISTS idx_property_appointments_appointment_date ON property_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_property_appointments_property_id ON property_appointments(property_id);
CREATE INDEX IF NOT EXISTS idx_property_appointments_advisor_id ON property_appointments(advisor_id);
CREATE INDEX IF NOT EXISTS idx_property_appointments_status ON property_appointments(status);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_property_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER trigger_property_appointments_updated_at
    BEFORE UPDATE ON property_appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_property_appointments_updated_at();

-- Política de seguridad (RLS)
ALTER TABLE property_appointments ENABLE ROW LEVEL SECURITY;

-- Permitir inserción pública (para el formulario web)
CREATE POLICY "Anyone can insert property appointments" ON property_appointments
    FOR INSERT WITH CHECK (true);

-- Permitir lectura solo a usuarios autenticados (para administradores)
CREATE POLICY "Authenticated users can view property appointments" ON property_appointments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir actualización solo a usuarios autenticados
CREATE POLICY "Authenticated users can update property appointments" ON property_appointments
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Comentarios para documentación
COMMENT ON TABLE property_appointments IS 'Tabla para almacenar las citas de clientes interesados en propiedades';
COMMENT ON COLUMN property_appointments.appointment_type IS 'Tipo de cita: visita, consulta, avaluo, asesoria';
COMMENT ON COLUMN property_appointments.visit_type IS 'Modalidad de visita: presencial, virtual, mixta';
COMMENT ON COLUMN property_appointments.status IS 'Estado de la cita: pending, confirmed, completed, cancelled';
