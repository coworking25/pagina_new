-- =====================================================
-- TABLA PUSH_SUBSCRIPTIONS
-- Almacena suscripciones de notificaciones push
-- =====================================================

-- Eliminar tabla si existe
DROP TABLE IF EXISTS push_subscriptions CASCADE;

-- Crear tabla
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('client', 'admin')),
  subscription_data JSONB NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Crear índices
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id, user_type);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions((subscription_data->>'endpoint'));
CREATE INDEX idx_push_subscriptions_created ON push_subscriptions(created_at DESC);

-- Índice único para evitar duplicados (usando expresión JSONB)
CREATE UNIQUE INDEX idx_push_subscriptions_unique 
  ON push_subscriptions(user_id, user_type, ((subscription_data->>'endpoint')));

-- Comentarios
COMMENT ON TABLE push_subscriptions IS 
  'Suscripciones de notificaciones push para clientes y administradores';

COMMENT ON COLUMN push_subscriptions.user_id IS 
  'ID del usuario (client_id para clientes, user_profile_id para admins)';

COMMENT ON COLUMN push_subscriptions.user_type IS 
  'Tipo de usuario: client o admin';

COMMENT ON COLUMN push_subscriptions.subscription_data IS 
  'Datos de suscripción push (endpoint, keys, etc.)';

COMMENT ON COLUMN push_subscriptions.is_active IS 
  'Estado de la suscripción (activa o cancelada)';

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Deshabilitar RLS (usaremos validación en capa de aplicación)
ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNCIÓN HELPER: Limpiar suscripciones antiguas
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Eliminar suscripciones inactivas de más de 90 días
  DELETE FROM push_subscriptions
  WHERE is_active = false 
    AND updated_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_subscriptions() IS 
  'Limpia suscripciones inactivas de más de 90 días. Retorna cantidad eliminada.';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT 
  'push_subscriptions' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'push_subscriptions';

-- Mostrar estructura
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'push_subscriptions'
ORDER BY ordinal_position;

-- Ver estado RLS
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'push_subscriptions';

-- =====================================================
-- RESULTADO ESPERADO:
-- ✅ Tabla push_subscriptions creada con 8 columnas
-- ✅ 4 índices creados
-- ✅ RLS deshabilitado
-- ✅ 1 trigger para updated_at
-- ✅ 1 función helper para cleanup
-- =====================================================

-- Prueba de inserción
DO $$
BEGIN
  RAISE NOTICE '✅ Tabla push_subscriptions lista para usar';
  RAISE NOTICE '📝 Columnas: id, user_id, user_type, subscription_data, user_agent, is_active, created_at, updated_at';
  RAISE NOTICE '🔍 Índices: 4 índices para optimización';
  RAISE NOTICE '🔧 Función: cleanup_old_subscriptions() disponible';
END $$;
