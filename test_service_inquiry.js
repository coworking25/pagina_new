// FUNCIÓN DE TESTING SIMPLIFICADA - Para la consola del navegador

async function testServiceInquirySimple() {
  console.log('🧪 INICIANDO TEST SIMPLE DE SERVICE_INQUIRIES...');
  
  try {
    // Usar el cliente global si está disponible
    if (typeof window.supabase === 'undefined') {
      console.log('⚠️ Cliente Supabase no encontrado globalmente, creando uno nuevo...');
      
      // Crear cliente directamente con fetch
      const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzA0NjIsImV4cCI6MjA3MTkwNjQ2Mn0.ngCP1rv5jLYnJlNnuEtshyHsa1FILqBq89bcjv9pshY';
      
      // Test con fetch directo
      const testData = {
        client_name: 'Test Fetch Directo',
        client_email: 'test@email.com',
        client_phone: '+57 300 123 4567',
        service_type: 'arrendamientos',
        urgency: 'normal',
        budget: '$2,000,000',
        details: 'Esta es una consulta de prueba con fetch directo',
        selected_questions: ['¿Qué tipo de propiedad buscas?', '¿En qué zona te interesa?'],
        status: 'pending',
        source: 'test_fetch'
      };
      
      console.log('📊 Datos de prueba:', testData);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/service_inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(testData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en fetch:', response.status, errorText);
        return false;
      }
      
      const result = await response.json();
      console.log('✅ INSERCIÓN EXITOSA CON FETCH:', result);
      console.log('🎉 TEST COMPLETADO EXITOSAMENTE!');
      return true;
      
    } else {
      console.log('✅ Usando cliente Supabase global');
      
      const testData = {
        client_name: 'Test Usuario Global',
        client_email: 'test@email.com',
        client_phone: '+57 300 123 4567',
        service_type: 'arrendamientos',
        urgency: 'normal',
        budget: '$2,000,000',
        details: 'Esta es una consulta de prueba con cliente global',
        selected_questions: ['¿Qué tipo de propiedad buscas?', '¿En qué zona te interesa?'],
        status: 'pending',
        source: 'test_global'
      };
      
      console.log('📊 Datos de prueba:', testData);
      
      const { data, error } = await window.supabase
        .from('service_inquiries')
        .insert([testData])
        .select()
        .single();
      
      if (error) {
        console.error('❌ ERROR AL INSERTAR:', error);
        return false;
      }
      
      console.log('✅ INSERCIÓN EXITOSA:', data);
      console.log('🎉 TEST COMPLETADO EXITOSAMENTE!');
      return true;
    }
    
  } catch (error) {
    console.error('❌ ERROR EN TEST:', error);
    return false;
  }
}

// Ejecutar el test
testServiceInquirySimple();
