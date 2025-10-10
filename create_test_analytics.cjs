const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://txnfgfzsvqkbwdnlbxvb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bmZnZnpzdnFrYndkbmxieHZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDg1NDc5MywiZXhwIjoyMDQ2NDMwNzkzfQ.LD9451m43nTX4LvVbQ-O7AEfPeOBr8xT3LcCdvawl2g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestAnalytics() {
  console.log('🧪 Creando datos de prueba para analytics...\n');

  try {
    // Obtener las primeras 5 propiedades
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, code, title')
      .limit(5);

    if (propError) throw propError;

    console.log(`📊 Propiedades encontradas: ${properties.length}\n`);

    // Crear vistas de prueba
    console.log('👁️ Creando vistas de prueba...');
    const views = [];
    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];
      // Crear 5-10 vistas por propiedad
      const numViews = Math.floor(Math.random() * 6) + 5;
      
      for (let j = 0; j < numViews; j++) {
        views.push({
          property_id: prop.id,
          session_id: `test_session_${i}_${j}_${Date.now()}`,
          device_type: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
          view_duration: Math.floor(Math.random() * 300) + 30,
          referrer: ['google', 'facebook', 'direct', 'instagram'][Math.floor(Math.random() * 4)],
          created_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
        });
      }
    }

    const { data: viewsData, error: viewsError } = await supabase
      .from('property_views')
      .insert(views)
      .select();

    if (viewsError) {
      console.error('❌ Error al crear vistas:', viewsError);
    } else {
      console.log(`✅ ${viewsData.length} vistas creadas\n`);
    }

    // Crear contactos de prueba
    console.log('📞 Creando contactos de prueba...');
    const contacts = [];
    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];
      // Crear 2-5 contactos por propiedad
      const numContacts = Math.floor(Math.random() * 4) + 2;
      
      for (let j = 0; j < numContacts; j++) {
        contacts.push({
          property_id: prop.id,
          contact_type: ['whatsapp', 'email', 'phone', 'schedule'][Math.floor(Math.random() * 4)],
          session_id: `test_session_contact_${i}_${j}_${Date.now()}`,
          name: `Usuario Prueba ${i}-${j}`,
          email: `test${i}${j}@example.com`,
          phone: `300${Math.floor(Math.random() * 10000000)}`,
          message: 'Mensaje de prueba para contacto',
          created_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
        });
      }
    }

    const { data: contactsData, error: contactsError } = await supabase
      .from('property_contacts')
      .insert(contacts)
      .select();

    if (contactsError) {
      console.error('❌ Error al crear contactos:', contactsError);
    } else {
      console.log(`✅ ${contactsData.length} contactos creados\n`);
    }

    // Verificar totales
    console.log('📊 Verificando totales...\n');

    const [likesCount, viewsCount, contactsCount] = await Promise.all([
      supabase.from('property_likes').select('*', { count: 'exact', head: true }),
      supabase.from('property_views').select('*', { count: 'exact', head: true }),
      supabase.from('property_contacts').select('*', { count: 'exact', head: true })
    ]);

    console.log('✅ TOTALES:');
    console.log(`   ❤️  Total Likes: ${likesCount.count || 0}`);
    console.log(`   👁️  Total Vistas: ${viewsCount.count || 0}`);
    console.log(`   📞 Total Contactos: ${contactsCount.count || 0}`);

    // Calcular visitantes únicos
    const { data: sessions } = await supabase
      .from('property_views')
      .select('session_id');

    const uniqueSessions = new Set(sessions?.map(s => s.session_id) || []).size;
    console.log(`   👥 Visitantes Únicos: ${uniqueSessions}\n`);

    console.log('🎉 Datos de prueba creados exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestAnalytics();
