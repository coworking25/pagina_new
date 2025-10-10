const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInquiries() {
  console.log('🔍 Consultando inquiries creadas...\n');

  try {
    const { data, error } = await supabase
      .from('service_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(`📊 TOTAL en BD: ${data.length} inquiries\n`);
    
    // Separar por deleted_at
    const notDeleted = data.filter(inq => !inq.deleted_at);
    const deleted = data.filter(inq => inq.deleted_at);
    
    console.log(`✅ NO eliminadas (deleted_at = null): ${notDeleted.length}`);
    console.log(`🗑️ Eliminadas (deleted_at != null): ${deleted.length}\n`);
    
    console.log('='.repeat(60));
    console.log('CONSULTAS ACTIVAS (NO eliminadas):');
    console.log('='.repeat(60));
    
    notDeleted.forEach((inquiry, index) => {
      console.log(`\n${index + 1}. ${inquiry.client_name}`);
      console.log(`   ID: ${inquiry.id}`);
      console.log(`   Servicio: ${inquiry.service_type}`);
      console.log(`   Urgencia: ${inquiry.urgency}`);
      console.log(`   Estado: ${inquiry.status}`);
      console.log(`   Email: ${inquiry.client_email}`);
      if (inquiry.budget) {
        console.log(`   Presupuesto: $${inquiry.budget.toLocaleString()}`);
      }
      console.log(`   Creada: ${inquiry.created_at}`);
    });
    
    if (deleted.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('CONSULTAS ELIMINADAS:');
      console.log('='.repeat(60));
      deleted.forEach((inquiry, index) => {
        console.log(`\n${index + 1}. ${inquiry.client_name}`);
        console.log(`   ID: ${inquiry.id}`);
        console.log(`   Eliminada el: ${inquiry.deleted_at}`);
      });
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkInquiries();
