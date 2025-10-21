-- ===================================================================
-- SOLUCIÓN RÁPIDA: AGREGAR TU USUARIO COMO ADVISOR
-- ===================================================================

-- 🎯 EJECUTA ESTO DIRECTAMENTE:

INSERT INTO advisors (
  id,
  full_name,
  email,
  phone,
  active
) VALUES (
  auth.uid(),                    -- Tu ID de usuario actual
  'Admin Principal',              -- ← CAMBIAR POR TU NOMBRE
  auth.jwt() ->> 'email',        -- Tu email (se toma automáticamente)
  '+593999999999',               -- ← CAMBIAR POR TU TELÉFONO
  true
)
ON CONFLICT (id) DO UPDATE SET
  active = true,
  updated_at = NOW();

-- ✅ Después de ejecutar esto, verifica:
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()) 
    THEN '✅ LISTO! Ahora eres advisor y puedes eliminar clientes'
    ELSE '❌ ERROR: Algo salió mal'
  END as resultado;

-- ===================================================================
-- ALTERNATIVA: Si ya existe un advisor, actualiza tu sesión
-- ===================================================================

-- Ver advisors existentes:
SELECT id, full_name, email FROM advisors WHERE active = true;

-- Si ya hay un advisor, copia su email y usa la aplicación
-- con ese email para que auth.uid() coincida con advisors.id
