-- =====================================================
-- SCRIPT DE VALIDACIÓN DE TRACKING
-- Ejecutar en Supabase SQL Editor para verificar datos
-- =====================================================

-- 1️⃣ VERIFICAR QUE LAS TABLAS EXISTEN
-- =====================================================
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'property_likes', 
      'property_views', 
      'property_contacts', 
      'page_analytics', 
      'advisor_interactions'
    ) THEN '✅ Existe'
    ELSE '❌ No existe'
  END as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'property_likes', 
    'property_views', 
    'property_contacts', 
    'page_analytics', 
    'advisor_interactions'
  )
ORDER BY table_name;

-- 2️⃣ CONTAR REGISTROS EN CADA TABLA
-- =====================================================
SELECT 'property_likes' as tabla, COUNT(*) as total_registros FROM property_likes
UNION ALL
SELECT 'property_views' as tabla, COUNT(*) as total_registros FROM property_views
UNION ALL
SELECT 'property_contacts' as tabla, COUNT(*) as total_registros FROM property_contacts
UNION ALL
SELECT 'page_analytics' as tabla, COUNT(*) as total_registros FROM page_analytics
UNION ALL
SELECT 'advisor_interactions' as tabla, COUNT(*) as total_registros FROM advisor_interactions
ORDER BY tabla;

-- 3️⃣ VER ÚLTIMAS 10 VISTAS REGISTRADAS
-- =====================================================
SELECT 
  id,
  property_id,
  session_id,
  view_duration as "duración_segundos",
  device_type as dispositivo,
  referrer,
  created_at as fecha_hora
FROM property_views
ORDER BY created_at DESC
LIMIT 10;

-- 4️⃣ VER ÚLTIMOS 10 LIKES REGISTRADOS
-- =====================================================
SELECT 
  id,
  property_id,
  session_id,
  created_at as fecha_hora
FROM property_likes
ORDER BY created_at DESC
LIMIT 10;

-- 5️⃣ VER ÚLTIMOS 10 CONTACTOS REGISTRADOS
-- =====================================================
SELECT 
  id,
  property_id,
  contact_type as tipo_contacto,
  name as nombre,
  email,
  phone as teléfono,
  created_at as fecha_hora
FROM property_contacts
ORDER BY created_at DESC
LIMIT 10;

-- 6️⃣ VERIFICAR POLÍTICAS RLS (Row Level Security)
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN cmd = 'INSERT' THEN '✅ INSERT permitido'
    WHEN cmd = 'SELECT' THEN '🔒 SELECT restringido'
    ELSE cmd
  END as comando,
  CASE 
    WHEN qual::text LIKE '%true%' THEN '✅ Público'
    WHEN qual::text LIKE '%admin%' THEN '🔒 Solo Admin'
    ELSE 'Otro'
  END as acceso
FROM pg_policies
WHERE tablename IN ('property_likes', 'property_views', 'property_contacts')
ORDER BY tablename, cmd;

-- 7️⃣ ESTADÍSTICAS POR PROPIEDAD (Top 10)
-- =====================================================
SELECT 
  p.id as property_id,
  p.title as título,
  p.code as código,
  COUNT(DISTINCT pl.id) as total_likes,
  COUNT(DISTINCT pv.id) as total_vistas,
  COUNT(DISTINCT pc.id) as total_contactos,
  (COUNT(DISTINCT pl.id) * 3 + 
   COUNT(DISTINCT pv.id) * 1 + 
   COUNT(DISTINCT pc.id) * 5) as popularity_score
FROM properties p
LEFT JOIN property_likes pl ON p.id = pl.property_id
LEFT JOIN property_views pv ON p.id = pv.property_id
LEFT JOIN property_contacts pc ON p.id = pc.property_id
GROUP BY p.id, p.title, p.code
ORDER BY popularity_score DESC
LIMIT 10;

-- 8️⃣ ACTIVIDAD POR DÍA (Últimos 7 días)
-- =====================================================
SELECT 
  DATE(created_at) as fecha,
  COUNT(*) as total_vistas,
  COUNT(DISTINCT session_id) as visitantes_únicos
FROM property_views
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY fecha DESC;

-- 9️⃣ DURACIÓN PROMEDIO DE VISTAS
-- =====================================================
SELECT 
  AVG(view_duration) as promedio_segundos,
  MIN(view_duration) as mínimo_segundos,
  MAX(view_duration) as máximo_segundos,
  COUNT(*) as total_vistas
FROM property_views
WHERE view_duration IS NOT NULL;

-- 🔟 DISTRIBUCIÓN POR TIPO DE DISPOSITIVO
-- =====================================================
SELECT 
  device_type as dispositivo,
  COUNT(*) as total_vistas,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
FROM property_views
WHERE device_type IS NOT NULL
GROUP BY device_type
ORDER BY total_vistas DESC;

-- 1️⃣1️⃣ VERIFICAR VISTA property_stats
-- =====================================================
SELECT * FROM property_stats
ORDER BY popularity_score DESC
LIMIT 5;

-- 1️⃣2️⃣ VERIFICAR FUNCIÓN get_top_properties
-- =====================================================
SELECT * FROM get_top_properties(10, 30);

-- 1️⃣3️⃣ SESIONES ACTIVAS (Sessions IDs únicos)
-- =====================================================
SELECT 
  COUNT(DISTINCT session_id) as total_sesiones_únicas,
  COUNT(*) as total_interacciones
FROM (
  SELECT session_id FROM property_likes
  UNION ALL
  SELECT session_id FROM property_views
  UNION ALL
  SELECT session_id FROM property_contacts
) as todas_sesiones;

-- 1️⃣4️⃣ CONTACTOS POR TIPO
-- =====================================================
SELECT 
  contact_type as tipo,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
FROM property_contacts
GROUP BY contact_type
ORDER BY total DESC;

-- 1️⃣5️⃣ PROPIEDADES SIN INTERACCIONES
-- =====================================================
SELECT 
  p.id,
  p.title as título,
  p.code as código,
  p.status as estado
FROM properties p
LEFT JOIN property_likes pl ON p.id = pl.property_id
LEFT JOIN property_views pv ON p.id = pv.property_id
LEFT JOIN property_contacts pc ON p.id = pc.property_id
WHERE pl.id IS NULL 
  AND pv.id IS NULL 
  AND pc.id IS NULL
ORDER BY p.created_at DESC
LIMIT 10;

-- =====================================================
-- DIAGNÓSTICO RÁPIDO
-- =====================================================
-- Ejecutar esto primero para ver el estado general:

SELECT 
  '📊 Estado General del Sistema de Analytics' as título;

SELECT 
  'Tablas' as categoría,
  COUNT(*) as cantidad,
  '5 esperadas' as esperado
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'property_likes', 
    'property_views', 
    'property_contacts', 
    'page_analytics', 
    'advisor_interactions'
  )
UNION ALL
SELECT 
  'Políticas RLS' as categoría,
  COUNT(*) as cantidad,
  '8+ esperadas' as esperado
FROM pg_policies
WHERE tablename IN ('property_likes', 'property_views', 'property_contacts')
UNION ALL
SELECT 
  'Total Vistas' as categoría,
  COUNT(*) as cantidad,
  'Debería tener datos' as esperado
FROM property_views
UNION ALL
SELECT 
  'Total Likes' as categoría,
  COUNT(*) as cantidad,
  'Debería tener datos' as esperado
FROM property_likes
UNION ALL
SELECT 
  'Total Contactos' as categoría,
  COUNT(*) as cantidad,
  'Debería tener datos' as esperado
FROM property_contacts;

-- =====================================================
-- INSERCIÓN DE PRUEBA (Opcional - solo para testing)
-- =====================================================
/*
-- Descomenta para crear datos de prueba:

-- Obtener un property_id válido
SELECT id FROM properties LIMIT 1;

-- Insertar vista de prueba (reemplaza 1 con un ID real)
INSERT INTO property_views (property_id, session_id, view_duration, device_type, referrer)
VALUES (1, 'test_session_123', 30, 'desktop', 'direct');

-- Insertar like de prueba
INSERT INTO property_likes (property_id, session_id)
VALUES (1, 'test_session_123');

-- Insertar contacto de prueba
INSERT INTO property_contacts (property_id, contact_type, name, email, phone, session_id)
VALUES (1, 'whatsapp', 'Test User', 'test@test.com', '3001234567', 'test_session_123');

-- Verificar inserciones
SELECT 'Vistas' as tipo, COUNT(*) FROM property_views WHERE session_id = 'test_session_123'
UNION ALL
SELECT 'Likes' as tipo, COUNT(*) FROM property_likes WHERE session_id = 'test_session_123'
UNION ALL
SELECT 'Contactos' as tipo, COUNT(*) FROM property_contacts WHERE session_id = 'test_session_123';
*/
