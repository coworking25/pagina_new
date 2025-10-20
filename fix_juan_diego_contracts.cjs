const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bsssqdcohebdcwpgobqv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzc3NxZGNvaGViZGN3cGdvYnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MzM2ODEsImV4cCI6MjA0ODMwOTY4MX0.qXcSZedAgC3bLeV-CfHpYEAOCf8Ez6bVPbuqP_oSOJE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixJuanDiegoContracts() {
  console.log('🔧 Corrigiendo contratos de Juan Diego...\n');

  // 1. Obtener el ID real de Juan Diego
  const { data: juanDiego, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('email', 'diegorpo9608@gmail.com')
    .single();

  if (clientError || !juanDiego) {
    console.error('❌ No se encontró Juan Diego:', clientError);
    return;
  }

  console.log('✅ Juan Diego encontrado:');
  console.log('   ID:', juanDiego.id);
  console.log('   Nombre:', juanDiego.full_name);
  console.log('');

  // 2. Verificar si ya tiene contratos
  const { data: existingContracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('landlord_id', juanDiego.id);

  console.log(`📄 Contratos existentes: ${existingContracts?.length || 0}`);

  if (existingContracts && existingContracts.length > 0) {
    console.log('✅ Juan Diego ya tiene contratos asignados!');
    existingContracts.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.contract_number} - Status: ${c.status}`);
    });
    return;
  }

  // 3. Buscar contratos huérfanos (sin landlord correcto)
  const { data: allContracts } = await supabase
    .from('contracts')
    .select('*')
    .in('contract_number', ['CONT-2024-001', 'CONT-2023-045', 'CONT-2024-015']);

  console.log(`\n🔍 Contratos de prueba encontrados: ${allContracts?.length || 0}`);

  if (!allContracts || allContracts.length === 0) {
    console.log('❌ No se encontraron los contratos de prueba');
    console.log('💡 Ejecuta primero: node execute_landlord_data_v2.cjs');
    return;
  }

  // 4. Actualizar los contratos para asignarlos a Juan Diego
  console.log(`\n🔧 Actualizando ${allContracts.length} contratos...`);
  
  for (const contract of allContracts) {
    const { error: updateError } = await supabase
      .from('contracts')
      .update({ landlord_id: juanDiego.id })
      .eq('id', contract.id);

    if (updateError) {
      console.error(`❌ Error actualizando ${contract.contract_number}:`, updateError);
    } else {
      console.log(`✅ ${contract.contract_number} asignado a Juan Diego`);
    }
  }

  console.log('\n✅ Proceso completado!');
  console.log('🔄 Recarga la página del dashboard para ver los cambios');
}

fixJuanDiegoContracts().catch(console.error);
