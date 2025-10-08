# 🎬 RESUMEN EJECUTIVO: Agregar Videos a Propiedades

## 📋 SITUACIÓN ACTUAL

### ✅ Lo que ya funciona:
- **Sistema de imágenes completo** con upload, galería, eliminación
- **Bucket en Supabase**: `property-images` organizadas por código (CA-001, CA-002, etc.)
- **Marca de agua automática** en imágenes
- **Interfaz de administración** en AdminProperties.tsx
- **Visualización** en PropertyDetail.tsx con galería y lightbox

### 🎯 Lo que necesitamos:
- Poder subir **videos** además de imágenes
- Ver videos en la página de detalle
- Gestionar videos desde el dashboard admin
- Mantener la misma organización por código de propiedad

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### PASO 1: Base de Datos (15 min) ⭐ CRÍTICO

**Archivo:** `sql/13_add_videos_support.sql` ✅ CREADO

**Acciones:**
1. Ir a Supabase → SQL Editor
2. Copiar y pegar el contenido de `sql/13_add_videos_support.sql`
3. Ejecutar el script
4. Verificar que se crearon las columnas `videos` y `cover_video`

**Lo que hace:**
```sql
ALTER TABLE properties ADD COLUMN videos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE properties ADD COLUMN cover_video TEXT;
```

**Crear bucket manualmente:**
1. Ir a Supabase → Storage
2. Crear nuevo bucket: `property-videos`
3. Marcar como público ✅
4. Configurar límite: 100 MB por archivo

---

### PASO 2: Actualizar Types (5 min)

**Archivo:** `src/types/index.ts`

**Agregar al final del archivo:**

```typescript
export interface PropertyVideo {
  url: string;
  thumbnail?: string;
  title?: string;
  duration?: number;
  size?: number;
  uploaded_at?: string;
  order?: number;
}
```

**Modificar interface Property** - Agregar estas líneas:

```typescript
export interface Property {
  // ... campos existentes ...
  images: string[];
  videos?: PropertyVideo[]; // 👈 NUEVO
  cover_image?: string;
  cover_video?: string; // 👈 NUEVO
  // ... resto de campos ...
}
```

---

### PASO 3: Crear Librería de Videos (30 min)

**Crear archivo:** `src/lib/supabase-videos.ts`

**Código completo en:** `ANALISIS_VIDEOS_PROPIEDADES.md` sección 4

**Funciones principales:**
- ✅ `uploadPropertyVideo()` - Subir un video
- ✅ `getPropertyVideos()` - Obtener videos de una propiedad
- ✅ `deletePropertyVideo()` - Eliminar video
- ✅ `updatePropertyVideos()` - Actualizar lista en BD
- ✅ `generateVideoThumbnail()` - Crear preview automático

---

### PASO 4: Crear Componente VideoPlayer (30 min)

**Crear archivo:** `src/components/VideoPlayer.tsx`

**Código completo en:** `ANALISIS_VIDEOS_PROPIEDADES.md` sección 5

**Características:**
- ✅ Controles personalizados (play/pause/mute/fullscreen)
- ✅ Thumbnail como preview
- ✅ Overlay con botón de play
- ✅ Responsive y accesible

---

### PASO 5: Actualizar AdminProperties (1 hora)

**Archivo:** `src/pages/AdminProperties.tsx`

**Importar:**
```typescript
import { uploadPropertyVideo, getPropertyVideos, deletePropertyVideo } from '../lib/supabase-videos';
import VideoPlayer from '../components/VideoPlayer';
import { Film } from 'lucide-react'; // Si no está ya importado
```

**Agregar estados:**
```typescript
const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
const [uploadingVideos, setUploadingVideos] = useState(false);
const [videoUploadProgress, setVideoUploadProgress] = useState(0);
```

**Agregar en el formulario del modal** (después de la sección de imágenes):

Ver código completo en: `ANALISIS_VIDEOS_PROPIEDADES.md` sección 6

---

### PASO 6: Actualizar PropertyDetail (1 hora)

**Archivo:** `src/pages/PropertyDetail.tsx`

**Importar:**
```typescript
import VideoPlayer from '../components/VideoPlayer';
import { Film } from 'lucide-react';
```

**Agregar estado para tabs:**
```typescript
const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
```

**Agregar tabs y grid de videos:**

Ver código completo en: `ANALISIS_VIDEOS_PROPIEDADES.md` sección 7

---

### PASO 7: Actualizar supabase.ts (15 min)

**Archivo:** `src/lib/supabase.ts`

**Agregar al final de las exportaciones:**

```typescript
// Re-exportar funciones de videos
export { 
  uploadPropertyVideo, 
  getPropertyVideos, 
  deletePropertyVideo,
  updatePropertyVideos 
} from './supabase-videos';
```

---

## ⚡ INICIO RÁPIDO (Para empezar YA)

### Opción A: Solo Base de Datos (5 min)

Si quieres preparar la base de datos primero:

```bash
# 1. Ir a Supabase Dashboard
# 2. SQL Editor → New Query
# 3. Pegar contenido de: sql/13_add_videos_support.sql
# 4. Ejecutar
# 5. Crear bucket 'property-videos' en Storage
```

### Opción B: Implementación Completa (3 horas)

```bash
# 1. Ejecutar SQL (15 min)
# 2. Crear src/lib/supabase-videos.ts (30 min)
# 3. Crear src/components/VideoPlayer.tsx (30 min)
# 4. Actualizar types (5 min)
# 5. Actualizar AdminProperties.tsx (1 hora)
# 6. Actualizar PropertyDetail.tsx (1 hora)
# 7. Testing (30 min)
```

---

## 🧪 CÓMO PROBAR

### Test 1: Subida de Video

1. Ir al Dashboard Admin
2. Editar una propiedad existente
3. En la sección "Videos", hacer clic en "Agregar Videos"
4. Seleccionar un archivo MP4 (máx 100MB)
5. Subir y verificar que aparece en la lista

### Test 2: Visualización

1. Ir a la página de detalle de la propiedad
2. Hacer clic en tab "Videos"
3. Hacer clic en play
4. Verificar que se reproduce correctamente
5. Probar fullscreen

### Test 3: Eliminación

1. Editar la propiedad
2. Hacer hover sobre un video
3. Clic en el botón de eliminar
4. Verificar que desaparece

---

## 📊 ESTRUCTURA DE ARCHIVOS

```
src/
├── types/
│   └── index.ts                    ← Actualizar (agregar PropertyVideo)
├── lib/
│   ├── supabase.ts                 ← Actualizar (exportar funciones)
│   └── supabase-videos.ts          ← CREAR NUEVO
├── components/
│   └── VideoPlayer.tsx             ← CREAR NUEVO
└── pages/
    ├── AdminProperties.tsx         ← Actualizar (sección videos)
    └── PropertyDetail.tsx          ← Actualizar (tab videos)

sql/
└── 13_add_videos_support.sql       ← EJECUTAR EN SUPABASE
```

---

## 💾 EJEMPLO DE DATOS

### Cómo se guardan los videos en la BD:

```json
{
  "id": 1,
  "code": "CA-001",
  "title": "Apartamento en Envigado",
  "images": [
    "https://.../CA-001/imagen1.jpg",
    "https://.../CA-001/imagen2.jpg"
  ],
  "videos": [
    {
      "url": "https://.../property-videos/CA-001/recorrido.mp4",
      "thumbnail": "https://.../property-videos/CA-001/recorrido-thumb.jpg",
      "title": "Recorrido completo",
      "duration": 120,
      "size": 15728640,
      "uploaded_at": "2024-10-08T10:30:00Z"
    }
  ],
  "cover_video": "https://.../property-videos/CA-001/recorrido.mp4"
}
```

### Estructura en Supabase Storage:

```
property-videos/
├── CA-001/
│   ├── recorrido-exterior.mp4
│   ├── recorrido-exterior-thumb.jpg
│   ├── recorrido-interior.mp4
│   └── recorrido-interior-thumb.jpg
├── CA-002/
│   └── tour-virtual.mp4
```

---

## ⚠️ LIMITACIONES Y CONSIDERACIONES

### Tamaños y Formatos

| Aspecto | Límite |
|---------|--------|
| Tamaño máximo | 100 MB por archivo |
| Formatos | MP4, WebM, MOV |
| Resolución recomendada | 1080p máximo |
| Duración recomendada | 2-3 minutos |

### Costos Estimados (Supabase)

| Concepto | Costo |
|----------|-------|
| Storage (por GB/mes) | $0.021 |
| Bandwidth (por GB) | $0.09 |
| **Ejemplo:** 20 propiedades, 2 videos c/u, 50MB | ~$0.05/mes + bandwidth |

### Performance

- ⚠️ Los videos se cargan **on-demand** (no preload)
- ⚠️ Primera reproducción puede tardar según conexión
- ✅ Los thumbnails son ligeros y se cargan rápido
- ✅ El player es responsive y funciona en móviles

---

## 🔧 TROUBLESHOOTING

### Error: "No se puede subir el video"

**Solución:**
1. Verificar que el bucket `property-videos` existe
2. Verificar políticas RLS en Supabase
3. Comprobar que el archivo es menor a 100MB
4. Verificar formato (MP4, WebM, MOV)

### Error: "El video no se reproduce"

**Solución:**
1. Verificar que el bucket es público
2. Abrir la URL del video directamente en el navegador
3. Verificar formato de video (H.264 recomendado)
4. Comprobar consola del navegador

### Error: "No aparece el thumbnail"

**Solución:**
1. El thumbnail se genera automáticamente
2. Si falla, aparecerá el poster del video
3. Verificar que la función `generateVideoThumbnail()` se ejecutó

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **Análisis completo:** `ANALISIS_VIDEOS_PROPIEDADES.md`
- **SQL script:** `sql/13_add_videos_support.sql`
- **Supabase Storage:** https://supabase.com/docs/guides/storage
- **HTML5 Video:** https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Pre-implementación
- [ ] Leer `ANALISIS_VIDEOS_PROPIEDADES.md`
- [ ] Tener acceso a Supabase Dashboard
- [ ] Backup de la base de datos (recomendado)

### Implementación
- [ ] Ejecutar `sql/13_add_videos_support.sql`
- [ ] Crear bucket `property-videos`
- [ ] Crear `src/lib/supabase-videos.ts`
- [ ] Crear `src/components/VideoPlayer.tsx`
- [ ] Actualizar `src/types/index.ts`
- [ ] Actualizar `src/pages/AdminProperties.tsx`
- [ ] Actualizar `src/pages/PropertyDetail.tsx`
- [ ] Actualizar `src/lib/supabase.ts` (exports)

### Testing
- [ ] Subir video desde admin
- [ ] Ver video en detalle
- [ ] Reproducir video
- [ ] Eliminar video
- [ ] Probar en móvil
- [ ] Verificar thumbnails

### Deploy
- [ ] Commit cambios
- [ ] Push a repositorio
- [ ] Deploy a producción
- [ ] Verificar en producción

---

## 🎉 SIGUIENTE PASO

**¿Quieres empezar?**

1. **Ejecuta el SQL primero:** `sql/13_add_videos_support.sql`
2. **Crea el bucket** en Supabase Storage
3. **Avísame cuando esté listo** y seguimos con el código

**¿Tienes dudas?**

- Pregunta sobre cualquier paso específico
- Puedo generar el código completo de cualquier archivo
- Puedo ayudar con el troubleshooting

---

**Creado:** 2024-10-08  
**Tiempo estimado total:** 3-4 horas  
**Dificultad:** ⭐⭐⭐ (Intermedia)  
**Estado:** ✅ LISTO PARA IMPLEMENTAR
