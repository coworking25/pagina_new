const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSettingsTable() {
  try {
    console.log('🔍 Probando tabla de configuraciones...');

    // Verificar que la tabla existe y tiene datos
    const { data, error } = await supabase
      .from('settings')
      .select('*');

    if (error) {
      console.error('❌ Error accediendo a la tabla settings:', error.message);
      console.log('💡 Asegúrate de ejecutar el archivo CREATE_SETTINGS_TABLE_SUPABASE.sql en el SQL Editor de Supabase');
      return;
    }

    console.log(`✅ Tabla settings encontrada con ${data.length} registros`);

    // Mostrar los registros existentes
    data.forEach((row, index) => {
      console.log(`${index + 1}. ${row.key}:`, JSON.stringify(row.value, null, 2));
    });

    // Probar escritura (actualizar un setting)
    console.log('\n🔄 Probando escritura...');
    const testUpdate = {
      key: 'company_info',
      value: {
        companyName: 'INMOBILIARIA NEXUS TEST',
        companyDescription: 'Tu mejor opción en bienes raíces - TEST',
        companyLogo: '',
        websiteUrl: 'https://inmobiliarianexus.com'
      }
    };

    const { error: updateError } = await supabase
      .from('settings')
      .upsert(testUpdate, { onConflict: 'key' });

    if (updateError) {
      console.error('❌ Error actualizando setting:', updateError.message);
    } else {
      console.log('✅ Setting actualizado correctamente');

      // Revertir el cambio de prueba
      const originalData = data.find(row => row.key === 'company_info');
      if (originalData) {
        await supabase
          .from('settings')
          .upsert(originalData, { onConflict: 'key' });
        console.log('✅ Cambio de prueba revertido');
      }
    }

    console.log('\n🎉 Tabla de configuraciones funcionando correctamente!');

  } catch (error) {
    console.error('❌ Error probando tabla de configuraciones:', error.message);
  }
}

testSettingsTable();