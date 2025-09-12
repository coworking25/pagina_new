import { createSupabaseClient, getClients } from './src/lib/clientsApi.js';

async function testClients() {
  console.log('🧪 Probando funciones de clientes...');
  
  try {
    // Probar conexión
    const supabase = createSupabaseClient();
    console.log('✅ Cliente Supabase creado exitosamente');
    
    // Probar obtener clientes
    console.log('\n📊 Obteniendo clientes de la base de datos...');
    const clients = await getClients();
    
    console.log('✅ Clientes obtenidos:', clients?.length || 0);
    
    if (clients && clients.length > 0) {
      console.log('\n👥 Primeros 3 clientes:');
      clients.slice(0, 3).forEach((client, index) => {
        console.log(`${index + 1}. ${client.full_name} (${client.email}) - ${client.client_type} [${client.status}]`);
      });
    } else {
      console.log('⚠️ No hay clientes en la base de datos');
    }
    
    console.log('\n🎉 Prueba de clientes completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en prueba de clientes:', error);
  }
}

testClients();
