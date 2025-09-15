imconst supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';rt { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzA0NjIsImV4cCI6MjA3MTkwNjQ2Mn0.ngCP1rv5jLYnJlYnuEtshyHsa1FILqBq89bcjv9pshY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestInquiries() {
  console.log('🧪 CREANDO CONSULTAS DE PRUEBA...');
  
  const testInquiries = [
    {
      client_name: 'María González',
      client_email: 'maria.gonzalez@email.com',
      client_phone: '+57 300 123 4567',
      service_type: 'arrendamientos',
      urgency: 'urgent',
      budget: '$2,000,000',
      details: 'Busco apartamento de 2 habitaciones en zona norte de Bogotá para arrendar lo antes posible.',
      selected_questions: ['¿Qué tipo de propiedad buscas?', '¿En qué zona te interesa?', '¿Cuál es tu presupuesto?'],
      status: 'pending',
      source: 'website'
    },
    {
      client_name: 'Carlos Rodríguez',
      client_email: 'carlos.rodriguez@email.com',
      client_phone: '+57 301 987 6543',
      service_type: 'ventas',
      urgency: 'normal',
      budget: '$300,000,000',
      details: 'Interesado en comprar casa en el sur de la ciudad, preferiblemente con garaje y jardín.',
      selected_questions: ['¿Qué tipo de propiedad buscas?', '¿Tienes financiación preaprobada?'],
      status: 'in_progress',
      source: 'whatsapp'
    },
    {
      client_name: 'Ana Martínez',
      client_email: 'ana.martinez@email.com',
      client_phone: '+57 302 555 1234',
      service_type: 'avaluos',
      urgency: 'flexible',
      budget: '$1,500,000',
      details: 'Necesito avalúo comercial de mi propiedad para trámites bancarios.',
      selected_questions: ['¿Para qué necesitas el avalúo?', '¿Qué tipo de propiedad es?'],
      status: 'pending',
      source: 'phone'
    },
    {
      client_name: 'Luis Herrera',
      client_email: 'luis.herrera@email.com',
      client_phone: '+57 304 777 8888',
      service_type: 'asesorias-contables',
      urgency: 'urgent',
      budget: '$5,000,000',
      details: 'Requiero asesoría contable para declaración de renta de propiedades de inversión.',
      selected_questions: ['¿Qué tipo de asesoría necesitas?', '¿Cuántas propiedades tienes?'],
      status: 'completed',
      source: 'referral'
    },
    {
      client_name: 'Patricia López',
      client_email: 'patricia.lopez@email.com',
      client_phone: '+57 305 444 2222',
      service_type: 'remodelacion',
      urgency: 'normal',
      budget: '$50,000,000',
      details: 'Quiero remodelar la cocina y los baños de mi apartamento.',
      selected_questions: ['¿Qué espacios quieres remodelar?', '¿Tienes un diseño en mente?'],
      status: 'in_progress',
      source: 'website'
    }
  ];

  try {
    const { data, error } = await supabase
      .from('service_inquiries')
      .insert(testInquiries)
      .select();

    if (error) {
      console.error('❌ Error insertando datos:', error);
      return false;
    }

    console.log('✅ Consultas creadas exitosamente:', data.length);
    console.log('📊 Datos insertados:', data);
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

createTestInquiries();
