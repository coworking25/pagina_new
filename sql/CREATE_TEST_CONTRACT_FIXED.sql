-- =====================================================
-- CREAR DATOS DE PRUEBA COMPLETOS PARA CLIENTE CARLOS
-- =====================================================
-- Este script crea:
-- 1. Una propiedad de prueba
-- 2. Una propietaria (landlord)
-- 3. Dos contratos para el cliente Carlos

-- =====================================================
-- 1. CREAR PROPIEDAD DE PRUEBA
-- =====================================================
INSERT INTO properties (
  id,
  title,
  code,
  description,
  type,
  availability_type,
  status,
  rent_price,
  area,
  bedrooms,
  bathrooms,
  location,
  images,
  amenities,
  featured
) VALUES (
  999001,
  'Apartamento Moderno en Chapinero Alto',
  'APT-CHAP-001',
  'Hermoso apartamento de 85m² ubicado en el exclusivo sector de Chapinero Alto. Cuenta con excelente iluminación natural, acabados de primera calidad, balcón con vista panorámica y una ubicación privilegiada cerca de restaurantes, centros comerciales y transporte público. Ideal para profesionales o parejas.',
  'apartment',
  'rent',
  'rent',
  2800000,
  85,
  2,
  2,
  'Carrera 7 #63-45, Apartamento 802, Chapinero Alto, Bogotá',
  jsonb_build_array(
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260066-6bc2c9c5c92d?w=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'
  ),
  ARRAY['Parqueadero', 'Ascensor', 'Balcón', 'Cocina Integral', 'Closets', 'Vigilancia 24/7'],
  false
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  updated_at = NOW();

-- =====================================================
-- 2. CREAR PROPIETARIA (LANDLORD)
-- =====================================================
INSERT INTO clients (
  id,
  full_name,
  email,
  phone,
  document_type,
  document_number,
  client_type,
  status,
  city,
  occupation
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'María González Pérez',
  'maria.gonzalez.landlord@test.com',
  '+57 310 456 7890',
  'cedula',
  '52987654',
  'landlord',
  'active',
  'Bogotá',
  'Propietaria Inmobiliaria'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- =====================================================
-- 3. CREAR CONTRATO PRINCIPAL (12 MESES)
-- =====================================================
-- NOTA: property_id es NULL porque hay incompatibilidad de tipos
-- (contracts.property_id es UUID pero properties.id es BIGINT)
INSERT INTO contracts (
  id,
  client_id,
  property_id,
  landlord_id,
  contract_type,
  contract_number,
  status,
  start_date,
  end_date,
  signature_date,
  monthly_rent,
  deposit_amount,
  administration_fee,
  contract_duration_months,
  payment_day,
  late_fee_percentage,
  notes
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111', -- Cliente Carlos (ya existe)
  NULL, -- property_id como NULL por incompatibilidad de tipos
  '33333333-3333-3333-3333-333333333333', -- Propietaria María
  'rental',
  'CTR-2024-001',
  'active',
  '2024-01-01',
  '2024-12-31',
  '2023-12-20',
  2800000,
  5600000, -- 2 meses de depósito
  180000,
  12,
  5, -- Día 5 de cada mes
  1.5,
  'Contrato de arrendamiento para Apartamento Moderno en Chapinero Alto (Carrera 7 #63-45, Apartamento 802). Contrato con opción de renovación automática. Incluye parqueadero cubierto (P-45) y cuarto útil en sótano. El inquilino se compromete a mantener la propiedad en buen estado y respetar las normas de copropiedad.'
)
ON CONFLICT (id) DO UPDATE SET
  monthly_rent = EXCLUDED.monthly_rent,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- =====================================================
-- 4. CREAR CONTRATO PRÓXIMO A VENCER (ALERTA)
-- =====================================================
-- Este contrato vence en 27 días para demostrar la funcionalidad de alertas
INSERT INTO contracts (
  id,
  client_id,
  property_id,
  landlord_id,
  contract_type,
  contract_number,
  status,
  start_date,
  end_date,
  signature_date,
  monthly_rent,
  deposit_amount,
  administration_fee,
  contract_duration_months,
  payment_day,
  late_fee_percentage,
  notes
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111', -- Cliente Carlos
  NULL, -- property_id como NULL por incompatibilidad de tipos
  '33333333-3333-3333-3333-333333333333', -- Propietaria María
  'rental',
  'CTR-2025-002',
  'active',
  '2024-12-01',
  '2025-01-15', -- Vence en menos de 30 días desde hoy (2025-12-19)
  '2024-11-25',
  2800000,
  5600000,
  180000,
  2, -- Contrato temporal de 2 meses
  5,
  1.5,
  'Contrato temporal de 2 meses para Apartamento Moderno en Chapinero Alto mientras se define la renovación del contrato principal. Este contrato debe mostrar una alerta de vencimiento próximo en el portal del cliente. ⚠️ VENCE EL 15 DE ENERO 2025.'
)
ON CONFLICT (id) DO UPDATE SET
  end_date = EXCLUDED.end_date,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- =====================================================
-- 5. VERIFICAR DATOS CREADOS
-- =====================================================
SELECT 
  '✅ DATOS CREADOS EXITOSAMENTE' as resultado,
  '' as separador;

-- Verificar propiedad
SELECT 
  '🏠 PROPIEDAD' as tipo,
  id,
  code,
  title,
  type,
  availability_type,
  status,
  rent_price as precio_arriendo,
  area || 'm²' as area,
  bedrooms || ' hab' as habitaciones,
  bathrooms || ' baños' as banos,
  location as ubicacion
FROM properties
WHERE id = 999001;

-- Verificar propietaria
SELECT 
  '👤 PROPIETARIA' as tipo,
  id,
  full_name as nombre,
  document_type as tipo_doc,
  document_number as numero_doc,
  email,
  phone as telefono,
  client_type as tipo_cliente,
  status as estado
FROM clients
WHERE id = '33333333-3333-3333-3333-333333333333';

-- Verificar contratos creados
SELECT 
  '📋 CONTRATOS' as tipo,
  c.id,
  c.contract_number as numero,
  c.status as estado,
  c.start_date as inicio,
  c.end_date as fin,
  CASE 
    WHEN c.end_date < CURRENT_DATE THEN '🔴 VENCIDO'
    WHEN c.end_date <= CURRENT_DATE + INTERVAL '30 days' THEN '🟡 PRÓXIMO A VENCER'
    ELSE '🟢 VIGENTE'
  END as alerta,
  (c.end_date - CURRENT_DATE) as dias_restantes,
  c.monthly_rent as renta_mensual,
  cl.full_name as cliente,
  l.full_name as propietario,
  c.notes as detalles
FROM contracts c
LEFT JOIN clients cl ON c.client_id = cl.id
LEFT JOIN clients l ON c.landlord_id = l.id
WHERE c.client_id = '11111111-1111-1111-1111-111111111111'
ORDER BY c.end_date;

-- =====================================================
-- 📊 RESUMEN DE DATOS CREADOS
-- =====================================================
SELECT 
  '📊 RESUMEN' as seccion,
  '1 propiedad (ID: 999001)' as propiedades,
  '1 propietaria (María González)' as propietarios,
  '2 contratos para Carlos' as contratos,
  'CTR-2024-001: Vigente hasta 2024-12-31' as contrato_1,
  'CTR-2025-002: ⚠️ Vence el 2025-01-15 (27 días)' as contrato_2;
