-- ===================================================================
-- CREAR TABLA: client_contract_info (si no existe)
-- ===================================================================
-- Fecha: 20 de Octubre, 2025
-- Propósito: Almacenar información de contratos de clientes

-- 1. Verificar si la tabla existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'client_contract_info'
) as table_exists;

-- 2. Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS client_contract_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Información del contrato
  contract_type TEXT,
  start_date DATE,
  end_date DATE,
  duration_months INTEGER,
  
  -- Información del depósito
  deposit_amount DECIMAL(10, 2),
  deposit_paid BOOLEAN DEFAULT false,
  
  -- Información del aval/garante
  guarantor_required BOOLEAN DEFAULT false,
  guarantor_name TEXT,
  guarantor_document TEXT,
  guarantor_phone TEXT,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: un cliente solo puede tener un registro de contrato activo
  UNIQUE(client_id)
);

-- 3. Crear índices
CREATE INDEX IF NOT EXISTS idx_client_contract_info_client_id 
  ON client_contract_info(client_id);

CREATE INDEX IF NOT EXISTS idx_client_contract_info_start_date 
  ON client_contract_info(start_date);

-- 4. Habilitar RLS
ALTER TABLE client_contract_info ENABLE ROW LEVEL SECURITY;

-- 5. Crear política RLS para admins
DROP POLICY IF EXISTS "Admins have full access to contract info" ON client_contract_info;

CREATE POLICY "Admins have full access to contract info" 
ON client_contract_info
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- 6. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_client_contract_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger
DROP TRIGGER IF EXISTS trigger_update_client_contract_info_updated_at ON client_contract_info;

CREATE TRIGGER trigger_update_client_contract_info_updated_at
  BEFORE UPDATE ON client_contract_info
  FOR EACH ROW
  EXECUTE FUNCTION update_client_contract_info_updated_at();

-- 8. Verificar estructura de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_contract_info'
ORDER BY ordinal_position;

-- 9. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ WITH CHECK OK'
    ELSE '⚠️ FALTA WITH CHECK'
  END as status
FROM pg_policies 
WHERE tablename = 'client_contract_info';

-- ===================================================================
-- CREAR TABLAS ADICIONALES SI FALTAN
-- ===================================================================

-- Tabla: client_references
CREATE TABLE IF NOT EXISTS client_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Tipo de referencia
  reference_type TEXT NOT NULL CHECK (reference_type IN ('personal', 'commercial')),
  
  -- Información de la referencia
  name TEXT NOT NULL,
  phone TEXT,
  relationship TEXT,
  email TEXT,
  company TEXT,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_references_client_id 
  ON client_references(client_id);

ALTER TABLE client_references ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to references" ON client_references;

CREATE POLICY "Admins have full access to references" 
ON client_references
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- Tabla: client_payment_config
CREATE TABLE IF NOT EXISTS client_payment_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Configuración de pagos
  preferred_payment_method TEXT,
  billing_day INTEGER CHECK (billing_day BETWEEN 1 AND 31),
  payment_concepts JSONB DEFAULT '[]'::jsonb,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(client_id)
);

CREATE INDEX IF NOT EXISTS idx_client_payment_config_client_id 
  ON client_payment_config(client_id);

ALTER TABLE client_payment_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to payment configs" ON client_payment_config;

CREATE POLICY "Admins have full access to payment configs" 
ON client_payment_config
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- Tabla: client_documents
CREATE TABLE IF NOT EXISTS client_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Información del documento
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Metadatos
  uploaded_by UUID REFERENCES advisors(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_documents_client_id 
  ON client_documents(client_id);

ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to documents" ON client_documents;

CREATE POLICY "Admins have full access to documents" 
ON client_documents
FOR ALL
USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- ===================================================================
-- VERIFICACIÓN FINAL
-- ===================================================================

-- Listar todas las tablas de clientes
SELECT 
  table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = table_name 
      AND with_check IS NOT NULL
    ) THEN '✅ RLS OK'
    ELSE '⚠️ RLS INCOMPLETO'
  END as rls_status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'client%'
ORDER BY table_name;

-- ===================================================================
-- RESULTADO ESPERADO
-- ===================================================================

/*
Después de ejecutar este script:

✅ client_contract_info - creada con RLS
✅ client_references - creada con RLS
✅ client_payment_config - creada con RLS
✅ client_documents - creada con RLS

Todas las tablas tendrán:
- Estructura correcta
- Índices para performance
- Políticas RLS con WITH CHECK
- Triggers para updated_at

El Wizard ahora podrá guardar toda la información sin errores 406.
*/
