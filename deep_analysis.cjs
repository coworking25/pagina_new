const { createClient } = require('@supabase/supabase-js');

// BD actual del dashboard
const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepAnalysis() {
  const juanDiegoId = 'd8871ea3-d748-407d-93e8-83969406be29';
  
  console.log('🔍 ANÁLISIS PROFUNDO DE LA BASE DE DATOS\n');
  console.log('='.repeat(70));
  console.log('Base de datos:', supabaseUrl);
  console.log('Juan Diego ID:', juanDiegoId);
  console.log('='.repeat(70));
  
  // 1. Verificar que Juan Diego existe
  console.log('\n1️⃣  VERIFICANDO JUAN DIEGO...');
  const { data: jd, error: jdError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', juanDiegoId)
    .single();
  
  if (jdError) {
    console.error('❌ Error:', jdError.message);
    return;
  }
  
  console.log('✅ Juan Diego existe');
  console.log('   Nombre:', jd.full_name);
  console.log('   Tipo:', jd.client_type);
  console.log('   Email:', jd.email);
  
  // 2. Verificar tabla contracts
  console.log('\n2️⃣  ANALIZANDO TABLA CONTRACTS...');
  const { data: allContracts, error: contractsError } = await supabase
    .from('contracts')
    .select('*');
  
  if (contractsError) {
    console.error('❌ Error accediendo a contracts:', contractsError.message);
    console.log('   Código:', contractsError.code);
    console.log('   Detalles:', contractsError.details);
  } else {
    console.log(`✅ Total contratos en BD: ${allContracts?.length || 0}`);
    
    if (allContracts && allContracts.length > 0) {
      console.log('\n   Todos los contratos:');
      allContracts.forEach((c, i) => {
        console.log(`   ${i+1}. ${c.contract_number || 'SIN NÚMERO'}`);
        console.log(`      - client_id: ${c.client_id?.substring(0,8)}...`);
        console.log(`      - landlord_id: ${c.landlord_id?.substring(0,8)}...`);
        console.log(`      - ¿Es de Juan Diego? ${c.landlord_id === juanDiegoId ? '✅ SÍ' : '❌ NO'}`);
      });
    }
  }
  
  // 3. Probar consulta con OR
  console.log('\n3️⃣  PROBANDO CONSULTA CON OR...');
  const orFilter = `client_id.eq.${juanDiegoId},landlord_id.eq.${juanDiegoId}`;
  console.log('   Filtro:', orFilter);
  
  const { data: orContracts, error: orError } = await supabase
    .from('contracts')
    .select('*')
    .or(orFilter);
  
  if (orError) {
    console.error('❌ Error con OR:', orError.message);
  } else {
    console.log(`✅ Contratos encontrados con OR: ${orContracts?.length || 0}`);
  }
  
  // 4. Probar solo landlord_id
  console.log('\n4️⃣  PROBANDO SOLO LANDLORD_ID...');
  const { data: landlordContracts, error: llError } = await supabase
    .from('contracts')
    .select('*')
    .eq('landlord_id', juanDiegoId);
  
  if (llError) {
    console.error('❌ Error:', llError.message);
  } else {
    console.log(`✅ Contratos con landlord_id: ${landlordContracts?.length || 0}`);
  }
  
  // 5. Verificar tabla payments
  console.log('\n5️⃣  ANALIZANDO TABLA PAYMENTS...');
  const { data: allPayments, error: paymentsError } = await supabase
    .from('payments')
    .select('*');
  
  if (paymentsError) {
    console.error('❌ Error accediendo a payments:', paymentsError.message);
  } else {
    console.log(`✅ Total pagos en BD: ${allPayments?.length || 0}`);
    
    if (allPayments && allPayments.length > 0) {
      console.log('\n   Primeros 3 pagos:');
      allPayments.slice(0, 3).forEach((p, i) => {
        console.log(`   ${i+1}. $${p.amount?.toLocaleString() || '???'} - ${p.status}`);
        console.log(`      - contract_id: ${p.contract_id?.substring(0,8)}...`);
      });
    }
  }
  
  // 6. Verificar estructura de la tabla contracts
  console.log('\n6️⃣  VERIFICANDO ESQUEMA DE CONTRACTS...');
  const { data: contractSchema, error: schemaError } = await supabase
    .from('contracts')
    .select('*')
    .limit(1);
  
  if (!schemaError && contractSchema && contractSchema[0]) {
    console.log('✅ Columnas encontradas:');
    Object.keys(contractSchema[0]).forEach(col => {
      console.log(`   - ${col}: ${typeof contractSchema[0][col]}`);
    });
  }
  
  // 7. Verificar políticas RLS
  console.log('\n7️⃣  VERIFICANDO RLS (Row Level Security)...');
  console.log('   Intentando consulta sin filtros...');
  
  const { data: noFilterContracts, error: nfError } = await supabase
    .from('contracts')
    .select('count');
  
  if (nfError) {
    console.error('❌ RLS podría estar bloqueando:', nfError.message);
  } else {
    console.log('✅ Acceso permitido sin filtros');
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN DEL DIAGNÓSTICO\n');
  
  if (!contractsError && allContracts && allContracts.length > 0) {
    const jdContracts = allContracts.filter(c => c.landlord_id === juanDiegoId);
    console.log(`✅ Contratos de Juan Diego: ${jdContracts.length}`);
    
    if (jdContracts.length > 0) {
      console.log('\n💡 Los contratos EXISTEN en la BD');
      console.log('   El problema está en el FRONTEND o en la CONSULTA');
      console.log('\n🔧 Posibles causas:');
      console.log('   1. Cache del navegador (Ctrl+Shift+R)');
      console.log('   2. Error en getContractsEnriched()');
      console.log('   3. Supabase client mal configurado en frontend');
    } else {
      console.log('\n⚠️ Juan Diego NO tiene contratos asignados');
      console.log('   Ejecuta: node create_data_current_db.cjs');
    }
  } else {
    console.log('❌ No hay contratos en la base de datos');
  }
  
  console.log('='.repeat(70));
}

deepAnalysis();
