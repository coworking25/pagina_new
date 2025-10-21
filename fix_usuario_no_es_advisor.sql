-- ===================================================================
-- SOLUCIÓN: AGREGAR USUARIO ACTUAL COMO ADVISOR
-- ===================================================================
-- Fecha: 20 de Octubre, 2025
-- Problema: Usuario no es advisor, por eso no puede eliminar clientes

-- ===================================================================
-- 1. VER EL USUARIO ACTUAL
-- ===================================================================

SELECT 
  '👤 USUARIO ACTUAL' as seccion;

SELECT 
  auth.uid() as user_id,
  auth.jwt() ->> 'email' as email,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ NO AUTENTICADO'
    ELSE '✅ AUTENTICADO'
  END as estado;

-- ===================================================================
-- 2. VERIFICAR SI YA EXISTE EN ADVISORS
-- ===================================================================

SELECT 
  '🔍 VERIFICAR EN ADVISORS' as seccion;

SELECT 
  id,
  full_name,
  email,
  phone,
  created_at
FROM advisors
WHERE id = auth.uid();

-- Si aparece vacío, tu usuario NO está en advisors

-- ===================================================================
-- 3. VER TODOS LOS ADVISORS EXISTENTES
-- ===================================================================

SELECT 
  '👥 ADVISORS EXISTENTES' as seccion;

SELECT 
  id,
  full_name,
  email,
  phone,
  active,
  created_at
FROM advisors
ORDER BY created_at DESC;

-- ===================================================================
-- 4. AGREGAR TU USUARIO COMO ADVISOR
-- ===================================================================

-- OPCIÓN A: Si sabes tu información personal
-- Reemplaza los valores con tu información real

INSERT INTO advisors (
  id,
  full_name,
  email,
  phone,
  active,
  created_at,
  updated_at
) VALUES (
  auth.uid(),
  'Admin Principal', -- ← CAMBIAR POR TU NOMBRE
  auth.jwt() ->> 'email', -- Toma el email automáticamente
  '+1234567890', -- ← CAMBIAR POR TU TELÉFONO
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  active = true,
  updated_at = NOW();

-- ===================================================================
-- OPCIÓN B: Si ya tienes un advisor y quieres usar ese ID
-- ===================================================================

-- Primero, identifica el ID del advisor que quieres usar:
SELECT 
  '🆔 IDs DISPONIBLES' as seccion;

SELECT 
  id,
  full_name,
  email
FROM advisors
WHERE active = true;

-- Luego, OPCIÓN: Actualizar el ID del advisor existente a tu auth.uid()
-- ⚠️ CUIDADO: Esto cambiará el ID del advisor
-- Solo ejecuta si estás seguro

/*
-- NO EJECUTAR sin revisar primero
UPDATE advisors
SET id = auth.uid()
WHERE email = 'tu-email@ejemplo.com'; -- ← CAMBIAR POR EL EMAIL DEL ADVISOR
*/

-- ===================================================================
-- 5. VERIFICACIÓN FINAL
-- ===================================================================

SELECT 
  '✅ VERIFICACIÓN POST-FIX' as seccion;

-- Verificar que ahora SÍ eres advisor
SELECT 
  'Ahora soy advisor?' as pregunta,
  CASE 
    WHEN EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()) THEN '✅ SÍ - LISTO!'
    ELSE '❌ NO - Ejecuta el INSERT de arriba'
  END as respuesta;

-- Ver tu registro en advisors
SELECT 
  '👤 MI REGISTRO EN ADVISORS' as seccion;

SELECT 
  id,
  full_name,
  email,
  phone,
  active,
  created_at
FROM advisors
WHERE id = auth.uid();

-- ===================================================================
-- 6. PROBAR DELETE
-- ===================================================================

-- Ahora intenta eliminar un cliente de prueba desde la aplicación
-- Debería funcionar correctamente

-- ===================================================================
-- INTERPRETACIÓN
-- ===================================================================

/*
DESPUÉS DE EJECUTAR ESTE SCRIPT:

1️⃣ Tu usuario (auth.uid) estará en la tabla advisors
2️⃣ Las políticas RLS permitirán DELETE
3️⃣ Podrás eliminar clientes desde la aplicación
4️⃣ Los clientes eliminados NO volverán a aparecer

INSTRUCCIONES:

PASO 1: Ejecuta la sección 1, 2 y 3 para ver tu información
PASO 2: Copia el resultado de la sección 1 (tu user_id y email)
PASO 3: Modifica el INSERT en la sección 4 con tu información
PASO 4: Ejecuta el INSERT
PASO 5: Ejecuta la sección 5 para verificar
PASO 6: Refresca la aplicación y prueba eliminar un cliente

ALTERNATIVA RÁPIDA:
Si ya existe un advisor en la tabla, puedes usar ese registro.
Solo necesitas que tu auth.uid() coincida con uno de los IDs en advisors.

NOTA IMPORTANTE:
- auth.uid() es el ID de tu sesión de Supabase Auth
- advisors.id debe ser igual a auth.uid() para que RLS permita las operaciones
- Si no coinciden, RLS bloqueará todo (SELECT, INSERT, UPDATE, DELETE)
*/

-- ===================================================================
-- SOLUCIÓN ALTERNATIVA: DESACTIVAR RLS TEMPORALMENTE (NO RECOMENDADO)
-- ===================================================================

-- ⚠️ SOLO EN DESARROLLO / TESTING
-- ⚠️ NO USAR EN PRODUCCIÓN

/*
-- Desactivar RLS en la tabla clients (permite DELETE sin restricciones)
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- Para reactivar:
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Esto es inseguro y solo debe usarse temporalmente
-- para probar si el problema es realmente RLS
*/
