-- =====================================================
-- SISTEMA DE GESTIÓN DE CLIENTES - SUPABASE SCRIPT
-- Ejecutar en partes o completo según necesites
-- =====================================================

-- =====================================================
-- PARTE 1: LIMPIAR TABLAS EXISTENTES
-- =====================================================
DROP TABLE IF EXISTS client_alerts CASCADE;
DROP TABLE IF EXISTS client_documents CASCADE;
DROP TABLE IF EXISTS client_communications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- =====================================================
-- PARTE 2: CREAR TABLAS PRINCIPALES
-- =====================================================

-- TABLA CLIENTS
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Información Personal
    full_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('cedula', 'pasaporte', 'nit')),
    document_number VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    
    -- Tipo y Estado
    client_type VARCHAR(20) NOT NULL CHECK (client_type IN ('tenant', 'landlord', 'buyer', 'seller')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'blocked')),
    
    -- Información Financiera
    monthly_income DECIMAL(15,2),
    occupation VARCHAR(255),
    company_name VARCHAR(255),
    
    -- Asignación y Metadatos
    assigned_advisor_id UUID,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constrains únicos
    UNIQUE(document_type, document_number)
);

-- TABLA CONTRACTS
CREATE TABLE contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Referencias
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    property_id UUID,
    landlord_id UUID REFERENCES clients(id),
    
    -- Información del Contrato
    contract_type VARCHAR(20) NOT NULL CHECK (contract_type IN ('rental', 'sale', 'management')),
    contract_number VARCHAR(50) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'pending_renewal')),
    
    -- Fechas
    start_date DATE NOT NULL,
    end_date DATE,
    signature_date DATE,
    
    -- Información Financiera
    monthly_rent DECIMAL(15,2),
    deposit_amount DECIMAL(15,2),
    administration_fee DECIMAL(15,2),
    sale_price DECIMAL(15,2),
    
    -- Términos del Contrato
    contract_duration_months INTEGER,
    renewal_type VARCHAR(20) DEFAULT 'manual' CHECK (renewal_type IN ('automatic', 'manual', 'none')),
    payment_day INTEGER DEFAULT 5 CHECK (payment_day >= 1 AND payment_day <= 31),
    late_fee_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Metadatos
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validaciones
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date > start_date),
    CONSTRAINT valid_landlord CHECK (
        (contract_type = 'rental' AND landlord_id IS NOT NULL) OR 
        (contract_type != 'rental')
    )
);

-- TABLA PAYMENTS
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Referencias
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Información del Pago
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('rent', 'deposit', 'administration', 'utilities', 'late_fee', 'other')),
    amount DECIMAL(15,2) NOT NULL,
    amount_paid DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial', 'cancelled')),
    
    -- Fechas
    due_date DATE NOT NULL,
    payment_date DATE,
    period_start DATE,
    period_end DATE,
    
    -- Detalles del Pago
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(255),
    late_fee_applied DECIMAL(15,2) DEFAULT 0.00,
    notes TEXT,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validaciones
    CONSTRAINT valid_amount CHECK (amount > 0),
    CONSTRAINT valid_amount_paid CHECK (amount_paid >= 0 AND amount_paid <= amount + late_fee_applied),
    CONSTRAINT valid_period CHECK (period_end IS NULL OR period_start IS NULL OR period_end >= period_start)
);

-- TABLA CLIENT_COMMUNICATIONS
CREATE TABLE client_communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Referencias
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    advisor_id UUID,
    
    -- Información de la Comunicación
    communication_type VARCHAR(20) NOT NULL CHECK (communication_type IN ('call', 'email', 'whatsapp', 'meeting', 'visit', 'sms', 'other')),
    subject VARCHAR(255),
    description TEXT,
    outcome VARCHAR(500),
    
    -- Estado y Seguimiento
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_answer')),
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    
    -- Timestamps
    communication_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA CLIENT_DOCUMENTS
CREATE TABLE client_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Referencias
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    
    -- Información del Documento
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Estado y Validez
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'replaced', 'invalid')),
    expiration_date DATE,
    is_required BOOLEAN DEFAULT FALSE,
    
    -- Metadatos
    uploaded_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA CLIENT_ALERTS
CREATE TABLE client_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Referencias
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    
    -- Información de la Alerta
    alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('payment_due', 'payment_overdue', 'contract_expiring', 'contract_expired', 'document_missing', 'document_expiring', 'follow_up', 'maintenance', 'renewal_required', 'other')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Estado y Fechas
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed', 'snoozed')),
    due_date DATE,
    resolved_date TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    
    -- Configuración de Notificaciones
    auto_generated BOOLEAN DEFAULT FALSE,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PARTE 3: CREAR ÍNDICES
-- =====================================================

-- Índices para CLIENTS
CREATE INDEX idx_clients_client_type ON clients(client_type);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_advisor ON clients(assigned_advisor_id);
CREATE INDEX idx_clients_document ON clients(document_type, document_number);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- Índices para CONTRACTS
CREATE INDEX idx_contracts_client_id ON contracts(client_id);
CREATE INDEX idx_contracts_property_id ON contracts(property_id);
CREATE INDEX idx_contracts_landlord_id ON contracts(landlord_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_type ON contracts(contract_type);
CREATE INDEX idx_contracts_dates ON contracts(start_date, end_date);
CREATE INDEX idx_contracts_payment_day ON contracts(payment_day);

-- Índices para PAYMENTS
CREATE INDEX idx_payments_contract_id ON payments(contract_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_type ON payments(payment_type);
CREATE INDEX idx_payments_overdue ON payments(due_date, status) WHERE status = 'overdue';

-- Índices para COMMUNICATIONS
CREATE INDEX idx_communications_client_id ON client_communications(client_id);
CREATE INDEX idx_communications_advisor_id ON client_communications(advisor_id);
CREATE INDEX idx_communications_type ON client_communications(communication_type);
CREATE INDEX idx_communications_date ON client_communications(communication_date);
CREATE INDEX idx_communications_follow_up ON client_communications(follow_up_required, follow_up_date);

-- Índices para DOCUMENTS
CREATE INDEX idx_documents_client_id ON client_documents(client_id);
CREATE INDEX idx_documents_contract_id ON client_documents(contract_id);
CREATE INDEX idx_documents_type ON client_documents(document_type);
CREATE INDEX idx_documents_status ON client_documents(status);
CREATE INDEX idx_documents_expiration ON client_documents(expiration_date) WHERE expiration_date IS NOT NULL;

-- Índices para ALERTS
CREATE INDEX idx_alerts_client_id ON client_alerts(client_id);
CREATE INDEX idx_alerts_contract_id ON client_alerts(contract_id);
CREATE INDEX idx_alerts_payment_id ON client_alerts(payment_id);
CREATE INDEX idx_alerts_type ON client_alerts(alert_type);
CREATE INDEX idx_alerts_status ON client_alerts(status);
CREATE INDEX idx_alerts_priority ON client_alerts(priority);
CREATE INDEX idx_alerts_due_date ON client_alerts(due_date);
CREATE INDEX idx_alerts_active ON client_alerts(status, due_date) WHERE status = 'active';

-- =====================================================
-- PARTE 4: CREAR FUNCIÓN PARA UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- PARTE 5: CREAR TRIGGERS PARA UPDATED_AT
-- =====================================================
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at 
    BEFORE UPDATE ON contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communications_updated_at 
    BEFORE UPDATE ON client_communications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON client_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at 
    BEFORE UPDATE ON client_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PARTE 6: CREAR FUNCIÓN PARA GENERAR PAGOS (CORREGIDA)
-- =====================================================
CREATE OR REPLACE FUNCTION generate_monthly_payments(
    p_contract_id UUID,
    p_months_ahead INTEGER DEFAULT 12
)
RETURNS INTEGER AS $$
DECLARE
    contract_record RECORD;
    v_payment_date DATE;
    v_period_start DATE;
    v_period_end DATE;
    i INTEGER;
    payments_created INTEGER := 0;
BEGIN
    -- Obtener información del contrato
    SELECT * INTO contract_record 
    FROM contracts 
    WHERE id = p_contract_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Generar pagos para los próximos meses
    FOR i IN 1..p_months_ahead LOOP
        -- Calcular fechas usando variables con prefijo v_
        v_period_start := DATE_TRUNC('month', CURRENT_DATE) + (i-1) * INTERVAL '1 month';
        v_period_end := v_period_start + INTERVAL '1 month' - INTERVAL '1 day';
        v_payment_date := DATE_TRUNC('month', v_period_start) + (contract_record.payment_day - 1) * INTERVAL '1 day';
        
        -- Verificar si ya existe el pago usando nombres de variables únicos
        IF NOT EXISTS (
            SELECT 1 FROM payments 
            WHERE contract_id = p_contract_id 
            AND payment_type = 'rent'
            AND period_start = v_period_start
        ) THEN
            -- Crear el pago
            INSERT INTO payments (
                contract_id,
                client_id,
                payment_type,
                amount,
                due_date,
                period_start,
                period_end
            ) VALUES (
                p_contract_id,
                contract_record.client_id,
                'rent',
                contract_record.monthly_rent,
                v_payment_date,
                v_period_start,
                v_period_end
            );
            
            payments_created := payments_created + 1;
        END IF;
    END LOOP;
    
    RETURN payments_created;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PARTE 7: CREAR FUNCIÓN PARA ALERTAS DE PAGOS VENCIDOS
-- =====================================================
CREATE OR REPLACE FUNCTION create_payment_overdue_alert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'overdue' AND (OLD IS NULL OR OLD.status != 'overdue') THEN
        INSERT INTO client_alerts (
            client_id,
            contract_id,
            payment_id,
            alert_type,
            title,
            description,
            priority,
            due_date,
            auto_generated
        ) VALUES (
            NEW.client_id,
            NEW.contract_id,
            NEW.id,
            'payment_overdue',
            'Pago Vencido - ' || NEW.payment_type,
            'El pago de $' || NEW.amount || ' venció el ' || NEW.due_date,
            'high',
            NEW.due_date,
            TRUE
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PARTE 8: CREAR TRIGGER PARA PAGOS VENCIDOS
-- =====================================================
CREATE TRIGGER trigger_payment_overdue_alert
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION create_payment_overdue_alert();

-- =====================================================
-- PARTE 9: CREAR FUNCIÓN PARA ALERTAS DE CONTRATOS
-- =====================================================
CREATE OR REPLACE FUNCTION create_contract_expiring_alert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_date IS NOT NULL AND NEW.status = 'active' THEN
        -- Crear alerta 60 días antes del vencimiento
        INSERT INTO client_alerts (
            client_id,
            contract_id,
            alert_type,
            title,
            description,
            priority,
            due_date,
            auto_generated
        ) VALUES (
            NEW.client_id,
            NEW.id,
            'contract_expiring',
            'Contrato por Vencer',
            'El contrato vence el ' || NEW.end_date || '. Considerar renovación.',
            'medium',
            NEW.end_date - INTERVAL '60 days',
            TRUE
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PARTE 10: CREAR TRIGGER PARA CONTRATOS POR VENCER
-- =====================================================
CREATE TRIGGER trigger_contract_expiring_alert
    AFTER INSERT ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION create_contract_expiring_alert();

-- =====================================================
-- PARTE 11: CREAR VISTAS ÚTILES
-- =====================================================

-- Vista de clientes con información resumida
CREATE VIEW clients_summary AS
SELECT 
    c.id,
    c.full_name,
    c.client_type,
    c.status,
    c.phone,
    c.email,
    c.assigned_advisor_id,
    COUNT(DISTINCT ct.id) as active_contracts,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'overdue') as overdue_payments,
    COUNT(DISTINCT al.id) FILTER (WHERE al.status = 'active') as active_alerts,
    c.created_at,
    c.updated_at
FROM clients c
LEFT JOIN contracts ct ON c.id = ct.client_id AND ct.status = 'active'
LEFT JOIN payments p ON c.id = p.client_id
LEFT JOIN client_alerts al ON c.id = al.client_id
GROUP BY c.id;

-- Vista de pagos próximos a vencer
CREATE VIEW upcoming_payments AS
SELECT 
    p.id,
    p.contract_id,
    p.client_id,
    c.full_name as client_name,
    p.payment_type,
    p.amount,
    p.due_date,
    p.status,
    (p.due_date - CURRENT_DATE) as days_until_due,
    ct.contract_number
FROM payments p
JOIN clients c ON p.client_id = c.id
JOIN contracts ct ON p.contract_id = ct.id
WHERE p.status IN ('pending', 'partial')
AND p.due_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY p.due_date;

-- =====================================================
-- PARTE 12: INSERTAR DATOS DE EJEMPLO
-- =====================================================

-- Cliente de ejemplo (Arrendatario)
INSERT INTO clients (
    full_name,
    document_type,
    document_number,
    phone,
    email,
    client_type,
    status,
    monthly_income,
    occupation,
    address,
    city
) VALUES (
    'Juan Diego Restrepo',
    'cedula',
    '123456789',
    '+57 300 123 4567',
    'juan.restrepo@email.com',
    'tenant',
    'active',
    5000000,
    'Ingeniero de Software',
    'Calle 123 #45-67',
    'Medellín'
);

-- Cliente de ejemplo (Arrendador)
INSERT INTO clients (
    full_name,
    document_type,
    document_number,
    phone,
    email,
    client_type,
    status,
    occupation,
    address,
    city
) VALUES (
    'María García López',
    'cedula',
    '987654321',
    '+57 310 987 6543',
    'maria.garcia@email.com',
    'landlord',
    'active',
    'Empresaria',
    'Carrera 80 #50-25',
    'Medellín'
);

-- Contrato de ejemplo
INSERT INTO contracts (
    client_id,
    landlord_id,
    contract_type,
    contract_number,
    status,
    start_date,
    end_date,
    monthly_rent,
    deposit_amount,
    contract_duration_months,
    payment_day
) VALUES (
    (SELECT id FROM clients WHERE document_number = '123456789'),
    (SELECT id FROM clients WHERE document_number = '987654321'),
    'rental',
    'CTR-2025-001',
    'active',
    '2025-01-01',
    '2025-12-31',
    1500000,
    1500000,
    12,
    5
);

-- =====================================================
-- PARTE 13: GENERAR PAGOS PARA EL CONTRATO DE EJEMPLO
-- =====================================================

-- Generar pagos automáticos para los próximos 12 meses
SELECT generate_monthly_payments(
    (SELECT id FROM contracts WHERE contract_number = 'CTR-2025-001'),
    12
) as payments_created;

-- =====================================================
-- PARTE 14: VERIFICAR LA INSTALACIÓN
-- =====================================================

-- Verificar que todas las tablas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('clients', 'contracts', 'payments', 'client_communications', 'client_documents', 'client_alerts')
ORDER BY tablename;

-- Verificar datos de ejemplo
SELECT 
    'Clientes' as tabla,
    COUNT(*) as registros
FROM clients
UNION ALL
SELECT 
    'Contratos' as tabla,
    COUNT(*) as registros
FROM contracts
UNION ALL
SELECT 
    'Pagos' as tabla,
    COUNT(*) as registros
FROM payments
UNION ALL
SELECT 
    'Comunicaciones' as tabla,
    COUNT(*) as registros
FROM client_communications
UNION ALL
SELECT 
    'Documentos' as tabla,
    COUNT(*) as registros
FROM client_documents
UNION ALL
SELECT 
    'Alertas' as tabla,
    COUNT(*) as registros
FROM client_alerts;

-- =====================================================
-- ¡SCRIPT COMPLETADO! 
-- 
-- Cambios realizados para evitar errores:
-- ✅ Reorganizado en partes lógicas
-- ✅ Variables renombradas con prefijo v_ en las funciones
-- ✅ Evitado conflicto de nombres entre variables y columnas
-- ✅ Funciones separadas de la creación de tablas
-- 
-- El sistema está listo para usar!
-- =====================================================
