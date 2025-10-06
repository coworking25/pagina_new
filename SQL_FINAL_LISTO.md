# ✅ SQL FINAL CORREGIDO - LISTO PARA EJECUTAR

## 🔧 CORRECCIONES REALIZADAS

### 1. Tipos de ID Corregidos:

| Campo | Tipo Correcto | Razón |
|-------|---------------|-------|
| `properties.id` | `BIGINT` | ✅ Tabla existente usa BIGINT |
| `advisors.id` | `UUID` | ✅ Tabla existente usa UUID |
| `property_likes.property_id` | `BIGINT` | ✅ Referencia a properties |
| `advisor_interactions.advisor_id` | `UUID` | ✅ Referencia a advisors |

### 2. Columnas Corregidas:

| Campo Incorrecto | Campo Correcto | Tabla |
|------------------|----------------|-------|
| `reference` | `code` | properties |
| `sector` | `location` | properties |

---

## ✅ ESTRUCTURA FINAL DE TABLAS

### Tabla: `property_likes`
```sql
id              BIGSERIAL PRIMARY KEY
property_id     BIGINT → properties(id)
user_id         UUID → auth.users(id)
session_id      TEXT
ip_address      TEXT
created_at      TIMESTAMPTZ
```

### Tabla: `property_views`
```sql
id              BIGSERIAL PRIMARY KEY
property_id     BIGINT → properties(id)
session_id      TEXT
view_duration   INTEGER
referrer        TEXT
device_type     TEXT
created_at      TIMESTAMPTZ
```

### Tabla: `property_contacts`
```sql
id              BIGSERIAL PRIMARY KEY
property_id     BIGINT → properties(id)
contact_type    TEXT ('whatsapp', 'email', 'phone', 'schedule')
name            TEXT
email           TEXT
phone           TEXT
message         TEXT
session_id      TEXT
created_at      TIMESTAMPTZ
```

### Tabla: `page_analytics`
```sql
id              BIGSERIAL PRIMARY KEY
page_path       TEXT
session_id      TEXT
visit_duration  INTEGER
device_type     TEXT
referrer        TEXT
created_at      TIMESTAMPTZ
```

### Tabla: `advisor_interactions`
```sql
id                  BIGSERIAL PRIMARY KEY
advisor_id          UUID → advisors(id)  ✅ UUID
property_id         BIGINT → properties(id)  ✅ BIGINT
interaction_type    TEXT
session_id          TEXT
created_at          TIMESTAMPTZ
```

---

## 🚀 INSTRUCCIONES FINALES

### Paso 1: Limpiar (si ya ejecutaste versiones anteriores)

```sql
-- Solo si ya intentaste ejecutar el SQL antes
DROP TABLE IF EXISTS advisor_interactions CASCADE;
DROP TABLE IF EXISTS property_contacts CASCADE;
DROP TABLE IF EXISTS property_views CASCADE;
DROP TABLE IF EXISTS property_likes CASCADE;
DROP TABLE IF EXISTS page_analytics CASCADE;

DROP VIEW IF EXISTS property_stats CASCADE;
DROP VIEW IF EXISTS daily_analytics CASCADE;

DROP FUNCTION IF EXISTS get_top_properties(INTEGER, INTEGER);
```

### Paso 2: Ejecutar SQL Completo

1. Ve a **Supabase Dashboard**
2. Abre **SQL Editor**
3. Copia el contenido COMPLETO de `CREATE_ANALYTICS_TABLES.sql`
4. Pega en el editor
5. Click en **"Run"**

### Paso 3: Verificar Creación

Deberías ver en **Table Editor**:

✅ `property_likes` (5 índices)
✅ `property_views` (3 índices)
✅ `property_contacts` (3 índices)
✅ `page_analytics` (2 índices)
✅ `advisor_interactions` (3 índices)

**Vistas:**
✅ `property_stats`
✅ `daily_analytics`

**Funciones:**
✅ `get_top_properties(limit, days)`

**Políticas RLS:**
✅ 8 políticas creadas

---

## 🧪 PRUEBA RÁPIDA

### Insertar un like de prueba:

```sql
-- Obtener el ID de la primera propiedad
SELECT id, title, code FROM properties LIMIT 1;

-- Insertar un like (reemplaza 123 con el ID real)
INSERT INTO property_likes (property_id, session_id)
VALUES (123, 'test-session-abc123');

-- Verificar que se insertó
SELECT * FROM property_likes;

-- Ver estadísticas
SELECT * FROM property_stats WHERE id = 123;

-- Limpiar
DELETE FROM property_likes WHERE session_id = 'test-session-abc123';
```

---

## 📊 VERIFICAR ESTRUCTURA

### Verificar tipos de columnas:

```sql
SELECT 
  c.table_name,
  c.column_name,
  c.data_type,
  c.udt_name
FROM information_schema.columns c
WHERE c.table_name IN (
  'property_likes',
  'property_views', 
  'property_contacts',
  'advisor_interactions'
)
AND c.column_name IN ('property_id', 'advisor_id')
ORDER BY c.table_name, c.column_name;
```

**Resultado esperado:**
```
table_name              | column_name  | data_type | udt_name
------------------------|--------------|-----------|----------
advisor_interactions    | advisor_id   | uuid      | uuid
advisor_interactions    | property_id  | bigint    | int8
property_contacts       | property_id  | bigint    | int8
property_likes          | property_id  | bigint    | int8
property_views          | property_id  | bigint    | int8
```

---

## ✅ ESTADO ACTUAL

- [x] Tipos BIGINT/UUID corregidos
- [x] Columnas `code` y `location` actualizadas
- [x] TypeScript types actualizados
- [x] Compilación exitosa
- [x] **¡LISTO PARA EJECUTAR EN SUPABASE!**

---

## 🎯 DESPUÉS DE EJECUTAR EL SQL

### 1. Probar el sistema de likes:

```bash
npm run dev
# Ir a http://localhost:5173/properties
# Click en corazón de una propiedad
# Ver el contador incrementar
# Recargar página y verificar que se mantiene
```

### 2. Verificar en Supabase:

```sql
-- Ver todos los likes
SELECT 
  pl.id,
  pl.session_id,
  pl.created_at,
  p.title,
  p.code
FROM property_likes pl
JOIN properties p ON pl.property_id = p.id
ORDER BY pl.created_at DESC;
```

### 3. Ver top propiedades:

```sql
-- Top 10 propiedades de últimos 30 días
SELECT * FROM get_top_properties(10, 30);
```

---

## 🎉 TODO LISTO!

El SQL está 100% corregido y compatible con tu base de datos.

**Siguiente paso:** Ejecutar el SQL en Supabase y probar el sistema de likes! 🚀
