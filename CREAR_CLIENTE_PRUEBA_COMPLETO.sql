-- =====================================================
-- 🧪 CREAR CLIENTE DE PRUEBA COMPLETO
-- =====================================================
-- Este script crea un cliente con todos los datos necesarios
-- para probar el portal de clientes completamente
-- =====================================================

-- =====================================================
-- PASO 1: CREAR CLIENTE
-- =====================================================

-- Insertar cliente de prueba
INSERT INTO clients (
  id,
  full_name,
  email,
  phone,
  document_type,
  document_number,
  address,
  city,
  emergency_contact_name,
  emergency_contact_phone,
  occupation,
  company_name,
  client_type,
  status,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(), -- Se generará automáticamente
  'Juan Pérez García',
  'juan.perez.test@coworking.com',
  '+57 300 123 4567',
  'cedula', -- Tipo de documento (valores válidos: cedula, passport, nit, etc.)
  '1234567890',
  'Calle 123 #45-67, Apto 301',
  'Bogotá',
  'María Pérez',
  '+57 300 765 4321',
  'Ingeniero de Software',
  'Tech Solutions SAS',
  'tenant', -- Tipo de cliente: arrendatario
  'active', -- Estado: activo
  NOW(),
  NOW()
)
RETURNING id, full_name, email;

-- Guardar el ID del cliente para usarlo en los siguientes pasos
-- Ejemplo de resultado: 12345678-1234-1234-1234-123456789abc

-- =====================================================
-- PASO 2: CREAR CREDENCIALES DE LOGIN
-- =====================================================

-- ⚠️ IMPORTANTE: Reemplaza 'CLIENT_ID_AQUI' con el UUID del paso anterior

-- Hash de la contraseña "test123" generado con bcrypt (10 rounds)
-- Para generar un nuevo hash: https://bcrypt-generator.com/

INSERT INTO client_credentials (
  id,
  client_id,
  email,
  password_hash,
  is_active,
  must_change_password,
  last_password_change,
  failed_login_attempts,
  locked_until,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024'::UUID, -- UUID del cliente Juan Pérez García
  'juan.perez.test@coworking.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Contraseña: test123
  true,
  false,
  NOW(),
  0,
  NULL,
  NOW(),
  NOW()
)
RETURNING id, email;

-- Ahora puedes hacer login con:
-- Email: juan.perez.test@coworking.com
-- Contraseña: test123

-- =====================================================
-- PASO 3: OBTENER UNA PROPIEDAD EXISTENTE
-- =====================================================

-- Ver propiedades disponibles para asignar
SELECT 
  id,
  code,
  title,
  type,
  price,
  bedrooms,
  bathrooms,
  location,
  status
FROM properties
WHERE status = 'available'
  OR status = 'rented'
ORDER BY created_at DESC
LIMIT 10;

-- Copiar el ID de una propiedad de la lista anterior
-- Ejemplo: 45

-- ⚠️ GUARDAR EL property_id PARA EL SIGUIENTE PASO

-- =====================================================
-- PASO 4: ASIGNAR PROPIEDAD AL CLIENTE
-- =====================================================

-- ⚠️ IMPORTANTE: Reemplaza CLIENT_ID_AQUI y PROPERTY_ID_AQUI
-- Usar el client_id del PASO 1 y el property_id del PASO 3

INSERT INTO client_property_relations (
  id,
  client_id,
  property_id,
  relation_type,
  status,
  notes,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024'::UUID, -- UUID del cliente Juan Pérez García
  104, -- CA-016: Apartamento en Venta y Arriendo – Envigado
  'tenant',
  'active',
  'Relación de prueba para portal de clientes',
  NOW(),
  NOW()
)
RETURNING id, relation_type, status;

-- =====================================================
-- PASO 5: CREAR CONTRATO
-- =====================================================

-- ⚠️ IMPORTANTE: Reemplaza CLIENT_ID_AQUI y PROPERTY_ID_AQUI
-- Usar el client_id del PASO 1 y el property_id del PASO 3

INSERT INTO contracts (
  id,
  contract_number,
  contract_type,
  status,
  client_id,
  property_id,
  landlord_id,
  start_date,
  end_date,
  signature_date,
  monthly_rent,
  deposit_amount,
  administration_fee,
  payment_day,
  notes,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'CONT-TEST-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0'),
  'rental',
  'active',
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024'::UUID, -- UUID del cliente Juan Pérez García
  104, -- CA-016: Apartamento en Venta y Arriendo – Envigado
  NULL, -- Sin propietario por ahora
  NOW(),
  NOW() + INTERVAL '1 year',
  NOW(),
  1500000,
  1500000,
  150000,
  5,
  'Contrato de prueba para validar portal de clientes',
  NOW(),
  NOW()
)
RETURNING id, contract_number, monthly_rent;

-- ⚠️ GUARDAR EL contract_id (UUID) PARA CREAR PAGOS

-- =====================================================
-- PASO 6: CREAR PAGOS (RECIENTES Y PRÓXIMOS)
-- =====================================================

-- ⚠️ IMPORTANTE: Reemplaza CLIENT_ID_AQUI y CONTRACT_ID_AQUI

-- PAGO 1: Pagado el mes pasado (RECIENTE)
INSERT INTO payments (
  id,
  contract_id,
  client_id,
  payment_type,
  amount,
  amount_paid,
  status,
  payment_method,
  transaction_reference,
  due_date,
  payment_date,
  period_start,
  period_end,
  late_fee_applied,
  notes,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '3816df74-faac-4193-acb2-80bf1ec34def'::UUID, -- UUID del contrato CONT-TEST-20251111-609
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024'::UUID, -- UUID del cliente Juan Pérez García
  'rent',
  1500000,
  1500000,
  'paid',
  'transfer',
  'TEST-REF-001',
  DATE_TRUNC('month', NOW() - INTERVAL '1 month') + INTERVAL '4 days',
  DATE_TRUNC('month', NOW() - INTERVAL '1 month') + INTERVAL '3 days',
  DATE_TRUNC('month', NOW() - INTERVAL '1 month'),
  DATE_TRUNC('month', NOW() - INTERVAL '1 month') + INTERVAL '1 month' - INTERVAL '1 day',
  0,
  'Pago de arriendo mes anterior',
  NOW(),
  NOW()
);

-- PAGO 2: Pagado este mes (RECIENTE)
INSERT INTO payments (
  id,
  contract_id,
  client_id,
  payment_type,
  amount,
  amount_paid,
  status,
  payment_method,
  transaction_reference,
  due_date,
  payment_date,
  period_start,
  period_end,
  late_fee_applied,
  notes,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '3816df74-faac-4193-acb2-80bf1ec34def'::UUID, -- UUID del contrato CONT-TEST-20251111-609
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024'::UUID, -- UUID del cliente Juan Pérez García
  'administration',
  150000,
  150000,
  'paid',
  'cash',
  'TEST-REF-002',
  DATE_TRUNC('month', NOW()) + INTERVAL '4 days',
  DATE_TRUNC('month', NOW()) + INTERVAL '4 days',
  DATE_TRUNC('month', NOW()),
  DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day',
  0,
  'Pago de administración mes actual',
  NOW(),
  NOW()
);

-- PAGO 3: Pendiente próximo mes (PRÓXIMO)
INSERT INTO payments (
  id,
  contract_id,
  client_id,
  payment_type,
  amount,
  amount_paid,
  status,
  payment_method,
  transaction_reference,
  due_date,
  payment_date,
  period_start,
  period_end,
  late_fee_applied,
  notes,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '3816df74-faac-4193-acb2-80bf1ec34def'::UUID, -- UUID del contrato CONT-TEST-20251111-609
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024'::UUID, -- UUID del cliente Juan Pérez García
  'rent',
  1500000,
  0,
  'pending',
  NULL,
  NULL,
  DATE_TRUNC('month', NOW() + INTERVAL '1 month') + INTERVAL '4 days',
  NULL,
  DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
  DATE_TRUNC('month', NOW() + INTERVAL '2 months') - INTERVAL '1 day',
  0,
  'Pago de arriendo próximo mes',
  NOW(),
  NOW()
);

-- PAGO 4: Pendiente mes siguiente (PRÓXIMO)
INSERT INTO payments (
  id,
  contract_id,
  client_id,
  payment_type,
  amount,
  amount_paid,
  status,
  payment_method,
  transaction_reference,
  due_date,
  payment_date,
  period_start,
  period_end,
  late_fee_applied,
  notes,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '3816df74-faac-4193-acb2-80bf1ec34def'::UUID, -- UUID del contrato CONT-TEST-20251111-609
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024'::UUID, -- UUID del cliente Juan Pérez García
  'administration',
  150000,
  0,
  'pending',
  NULL,
  NULL,
  DATE_TRUNC('month', NOW() + INTERVAL '1 month') + INTERVAL '4 days',
  NULL,
  DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
  DATE_TRUNC('month', NOW() + INTERVAL '2 months') - INTERVAL '1 day',
  0,
  'Pago de administración próximo mes',
  NOW(),
  NOW()
);

-- =====================================================
-- PASO 7: CREAR DOCUMENTOS
-- =====================================================

-- ⚠️ IMPORTANTE: Reemplaza CLIENT_ID_AQUI y CONTRACT_ID_AQUI

INSERT INTO client_documents (
  id,
  client_id,
  contract_id,
  document_type,
  document_name,
  file_path,
  file_size,
  mime_type,
  status,
  expiration_date,
  is_required,
  notes,
  created_at,
  updated_at
)
VALUES
-- Documento 1: Cédula
(
  gen_random_uuid(),
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024'::UUID, -- UUID del cliente Juan Pérez García
  '3816df74-faac-4193-acb2-80bf1ec34def'::UUID, -- UUID del contrato CONT-TEST-20251111-609
  'identification',
  'Cédula de Ciudadanía',
  'documents/test/cedula_123.pdf',
  524288, -- 512 KB
  'application/pdf',
  'active',
  NULL,
  true,
  'Documento de identificación del cliente',
  NOW(),
  NOW()
),
-- Documento 2: Contrato firmado
(
  gen_random_uuid(),
  'f183c02b-4a97-4ad3-9e45-2bb9500f3024'::UUID, -- UUID del cliente Juan Pérez García
  '3816df74-faac-4193-acb2-80bf1ec34def'::UUID, -- UUID del contrato CONT-TEST-20251111-609
  'contract',
  'Contrato de Arrendamiento Firmado',
  'documents/test/contrato_signed.pdf',
  1048576, -- 1 MB
  'application/pdf',
  'active',
  NOW() + INTERVAL '1 year',
  true,
  'Contrato de arrendamiento original firmado',
  NOW(),
  NOW()
);

-- =====================================================
-- ✅ RESUMEN DE DATOS CREADOS
-- =====================================================

/*
Se creó un cliente completo con:

1. ✅ Cliente: Juan Pérez García
   - Email: juan.perez.test@coworking.com
   - Teléfono: +57 300 123 4567
   - Ciudad: Bogotá

2. ✅ Credenciales de Login:
   - Email: juan.perez.test@coworking.com
   - Contraseña: test123
   - Estado: Activo

3. ✅ Propiedad Existente:
   - Usa una propiedad ya creada en la base de datos
   - Se asigna al cliente como inquilino

4. ✅ Relación Cliente-Propiedad:
   - Tipo: Arrendatario (tenant)
   - Estado: Activo

5. ✅ Contrato:
   - Tipo: Arrendamiento
   - Duración: 1 año
   - Arriendo mensual: $1,500,000
   - Administración: $150,000

6. ✅ Pagos:
   - 2 pagos COMPLETADOS (recientes)
   - 2 pagos PENDIENTES (próximos)
   - Total pagado este año: $1,650,000

7. ✅ Documentos:
   - Cédula de ciudadanía
   - Contrato firmado
*/

-- =====================================================
-- 🧪 PROBAR EL CLIENTE CREADO
-- =====================================================

-- Ver el cliente creado con su credencial
SELECT 
  c.id as client_id,
  c.full_name,
  c.email,
  c.phone,
  cc.email as credential_email,
  cc.is_active
FROM clients c
LEFT JOIN client_credentials cc ON cc.client_id = c.id
WHERE c.email = 'juan.perez.test@coworking.com';

-- Probar la función del dashboard con el nuevo cliente
-- ⚠️ Reemplazar CLIENT_ID con el UUID obtenido arriba
-- SELECT get_client_dashboard_summary('CLIENT_ID_AQUI'::UUID);

-- =====================================================
-- 🎯 SIGUIENTE PASO
-- =====================================================

/*
1. Ejecutar este script PASO POR PASO en Supabase SQL Editor
2. Anotar los IDs generados en cada paso
3. Reemplazar los UUIDs en los pasos siguientes
4. Probar el login en el navegador:
   - URL: http://localhost:5173/login
   - Tipo: Cliente
   - Email: juan.perez.test@coworking.com
   - Contraseña: test123
5. Verificar que el dashboard muestre todas las estadísticas
*/

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================
