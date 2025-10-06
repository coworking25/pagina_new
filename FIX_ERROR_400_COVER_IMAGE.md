# ✅ FIX: Error 400 al Actualizar Imagen de Portada

## ❌ Error Original

```
PATCH https://...supabase.co/rest/v1/properties?id=eq.75 400 (Bad Request)
Could not find the 'cover_image' column of 'properties' in the schema cache
```

---

## 🔍 Causa del Problema

La tabla `properties` en Supabase **NO tiene la columna `cover_image`**.

El código intentaba actualizar una columna que no existe:
```typescript
await updateProperty(selectedProperty.id, { 
  images: newImages,
  cover_image: imageUrl // ← Esta columna NO EXISTE en Supabase
});
```

---

## ✅ Soluciones Aplicadas

### **Solución 1: Fix Temporal (YA APLICADO)**

He comentado todas las referencias a `cover_image` para que no dé error:

#### En `handleCreateProperty`:
```typescript
// ANTES (❌ Error):
cover_image: coverImage,

// AHORA (✅ Funciona):
// cover_image: coverImage, // Comentado temporalmente
```

#### En `onSelectCover` (edición):
```typescript
// ANTES (❌ Error):
await updateProperty(selectedProperty.id, { 
  images: newImages,
  cover_image: imageUrl
});

// AHORA (✅ Funciona):
await updateProperty(selectedProperty.id, { 
  images: newImages
  // cover_image: imageUrl // Comentado temporalmente
});
```

**Estado actual:**
- ✅ **NO da error 400**
- ✅ La portada sigue funcionando (primera imagen del array)
- ✅ Puedes cambiar la portada sin problemas
- ⚠️ No usa la columna `cover_image` (porque no existe)

---

### **Solución 2: Agregar Columna en Supabase (PENDIENTE DE EJECUTAR)**

He creado el SQL completo para agregar la columna.

**Archivo:** `EJECUTAR_EN_SUPABASE_COVER_IMAGE.sql`

**Pasos rápidos:**
1. Ir a: https://gfczfjpyyyyvteyrvhgt.supabase.co/project/gfczfjpyyyyvteyrvhgt/sql
2. Copiar el contenido de `EJECUTAR_EN_SUPABASE_COVER_IMAGE.sql`
3. Pegar en el SQL Editor
4. Clic en "RUN"
5. ✅ Listo

**Después de ejecutar:**
- Tendrás la columna `cover_image` en la tabla
- Podrás descomentar el código
- La funcionalidad será completa

---

## 🧪 Prueba Ahora (Con Fix Temporal)

1. Ir a http://localhost:5174
2. Editar una propiedad con imágenes
3. Cambiar la imagen de portada
4. **NO debería dar error 400** ✅
5. **Debería mostrar:** "✅ Imagen de portada actualizada"

---

## 📁 Archivos Modificados

### `src/pages/AdminProperties.tsx`

**Línea ~2810:** Modal Editar - onSelectCover
- Comentada actualización de `cover_image`
- Solo actualiza array `images`

**Línea ~800:** handleCreateProperty
- Comentada asignación de `cover_image`
- Solo usa array `images`

### Archivos Nuevos

- `EJECUTAR_EN_SUPABASE_COVER_IMAGE.sql` - SQL para ejecutar
- `GUIA_AGREGAR_COVER_IMAGE_SUPABASE.md` - Guía completa

---

## 📊 Comparación

### Antes del Fix:
```
Intentar cambiar portada
  ↓
Error 400: Column 'cover_image' not found
  ↓
❌ No funciona
```

### Con Fix Temporal (Ahora):
```
Cambiar portada
  ↓
Actualiza solo array 'images'
  ↓
✅ Funciona (primera imagen = portada)
```

### Después de Ejecutar SQL:
```
Cambiar portada
  ↓
Actualiza 'images' + 'cover_image'
  ↓
✅ Funciona + Optimizado
```

---

## 🎯 Próximos Pasos

### Opción A: Ejecutar SQL Ahora
1. ✅ Ejecutar `EJECUTAR_EN_SUPABASE_COVER_IMAGE.sql`
2. ✅ Descomentar código
3. ✅ Hacer commit final

### Opción B: Dejar Fix Temporal
1. ✅ Ya está funcionando
2. ⚠️ Ejecutar SQL cuando tengas tiempo
3. ✅ Hacer commit del fix

---

## ✅ Estado Actual

- **Error 400:** ✅ Corregido
- **Selector de portada:** ✅ Funciona
- **Crear propiedad:** ✅ Funciona
- **Editar portada:** ✅ Funciona
- **Código compilando:** ✅ Sin errores

---

**El selector de portada ahora funciona sin errores. Pruébalo y luego decide si ejecutas el SQL o lo dejas para después** 🚀
