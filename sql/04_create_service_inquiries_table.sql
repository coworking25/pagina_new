-- Crear tabla para consultas de servicios
CREATE TABLE IF NOT EXISTS service_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Información del cliente
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50) NOT NULL,
    
    -- Información del servicio
    service_type VARCHAR(100) NOT NULL, -- 'arrendamientos', 'ventas', 'avaluos', etc.
    urgency VARCHAR(50) NOT NULL DEFAULT 'normal', -- 'urgent', 'normal', 'flexible'
    budget VARCHAR(255),
    details TEXT,
    
    -- Preguntas específicas seleccionadas
    selected_questions JSONB DEFAULT '[]',
    
    -- Estado de la consulta
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    
    -- Asesor asignado
    assigned_advisor_id UUID REFERENCES advisors(id),
    
    -- Metadata
    whatsapp_sent BOOLEAN DEFAULT FALSE,
    whatsapp_sent_at TIMESTAMPTZ,
    response_received BOOLEAN DEFAULT FALSE,
    response_received_at TIMESTAMPTZ,
    
    -- Campos adicionales
    source VARCHAR(100) DEFAULT 'website', -- 'website', 'whatsapp', 'phone', etc.
    notes TEXT
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_service_inquiries_created_at ON service_inquiries (created_at);
CREATE INDEX IF NOT EXISTS idx_service_inquiries_service_type ON service_inquiries (service_type);
CREATE INDEX IF NOT EXISTS idx_service_inquiries_status ON service_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_service_inquiries_assigned_advisor ON service_inquiries (assigned_advisor_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_service_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER trigger_service_inquiries_updated_at
    BEFORE UPDATE ON service_inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_service_inquiries_updated_at();

-- Política de seguridad (RLS)
ALTER TABLE service_inquiries ENABLE ROW LEVEL SECURITY;

-- Permitir inserción pública (para el formulario web)
CREATE POLICY "Anyone can insert service inquiries" ON service_inquiries
    FOR INSERT WITH CHECK (true);

-- Permitir lectura solo a usuarios autenticados (para administradores)
CREATE POLICY "Authenticated users can view service inquiries" ON service_inquiries
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir actualización solo a usuarios autenticados
CREATE POLICY "Authenticated users can update service inquiries" ON service_inquiries
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Comentarios para documentación
COMMENT ON TABLE service_inquiries IS 'Tabla para almacenar las consultas de servicios de los clientes';
COMMENT ON COLUMN service_inquiries.service_type IS 'Tipo de servicio solicitado: arrendamientos, ventas, avaluos, etc.';
COMMENT ON COLUMN service_inquiries.urgency IS 'Nivel de urgencia: urgent, normal, flexible';
COMMENT ON COLUMN service_inquiries.selected_questions IS 'Array JSON de preguntas específicas seleccionadas por el cliente';
COMMENT ON COLUMN service_inquiries.status IS 'Estado de la consulta: pending, in_progress, completed, cancelled';
