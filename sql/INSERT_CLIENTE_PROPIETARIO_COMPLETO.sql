-- =====================================================
-- INSERTAR CLIENTE PROPIETARIO COMPLETO PARA PRUEBAS
-- =====================================================
-- Este script crea un cliente propietario con todos los datos
-- incluyendo credenciales de portal, pagos realizados y documentos

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
  assigned_advisor_id,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Carlos Propietario Test',
  'carlos.propietario@test.com',
  '+57 300 123 4567',
  'cedula',
  '9876543210',
  'Calle 100 #15-20, Apto 501',
  'Bogotá',
  'landlord', -- ✅ PROPIETARIO
  'active',
  8500000,
  'Empresario',
  'Inversiones Test SAS',
  'María Test',
  '+57 300 987 6543',
  '438f9a53-1475-43fc-81e4-2d6ffc83270c'::uuid, -- Santiago Sánchez
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
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
  last_login,
  failed_login_attempts,
  welcome_email_sent,
  welcome_email_sent_at,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'carlos.propietario@test.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Password: Test123456!
  true,
  false,
  NOW() - INTERVAL '2 days',
  0,
  true,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days',
  NOW()
) ON CONFLICT (client_id) DO UPDATE SET
  email = EXCLUDED.email,
  portal_access_enabled = EXCLUDED.portal_access_enabled,
  last_login = EXCLUDED.last_login,
  updated_at = NOW();

-- =====================================================
-- 3. INFORMACIÓN DE CONTRATO
-- =====================================================
INSERT INTO client_contract_info (
  id,
  client_id,
  contract_type,
  contract_date,
  contract_start_date,
  contract_end_date,
  property_address,
  monthly_payment_amount,
  payment_day,
  payment_method,
  bank_account,
  bank_name,
  account_holder,
  special_clauses,
  guarantor_name,
  guarantor_phone,
  guarantor_document,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'owner_agreement', -- Acuerdo de administración para propietario
  '2024-01-15',
  '2024-02-01',
  '2026-01-31',
  'Calle 100 #15-20, Apto 501, Bogotá',
  2500000, -- Pago mensual de administración
  5, -- Día 5 de cada mes
  'transfer',
  '1234567890',
  'Bancolombia',
  'Carlos Propietario Test',
  'Administración incluye: gestión de inquilinos, mantenimiento preventivo, reportes mensuales.',
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '30 days',
  NOW()
) ON CONFLICT (client_id) DO UPDATE SET
  contract_type = EXCLUDED.contract_type,
  monthly_payment_amount = EXCLUDED.monthly_payment_amount,
  updated_at = NOW();

-- =====================================================
-- 4. CONFIGURACIÓN DE PAGOS
-- =====================================================
INSERT INTO client_payment_config (
  id,
  client_id,
  payment_frequency,
  payment_amount,
  payment_day,
  payment_method,
  auto_generate_invoices,
  send_payment_reminders,
  reminder_days_before,
  late_payment_fee,
  grace_period_days,
  created_at,
  updated_at
) VALUES (
  '44444444-4444-4444-4444-444444444444'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'monthly',
  2500000,
  5,
  'transfer',
  true,
  true,
  3, -- Recordatorio 3 días antes
  150000, -- Multa por mora
  5, -- 5 días de gracia
  NOW() - INTERVAL '30 days',
  NOW()
) ON CONFLICT (client_id) DO UPDATE SET
  payment_amount = EXCLUDED.payment_amount,
  updated_at = NOW();

-- =====================================================
-- 5. REFERENCIAS PERSONALES
-- =====================================================
INSERT INTO client_references (
  id,
  client_id,
  reference_type,
  name,
  phone,
  relationship,
  email,
  address,
  years_known,
  notes,
  created_at
) VALUES 
(
  '55555555-5555-5555-5555-555555555555'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'personal',
  'Juan Pérez Referencia',
  '+57 310 111 2222',
  'Socio Comercial',
  'juan.perez@test.com',
  'Carrera 7 #80-50, Bogotá',
  8,
  'Socio de negocios por 8 años',
  NOW() - INTERVAL '30 days'
),
(
  '66666666-6666-6666-6666-666666666666'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'financial',
  'Banco Empresarial',
  '+57 601 555 8888',
  'Institución Financiera',
  'atencion@bancoempresarial.com',
  'Calle 72 #10-07, Bogotá',
  5,
  'Cliente preferencial con historial crediticio excelente',
  NOW() - INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. DOCUMENTOS
-- =====================================================
INSERT INTO client_documents (
  id,
  client_id,
  document_type,
  file_name,
  file_url,
  file_size,
  uploaded_by,
  upload_date,
  notes,
  is_verified,
  verified_by,
  verified_at
) VALUES 
(
  '77777777-7777-7777-7777-777777777777'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'id',
  'cedula_carlos_propietario.pdf',
  'https://ejemplo.com/docs/cedula.pdf',
  245678,
  '438f9a53-1475-43fc-81e4-2d6ffc83270c'::uuid,
  NOW() - INTERVAL '30 days',
  'Cédula escaneada ambos lados',
  true,
  '438f9a53-1475-43fc-81e4-2d6ffc83270c'::uuid,
  NOW() - INTERVAL '29 days'
),
(
  '88888888-8888-8888-8888-888888888888'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'contract',
  'contrato_administracion.pdf',
  'https://ejemplo.com/docs/contrato.pdf',
  589234,
  '438f9a53-1475-43fc-81e4-2d6ffc83270c'::uuid,
  NOW() - INTERVAL '30 days',
  'Contrato de administración firmado',
  true,
  '438f9a53-1475-43fc-81e4-2d6ffc83270c'::uuid,
  NOW() - INTERVAL '29 days'
),
(
  '99999999-9999-9999-9999-999999999999'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'proof_of_income',
  'certificado_bancario.pdf',
  'https://ejemplo.com/docs/certificado.pdf',
  123456,
  '438f9a53-1475-43fc-81e4-2d6ffc83270c'::uuid,
  NOW() - INTERVAL '30 days',
  'Certificado bancario de los últimos 6 meses',
  true,
  '438f9a53-1475-43fc-81e4-2d6ffc83270c'::uuid,
  NOW() - INTERVAL '29 days'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. PAGOS REALIZADOS (ÚLTIMOS 6 MESES)
-- =====================================================

-- Verificar si existe la tabla client_payments, si no, crearla
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

-- Crear índice si no existe
CREATE INDEX IF NOT EXISTS idx_client_payments_client_id ON client_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_date ON client_payments(payment_date);

-- Insertar pagos de los últimos 6 meses
INSERT INTO client_payments (id, client_id, payment_date, amount, payment_method, payment_status, reference_number, description, created_at) VALUES
-- Noviembre 2024
('a1111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2024-11-05', 2500000, 'transfer', 'completed', 'TRF-2024-11-001', 'Pago mensual administración - Noviembre 2024', '2024-11-05 10:30:00'),

-- Diciembre 2024
('a2222222-2222-2222-2222-222222222222'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2024-12-05', 2500000, 'transfer', 'completed', 'TRF-2024-12-001', 'Pago mensual administración - Diciembre 2024', '2024-12-05 09:15:00'),

-- Enero 2025 (mes pasado)
('a3333333-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-01-05', 2500000, 'transfer', 'completed', 'TRF-2025-01-001', 'Pago mensual administración - Enero 2025', '2025-01-05 11:20:00'),

-- Febrero 2025
('a4444444-4444-4444-4444-444444444444'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-02-05', 2500000, 'transfer', 'completed', 'TRF-2025-02-001', 'Pago mensual administración - Febrero 2025', '2025-02-05 14:45:00'),

-- Marzo 2025
('a5555555-5555-5555-5555-555555555555'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-03-05', 2500000, 'transfer', 'completed', 'TRF-2025-03-001', 'Pago mensual administración - Marzo 2025', '2025-03-05 10:00:00'),

-- Abril 2025
('a6666666-6666-6666-6666-666666666666'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-04-05', 2500000, 'transfer', 'completed', 'TRF-2025-04-001', 'Pago mensual administración - Abril 2025', '2025-04-05 09:30:00'),

-- Mayo 2025
('a7777777-7777-7777-7777-777777777777'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-05-05', 2500000, 'transfer', 'completed', 'TRF-2025-05-001', 'Pago mensual administración - Mayo 2025', '2025-05-05 11:00:00'),

-- Junio 2025
('a8888888-8888-8888-8888-888888888888'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-06-05', 2500000, 'transfer', 'completed', 'TRF-2025-06-001', 'Pago mensual administración - Junio 2025', '2025-06-05 10:15:00'),

-- Julio 2025
('a9999999-9999-9999-9999-999999999999'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-07-05', 2500000, 'transfer', 'completed', 'TRF-2025-07-001', 'Pago mensual administración - Julio 2025', '2025-07-05 09:45:00'),

-- Agosto 2025
('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-08-05', 2500000, 'transfer', 'completed', 'TRF-2025-08-001', 'Pago mensual administración - Agosto 2025', '2025-08-05 14:20:00'),

-- Septiembre 2025
('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-09-05', 2500000, 'transfer', 'completed', 'TRF-2025-09-001', 'Pago mensual administración - Septiembre 2025', '2025-09-05 10:30:00'),

-- Octubre 2025
('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-10-05', 2500000, 'transfer', 'completed', 'TRF-2025-10-001', 'Pago mensual administración - Octubre 2025', '2025-10-05 11:15:00'),

-- Noviembre 2025
('aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-11-05', 2500000, 'transfer', 'completed', 'TRF-2025-11-001', 'Pago mensual administración - Noviembre 2025', '2025-11-05 09:00:00'),

-- Diciembre 2025 (mes actual)
('aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '2025-12-05', 2500000, 'transfer', 'completed', 'TRF-2025-12-001', 'Pago mensual administración - Diciembre 2025', '2025-12-05 10:00:00')

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8. VERIFICACIÓN
-- =====================================================

SELECT 
  '✅ CLIENTE CREADO' as status,
  c.full_name,
  c.email,
  c.client_type,
  cpc.username as portal_username,
  cpc.is_active as portal_activo
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
  '✅ DOCUMENTOS SUBIDOS' as status,
  COUNT(*) as total_documentos
FROM client_documents
WHERE client_id = '11111111-1111-1111-1111-111111111111';

-- =====================================================
-- CREDENCIALES PARA INICIAR SESIÓN EN EL PORTAL
-- =====================================================

/*
🔐 CREDENCIALES DEL PORTAL DE CLIENTES:

Usuario: carlos.propietario
Contraseña: Test123456!

Cliente: Carlos Propietario Test
Email: carlos.propietario@test.com
Tipo: Propietario (owner)
Estado: Activo

📊 DATOS INSERTADOS:
- Cliente base con información completa
- Credenciales del portal activas
- Contrato de administración
- Configuración de pagos mensual
- 2 Referencias (personal y financiera)
- 3 Documentos verificados
- 14 Pagos realizados (Noviembre 2024 - Diciembre 2025)

🎯 PARA PROBAR:
1. Inicia sesión en el portal de clientes
2. Verifica que se muestren los pagos en el calendario
3. Revisa que los documentos estén disponibles
4. Valida que la información del contrato sea correcta

⚠️ NOTA: 
Si la tabla client_payments no existe, el script la crea automáticamente.
Los pagos aparecerán en el calendario del portal del cliente.
*/
