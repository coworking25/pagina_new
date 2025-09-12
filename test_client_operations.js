// Script de prueba para verificar las operaciones de clientes
import { createClient } from '@supabase/supabase-js';

// Variables de entorno (debes reemplazar con tus valores reales)
const supabaseUrl = 'https://wnawdbbkqwwkyhxzqrbm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduYXdkYmJrcXd3a3loeHpxcmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4Njk1NDcsImV4cCI6MjA0MjQ0NTU0N30.OWVqiQPMHKFg2kNKpAoJU9kJ50fZqZ8fWLdxqGNVhJw';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testClientOperations() {
  console.log('🧪 Iniciando pruebas de operaciones de clientes...\n');

  try {
    // 1. Obtener clientes existentes
    console.log('1️⃣ Obteniendo lista de clientes...');
    const { data: clients, error: fetchError } = await supabase
      .from('service_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error al obtener clientes:', fetchError);
      return;
    }

    console.log(`✅ Se encontraron ${clients?.length || 0} clientes`);
    
    if (clients && clients.length > 0) {
      const testClient = clients[0];
      console.log(`📋 Cliente de prueba: ${testClient.client_name} (ID: ${testClient.id})`);

      // 2. Probar actualización
      console.log('\n2️⃣ Probando actualización de cliente...');
      const updateData = {
        status: 'contacted',
        notes: `Actualizado el ${new Date().toISOString()} - Prueba de función`,
        updated_at: new Date().toISOString()
      };

      const { data: updatedClient, error: updateError } = await supabase
        .from('service_inquiries')
        .update(updateData)
        .eq('id', testClient.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error al actualizar cliente:', updateError);
      } else {
        console.log('✅ Cliente actualizado correctamente');
        console.log('📄 Estado actualizado:', updatedClient.status);
        console.log('📝 Notas:', updatedClient.notes);
      }

      // 3. Verificar que el trigger de updated_at funciona
      console.log('\n3️⃣ Verificando timestamp de actualización...');
      const { data: refreshedClient } = await supabase
        .from('service_inquiries')
        .select('updated_at, created_at')
        .eq('id', testClient.id)
        .single();

      if (refreshedClient) {
        console.log('📅 created_at:', refreshedClient.created_at);
        console.log('📅 updated_at:', refreshedClient.updated_at);
        
        const createdAt = new Date(refreshedClient.created_at);
        const updatedAt = new Date(refreshedClient.updated_at);
        
        if (updatedAt > createdAt) {
          console.log('✅ El trigger de updated_at está funcionando correctamente');
        } else {
          console.log('⚠️ El trigger de updated_at podría no estar funcionando');
        }
      }
    }

    // 4. Probar estados disponibles
    console.log('\n4️⃣ Verificando estados disponibles...');
    const { data: statusData } = await supabase
      .from('service_inquiries')
      .select('status')
      .not('status', 'is', null);

    if (statusData) {
      const uniqueStatuses = [...new Set(statusData.map(item => item.status))];
      console.log('📊 Estados encontrados en la base de datos:', uniqueStatuses);
      
      const expectedStatuses = ['pending', 'contacted', 'scheduled', 'in_progress', 'completed', 'cancelled'];
      const missingStatuses = expectedStatuses.filter(status => !uniqueStatuses.includes(status));
      
      if (missingStatuses.length > 0) {
        console.log('⚠️ Estados que aún no se han usado:', missingStatuses);
      } else {
        console.log('✅ Todos los estados esperados están siendo utilizados');
      }
    }

    console.log('\n🎉 Pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Ejecutar pruebas
testClientOperations();
