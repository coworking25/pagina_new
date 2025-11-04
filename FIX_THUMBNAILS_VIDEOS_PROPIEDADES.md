# 🎬 FIX: Error de Thumbnails en Videos de Propiedades

**Fecha:** 4 de Noviembre de 2025  
**Reportado por:** Usuario  
**Error:** `POST .../property-videos/CA-017/CA-017-xxx-thumb.jpg 400 (Bad Request)`  
**Mensaje:** `mime type image/jpeg is not supported`  

---

## 🔍 ANÁLISIS DEL PROBLEMA

### **Error Reportado en Consola**
```
POST https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/property-videos/CA-017/CA-017-1762269366553-thumb.jpg 400 (Bad Request)

❌ Error subiendo thumbnail: StorageApiError: mime type image/jpeg is not supported
```

### **Comportamiento Observado**
- ✅ El video se sube correctamente
- ❌ El thumbnail genera error 400
- ⚠️ El thumbnail NO se guarda
- ℹ️ El proceso continúa sin el thumbnail

---

## 🔎 CAUSA RAÍZ

### **Configuración Incorrecta del Bucket**

**Ubicación:** Supabase Storage → `property-videos` bucket

**Configuración actual (INCORRECTA):**
```sql
allowed_mime_types = ARRAY[
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo'
  -- ❌ FALTA: 'image/jpeg' para thumbnails
]
```

### **¿Por qué falla?**

1. El bucket `property-videos` está configurado con `allowed_mime_types` restrictivos
2. Solo permite tipos de video (mp4, webm, quicktime, avi)
3. Cuando se intenta subir un thumbnail JPEG, Supabase lo rechaza con error 400
4. El código en `supabase-videos.ts` generaba el thumbnail como Blob sin especificar tipo MIME explícito

### **Flujo del Problema:**
```
Usuario sube video → Video se sube OK → Sistema genera thumbnail JPEG
                                                          ↓
                                      Intenta subir thumbnail al bucket
                                                          ↓
                              Bucket rechaza: "image/jpeg no permitido"
                                                          ↓
                                              Error 400 en consola
                                                          ↓
                                Video queda SIN thumbnail
```

---

## ✅ SOLUCIÓN IMPLEMENTADA

### **1. Actualización del Bucket en Supabase**

**Script SQL creado:** `sql/FIX_property_videos_bucket_mime_types.sql`

```sql
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'video/mp4',
  'video/webm', 
  'video/quicktime',
  'video/x-msvideo',
  'image/jpeg',      -- ✅ AGREGADO para thumbnails
  'image/jpg',       -- ✅ AGREGADO alternativa JPEG
  'image/png',       -- ✅ AGREGADO opcional para thumbnails PNG
  'image/webp'       -- ✅ AGREGADO opcional para thumbnails WebP
]
WHERE id = 'property-videos';
```

### **2. Mejora del Código de Upload**

**Archivo:** `src/lib/supabase-videos.ts`

**ANTES:**
```typescript
// Subir thumbnail
const { error } = await supabase.storage
  .from('property-videos')
  .upload(thumbPath, blob, {
    cacheControl: '3600',
    upsert: true
  });
```

**DESPUÉS:**
```typescript
// Convertir blob a File con tipo MIME correcto
const thumbFile = new File([blob], thumbFileName, { type: 'image/jpeg' });

console.log(`📸 Subiendo thumbnail: ${thumbPath} (${(thumbFile.size / 1024).toFixed(2)} KB)`);

// Subir thumbnail
const { error } = await supabase.storage
  .from('property-videos')
  .upload(thumbPath, thumbFile, {
    cacheControl: '3600',
    upsert: true,
    contentType: 'image/jpeg' // ✅ Especificar tipo MIME explícitamente
  });

if (error) {
  console.error('❌ Error subiendo thumbnail:', error);
  console.error('❌ Detalles del error:', {
    message: error.message,
    path: thumbPath,
    size: thumbFile.size,
    type: thumbFile.type
  });
  resolve(undefined);
  return;
}
```

### **Mejoras Implementadas:**

1. ✅ **Conversión explícita a File:** El blob ahora se convierte a un objeto File con tipo MIME `image/jpeg`
2. ✅ **ContentType explícito:** Se especifica `contentType: 'image/jpeg'` en la subida
3. ✅ **Logs mejorados:** Información detallada del tamaño y tipo del thumbnail
4. ✅ **Error handling mejorado:** Detalles completos del error si falla
5. ✅ **Soporte AVI:** Se agregó soporte para archivos `.avi` en el regex

---

## 📋 PASOS PARA APLICAR LA SOLUCIÓN

### **Paso 1: Actualizar Configuración del Bucket**

1. Abre **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Ejecuta el script: `sql/FIX_property_videos_bucket_mime_types.sql`
4. Verifica la salida:

```sql
-- Debe mostrar:
 id               | name             | public | file_size_limit | allowed_mime_types
------------------+------------------+--------+-----------------+--------------------
 property-videos  | property-videos  | true   | 104857600       | {video/mp4, video/webm, video/quicktime, video/x-msvideo, image/jpeg, image/jpg, image/png, image/webp}
```

### **Paso 2: Código ya está Actualizado**

✅ El código de `supabase-videos.ts` ya tiene las mejoras aplicadas

### **Paso 3: Probar la Solución**

1. Abre el modal de **Nueva Propiedad** o **Editar Propiedad**
2. Sube un video de prueba
3. Verifica en la **consola del navegador** (F12):

**Logs esperados:**
```
📤 Subiendo video para propiedad CA-017...
✅ Video subido exitosamente
🎨 Generando thumbnail del video...
📸 Subiendo thumbnail: CA-017/CA-017-xxx-thumb.jpg (45.23 KB)
✅ Thumbnail generado: https://...
```

4. Verifica que el thumbnail se muestra correctamente en la UI

---

## 🧪 PRUEBAS RECOMENDADAS

### **Test 1: Subir Video Nuevo**
- ✅ Subir video MP4
- ✅ Verificar que se genere thumbnail automáticamente
- ✅ Verificar que NO haya errores 400 en consola
- ✅ Verificar que el thumbnail sea visible

### **Test 2: Diferentes Formatos**
- ✅ Probar con MP4
- ✅ Probar con WebM
- ✅ Probar con MOV
- ✅ Probar con AVI

### **Test 3: Videos Existentes**
- ℹ️ Los videos que ya se subieron NO tienen thumbnail
- ✅ Pueden subirse nuevamente para generar thumbnails
- ℹ️ O se pueden generar manualmente

---

## 📊 TIPOS MIME AHORA SOPORTADOS

### **Bucket: property-videos**

| Tipo | MIME Type | Uso |
|------|-----------|-----|
| Video MP4 | `video/mp4` | Videos principales |
| Video WebM | `video/webm` | Videos alternativos |
| Video QuickTime | `video/quicktime` | Videos MOV |
| Video AVI | `video/x-msvideo` | Videos AVI |
| Imagen JPEG | `image/jpeg` | Thumbnails ✅ |
| Imagen JPG | `image/jpg` | Thumbnails ✅ |
| Imagen PNG | `image/png` | Thumbnails opcionales ✅ |
| Imagen WebP | `image/webp` | Thumbnails modernos ✅ |

---

## 🔐 SEGURIDAD Y POLÍTICAS

### **Políticas RLS Existentes**
Las políticas de acceso al bucket NO se modifican:
- ✅ Lectura pública para todos
- ✅ Subida solo para usuarios autenticados
- ✅ Actualización solo para usuarios autenticados
- ✅ Eliminación solo para usuarios autenticados

### **Límites**
- ✅ Tamaño máximo por archivo: **100MB**
- ✅ Aplicable tanto a videos como thumbnails

---

## 📂 ESTRUCTURA DE ARCHIVOS

### **Organización en el Bucket:**
```
property-videos/
├── CA-001/
│   ├── CA-001-1762269366553.mp4        (video)
│   ├── CA-001-1762269366553-thumb.jpg  (thumbnail) ✅
│   ├── CA-001-1762269823456.mp4        (video)
│   └── CA-001-1762269823456-thumb.jpg  (thumbnail) ✅
├── CA-002/
│   ├── CA-002-1762270123456.webm       (video)
│   └── CA-002-1762270123456-thumb.jpg  (thumbnail) ✅
└── ...
```

### **Nomenclatura:**
- **Videos:** `{propertyCode}-{timestamp}.{ext}`
- **Thumbnails:** `{propertyCode}-{timestamp}-thumb.jpg`

---

## 🎯 CARACTERÍSTICAS DEL THUMBNAIL

### **Generación Automática:**
- ✅ Se captura del video en el segundo 1 (o 10% del video, lo que sea menor)
- ✅ Resolución: 640x360 px
- ✅ Formato: JPEG
- ✅ Calidad: 80%
- ✅ Se sube automáticamente al bucket

### **Fallback:**
- Si falla la generación del thumbnail:
  - ⚠️ Se registra el error en consola
  - ✅ El video se sube correctamente de todas formas
  - ℹ️ El campo `thumbnail` queda como `undefined`
  - ✅ El sistema sigue funcionando sin problemas

---

## 📝 ARCHIVOS MODIFICADOS

### **1. Código TypeScript**
- ✅ `src/lib/supabase-videos.ts`
  - Conversión explícita de Blob a File
  - ContentType explícito en upload
  - Logs mejorados
  - Error handling detallado

### **2. Scripts SQL**
- ✅ `sql/FIX_property_videos_bucket_mime_types.sql` (NUEVO)
  - Actualización de allowed_mime_types
  - Query de verificación

---

## ⚠️ NOTAS IMPORTANTES

### **1. Retrocompatibilidad**
- ✅ Videos existentes sin thumbnails siguen funcionando
- ✅ No se requiere regenerar videos existentes
- ℹ️ Nuevos videos tendrán thumbnails automáticamente

### **2. Videos Antiguos**
Si quieres agregar thumbnails a videos antiguos:
1. Opción A: Re-subir los videos
2. Opción B: Generar thumbnails manualmente con script
3. Opción C: Dejar sin thumbnails (seguirán funcionando)

### **3. Migración**
- ✅ El cambio es compatible con la estructura actual
- ✅ No requiere migración de datos
- ✅ Aplica inmediatamente después de ejecutar el SQL

---

## ✅ VERIFICACIÓN FINAL

### **Checklist Post-Aplicación:**

- [ ] Script SQL ejecutado en Supabase
- [ ] Bucket muestra tipos MIME actualizados
- [ ] Código de supabase-videos.ts actualizado
- [ ] Prueba de subida de video exitosa
- [ ] Thumbnail generado sin errores
- [ ] Thumbnail visible en la UI
- [ ] No hay errores 400 en consola
- [ ] Logs muestran información correcta

---

## 🎉 RESULTADO ESPERADO

### **Antes:**
```
❌ Error subiendo thumbnail: StorageApiError: mime type image/jpeg is not supported
⚠️ Videos sin thumbnails
```

### **Después:**
```
✅ Thumbnail generado: https://.../CA-017-xxx-thumb.jpg
✅ Videos con thumbnails automáticos
✅ Sin errores en consola
```

---

## 📞 SOPORTE

Si después de aplicar estos cambios sigues teniendo problemas:

1. Verifica que el script SQL se ejecutó correctamente
2. Revisa los logs de la consola del navegador
3. Verifica la configuración del bucket en Supabase Dashboard
4. Limpia la caché del navegador
5. Prueba con un video diferente

---

**Desarrollado por:** GitHub Copilot  
**Última actualización:** 4 de Noviembre de 2025  
**Estado:** ✅ SOLUCIONADO
