-- =====================================================
-- SISTEMA DE ANALYTICS Y REPORTES
-- Tablas para gestionar likes, vistas, contactos y reportes
-- =====================================================

-- Limpiar objetos existentes si es necesario
DROP TABLE IF EXISTS property_stats CASCADE;
DROP TABLE IF EXISTS daily_analytics CASCADE;

-- 1. TABLA: property_likes (Me gusta en propiedades)
-- Registra cada "like" que un usuario da a una propiedad
CREATE TABLE IF NOT EXISTS property_likes (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Si está autenticado
  session_id TEXT NOT NULL, -- ID de sesión anónima (localStorage)
  ip_address TEXT, -- IP del usuario (opcional)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Evitar likes duplicados por sesión
  UNIQUE(property_id, session_id)
);

-- Índices para optimizar consultas
CREATE INDEX idx_property_likes_property ON property_likes(property_id);
CREATE INDEX idx_property_likes_session ON property_likes(session_id);
CREATE INDEX idx_property_likes_created ON property_likes(created_at);

-- 2. TABLA: property_views (Vistas de propiedades)
-- Registra cada vez que alguien ve el detalle de una propiedad
CREATE TABLE IF NOT EXISTS property_views (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  ip_address TEXT,
  view_duration INTEGER, -- Segundos que estuvo viendo
  referrer TEXT, -- De dónde vino (google, facebook, directo, etc)
  device_type TEXT, -- mobile, desktop, tablet
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_property_views_property ON property_views(property_id);
CREATE INDEX idx_property_views_created ON property_views(created_at);
CREATE INDEX idx_property_views_session ON property_views(session_id);

-- 3. TABLA: property_contacts (Contactos por propiedad)
-- Registra cuando alguien contacta por una propiedad específica
CREATE TABLE IF NOT EXISTS property_contacts (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL, -- 'whatsapp', 'email', 'phone', 'schedule'
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_property_contacts_property ON property_contacts(property_id);
CREATE INDEX idx_property_contacts_type ON property_contacts(contact_type);
CREATE INDEX idx_property_contacts_created ON property_contacts(created_at);

-- 4. TABLA: page_analytics (Analytics generales de páginas)
-- Para rastrear visitas a diferentes secciones del sitio
CREATE TABLE IF NOT EXISTS page_analytics (
  id BIGSERIAL PRIMARY KEY,
  page_path TEXT NOT NULL, -- '/properties', '/contact', '/advisors', etc
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visit_duration INTEGER, -- Segundos en la página
  device_type TEXT,
  referrer TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_page_analytics_path ON page_analytics(page_path);
CREATE INDEX idx_page_analytics_created ON page_analytics(created_at);

-- 5. TABLA: advisor_interactions (Interacciones con asesores)
-- Rastrear contactos específicos con asesores
CREATE TABLE IF NOT EXISTS advisor_interactions (
  id BIGSERIAL PRIMARY KEY,
  advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'profile_view', 'whatsapp', 'email', 'phone'
  property_id BIGINT REFERENCES properties(id) ON DELETE SET NULL, -- Si contactó por una propiedad
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_advisor_interactions_advisor ON advisor_interactions(advisor_id);
CREATE INDEX idx_advisor_interactions_type ON advisor_interactions(interaction_type);
CREATE INDEX idx_advisor_interactions_created ON advisor_interactions(created_at);

-- 6. VISTA: property_stats (Vista consolidada de estadísticas)
-- Combina likes, vistas y contactos por propiedad
CREATE OR REPLACE VIEW property_stats AS
SELECT 
  p.id,
  p.title,
  p.code,
  p.status,
  p.location,
  p.price,
  p.featured,
  COALESCE(likes.count, 0) AS total_likes,
  COALESCE(views.count, 0) AS total_views,
  COALESCE(contacts.count, 0) AS total_contacts,
  COALESCE(views.unique_sessions, 0) AS unique_visitors,
  -- Calcular score de popularidad
  (COALESCE(likes.count, 0) * 3 + 
   COALESCE(views.count, 0) * 1 + 
   COALESCE(contacts.count, 0) * 5) AS popularity_score
FROM properties p
LEFT JOIN (
  SELECT property_id, COUNT(*) as count
  FROM property_likes
  GROUP BY property_id
) likes ON p.id = likes.property_id
LEFT JOIN (
  SELECT property_id, COUNT(*) as count, COUNT(DISTINCT session_id) as unique_sessions
  FROM property_views
  GROUP BY property_id
) views ON p.id = views.property_id
LEFT JOIN (
  SELECT property_id, COUNT(*) as count
  FROM property_contacts
  GROUP BY property_id
) contacts ON p.id = contacts.property_id;

-- 7. VISTA: daily_analytics (Analíticas diarias)
CREATE OR REPLACE VIEW daily_analytics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_interactions,
  COUNT(DISTINCT session_id) as unique_visitors,
  'likes' as type
FROM property_likes
GROUP BY DATE(created_at)
UNION ALL
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_interactions,
  COUNT(DISTINCT session_id) as unique_visitors,
  'views' as type
FROM property_views
GROUP BY DATE(created_at)
UNION ALL
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_interactions,
  COUNT(DISTINCT session_id) as unique_visitors,
  'contacts' as type
FROM property_contacts
GROUP BY DATE(created_at);

-- 8. FUNCIÓN: Obtener propiedades más populares
CREATE OR REPLACE FUNCTION get_top_properties(
  limit_count INTEGER DEFAULT 10,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  property_id BIGINT,
  title TEXT,
  code TEXT,
  total_likes BIGINT,
  total_views BIGINT,
  total_contacts BIGINT,
  popularity_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.code,
    COUNT(DISTINCT pl.id) AS total_likes,
    COUNT(DISTINCT pv.id) AS total_views,
    COUNT(DISTINCT pc.id) AS total_contacts,
    (COUNT(DISTINCT pl.id) * 3 + 
     COUNT(DISTINCT pv.id) * 1 + 
     COUNT(DISTINCT pc.id) * 5)::NUMERIC AS popularity_score
  FROM properties p
  LEFT JOIN property_likes pl ON p.id = pl.property_id 
    AND pl.created_at >= NOW() - (days_back || ' days')::INTERVAL
  LEFT JOIN property_views pv ON p.id = pv.property_id 
    AND pv.created_at >= NOW() - (days_back || ' days')::INTERVAL
  LEFT JOIN property_contacts pc ON p.id = pc.property_id 
    AND pc.created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY p.id, p.title, p.code
  ORDER BY popularity_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 9. Políticas RLS (Row Level Security)
-- Permitir inserciones públicas pero lecturas solo admin
ALTER TABLE property_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_interactions ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede insertar (registrar interacciones)
CREATE POLICY "Anyone can insert likes" ON property_likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert views" ON property_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert contacts" ON property_contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert page analytics" ON page_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert advisor interactions" ON advisor_interactions
  FOR INSERT WITH CHECK (true);

-- Política: Solo admins pueden leer
CREATE POLICY "Only admins can read likes" ON property_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND email IN (
        SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Only admins can read views" ON property_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND email IN (
        SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

CREATE POLICY "Only admins can read contacts" ON property_contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND email IN (
        SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

-- Política: Permitir lectura pública de sus propios likes (por session_id)
CREATE POLICY "Users can read their own likes" ON property_likes
  FOR SELECT USING (true); -- Filtraremos por session_id en el cliente

-- =====================================================
-- COMENTARIOS Y NOTAS
-- =====================================================

COMMENT ON TABLE property_likes IS 'Registra los "me gusta" de propiedades por sesión';
COMMENT ON TABLE property_views IS 'Registra las visualizaciones de detalles de propiedades';
COMMENT ON TABLE property_contacts IS 'Registra los contactos realizados por propiedad';
COMMENT ON TABLE page_analytics IS 'Analytics generales de navegación por el sitio';
COMMENT ON TABLE advisor_interactions IS 'Interacciones con perfiles de asesores';

-- =====================================================
-- DATOS DE PRUEBA (Opcional - comentar en producción)
-- =====================================================

-- Descomentar para insertar datos de prueba
-- INSERT INTO property_likes (property_id, session_id) 
-- SELECT id, 'test-session-' || floor(random() * 100)::text 
-- FROM properties LIMIT 20;
