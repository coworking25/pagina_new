const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateThemeColors() {
  try {
    console.log('🎨 Actualizando colores del tema con los colores característicos de Coworking Inmobiliario...');

    // Colores característicos de la página
    const themeSettings = {
      key: 'theme',
      value: {
        primaryColor: '#00D4FF',    // Cyan brillante
        secondaryColor: '#39FF14',  // Verde neón característico
        darkMode: false
      }
    };

    console.log('Actualizando configuración de tema...');

    const { error } = await supabase
      .from('settings')
      .upsert(themeSettings, { onConflict: 'key' });

    if (error) {
      console.error('❌ Error actualizando colores del tema:', error.message);
    } else {
      console.log('✅ Colores del tema actualizados correctamente');
      console.log('   🔵 Color primario: #00D4FF (Cyan brillante)');
      console.log('   🟢 Color secundario: #39FF14 (Verde neón)');
    }

    // Verificar que se actualizó correctamente
    const { data, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'theme');

    if (fetchError) {
      console.error('❌ Error verificando actualización:', fetchError.message);
    } else if (data && data.length > 0) {
      console.log('\n📊 Configuración de tema actualizada:');
      console.log(`   Primary: ${data[0].value.primaryColor}`);
      console.log(`   Secondary: ${data[0].value.secondaryColor}`);
      console.log(`   Dark Mode: ${data[0].value.darkMode}`);
    }

    console.log('\n🎉 Colores del tema actualizados exitosamente!');

  } catch (error) {
    console.error('❌ Error actualizando colores del tema:', error.message);
  }
}

updateThemeColors();