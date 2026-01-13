-- =============================================================================
-- SISTEMA DE NOTICIAS INMOBILIARIAS - Burbujas Flotantes
-- =============================================================================
-- Base de datos para gestionar noticias dinámicas sobre el mercado inmobiliario
-- de Medellín que se mostrarán como burbujas flotantes en la página web
-- =============================================================================

-- Tabla principal de noticias
CREATE TABLE IF NOT EXISTS real_estate_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contenido de la noticia
  title TEXT NOT NULL,
  summary TEXT NOT NULL, -- Resumen corto para la burbuja
  content TEXT, -- Contenido completo (opcional)
  
  -- Categorización
  category TEXT NOT NULL CHECK (category IN ('market', 'construction', 'economy', 'urbanism', 'legal', 'trends')),
  -- market: Precios, compraventas, tendencias
  -- construction: Nuevos proyectos, desarrollos
  -- economy: Tasas, financiación, economía
  -- urbanism: POT, desarrollo urbano, infraestructura
  -- legal: Regulaciones, leyes, normativas
  -- trends: Tendencias, lifestyle, innovación
  
  -- Configuración visual
  importance INTEGER DEFAULT 3 CHECK (importance >= 1 AND importance <= 5),
  -- 1: Muy pequeño, 2: Pequeño, 3: Medio, 4: Grande, 5: Muy grande
  
  color_override TEXT, -- Color personalizado (opcional, formato hex)
  
  -- Multimedia
  image_url TEXT,
  icon_name TEXT, -- Nombre del icono de lucide-react
  
  -- Fuente y referencias
  source TEXT, -- Nombre de la fuente (ej: "El Colombiano", "La República")
  source_url TEXT, -- URL de la noticia original
  
  -- Ubicación
  location TEXT, -- Zona de Medellín (ej: "El Poblado", "Laureles", "Envigado")
  neighborhood TEXT, -- Barrio específico (opcional)
  
  -- Gestión temporal
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Fecha de expiración (opcional)
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false, -- Destacada (burbuja más grande)
  
  -- Interacción
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Metadatos
  tags TEXT[], -- Tags para búsqueda
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_real_estate_news_category ON real_estate_news(category);
CREATE INDEX IF NOT EXISTS idx_real_estate_news_active ON real_estate_news(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_real_estate_news_published ON real_estate_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_real_estate_news_location ON real_estate_news(location);
CREATE INDEX IF NOT EXISTS idx_real_estate_news_expires ON real_estate_news(expires_at) WHERE expires_at IS NOT NULL;

-- Índice para búsqueda de texto completo
CREATE INDEX IF NOT EXISTS idx_real_estate_news_search 
ON real_estate_news USING gin(to_tsvector('spanish', title || ' ' || summary || ' ' || COALESCE(content, '')));

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_real_estate_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_real_estate_news_updated_at ON real_estate_news;
CREATE TRIGGER trigger_update_real_estate_news_updated_at
  BEFORE UPDATE ON real_estate_news
  FOR EACH ROW
  EXECUTE FUNCTION update_real_estate_news_updated_at();

-- Función para desactivar noticias expiradas automáticamente
CREATE OR REPLACE FUNCTION deactivate_expired_news()
RETURNS void AS $$
BEGIN
  UPDATE real_estate_news
  SET is_active = false
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Vista para noticias activas
CREATE OR REPLACE VIEW active_real_estate_news AS
SELECT 
  id,
  title,
  summary,
  content,
  category,
  importance,
  color_override,
  image_url,
  icon_name,
  source,
  source_url,
  location,
  neighborhood,
  published_at,
  expires_at,
  is_featured,
  views,
  clicks,
  tags
FROM real_estate_news
WHERE is_active = true
  AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY 
  is_featured DESC,
  importance DESC,
  published_at DESC;

-- Políticas RLS (Row Level Security)
ALTER TABLE real_estate_news ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver noticias activas
DROP POLICY IF EXISTS "Active news are viewable by everyone" ON real_estate_news;
CREATE POLICY "Active news are viewable by everyone"
  ON real_estate_news FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Política: Solo usuarios autenticados pueden crear noticias
DROP POLICY IF EXISTS "Authenticated users can create news" ON real_estate_news;
CREATE POLICY "Authenticated users can create news"
  ON real_estate_news FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política: Solo usuarios autenticados pueden actualizar noticias
DROP POLICY IF EXISTS "Authenticated users can update news" ON real_estate_news;
CREATE POLICY "Authenticated users can update news"
  ON real_estate_news FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Política: Solo usuarios autenticados pueden eliminar noticias
DROP POLICY IF EXISTS "Authenticated users can delete news" ON real_estate_news;
CREATE POLICY "Authenticated users can delete news"
  ON real_estate_news FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Función para incrementar vistas
CREATE OR REPLACE FUNCTION increment_news_views(news_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE real_estate_news
  SET views = views + 1
  WHERE id = news_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para incrementar clicks
CREATE OR REPLACE FUNCTION increment_news_clicks(news_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE real_estate_news
  SET clicks = clicks + 1
  WHERE id = news_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- DATOS DE EJEMPLO - Noticias de Medellín
-- =============================================================================

INSERT INTO real_estate_news (title, summary, content, category, importance, location, source, is_featured, tags) VALUES
('Proyectos en El Poblado suben 15%', 'Los nuevos desarrollos inmobiliarios en la zona aumentan su valor', 'El sector de El Poblado continúa siendo uno de los más atractivos para la inversión inmobiliaria en Medellín. Según datos del mercado, los proyectos nuevos han incrementado su valor en un 15% durante el último trimestre.', 'market', 5, 'El Poblado', 'El Colombiano', true, ARRAY['inversión', 'poblado', 'valorización']),

('Tasas de interés bajan al 10.5%', 'Mejores condiciones para créditos hipotecarios', 'El Banco de la República anunció una reducción en las tasas de interés, beneficiando a quienes buscan financiación para compra de vivienda. La tasa promedio para créditos hipotecarios ahora es del 10.5%.', 'economy', 4, 'Medellín', 'La República', true, ARRAY['financiación', 'tasas', 'crédito']),

('Metro impacta precios en zona norte', 'Nuevas estaciones generan plusvalía', 'La extensión del Metro de Medellín hacia el norte de la ciudad ha generado un impacto positivo en los precios de las propiedades cercanas a las nuevas estaciones.', 'urbanism', 4, 'Bello', 'El Tiempo', false, ARRAY['metro', 'infraestructura', 'plusvalía']),

('Nueva ley de arriendos 2026', 'Cambios importantes para propietarios', 'El Congreso aprobó modificaciones a la ley de arrendamientos que entrarán en vigor a partir de marzo 2026, afectando contratos de renta en todo el país.', 'legal', 5, 'Colombia', 'Ámbito Jurídico', true, ARRAY['legislación', 'arriendos', 'regulación']),

('Laureles lidera ventas del mes', 'Sector tradicional mantiene demanda', 'El barrio Laureles se consolida como una de las zonas con mayor número de transacciones inmobiliarias durante enero 2026.', 'market', 3, 'Laureles', 'El Colombiano', false, ARRAY['ventas', 'laureles', 'demanda']),

('Envigado: 8 nuevos proyectos', 'Boom constructivo en el sur del valle', 'El municipio de Envigado prepara el lanzamiento de 8 proyectos residenciales de alto nivel para este año.', 'construction', 4, 'Envigado', 'Construdata', false, ARRAY['construcción', 'envigado', 'proyectos']),

('Smart homes ganan terreno', 'Tecnología en apartamentos nuevos', 'Los apartamentos con automatización y domótica son cada vez más solicitados por compradores jóvenes en Medellín.', 'trends', 3, 'Medellín', 'Revista M&M', false, ARRAY['tecnología', 'innovación', 'smart-home']),

('POT 2026: Nuevas zonas de expansión', 'Plan de Ordenamiento actualizado', 'La alcaldía de Medellín aprobó modificaciones al POT que habilitan nuevas áreas para desarrollo inmobiliario.', 'urbanism', 4, 'Medellín', 'Alcaldía de Medellín', false, ARRAY['POT', 'urbanismo', 'desarrollo']);

-- =============================================================================
-- CONSULTAS ÚTILES
-- =============================================================================

-- Ver todas las noticias activas ordenadas por importancia
-- SELECT * FROM active_real_estate_news LIMIT 10;

-- Ver noticias por categoría
-- SELECT * FROM real_estate_news WHERE category = 'market' AND is_active = true;

-- Ver noticias de una ubicación específica
-- SELECT * FROM real_estate_news WHERE location = 'El Poblado' AND is_active = true;

-- Desactivar noticias expiradas
-- SELECT deactivate_expired_news();

-- Ver estadísticas de interacción
-- SELECT title, views, clicks, (clicks::float / NULLIF(views, 0))::numeric(5,2) as ctr
-- FROM real_estate_news
-- WHERE is_active = true
-- ORDER BY clicks DESC
-- LIMIT 10;

-- Buscar noticias por texto
-- SELECT * FROM real_estate_news
-- WHERE to_tsvector('spanish', title || ' ' || summary) @@ to_tsquery('spanish', 'proyectos & poblado')
-- AND is_active = true;

-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================

SELECT 
  'Tabla creada exitosamente' as status,
  COUNT(*) as total_news,
  COUNT(*) FILTER (WHERE is_active = true) as active_news,
  COUNT(*) FILTER (WHERE is_featured = true) as featured_news,
  COUNT(DISTINCT category) as categories,
  COUNT(DISTINCT location) as locations
FROM real_estate_news;

-- ✅ ¡Sistema de noticias inmobiliarias instalado!
