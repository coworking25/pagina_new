-- ===================================================================
-- PASO 1: VER ESTRUCTURA REAL DE LA TABLA ADVISORS
-- ===================================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'advisors'
ORDER BY ordinal_position;

-- ===================================================================
-- PASO 2: VER ADVISORS ACTUALES
-- ===================================================================

SELECT * FROM advisors;

-- ===================================================================
-- PASO 3: ELIMINAR ADMIN NO FUNCIONAL
-- ===================================================================

-- Eliminar admincoworkin@inmobiliaria.com
DELETE FROM advisors 
WHERE email = 'admincoworkin@inmobiliaria.com';

-- ===================================================================
-- PASO 4: VERIFICAR QUE DIEGOADMIN ESTÉ CORRECTO
-- ===================================================================

SELECT 
  'Admin Principal:' as info,
  *
FROM advisors 
WHERE email = 'diegoadmin@gmail.com';

-- ===================================================================
-- RESULTADO ESPERADO
-- ===================================================================

/*
Después de ejecutar este script sabremos:
1. Qué columnas tiene realmente la tabla advisors
2. Qué usuarios existen actualmente
3. Se eliminará el admin no funcional
4. Veremos el admin principal (Diego)

Con esta información, ajustaremos el script de configuración.
*/
