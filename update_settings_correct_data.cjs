const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateSettingsWithCorrectData() {
  try {
    console.log('🔄 Actualizando configuraciones con datos correctos de Coworking Inmobiliario...');

    // Datos correctos de la empresa
    const correctSettings = [
      {
        key: 'company_info',
        value: {
          companyName: 'Coworking Inmobiliario',
          companyDescription: 'Expertos en bienes raíces con más de 10 años de experiencia. Te acompañamos en cada paso hacia tu nuevo hogar con servicios integrales de arriendos, ventas, avalúos y asesorías especializadas.',
          companyLogo: '',
          websiteUrl: 'https://coworkinginmobiliario.com/'
        }
      },
      {
        key: 'contact_info',
        value: {
          contactEmail: 'inmobiliariocoworking5@gmail.com',
          contactPhone: '+57 314 886 0404',
          contactWhatsapp: '+57 314 886 0404',
          officeAddress: 'Carrera 41 #38 Sur - 43, Edificio Emporio Local 306, 5C97+F6 Envigado, Antioquia',
          officeHours: 'Lun - Vie: 9:00 AM - 5:00 PM, Sáb - Dom sin atención al cliente'
        }
      },
      {
        key: 'social_media',
        value: {
          facebook: '#',
          instagram: 'https://www.instagram.com/coworking_inmobiliario?igsh=c3VnM29jN3oydmhj&utm_source=qr',
          twitter: '#',
          linkedin: '#'
        }
      }
    ];

    // Actualizar cada configuración
    for (const setting of correctSettings) {
      console.log(`Actualizando ${setting.key}...`);

      const { error } = await supabase
        .from('settings')
        .upsert(setting, { onConflict: 'key' });

      if (error) {
        console.error(`❌ Error actualizando ${setting.key}:`, error.message);
      } else {
        console.log(`✅ ${setting.key} actualizado correctamente`);
      }
    }

    // Verificar que se actualizó correctamente
    const { data, error } = await supabase
      .from('settings')
      .select('*');

    if (error) {
      console.error('❌ Error verificando actualización:', error.message);
    } else {
      console.log('\n📊 Configuraciones actualizadas:');
      data.forEach((row, index) => {
        console.log(`${index + 1}. ${row.key}:`);
        console.log(`   Nombre: ${row.value.companyName || row.value.contactEmail || 'N/A'}`);
        if (row.value.companyDescription) {
          console.log(`   Descripción: ${row.value.companyDescription.substring(0, 50)}...`);
        }
      });
    }

    console.log('\n🎉 Configuraciones actualizadas exitosamente con los datos correctos de Coworking Inmobiliario!');

  } catch (error) {
    console.error('❌ Error actualizando configuraciones:', error.message);
  }
}

updateSettingsWithCorrectData();