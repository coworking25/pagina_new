import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Función mejorada para subir imágenes organizadas por código de propiedad
async function uploadPropertyImageWithCode(file: File, propertyCode: string): Promise<string> {
  try {
    console.log(`📤 Subiendo imagen para propiedad ${propertyCode}...`);
    
    // Validar archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Formato de archivo no válido. Solo JPG, PNG y WebP permitidos.');
    }
    
    if (file.size > maxSize) {
      throw new Error('Archivo muy grande. Máximo 5MB por imagen.');
    }
    
    // Generar nombre único pero organizado
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${timestamp}.${fileExt}`;
    const filePath = `${propertyCode}/${fileName}`;
    
    console.log(`📁 Ruta del archivo: ${filePath}`);
    
    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Error subiendo imagen:', error);
      throw error;
    }
    
    console.log('✅ Imagen subida exitosamente:', data.path);
    
    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
    
  } catch (error) {
    console.error('❌ Error en uploadPropertyImageWithCode:', error);
    throw error;
  }
}

// Función para obtener todas las imágenes de una propiedad
async function getPropertyImages(propertyCode: string): Promise<string[]> {
  try {
    console.log(`🖼️ Obteniendo imágenes para propiedad ${propertyCode}...`);
    
    const { data, error } = await supabase.storage
      .from('property-images')
      .list(propertyCode, {
        limit: 20,
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error('❌ Error obteniendo imágenes:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`📭 No se encontraron imágenes para ${propertyCode}`);
      return [];
    }
    
    // Generar URLs públicas
    const imageUrls = data.map(file => {
      const { data: publicUrlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(`${propertyCode}/${file.name}`);
      return publicUrlData.publicUrl;
    });
    
    console.log(`✅ ${imageUrls.length} imágenes encontradas para ${propertyCode}`);
    return imageUrls;
    
  } catch (error) {
    console.error('❌ Error en getPropertyImages:', error);
    return [];
  }
}

// Función para eliminar imagen específica
async function deletePropertyImageByPath(propertyCode: string, fileName: string): Promise<boolean> {
  try {
    const filePath = `${propertyCode}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('property-images')
      .remove([filePath]);
    
    if (error) {
      console.error('❌ Error eliminando imagen:', error);
      return false;
    }
    
    console.log(`✅ Imagen eliminada: ${filePath}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error en deletePropertyImageByPath:', error);
    return false;
  }
}

// Función para crear estructura de carpetas y subir múltiples imágenes
async function bulkUploadPropertyImages(
  files: File[], 
  propertyCode: string,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  
  console.log(`📤 Subida masiva: ${files.length} imágenes para ${propertyCode}`);
  
  const uploadedUrls: string[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      onProgress?.(i + 1, files.length);
      const url = await uploadPropertyImageWithCode(files[i], propertyCode);
      uploadedUrls.push(url);
      
    } catch (error) {
      console.error(`❌ Error subiendo ${files[i].name}:`, error);
      errors.push(`${files[i].name}: ${(error as Error).message || 'Error desconocido'}`);
    }
  }
  
  if (errors.length > 0) {
    console.warn('⚠️ Algunos archivos no se pudieron subir:', errors);
  }
  
  console.log(`✅ Subida completada: ${uploadedUrls.length}/${files.length} exitosas`);
  return uploadedUrls;
}

// Función para actualizar las URLs de imágenes en la base de datos
async function updatePropertyImages(propertyId: string, imageUrls: string[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('properties')
      .update({ images: imageUrls })
      .eq('id', propertyId);
    
    if (error) {
      console.error('❌ Error actualizando imágenes en BD:', error);
      return false;
    }
    
    console.log(`✅ Imágenes actualizadas en BD para propiedad ${propertyId}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error en updatePropertyImages:', error);
    return false;
  }
}

export {
  uploadPropertyImageWithCode,
  getPropertyImages,
  deletePropertyImageByPath,
  bulkUploadPropertyImages,
  updatePropertyImages
};
