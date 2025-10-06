# ✅ CORRECCIÓN SQL - ANALYTICS TABLES

## 🔧 PROBLEMA IDENTIFICADO

**Error original:**
```
ERROR: 42804: foreign key constraint "property_likes_property_id_fkey" cannot be implemented
DETAIL: Key columns "property_id" and "id" are of incompatible types: uuid and bigint.
```

**Causa:** 
La tabla `properties` en tu base de datos usa `id BIGINT`, no `UUID`.

---

## ✅ CAMBIOS REALIZADOS

### Tipos de ID actualizados de UUID a BIGINT:

| Tabla | Campo | Antes | Ahora |
|-------|-------|-------|-------|
| `property_likes` | `id` | UUID | **BIGSERIAL** |
| `property_likes` | `property_id` | UUID | **BIGINT** |
| `property_views` | `id` | UUID | **BIGSERIAL** |
| `property_views` | `property_id` | UUID | **BIGINT** |
| `property_contacts` | `id` | UUID | **BIGSERIAL** |
| `property_contacts` | `property_id` | UUID | **BIGINT** |
| `page_analytics` | `id` | UUID | **BIGSERIAL** |
| `advisor_interactions` | `id` | UUID | **BIGSERIAL** |
| `advisor_interactions` | `advisor_id` | UUID | **BIGINT** |
| `advisor_interactions` | `property_id` | UUID | **BIGINT** |

### Función actualizada:

```sql
-- Antes:
CREATE OR REPLACE FUNCTION get_top_properties(...)
RETURNS TABLE (
  property_id UUID,  -- ❌
  ...
)

-- Ahora:
CREATE OR REPLACE FUNCTION get_top_properties(...)
RETURNS TABLE (
  property_id BIGINT,  -- ✅
  ...
)
```

---

## 🚀 INSTRUCCIONES PARA EJECUTAR

### Paso 1: Limpiar (si ya ejecutaste el SQL anterior)

Si ya intentaste ejecutar el SQL anterior, primero elimina las tablas:

```sql
-- Ejecutar SOLO si ya creaste las tablas con error
DROP TABLE IF EXISTS advisor_interactions CASCADE;
DROP TABLE IF EXISTS property_contacts CASCADE;
DROP TABLE IF EXISTS property_views CASCADE;
DROP TABLE IF EXISTS property_likes CASCADE;
DROP TABLE IF EXISTS page_analytics CASCADE;

DROP VIEW IF EXISTS property_stats CASCADE;
DROP VIEW IF EXISTS daily_analytics CASCADE;

DROP FUNCTION IF EXISTS get_top_properties(INTEGER, INTEGER);
```

### Paso 2: Ejecutar SQL corregido

1. Ve a **Supabase** → **SQL Editor**
2. Abre el archivo `CREATE_ANALYTICS_TABLES.sql` (ya corregido)
3. Copia **TODO** el contenido
4. Pega en SQL Editor
5. Click en **"Run"**

### Paso 3: Verificar creación

Deberías ver:

```
✅ 5 tablas creadas
✅ 2 vistas creadas
✅ 1 función creada
✅ 5 políticas RLS creadas
```

Verifica en **Table Editor**:
- `property_likes`
- `property_views`
- `property_contacts`
- `page_analytics`
- `advisor_interactions`

---

## 📋 VERIFICACIÓN

### Comprobar tipos de columnas:

```sql
-- Verificar que property_id es BIGINT
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns
WHERE table_name IN (
  'property_likes',
  'property_views',
  'property_contacts'
)
AND column_name = 'property_id';
```

**Resultado esperado:**
```
table_name       | column_name  | data_type
-----------------|--------------|----------
property_likes   | property_id  | bigint
property_views   | property_id  | bigint
property_contacts| property_id  | bigint
```

---

## 🧪 PRUEBA RÁPIDA

### Insertar un like de prueba:

```sql
INSERT INTO property_likes (property_id, session_id)
VALUES (
  (SELECT id FROM properties LIMIT 1),  -- Primera propiedad
  'test-session-123'
);
```

### Verificar inserción:

```sql
SELECT * FROM property_likes;
```

### Limpiar prueba:

```sql
DELETE FROM property_likes WHERE session_id = 'test-session-123';
```

---

## ✅ ESTADO ACTUAL

- [x] SQL corregido con tipos BIGINT
- [x] Compilación exitosa
- [x] Listo para ejecutar en Supabase

---

## 🎯 SIGUIENTE PASO

**Ahora puedes:**

1. ✅ Ejecutar el SQL corregido en Supabase
2. ✅ Probar el sistema de likes en la página
3. ✅ Verificar que se registran en la base de datos

**Una vez ejecutado, el sistema de likes estará 100% funcional!** 🎉
