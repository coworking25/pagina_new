# 🔧 SOLUCIÓN: Video no aparece en página pública

## 🎯 PROBLEMA IDENTIFICADO

El video **SÍ está en la BD** y **SÍ aparece en el modal de edición**, pero:
- ❌ No aparece en la página de propiedades (/propiedades)
- ❌ La página muestra "0 propiedades encontradas"

## 🔍 CAUSAS POSIBLES

### 1. Código de propiedad vacío
Tu propiedad tiene: `"code": ""`

Debería tener: `"code": "CA-030"`

### 2. El parseo de videos está funcionando SOLO en AdminProperties
La función `getProperties()` que actualicé parsea los videos, pero puede que no se esté usando en todos lados.

---

## ✅ SOLUCIÓN PASO A PASO

### PASO 1: Corregir código vacío en Supabase

Ejecuta este SQL:

```sql
-- Ver propiedades con código vacío
SELECT id, title, code, status
FROM properties
WHERE code IS NULL OR code = ''
ORDER BY id;
```

**Resultado esperado**: Verás la propiedad 74 con código vacío

**Solución**:
```sql
-- Asignar código CA-030 a la propiedad 74
UPDATE properties
SET code = 'CA-030'
WHERE id = 74;

-- Verificar
SELECT id, title, code, videos
FROM properties
WHERE id = 74;
```

---

### PASO 2: Verificar que getProperties parsea videos

Abre la consola del navegador (F12) y ve a la página de propiedades.

Busca estos logs:
```
🔄 Iniciando carga de propiedades...
📊 Total propiedades recibidas: XX
```

Si ves **0 propiedades**, el problema es el filtro.

**Solución temporal**: Desactiva el filtro de solo disponibles

En `src/pages/Properties.tsx`, línea ~83, cambia:
```typescript
// ❌ ANTES
const data = await getProperties(true);

// ✅ AHORA (temporal para debug)
const data = await getProperties(false);
```

Esto mostrará **TODAS** las propiedades, no solo las disponibles.

---

### PASO 3: Verificar videos en PropertyDetail

Una vez que la propiedad aparezca en la lista:

1. Click en la propiedad
2. Abre consola (F12)
3. Busca: `🎬 Property videos:`

**Deberías ver**:
```javascript
🎬 Property videos: [{url: "https://...", duration: 78}]
🎬 Type: object
🎬 Is Array: true
```

**Si ves un string**:
```javascript
🎬 Property videos: "[{\"url\": \"https://...\"}]"  // ❌ MAL
🎬 Type: string  // ❌ MAL
```

Significa que `getProperties()` no está parseando. Necesitas actualizar PropertyDetail para usar la versión actualizada de `getProperties()`.

---

## 🐛 DEBUGGING ADICIONAL

### Si aún no aparecen las propiedades:

#### 1. Verificar status de la propiedad
```sql
SELECT id, title, status, code
FROM properties
WHERE id = 74;
```

**Debe tener**:
- `status` = `'rent'` o `'sale'` o `'available'`
- `code` = `'CA-030'` (no vacío)

#### 2. Verificar filtros en Properties.tsx

Agrega este console.log en `src/pages/Properties.tsx`:

```typescript
const applyFilters = () => {
  console.log('🔍 Aplicando filtros...');
  console.log('📋 Total propiedades:', properties.length);
  console.log('🎯 Filtros activos:', filters);
  
  let filtered = [...properties];
  
  // ... resto del código
  
  console.log('✅ Propiedades después de filtrar:', filtered.length);
  setFilteredProperties(filtered);
};
```

Esto te dirá en qué parte del filtro se están perdiendo las propiedades.

---

## 📊 VERIFICACIÓN COMPLETA

### SQL de verificación:

```sql
-- 1. Ver la propiedad con video
SELECT 
  id,
  code,
  title,
  status,
  jsonb_array_length(videos) as video_count,
  videos
FROM properties
WHERE id = 74;
```

**Deberías ver**:
```
id: 74
code: CA-030 (o vacío - HAY QUE CORREGIR)
title: Apartamento en Arriendo – Sector Mayorca, Sabaneta
status: rent
video_count: 1
videos: [{...}]
```

### 2. Ver todas las propiedades disponibles:

```sql
SELECT 
  id,
  code,
  title,
  status,
  jsonb_array_length(images) as img_count,
  jsonb_array_length(videos) as video_count
FROM properties
WHERE status IN ('rent', 'sale', 'available')
  AND deleted_at IS NULL
ORDER BY created_at DESC;
```

**Deberías ver** al menos 10-20 propiedades.

Si ves **0**, el problema es que **TODAS** tus propiedades tienen un status diferente.

---

## 🚀 SOLUCIÓN RÁPIDA

### Opción A: Corregir código y refrescar

```sql
UPDATE properties SET code = 'CA-030' WHERE id = 74;
```

Luego refresca la página (Ctrl+R)

### Opción B: Mostrar todas las propiedades (debug)

En `src/pages/Properties.tsx`:

```typescript
const data = await getProperties(false); // Mostrar TODAS
```

### Opción C: Agregar logs de debug

En `src/lib/supabase.ts`, función `getProperties()`, después de parsear videos:

```typescript
// Procesar array de videos
let processedVideos: any[] = [];
// ... código de parseo ...

console.log(`📹 Propiedad ${prop.id}: ${processedVideos.length} videos`);
```

Esto te mostrará cuántos videos tiene cada propiedad al cargar.

---

## 📋 CHECKLIST

- [ ] Ejecutar SQL para asignar código CA-030
- [ ] Verificar que la propiedad tiene status 'rent'
- [ ] Refrescar página de propiedades
- [ ] Ver si aparece la propiedad en la lista
- [ ] Click en la propiedad
- [ ] Ver tab "Videos" en PropertyDetail
- [ ] Verificar que el contador muestra (1)
- [ ] Click en tab Videos
- [ ] Verificar que el video se reproduce

---

## 🎬 RESULTADO ESPERADO

Después de corregir el código:

1. **Página de propiedades** (`/propiedades`):
   - ✅ Muestra "36 propiedades encontradas" (o el número correcto)
   - ✅ Aparece la tarjeta de tu propiedad
   
2. **PropertyDetail** (`/property/74`):
   - ✅ Tabs: "Fotos (18)" y "Videos (1)"
   - ✅ Click en "Videos" muestra el reproductor
   - ✅ Video se reproduce correctamente

3. **AdminProperties** (ya funciona):
   - ✅ Modal de edición muestra "Videos de la Propiedad (1)"
   - ✅ Reproductor funciona

---

## ⚠️ NOTA IMPORTANTE

El problema principal es probablemente el **código vacío**. Esto puede causar:
- Problemas al filtrar propiedades
- Problemas al generar URLs
- Problemas al organizar archivos en Storage

**SIEMPRE asigna un código antes de subir videos/imágenes.**

---

**Ejecuta el SQL y dime qué resultado te da para seguir debuggeando.**
