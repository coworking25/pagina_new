const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tydzamhmfwsdbqejemxt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5ZHphbWhtZndzZGJxZWplbXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk4MTU1NDgsImV4cCI6MjA0NTM5MTU0OH0.WxXr7ckdVr0NcNROnRqiUGOMQUFkGBMrTUqtauvOcPs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPropertyAppointments() {
  try {
    console.log('🔍 Buscando propiedad "Apartamento en Sabaneta - Las Lomitas"...\n');
    
    // Buscar la propiedad
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, deleted_at')
      .ilike('title', '%Apartamento en Sabaneta - Las Lomitas%')
      .single();

    if (propertyError) {
      console.error('❌ Error buscando propiedad:', propertyError);
      return;
    }

    if (!property) {
      console.log('❌ Propiedad no encontrada');
      return;
    }

    console.log('✅ Propiedad encontrada:');
    console.log('   ID:', property.id);
    console.log('   Título:', property.title);
    console.log('   Eliminada:', property.deleted_at ? 'SÍ' : 'NO');
    console.log('');

    // Buscar TODAS las citas asociadas (incluyendo deleted_at)
    console.log('🔍 Buscando TODAS las citas asociadas...\n');
    
    const { data: allAppointments, error: allError } = await supabase
      .from('property_appointments')
      .select('id, status, created_at, deleted_at, client_name, client_email, client_phone')
      .eq('property_id', property.id)
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error buscando citas:', allError);
      return;
    }

    console.log(`📊 Total de citas en la base de datos: ${allAppointments?.length || 0}\n`);

    if (allAppointments && allAppointments.length > 0) {
      allAppointments.forEach((apt, index) => {
        console.log(`--- Cita ${index + 1} ---`);
        console.log('   ID:', apt.id);
        console.log('   Status:', apt.status);
        console.log('   Cliente:', apt.client_name);
        console.log('   Email:', apt.client_email);
        console.log('   Teléfono:', apt.client_phone);
        console.log('   Creada:', new Date(apt.created_at).toLocaleString());
        console.log('   Eliminada:', apt.deleted_at ? `SÍ (${new Date(apt.deleted_at).toLocaleString()})` : 'NO');
        console.log('');
      });
    }

    // Buscar citas activas (pending/confirmed sin deleted_at)
    console.log('🔍 Buscando citas ACTIVAS (pending/confirmed)...\n');
    
    const { data: activeAppointments, error: activeError } = await supabase
      .from('property_appointments')
      .select('id, status, deleted_at')
      .eq('property_id', property.id)
      .in('status', ['pending', 'confirmed']);

    if (activeError) {
      console.error('❌ Error buscando citas activas:', activeError);
      return;
    }

    console.log(`📊 Citas activas encontradas: ${activeAppointments?.length || 0}\n`);

    if (activeAppointments && activeAppointments.length > 0) {
      activeAppointments.forEach((apt, index) => {
        console.log(`--- Cita Activa ${index + 1} ---`);
        console.log('   ID:', apt.id);
        console.log('   Status:', apt.status);
        console.log('   Deleted_at:', apt.deleted_at || 'NULL');
        console.log('');
      });
    }

    // Verificar si hay citas con deleted_at pero aún con status pending/confirmed
    const citasConProblema = activeAppointments?.filter(apt => apt.deleted_at) || [];
    
    if (citasConProblema.length > 0) {
      console.log('⚠️  PROBLEMA DETECTADO:');
      console.log(`   Hay ${citasConProblema.length} citas que tienen deleted_at pero siguen con status pending/confirmed`);
      console.log('   Esto impide eliminar la propiedad.\n');
      console.log('   IDs de citas problemáticas:', citasConProblema.map(c => c.id).join(', '));
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkPropertyAppointments();
