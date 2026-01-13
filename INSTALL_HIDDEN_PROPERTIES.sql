-- =============================================================================
-- SCRIPT DE INSTALACIÓN: Sistema de Propiedades Ocultas
-- =============================================================================
-- Ejecutar este script en Supabase SQL Editor
-- =============================================================================

-- Paso 1: Agregar columna is_hidden
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- Paso 2: Agregar comentario
COMMENT ON COLUMN properties.is_hidden IS 'Indica si la propiedad está oculta y no debe mostrarse en la web pública';

-- Paso 3: Crear índices
CREATE INDEX IF NOT EXISTS idx_properties_is_hidden 
ON properties(is_hidden) 
WHERE is_hidden = false;

CREATE INDEX IF NOT EXISTS idx_properties_visible_available 
ON properties(is_hidden, status) 
WHERE is_hidden = false AND deleted_at IS NULL;

-- Paso 4: Actualizar política RLS
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;

CREATE POLICY "Properties are viewable by everyone"
ON properties FOR SELECT
USING (
  deleted_at IS NULL 
  AND (
    auth.uid() IS NOT NULL
    OR
    (auth.uid() IS NULL AND is_hidden = false)
  )
);

-- Paso 5: Crear función de auditoría (simplificada - sin dependencias)
CREATE OR REPLACE FUNCTION log_property_visibility_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Simplemente retornar sin hacer nada
  -- La auditoría se puede agregar más tarde si se necesita
  -- Por ahora, solo permitimos que el trigger exista sin fallar
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 6: Crear trigger
DROP TRIGGER IF EXISTS trigger_property_visibility_change ON properties;
CREATE TRIGGER trigger_property_visibility_change
  AFTER UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION log_property_visibility_change();

-- Paso 7: (OPCIONAL) Ocultar propiedades vendidas/arrendadas
-- Descomenta las siguientes líneas si quieres aplicar automáticamente
-- UPDATE properties
-- SET is_hidden = true
-- WHERE status IN ('sold', 'rented')
--   AND is_hidden = false;

-- Verificación
SELECT 
  'Migración completada' as status,
  COUNT(*) as total_properties,
  COUNT(*) FILTER (WHERE is_hidden = true) as hidden_count,
  COUNT(*) FILTER (WHERE is_hidden = false) as visible_count
FROM properties
WHERE deleted_at IS NULL;

-- ✅ ¡Listo! El sistema de propiedades ocultas está instalado
