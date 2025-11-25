-- CORRECCIÓN: Función get_top_properties - Cambiar code de TEXT a VARCHAR
-- Error: "Returned type character varying(20) does not match expected type text in column 3"

-- Primero eliminar la función existente
DROP FUNCTION IF EXISTS get_top_properties(INTEGER, INTEGER);

-- Luego crear la función corregida
CREATE OR REPLACE FUNCTION get_top_properties(
  limit_count INTEGER DEFAULT 10,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  property_id BIGINT,
  title TEXT,
  code VARCHAR,  -- Cambiado de TEXT a VARCHAR para coincidir con la tabla properties
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

-- Verificar que la función funciona correctamente
SELECT * FROM get_top_properties(5, 30);