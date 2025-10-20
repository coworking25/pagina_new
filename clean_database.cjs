const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDatabase() {
  console.log('🧹 LIMPIANDO SOLO CLIENTES Y SUS DATOS RELACIONADOS\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Verificar clientes actuales
    console.log('\n1️⃣  Verificando clientes actuales...');
    const { data: currentClients } = await supabase
      .from('clients')
      .select('id, full_name, email, client_type');
    
    console.log(`📊 Clientes encontrados: ${currentClients?.length || 0}`);
    if (currentClients && currentClients.length > 0) {
      console.log('\nClientes a eliminar:');
      currentClients.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.full_name} (${c.client_type})`);
      });
    }
    
    // 2. Eliminar pagos relacionados a clientes
    console.log('\n2️⃣  Eliminando pagos de estos clientes...');
    const { error: paymentsError } = await supabase
      .from('payments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (paymentsError) {
      console.error('❌ Error:', paymentsError.message);
    } else {
      console.log('✅ Pagos eliminados');
    }
    
    // 3. Eliminar contratos relacionados a clientes
    console.log('\n3️⃣  Eliminando contratos de estos clientes...');
    const { error: contractsError } = await supabase
      .from('contracts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (contractsError) {
      console.error('❌ Error:', contractsError.message);
    } else {
      console.log('✅ Contratos eliminados');
    }
    
    // 4. Eliminar comunicaciones
    console.log('\n4️⃣  Eliminando comunicaciones...');
    const { error: commsError } = await supabase
      .from('client_communications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (commsError) {
      console.error('❌ Error:', commsError.message);
    } else {
      console.log('✅ Comunicaciones eliminadas');
    }
    
    // 5. Eliminar alertas
    console.log('\n5️⃣  Eliminando alertas...');
    const { error: alertsError } = await supabase
      .from('client_alerts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (alertsError) {
      console.error('❌ Error:', alertsError.message);
    } else {
      console.log('✅ Alertas eliminadas');
    }
    
    // 6. Eliminar relaciones cliente-propiedad
    console.log('\n6️⃣  Eliminando relaciones cliente-propiedad...');
    const { error: relationsError } = await supabase
      .from('client_property_relations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (relationsError) {
      console.error('❌ Error:', relationsError.message);
    } else {
      console.log('✅ Relaciones eliminadas');
    }
    
    // 7. Ahora sí, eliminar clientes
    console.log('\n7️⃣  Eliminando clientes...');
    const { error: clientsError } = await supabase
      .from('clients')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (clientsError) {
      console.error('❌ Error:', clientsError.message);
      console.log('   Código:', clientsError.code);
    } else {
      console.log('✅ Clientes eliminados');
    }
    
    // 8. Verificar limpieza
    console.log('\n8️⃣  Verificando limpieza...');
    const { data: remainingClients } = await supabase
      .from('clients')
      .select('count');
    
    const { data: remainingContracts } = await supabase
      .from('contracts')
      .select('count');
    
    const { data: remainingPayments } = await supabase
      .from('payments')
      .select('count');
    
    console.log('✅ Verificación:');
    console.log(`   Clientes: ${remainingClients?.[0]?.count || 0}`);
    console.log(`   Contratos: ${remainingContracts?.[0]?.count || 0}`);
    console.log(`   Pagos: ${remainingPayments?.[0]?.count || 0}`);
    
    // 9. Verificar que otros datos permanezcan
    const { data: properties } = await supabase
      .from('properties')
      .select('count');
    
    const { data: advisors } = await supabase
      .from('advisors')
      .select('count');
    
    console.log('\n📊 Resto de la base de datos intacto:');
    console.log(`   Propiedades: ${properties?.[0]?.count || 0} ✅`);
    console.log(`   Asesores: ${advisors?.[0]?.count || 0} ✅`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 CLIENTES Y DATOS RELACIONADOS ELIMINADOS');
    console.log('\n💡 Siguiente paso:');
    console.log('   1. Recarga el dashboard (F5)');
    console.log('   2. Haz clic en "+ Nuevo Cliente"');
    console.log('   3. Llena el formulario correctamente');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

cleanDatabase();
