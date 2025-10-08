# 🎬 GUÍA DE PRUEBA - SISTEMA DE VIDEOS

## ✅ TODO LISTO PARA PROBAR

### 🔧 CONFIGURACIÓN COMPLETADA

1. ✅ **SQL ejecutado** - Columnas `videos` y `cover_video` creadas
2. ✅ **Bucket pendiente** - Necesitas crear `property-videos` en Supabase
3. ✅ **Código actualizado** - Interfaz mejorada
4. ✅ **Errores corregidos** - Compilación exitosa

---

## 📋 PASO 1: CREAR BUCKET (5 minutos)

### Ve a Supabase Dashboard:

1. **Abrir** https://supabase.com/dashboard
2. **Seleccionar** tu proyecto
3. **Click** en "Storage" en el menú lateral
4. **Click** en "New bucket"

### Configuración del Bucket:

```
Nombre:          property-videos
Public:          ✅ Activar
File size limit: 104857600    (100 MB en bytes)
Allowed MIME:    video/mp4,video/webm,video/quicktime,video/x-msvideo
```

5. **Click** "Create bucket"

### Verificar:

Ejecuta en SQL Editor:

```sql
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'property-videos';
```

**Deberías ver**:
```
id: property-videos
name: property-videos
public: true
file_size_limit: 104857600
allowed_mime_types: {video/mp4,video/webm,video/quicktime,video/x-msvideo}
```

---

## 📋 PASO 2: PROBAR NUEVA PROPIEDAD (10 minutos)

### 1. Abrir Dashboard

```
URL: http://localhost:5174/admin/properties
```

### 2. Click "Nueva Propiedad"

### 3. Llenar Datos Básicos

```
Código: CA-TEST-001
Título: Apartamento de Prueba con Videos
Precio: 500000
Ubicación: Envigado, Antioquia
Habitaciones: 3
Baños: 2
Área: 85
Tipo: Apartamento
Estado: En Venta
Asesor: [Seleccionar cualquiera]
```

### 4. Scroll hasta "Videos de la Propiedad"

**Deberías ver:**

```
┌────────────────────────────────────┐
│ 🎥 Videos de la Propiedad          │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐  │
│  │      ⬆️ Upload Icon           │  │
│  │                              │  │
│  │ Arrastra videos aquí o haz   │  │
│  │ clic para seleccionar        │  │
│  │                              │  │
│  │ Formatos: MP4, WebM, MOV, AVI│  │
│  │ (máximo 100MB por video)     │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### 5. Agregar Video

**Opción A**: Arrastra un archivo MP4

**Opción B**: 
1. Click en la zona de arrastre
2. **SE DEBERÍA ABRIR EL EXPLORADOR DE ARCHIVOS**
3. **SOLO DEBERÍAS VER ARCHIVOS DE VIDEO** (MP4, WebM, MOV, AVI)
4. Selecciona 1 o 2 videos
5. Click "Abrir"

**✅ VERIFICAR:**
- ✅ Se muestra lista de videos seleccionados
- ✅ Se muestra tamaño total
- ✅ Aparece botón "Subir Videos"

### 6. Subir Videos

1. Click "Subir Videos"

**✅ VERIFICAR:**
- ✅ Aparece progress bar: "Subiendo... 45%"
- ✅ Progress aumenta progresivamente
- ✅ Al terminar, videos aparecen en el grid
- ✅ Cada video tiene thumbnail
- ✅ Cada video tiene duración (ej: "2:15")
- ✅ Al hacer hover, aparece botón ❌

### 7. Guardar Propiedad

1. Scroll hasta abajo
2. Click "Crear Propiedad"

**✅ VERIFICAR:**
- ✅ Mensaje de éxito
- ✅ Propiedad aparece en la lista

---

## 📋 PASO 3: PROBAR EDITAR PROPIEDAD (10 minutos)

### 1. En la Lista de Propiedades

1. Busca la propiedad que acabas de crear
2. Click en el botón "Editar" (✏️)

### 2. Verificar Imágenes

**Scroll hasta "Imágenes Actuales"**

**Deberías ver:**
```
┌────────────────────────────────────┐
│ 🖼️ Imágenes Actuales (X)           │
│                    [Agregar Más] ← │
├────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐        │
│  │ Img │  │ Img │  │ Img │        │
│  └─────┘  └─────┘  └─────┘        │
└────────────────────────────────────┘
```

**Probar Botón "Agregar Más":**
1. Click "Agregar Más"
2. **✅ SE DEBE ABRIR EL EXPLORADOR**
3. **✅ SOLO DEBE MOSTRAR IMÁGENES** (JPG, PNG, WebP)
4. Selecciona 1 imagen
5. Click "Abrir"
6. **✅ DEBE SUBIRSE AUTOMÁTICAMENTE**
7. **✅ DEBE APARECER EN EL GRID**

### 3. Verificar Videos

**Scroll hasta "Videos de la Propiedad"**

**Deberías ver:**
```
┌────────────────────────────────────┐
│ 🎥 Videos de la Propiedad (2)      │
│                  [Agregar Videos]← │
├────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐         │
│  │  Video  │  │  Video  │         │
│  │    🎬   │  │    🎬   │         │
│  │  2:15   │  │  3:42   │         │
│  └─────────┘  └─────────┘         │
│                                    │
│  💡 Formatos permitidos: MP4...    │
└────────────────────────────────────┘
```

**Probar Reproducción:**
1. Click en un video
2. **✅ DEBERÍA REPRODUCIRSE**
3. **✅ CONTROLES DEBERÍAN FUNCIONAR** (play, pause, mute, fullscreen)

**Probar Eliminación:**
1. Hover sobre un video
2. **✅ DEBE APARECER BOTÓN ❌**
3. Click en ❌
4. **✅ DEBE PEDIR CONFIRMACIÓN**
5. Confirmar
6. **✅ VIDEO DEBE DESAPARECER**

**Probar Agregar Más Videos:**
1. Click "Agregar Videos"
2. **✅ SE DEBE ABRIR EL EXPLORADOR**
3. **✅ SOLO DEBE MOSTRAR VIDEOS**
4. Selecciona un nuevo video
5. Click "Abrir"
6. **✅ DEBE MOSTRAR PROGRESS BAR**
7. **✅ DEBE APARECER EN EL GRID**

### 4. Guardar Cambios

1. Scroll hasta abajo
2. Click "Actualizar Propiedad"
3. **✅ MENSAJE DE ÉXITO**

---

## 📋 PASO 4: VER EN VISTA PÚBLICA (5 minutos)

### 1. Ir a la Propiedad

```
URL: http://localhost:5174/property/[ID]
```

O desde el dashboard, click en el botón "Ver" (👁️)

### 2. Verificar Tabs

**Deberías ver:**

```
┌────────────────────────────────────┐
│  [📷 Fotos (18)] [🎬 Videos (2)]  │
├────────────────────────────────────┤
│  [Grid de imágenes o videos]       │
└────────────────────────────────────┘
```

### 3. Tab de Fotos

1. Tab "Fotos" debería estar activo por defecto
2. **✅ CONTADOR CORRECTO**: "Fotos (18)"
3. **✅ GRID DE IMÁGENES**
4. **✅ LIGHTBOX AL HACER CLICK**

### 4. Tab de Videos

1. Click en tab "Videos"
2. **✅ TAB SE DEBE ACTIVAR**
3. **✅ CONTADOR CORRECTO**: "Videos (2)"
4. **✅ GRID DE VIDEOS**
5. **✅ CADA VIDEO CON REPRODUCTOR**
6. **✅ DURACIÓN VISIBLE**: "2:15"

**Probar Reproducción:**
1. Click play en un video
2. **✅ VIDEO DEBE REPRODUCIRSE**
3. **✅ CONTROLES DEBEN FUNCIONAR**
4. **✅ FULLSCREEN DEBE FUNCIONAR**

---

## 🎯 CHECKLIST COMPLETO

### Setup Inicial
- [ ] Bucket `property-videos` creado en Supabase
- [ ] Bucket es público
- [ ] Límite de 100MB configurado
- [ ] MIME types correctos

### Nueva Propiedad
- [ ] Zona de arrastre de videos visible
- [ ] Click abre explorador
- [ ] Explorador muestra solo videos
- [ ] Puedo seleccionar múltiples videos
- [ ] Lista de videos seleccionados aparece
- [ ] Tamaño total se muestra
- [ ] Botón "Subir Videos" funciona
- [ ] Progress bar aparece
- [ ] Videos se suben correctamente
- [ ] Thumbnails se generan
- [ ] Duración se muestra
- [ ] Botón eliminar funciona (hover)
- [ ] Puedo guardar propiedad con videos

### Editar Propiedad
- [ ] Botón "Agregar Más" (imágenes) funciona
- [ ] Explorador muestra solo imágenes
- [ ] Imágenes se suben automáticamente
- [ ] Sección de videos aparece
- [ ] Contador de videos correcto
- [ ] Videos existentes se muestran
- [ ] Puedo reproducir videos
- [ ] Controles del player funcionan
- [ ] Botón eliminar video funciona
- [ ] Botón "Agregar Videos" funciona
- [ ] Explorador muestra solo videos
- [ ] Nuevos videos se suben
- [ ] Progress bar funciona
- [ ] Puedo guardar cambios

### Vista Pública
- [ ] Tabs "Fotos" y "Videos" aparecen
- [ ] Contador de fotos correcto
- [ ] Contador de videos correcto
- [ ] Grid de fotos funciona
- [ ] Grid de videos funciona
- [ ] Reproducción de videos funciona
- [ ] Controles del player funcionan
- [ ] Fullscreen funciona
- [ ] Duración se muestra
- [ ] Diseño responsive (móvil)

---

## 🚨 PROBLEMAS COMUNES

### ❌ No se pueden seleccionar videos
**Solución**: Verificar que el bucket `property-videos` esté creado

### ❌ Error 404 al subir video
**Solución**: Verificar RLS policies del bucket en Supabase

### ❌ Video no se reproduce
**Solución**: Verificar que el bucket sea público

### ❌ Thumbnail no aparece
**Solución**: Es normal en algunos formatos, el reproductor lo maneja

### ❌ "Agregar Más" no abre explorador
**Solución**: Verificar que el input tenga `id="edit-image-upload"`

### ❌ Progress bar se queda en 0%
**Solución**: Verificar conexión a Supabase y autenticación

---

## 📊 VERIFICACIÓN EN BASE DE DATOS

### Después de subir videos:

```sql
-- Ver propiedad con videos
SELECT 
  id,
  code,
  title,
  jsonb_array_length(videos) as video_count,
  videos
FROM properties
WHERE code = 'CA-TEST-001';
```

**Deberías ver:**
```json
{
  "id": 37,
  "code": "CA-TEST-001",
  "title": "Apartamento de Prueba con Videos",
  "video_count": 2,
  "videos": [
    {
      "url": "https://...supabase.co/storage/.../CA-TEST-001/video1.mp4",
      "thumbnail": "https://.../CA-TEST-001/video1-thumb.jpg",
      "title": "video-recorrido.mp4",
      "duration": 125,
      "size": 52428800,
      "uploaded_at": "2025-10-08T15:30:00.000Z"
    },
    ...
  ]
}
```

### Ver todos los archivos en el bucket:

```sql
SELECT 
  name,
  bucket_id,
  created_at
FROM storage.objects
WHERE bucket_id = 'property-videos'
ORDER BY created_at DESC;
```

---

## ✅ RESULTADO ESPERADO

### Si todo funciona correctamente:

1. **✅ Puedes subir videos al crear propiedades**
2. **✅ Puedes subir videos al editar propiedades**
3. **✅ Los videos se organizan por código de propiedad**
4. **✅ Los thumbnails se generan automáticamente**
5. **✅ La duración se calcula automáticamente**
6. **✅ Los videos se reproducen en el admin**
7. **✅ Los videos se reproducen en la vista pública**
8. **✅ El botón "Agregar Más" funciona para imágenes**
9. **✅ Los tabs Fotos/Videos aparecen en la vista pública**
10. **✅ Todo es responsive y funciona en móvil**

---

## 🎉 ¡FELICIDADES!

Si completaste todos los checks, **el sistema de videos está 100% funcional**.

Ahora tus usuarios pueden:
- 📸 Subir fotos (con marca de agua)
- 🎬 Subir videos (con thumbnails automáticos)
- 👀 Ver ambos en la vista pública
- ✏️ Gestionar todo desde el dashboard
- 📱 Ver contenido en cualquier dispositivo

---

**Fecha de Prueba**: _____________
**Realizado por**: _____________
**Estado Final**: [ ] ✅ Todo OK  [ ] ⚠️ Hay problemas

**Notas adicionales**:
_________________________________________
_________________________________________
_________________________________________
