const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let supabaseUrl = '';
let supabaseServiceKey = ''; // Necesitamos la service_role key

for (const line of envLines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  } else if (line.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY=') || line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    supabaseServiceKey = line.split('=')[1].trim();
  }
}

// Si no hay service_role key, usar anon key
let supabaseKey = '';
if (!supabaseServiceKey) {
  for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
      break;
    }
  }
  console.log('⚠️  Usando ANON_KEY (sin service_role key)');
} else {
  supabaseKey = supabaseServiceKey;
  console.log('✅ Usando SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLS() {
  try {
    console.log('🔍 DIAGNÓSTICO DE RLS\n');
    console.log('='.repeat(60));
    
    // 1. Probar consulta directa a contracts
    console.log('\n1️⃣  Probando acceso a contracts...');
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .limit(5);
    
    if (contractsError) {
      console.error('❌ Error:', contractsError.message);
      console.log('   Código:', contractsError.code);
      console.log('   Detalles:', contractsError.details);
      console.log('   Hint:', contractsError.hint);
    } else {
      console.log(`✅ Contratos accesibles: ${contracts?.length || 0}`);
      if (contracts && contracts.length > 0) {
        console.log('   Primer contrato:', contracts[0].contract_number);
      }
    }
    
    // 2. Probar consulta directa a payments
    console.log('\n2️⃣  Probando acceso a payments...');
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .limit(5);
    
    if (paymentsError) {
      console.error('❌ Error:', paymentsError.message);
      console.log('   Código:', paymentsError.code);
    } else {
      console.log(`✅ Pagos accesibles: ${payments?.length || 0}`);
    }
    
    // 3. Verificar estado de RLS
    console.log('\n3️⃣  Verificando estado de RLS...');
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('check_rls_status');
    
    if (rlsError) {
      console.log('⚠️  No se pudo verificar RLS (función no existe)');
    }
    
    // 4. Probar con el ID de Juan Diego
    console.log('\n4️⃣  Probando contratos de Juan Diego...');
    const juanDiegoId = 'd8871ea3-d748-407d-93e8-83969406be29';
    
    const { data: jdContracts, error: jdError } = await supabase
      .from('contracts')
      .select('*')
      .eq('landlord_id', juanDiegoId);
    
    if (jdError) {
      console.error('❌ Error:', jdError.message);
    } else {
      console.log(`✅ Contratos de Juan Diego: ${jdContracts?.length || 0}`);
      if (jdContracts && jdContracts.length > 0) {
        jdContracts.forEach(c => {
          console.log(`   - ${c.contract_number}: ${c.status}`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n💡 SOLUCIONES:\n');
    
    if (contractsError || paymentsError) {
      console.log('El problema es RLS (Row Level Security).');
      console.log('\nOPCIÓN 1 - Ejecutar SQL en Supabase:');
      console.log('   1. Ve a: https://supabase.com/dashboard → SQL Editor');
      console.log('   2. Abre el archivo: fix_rls_policies.sql');
      console.log('   3. Copia y pega el contenido');
      console.log('   4. Ejecuta el query\n');
      
      console.log('OPCIÓN 2 - Deshabilitar RLS (temporal):');
      console.log('   Ejecuta en SQL Editor:');
      console.log('   ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;');
      console.log('   ALTER TABLE payments DISABLE ROW LEVEL SECURITY;\n');
    } else {
      console.log('✅ No hay problemas de RLS detectados');
      console.log('   Los datos deberían estar visibles en el dashboard');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRLS();
