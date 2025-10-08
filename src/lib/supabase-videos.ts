import { supabase } from './supabase';

// ==========================================
// TIPOS Y INTERFACES
// ==========================================

export interface PropertyVideo {
  url: string;
  thumbnail?: string;
  title?: string;
  duration?: number;
  size?: number;
  uploaded_at?: string;
  order?: number;
}

// ==========================================
// VALIDACIONES
// ==========================================

function isValidVideoFile(file: File): boolean {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  return validTypes.includes(file.type);
}

function validateVideoFile(file: File): void {
  if (!isValidVideoFile(file)) {
    throw new Error('Formato no válido. Solo MP4, WebM y MOV permitidos.');
  }
  
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    throw new Error('Archivo muy grande. Máximo 100MB por video.');
  }
}

// ==========================================
// GENERACIÓN DE THUMBNAILS
// ==========================================

async function generateVideoThumbnail(videoUrl: string, propertyCode: string, videoFileName: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    
    video.addEventListener('loadedmetadata', () => {
      // Capturar en el segundo 1 o 10% del video, lo que sea menor
      const captureTime = Math.min(1, video.duration * 0.1);
      video.currentTime = captureTime;
    });
    
    video.addEventListener('seeked', async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }

        // Dibujar el frame del video
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir a blob
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve(undefined);
            return;
          }

          try {
            // Nombre del thumbnail
            const thumbFileName = videoFileName.replace(/\.(mp4|webm|mov)$/i, '-thumb.jpg');
            const thumbPath = `${propertyCode}/${thumbFileName}`;
            
            // Subir thumbnail
            const { error } = await supabase.storage
              .from('property-videos')
              .upload(thumbPath, blob, {
                cacheControl: '3600',
                upsert: true
              });
            
            if (error) {
              console.error('❌ Error subiendo thumbnail:', error);
              resolve(undefined);
              return;
            }

            // Obtener URL pública del thumbnail
            const { data: thumbUrlData } = supabase.storage
              .from('property-videos')
              .getPublicUrl(thumbPath);
            
            console.log('✅ Thumbnail generado:', thumbUrlData.publicUrl);
            resolve(thumbUrlData.publicUrl);
            
          } catch (error) {
            console.error('❌ Error procesando thumbnail:', error);
            resolve(undefined);
          }
        }, 'image/jpeg', 0.8);
        
      } catch (error) {
        console.error('❌ Error generando thumbnail:', error);
        resolve(undefined);
      }
    });

    video.addEventListener('error', () => {
      console.error('❌ Error cargando video para thumbnail');
      resolve(undefined);
    });
  });
}

// ==========================================
// FUNCIONES DE SUBIDA
// ==========================================

export async function uploadPropertyVideo(
  file: File, 
  propertyCode: string,
  onProgress?: (progress: number) => void
): Promise<PropertyVideo> {
  
  console.log(`📤 Subiendo video para propiedad ${propertyCode}...`);
  
  // Validar archivo
  validateVideoFile(file);
  
  // Generar nombre único
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${propertyCode}-${timestamp}.${fileExt}`;
  const filePath = `${propertyCode}/${fileName}`;
  
  console.log(`📁 Ruta de video: ${filePath}`);
  
  try {
    // Subir video a Supabase Storage
    const { data, error } = await supabase.storage
      .from('property-videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Error subiendo video:', error);
      throw new Error(`Error al subir el video: ${error.message}`);
    }
    
    console.log('✅ Video subido exitosamente:', data.path);
    
    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('property-videos')
      .getPublicUrl(filePath);
    
    const videoUrl = publicUrlData.publicUrl;
    
    // Generar thumbnail de forma asíncrona
    console.log('🎨 Generando thumbnail del video...');
    const thumbnail = await generateVideoThumbnail(videoUrl, propertyCode, fileName);
    
    // Obtener duración del video
    const duration = await getVideoDuration(videoUrl);
    
    return {
      url: videoUrl,
      thumbnail,
      title: file.name,
      size: file.size,
      duration,
      uploaded_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error en uploadPropertyVideo:', error);
    throw error;
  }
}

// Función auxiliar para obtener duración del video
function getVideoDuration(videoUrl: string): Promise<number | undefined> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.preload = 'metadata';
    
    video.addEventListener('loadedmetadata', () => {
      resolve(Math.round(video.duration));
    });
    
    video.addEventListener('error', () => {
      resolve(undefined);
    });
  });
}

// ==========================================
// SUBIDA MÚLTIPLE
// ==========================================

export async function bulkUploadPropertyVideos(
  files: File[], 
  propertyCode: string,
  onProgress?: (current: number, total: number) => void
): Promise<PropertyVideo[]> {
  
  console.log(`📤 Subida masiva: ${files.length} videos para ${propertyCode}`);
  
  const uploadedVideos: PropertyVideo[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      onProgress?.(i + 1, files.length);
      
      const videoData = await uploadPropertyVideo(files[i], propertyCode);
      uploadedVideos.push(videoData);
      
      console.log(`✅ Video ${i + 1}/${files.length} subido`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`❌ Error subiendo ${files[i].name}:`, error);
      errors.push(`${files[i].name}: ${errorMsg}`);
    }
  }
  
  if (errors.length > 0) {
    console.warn('⚠️ Algunos videos no se pudieron subir:', errors);
  }
  
  console.log(`✅ Subida completada: ${uploadedVideos.length}/${files.length} exitosas`);
  return uploadedVideos;
}

// ==========================================
// OBTENER VIDEOS
// ==========================================

export async function getPropertyVideos(propertyCode: string): Promise<PropertyVideo[]> {
  try {
    console.log(`🖼️ Obteniendo videos para propiedad ${propertyCode}...`);
    
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
      console.log(`📭 No se encontraron videos para ${propertyCode}`);
      return [];
    }
    
    // Filtrar solo archivos de video (no thumbnails)
    const videoFiles = data.filter(file => 
      !file.name.includes('-thumb.') && 
      /\.(mp4|webm|mov|avi)$/i.test(file.name)
    );
    
    // Generar URLs y metadatos
    const videos: PropertyVideo[] = videoFiles.map(file => {
      const { data: publicUrlData } = supabase.storage
        .from('property-videos')
        .getPublicUrl(`${propertyCode}/${file.name}`);
      
      // Buscar thumbnail asociado
      const thumbnailPath = `${propertyCode}/${file.name.replace(/\.(mp4|webm|mov|avi)$/i, '-thumb.jpg')}`;
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
    
    console.log(`✅ ${videos.length} videos encontrados para ${propertyCode}`);
    return videos;
    
  } catch (error) {
    console.error('❌ Error en getPropertyVideos:', error);
    return [];
  }
}

// ==========================================
// ELIMINAR VIDEOS
// ==========================================

export async function deletePropertyVideo(videoUrl: string): Promise<boolean> {
  try {
    console.log(`🗑️ Eliminando video: ${videoUrl}`);
    
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
    
    console.log('✅ Video eliminado:', filePath);
    
    // Intentar eliminar thumbnail asociado (no es crítico si falla)
    const thumbPath = filePath.replace(/\.(mp4|webm|mov|avi)$/i, '-thumb.jpg');
    await supabase.storage
      .from('property-videos')
      .remove([thumbPath]);
    
    console.log('✅ Thumbnail eliminado (si existía)');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en deletePropertyVideo:', error);
    return false;
  }
}

// ==========================================
// ACTUALIZAR BASE DE DATOS
// ==========================================

export async function updatePropertyVideos(
  propertyId: number, 
  videos: PropertyVideo[]
): Promise<boolean> {
  try {
    console.log(`💾 Actualizando videos en BD para propiedad ${propertyId}`);
    
    const { error } = await supabase
      .from('properties')
      .update({ videos })
      .eq('id', propertyId);
    
    if (error) {
      console.error('❌ Error actualizando videos en BD:', error);
      return false;
    }
    
    console.log(`✅ Videos actualizados en BD para propiedad ${propertyId}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error en updatePropertyVideos:', error);
    return false;
  }
}

// ==========================================
// EXPORTACIONES
// ==========================================

export {
  type PropertyVideo as default
};
