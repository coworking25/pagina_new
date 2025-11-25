-- =====================================================
-- CORRECCIÓN COMPLETA PARA LOS ERRORES DE SUPABASE
-- =====================================================

-- PASO 1: Eliminar la vista property_stats (es una vista, no tabla)
DROP VIEW IF EXISTS property_stats CASCADE;

-- PASO 2: Eliminar la función existente get_top_properties
DROP FUNCTION IF EXISTS get_top_properties(INTEGER, INTEGER);

-- PASO 3: Crear la función corregida con code VARCHAR
CREATE OR REPLACE FUNCTION get_top_properties(
  limit_count INTEGER DEFAULT 10,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  property_id BIGINT,
  title TEXT,
  code VARCHAR,  -- Corregido: era TEXT, ahora VARCHAR
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

-- PASO 4: Verificar que funciona
SELECT * FROM get_top_properties(5, 30);