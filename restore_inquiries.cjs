const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreInquiries() {
  console.log('🔄 Restaurando consultas eliminadas...\n');

  try {
    // Obtener todas las consultas eliminadas
    const { data: deletedInquiries, error: fetchError } = await supabase
      .from('service_inquiries')
      .select('id, client_name, deleted_at')
      .not('deleted_at', 'is', null);

    if (fetchError) {
      console.error('❌ Error al obtener consultas:', fetchError);
      return;
    }

    console.log(`📊 Consultas eliminadas encontradas: ${deletedInquiries.length}\n`);

    if (deletedInquiries.length === 0) {
      console.log('✅ No hay consultas eliminadas para restaurar');
      return;
    }

    // Restaurar todas (marcar deleted_at = null)
    const { data, error } = await supabase
      .from('service_inquiries')
      .update({ deleted_at: null })
      .not('deleted_at', 'is', null)
      .select();

    if (error) {
      console.error('❌ Error al restaurar:', error);
      return;
    }

    console.log(`✅ ${data.length} consultas restauradas exitosamente!\n`);
    
    console.log('Consultas restauradas:');
    data.forEach((inquiry, index) => {
      console.log(`${index + 1}. ${inquiry.client_name} (ID: ${inquiry.id})`);
    });

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

restoreInquiries();
