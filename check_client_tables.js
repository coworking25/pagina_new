import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTables() {
  console.log('🔍 Verificando tablas existentes...');

  const tables = [
    'client_credentials',
    'client_documents',
    'client_property_relations',
    'client_alerts',
    'client_communications',
    'payments',
    'contracts',
    'properties',
    'clients'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Error - ${err.message}`);
    }
  }
}

checkTables().catch(console.error);