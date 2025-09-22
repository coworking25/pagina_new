const { createClient } = require('@supabase/supabase-js');

async function checkServiceInquiries() {
  console.log('🔍 CONSULTANDO SERVICE_INQUIRIES EXISTENTES...');

  try {
    // Configuración de Supabase
    const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzA0NjIsImV4cCI6MjA3MTkwNjQ2Mn0.ngCP1rv5jLYnJlNnuEtshyHsa1FILqBq89bcjv9pshY';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Consultar todas las consultas
    const { data, error } = await supabase
      .from('service_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error al consultar:', error);
      return false;
    }

    console.log(`📊 Encontradas ${data.length} consultas:`);
    data.forEach((inquiry, index) => {
      console.log(`${index + 1}. ${inquiry.client_name} - ${inquiry.service_type} - ${inquiry.status} - ${inquiry.created_at}`);
    });

    return true;

  } catch (error) {
    console.error('❌ ERROR EN CONSULTA:', error);
    return false;
  }
}

// Ejecutar la consulta
checkServiceInquiries();