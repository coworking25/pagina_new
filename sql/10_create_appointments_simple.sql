-- Crear tabla simplificada para las citas (sin referencias FK problemáticas)
CREATE TABLE IF NOT EXISTS property_appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Información del cliente
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    
    -- Información de la propiedad y la cita (sin referencias FK)
    property_id VARCHAR(50), -- Cambiar a VARCHAR para evitar problemas de FK
    advisor_id VARCHAR(50),  -- Cambiar a VARCHAR para evitar problemas de FK
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

-- Habilitar RLS (Row Level Security)
ALTER TABLE property_appointments ENABLE ROW LEVEL SECURITY;

-- Política para permitir INSERT a usuarios anónimos (para que funcione desde la web)
CREATE POLICY "Allow insert for everyone" ON property_appointments
    FOR INSERT 
    WITH CHECK (true);

-- Política para permitir SELECT a usuarios anónimos (para admin y debugging)
CREATE POLICY "Allow select for everyone" ON property_appointments
    FOR SELECT 
    USING (true);

-- Política para permitir UPDATE a usuarios autenticados
CREATE POLICY "Allow update for authenticated users" ON property_appointments
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

-- Comentario sobre la tabla
COMMENT ON TABLE property_appointments IS 'Tabla para almacenar las citas de clientes interesados en propiedades';
