-- =====================================================
-- CONFIGURACIÓN COMPLETA DEL PORTAL DE CLIENTES
-- =====================================================
-- Ejecutar este script completo en el SQL Editor de Supabase
-- Fecha: $(date)
-- Este script incluye todas las tablas, funciones y configuraciones necesarias

-- =====================================================
-- 1. TABLA DE CREDENCIALES PARA PORTAL DE CLIENTES
-- =====================================================

CREATE TABLE IF NOT EXISTS client_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencia al cliente
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE UNIQUE,

  -- Credenciales
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,

  -- Estado de la cuenta
  is_active BOOLEAN DEFAULT TRUE,
  must_change_password BOOLEAN DEFAULT TRUE,

  -- Seguridad
  last_login TIMESTAMP WITH TIME ZONE,
  last_password_change TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,

  -- Tokens de recuperación
  reset_token TEXT,
  reset_token_expires TIMESTAMP WITH TIME ZONE,

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES advisors(id),

  -- Constraints
  CONSTRAINT client_credentials_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_client_credentials_client_id ON client_credentials(client_id);
CREATE INDEX IF NOT EXISTS idx_client_credentials_email ON client_credentials(email);
CREATE INDEX IF NOT EXISTS idx_client_credentials_reset_token ON client_credentials(reset_token);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_client_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_client_credentials_updated_at ON client_credentials;
CREATE TRIGGER trigger_update_client_credentials_updated_at
    BEFORE UPDATE ON client_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_client_credentials_updated_at();

-- =====================================================
-- 2. EXTENDER TABLA DE PAGOS
-- =====================================================

-- Agregar columnas adicionales a la tabla payments si no existen
ALTER TABLE payments ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS period_start DATE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS period_end DATE;

-- Índices para payments
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =====================================================
-- 3. TABLAS ADICIONALES PARA PORTAL DE CLIENTES
-- =====================================================

-- Tabla de documentos del cliente
CREATE TABLE IF NOT EXISTS client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES advisors(id),
  is_public BOOLEAN DEFAULT FALSE
);

-- Tabla de relaciones cliente-propiedad
CREATE TABLE IF NOT EXISTS client_property_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id),
  status VARCHAR(50) DEFAULT 'active',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES advisors(id),
  UNIQUE(client_id, property_id, contract_id)
);

-- Tabla de alertas para clientes
CREATE TABLE IF NOT EXISTS client_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  alert_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'active',
  priority VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de comunicaciones con clientes
CREATE TABLE IF NOT EXISTS client_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  communication_type VARCHAR(50) NOT NULL, -- email, sms, notification
  subject VARCHAR(255),
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_by UUID REFERENCES advisors(id),
  status VARCHAR(50) DEFAULT 'sent',
  metadata JSONB
);

-- =====================================================
-- 4. POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas del cliente
ALTER TABLE client_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_property_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;

-- Políticas para client_credentials
CREATE POLICY "Clients can view their own credentials" ON client_credentials
  FOR SELECT USING (auth.uid() IN (
    SELECT client_id FROM client_credentials WHERE id = client_credentials.id
  ));

CREATE POLICY "Clients can update their own credentials" ON client_credentials
  FOR UPDATE USING (auth.uid() IN (
    SELECT client_id FROM client_credentials WHERE id = client_credentials.id
  ));

-- Políticas para client_documents
CREATE POLICY "Clients can view their own documents" ON client_documents
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Clients can insert their own documents" ON client_documents
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- Políticas para client_property_relations
CREATE POLICY "Clients can view their own property relations" ON client_property_relations
  FOR SELECT USING (client_id = auth.uid());

-- Políticas para client_alerts
CREATE POLICY "Clients can view their own alerts" ON client_alerts
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Clients can update their own alerts" ON client_alerts
  FOR UPDATE USING (client_id = auth.uid());

-- Políticas para client_communications
CREATE POLICY "Clients can view their own communications" ON client_communications
  FOR SELECT USING (client_id = auth.uid());

-- Políticas para advisors (acceso completo)
CREATE POLICY "Advisors have full access to client_credentials" ON client_credentials
  FOR ALL USING (auth.jwt() ->> 'role' = 'advisor');

CREATE POLICY "Advisors have full access to client_documents" ON client_documents
  FOR ALL USING (auth.jwt() ->> 'role' = 'advisor');

CREATE POLICY "Advisors have full access to client_property_relations" ON client_property_relations
  FOR ALL USING (auth.jwt() ->> 'role' = 'advisor');

CREATE POLICY "Advisors have full access to client_alerts" ON client_alerts
  FOR ALL USING (auth.jwt() ->> 'role' = 'advisor');

CREATE POLICY "Advisors have full access to client_communications" ON client_communications
  FOR ALL USING (auth.jwt() ->> 'role' = 'advisor');

-- =====================================================
-- 5. FUNCIONES PARA EXTRACTOS Y REPORTES
-- =====================================================

-- Función: Generar Extracto Mensual de Pagos
CREATE OR REPLACE FUNCTION generate_monthly_extract(
  p_client_id UUID,
  p_contract_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS TABLE(
  payment_id UUID,
  payment_date DATE,
  payment_type VARCHAR,
  description TEXT,
  amount NUMERIC,
  status VARCHAR,
  payment_method VARCHAR,
  transaction_reference VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.payment_date,
    p.payment_type,
    CASE
      WHEN p.payment_type = 'rent' THEN 'Arriendo ' || TO_CHAR(p.period_start, 'Month YYYY')
      WHEN p.payment_type = 'administration' THEN 'Administración ' || TO_CHAR(p.period_start, 'Month YYYY')
      WHEN p.payment_type = 'utilities' THEN 'Servicios Públicos'
      WHEN p.payment_type = 'deposit' THEN 'Depósito'
      ELSE p.notes
    END as description,
    p.amount,
    p.status,
    p.payment_method,
    p.transaction_reference
  FROM payments p
  WHERE p.client_id = p_client_id
    AND p.contract_id = p_contract_id
    AND EXTRACT(YEAR FROM p.due_date) = p_year
    AND EXTRACT(MONTH FROM p.due_date) = p_month
  ORDER BY p.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Generar Resumen Anual de Pagos
CREATE OR REPLACE FUNCTION generate_annual_summary(
  p_client_id UUID,
  p_contract_id UUID,
  p_year INTEGER
)
RETURNS TABLE(
  month INTEGER,
  month_name TEXT,
  total_due NUMERIC,
  total_paid NUMERIC,
  total_pending NUMERIC,
  payment_count INTEGER,
  paid_on_time_count INTEGER,
  late_payments_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(MONTH FROM p.due_date)::INTEGER as month,
    TO_CHAR(p.due_date, 'Month') as month_name,
    SUM(p.amount) as total_due,
    SUM(CASE WHEN p.status = 'paid' THEN p.amount_paid ELSE 0 END) as total_paid,
    SUM(CASE WHEN p.status IN ('pending', 'overdue') THEN p.amount ELSE 0 END) as total_pending,
    COUNT(*)::INTEGER as payment_count,
    COUNT(CASE WHEN p.status = 'paid' AND p.payment_date <= p.due_date THEN 1 END)::INTEGER as paid_on_time_count,
    COUNT(CASE WHEN p.status = 'paid' AND p.payment_date > p.due_date THEN 1 END)::INTEGER as late_payments_count
  FROM payments p
  WHERE p.client_id = p_client_id
    AND p.contract_id = p_contract_id
    AND EXTRACT(YEAR FROM p.due_date) = p_year
  GROUP BY EXTRACT(MONTH FROM p.due_date), TO_CHAR(p.due_date, 'Month')
  ORDER BY month ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Obtener Estado de Cuenta Actual
CREATE OR REPLACE FUNCTION get_account_status(
  p_client_id UUID,
  p_contract_id UUID
)
RETURNS TABLE(
  total_contract_value NUMERIC,
  total_paid NUMERIC,
  total_pending NUMERIC,
  total_overdue NUMERIC,
  next_payment_date DATE,
  next_payment_amount NUMERIC,
  last_payment_date DATE,
  last_payment_amount NUMERIC,
  payment_history_months INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Total del contrato (suma de todos los pagos programados)
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE contract_id = p_contract_id),

    -- Total pagado
    (SELECT COALESCE(SUM(amount_paid), 0) FROM payments WHERE contract_id = p_contract_id AND status = 'paid'),

    -- Total pendiente
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE contract_id = p_contract_id AND status = 'pending'),

    -- Total vencido
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE contract_id = p_contract_id AND status = 'overdue'),

    -- Próximo pago: fecha
    (SELECT MIN(due_date) FROM payments WHERE contract_id = p_contract_id AND status IN ('pending', 'overdue')),

    -- Próximo pago: monto
    (SELECT amount FROM payments WHERE contract_id = p_contract_id AND status IN ('pending', 'overdue') ORDER BY due_date LIMIT 1),

    -- Último pago: fecha
    (SELECT MAX(payment_date) FROM payments WHERE contract_id = p_contract_id AND status = 'paid'),

    -- Último pago: monto
    (SELECT amount_paid FROM payments WHERE contract_id = p_contract_id AND status = 'paid' ORDER BY payment_date DESC LIMIT 1),

    -- Meses con historial de pagos
    (SELECT COUNT(DISTINCT EXTRACT(YEAR FROM payment_date) || '-' || EXTRACT(MONTH FROM payment_date))
     FROM payments WHERE contract_id = p_contract_id AND status = 'paid')::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. CONFIGURACIÓN DE STORAGE BUCKETS
-- =====================================================

-- Crear bucket para documentos de clientes si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-documents', 'client-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para client-documents
CREATE POLICY "Clients can view their own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Clients can upload their own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Clients can update their own documents" ON storage.objects
  FOR UPDATE USING (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Clients can delete their own documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'client-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas para advisors (acceso completo)
CREATE POLICY "Advisors have full access to client documents" ON storage.objects
  FOR ALL USING (bucket_id = 'client-documents' AND auth.jwt() ->> 'role' = 'advisor');

-- =====================================================
-- 7. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas se crearon correctamente
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'client_credentials',
    'client_documents',
    'client_property_relations',
    'client_alerts',
    'client_communications'
  );

-- Verificar funciones creadas
SELECT
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'generate_monthly_extract',
    'generate_annual_summary',
    'get_account_status'
  );

-- Verificar buckets de storage
SELECT
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE id = 'client-documents';

-- =====================================================
-- CONFIGURACIÓN COMPLETADA ✅
-- =====================================================
-- El portal de clientes está listo para usar.
-- Las siguientes APIs deberían funcionar ahora:
-- - GET /api/client/payments
-- - GET /api/client/documents
-- - GET /api/client/profile
-- - POST /api/client/login