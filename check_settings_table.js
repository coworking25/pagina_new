import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gfczfjpyyyyvteyrvhgt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc'
);

async function checkSettingsTable() {
  console.log('🔍 Verificando tabla de configuraciones...');

  try {
    // Intentar consultar la tabla settings
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Tabla settings no existe o hay error:', error.message);

      // Verificar si hay alguna tabla relacionada con configuraciones
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .ilike('table_name', '%setting%');

      if (!tableError && tables) {
        console.log('📋 Tablas relacionadas con settings encontradas:', tables.map(t => t.table_name));
      }
    } else {
      console.log('✅ Tabla settings existe');
      console.log('📄 Configuraciones actuales:', data);
    }
  } catch (err) {
    console.log('❌ Error general:', err.message);
  }
}

checkSettingsTable().catch(console.error);