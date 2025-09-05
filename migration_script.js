// Script para migrar imágenes usando la API de Supabase
// Ejecutar este script en la consola del navegador en tu dashboard de Supabase

// IMPORTANTE: Reemplaza estas variables con tus datos reales
const SUPABASE_URL = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'TU_SERVICE_ROLE_KEY_AQUI'; // Obtener del dashboard

// Configuración de migración
const SOURCE_BUCKET = 'imagenes';
const DEST_BUCKET = 'property-images';

// Datos de propiedades (conteos reales de imágenes)
const propertyData = {
  'CA-001': 18, 'CA-002': 14, 'CA-003': 15, 'CA-004': 13, 'CA-005': 14,
  'CA-006': 14, 'CA-007': 10, 'CA-008': 15, 'CA-009': 13, 'CA-010': 11,
  'CA-011': 14, 'CA-012': 11, 'CA-013': 13, 'CA-014': 10, 'CA-015': 10,
  'CA-016': 13, 'CA-017': 14, 'CA-018': 12, 'CA-019': 18, 'CA-020': 16
};

// Función para crear cliente de Supabase
function createSupabaseClient() {
  return supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// Función para migrar una imagen
async function migrateImage(client, sourceKey, destKey) {
  try {
    console.log(`Migrando: ${sourceKey} → ${destKey}`);
    
    // 1. Descargar la imagen del bucket original
    const { data: downloadData, error: downloadError } = await client.storage
      .from(SOURCE_BUCKET)
      .download(sourceKey);
    
    if (downloadError) {
      console.error(`Error descargando ${sourceKey}:`, downloadError);
      return false;
    }
    
    // 2. Subir la imagen al nuevo bucket
    const { data: uploadData, error: uploadError } = await client.storage
      .from(DEST_BUCKET)
      .upload(destKey, downloadData, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error(`Error subiendo ${destKey}:`, uploadError);
      return false;
    }
    
    console.log(`✅ Migrado exitosamente: ${destKey}`);
    return true;
  } catch (error) {
    console.error(`Error migrando ${sourceKey}:`, error);
    return false;
  }
}

// Función principal de migración
async function migrateAllImages() {
  const client = createSupabaseClient();
  let totalSuccess = 0;
  let totalErrors = 0;
  
  console.log('🚀 Iniciando migración de imágenes...');
  
  for (const [propertyCode, imageCount] of Object.entries(propertyData)) {
    console.log(`\n📁 Procesando propiedad ${propertyCode} (${imageCount} imágenes)`);
    
    for (let i = 1; i <= imageCount; i++) {
      const sourceKey = `imagenes/${propertyCode}/${propertyCode}-(${i}).jpeg`;
      const destKey = `${propertyCode}/${propertyCode}-(${i}).jpeg`;
      
      const success = await migrateImage(client, sourceKey, destKey);
      
      if (success) {
        totalSuccess++;
      } else {
        totalErrors++;
      }
      
      // Pausa pequeña para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`\n🎉 Migración completada!`);
  console.log(`✅ Éxitos: ${totalSuccess}`);
  console.log(`❌ Errores: ${totalErrors}`);
}

// Función para verificar URLs después de la migración
async function verifyMigratedImages() {
  console.log('🔍 Verificando imágenes migradas...');
  
  const baseUrl = `${SUPABASE_URL}/storage/v1/object/public/${DEST_BUCKET}`;
  
  for (const [propertyCode, imageCount] of Object.entries(propertyData)) {
    console.log(`\n📋 Verificando ${propertyCode}:`);
    
    for (let i = 1; i <= Math.min(3, imageCount); i++) {
      const url = `${baseUrl}/${propertyCode}/${propertyCode}-(${i}).jpeg`;
      
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          console.log(`✅ ${url}`);
        } else {
          console.log(`❌ ${url} - Status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${url} - Error: ${error.message}`);
      }
    }
  }
}

// Funciones auxiliares
function showInstructions() {
  console.log(`
🚀 INSTRUCCIONES DE MIGRACIÓN

1. Primero, obtén tu Service Role Key desde:
   ${SUPABASE_URL}/project/gfczfjpyyyyvteyrvhgt/settings/api

2. Actualiza la variable SUPABASE_SERVICE_ROLE_KEY arriba

3. Ejecuta los comandos en orden:

   // Crear el bucket y políticas (ejecutar SQL en tu dashboard)
   
   // Migrar imágenes
   await migrateAllImages();
   
   // Verificar migración
   await verifyMigratedImages();

4. Una vez completado, actualiza tu aplicación con el nuevo código.

NOTA: Este script debe ejecutarse con la consola del navegador abierta
en tu dashboard de Supabase para tener acceso a la librería supabase.
  `);
}

// Mostrar instrucciones
showInstructions();
