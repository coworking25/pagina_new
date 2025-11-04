// Script de prueba para las funciones de exportación Excel
import { exportProperties, exportClients, exportContracts, exportAllData } from './src/lib/supabase.js';

async function testExports() {
  try {
    console.log('🧪 Probando funciones de exportación Excel...');

    // Probar exportación de propiedades
    console.log('📊 Probando exportProperties...');
    const properties = await exportProperties({ format: 'xlsx' });
    console.log('✅ Propiedades exportadas, tipo:', typeof properties, 'tamaño:', properties?.length || 'N/A');

    // Probar exportación de clientes
    console.log('👥 Probando exportClients...');
    const clients = await exportClients({ format: 'xlsx' });
    console.log('✅ Clientes exportados, tipo:', typeof clients, 'tamaño:', clients?.length || 'N/A');

    // Probar exportación de contratos
    console.log('📄 Probando exportContracts...');
    const contracts = await exportContracts({ format: 'xlsx' });
    console.log('✅ Contratos exportados, tipo:', typeof contracts, 'tamaño:', contracts?.length || 'N/A');

    // Probar exportación completa
    console.log('📦 Probando exportAllData...');
    const allData = await exportAllData({ format: 'xlsx' });
    console.log('✅ Todos los datos exportados, tipo:', typeof allData, 'tamaño:', allData?.length || 'N/A');

    console.log('🎉 Todas las pruebas pasaron exitosamente!');
  } catch (error) {
    console.error('❌ Error en pruebas:', error);
  }
}

testExports();