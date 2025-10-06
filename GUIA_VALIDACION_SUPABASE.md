# 🔍 Guía de Validación de Datos en Supabase

## 📋 Checklist de Validación

Sigue estos pasos en orden para validar que el sistema de tracking esté funcionando correctamente.

---

## 🚀 PASO 1: Acceder a Supabase

1. **Abrir navegador**
2. **Ir a**: https://supabase.com/dashboard
3. **Login** con tu cuenta
4. **Seleccionar** tu proyecto de Coworking

---

## 📊 PASO 2: Verificar Tablas

### **Método Visual (Table Editor)**

1. En el menú izquierdo → **Table Editor**
2. Deberías ver estas tablas:
   - ✅ `properties`
   - ✅ `property_likes`
   - ✅ `property_views`
   - ✅ `property_contacts`
   - ✅ `page_analytics`
   - ✅ `advisor_interactions`

### **Método SQL (Recomendado)**

1. En el menú izquierdo → **SQL Editor**
2. Click **+ New Query**
3. Pega este código:

```sql
-- Verificar que todas las tablas existen
SELECT table_name
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
```

4. Click **Run** (o Ctrl+Enter)
5. **Resultado esperado**: 5 filas

**✅ Si ves 5 tablas** → Continúa al siguiente paso  
**❌ Si ves menos de 5** → Ejecuta `CREATE_ANALYTICS_TABLES.sql` primero

---

## 📈 PASO 3: Contar Registros

### **Verificar si hay datos**

```sql
-- Contar registros en cada tabla
SELECT 'property_likes' as tabla, COUNT(*) as total FROM property_likes
UNION ALL
SELECT 'property_views' as tabla, COUNT(*) as total FROM property_views
UNION ALL
SELECT 'property_contacts' as tabla, COUNT(*) as total FROM property_contacts
ORDER BY tabla;
```

**Interpretación**:
- **Total = 0** → No hay datos todavía (normal si acabas de crear las tablas)
- **Total > 0** → ¡Hay datos! El tracking está funcionando

---

## 👁️ PASO 4: Ver Últimas Vistas

```sql
-- Ver las últimas 10 vistas registradas
SELECT 
  id,
  property_id,
  session_id,
  view_duration as "segundos",
  device_type as "dispositivo",
  referrer,
  created_at as "fecha"
FROM property_views
ORDER BY created_at DESC
LIMIT 10;
```

**¿Qué verificar?**
- ✅ `property_id`: debe ser un número (ej: 123)
- ✅ `session_id`: debe tener formato `session_123456789_abc`
- ✅ `view_duration`: segundos que estuvo viendo (ej: 15, 30, 45)
- ✅ `device_type`: desktop, mobile o tablet
- ✅ `referrer`: direct, google.com, etc.
- ✅ `created_at`: fecha reciente

**🧪 Prueba en vivo**:
1. Abre tu sitio: http://localhost:5174
2. Ve a /properties
3. Abre una propiedad (modal)
4. Espera 10 segundos
5. Cierra el modal
6. Ejecuta la query de nuevo
7. **Deberías ver** una nueva fila con la vista que acabas de hacer

---

## ❤️ PASO 5: Ver Últimos Likes

```sql
-- Ver los últimos 10 likes registrados
SELECT 
  id,
  property_id,
  session_id,
  created_at as "fecha"
FROM property_likes
ORDER BY created_at DESC
LIMIT 10;
```

**🧪 Prueba en vivo**:
1. En tu sitio, click en el corazón verde 💚 de una propiedad
2. Ejecuta la query
3. **Deberías ver** un nuevo like
4. Click de nuevo en el corazón (quitar like)
5. Ejecuta la query
6. **El like debería desaparecer**

---

## 📞 PASO 6: Ver Últimos Contactos

```sql
-- Ver los últimos 10 contactos registrados
SELECT 
  id,
  property_id,
  contact_type as "tipo",
  name as "nombre",
  email,
  phone as "teléfono",
  message as "mensaje",
  created_at as "fecha"
FROM property_contacts
ORDER BY created_at DESC
LIMIT 10;
```

**¿Qué verificar?**
- ✅ `contact_type`: debe ser 'whatsapp', 'email', 'phone' o 'schedule'
- ✅ `name`, `email`, `phone`: datos del cliente
- ✅ `message`: mensaje o información de la cita

**🧪 Prueba en vivo**:
1. Abre modal de una propiedad
2. Click "Contactar Asesor"
3. Llena el formulario
4. Click "Enviar por WhatsApp"
5. Ejecuta la query
6. **Deberías ver** el contacto registrado

---

## 🔒 PASO 7: Verificar Políticas RLS

```sql
-- Verificar que las políticas de seguridad existen
SELECT 
  tablename as "tabla",
  policyname as "política",
  cmd as "comando"
FROM pg_policies
WHERE tablename IN ('property_likes', 'property_views', 'property_contacts')
ORDER BY tablename, cmd;
```

**Resultado esperado**:
- **property_likes**:
  - `Anyone can insert likes` (INSERT)
  - `Only admins can read likes` (SELECT)
  - `Users can read their own likes` (SELECT)
- **property_views**:
  - `Anyone can insert views` (INSERT)
  - `Only admins can read views` (SELECT)
- **property_contacts**:
  - `Anyone can insert contacts` (INSERT)
  - `Only admins can read contacts` (SELECT)

**❌ Si falta alguna política**:
```sql
-- Re-ejecutar la sección de políticas del script CREATE_ANALYTICS_TABLES.sql
```

---

## 📊 PASO 8: Ver Estadísticas por Propiedad

```sql
-- Top 10 propiedades más populares
SELECT 
  p.id,
  p.title as "título",
  p.code as "código",
  COUNT(DISTINCT pl.id) as "likes",
  COUNT(DISTINCT pv.id) as "vistas",
  COUNT(DISTINCT pc.id) as "contactos",
  (COUNT(DISTINCT pl.id) * 3 + 
   COUNT(DISTINCT pv.id) * 1 + 
   COUNT(DISTINCT pc.id) * 5) as "score"
FROM properties p
LEFT JOIN property_likes pl ON p.id = pl.property_id
LEFT JOIN property_views pv ON p.id = pv.property_id
LEFT JOIN property_contacts pc ON p.id = pc.property_id
GROUP BY p.id, p.title, p.code
ORDER BY score DESC
LIMIT 10;
```

**¿Qué verificar?**
- ✅ Propiedades con más interacciones aparecen primero
- ✅ Score calculado correctamente: (Likes × 3) + (Vistas × 1) + (Contactos × 5)
- ✅ Números coherentes (likes ≤ vistas generalmente)

---

## 🎯 PASO 9: Verificar Vista Consolidada

```sql
-- Verificar que la vista property_stats funciona
SELECT * FROM property_stats
ORDER BY popularity_score DESC
LIMIT 5;
```

**Resultado esperado**:
- Columnas: id, title, code, status, location, price, total_likes, total_views, total_contacts, unique_visitors, popularity_score
- Datos consolidados de todas las tablas

**❌ Si da error "relation does not exist"**:
```sql
-- Re-ejecutar la creación de la vista desde CREATE_ANALYTICS_TABLES.sql
```

---

## ⚡ PASO 10: Probar Función get_top_properties

```sql
-- Obtener top 10 propiedades de los últimos 30 días
SELECT * FROM get_top_properties(10, 30);
```

**Parámetros**:
- Primer número: cantidad de resultados (10)
- Segundo número: días hacia atrás (30)

**Variaciones**:
```sql
-- Top 5 de los últimos 7 días
SELECT * FROM get_top_properties(5, 7);

-- Top 20 de los últimos 90 días
SELECT * FROM get_top_properties(20, 90);
```

---

## 🧪 PASO 11: Insertar Datos de Prueba (Opcional)

Si no tienes datos todavía, puedes insertar datos de prueba:

```sql
-- 1. Obtener un property_id válido
SELECT id, title FROM properties LIMIT 5;

-- 2. Copiar un ID y reemplazar abajo (ejemplo: 123)

-- Insertar vista de prueba
INSERT INTO property_views (property_id, session_id, view_duration, device_type, referrer)
VALUES (123, 'test_session_001', 45, 'desktop', 'direct');

-- Insertar like de prueba
INSERT INTO property_likes (property_id, session_id)
VALUES (123, 'test_session_001');

-- Insertar contacto de prueba
INSERT INTO property_contacts (
  property_id, 
  contact_type, 
  name, 
  email, 
  phone, 
  message,
  session_id
)
VALUES (
  123, 
  'whatsapp', 
  'Usuario Prueba', 
  'prueba@test.com', 
  '3001234567',
  'Mensaje de prueba',
  'test_session_001'
);

-- 3. Verificar que se insertaron
SELECT 'Vistas' as tipo, COUNT(*) as total FROM property_views WHERE session_id = 'test_session_001'
UNION ALL
SELECT 'Likes', COUNT(*) FROM property_likes WHERE session_id = 'test_session_001'
UNION ALL
SELECT 'Contactos', COUNT(*) FROM property_contacts WHERE session_id = 'test_session_001';
```

---

## 📊 PASO 12: Diagnóstico Rápido

Ejecuta este query para ver un resumen completo:

```sql
-- Resumen del sistema de analytics
SELECT 
  '📊 RESUMEN DEL SISTEMA' as "──────────────────────";

SELECT 
  'Total Vistas' as métrica,
  COUNT(*) as cantidad,
  CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '⚠️ Sin datos' END as estado
FROM property_views
UNION ALL
SELECT 
  'Total Likes' as métrica,
  COUNT(*) as cantidad,
  CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '⚠️ Sin datos' END as estado
FROM property_likes
UNION ALL
SELECT 
  'Total Contactos' as métrica,
  COUNT(*) as cantidad,
  CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE '⚠️ Sin datos' END as estado
FROM property_contacts
UNION ALL
SELECT 
  'Sesiones Únicas' as métrica,
  COUNT(DISTINCT session_id) as cantidad,
  CASE WHEN COUNT(DISTINCT session_id) > 0 THEN '✅ OK' ELSE '⚠️ Sin datos' END as estado
FROM (
  SELECT session_id FROM property_views
  UNION ALL
  SELECT session_id FROM property_likes
  UNION ALL
  SELECT session_id FROM property_contacts
) as sesiones;
```

---

## 🔍 PASO 13: Debugging Avanzado

### **Si no aparecen vistas:**

```sql
-- Verificar estructura de la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'property_views';
```

**Columnas esperadas**:
- id (bigint)
- property_id (bigint) ← **Importante: debe ser bigint**
- user_id (uuid)
- session_id (text)
- ip_address (text)
- view_duration (integer)
- referrer (text)
- device_type (text)
- created_at (timestamp with time zone)

### **Verificar tipo de dato de property_id**:

```sql
SELECT 
  column_name,
  data_type,
  CASE 
    WHEN data_type = 'bigint' THEN '✅ Correcto'
    ELSE '❌ Incorrecto - debería ser bigint'
  END as verificación
FROM information_schema.columns 
WHERE table_name IN ('property_views', 'property_likes', 'property_contacts')
  AND column_name = 'property_id';
```

### **Ver errores recientes (si hay)**:

```sql
-- Ver últimas inserciones intentadas (requiere logging habilitado)
-- Nota: Esto solo funciona si tienes logs habilitados en Supabase
```

---

## ✅ Checklist Final

Marca cada item después de verificarlo:

- [ ] **Tablas creadas**: 5 tablas existen en Supabase
- [ ] **Políticas RLS**: Al menos 5 políticas creadas
- [ ] **property_id tipo BIGINT**: Verificado en las 3 tablas principales
- [ ] **Vista property_stats**: Existe y devuelve datos
- [ ] **Función get_top_properties**: Existe y funciona
- [ ] **Datos de vistas**: Al menos 1 vista registrada
- [ ] **Datos de likes**: Al menos 1 like registrado
- [ ] **Datos de contactos**: Al menos 1 contacto registrado
- [ ] **Session IDs**: Generándose correctamente
- [ ] **Dashboard muestra datos**: Gráficas y contadores actualizados

---

## 🚨 Problemas Comunes

### **Problema 1: "permission denied for table property_views"**

**Causa**: Políticas RLS mal configuradas

**Solución**:
```sql
-- Re-crear políticas
CREATE POLICY "Anyone can insert views" ON property_views
  FOR INSERT WITH CHECK (true);
```

### **Problema 2: "No se insertan datos"**

**Verificar en consola del navegador**:
1. F12 → Console
2. Buscar errores en rojo
3. Si dice "invalid input syntax for type bigint"
   - Problema resuelto con `parseInt()` en analytics.ts

### **Problema 3: "Vista no aparece en dashboard"**

**Verificar**:
1. ¿Hay datos en `property_views`? → Si no, el tracking no funciona
2. ¿El dashboard está consultando correctamente? → Ver consola
3. ¿Las fechas están dentro del rango seleccionado? → Cambiar a "Últimos 90 días"

---

## 📞 Siguiente Paso

Después de validar:

1. **Si todo está OK** ✅:
   - Usa la aplicación normalmente
   - Los datos se irán acumulando
   - El dashboard se actualizará automáticamente

2. **Si faltan datos** ⚠️:
   - Inserta datos de prueba (Paso 11)
   - Prueba manualmente en el sitio
   - Verifica consola del navegador

3. **Si hay errores** ❌:
   - Revisa las políticas RLS
   - Verifica tipos de datos
   - Re-ejecuta CREATE_ANALYTICS_TABLES.sql

---

## 📝 Archivo Complementario

Usa el archivo **`VALIDACION_SUPABASE.sql`** que contiene todas estas queries organizadas y listas para copiar/pegar.

---

**¿Listo para validar?** 🚀

Abre Supabase y ejecuta las queries paso a paso. ¡Avísame qué encuentras!
