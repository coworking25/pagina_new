// ==================================================================
// SCRIPT PARA CORREGIR LANDLORD_ID DE JUAN DIEGO
// ==================================================================
// Instrucciones:
// 1. Abre el dashboard en: http://localhost:5173/admin/clients
// 2. Abre la consola del navegador (F12)
// 3. Copia y pega TODO este código en la consola
// 4. Presiona Enter
// ==================================================================

(async function fixJuanDiegoData() {
  console.log('🔧 Iniciando corrección de datos de Juan Diego...\n');

  try {
    // Importar supabase desde el módulo global
    const { supabase } = await import('./src/lib/supabase.ts');

    // 1. Buscar Juan Diego
    const { data: juanDiego, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', 'diegorpo9608@gmail.com')
      .single();

    if (clientError) {
      console.error('❌ Error buscando Juan Diego:', clientError.message);
      return;
    }

    if (!juanDiego) {
      console.error('❌ Cliente no encontrado');
      return;
    }

    console.log('✅ Juan Diego encontrado:');
    console.log('   ID:', juanDiego.id);
    console.log('   Nombre:', juanDiego.full_name);
    console.log('   Email:', juanDiego.email);
    console.log('');

    // 2. Verificar contratos actuales
    const { data: currentContracts } = await supabase
      .from('contracts')
      .select('*')
      .eq('landlord_id', juanDiego.id);

    console.log(`📄 Contratos actuales con landlord_id correcto: ${currentContracts?.length || 0}`);

    // 3. Buscar contratos de prueba
    const { data: testContracts } = await supabase
      .from('contracts')
      .select('*')
      .in('contract_number', ['CONT-2024-001', 'CONT-2023-045', 'CONT-2024-015']);

    console.log(`\n🔍 Contratos de prueba encontrados: ${testContracts?.length || 0}`);

    if (!testContracts || testContracts.length === 0) {
      console.warn('⚠️ No se encontraron los contratos de prueba');
      console.log('💡 Ejecuta primero: node execute_landlord_data_v2.cjs');
      return;
    }

    console.log('\nContratos encontrados:');
    testContracts.forEach(c => {
      console.log(`   - ${c.contract_number}: landlord_id = ${c.landlord_id}`);
      console.log(`     ¿Coincide? ${c.landlord_id === juanDiego.id ? '✅' : '❌'}`);
    });

    // 4. Actualizar contratos si es necesario
    let updatedCount = 0;
    console.log('\n🔧 Actualizando contratos...');

    for (const contract of testContracts) {
      if (contract.landlord_id !== juanDiego.id) {
        const { error: updateError } = await supabase
          .from('contracts')
          .update({ landlord_id: juanDiego.id })
          .eq('id', contract.id);

        if (updateError) {
          console.error(`❌ Error actualizando ${contract.contract_number}:`, updateError.message);
        } else {
          console.log(`✅ ${contract.contract_number} actualizado`);
          updatedCount++;
        }
      } else {
        console.log(`⏭️  ${contract.contract_number} ya tiene el landlord_id correcto`);
      }
    }

    // 5. Verificar resultado final
    const { data: finalContracts } = await supabase
      .from('contracts')
      .select('*')
      .eq('landlord_id', juanDiego.id);

    console.log(`\n✅ Contratos finales asignados a Juan Diego: ${finalContracts?.length || 0}`);

    // 6. Contar pagos
    if (finalContracts && finalContracts.length > 0) {
      const contractIds = finalContracts.map(c => c.id);
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .in('contract_id', contractIds);

      console.log(`💰 Pagos asociados a estos contratos: ${payments?.length || 0}`);
      
      if (payments && payments.length > 0) {
        console.log('\nDetalle de pagos:');
        payments.forEach((p, i) => {
          console.log(`   ${i + 1}. $${p.amount.toLocaleString()} - ${p.status} - Vence: ${p.due_date}`);
        });
      }
    }

    console.log('\n🎉 Proceso completado!');
    if (updatedCount > 0) {
      console.log('🔄 Cierra el modal si está abierto y vuelve a abrir el cliente Juan Diego');
      console.log('   O recarga la página (F5) para ver los cambios');
    }

  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
  }
})();
