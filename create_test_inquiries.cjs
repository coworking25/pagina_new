const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestInquiries() {
  console.log('Creando inquiries de prueba...');

  const testInquiries = [
    {
      client_name: 'María González',
      client_email: 'maria.gonzalez@email.com',
      client_phone: '+573001234567',
      service_type: 'arrendamientos',
      urgency: 'alto',
      budget: 2500000,
      details: 'Busco apartamento de 2 habitaciones en zona norte, con parqueadero',
      selected_questions: ['ubicacion', 'habitaciones', 'parqueadero'],
      status: 'activa'
    },
    {
      client_name: 'Carlos Rodríguez',
      client_email: 'carlos.rodriguez@email.com',
      client_phone: '+573109876543',
      service_type: 'ventas',
      urgency: 'medio',
      budget: 350000000,
      details: 'Quiero vender mi casa en el centro de la ciudad',
      selected_questions: ['precio', 'documentos'],
      status: 'activa'
    },
    {
      client_name: 'Ana Martínez',
      client_email: 'ana.martinez@email.com',
      client_phone: '+573201122334',
      service_type: 'avaluos',
      urgency: 'bajo',
      budget: null,
      details: 'Necesito avalúo comercial para propiedad familiar',
      selected_questions: ['tipo_avaluo'],
      status: 'pendiente'
    },
    {
      client_name: 'Luis Herrera',
      client_email: 'luis.herrera@email.com',
      client_phone: '+573151234567',
      service_type: 'administracion',
      urgency: 'alto',
      budget: null,
      details: 'Administración de conjunto residencial de 50 apartamentos',
      selected_questions: ['experiencia', 'tarifas'],
      status: 'activa'
    },
    {
      client_name: 'Patricia Silva',
      client_email: 'patricia.silva@email.com',
      client_phone: '+573219988776',
      service_type: 'asesoria',
      urgency: 'medio',
      budget: null,
      details: 'Asesoría legal para compra de terreno rural',
      selected_questions: ['documentacion', 'plazos'],
      status: 'completada'
    }
  ];

  try {
    const { data, error } = await supabase
      .from('service_inquiries')
      .insert(testInquiries);

    if (error) {
      console.error('Error inserting test inquiries:', error);
      return;
    }

    console.log('Test inquiries creadas exitosamente:', data);
    console.log(`Se crearon ${testInquiries.length} inquiries de prueba.`);
  } catch (err) {
    console.error('Error:', err);
  }
}

createTestInquiries();
