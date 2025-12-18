const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkClientPaymentsTable() {
  console.log('🔍 Verificando tabla client_payments...\n');

  const clientId = '11111111-1111-1111-1111-111111111111';

  // Obtener un registro para ver estructura
  const { data, error } = await supabase
    .from('client_payments')
    .select('*')
    .eq('client_id', clientId)
    .limit(1)
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📋 Estructura de client_payments:');
  console.log(JSON.stringify(data, null, 2));
  console.log('\n📊 Columnas disponibles:', Object.keys(data).join(', '));

  // Ver todos los pagos con status
  const { data: allPayments, error: allError } = await supabase
    .from('client_payments')
    .select('id, payment_type, amount, payment_date, status, amount_paid')
    .eq('client_id', clientId)
    .order('payment_date', { ascending: false });

  if (!allError) {
    console.log('\n💰 Todos los pagos:');
    allPayments.forEach((p, i) => {
      console.log(`${i + 1}. Type: ${p.payment_type || 'NULL'}, Amount: $${p.amount?.toLocaleString() || 0}, Date: ${p.payment_date}, Status: ${p.status || 'NULL'}, Paid: $${p.amount_paid?.toLocaleString() || 0}`);
    });

    // Contar por status
    const statusCounts = {};
    allPayments.forEach(p => {
      const status = p.status || 'NULL';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log('\n📈 Conteo por status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
  }
}

checkClientPaymentsTable().catch(console.error);
