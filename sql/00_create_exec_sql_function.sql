-- =====================================================
-- FUNCIÓN EXEC_SQL PARA EJECUTAR SQL DINÁMICO
-- =====================================================
-- Esta función permite ejecutar SQL dinámico desde el cliente
-- IMPORTANTE: Solo debe usarse en entornos de desarrollo

CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Ejecutar el SQL dinámico
  EXECUTE sql;

  -- Retornar resultado exitoso
  RETURN json_build_object('success', true, 'message', 'SQL executed successfully');
EXCEPTION
  WHEN OTHERS THEN
    -- Retornar error
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO anon;