# 🔍 Validación Rápida de Analytics en Supabase

## ⚡ Query Super Rápida (Copia y Pega)

Ejecuta esto primero para ver el estado general:

```sql
-- DIAGNÓSTICO COMPLETO EN 1 QUERY
SELECT '📊 ESTADO GENERAL' as "═══════════════════";

SELECT 'Tablas Creadas' as verificación, COUNT(*) as cantidad, 
       CASE WHEN COUNT(*) = 5 THEN '✅ OK' ELSE '❌ Falta alguna' END as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('property_likes', 'property_views', 'property_contacts', 'page_analytics', 'advisor_interactions')
UNION ALL
SELECT 'Total Vistas' as verificación, COUNT(*) as cantidad,
       CASE WHEN COUNT(*) > 0 THEN '✅ Hay datos' ELSE '⚠️ Sin datos' END as estado
FROM property_views
UNION ALL
SELECT 'Total Likes' as verificación, COUNT(*) as cantidad,
       CASE WHEN COUNT(*) > 0 THEN '✅ Hay datos' ELSE '⚠️ Sin datos' END as estado
FROM property_likes
UNION ALL
SELECT 'Total Contactos' as verificación, COUNT(*) as cantidad,
       CASE WHEN COUNT(*) > 0 THEN '✅ Hay datos' ELSE '⚠️ Sin datos' END as estado
FROM property_contacts
UNION ALL
SELECT 'Sesiones Únicas' as verificación, COUNT(DISTINCT session_id) as cantidad,
       CASE WHEN COUNT(DISTINCT session_id) > 0 THEN '✅ OK' ELSE '⚠️ Sin datos' END as estado
FROM (
  SELECT session_id FROM property_views
  UNION ALL SELECT session_id FROM property_likes
  UNION ALL SELECT session_id FROM property_contacts
) as s;
```

---

## 📋 Checklist Paso a Paso

### ✅ PASO 1: Verificar Tablas (30 segundos)
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'property_%' 
  OR table_name IN ('page_analytics', 'advisor_interactions')
ORDER BY table_name;
```
**Esperado**: 6-7 tablas (properties + analytics)

---

### ✅ PASO 2: Contar Registros (15 segundos)
```sql
SELECT 'Vistas' as tipo, COUNT(*) as total FROM property_views
UNION ALL
SELECT 'Likes', COUNT(*) FROM property_likes
UNION ALL
SELECT 'Contactos', COUNT(*) FROM property_contacts;
```
**Si total = 0**: Necesitas generar datos (usa la web o INSERT_DATOS_PRUEBA.sql)

---

### ✅ PASO 3: Ver Última Actividad (10 segundos)
```sql
SELECT 
  'Vista' as tipo,
  property_id,
  session_id,
  created_at
FROM property_views
ORDER BY created_at DESC
LIMIT 3
UNION ALL
SELECT 
  'Like' as tipo,
  property_id,
  session_id,
  created_at
FROM property_likes
ORDER BY created_at DESC
LIMIT 3;
```
**Esperado**: Ver actividad reciente

---

### ✅ PASO 4: Verificar Conversión de Tipos (CRÍTICO)
```sql
SELECT 
  table_name,
  column_name,
  data_type,
  CASE 
    WHEN data_type = 'bigint' THEN '✅ Correcto'
    ELSE '❌ ERROR - debe ser bigint'
  END as estado
FROM information_schema.columns 
WHERE table_name IN ('property_views', 'property_likes', 'property_contacts')
  AND column_name = 'property_id';
```
**DEBE mostrar**: bigint para todas las tablas

---

### ✅ PASO 5: Top Propiedades (20 segundos)
```sql
SELECT 
  p.id,
  p.title,
  COUNT(DISTINCT pv.id) as vistas,
  COUNT(DISTINCT pl.id) as likes,
  COUNT(DISTINCT pc.id) as contactos
FROM properties p
LEFT JOIN property_views pv ON p.id = pv.property_id
LEFT JOIN property_likes pl ON p.id = pl.property_id
LEFT JOIN property_contacts pc ON p.id = pc.property_id
GROUP BY p.id, p.title
HAVING COUNT(DISTINCT pv.id) > 0 OR COUNT(DISTINCT pl.id) > 0
ORDER BY (COUNT(DISTINCT pl.id) * 3 + COUNT(DISTINCT pv.id)) DESC
LIMIT 5;
```
**Esperado**: Ver propiedades con interacciones

---

## 🚨 Troubleshooting Rápido

### ❌ Error: "permission denied"
```sql
-- Verificar RLS
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('property_views', 'property_likes', 'property_contacts');
```
**Solución**: Re-ejecutar sección de políticas de CREATE_ANALYTICS_TABLES.sql

---

### ❌ Error: "relation does not exist"
```sql
-- Verificar vistas y funciones
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE '%property%';
```
**Solución**: Re-ejecutar CREATE_ANALYTICS_TABLES.sql completo

---

### ⚠️ Sin datos pero el sitio está funcionando
```sql
-- Ver si hay errores de inserción (verificar tipo de dato)
SELECT 
  schemaname,
  tablename,
  attname,
  atttypid::regtype
FROM pg_stats
WHERE tablename IN ('property_views', 'property_likes')
  AND attname = 'property_id';
```

---

## 🎯 Insertar 1 Dato de Prueba Rápido

```sql
-- 1. Obtener un property_id válido
SELECT id FROM properties LIMIT 1;

-- 2. Insertar vista de prueba (reemplaza 1 con el ID que obtuviste)
INSERT INTO property_views (property_id, session_id, view_duration, device_type)
VALUES (1, 'test_quick', 30, 'desktop');

-- 3. Verificar
SELECT * FROM property_views WHERE session_id = 'test_quick';
```

---

## 📊 Dashboard Analytics Query

Para verificar lo que ve el dashboard:

```sql
-- Simular query del dashboard
SELECT 
  COUNT(DISTINCT pl.id) as total_likes,
  COUNT(DISTINCT pv.id) as total_views,
  COUNT(DISTINCT pc.id) as total_contacts,
  COUNT(DISTINCT pv.session_id) as unique_visitors
FROM properties p
LEFT JOIN property_likes pl ON p.id = pl.property_id 
  AND pl.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN property_views pv ON p.id = pv.property_id 
  AND pv.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN property_contacts pc ON p.id = pc.property_id 
  AND pc.created_at >= NOW() - INTERVAL '30 days';
```

---

## ✅ Todo OK - Query de Celebración

```sql
SELECT 
  '🎉 SISTEMA DE ANALYTICS FUNCIONANDO CORRECTAMENTE 🎉' as estado,
  COUNT(DISTINCT pv.id) as "Total Vistas ✅",
  COUNT(DISTINCT pl.id) as "Total Likes ✅",
  COUNT(DISTINCT pc.id) as "Total Contactos ✅"
FROM properties p
LEFT JOIN property_views pv ON p.id = pv.property_id
LEFT JOIN property_likes pl ON p.id = pl.property_id
LEFT JOIN property_contacts pc ON p.id = pc.property_id;
```

---

## 📞 Próximos Pasos

### Si TODO está OK ✅:
1. Cerrar Supabase
2. Ir a http://localhost:5174
3. Usar la web normalmente
4. Los datos se acumularán automáticamente

### Si FALTA algo ⚠️:
1. Ejecutar: `INSERT_DATOS_PRUEBA.sql`
2. Verificar de nuevo
3. Ir al dashboard y refrescar

### Si hay ERRORES ❌:
1. Leer el mensaje de error completo
2. Verificar tipo de dato property_id (debe ser bigint)
3. Re-ejecutar CREATE_ANALYTICS_TABLES.sql
4. Verificar que parseInt() esté en analytics.ts

---

**Tiempo total de validación: ~3 minutos** ⏱️
