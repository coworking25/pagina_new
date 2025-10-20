const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let supabaseUrl = '';
let supabaseKey = '';

for (const line of envLines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  } else if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1].trim();
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugQuery() {
  const clientId = 'd8871ea3-d748-407d-93e8-83969406be29';
  
  console.log('🔍 DEPURACIÓN DE CONSULTAS\n');
  console.log('ClientID:', clientId, '\n');
  
  // Método 1: OR con paréntesis
  console.log('1️⃣  Probando con .or()...');
  const { data: data1, error: error1 } = await supabase
    .from('contracts')
    .select('*')
    .or(`client_id.eq.${clientId},landlord_id.eq.${clientId}`);
  
  console.log('   Resultado:', data1?.length || 0, 'contratos');
  if (error1) console.log('   Error:', error1.message);
  
  // Método 2: Dos consultas separadas
  console.log('\n2️⃣  Probando landlord_id directamente...');
  const { data: data2, error: error2 } = await supabase
    .from('contracts')
    .select('*')
    .eq('landlord_id', clientId);
  
  console.log('   Resultado:', data2?.length || 0, 'contratos');
  if (error2) console.log('   Error:', error2.message);
  if (data2 && data2.length > 0) {
    console.log('   Primer contrato:', data2[0].contract_number);
  }
  
  // Método 3: client_id
  console.log('\n3️⃣  Probando client_id directamente...');
  const { data: data3, error: error3 } = await supabase
    .from('contracts')
    .select('*')
    .eq('client_id', clientId);
  
  console.log('   Resultado:', data3?.length || 0, 'contratos');
  
  // Método 4: Todos los contratos
  console.log('\n4️⃣  Obteniendo TODOS los contratos...');
  const { data: allContracts } = await supabase
    .from('contracts')
    .select('contract_number, client_id, landlord_id, status')
    .limit(10);
  
  console.log('   Total contratos en BD:', allContracts?.length || 0);
  if (allContracts && allContracts.length > 0) {
    console.log('\n   Primeros 5 contratos:');
    allContracts.slice(0, 5).forEach(c => {
      console.log(`   - ${c.contract_number}: landlord=${c.landlord_id?.substring(0,8)}... status=${c.status}`);
    });
  }
}

debugQuery();
