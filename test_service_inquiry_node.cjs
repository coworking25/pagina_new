const { createClient } = require('@supabase/supabase-js');

async function testServiceInquiry() {
  console.log('🧪 INICIANDO TEST DE SERVICE_INQUIRIES...');

  try {
    // Configuración de Supabase
    const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzA0NjIsImV4cCI6MjA3MTkwNjQ2Mn0.ngCP1rv5jLYnJlNnuEtshyHsa1FILqBq89bcjv9pshY';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Datos de prueba
    const testData = {
      client_name: 'Test Node.js',
      client_email: 'test@nodejs.com',
      client_phone: '+57 300 123 4567',
      service_type: 'arrendamientos',
      urgency: 'normal',
      budget: '$2,000,000',
      details: 'Esta es una consulta de prueba desde Node.js',
      selected_questions: ['¿Qué tipo de propiedad buscas?', '¿En qué zona te interesa?'],
      status: 'pending',
      source: 'test_nodejs'
    };

    console.log('📊 Datos de prueba:', testData);

    // Insertar en la base de datos
    const { data, error } = await supabase
      .from('service_inquiries')
      .insert([testData])
      .select();

    if (error) {
      console.error('❌ Error al insertar:', error);
      return false;
    }

    console.log('✅ INSERCIÓN EXITOSA:', data);
    console.log('🎉 TEST COMPLETADO EXITOSAMENTE!');

    return true;

  } catch (error) {
    console.error('❌ ERROR EN TEST:', error);
    return false;
  }
}

// Ejecutar el test
testServiceInquiry();