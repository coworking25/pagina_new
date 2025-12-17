-- =====================================================
-- INSERTAR CLIENTE PROPIETARIO COMPLETO - VERSION CORREGIDA
-- =====================================================
-- Script adaptado a la estructura real de las tablas

-- =====================================================
-- 1. INSERTAR CLIENTE BASE
-- =====================================================
INSERT INTO clients (
  id,
  full_name,
  email,
  phone,
  document_type,
  document_number,
  address,
  city,
  client_type,
  status,
  monthly_income,
  occupation,
  company_name,
  emergency_contact_name,
  emergency_contact_phone,
  assigned_advisor_id
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Carlos Propietario Test',
  'carlos.propietario@test.com',
  '+57 300 123 4567',
  'cedula',
  '9876543210',
  'Calle 100 #15-20, Apto 501',
  'Bogotá',
  'landlord',
  'active',
  8500000,
  'Empresario',
  'Inversiones Test SAS',
  'María Test',
  '+57 300 987 6543',
  '438f9a53-1475-43fc-81e4-2d6ffc83270c'::uuid
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = NOW();

-- =====================================================
-- 2. CREDENCIALES DEL PORTAL
-- =====================================================
INSERT INTO client_portal_credentials (
  id,
  client_id,
  email,
  password_hash,
  portal_access_enabled,
  must_change_password,
  failed_login_attempts,
  welcome_email_sent
) VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'carlos.propietario@test.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Test123456!
  true,
  false,
  0,
  true
) ON CONFLICT (client_id) DO UPDATE SET
  email = EXCLUDED.email,
  portal_access_enabled = EXCLUDED.portal_access_enabled,
  updated_at = NOW();

-- =====================================================
-- 3. INFORMACIÓN DE CONTRATO (client_contract_info)
-- =====================================================
INSERT INTO client_contract_info (
  id,
  client_id,
  start_date,
  end_date,
  contract_type,
  contract_duration_months,
  deposit_amount,
  deposit_paid,
  deposit_payment_date,
  guarantor_required,
  guarantor_name,
  guarantor_phone,
  guarantor_document_type,
  guarantor_document_number,
  keys_delivered,
  keys_quantity,
  keys_delivery_date,
  contract_signed_by_client,
  contract_signed_date_client,
  notes
) VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  '2024-02-01',
  '2026-01-31',
  'landlord_management',
  24,
  2500000,
  true,
  '2024-01-20',
  false,
  NULL,
  NULL,
  NULL,
  NULL,
  true,
  2,
  '2024-02-01',
  true,
  '2024-01-15',
  'Contrato de administración de propiedad para propietario'
) ON CONFLICT (client_id) DO UPDATE SET
  start_date = EXCLUDED.start_date,
  updated_at = NOW();

-- =====================================================
-- 4. CONFIGURACIÓN DE PAGOS
-- =====================================================
INSERT INTO client_payment_config (
  id,
  client_id,
  preferred_payment_method,
  bank_name,
  account_type,
  account_number,
  billing_day,
  payment_due_days,
  payment_concepts,
  send_payment_reminders,
  reminder_days_before,
  send_overdue_alerts,
  late_fee_percentage
) VALUES (
  '44444444-4444-4444-4444-444444444444'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'transferencia',
  'Bancolombia',
  'ahorros',
  '1234567890',
  5,
  5,
  '{"administracion": {"amount": 2500000, "enabled": true}}'::jsonb,
  true,
  3,
  true,
  5
) ON CONFLICT (client_id) DO UPDATE SET
  preferred_payment_method = EXCLUDED.preferred_payment_method,
  updated_at = NOW();

-- =====================================================
-- 5. REFERENCIAS
-- =====================================================
INSERT INTO client_references (
  id,
  client_id,
  reference_type,
  name,
  phone,
  email,
  relationship,
  company_name,
  position,
  years_known,
  verified,
  comments
) VALUES 
(
  '55555555-5555-5555-5555-555555555555'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'personal',
  'Juan Pérez Referencia',
  '+57 310 111 2222',
  'juan.perez@test.com',
  'Socio Comercial',
  'Inversiones JP SAS',
  'Gerente General',
  8,
  true,
  'Socio de negocios por 8 años, excelente relación comercial'
),
(
  '66666666-6666-6666-6666-666666666666'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'financial',
  'Banco Empresarial',
  '+57 601 555 8888',
  'atencion@bancoempresarial.com',
  'Institución Financiera',
  'Banco Empresarial',
  'N/A',
  5,
  true,
  'Cliente preferencial con historial crediticio excelente'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. DOCUMENTOS
-- =====================================================
INSERT INTO client_documents (
  id,
  client_id,
  document_type,
  document_name,
  file_path,
  file_size,
  mime_type,
  status,
  uploaded_by,
  notes
) VALUES 
(
  '77777777-7777-7777-7777-777777777777'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'cedula',
  'Cédula Carlos Propietario',
  '/documents/clients/cedula_carlos.pdf',
  245678,
  'application/pdf',
  'active',
  '438f9a53-1475-43fc-81e4-2d6ffc83270c'::uuid,
  'Cédula escaneada ambos lados'
),
(
  '88888888-8888-8888-8888-888888888888'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'contrato',
  'Contrato Administración',
  '/documents/clients/contrato_admin.pdf',
  589234,
  'application/pdf',
  'active',
  '438f9a53-1475-43fc-81e4-2d6ffc83270c'::uuid,
  'Contrato de administración firmado'
),
(
  '99999999-9999-9999-9999-999999999999'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'certificado_bancario',
  'Certificado Bancario',
  '/documents/clients/cert_bancario.pdf',
  123456,
  'application/pdf',
  'active',
  '438f9a53-1475-43fc-81e4-2d6ffc83270c'::uuid,
  'Certificado bancario de los últimos 6 meses'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. PAGOS REALIZADOS
-- =====================================================
CREATE TABLE IF NOT EXISTS client_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'completed',
  reference_number VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_payments_client_id ON client_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_date ON client_payments(payment_date);

INSERT INTO client_payments (id, client_id, payment_date, amount, payment_method, payment_status, reference_number, description, created_at) VALUES
('a1111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2024-11-05', 2500000, 'transfer', 'completed', 'TRF-2024-11-001', 'Pago administración - Noviembre 2024', '2024-11-05 10:30:00'),
('a2222222-2222-2222-2222-222222222222'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2024-12-05', 2500000, 'transfer', 'completed', 'TRF-2024-12-001', 'Pago administración - Diciembre 2024', '2024-12-05 09:15:00'),
('a3333333-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-01-05', 2500000, 'transfer', 'completed', 'TRF-2025-01-001', 'Pago administración - Enero 2025', '2025-01-05 11:20:00'),
('a4444444-4444-4444-4444-444444444444'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-02-05', 2500000, 'transfer', 'completed', 'TRF-2025-02-001', 'Pago administración - Febrero 2025', '2025-02-05 14:45:00'),
('a5555555-5555-5555-5555-555555555555'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-03-05', 2500000, 'transfer', 'completed', 'TRF-2025-03-001', 'Pago administración - Marzo 2025', '2025-03-05 10:00:00'),
('a6666666-6666-6666-6666-666666666666'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-04-05', 2500000, 'transfer', 'completed', 'TRF-2025-04-001', 'Pago administración - Abril 2025', '2025-04-05 09:30:00'),
('a7777777-7777-7777-7777-777777777777'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-05-05', 2500000, 'transfer', 'completed', 'TRF-2025-05-001', 'Pago administración - Mayo 2025', '2025-05-05 11:00:00'),
('a8888888-8888-8888-8888-888888888888'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-06-05', 2500000, 'transfer', 'completed', 'TRF-2025-06-001', 'Pago administración - Junio 2025', '2025-06-05 10:15:00'),
('a9999999-9999-9999-9999-999999999999'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-07-05', 2500000, 'transfer', 'completed', 'TRF-2025-07-001', 'Pago administración - Julio 2025', '2025-07-05 09:45:00'),
('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-08-05', 2500000, 'transfer', 'completed', 'TRF-2025-08-001', 'Pago administración - Agosto 2025', '2025-08-05 14:20:00'),
('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-09-05', 2500000, 'transfer', 'completed', 'TRF-2025-09-001', 'Pago administración - Septiembre 2025', '2025-09-05 10:30:00'),
('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-10-05', 2500000, 'transfer', 'completed', 'TRF-2025-10-001', 'Pago administración - Octubre 2025', '2025-10-05 11:15:00'),
('aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-11-05', 2500000, 'transfer', 'completed', 'TRF-2025-11-001', 'Pago administración - Noviembre 2025', '2025-11-05 09:00:00'),
('aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-12-05', 2500000, 'transfer', 'completed', 'TRF-2025-12-001', 'Pago administración - Diciembre 2025', '2025-12-05 10:00:00')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8. VERIFICACIÓN
-- =====================================================
SELECT 
  '✅ CLIENTE CREADO' as status,
  c.full_name,
  c.email,
  c.client_type,
  cpc.email as portal_email,
  cpc.portal_access_enabled
FROM clients c
LEFT JOIN client_portal_credentials cpc ON c.id = cpc.client_id
WHERE c.id = '11111111-1111-1111-1111-111111111111';

SELECT 
  '✅ PAGOS REGISTRADOS' as status,
  COUNT(*) as total_pagos,
  SUM(amount) as total_pagado
FROM client_payments
WHERE client_id = '11111111-1111-1111-1111-111111111111';

SELECT 
  '✅ DOCUMENTOS' as status,
  COUNT(*) as total_documentos
FROM client_documents
WHERE client_id = '11111111-1111-1111-1111-111111111111';

-- =====================================================
-- CREDENCIALES
-- =====================================================
/*
🔐 CREDENCIALES DEL PORTAL:

Email: carlos.propietario@test.com
Contraseña: Test123456!

Cliente: Carlos Propietario Test
Tipo: Propietario (landlord)
Estado: Activo

📊 DATOS:
- 1 Cliente propietario
- Credenciales activas
- Contrato de administración (2024-2026)
- Configuración de pagos
- 2 Referencias verificadas
- 3 Documentos aprobados
- 14 Pagos (Nov 2024 - Dic 2025)

Los pagos aparecerán en el calendario del portal del cliente.
*/
