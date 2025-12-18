const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBothPaymentTables() {
  const clientId = '11111111-1111-1111-1111-111111111111';

  console.log('🔍 Verificando ambas tablas de pagos...\n');

  // 1. Verificar tabla "payments" (contratos)
  console.log('1️⃣ Tabla "payments" (relacionada con contratos):');
  const { data: paymentsData, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .limit(5);

  if (paymentsError) {
    console.log('   ❌ Error:', paymentsError.message);
  } else {
    console.log(`   ✅ Total registros en payments: ${paymentsData?.length || 0}`);
    if (paymentsData && paymentsData.length > 0) {
      console.log('   Columnas:', Object.keys(paymentsData[0]).join(', '));
    }
  }

  // 2. Verificar tabla "client_payments"
  console.log('\n2️⃣ Tabla "client_payments" (historial del portal):');
  const { data: clientPayments, error: clientError } = await supabase
    .from('client_payments')
    .select('*')
    .eq('client_id', clientId);

  if (clientError) {
    console.log('   ❌ Error:', clientError.message);
  } else {
    console.log(`   ✅ Total registros: ${clientPayments?.length || 0}`);
    if (clientPayments && clientPayments.length > 0) {
      console.log('   Columnas:', Object.keys(clientPayments[0]).join(', '));
      
      // Contar por payment_status
      const statusCounts = {};
      let totalAmount = 0;
      clientPayments.forEach(p => {
        const status = p.payment_status || 'NULL';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        if (p.payment_status === 'completed') {
          totalAmount += p.amount || 0;
        }
      });
      
      console.log('   Status counts:', statusCounts);
      console.log('   Total completed: $' + totalAmount.toLocaleString());
    }
  }

  // 3. Verificar tabla "payment_schedules" (calendario)
  console.log('\n3️⃣ Tabla "payment_schedules" (calendario nuevo):');
  const { data: schedules, error: schedError } = await supabase
    .from('payment_schedules')
    .select('*')
    .eq('client_id', clientId);

  if (schedError) {
    console.log('   ❌ Error:', schedError.message);
  } else {
    console.log(`   ✅ Total registros: ${schedules?.length || 0}`);
    if (schedules && schedules.length > 0) {
      console.log('   Columnas:', Object.keys(schedules[0]).join(', '));
    }
  }

  console.log('\n📝 CONCLUSIÓN:');
  console.log('   - payments: Para contratos (probablemente vacía)');
  console.log('   - client_payments: Historial de pagos recibidos (' + (clientPayments?.length || 0) + ' registros)');
  console.log('   - payment_schedules: Calendario de pagos programados (' + (schedules?.length || 0) + ' registros)');
}

checkBothPaymentTables().catch(console.error);
