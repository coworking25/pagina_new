const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bsssqdcohebdcwpgobqv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzc3NxZGNvaGViZGN3cGdvYnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MzM2ODEsImV4cCI6MjA0ODMwOTY4MX0.qXcSZedAgC3bLeV-CfHpYEAOCf8Ez6bVPbuqP_oSOJE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJuanDiegoData() {
  console.log('🔍 Buscando datos de Juan Diego Restrepo Bayer...\n');

  // 1. Buscar cliente
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('email', 'diegorpo9608@gmail.com')
    .single();

  if (clientError) {
    console.error('❌ Error buscando cliente:', clientError);
    return;
  }

  if (!client) {
    console.log('❌ Cliente no encontrado');
    return;
  }

  console.log('✅ Cliente encontrado:');
  console.log('   ID:', client.id);
  console.log('   Nombre:', client.full_name);
  console.log('   Email:', client.email);
  console.log('   Tipo:', client.client_type);
  console.log('');

  // 2. Buscar contratos donde es landlord
  const { data: contractsAsLandlord, error: contractsError } = await supabase
    .from('contracts')
    .select('*')
    .eq('landlord_id', client.id);

  console.log('📄 Contratos como PROPIETARIO:', contractsAsLandlord?.length || 0);
  if (contractsAsLandlord && contractsAsLandlord.length > 0) {
    contractsAsLandlord.forEach((c, i) => {
      console.log(`   ${i + 1}. Contrato ${c.contract_number}`);
      console.log(`      - ID: ${c.id}`);
      console.log(`      - Tenant ID: ${c.client_id}`);
      console.log(`      - Status: ${c.status}`);
    });
  }
  console.log('');

  // 3. Buscar contratos donde es tenant
  const { data: contractsAsTenant, error: contractsError2 } = await supabase
    .from('contracts')
    .select('*')
    .eq('client_id', client.id);

  console.log('📄 Contratos como INQUILINO:', contractsAsTenant?.length || 0);
  console.log('');

  // 4. Buscar pagos asociados a esos contratos
  if (contractsAsLandlord && contractsAsLandlord.length > 0) {
    const contractIds = contractsAsLandlord.map(c => c.id);
    
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .in('contract_id', contractIds);

    console.log('💰 Pagos en contratos del propietario:', payments?.length || 0);
    if (payments && payments.length > 0) {
      payments.forEach((p, i) => {
        console.log(`   ${i + 1}. Pago de $${p.amount.toLocaleString()}`);
        console.log(`      - Status: ${p.status}`);
        console.log(`      - Contract ID: ${p.contract_id}`);
        console.log(`      - Due: ${p.due_date}`);
      });
    }
    console.log('');
  }

  // 5. Buscar todos los tenants
  const { data: tenants, error: tenantsError } = await supabase
    .from('clients')
    .select('*')
    .in('email', ['maria.gomez@gmail.com', 'carlos.martinez@gmail.com', 'laura.rodriguez@gmail.com']);

  console.log('👥 Inquilinos encontrados:', tenants?.length || 0);
  if (tenants) {
    tenants.forEach(t => {
      console.log(`   - ${t.full_name} (${t.email})`);
      console.log(`     ID: ${t.id}`);
    });
  }
}

checkJuanDiegoData().catch(console.error);
