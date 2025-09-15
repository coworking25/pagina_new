const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInquiries() {
  console.log('Consultando inquiries creadas...');

  try {
    const { data, error } = await supabase
      .from('service_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(`Se encontraron ${data.length} inquiries:`);
    data.forEach((inquiry, index) => {
      console.log(`\n${index + 1}. ${inquiry.client_name}`);
      console.log(`   Servicio: ${inquiry.service_type}`);
      console.log(`   Urgencia: ${inquiry.urgency}`);
      console.log(`   Estado: ${inquiry.status}`);
      console.log(`   Email: ${inquiry.client_email}`);
      if (inquiry.budget) {
        console.log(`   Presupuesto: $${inquiry.budget.toLocaleString()}`);
      }
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

checkInquiries();
