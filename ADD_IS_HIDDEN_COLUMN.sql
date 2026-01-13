-- =============================================================================
-- MIGRACIÓN: Agregar columna is_hidden a la tabla properties
-- =============================================================================
-- Descripción: Sistema de propiedades ocultas para gestión de propiedades
--              que no deben aparecer en la página web pública pero no
--              deben eliminarse de la base de datos.
-- 
-- Funcionalidad:
-- - Permite ocultar propiedades arrendadas o no disponibles
-- - Las propiedades ocultas no se muestran en la web pública
-- - Se pueden restaurar fácilmente desde el panel de administración
-- - Mantiene el historial y datos de propiedades sin eliminarlas
-- =============================================================================

-- Paso 1: Agregar columna is_hidden a la tabla properties
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- Paso 2: Agregar comentario a la columna para documentación
COMMENT ON COLUMN properties.is_hidden IS 'Indica si la propiedad está oculta y no debe mostrarse en la web pública. Las propiedades ocultas siguen existiendo en la BD pero no son visibles para los usuarios finales.';

-- Paso 3: Crear índice para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_properties_is_hidden 
ON properties(is_hidden) 
WHERE is_hidden = false;

-- Paso 4: Crear índice compuesto para consultas de propiedades disponibles y visibles
CREATE INDEX IF NOT EXISTS idx_properties_visible_available 
ON properties(is_hidden, status) 
WHERE is_hidden = false AND deleted_at IS NULL;

-- Paso 5: Actualizar la política RLS existente para excluir propiedades ocultas de la vista pública
-- Nota: Solo los usuarios autenticados (admin/asesores) pueden ver propiedades ocultas

-- Primero, verificar si existe la política y eliminarla si es necesario
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;

-- Crear política actualizada que excluye propiedades ocultas para usuarios no autenticados
CREATE POLICY "Properties are viewable by everyone"
ON properties FOR SELECT
USING (
  deleted_at IS NULL 
  AND (
    -- Los usuarios autenticados (admin/asesores) pueden ver todas las propiedades
    auth.uid() IS NOT NULL
    OR
    -- Los usuarios no autenticados solo ven propiedades no ocultas
    (auth.uid() IS NULL AND is_hidden = false)
  )
);

-- Paso 6: Agregar función para auditar cambios de visibilidad
CREATE OR REPLACE FUNCTION log_property_visibility_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Si cambió el estado de is_hidden, registrar en audit_logs si existe la tabla
  IF OLD.is_hidden IS DISTINCT FROM NEW.is_hidden THEN
    -- Intentar insertar en audit_logs solo si la tabla existe
    BEGIN
      INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        user_id,
        user_email,
        metadata
      ) VALUES (
        'properties',
        NEW.id::TEXT,
        CASE 
          WHEN NEW.is_hidden = true THEN 'hide_property'
          ELSE 'show_property'
        END,
        jsonb_build_object('is_hidden', OLD.is_hidden),
        jsonb_build_object('is_hidden', NEW.is_hidden),
        auth.uid()::TEXT,
        (SELECT email FROM auth.users WHERE id = auth.uid()),
        jsonb_build_object(
          'property_code', NEW.code,
          'property_title', NEW.title,
          'changed_at', NOW(),
          'action_description', CASE 
            WHEN NEW.is_hidden = true THEN 'Propiedad ocultada de la vista pública'
            ELSE 'Propiedad restaurada a la vista pública'
          END
        )
      );
    EXCEPTION
      WHEN undefined_table THEN
        -- Si la tabla audit_logs no existe, simplemente continuar sin registrar
        NULL;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 7: Crear trigger para auditar cambios
DROP TRIGGER IF EXISTS trigger_property_visibility_change ON properties;
CREATE TRIGGER trigger_property_visibility_change
  AFTER UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION log_property_visibility_change();

-- Paso 8: Actualizar propiedades que ya están vendidas o arrendadas para ocultarlas automáticamente
-- (Esto es opcional, puedes comentarlo si no quieres aplicarlo automáticamente)
UPDATE properties
SET is_hidden = true
WHERE status IN ('sold', 'rented')
  AND is_hidden = false;

-- Paso 9: Verificación de la migración
DO $$
DECLARE
  column_exists BOOLEAN;
  index_exists BOOLEAN;
BEGIN
  -- Verificar que la columna existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'is_hidden'
  ) INTO column_exists;
  
  -- Verificar que el índice existe
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'properties' AND indexname = 'idx_properties_is_hidden'
  ) INTO index_exists;
  
  -- Mostrar resultados
  IF column_exists AND index_exists THEN
    RAISE NOTICE '✅ Migración completada exitosamente';
    RAISE NOTICE '   - Columna is_hidden agregada';
    RAISE NOTICE '   - Índices creados';
    RAISE NOTICE '   - Políticas RLS actualizadas';
    RAISE NOTICE '   - Trigger de auditoría configurado';
  ELSE
    RAISE WARNING '⚠️ La migración puede tener problemas. Verificar manualmente.';
  END IF;
END $$;

-- =============================================================================
-- QUERIES ÚTILES PARA GESTIÓN DE PROPIEDADES OCULTAS
-- =============================================================================

-- Ver estadísticas de propiedades ocultas vs visibles
-- SELECT 
--   is_hidden,
--   status,
--   COUNT(*) as total
-- FROM properties
-- WHERE deleted_at IS NULL
-- GROUP BY is_hidden, status
-- ORDER BY is_hidden, status;

-- Ver propiedades ocultas recientes
-- SELECT 
--   code,
--   title,
--   status,
--   is_hidden,
--   updated_at
-- FROM properties
-- WHERE is_hidden = true
--   AND deleted_at IS NULL
-- ORDER BY updated_at DESC
-- LIMIT 20;

-- Restaurar una propiedad oculta específica (ejemplo)
-- UPDATE properties
-- SET is_hidden = false
-- WHERE code = 'CA-XXX';

-- Ocultar múltiples propiedades por estado
-- UPDATE properties
-- SET is_hidden = true
-- WHERE status IN ('sold', 'rented')
--   AND is_hidden = false;
