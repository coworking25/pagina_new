// Test simple para verificar los datos de advisors y propiedades
import { getProperties, getAdvisors, getAdvisorById } from './src/lib/supabase.js';

async function testAdvisorData() {
  console.log('🧪 Iniciando test de datos de asesores...');
  
  try {
    // 1. Verificar propiedades
    console.log('\n📋 1. Obteniendo propiedades...');
    const properties = await getProperties();
    console.log(`✅ ${properties.length} propiedades encontradas`);
    
    // Mostrar advisor_id de cada propiedad
    properties.forEach((property, index) => {
      console.log(`   Propiedad ${index + 1}: "${property.title}" - advisor_id: ${property.advisor_id || 'SIN ASESOR'}`);
    });
    
    // 2. Verificar asesores
    console.log('\n👥 2. Obteniendo asesores...');
    const advisors = await getAdvisors();
    console.log(`✅ ${advisors.length} asesores encontrados`);
    
    advisors.forEach((advisor, index) => {
      console.log(`   Asesor ${index + 1}: ID: ${advisor.id} - Nombre: ${advisor.name}`);
    });
    
    // 3. Test de getAdvisorById con un ID específico
    console.log('\n🔍 3. Test de getAdvisorById...');
    const propertiesWithAdvisor = properties.filter(p => p.advisor_id);
    
    if (propertiesWithAdvisor.length > 0) {
      const testProperty = propertiesWithAdvisor[0];
      console.log(`Probando con advisor_id: ${testProperty.advisor_id} de la propiedad: "${testProperty.title}"`);
      
      const advisor = await getAdvisorById(testProperty.advisor_id);
      console.log('✅ Asesor obtenido:', advisor);
    } else {
      console.log('❌ No se encontraron propiedades con advisor_id');
    }
    
  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

// Ejecutar el test
testAdvisorData();
