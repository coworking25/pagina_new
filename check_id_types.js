import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Environment variables not found. Please check .env file.');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'found' : 'missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'found' : 'missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIdTypes() {
  console.log('🔍 Checking ID column types in tables...\n');

  const tables = ['properties', 'clients', 'advisors'];

  for (const table of tables) {
    try {
      console.log(`📋 Checking ${table}.id type...`);

      // Get a sample record
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        console.log(`❌ Error accessing ${table}:`, error.message);
      } else if (data && data.length > 0) {
        const idValue = data[0].id;
        const idType = typeof idValue;

        console.log(`✅ ${table}.id type: ${idType}`);
        console.log(`   Sample value: ${idValue}`);

        // Check if it's a number (BIGINT) or string (UUID)
        if (idType === 'number') {
          console.log(`   ➡️  Use BIGINT for foreign keys`);
        } else if (idType === 'string' && idValue.includes('-')) {
          console.log(`   ➡️  Use UUID for foreign keys`);
        } else {
          console.log(`   ➡️  Unknown ID format`);
        }
      } else {
        console.log(`⚠️  No data found in ${table}`);
      }
    } catch (error) {
      console.log(`❌ Error checking ${table}:`, error.message);
    }
    console.log('');
  }
}

checkIdTypes().catch(console.error);