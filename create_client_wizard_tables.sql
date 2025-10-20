-- ============================================
-- TABLAS PARA FORMULARIO WIZARD NUEVO CLIENTE
-- ============================================

-- 1. Tabla de credenciales del portal del cliente
CREATE TABLE IF NOT EXISTS client_portal_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN DEFAULT true,
  portal_access_enabled BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  welcome_email_sent BOOLEAN DEFAULT false,
  welcome_email_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para credenciales
CREATE INDEX IF NOT EXISTS idx_portal_credentials_client_id ON client_portal_credentials(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_credentials_email ON client_portal_credentials(email);

-- 2. Tabla de documentos del cliente
CREATE TABLE IF NOT EXISTS client_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'cedula_frente', 'cedula_reverso', 'contrato_firmado', etc.
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by UUID,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP,
  notes TEXT,
  expiration_date DATE, -- Para documentos que expiran
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para documentos
CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_type ON client_documents(document_type);

-- 3. Tabla de configuración de pagos del cliente
CREATE TABLE IF NOT EXISTS client_payment_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Método de pago preferido
  preferred_payment_method VARCHAR(50) DEFAULT 'transferencia', -- 'transferencia', 'efectivo', 'tarjeta', 'cheque'
  
  -- Información bancaria
  bank_name VARCHAR(100),
  account_type VARCHAR(20), -- 'ahorros', 'corriente'
  account_number VARCHAR(50),
  
  -- Ciclo de facturación
  billing_day INTEGER DEFAULT 1 CHECK (billing_day >= 1 AND billing_day <= 31),
  payment_due_days INTEGER DEFAULT 5,
  
  -- Conceptos de pago (JSONB para flexibilidad)
  payment_concepts JSONB DEFAULT '{
    "arriendo": {"enabled": false, "amount": 0},
    "administracion": {"enabled": false, "amount": 0},
    "servicios_publicos": {"enabled": false, "types": [], "amount": 0},
    "otros": {"enabled": false, "description": "", "amount": 0}
  }'::jsonb,
  
  -- Alertas y recordatorios
  send_payment_reminders BOOLEAN DEFAULT true,
  reminder_days_before INTEGER DEFAULT 3,
  send_overdue_alerts BOOLEAN DEFAULT true,
  
  -- Descuentos y recargos
  has_discount BOOLEAN DEFAULT false,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_reason TEXT,
  late_fee_percentage DECIMAL(5,2) DEFAULT 5,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para config de pagos
CREATE INDEX IF NOT EXISTS idx_payment_config_client_id ON client_payment_config(client_id);

-- 4. Tabla de referencias del cliente (personales y comerciales)
CREATE TABLE IF NOT EXISTS client_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  reference_type VARCHAR(20) NOT NULL, -- 'personal', 'commercial'
  
  -- Información de contacto
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  
  -- Detalles de la referencia
  relationship VARCHAR(100), -- Para personal: 'amigo', 'familiar', 'compañero'
  company_name VARCHAR(255), -- Para comercial
  position VARCHAR(100), -- Para comercial
  years_known INTEGER,
  
  -- Verificación
  verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP,
  verification_notes TEXT,
  
  -- Calificación
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para referencias
CREATE INDEX IF NOT EXISTS idx_client_references_client_id ON client_references(client_id);
CREATE INDEX IF NOT EXISTS idx_client_references_type ON client_references(reference_type);

-- 5. Tabla de información de contrato (extendida)
CREATE TABLE IF NOT EXISTS client_contract_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Depósito y garantías
  deposit_amount DECIMAL(15,2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT false,
  deposit_payment_date DATE,
  deposit_receipt_url TEXT,
  deposit_refund_date DATE,
  deposit_refund_amount DECIMAL(15,2),
  
  -- Fiador/Garante
  guarantor_required BOOLEAN DEFAULT false,
  guarantor_name VARCHAR(255),
  guarantor_document_type VARCHAR(20),
  guarantor_document_number VARCHAR(50),
  guarantor_phone VARCHAR(50),
  guarantor_email VARCHAR(255),
  guarantor_address TEXT,
  guarantor_documents_url TEXT,
  
  -- Inventario
  inventory_checklist_completed BOOLEAN DEFAULT false,
  inventory_checklist_url TEXT,
  inventory_completion_date DATE,
  
  -- Llaves y accesos
  keys_delivered BOOLEAN DEFAULT false,
  keys_quantity INTEGER DEFAULT 0,
  keys_delivery_date DATE,
  access_cards_delivered BOOLEAN DEFAULT false,
  access_card_numbers TEXT[], -- Array de números de tarjetas
  
  -- Firma digital
  contract_signed_by_client BOOLEAN DEFAULT false,
  contract_signed_date_client DATE,
  contract_signature_url_client TEXT,
  
  contract_signed_by_landlord BOOLEAN DEFAULT false,
  contract_signed_date_landlord DATE,
  contract_signature_url_landlord TEXT,
  
  witness_name VARCHAR(255),
  witness_document VARCHAR(50),
  witness_signature_url TEXT,
  
  -- Aceptación de términos
  rules_and_regulations_accepted BOOLEAN DEFAULT false,
  rules_acceptance_date DATE,
  rules_signature_url TEXT,
  
  -- Onboarding
  welcome_package_sent BOOLEAN DEFAULT false,
  welcome_package_date DATE,
  orientation_scheduled BOOLEAN DEFAULT false,
  orientation_date TIMESTAMP,
  orientation_completed BOOLEAN DEFAULT false,
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para contract info
CREATE INDEX IF NOT EXISTS idx_contract_info_client_id ON client_contract_info(client_id);

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_client_portal_credentials_updated_at ON client_portal_credentials;
CREATE TRIGGER update_client_portal_credentials_updated_at
    BEFORE UPDATE ON client_portal_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_payment_config_updated_at ON client_payment_config;
CREATE TRIGGER update_client_payment_config_updated_at
    BEFORE UPDATE ON client_payment_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_references_updated_at ON client_references;
CREATE TRIGGER update_client_references_updated_at
    BEFORE UPDATE ON client_references
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_contract_info_updated_at ON client_contract_info;
CREATE TRIGGER update_client_contract_info_updated_at
    BEFORE UPDATE ON client_contract_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE client_portal_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_payment_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contract_info ENABLE ROW LEVEL SECURITY;

-- Políticas para admin (servicio)
CREATE POLICY "Service role can do everything on portal_credentials"
  ON client_portal_credentials FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on client_documents"
  ON client_documents FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on payment_config"
  ON client_payment_config FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on references"
  ON client_references FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on contract_info"
  ON client_contract_info FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE client_portal_credentials IS 'Credenciales de acceso al portal del cliente';
COMMENT ON TABLE client_documents IS 'Documentos subidos por/para el cliente (cédula, contrato, etc.)';
COMMENT ON TABLE client_payment_config IS 'Configuración de pagos y facturación del cliente';
COMMENT ON TABLE client_references IS 'Referencias personales y comerciales del cliente';
COMMENT ON TABLE client_contract_info IS 'Información extendida del contrato, depósito, fiador, onboarding';

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL - COMENTADO)
-- ============================================

/*
-- Ejemplo de payment_concepts JSONB:
{
  "arriendo": {
    "enabled": true,
    "amount": 1500000
  },
  "administracion": {
    "enabled": true,
    "amount": 150000
  },
  "servicios_publicos": {
    "enabled": true,
    "types": ["agua", "luz", "internet"],
    "amount": 200000
  },
  "otros": {
    "enabled": false,
    "description": "",
    "amount": 0
  }
}
*/

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

SELECT 'Tablas para Wizard de Cliente creadas exitosamente! ✅' AS resultado;
