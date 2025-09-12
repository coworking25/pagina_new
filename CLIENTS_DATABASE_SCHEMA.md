# ESQUEMA DE BASE DE DATOS - SISTEMA DE CLIENTES

## 🏢 TABLA PRINCIPAL: clients

```sql
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Información Personal
  full_name character varying(255) NOT NULL,
  document_type character varying(20) NOT NULL, -- 'cedula', 'pasaporte', 'nit'
  document_number character varying(50) NOT NULL UNIQUE,
  phone character varying(50) NOT NULL,
  email character varying(255),
  address text,
  city character varying(100),
  emergency_contact_name character varying(255),
  emergency_contact_phone character varying(50),
  
  -- Tipo de Cliente
  client_type character varying(20) NOT NULL, -- 'tenant', 'landlord', 'buyer', 'seller'
  status character varying(20) DEFAULT 'active', -- 'active', 'inactive', 'pending', 'blocked'
  
  -- Información Financiera
  monthly_income numeric(15,2),
  occupation character varying(255),
  company_name character varying(255),
  
  -- Metadata
  source character varying(100) DEFAULT 'manual', -- 'manual', 'inquiry', 'referral'
  assigned_advisor_id uuid REFERENCES advisors(id),
  notes text,
  
  -- Índices y restricciones
  CONSTRAINT clients_document_type_check CHECK (document_type IN ('cedula', 'pasaporte', 'nit')),
  CONSTRAINT clients_client_type_check CHECK (client_type IN ('tenant', 'landlord', 'buyer', 'seller')),
  CONSTRAINT clients_status_check CHECK (status IN ('active', 'inactive', 'pending', 'blocked'))
);

-- Índices
CREATE INDEX idx_clients_document ON clients(document_type, document_number);
CREATE INDEX idx_clients_type ON clients(client_type);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_advisor ON clients(assigned_advisor_id);
```

## 🏠 TABLA: contracts

```sql
CREATE TABLE public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Referencias
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id),
  landlord_id uuid REFERENCES clients(id), -- Si el cliente es tenant, aquí va el landlord
  advisor_id uuid REFERENCES advisors(id),
  
  -- Información del Contrato
  contract_type character varying(20) NOT NULL, -- 'rental', 'sale', 'management'
  contract_number character varying(100) UNIQUE,
  status character varying(20) DEFAULT 'active', -- 'active', 'expired', 'terminated', 'pending'
  
  -- Fechas
  start_date date NOT NULL,
  end_date date,
  signature_date date,
  
  -- Información Financiera
  monthly_rent numeric(15,2),
  deposit_amount numeric(15,2),
  administration_fee numeric(15,2),
  sale_price numeric(15,2),
  
  -- Términos del Contrato
  contract_duration_months integer,
  renewal_type character varying(20), -- 'automatic', 'manual', 'none'
  payment_day integer DEFAULT 5, -- Día del mes para pago
  late_fee_percentage numeric(5,2) DEFAULT 0.05,
  
  -- Documentos
  contract_file_url text,
  signed_contract_url text,
  
  -- Metadata
  notes text,
  
  CONSTRAINT contracts_type_check CHECK (contract_type IN ('rental', 'sale', 'management')),
  CONSTRAINT contracts_status_check CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
  CONSTRAINT contracts_payment_day_check CHECK (payment_day BETWEEN 1 AND 31)
);

-- Índices
CREATE INDEX idx_contracts_client ON contracts(client_id);
CREATE INDEX idx_contracts_property ON contracts(property_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_dates ON contracts(start_date, end_date);
```

## 💰 TABLA: payments

```sql
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Referencias
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id),
  
  -- Información del Pago
  payment_type character varying(20) NOT NULL, -- 'rent', 'deposit', 'administration', 'utilities', 'late_fee'
  amount numeric(15,2) NOT NULL,
  due_date date NOT NULL,
  payment_date date,
  
  -- Estado del Pago
  status character varying(20) DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'partial'
  payment_method character varying(20), -- 'transfer', 'cash', 'check', 'card'
  
  -- Información Adicional
  period_start date, -- Para pagos mensuales
  period_end date,
  late_fee_amount numeric(15,2) DEFAULT 0,
  reference_number character varying(100),
  receipt_url text,
  
  -- Metadata
  notes text,
  processed_by uuid REFERENCES advisors(id),
  
  CONSTRAINT payments_type_check CHECK (payment_type IN ('rent', 'deposit', 'administration', 'utilities', 'late_fee')),
  CONSTRAINT payments_status_check CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
  CONSTRAINT payments_amount_positive CHECK (amount > 0)
);

-- Índices
CREATE INDEX idx_payments_contract ON payments(contract_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_period ON payments(period_start, period_end);
```

## 📞 TABLA: client_communications

```sql
CREATE TABLE public.client_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  
  -- Referencias
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  advisor_id uuid REFERENCES advisors(id),
  
  -- Información de la Comunicación
  communication_type character varying(20) NOT NULL, -- 'call', 'email', 'whatsapp', 'meeting', 'visit'
  subject character varying(255),
  content text NOT NULL,
  
  -- Estado y Seguimiento
  status character varying(20) DEFAULT 'completed', -- 'completed', 'pending', 'follow_up'
  priority character varying(10) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Fechas
  communication_date timestamp with time zone DEFAULT now(),
  follow_up_date date,
  
  -- Archivos Adjuntos
  attachments jsonb DEFAULT '[]',
  
  CONSTRAINT comm_type_check CHECK (communication_type IN ('call', 'email', 'whatsapp', 'meeting', 'visit')),
  CONSTRAINT comm_status_check CHECK (status IN ('completed', 'pending', 'follow_up')),
  CONSTRAINT comm_priority_check CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Índices
CREATE INDEX idx_communications_client ON client_communications(client_id);
CREATE INDEX idx_communications_date ON client_communications(communication_date);
CREATE INDEX idx_communications_status ON client_communications(status);
```

## 📋 TABLA: client_documents

```sql
CREATE TABLE public.client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Referencias
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  contract_id uuid REFERENCES contracts(id),
  uploaded_by uuid REFERENCES advisors(id),
  
  -- Información del Documento
  document_type character varying(50) NOT NULL, -- 'cedula', 'income_proof', 'contract', 'receipt', 'reference'
  document_name character varying(255) NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  mime_type character varying(100),
  
  -- Metadata
  description text,
  expiration_date date,
  is_verified boolean DEFAULT false,
  verification_notes text,
  
  CONSTRAINT documents_size_check CHECK (file_size > 0)
);

-- Índices
CREATE INDEX idx_client_documents_client ON client_documents(client_id);
CREATE INDEX idx_client_documents_type ON client_documents(document_type);
CREATE INDEX idx_client_documents_contract ON client_documents(contract_id);
```

## 🔔 TABLA: client_alerts

```sql
CREATE TABLE public.client_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  
  -- Referencias
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  contract_id uuid REFERENCES contracts(id),
  created_by uuid REFERENCES advisors(id),
  
  -- Información de la Alerta
  alert_type character varying(30) NOT NULL, -- 'payment_due', 'contract_expiring', 'document_missing', 'follow_up', 'maintenance'
  title character varying(255) NOT NULL,
  description text,
  
  -- Estado y Prioridad
  status character varying(20) DEFAULT 'active', -- 'active', 'resolved', 'dismissed'
  priority character varying(10) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Fechas
  due_date date,
  resolved_at timestamp with time zone,
  resolved_by uuid REFERENCES advisors(id),
  
  CONSTRAINT alerts_type_check CHECK (alert_type IN ('payment_due', 'contract_expiring', 'document_missing', 'follow_up', 'maintenance')),
  CONSTRAINT alerts_status_check CHECK (status IN ('active', 'resolved', 'dismissed')),
  CONSTRAINT alerts_priority_check CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Índices
CREATE INDEX idx_client_alerts_client ON client_alerts(client_id);
CREATE INDEX idx_client_alerts_status ON client_alerts(status);
CREATE INDEX idx_client_alerts_due_date ON client_alerts(due_date);
```

## ⚙️ TRIGGERS PARA UPDATED_AT

```sql
-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_documents_updated_at BEFORE UPDATE ON client_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🔒 ROW LEVEL SECURITY (Opcional)

```sql
-- Habilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidades)
CREATE POLICY "Allow all for authenticated users" ON clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON contracts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON payments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON client_communications FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON client_documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON client_alerts FOR ALL TO authenticated USING (true);
```
