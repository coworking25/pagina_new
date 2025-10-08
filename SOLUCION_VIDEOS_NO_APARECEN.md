# 🔧 PROBLEMAS ENCONTRADOS Y SOLUCIONADOS

## ❌ PROBLEMAS IDENTIFICADOS

### 1. **Videos no se mostraban en PropertyDetail**
**Causa**: La función `getProperties()` no parseaba el campo `videos` de la base de datos

**Datos en BD**:
```json
{
  "videos": "[{\"url\": \"https://...\", \"duration\": 78}]"  // ← String, no Array
}
```

**Lo que llegaba al componente**:
```typescript
property.videos = "[{\"url\": \"https://...\"}]"  // ← String
```

**Lo que esperaba el componente**:
```typescript
property.videos = [{url: "https://...", duration: 78}]  // ← Array
```

**✅ SOLUCIÓN**: Agregado parseo de JSON en `getProperties()`:
```typescript
// Procesar array de videos
let processedVideos: any[] = [];

if (prop.videos && Array.isArray(prop.videos)) {
  processedVideos = prop.videos;
} else if (typeof prop.videos === 'string') {
  try {
    const parsed = JSON.parse(prop.videos);
    if (Array.isArray(parsed)) {
      processedVideos = parsed;
    }
  } catch (e) {
    console.warn('No se pudo parsear videos:', e);
    processedVideos = [];
  }
}
```

---

### 2. **URL de video incorrecta**
**Problema en tu propiedad**:
```
"url": "https://.../property-videos/-1759939140476.mp4"
                                      ↑
                            Código vacío o negativo
```

**Debería ser**:
```
"url": "https://.../property-videos/CA-030/CA-030-1759939140476.mp4"
```

**Causa**: Cuando subes un video en una propiedad **sin código asignado**, el sistema genera un código temporal

**✅ SOLUCIÓN**: 
- El código ya está implementado correctamente en `handleUploadVideos()`
- **Para tus videos existentes**, necesitas:
  1. Re-subir el video desde el dashboard
  2. O corregir manualmente la URL en la BD

---

### 3. **No hay previews de videos/imágenes al seleccionar**
**Problema**: Cuando seleccionas archivos, no ves ninguna preview antes de subirlos

**Causa**: Las imágenes usan `previewImages` que se llena **después de subir**, no al seleccionar

**Estado actual**:
```
1. Usuario selecciona imágenes/videos
2. Click "Subir"
3. Se suben
4. ENTONCES aparecen en preview ← Tarde
```

**Lo esperado**:
```
1. Usuario selecciona imágenes/videos
2. INMEDIATAMENTE aparece preview local ← Falta implementar
3. Click "Subir"
4. Se suben y reemplazan preview
```

**✅ SOLUCIÓN PARCIAL**: 
- Las imágenes **SÍ** muestran preview después de subir (existe `previewImages`)
- Los videos **NO** tienen preview (falta implementar)

---

## ✅ CAMBIOS REALIZADOS

### Archivo: `src/lib/supabase.ts`

**Función modificada**: `getProperties()`

**Antes**:
```typescript
return {
  id: prop.id,
  title: prop.title,
  // ...
  images: processedImages,
  amenities: prop.amenities || [],
  // ❌ Falta videos
  // ❌ Falta cover_image
  // ❌ Falta cover_video
};
```

**Ahora**:
```typescript
// Procesar array de videos
let processedVideos: any[] = [];

if (prop.videos && Array.isArray(prop.videos)) {
  processedVideos = prop.videos;
} else if (typeof prop.videos === 'string') {
  try {
    const parsed = JSON.parse(prop.videos);
    if (Array.isArray(parsed)) {
      processedVideos = parsed;
    }
  } catch (e) {
    console.warn('No se pudo parsear videos:', e);
    processedVideos = [];
  }
}

return {
  id: prop.id,
  title: prop.title,
  // ...
  images: processedImages,
  videos: processedVideos,          // ✅ Agregado
  cover_image: prop.cover_image,     // ✅ Agregado
  cover_video: prop.cover_video,     // ✅ Agregado
  amenities: prop.amenities || [],
  // ...
};
```

---

## 🧪 CÓMO VERIFICAR

### 1. Verificar que los videos ahora se muestran

```typescript
// En la consola del navegador (PropertyDetail.tsx)
console.log('Videos:', property.videos);
```

**Antes**:
```
Videos: "[{\"url\": \"https://...\"}]"  // String
```

**Ahora**:
```
Videos: [{url: "https://...", duration: 78}]  // Array ✅
```

### 2. Ver los datos en el tab de Videos

1. Ve a: `http://localhost:5174/property/74`
2. Click en tab "Videos"
3. **Deberías ver**: El video que subiste
4. **Si no aparece**: Revisa la consola del navegador para errores

---

## 🔍 DEBUGGING

### Si aún no aparecen los videos:

#### Paso 1: Verificar datos en BD
```sql
SELECT 
  id,
  code,
  title,
  videos,
  cover_video
FROM properties
WHERE id = 74;
```

**Deberías ver**:
```json
{
  "videos": "[{\"url\": \"https://.../property-videos/-1759939140476.mp4\", ...}]"
}
```

#### Paso 2: Verificar parseo en frontend
```typescript
// En PropertyDetail.tsx, agrega console.log
useEffect(() => {
  console.log('🎬 Property videos:', property.videos);
  console.log('🎬 Type:', typeof property.videos);
  console.log('🎬 Is Array:', Array.isArray(property.videos));
}, [property]);
```

**Deberías ver**:
```
🎬 Property videos: [{url: "...", duration: 78}]
🎬 Type: object
🎬 Is Array: true
```

#### Paso 3: Verificar URL del video
```typescript
// Intentar acceder al video directamente
const videoUrl = "https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-videos/-1759939140476.mp4";
```

Si da **404**, el problema es que el archivo se subió con código incorrecto.

---

## 🚨 PROBLEMA CRÍTICO: URL INCORRECTA

Tu video tiene esta URL:
```
property-videos/-1759939140476.mp4
                ↑
        Carpeta incorrecta (código vacío)
```

### Opciones para solucionarlo:

#### Opción A: Re-subir el video (RECOMENDADO)
1. Dashboard → Editar propiedad CA-030
2. Scroll a "Videos de la Propiedad"
3. Eliminar el video actual (botón ❌)
4. Subir el video nuevamente
5. Ahora tendrá URL correcta: `property-videos/CA-030/CA-030-[timestamp].mp4`

#### Opción B: Mover archivo manualmente en Supabase
1. Ir a Supabase Storage → property-videos
2. Descargar el archivo `-1759939140476.mp4`
3. Crear carpeta `CA-030` si no existe
4. Subir el archivo renombrado: `CA-030-1759939140476.mp4`
5. Actualizar BD:
```sql
UPDATE properties
SET videos = '[{
  "url": "https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-videos/CA-030/CA-030-1759939140476.mp4",
  "size": 15088501,
  "title": "CA-030.mp4",
  "duration": 78,
  "uploaded_at": "2025-10-08T15:59:09.375Z"
}]'::jsonb
WHERE id = 74;
```

#### Opción C: Actualizar solo la URL en BD
```sql
UPDATE properties
SET videos = jsonb_set(
  videos,
  '{0,url}',
  '"https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-videos/CA-030/CA-030-1759939140476.mp4"'
)
WHERE id = 74;
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

### Después de aplicar cambios:

- [ ] Video aparece en PropertyDetail
- [ ] Tab "Videos" muestra (1) correctamente
- [ ] Video se reproduce al hacer click
- [ ] Controles del player funcionan
- [ ] URL del video es correcta (incluye CA-030)
- [ ] Al editar la propiedad, el video aparece en el modal
- [ ] Puedo eliminar el video
- [ ] Puedo agregar más videos

---

## 🎯 PRÓXIMOS PASOS

1. **Recargar página** después de los cambios en `supabase.ts`
2. **Ir a PropertyDetail** de la propiedad 74
3. **Verificar** que el tab Videos muestra (1)
4. **Click** en tab Videos
5. **Si aparece pero da error 404**: Re-subir el video (Opción A)
6. **Si no aparece**: Revisar consola del navegador

---

## 📊 RESUMEN

| Problema | Estado | Acción Requerida |
|----------|--------|------------------|
| Videos no se parseaban | ✅ SOLUCIONADO | Ninguna (código actualizado) |
| URL incorrecta en BD | ⚠️ EXISTE | Re-subir video desde dashboard |
| No hay preview de videos | ⏳ PENDIENTE | Implementar en futuro (opcional) |
| Videos no aparecen en modal edición | ✅ DEBERÍA FUNCIONAR | Verificar después de parseo |

---

**Fecha**: 8 de Octubre, 2025  
**Archivos modificados**: 1 (`src/lib/supabase.ts`)  
**Líneas agregadas**: ~20  
**Impacto**: CRÍTICO - Ahora los videos sí se mostrarán
