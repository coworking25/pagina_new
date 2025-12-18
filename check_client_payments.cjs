const { createClient } = require('@supabase/supabase-js');

// Usar las credenciales del .env actual
const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkClientPayments() {
  console.log('🔍 Verificando datos del cliente...\n');

  // 1. Obtener client_id de carlos.propietario@test.com
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select('id, email, full_name')
    .eq('email', 'carlos.propietario@test.com')
    .single();

  if (clientError) {
    console.error('❌ Error obteniendo cliente:', clientError);
    return;
  }

  console.log('✅ Cliente encontrado:');
  console.log('   ID:', clientData.id);
  console.log('   Email:', clientData.email);
  console.log('   Nombre:', clientData.full_name);
  console.log('');

  const clientId = clientData.id;

  // 2. Verificar payment_schedules
  const { data: schedules, error: schedulesError } = await supabase
    .from('payment_schedules')
    .select('*')
    .eq('client_id', clientId)
    .order('due_date', { ascending: true });

  if (schedulesError) {
    console.error('❌ Error obteniendo payment_schedules:', schedulesError);
  } else {
    console.log('📅 Payment Schedules encontrados:', schedules.length);
    schedules.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.payment_concept} - $${s.amount.toLocaleString()} - ${s.due_date} - Status: ${s.status}`);
    });
    console.log('');
  }

  // 3. Verificar client_payments (historial)
  const { data: payments, error: paymentsError } = await supabase
    .from('client_payments')
    .select('*')
    .eq('client_id', clientId)
    .order('payment_date', { ascending: false });

  if (paymentsError) {
    console.error('❌ Error obteniendo client_payments:', paymentsError);
  } else {
    console.log('💰 Client Payments (historial) encontrados:', payments.length);
    payments.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.payment_type} - $${p.amount.toLocaleString()} - ${p.payment_date} - Status: ${p.status}`);
    });
    console.log('');
  }

  // 4. Calcular resumen
  if (schedules && schedules.length > 0) {
    const totalAmount = schedules.reduce((sum, s) => sum + s.amount, 0);
    const paidAmount = schedules.reduce((sum, s) => sum + (s.paid_amount || 0), 0);
    const pendingAmount = totalAmount - paidAmount;
    
    const now = new Date();
    const overdueSchedules = schedules.filter(s => 
      s.status === 'overdue' || (s.status === 'pending' && new Date(s.due_date) < now)
    );
    const overdueAmount = overdueSchedules.reduce((sum, s) => sum + (s.amount - (s.paid_amount || 0)), 0);
    
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);
    const upcomingSchedules = schedules.filter(s => 
      (s.status === 'pending' || s.status === 'partial') && 
      new Date(s.due_date) >= now && 
      new Date(s.due_date) <= next30Days
    );

    console.log('📊 RESUMEN CALCULADO:');
    console.log('   Total programado:', schedules.length, 'pagos');
    console.log('   Monto total: $' + totalAmount.toLocaleString());
    console.log('   Monto pagado: $' + paidAmount.toLocaleString());
    console.log('   Monto pendiente: $' + pendingAmount.toLocaleString());
    console.log('   Vencidos:', overdueSchedules.length, 'pagos - $' + overdueAmount.toLocaleString());
    console.log('   Próximos 30 días:', upcomingSchedules.length, 'pagos');
    if (upcomingSchedules.length > 0) {
      console.log('   Próximo pago:', upcomingSchedules[0].due_date, '-', upcomingSchedules[0].payment_concept);
    }
  }

  // 5. Calcular estadísticas del historial
  if (payments && payments.length > 0) {
    const totalReceived = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount_paid || 0), 0);
    const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

    console.log('\n💳 ESTADÍSTICAS HISTORIAL:');
    console.log('   Total recibido: $' + totalReceived.toLocaleString());
    console.log('   Total pendiente: $' + totalPending.toLocaleString());
    console.log('   Total vencido: $' + totalOverdue.toLocaleString());
  }
}

checkClientPayments().catch(console.error);
