-- =====================================================
-- SCRIPT DE DATOS DE PRUEBA PARA ANALYTICS
-- Ejecutar en Supabase para generar datos de ejemplo
-- =====================================================

-- ⚠️ IMPORTANTE: Reemplaza los property_id con IDs reales de tu base de datos

-- 1️⃣ Primero, obtén IDs de propiedades reales
SELECT 
  id, 
  title, 
  code,
  '👆 Copia estos IDs para usar abajo' as nota
FROM properties 
LIMIT 10;

-- =====================================================
-- 2️⃣ INSERTAR VISTAS DE PRUEBA
-- =====================================================
-- Reemplaza los números (1, 2, 3, etc.) con IDs reales

INSERT INTO property_views (property_id, session_id, view_duration, device_type, referrer, created_at)
VALUES
  -- Vista 1: Desktop, 45 segundos
  (1, 'test_session_001', 45, 'desktop', 'direct', NOW() - INTERVAL '1 hour'),
  
  -- Vista 2: Mobile, 30 segundos
  (2, 'test_session_002', 30, 'mobile', 'google.com', NOW() - INTERVAL '2 hours'),
  
  -- Vista 3: Tablet, 60 segundos
  (3, 'test_session_003', 60, 'tablet', 'facebook.com', NOW() - INTERVAL '3 hours'),
  
  -- Vista 4: Desktop, 90 segundos (vista larga)
  (1, 'test_session_004', 90, 'desktop', 'direct', NOW() - INTERVAL '5 hours'),
  
  -- Vista 5: Mobile, 20 segundos (vista corta)
  (2, 'test_session_005', 20, 'mobile', 'instagram.com', NOW() - INTERVAL '1 day'),
  
  -- Vista 6: Desktop, 40 segundos
  (4, 'test_session_001', 40, 'desktop', 'direct', NOW() - INTERVAL '2 days'),
  
  -- Vista 7: Mobile, 35 segundos
  (5, 'test_session_002', 35, 'mobile', 'direct', NOW() - INTERVAL '3 days'),
  
  -- Vista 8: Desktop, 55 segundos
  (1, 'test_session_006', 55, 'desktop', 'google.com', NOW() - INTERVAL '4 days'),
  
  -- Vista 9: Mobile, 25 segundos
  (3, 'test_session_007', 25, 'mobile', 'direct', NOW() - INTERVAL '5 days'),
  
  -- Vista 10: Desktop, 70 segundos
  (2, 'test_session_008', 70, 'desktop', 'direct', NOW() - INTERVAL '6 days');

-- Verificar inserciones
SELECT COUNT(*) as "Total Vistas Insertadas" FROM property_views WHERE session_id LIKE 'test_session_%';

-- =====================================================
-- 3️⃣ INSERTAR LIKES DE PRUEBA
-- =====================================================

INSERT INTO property_likes (property_id, session_id, created_at)
VALUES
  -- Like 1
  (1, 'test_session_001', NOW() - INTERVAL '1 hour'),
  
  -- Like 2
  (1, 'test_session_002', NOW() - INTERVAL '2 hours'),
  
  -- Like 3
  (2, 'test_session_001', NOW() - INTERVAL '3 hours'),
  
  -- Like 4
  (3, 'test_session_003', NOW() - INTERVAL '5 hours'),
  
  -- Like 5
  (1, 'test_session_004', NOW() - INTERVAL '1 day'),
  
  -- Like 6
  (4, 'test_session_005', NOW() - INTERVAL '2 days'),
  
  -- Like 7
  (2, 'test_session_006', NOW() - INTERVAL '3 days'),
  
  -- Like 8
  (5, 'test_session_007', NOW() - INTERVAL '4 days');

-- Verificar inserciones
SELECT COUNT(*) as "Total Likes Insertados" FROM property_likes WHERE session_id LIKE 'test_session_%';

-- =====================================================
-- 4️⃣ INSERTAR CONTACTOS DE PRUEBA
-- =====================================================

INSERT INTO property_contacts (
  property_id, 
  contact_type, 
  name, 
  email, 
  phone, 
  message, 
  session_id, 
  created_at
)
VALUES
  -- Contacto WhatsApp 1
  (1, 'whatsapp', 'Juan Pérez', 'juan@test.com', '3001234567', 
   'Hola, me interesa esta propiedad', 'test_session_001', NOW() - INTERVAL '1 hour'),
  
  -- Contacto WhatsApp 2
  (2, 'whatsapp', 'María García', 'maria@test.com', '3007654321', 
   '¿Está disponible para visita?', 'test_session_002', NOW() - INTERVAL '3 hours'),
  
  -- Contacto Email
  (1, 'email', 'Pedro López', 'pedro@test.com', '3009876543', 
   'Quisiera más información sobre el precio', 'test_session_003', NOW() - INTERVAL '5 hours'),
  
  -- Agendamiento de cita 1
  (3, 'schedule', 'Ana Martínez', 'ana@test.com', '3002468135', 
   'Cita agendada: 2024-10-10 10:00', 'test_session_004', NOW() - INTERVAL '1 day'),
  
  -- Contacto WhatsApp 3
  (4, 'whatsapp', 'Carlos Rodríguez', 'carlos@test.com', '3003691470', 
   'Me gustaría agendar una visita', 'test_session_005', NOW() - INTERVAL '2 days'),
  
  -- Agendamiento de cita 2
  (2, 'schedule', 'Laura Sánchez', 'laura@test.com', '3001357924', 
   'Cita agendada: 2024-10-12 15:00', 'test_session_006', NOW() - INTERVAL '3 days'),
  
  -- Contacto Phone
  (5, 'phone', 'Diego Torres', 'diego@test.com', '3008642097', 
   'Llamar para más detalles', 'test_session_007', NOW() - INTERVAL '4 days');

-- Verificar inserciones
SELECT COUNT(*) as "Total Contactos Insertados" FROM property_contacts WHERE session_id LIKE 'test_session_%';

-- =====================================================
-- 5️⃣ VERIFICACIÓN COMPLETA
-- =====================================================

SELECT 
  '✅ DATOS DE PRUEBA INSERTADOS' as resultado;

-- Resumen por tabla
SELECT 
  'property_views' as tabla,
  COUNT(*) as total_registros,
  COUNT(DISTINCT session_id) as sesiones_únicas
FROM property_views WHERE session_id LIKE 'test_session_%'
UNION ALL
SELECT 
  'property_likes' as tabla,
  COUNT(*) as total_registros,
  COUNT(DISTINCT session_id) as sesiones_únicas
FROM property_likes WHERE session_id LIKE 'test_session_%'
UNION ALL
SELECT 
  'property_contacts' as tabla,
  COUNT(*) as total_registros,
  COUNT(DISTINCT session_id) as sesiones_únicas
FROM property_contacts WHERE session_id LIKE 'test_session_%';

-- Top 5 propiedades con más interacciones (de prueba)
SELECT 
  p.id,
  p.title as título,
  p.code as código,
  COUNT(DISTINCT pl.id) as likes,
  COUNT(DISTINCT pv.id) as vistas,
  COUNT(DISTINCT pc.id) as contactos,
  (COUNT(DISTINCT pl.id) * 3 + 
   COUNT(DISTINCT pv.id) * 1 + 
   COUNT(DISTINCT pc.id) * 5) as popularity_score
FROM properties p
LEFT JOIN property_likes pl ON p.id = pl.property_id AND pl.session_id LIKE 'test_session_%'
LEFT JOIN property_views pv ON p.id = pv.property_id AND pv.session_id LIKE 'test_session_%'
LEFT JOIN property_contacts pc ON p.id = pc.property_id AND pc.session_id LIKE 'test_session_%'
GROUP BY p.id, p.title, p.code
HAVING COUNT(DISTINCT pl.id) > 0 OR COUNT(DISTINCT pv.id) > 0 OR COUNT(DISTINCT pc.id) > 0
ORDER BY popularity_score DESC
LIMIT 5;

-- Actividad por día
SELECT 
  DATE(created_at) as fecha,
  COUNT(*) as total_vistas,
  COUNT(DISTINCT session_id) as sesiones
FROM property_views 
WHERE session_id LIKE 'test_session_%'
GROUP BY DATE(created_at)
ORDER BY fecha DESC;

-- Distribución por tipo de dispositivo
SELECT 
  device_type as dispositivo,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
FROM property_views
WHERE session_id LIKE 'test_session_%'
GROUP BY device_type
ORDER BY total DESC;

-- Contactos por tipo
SELECT 
  contact_type as tipo,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
FROM property_contacts
WHERE session_id LIKE 'test_session_%'
GROUP BY contact_type
ORDER BY total DESC;

-- =====================================================
-- 6️⃣ LIMPIAR DATOS DE PRUEBA (Opcional)
-- =====================================================
/*
-- ⚠️ Descomenta solo si quieres eliminar todos los datos de prueba

DELETE FROM property_views WHERE session_id LIKE 'test_session_%';
DELETE FROM property_likes WHERE session_id LIKE 'test_session_%';
DELETE FROM property_contacts WHERE session_id LIKE 'test_session_%';

SELECT 
  'Datos de prueba eliminados' as resultado,
  'Verifica que las tablas estén limpias' as nota;
*/

-- =====================================================
-- 7️⃣ VERIFICAR FUNCIÓN Y VISTA
-- =====================================================

-- Probar función get_top_properties con datos de prueba
SELECT * FROM get_top_properties(10, 30);

-- Probar vista property_stats
SELECT * FROM property_stats
WHERE popularity_score > 0
ORDER BY popularity_score DESC
LIMIT 10;

-- =====================================================
-- 🎯 INSTRUCCIONES
-- =====================================================
/*

PASOS PARA USAR ESTE SCRIPT:

1. Ejecuta el primer SELECT para obtener IDs reales de propiedades
   
2. Reemplaza los números (1, 2, 3, 4, 5) en las inserciones con IDs reales
   Ejemplo:
   - Si obtienes IDs: 45, 67, 89, 102, 134
   - Reemplaza: 1 → 45, 2 → 67, 3 → 89, etc.

3. Ejecuta las inserciones una por una:
   - Primero property_views
   - Luego property_likes
   - Finalmente property_contacts

4. Ejecuta las verificaciones para confirmar que se insertaron

5. Ir al Dashboard y verificar que las gráficas muestren datos

6. (Opcional) Ejecutar la sección de limpieza para eliminar datos de prueba

NOTAS:
- Los datos usan fechas retrocedidas (NOW() - INTERVAL)
- Esto simula actividad de los últimos 7 días
- Session IDs empiezan con 'test_session_' para fácil identificación
- Puedes modificar cantidades, fechas y valores según necesites

*/
