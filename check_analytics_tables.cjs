const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://txnfgfzsvqkbwdnlbxvb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bmZnZnpzdnFrYndkbmxieHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4NTQ3OTMsImV4cCI6MjA0NjQzMDc5M30.3tjG-YSWVdNJoJ8yNhHCx1SJLRD8gkEMt-s3FsWlmYo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAnalyticsTables() {
  console.log('🔍 Verificando tablas de analytics...\n');

  try {
    const [likesCount, viewsCount, contactsCount] = await Promise.all([
      supabase.from('property_likes').select('*', { count: 'exact', head: true }),
      supabase.from('property_views').select('*', { count: 'exact', head: true }),
      supabase.from('property_contacts').select('*', { count: 'exact', head: true })
    ]);

    console.log('📊 CONTEO ACTUAL:');
    console.log(`   ❤️  Likes: ${likesCount.count || 0}`);
    console.log(`   👁️  Vistas: ${viewsCount.count || 0}`);
    console.log(`   📞 Contactos: ${contactsCount.count || 0}\n`);

    // Mostrar errores si hay
    if (likesCount.error) console.error('❌ Error en likes:', likesCount.error);
    if (viewsCount.error) console.error('❌ Error en vistas:', viewsCount.error);
    if (contactsCount.error) console.error('❌ Error en contactos:', contactsCount.error);

    // Verificar visitantes únicos
    const { data: sessions, error: sessError } = await supabase
      .from('property_views')
      .select('session_id');

    if (sessError) {
      console.error('❌ Error obteniendo sesiones:', sessError);
    } else {
      const uniqueSessions = new Set(sessions?.map(s => s.session_id) || []).size;
      console.log(`   👥 Visitantes Únicos: ${uniqueSessions}\n`);
    }

    // Mostrar datos de ejemplo de cada tabla
    console.log('📝 DATOS DE EJEMPLO:\n');

    const { data: sampleLikes } = await supabase
      .from('property_likes')
      .select('*')
      .limit(3);
    console.log('Likes:', sampleLikes || 'Sin datos');

    const { data: sampleViews } = await supabase
      .from('property_views')
      .select('*')
      .limit(3);
    console.log('\nVistas:', sampleViews || 'Sin datos');

    const { data: sampleContacts } = await supabase
      .from('property_contacts')
      .select('*')
      .limit(3);
    console.log('\nContactos:', sampleContacts || 'Sin datos');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAnalyticsTables();
