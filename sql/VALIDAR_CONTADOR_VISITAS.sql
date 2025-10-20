-- =====================================================
-- VALIDACIÓN DEL CONTADOR DE VISITAS
-- Diagnóstico completo del sistema de tracking
-- =====================================================

-- 1. VERIFICAR TABLA property_views
SELECT 
  '📊 TABLA property_views' as "──────────────────────";

SELECT 
  COUNT(*) as "Total Registros",
  COUNT(DISTINCT property_id) as "Propiedades con Vistas",
  COUNT(DISTINCT session_id) as "Sesiones Únicas",
  MIN(created_at) as "Primera Vista",
  MAX(created_at) as "Última Vista"
FROM property_views;

-- 2. VER ÚLTIMAS 10 VISTAS REGISTRADAS
SELECT 
  '📋 ÚLTIMAS VISTAS REGISTRADAS' as "──────────────────────";

SELECT 
  pv.id,
  pv.property_id,
  p.title as "Propiedad",
  p.code as "Código",
  pv.session_id,
  pv.view_duration as "Duración (seg)",
  pv.device_type as "Dispositivo",
  pv.created_at as "Fecha"
FROM property_views pv
LEFT JOIN properties p ON pv.property_id = p.id
ORDER BY pv.created_at DESC
LIMIT 10;

-- 3. CONTEO POR PROPIEDAD
SELECT 
  '📈 VISTAS POR PROPIEDAD' as "──────────────────────";

SELECT 
  p.id,
  p.title as "Propiedad",
  p.code as "Código",
  COUNT(pv.id) as "Total Vistas",
  COUNT(DISTINCT pv.session_id) as "Visitantes Únicos"
FROM properties p
LEFT JOIN property_views pv ON p.id = pv.property_id
GROUP BY p.id, p.title, p.code
HAVING COUNT(pv.id) > 0
ORDER BY COUNT(pv.id) DESC;

-- 4. VERIFICAR POLÍTICAS RLS
SELECT 
  '🔒 POLÍTICAS RLS - property_views' as "──────────────────────";

SELECT 
  policyname as "Política",
  cmd as "Comando",
  qual as "Condición"
FROM pg_policies
WHERE tablename = 'property_views';

-- 5. VERIFICAR ÍNDICES
SELECT 
  '🔍 ÍNDICES - property_views' as "──────────────────────";

SELECT 
  indexname as "Índice",
  indexdef as "Definición"
FROM pg_indexes
WHERE tablename = 'property_views';

-- 6. QUERY DEL DASHBOARD (Simular getDashboardAnalytics)
SELECT 
  '📊 QUERY DEL DASHBOARD' as "──────────────────────";

SELECT 
  COUNT(DISTINCT pl.id) as "Total Likes",
  COUNT(DISTINCT pv.id) as "Total Vistas",
  COUNT(DISTINCT pc.id) as "Total Contactos",
  COUNT(DISTINCT pv.session_id) as "Visitantes Únicos"
FROM properties p
LEFT JOIN property_likes pl ON p.id = pl.property_id 
LEFT JOIN property_views pv ON p.id = pv.property_id 
LEFT JOIN property_contacts pc ON p.id = pc.property_id;

-- 7. VERIFICAR VISTA property_stats
SELECT 
  '📊 VISTA property_stats' as "──────────────────────";

SELECT * FROM property_stats
ORDER BY total_views DESC
LIMIT 10;

-- 8. VISTAS POR DÍA (Últimos 7 días)
SELECT 
  '📅 VISTAS POR DÍA' as "──────────────────────";

SELECT 
  DATE(created_at) as "Fecha",
  COUNT(*) as "Total Vistas",
  COUNT(DISTINCT session_id) as "Visitantes Únicos",
  COUNT(DISTINCT property_id) as "Propiedades Vistas"
FROM property_views
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- 9. VISTAS POR TIPO DE DISPOSITIVO
SELECT 
  '📱 VISTAS POR DISPOSITIVO' as "──────────────────────";

SELECT 
  COALESCE(device_type, 'unknown') as "Dispositivo",
  COUNT(*) as "Total Vistas",
  COUNT(DISTINCT session_id) as "Usuarios Únicos",
  ROUND(AVG(view_duration), 2) as "Duración Promedio (seg)"
FROM property_views
GROUP BY device_type
ORDER BY COUNT(*) DESC;

-- 10. VERIFICAR SI HAY DUPLICADOS
SELECT 
  '⚠️ VERIFICAR DUPLICADOS' as "──────────────────────";

SELECT 
  property_id,
  session_id,
  COUNT(*) as "Veces Registrado"
FROM property_views
GROUP BY property_id, session_id
HAVING COUNT(*) > 5
ORDER BY COUNT(*) DESC
LIMIT 10;

-- 11. TEST DE INSERCIÓN (Para verificar que funciona)
SELECT 
  '🧪 TEST DE INSERCIÓN' as "──────────────────────";

-- Insertar vista de prueba
INSERT INTO property_views (property_id, session_id, device_type, created_at)
VALUES (
  (SELECT id FROM properties LIMIT 1),
  'test_validation_' || NOW()::text,
  'desktop',
  NOW()
)
RETURNING id, property_id, session_id, created_at;

-- Verificar que se insertó
SELECT COUNT(*) as "Total después de test" FROM property_views;

-- Eliminar vista de prueba
DELETE FROM property_views WHERE session_id LIKE 'test_validation_%';

-- 12. COMPARACIÓN CON OTRAS TABLAS
SELECT 
  '📊 COMPARACIÓN DE TABLAS' as "──────────────────────";

SELECT 
  'Vistas' as "Tabla",
  COUNT(*) as "Total Registros",
  COUNT(DISTINCT property_id) as "Propiedades Únicas",
  COUNT(DISTINCT session_id) as "Sesiones Únicas"
FROM property_views
UNION ALL
SELECT 
  'Likes' as "Tabla",
  COUNT(*) as "Total Registros",
  COUNT(DISTINCT property_id) as "Propiedades Únicas",
  COUNT(DISTINCT session_id) as "Sesiones Únicas"
FROM property_likes
UNION ALL
SELECT 
  'Contactos' as "Tabla",
  COUNT(*) as "Total Registros",
  COUNT(DISTINCT property_id) as "Propiedades Únicas",
  COUNT(DISTINCT session_id) as "Sesiones Únicas"
FROM property_contacts;

-- 13. DIAGNÓSTICO FINAL
SELECT 
  '🎯 DIAGNÓSTICO FINAL' as "──────────────────────";

SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM property_views) = 0 THEN 
      '❌ NO HAY VISTAS REGISTRADAS - Necesitas generar tráfico o verificar el tracking'
    WHEN (SELECT COUNT(*) FROM property_views) < 10 THEN 
      '⚠️ POCAS VISTAS - Sistema funcionando pero con poco tráfico'
    ELSE 
      '✅ SISTEMA DE VISTAS FUNCIONANDO CORRECTAMENTE'
  END as "Estado del Sistema",
  (SELECT COUNT(*) FROM property_views) as "Total Vistas",
  (SELECT COUNT(DISTINCT session_id) FROM property_views) as "Sesiones Únicas",
  (SELECT COUNT(*) FROM property_likes) as "Total Likes",
  (SELECT COUNT(*) FROM property_contacts) as "Total Contactos";

-- =====================================================
-- RECOMENDACIONES SEGÚN RESULTADO
-- =====================================================

/*
SI NO HAY VISTAS (Total = 0):
1. Verificar que el código de tracking esté implementado
2. Revisar consola del navegador en /properties
3. Verificar políticas RLS (debe permitir INSERT anónimo)
4. Usar INSERT_DATOS_PRUEBA.sql para generar datos

SI HAY POCAS VISTAS (Total < 10):
1. Navegar por el sitio para generar más datos
2. Abrir varias propiedades
3. Esperar a que se registren las vistas

SI EL DASHBOARD NO MUESTRA LAS VISTAS:
1. Verificar que getDashboardAnalytics() esté bien implementado
2. Revisar la query en src/lib/analytics.ts
3. Verificar que ReportsModal esté cargando los datos
4. Revisar consola del navegador en el dashboard

SIGUIENTE PASO:
Ejecuta esta query y comparte los resultados del "DIAGNÓSTICO FINAL"
*/
