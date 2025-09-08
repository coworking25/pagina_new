import { getProperties } from '../lib/supabase';

async function debugProperties() {
  try {
    console.log('🔍 Verificando propiedades en la base de datos...');
    const properties = await getProperties();
    console.log('📋 Propiedades encontradas:', properties.length);
    
    if (properties.length > 0) {
      console.log('📝 Primera propiedad:', properties[0]);
      console.log('🆔 IDs de todas las propiedades:', properties.map(p => ({ id: p.id, title: p.title })));
    } else {
      console.log('❌ No se encontraron propiedades');
    }
    
    return properties;
  } catch (error) {
    console.error('❌ Error al obtener propiedades:', error);
    return [];
  }
}

// Ejecutar en el navegador
(window as any).debugProperties = debugProperties;

export { debugProperties };
