import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Environment variables not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('🔍 Checking if calendar_settings table exists...');

    // Try to select from calendar_settings
    const { data, error } = await supabase
      .from('calendar_settings')
      .select('setting_key')
      .limit(1);

    if (error) {
      console.log('❌ calendar_settings table does not exist or is not accessible');
      console.log('Error:', error.message);

      // Try to create the table using a simple insert that should fail gracefully
      console.log('📝 Attempting to create calendar_settings table...');

      // Since we can't execute raw SQL, let's try to insert a record
      // This will fail if the table doesn't exist, but will give us more info
      const { error: insertError } = await supabase
        .from('calendar_settings')
        .insert({
          setting_key: 'test',
          setting_value: 'test'
        });

      if (insertError) {
        console.log('❌ Cannot create table via client. Need to run SQL manually in Supabase dashboard.');
        console.log('Please go to Supabase Dashboard > SQL Editor and run the create_calendar_system.sql file');
      }
    } else {
      console.log('✅ calendar_settings table exists!');
      console.log('Data:', data);
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

checkTables();