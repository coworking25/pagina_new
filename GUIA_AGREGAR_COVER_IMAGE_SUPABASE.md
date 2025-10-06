# 🔧 Agregar Columna `cover_image` a Supabase

## ❌ Error Actual

```
Could not find the 'cover_image' column of 'properties' in the schema cache
```

**Causa:** La tabla `properties` en Supabase NO tiene la columna `cover_image`.

---

## ✅ Solución en 2 Pasos

### **PASO 1: Ejecutar SQL en Supabase (5 minutos)**

#### 1.1 Ir a Supabase SQL Editor

1. Abrir: https://gfczfjpyyyyvteyrvhgt.supabase.co/project/gfczfjpyyyyvteyrvhgt/sql
2. Hacer clic en **"+ New query"** (Nueva consulta)

#### 1.2 Copiar y Pegar el SQL

**Copiar TODO este código:**

```sql
-- ========================================
-- AGREGAR COLUMNA cover_image A properties
-- ========================================

-- 1. Agregar la columna
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 2. Documentar el campo
COMMENT ON COLUMN properties.cover_image IS 'URL de la imagen de portada seleccionada para mostrar en las listas y tarjetas de propiedades';

-- 3. Actualizar propiedades existentes (primera imagen = portada)
UPDATE properties 
SET cover_image = (
  CASE 
    WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
    THEN images->>0 
    ELSE NULL 
  END
)
WHERE cover_image IS NULL;

-- 4. Crear índice para rendimiento
CREATE INDEX IF NOT EXISTS idx_properties_cover_image ON properties(cover_image) WHERE cover_image IS NOT NULL;

-- 5. Verificar resultado
SELECT 
  id, 
  code,
  title, 
  cover_image IS NOT NULL as tiene_portada,
  jsonb_array_length(images) as cantidad_imagenes
FROM properties 
ORDER BY id DESC
LIMIT 10;
```

#### 1.3 Ejecutar

1. Pegar el SQL en el editor
2. Hacer clic en **"RUN"** (Ejecutar)
3. Esperar a que termine

#### 1.4 Verificar Resultado

Deberías ver una tabla con tus propiedades mostrando:
- `id`, `code`, `title`
- `tiene_portada` = `true` (si tienen imágenes)
- `cantidad_imagenes` = número de imágenes

**Si ves esto:** ✅ ¡La columna se agregó correctamente!

---

### **PASO 2: Descomentar Código en el Proyecto**

Una vez que la columna exista en Supabase, voy a actualizar el código para usarla.

**Por ahora, el código está funcionando con un FIX TEMPORAL:**
- ✅ Solo actualiza el array `images` (sin `cover_image`)
- ✅ La primera imagen del array sigue siendo la portada
- ✅ NO da error 400

---

## 🧪 Prueba Rápida (Después de ejecutar SQL)

1. **Ir al panel de propiedades**
2. **Editar una propiedad con imágenes**
3. **Cambiar la imagen de portada**
4. **Verificar que NO aparezca error 400** ✅

**Resultado esperado:**
```
✅ Imagen de portada actualizada. La imagen seleccionada ahora es la primera.
```

---

## 🔄 Estado Actual del Código

### Función `handleCreateProperty` (Nueva Propiedad)

```typescript
// ❌ ANTES (daba error):
const propertyData = {
  ...
  cover_image: coverImage, // ← Columna no existe
};

// ✅ AHORA (fix temporal):
const propertyData = {
  ...
  images: previewImages, // La primera es la portada
  // cover_image: coverImage, // ← Comentado temporalmente
};
```

### Función `onSelectCover` (Editar Propiedad)

```typescript
// ❌ ANTES (daba error):
await updateProperty(selectedProperty.id, { 
  images: newImages,
  cover_image: imageUrl // ← Columna no existe
});

// ✅ AHORA (fix temporal):
await updateProperty(selectedProperty.id, { 
  images: newImages
  // cover_image: imageUrl // ← Comentado temporalmente
});
```

---

## 📊 Después de Ejecutar el SQL

Una vez que ejecutes el SQL en Supabase, te diré cómo descomentar el código para aprovechar la columna `cover_image`.

---

## 🎯 Plan de Acción

### Opción A: Ejecutar SQL Ahora (RECOMENDADO)

1. ✅ Ejecutar el SQL en Supabase (5 min)
2. ✅ Verificar que la columna existe
3. ✅ Descomentar el código del proyecto
4. ✅ Hacer commit con todo funcionando

### Opción B: Usar Fix Temporal

1. ✅ Dejar el código actual (ya aplicado)
2. ⚠️ Funciona, pero no usa la columna `cover_image`
3. ⚠️ Solo usa el orden del array `images`
4. ⏰ Ejecutar SQL más tarde cuando tengas tiempo

---

## 📝 Archivos Importantes

- `EJECUTAR_EN_SUPABASE_COVER_IMAGE.sql` - SQL completo para copiar/pegar
- `sql/add_cover_image_manual.sql` - Versión original del script

---

## ❓ FAQ

### ¿Por qué no se agregó automáticamente?
Los scripts SQL en la carpeta `/sql` no se ejecutan automáticamente. Hay que ejecutarlos manualmente en Supabase.

### ¿Qué pasa si no ejecuto el SQL?
El sistema sigue funcionando, pero:
- Solo usa el orden del array `images`
- No aprovecha la optimización de `cover_image`

### ¿Cuándo debo ejecutar el SQL?
Ahora mismo si quieres aprovechar la columna `cover_image`. O cuando tengas 5 minutos libres.

---

**¿Quieres que te guíe paso a paso para ejecutar el SQL en Supabase?** 🚀
