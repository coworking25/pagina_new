// Script para insertar un cliente de prueba
console.log('🧪 Insertando cliente de prueba...');

// Este script debe ejecutarse desde la consola del navegador en la página de administración
// Para usarlo, copia y pega este código en la consola del navegador

async function insertTestClient() {
  try {
    // Verificar que tenemos acceso a supabase
    if (typeof window.supabase === 'undefined') {
      console.error('❌ Supabase no está disponible. Asegúrate de estar en modo desarrollo.');
      return;
    }

    const testClient = {
      client_name: 'Juan Diego Restrepo Bayer',
      client_email: 'juan.restrepo@email.com',
      client_phone: '+57 300 123 4567',
      service_type: 'construccion',
      urgency: 'normal',
      budget: '$50,000,000 - $100,000,000',
      details: 'Interesado en construcción de casa unifamiliar en lote propio. Presupuesto flexible y tiempo de ejecución de 6-8 meses.',
      status: 'pending',
      source: 'website',
      selected_questions: [],
      notes: 'Cliente de prueba insertado automáticamente'
    };

    console.log('📝 Insertando cliente:', testClient);

    const { data, error } = await window.supabase
      .from('service_inquiries')
      .insert([testClient])
      .select();

    if (error) {
      console.error('❌ Error al insertar cliente de prueba:', error);
      return;
    }

    console.log('✅ Cliente de prueba insertado correctamente:', data);
    
    // Recargar la página para ver el nuevo cliente
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Insertar múltiples clientes de prueba
async function insertMultipleTestClients() {
  const testClients = [
    {
      client_name: 'María Elena Rodríguez',
      client_email: 'maria.rodriguez@email.com',
      client_phone: '+57 301 234 5678',
      service_type: 'arrendamientos',
      urgency: 'urgent',
      budget: '$1,500,000 - $2,500,000',
      details: 'Busco apartamento en arriendo zona norte de la ciudad, 2-3 habitaciones.',
      status: 'contacted',
      source: 'website'
    },
    {
      client_name: 'Carlos Andrés Mejía',
      client_email: 'carlos.mejia@email.com',
      client_phone: '+57 302 345 6789',
      service_type: 'ventas',
      urgency: 'normal',
      budget: '$300,000,000 - $500,000,000',
      details: 'Interesado en compra de apartamento nuevo, sector El Poblado.',
      status: 'scheduled',
      source: 'referral'
    },
    {
      client_name: 'Ana Sofía Hernández',
      client_email: 'ana.hernandez@email.com',
      client_phone: '+57 303 456 7890',
      service_type: 'avaluos',
      urgency: 'flexible',
      budget: 'Por definir',
      details: 'Necesito avalúo comercial para propiedad heredada.',
      status: 'in_progress',
      source: 'website'
    },
    {
      client_name: 'Roberto Silva Castro',
      client_email: 'roberto.silva@email.com',
      client_phone: '+57 304 567 8901',
      service_type: 'remodelacion',
      urgency: 'urgent',
      budget: '$20,000,000 - $40,000,000',
      details: 'Remodelación completa de cocina y baños en apartamento.',
      status: 'completed',
      source: 'social_media'
    },
    {
      client_name: 'Luisa Fernanda Gómez',
      client_email: 'luisa.gomez@email.com',
      client_phone: '+57 305 678 9012',
      service_type: 'asesorias-contables',
      urgency: 'normal',
      budget: '$500,000 - $1,000,000',
      details: 'Asesoría contable para declaración de renta con propiedades.',
      status: 'cancelled',
      source: 'website'
    }
  ];

  for (const client of testClients) {
    try {
      const { data, error } = await window.supabase
        .from('service_inquiries')
        .insert([{
          ...client,
          selected_questions: [],
          notes: 'Cliente de prueba insertado automáticamente'
        }])
        .select();

      if (error) {
        console.error(`❌ Error al insertar ${client.client_name}:`, error);
      } else {
        console.log(`✅ Cliente insertado: ${client.client_name}`);
      }
    } catch (error) {
      console.error(`❌ Error con ${client.client_name}:`, error);
    }
  }
  
  console.log('🎉 Proceso completado');
  window.location.reload();
}

// Instrucciones
console.log(`
🚀 INSTRUCCIONES PARA INSERTAR CLIENTES DE PRUEBA:

1. Para insertar UN cliente de prueba:
   insertTestClient()

2. Para insertar MÚLTIPLES clientes de prueba:
   insertMultipleTestClients()

3. Copia y pega cualquiera de estos comandos en la consola del navegador.
`);

// También exponer las funciones globalmente para uso fácil
window.insertTestClient = insertTestClient;
window.insertMultipleTestClients = insertMultipleTestClients;
