-- =====================================================
-- CREAR TABLAS DE ANALYTICS
-- Ejecutar este script en el SQL Editor de Supabase
-- =====================================================

-- 1. TABLA: property_likes
CREATE TABLE IF NOT EXISTS property_likes (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(property_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_property_likes_property ON property_likes(property_id);
CREATE INDEX IF NOT EXISTS idx_property_likes_session ON property_likes(session_id);
CREATE INDEX IF NOT EXISTS idx_property_likes_created ON property_likes(created_at);

-- 2. TABLA: property_views
CREATE TABLE IF NOT EXISTS property_views (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  ip_address TEXT,
  view_duration INTEGER,
  referrer TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_views_property ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_created ON property_views(created_at);
CREATE INDEX IF NOT EXISTS idx_property_views_session ON property_views(session_id);

-- 3. TABLA: property_contacts
CREATE TABLE IF NOT EXISTS property_contacts (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL,
  session_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_contacts_property ON property_contacts(property_id);
CREATE INDEX IF NOT EXISTS idx_property_contacts_created ON property_contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_property_contacts_type ON property_contacts(contact_type);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE property_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_contacts ENABLE ROW LEVEL SECURITY;

-- PROPERTY_LIKES: Permitir lectura pública y escritura pública
DROP POLICY IF EXISTS "Permitir lectura pública de likes" ON property_likes;
CREATE POLICY "Permitir lectura pública de likes" 
  ON property_likes FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Permitir inserción pública de likes" ON property_likes;
CREATE POLICY "Permitir inserción pública de likes" 
  ON property_likes FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir eliminación de likes por sesión" ON property_likes;
CREATE POLICY "Permitir eliminación de likes por sesión" 
  ON property_likes FOR DELETE 
  USING (true);

-- PROPERTY_VIEWS: Permitir lectura pública y escritura pública
DROP POLICY IF EXISTS "Permitir lectura pública de vistas" ON property_views;
CREATE POLICY "Permitir lectura pública de vistas" 
  ON property_views FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Permitir inserción pública de vistas" ON property_views;
CREATE POLICY "Permitir inserción pública de vistas" 
  ON property_views FOR INSERT 
  WITH CHECK (true);

-- PROPERTY_CONTACTS: Permitir lectura pública y escritura pública
DROP POLICY IF EXISTS "Permitir lectura pública de contactos" ON property_contacts;
CREATE POLICY "Permitir lectura pública de contactos" 
  ON property_contacts FOR SELECT 
  USING (true);
 
DROP POLICY IF EXISTS "Permitir inserción pública de contactos" ON property_contacts;
CREATE POLICY "Permitir inserción pública de contactos" 
  ON property_contacts FOR INSERT 
  WITH CHECK (true);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que las tablas se crearon
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('property_likes', 'property_views', 'property_contacts')
ORDER BY table_name;

-- Verificar políticas RLS
SELECT 
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN ('property_likes', 'property_views', 'property_contacts')
ORDER BY tablename, policyname;

-- Mostrar conteo inicial (debería ser 0)
SELECT 
  'property_likes' as tabla,
  COUNT(*) as registros
FROM property_likes
UNION ALL
SELECT 
  'property_views' as tabla,
  COUNT(*) as registros
FROM property_views
UNION ALL
SELECT 
  'property_contacts' as tabla,
  COUNT(*) as registros
FROM property_contacts;
