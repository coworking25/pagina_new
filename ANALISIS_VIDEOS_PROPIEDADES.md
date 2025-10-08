# 🎥 ANÁLISIS: Implementación de Videos para Propiedades

## 📊 ESTADO ACTUAL

### ✅ Sistema de Imágenes Funcionando

**Base de Datos:**
- Campo: `images` (tipo: `JSONB` o `TEXT[]`)
- Almacena un array de URLs de imágenes
- Ubicación: Supabase Storage en bucket `property-images`
- Estructura: `property-images/CA-XXX/imagen.jpg`

**Funcionalidades Actuales:**
1. ✅ Subida múltiple de imágenes
2. ✅ Marca de agua automática
3. ✅ Organización por código de propiedad (CA-001, CA-002, etc.)
4. ✅ Vista previa en galería
5. ✅ Selección de imagen de portada (`cover_image`)
6. ✅ Eliminación de imágenes

**Archivos Clave:**
- `src/lib/supabase.ts` - Función `uploadPropertyImage()`
- `src/lib/supabase-images.ts` - Funciones de manejo de imágenes
- `src/pages/AdminProperties.tsx` - Interfaz de administración
- `src/pages/PropertyDetail.tsx` - Vista detalle con galería

---

## 🎯 REQUERIMIENTOS PARA VIDEOS

### 1️⃣ Base de Datos

**Opción A: Campo Separado (RECOMENDADO)**
```sql
-- Agregar nueva columna para videos
ALTER TABLE properties 
ADD COLUMN videos JSONB DEFAULT '[]'::jsonb;

-- Opcionalmente: video de portada
ALTER TABLE properties 
ADD COLUMN cover_video TEXT;

-- Comentarios
COMMENT ON COLUMN properties.videos IS 'Array de URLs de videos de la propiedad';
COMMENT ON COLUMN properties.cover_video IS 'URL del video destacado de la propiedad';
```

**Estructura del JSON:**
```json
{
  "videos": [
    {
      "url": "https://...supabase.co/storage/v1/object/public/property-videos/CA-001/video1.mp4",
      "thumbnail": "https://...supabase.co/storage/v1/object/public/property-videos/CA-001/video1-thumb.jpg",
      "title": "Recorrido exterior",
      "duration": 120,
      "size": 15728640,
      "uploaded_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Opción B: Campo Único Combinado**
```sql
-- Array genérico para medios
ALTER TABLE properties 
ADD COLUMN media JSONB DEFAULT '[]'::jsonb;
```

```json
{
  "media": [
    {
      "type": "image",
      "url": "https://...",
      "is_cover": true
    },
    {
      "type": "video", 
      "url": "https://...",
      "thumbnail": "https://...",
      "duration": 120
    }
  ]
}
```

---

### 2️⃣ Supabase Storage

**Nuevo Bucket: `property-videos`**

**Configuración Requerida:**
```sql
-- 1. Crear bucket para videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-videos', 'property-videos', true);

-- 2. Políticas RLS para videos (igual que imágenes)
CREATE POLICY "Videos públicos para lectura" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'property-videos');

CREATE POLICY "Usuarios autenticados pueden subir videos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'property-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios autenticados pueden actualizar videos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'property-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar videos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'property-videos' AND auth.role() = 'authenticated');
```

**Estructura de Carpetas:**
```
property-videos/
├── CA-001/
│   ├── video-recorrido-exterior.mp4
│   ├── video-recorrido-interior.mp4
│   └── thumbnails/
│       ├── video-recorrido-exterior-thumb.jpg
│       └── video-recorrido-interior-thumb.jpg
├── CA-002/
│   └── ...
```

**Consideraciones de Tamaño:**
- Máximo por archivo: **100 MB** (configurar en Supabase)
- Formatos permitidos: MP4, WebM, MOV
- Compresión recomendada: H.264 para compatibilidad
- Resolución recomendada: 1080p máximo

---

### 3️⃣ TypeScript Types

**Actualizar `src/types/index.ts`:**

```typescript
export interface PropertyVideo {
  url: string;
  thumbnail?: string;
  title?: string;
  duration?: number; // segundos
  size?: number; // bytes
  uploaded_at?: string;
  order?: number;
}

export interface Property {
  id: number;
  code?: string;
  title: string;
  price: number;
  // ... campos existentes ...
  images: string[];
  videos?: PropertyVideo[]; // NUEVO
  cover_image?: string;
  cover_video?: string; // NUEVO - URL del video destacado
  // ... resto de campos ...
}
```

---

### 4️⃣ Funciones de Supabase

**Crear `src/lib/supabase-videos.ts`:**

```typescript
import { supabase } from './supabase';

// Validar tipo de archivo
function isValidVideoFile(file: File): boolean {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  return validTypes.includes(file.type);
}

// Subir video individual
export async function uploadPropertyVideo(
  file: File, 
  propertyCode: string,
  onProgress?: (progress: number) => void
): Promise<PropertyVideo> {
  
  // Validaciones
  if (!isValidVideoFile(file)) {
    throw new Error('Formato no válido. Solo MP4, WebM y MOV permitidos.');
  }
  
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    throw new Error('Archivo muy grande. Máximo 100MB.');
  }
  
  // Generar nombre único
  const timestamp = Date.now();
  const fileName = `${propertyCode}-${timestamp}.${file.name.split('.').pop()}`;
  const filePath = `${propertyCode}/${fileName}`;
  
  console.log(`📤 Subiendo video: ${filePath}`);
  
  // Subir archivo
  const { data, error } = await supabase.storage
    .from('property-videos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('❌ Error subiendo video:', error);
    throw error;
  }
  
  // Obtener URL pública
  const { data: publicUrlData } = supabase.storage
    .from('property-videos')
    .getPublicUrl(filePath);
  
  // Generar thumbnail (opcional - requiere procesamiento)
  const thumbnail = await generateVideoThumbnail(publicUrlData.publicUrl);
  
  return {
    url: publicUrlData.publicUrl,
    thumbnail,
    title: file.name,
    size: file.size,
    uploaded_at: new Date().toISOString()
  };
}

// Generar thumbnail del video (usando canvas)
async function generateVideoThumbnail(videoUrl: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    
    video.addEventListener('loadeddata', () => {
      video.currentTime = 1; // Capturar en segundo 1
    });
    
    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            // Subir thumbnail
            const thumbFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
            const thumbPath = videoUrl.replace(/\.(mp4|webm|mov)$/i, '-thumb.jpg');
            
            const { data } = await supabase.storage
              .from('property-videos')
              .upload(thumbPath, thumbFile);
            
            if (data) {
              const { data: thumbUrl } = supabase.storage
                .from('property-videos')
                .getPublicUrl(thumbPath);
              resolve(thumbUrl.publicUrl);
            }
          }
          resolve(undefined);
        }, 'image/jpeg', 0.8);
      } else {
        resolve(undefined);
      }
    });
  });
}

// Obtener videos de una propiedad
export async function getPropertyVideos(propertyCode: string): Promise<PropertyVideo[]> {
  try {
    const { data, error } = await supabase.storage
      .from('property-videos')
      .list(propertyCode, {
        limit: 20,
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error('❌ Error obteniendo videos:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Filtrar solo archivos de video (no thumbnails)
    const videoFiles = data.filter(file => 
      !file.name.includes('-thumb.') && 
      /\.(mp4|webm|mov)$/i.test(file.name)
    );
    
    // Generar URLs y metadatos
    return videoFiles.map(file => {
      const { data: publicUrlData } = supabase.storage
        .from('property-videos')
        .getPublicUrl(`${propertyCode}/${file.name}`);
      
      const thumbnailPath = `${propertyCode}/${file.name.replace(/\.(mp4|webm|mov)$/i, '-thumb.jpg')}`;
      const { data: thumbUrlData } = supabase.storage
        .from('property-videos')
        .getPublicUrl(thumbnailPath);
      
      return {
        url: publicUrlData.publicUrl,
        thumbnail: thumbUrlData.publicUrl,
        title: file.name,
        size: file.metadata?.size,
        uploaded_at: file.created_at
      };
    });
    
  } catch (error) {
    console.error('❌ Error en getPropertyVideos:', error);
    return [];
  }
}

// Eliminar video
export async function deletePropertyVideo(videoUrl: string): Promise<boolean> {
  try {
    // Extraer path del video
    const urlParts = videoUrl.split('/property-videos/');
    if (urlParts.length < 2) {
      throw new Error('URL de video inválida');
    }
    
    const filePath = urlParts[1];
    
    // Eliminar video
    const { error: videoError } = await supabase.storage
      .from('property-videos')
      .remove([filePath]);
    
    if (videoError) {
      console.error('❌ Error eliminando video:', videoError);
      return false;
    }
    
    // Eliminar thumbnail asociado
    const thumbPath = filePath.replace(/\.(mp4|webm|mov)$/i, '-thumb.jpg');
    await supabase.storage
      .from('property-videos')
      .remove([thumbPath]);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en deletePropertyVideo:', error);
    return false;
  }
}

// Actualizar videos en la base de datos
export async function updatePropertyVideos(
  propertyId: number, 
  videos: PropertyVideo[]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('properties')
      .update({ videos })
      .eq('id', propertyId);
    
    if (error) {
      console.error('❌ Error actualizando videos:', error);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en updatePropertyVideos:', error);
    return false;
  }
}
```

---

### 5️⃣ Componente UI para Videos

**Crear `src/components/VideoPlayer.tsx`:**

```typescript
import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  thumbnail?: string;
  title?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  thumbnail, 
  title,
  className = '' 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        className="w-full h-full object-cover rounded-lg"
        onClick={togglePlay}
      >
        Tu navegador no soporta videos HTML5.
      </video>

      {/* Controles */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
          <div className="flex items-center justify-between">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>

            <div className="flex items-center space-x-3">
              {/* Mute */}
              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-blue-400 transition-colors"
              >
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>

          {title && (
            <p className="text-white text-sm mt-2">{title}</p>
          )}
        </div>
      )}

      {/* Play button overlay */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg cursor-pointer"
          onClick={togglePlay}
        >
          <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors">
            <Play className="h-12 w-12 text-blue-600 ml-1" />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
```

---

### 6️⃣ Integración en AdminProperties

**Actualizar `src/pages/AdminProperties.tsx`:**

```typescript
import { uploadPropertyVideo, getPropertyVideos, deletePropertyVideo } from '../lib/supabase-videos';
import VideoPlayer from '../components/VideoPlayer';

// Agregar estados
const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
const [uploadingVideos, setUploadingVideos] = useState(false);
const [videoUploadProgress, setVideoUploadProgress] = useState(0);

// Handler para seleccionar videos
const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  const validVideos = files.filter(file => {
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    return validTypes.includes(file.type) && file.size <= 100 * 1024 * 1024;
  });
  
  if (validVideos.length !== files.length) {
    alert('Algunos archivos no son válidos. Solo MP4, WebM y MOV hasta 100MB.');
  }
  
  setSelectedVideos(prev => [...prev, ...validVideos]);
};

// Handler para subir videos
const handleUploadVideos = async () => {
  if (selectedVideos.length === 0) return;
  
  const propertyCode = formData.code || await generatePropertyCode();
  
  setUploadingVideos(true);
  try {
    const uploadedVideos: PropertyVideo[] = [];
    
    for (let i = 0; i < selectedVideos.length; i++) {
      const video = selectedVideos[i];
      setVideoUploadProgress(((i + 1) / selectedVideos.length) * 100);
      
      const videoData = await uploadPropertyVideo(video, propertyCode);
      uploadedVideos.push(videoData);
    }
    
    // Actualizar formData
    setFormData(prev => ({
      ...prev,
      videos: [...(prev.videos || []), ...uploadedVideos]
    }));
    
    setSelectedVideos([]);
    alert('✅ Videos subidos exitosamente');
    
  } catch (error) {
    console.error('Error subiendo videos:', error);
    alert('Error al subir videos');
  } finally {
    setUploadingVideos(false);
    setVideoUploadProgress(0);
  }
};

// JSX para sección de videos en el modal
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Videos de la Propiedad
    </label>
    <label className="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
      <Upload className="inline h-4 w-4 mr-2" />
      Agregar Videos
      <input
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        multiple
        onChange={handleVideoSelect}
        className="hidden"
      />
    </label>
  </div>

  {/* Videos seleccionados para subir */}
  {selectedVideos.length > 0 && (
    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
      <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
        {selectedVideos.length} video(s) seleccionado(s)
      </p>
      <button
        onClick={handleUploadVideos}
        disabled={uploadingVideos}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
      >
        {uploadingVideos ? `Subiendo... ${videoUploadProgress.toFixed(0)}%` : 'Subir Videos'}
      </button>
    </div>
  )}

  {/* Grid de videos existentes */}
  {formData.videos && formData.videos.length > 0 && (
    <div className="grid grid-cols-2 gap-4">
      {formData.videos.map((video, index) => (
        <div key={index} className="relative group">
          <VideoPlayer
            src={video.url}
            thumbnail={video.thumbnail}
            title={video.title}
            className="h-48"
          />
          <button
            onClick={() => {
              // Eliminar video
              const newVideos = formData.videos.filter((_, i) => i !== index);
              setFormData(prev => ({ ...prev, videos: newVideos }));
            }}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )}
</div>
```

---

### 7️⃣ Integración en PropertyDetail

**Actualizar `src/pages/PropertyDetail.tsx`:**

```typescript
import VideoPlayer from '../components/VideoPlayer';
import { Film } from 'lucide-react';

// Agregar tab para videos
const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');

// JSX para tabs y contenido
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
  {/* Tabs */}
  <div className="flex border-b border-gray-200 dark:border-gray-700">
    <button
      onClick={() => setActiveTab('images')}
      className={`flex-1 px-6 py-3 font-medium transition-colors ${
        activeTab === 'images'
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Camera className="inline h-5 w-5 mr-2" />
      Fotos ({property.images.length})
    </button>
    <button
      onClick={() => setActiveTab('videos')}
      className={`flex-1 px-6 py-3 font-medium transition-colors ${
        activeTab === 'videos'
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Film className="inline h-5 w-5 mr-2" />
      Videos ({property.videos?.length || 0})
    </button>
  </div>

  {/* Contenido */}
  <div className="p-6">
    {activeTab === 'images' && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {property.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${property.title} ${index + 1}`}
            className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => {
              setCurrentImageIndex(index);
              setIsGalleryOpen(true);
            }}
          />
        ))}
      </div>
    )}

    {activeTab === 'videos' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {property.videos && property.videos.length > 0 ? (
          property.videos.map((video, index) => (
            <VideoPlayer
              key={index}
              src={video.url}
              thumbnail={video.thumbnail}
              title={video.title}
              className="h-80"
            />
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 col-span-2 text-center py-8">
            No hay videos disponibles para esta propiedad
          </p>
        )}
      </div>
    )}
  </div>
</div>
```

---

## 📝 PASOS DE IMPLEMENTACIÓN

### Fase 1: Base de Datos ⏱️ 30 min
1. ✅ Ejecutar SQL para agregar columna `videos`
2. ✅ Crear bucket `property-videos` en Supabase
3. ✅ Configurar políticas RLS
4. ✅ Verificar permisos

### Fase 2: Backend ⏱️ 2 horas
1. ✅ Actualizar types en `src/types/index.ts`
2. ✅ Crear `src/lib/supabase-videos.ts`
3. ✅ Agregar funciones de upload/delete/get
4. ✅ Implementar generación de thumbnails
5. ✅ Testing de funciones

### Fase 3: UI Components ⏱️ 3 horas
1. ✅ Crear `VideoPlayer.tsx`
2. ✅ Actualizar `AdminProperties.tsx`
3. ✅ Actualizar `PropertyDetail.tsx`
4. ✅ Agregar indicadores de progreso
5. ✅ Validaciones en frontend

### Fase 4: Testing ⏱️ 1 hora
1. ✅ Probar subida de videos
2. ✅ Verificar reproducción
3. ✅ Probar eliminación
4. ✅ Validar thumbnails
5. ✅ Testing en móvil

### Fase 5: Optimización ⏱️ 1 hora
1. ✅ Lazy loading de videos
2. ✅ Compresión automática (opcional)
3. ✅ Cache de thumbnails
4. ✅ Mejoras de UX

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 🔒 Seguridad
- ✅ Validar tipos de archivo en backend
- ✅ Limitar tamaño máximo (100MB recomendado)
- ✅ Sanitizar nombres de archivo
- ✅ Verificar permisos de usuario

### 📊 Performance
- ⚠️ Videos consumen mucho ancho de banda
- ⚠️ Implementar lazy loading
- ⚠️ Usar formatos comprimidos (H.264)
- ⚠️ Considerar CDN para videos populares

### 💰 Costos Supabase
- Storage: ~$0.021/GB/mes
- Bandwidth: ~$0.09/GB
- **Estimación**: 20 propiedades × 2 videos × 50MB = ~2GB storage
- Costo mensual estimado: ~$0.05 + bandwidth

### 🎨 UX
- Mostrar previews con thumbnails
- Indicar duración del video
- Botón de play visible
- Controles intuitivos
- Modo fullscreen

---

## 🚀 FEATURES OPCIONALES (Futuro)

### 1. Procesamiento de Video
- Conversión automática a múltiples resoluciones (360p, 720p, 1080p)
- Generación de thumbnails animados (GIF)
- Marca de agua en videos
- Compresión automática

### 2. Analytics
- Trackear visualizaciones de videos
- Tiempo de reproducción
- Videos más vistos
- Engagement por propiedad

### 3. Tour Virtual 360°
- Integración con Matterport/Kuula
- Viewer 360° embebido
- Navegación entre habitaciones

### 4. Streaming
- HLS/DASH para mejor performance
- Adaptive bitrate streaming
- Preload inteligente

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Base de Datos
- [ ] Ejecutar SQL en Supabase para agregar columna `videos`
- [ ] Crear bucket `property-videos`
- [ ] Configurar políticas RLS
- [ ] Probar permisos

### Código Backend
- [ ] Actualizar `src/types/index.ts`
- [ ] Crear `src/lib/supabase-videos.ts`
- [ ] Agregar funciones a `src/lib/supabase.ts`
- [ ] Exportar funciones necesarias

### Componentes UI
- [ ] Crear `VideoPlayer.tsx`
- [ ] Actualizar `AdminProperties.tsx`
- [ ] Actualizar `PropertyDetail.tsx`
- [ ] Actualizar `Properties.tsx` (tarjetas)

### Testing
- [ ] Probar upload de video
- [ ] Probar reproducción
- [ ] Probar eliminación
- [ ] Verificar responsive
- [ ] Testing en diferentes navegadores

### Documentación
- [ ] Actualizar manual de usuario
- [ ] Documentar limitaciones
- [ ] Guía de mejores prácticas

---

## 📚 REFERENCIAS

**Supabase Storage:**
- Docs: https://supabase.com/docs/guides/storage
- Limits: https://supabase.com/docs/guides/storage/limits

**HTML5 Video:**
- MDN: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
- Can I Use: https://caniuse.com/video

**Formatos de Video:**
- H.264/MP4: Mejor compatibilidad
- WebM: Mejor compresión
- Resolución: 1080p máximo para web

---

**Documento creado:** 2024-10-08
**Última actualización:** 2024-10-08
**Estado:** ✅ READY FOR IMPLEMENTATION
