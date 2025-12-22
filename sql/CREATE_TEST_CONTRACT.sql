-- =====================================================
-- CREAR CONTRATO DE PRUEBA PARA CLIENTE CARLOS
-- =====================================================

-- Primero, verificar si existe una propiedad o crear una de prueba
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
  images
) VALUES (
  999999, -- ID de prueba para la propiedad
  'Apartamento Moderno en Chapinero',
  'PROP-001',
  'Hermoso apartamento de 80m² ubicado en el exclusivo sector de Chapinero. Cuenta con excelente iluminación natural, acabados de primera calidad y una ubicación privilegiada cerca de restaurantes, centros comerciales y transporte público.',
  'apartment',
  'rent',
  'rent',
  2500000,
  80,
  2,
  2,
  'Calle 63 #7-45, Apartamento 502, Chapinero, Bogotá',
  jsonb_build_array(
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1502672260066-6bc2c9c5c92d?w=800',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'
  )
)
ON CONFLICT (id) DO NOTHING;

-- Crear un propietario (landlord) de prueba
INSERT INTO clients (
  id,
  full_name,
  email,
  phone,
  document_type,
  document_number,
  client_type,
  status
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'María González Pérez',
  'maria.landlord@test.com',
  '+57 310 456 7890',
  'CC',
  '98765432',
  'landlord',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- Ahora crear el contrato
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
  '11111111-1111-1111-1111-111111111111', -- Cliente Carlos
  999999, -- Propiedad Chapinero
  '33333333-3333-3333-3333-333333333333', -- Propietaria María
  'rental',
  'CTR-2024-001',
  'active',
  '2024-01-01',
  '2024-12-31',
  '2023-12-20',
  2500000,
  5000000,
  150000,
  12,
  5,
  1.5,
  'Contrato de arrendamiento con opción de renovación automática. Incluye parqueadero y cuarto útil. El inquilino se compromete a mantener la propiedad en buen estado.'
);

-- Crear otro contrato próximo a vencer
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
  999999, -- Misma propiedad
  '33333333-3333-3333-3333-333333333333', -- Propietaria María
  'rental',
  'CTR-2025-002',
  'active',
  '2024-12-01',
  '2025-01-15', -- Vence en menos de 30 días
  '2024-11-25',
  2500000,
  5000000,
  150000,
  2,
  5,
  1.5,
  'Contrato temporal de 2 meses mientras se define renovación del contrato principal.'
);

-- Verificar contratos creados
SELECT 
  c.id,
  c.contract_number,
  c.status,
  c.start_date,
  c.end_date,
  c.monthly_rent,
  cl.full_name as cliente,
  p.title as propiedad,
  l.full_name as propietario
FROM contracts c
LEFT JOIN clients cl ON c.client_id = cl.id
LEFT JOIN properties p ON c.property_id = p.id
LEFT JOIN clients l ON c.landlord_id = l.id
WHERE c.client_id = '11111111-1111-1111-1111-111111111111'
ORDER BY c.created_at DESC;
