-- =====================================================
-- MIGRACIÓN: Unificación de Tipos de Cliente
-- =====================================================
-- Autor: Sistema
-- Fecha: 2024
-- Descripción: Migra los tipos de cliente antiguos a los nuevos valores unificados
-- 
-- IMPORTANTE:
-- Tipos válidos: 'landlord', 'tenant', 'buyer', 'seller', 'interested'
-- - 'landlord' → Propietarios CON acceso al portal (el principal)
-- - 'tenant' → Inquilinos (sin portal)
-- - 'buyer' → Compradores (sin portal)
-- - 'seller' → Vendedores (sin portal)
-- - 'interested' → Interesados (sin portal)
-- 
-- Mapeo de migración:
-- 'renter' → 'tenant'
-- 'owner' → 'landlord'
-- =====================================================

-- 1. Ver estado actual ANTES de la migración
SELECT 
  client_type,
  COUNT(*) as total_clientes,
  COUNT(CASE WHEN id IN (SELECT client_id FROM client_portal_credentials) THEN 1 END) as con_portal
FROM clients
GROUP BY client_type
ORDER BY client_type;

-- 2. Migrar 'renter' a 'tenant'
UPDATE clients
SET client_type = 'tenant'
WHERE client_type = 'renter';

-- 3. Migrar 'owner' a 'landlord'
UPDATE clients
SET client_type = 'landlord'
WHERE client_type = 'owner';

-- 4. Verificar que no queden tipos antiguos
SELECT 
  client_type,
  COUNT(*) as total_clientes
FROM clients
WHERE client_type NOT IN ('tenant', 'landlord', 'buyer', 'seller', 'interested')
GROUP BY client_type;

-- 5. Ver estado final DESPUÉS de la migración
SELECT 
  client_type,
  COUNT(*) as total_clientes,
  COUNT(CASE WHEN id IN (SELECT client_id FROM client_portal_credentials) THEN 1 END) as con_portal
FROM clients
GROUP BY client_type
ORDER BY client_type;

-- 6. Validar integridad: Todos los clientes deben tener un tipo válido
SELECT COUNT(*) as clientes_con_tipo_invalido
FROM clients
WHERE client_type IS NULL 
   OR client_type NOT IN ('tenant', 'landlord', 'buyer', 'seller', 'interested');

-- 7. Validar que SOLO 'landlord' tiene credenciales de portal
SELECT 
  c.client_type,
  COUNT(cpc.id) as con_credenciales_portal
FROM clients c
LEFT JOIN client_portal_credentials cpc ON c.id = cpc.client_id
GROUP BY c.client_type
HAVING COUNT(cpc.id) > 0;

-- =====================================================
-- RESULTADO ESPERADO:
-- - Todos los 'renter' convertidos a 'tenant'
-- - Todos los 'owner' convertidos a 'landlord'
-- - 0 clientes con tipo inválido
-- - Los 'landlord' tendrán acceso al portal (se crea después manualmente)
-- =====================================================
