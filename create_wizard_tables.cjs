require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createWizardTables() {
  console.log('🗄️  CREANDO TABLAS PARA WIZARD DE CLIENTE\n');
  console.log('='.repeat(60));

  try {
    // Leer el archivo SQL
    const sql = fs.readFileSync('create_client_wizard_tables.sql', 'utf8');
    
    // Ejecutar el SQL
    console.log('\n📝 Ejecutando SQL...\n');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error ejecutando SQL:', error.message);
      console.log('\n💡 Debes ejecutar este SQL manualmente en Supabase:');
      console.log('   1. Ve a tu proyecto en Supabase');
      console.log('   2. Ve a SQL Editor');
      console.log('   3. Copia y pega el contenido de create_client_wizard_tables.sql');
      console.log('   4. Ejecuta el script');
      return;
    }
    
    console.log('✅ Tablas creadas exitosamente!');
    console.log('\n📊 Tablas creadas:');
    console.log('   1. client_portal_credentials - Credenciales de acceso');
    console.log('   2. client_documents - Documentos del cliente');
    console.log('   3. client_payment_config - Configuración de pagos');
    console.log('   4. client_references - Referencias personales/comerciales');
    console.log('   5. client_contract_info - Info extendida de contrato');
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 BASE DE DATOS LISTA PARA WIZARD');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Ejecuta el SQL manualmente en Supabase SQL Editor');
  }
}

createWizardTables();
