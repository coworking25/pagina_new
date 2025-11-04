-- ==========================================
-- SCRIPT: VALIDACIÓN Y CORRECCIÓN DE ESTADOS DE PROPIEDADES
-- Fecha: 4 de Noviembre de 2025
-- Propósito: Corregir inconsistencias entre availability_type y status
-- ==========================================

-- ==========================================
-- PASO 1: AUDITORÍA PREVIA
-- ==========================================

-- Ver todas las combinaciones actuales de availability_type y status
SELECT 
  availability_type,
  status,
  COUNT(*) as cantidad,
  STRING_AGG(code, ', ') as codigos
FROM properties
WHERE deleted_at IS NULL
GROUP BY availability_type, status
ORDER BY availability_type, status;

-- ==========================================
-- PASO 2: DETECTAR INCONSISTENCIAS
-- ==========================================

-- Propiedades con problemas potenciales
SELECT 
  id,
  code,
  title,
  availability_type,
  status,
  sale_price,
  rent_price,
  CASE 
    -- Caso 1: availability_type='both' pero status no es 'both' ni 'available'
    WHEN availability_type = 'both' AND status NOT IN ('both', 'available', 'sold', 'rented', 'reserved', 'maintenance', 'pending') 
      THEN '⚠️ availability_type=both pero status incorrecto'
    
    -- Caso 2: availability_type='sale' pero status es 'rent' o 'rented'
    WHEN availability_type = 'sale' AND status IN ('rent', 'rented') 
      THEN '⚠️ availability_type=sale pero status de arriendo'
    
    -- Caso 3: availability_type='rent' pero status es 'sale' o 'sold'
    WHEN availability_type = 'rent' AND status IN ('sale', 'sold') 
      THEN '⚠️ availability_type=rent pero status de venta'
    
    -- Caso 4: availability_type='both' sin precios configurados
    WHEN availability_type = 'both' AND (sale_price IS NULL OR rent_price IS NULL)
      THEN '⚠️ both sin ambos precios configurados'
    
    -- Caso 5: availability_type='sale' sin sale_price
    WHEN availability_type = 'sale' AND sale_price IS NULL
      THEN '⚠️ sale sin precio de venta'
    
    -- Caso 6: availability_type='rent' sin rent_price
    WHEN availability_type = 'rent' AND rent_price IS NULL
      THEN '⚠️ rent sin precio de arriendo'
    
    ELSE '✅ OK'
  END as problema
FROM properties
WHERE deleted_at IS NULL
  AND (
    -- Filtrar solo las que tienen problemas
    (availability_type = 'both' AND status NOT IN ('both', 'available', 'sold', 'rented', 'reserved', 'maintenance', 'pending'))
    OR (availability_type = 'sale' AND status IN ('rent', 'rented'))
    OR (availability_type = 'rent' AND status IN ('sale', 'sold'))
    OR (availability_type = 'both' AND (sale_price IS NULL OR rent_price IS NULL))
    OR (availability_type = 'sale' AND sale_price IS NULL)
    OR (availability_type = 'rent' AND rent_price IS NULL)
  )
ORDER BY created_at DESC;

-- ==========================================
-- PASO 3: CORRECCIONES AUTOMÁTICAS
-- ==========================================

-- CORRECCIÓN 1: Propiedades con availability_type='both' pero status='available'
-- Cambiar status a 'both' para ser consistente
UPDATE properties
SET status = 'both'
WHERE deleted_at IS NULL
  AND availability_type = 'both'
  AND status = 'available';

-- CORRECCIÓN 2: Propiedades que dicen "ARRIENDO" en el título pero están como 'sale'
UPDATE properties
SET 
  availability_type = 'rent',
  status = 'rent',
  rent_price = COALESCE(rent_price, sale_price),
  sale_price = NULL
WHERE deleted_at IS NULL
  AND (
    LOWER(title) LIKE '%arriendo%'
    OR LOWER(title) LIKE '%arrienda%'
    OR LOWER(title) LIKE '%alquiler%'
    OR LOWER(title) LIKE '%renta%'
  )
  AND availability_type = 'sale'
  AND status NOT IN ('sold', 'rented');

-- CORRECCIÓN 3: Propiedades que dicen "VENTA" en el título pero están como 'rent'
UPDATE properties
SET 
  availability_type = 'sale',
  status = 'sale',
  sale_price = COALESCE(sale_price, rent_price),
  rent_price = NULL
WHERE deleted_at IS NULL
  AND (
    LOWER(title) LIKE '%venta%'
    OR LOWER(title) LIKE '%vende%'
  )
  AND availability_type = 'rent'
  AND status NOT IN ('sold', 'rented');

-- CORRECCIÓN 4: Asegurar que propiedades 'both' tengan ambos precios
-- (Esto es informativo, requiere intervención manual para definir los precios)
SELECT 
  'ATENCIÓN: Estas propiedades tienen availability_type=both pero les falta un precio' as mensaje,
  id,
  code,
  title,
  sale_price,
  rent_price
FROM properties
WHERE deleted_at IS NULL
  AND availability_type = 'both'
  AND (sale_price IS NULL OR rent_price IS NULL);

-- ==========================================
-- PASO 4: VALIDACIÓN POST-CORRECCIÓN
-- ==========================================

-- Contar propiedades por estado después de las correcciones
SELECT 
  'RESUMEN POST-CORRECCIÓN' as reporte,
  availability_type,
  status,
  COUNT(*) as cantidad
FROM properties
WHERE deleted_at IS NULL
GROUP BY availability_type, status
ORDER BY availability_type, status;

-- Verificar que no queden inconsistencias
SELECT 
  id,
  code,
  title,
  availability_type,
  status,
  sale_price,
  rent_price,
  CASE 
    WHEN availability_type = 'both' AND status NOT IN ('both', 'available', 'sold', 'rented', 'reserved', 'maintenance', 'pending') 
      THEN '⚠️ SIGUE INCONSISTENTE'
    WHEN availability_type = 'sale' AND status IN ('rent', 'rented') 
      THEN '⚠️ SIGUE INCONSISTENTE'
    WHEN availability_type = 'rent' AND status IN ('sale', 'sold') 
      THEN '⚠️ SIGUE INCONSISTENTE'
    ELSE '✅ OK'
  END as validacion_final
FROM properties
WHERE deleted_at IS NULL
  AND (
    (availability_type = 'both' AND status NOT IN ('both', 'available', 'sold', 'rented', 'reserved', 'maintenance', 'pending'))
    OR (availability_type = 'sale' AND status IN ('rent', 'rented'))
    OR (availability_type = 'rent' AND status IN ('sale', 'sold'))
  )
ORDER BY created_at DESC;

-- ==========================================
-- PASO 5: ESTADÍSTICAS FINALES
-- ==========================================

-- Mostrar distribución de propiedades disponibles para la web
SELECT 
  '📊 PROPIEDADES DISPONIBLES EN LA WEB' as reporte,
  availability_type,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
FROM properties
WHERE deleted_at IS NULL
  AND status IN ('available', 'sale', 'rent', 'both')
  AND status NOT IN ('sold', 'rented')
GROUP BY availability_type
ORDER BY total DESC;

-- Mostrar propiedades NO disponibles (vendidas, arrendadas, etc.)
SELECT 
  '🔒 PROPIEDADES NO DISPONIBLES' as reporte,
  status,
  COUNT(*) as total
FROM properties
WHERE deleted_at IS NULL
  AND status IN ('sold', 'rented', 'reserved', 'maintenance', 'pending')
GROUP BY status
ORDER BY total DESC;

-- ==========================================
-- PASO 6: RECOMENDACIONES
-- ==========================================

-- Propiedades que podrían necesitar revisión manual
SELECT 
  '🔍 REVISAR MANUALMENTE' as reporte,
  id,
  code,
  title,
  availability_type,
  status,
  sale_price,
  rent_price,
  'Sin precio configurado' as razon
FROM properties
WHERE deleted_at IS NULL
  AND (
    (availability_type = 'sale' AND sale_price IS NULL)
    OR (availability_type = 'rent' AND rent_price IS NULL)
    OR (availability_type = 'both' AND (sale_price IS NULL OR rent_price IS NULL))
  )
ORDER BY created_at DESC
LIMIT 20;

-- ==========================================
-- NOTAS IMPORTANTES
-- ==========================================

/*
CAMPOS IMPORTANTES:
- availability_type: Define QUÉ se ofrece ('sale', 'rent', 'both')
- status: Define el ESTADO actual ('available', 'sale', 'rent', 'both', 'sold', 'rented', 'reserved', 'maintenance', 'pending')

REGLAS DE CONSISTENCIA:
1. Si availability_type='both', el status debería ser 'both' cuando está disponible
2. Si availability_type='sale', el status puede ser 'available', 'sale', 'sold', 'reserved', 'maintenance', 'pending'
3. Si availability_type='rent', el status puede ser 'available', 'rent', 'rented', 'reserved', 'maintenance', 'pending'
4. Propiedades con availability_type='both' DEBEN tener sale_price Y rent_price
5. Propiedades con availability_type='sale' DEBEN tener sale_price
6. Propiedades con availability_type='rent' DEBEN tener rent_price

ESTADOS QUE NO APARECEN EN LA WEB:
- sold (vendido)
- rented (arrendado)
- reserved (puede aparecer, pero no está disponible para nuevas consultas)
- maintenance (en mantenimiento)
- pending (pendiente de aprobación/revisión)
*/
