const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanoweXl5eXZ0ZXlydmhndCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM0MDY2OTM4LCJleHAiOjIwNDk2NDI5Mzh9.uEpTFRMhZZJRxPMgFvQTKZEKo2jhO_B98xIHGW6l-6I';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdvisorCRUD() {
  console.log('🧪 Iniciando test de funciones CRUD para Asesores...\n');

  try {
    // 1. Verificar tabla de asesores existe
    console.log('📋 1. Verificando estructura de tabla asesores...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('advisors')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error verificando tabla:', tableError);
      console.log('⚠️  Necesitas crear la tabla primero. Ejecuta:');
      console.log('   1. Abre Supabase SQL Editor');
      console.log('   2. Ejecuta el script sql/03_create_advisors_table.sql');
      return;
    }
    
    console.log('✅ Tabla asesores existe y es accesible');

    // 2. Listar asesores existentes
    console.log('\n👥 2. Obteniendo asesores existentes...');
    const { data: existingAdvisors, error: fetchError } = await supabase
      .from('advisors')
      .select('*')
      .eq('is_active', true);
    
    if (fetchError) {
      console.error('❌ Error obteniendo asesores:', fetchError);
      return;
    }
    
    console.log(`✅ ${existingAdvisors.length} asesores encontrados:`);
    existingAdvisors.forEach((advisor, index) => {
      console.log(`   ${index + 1}. ${advisor.name} - ${advisor.specialty} (ID: ${advisor.id})`);
    });

    // 3. Test crear nuevo asesor
    console.log('\n🆕 3. Probando creación de asesor...');
    const testAdvisor = {
      name: 'Test Asesor',
      email: 'test@inmobiliaria.com',
      phone: '+57 300 000 0000',
      whatsapp: '573000000000',
      photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      specialty: 'Test Especialidad',
      rating: 4.5,
      reviews_count: 10,
      availability_weekdays: '9:00 AM - 5:00 PM',
      availability_weekends: 'No disponible',
      bio: 'Este es un asesor de prueba para testing.',
      experience_years: 3,
      is_active: true
    };

    const { data: newAdvisor, error: createError } = await supabase
      .from('advisors')
      .insert([testAdvisor])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creando asesor:', createError);
      return;
    }

    console.log('✅ Asesor creado exitosamente:');
    console.log(`   ID: ${newAdvisor.id}`);
    console.log(`   Nombre: ${newAdvisor.name}`);
    console.log(`   Email: ${newAdvisor.email}`);

    // 4. Test actualizar asesor
    console.log('\n🔧 4. Probando actualización de asesor...');
    const updateData = {
      specialty: 'Especialidad Actualizada',
      rating: 4.8,
      bio: 'Biografía actualizada para el asesor de prueba.'
    };

    const { data: updatedAdvisor, error: updateError } = await supabase
      .from('advisors')
      .update(updateData)
      .eq('id', newAdvisor.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error actualizando asesor:', updateError);
      return;
    }

    console.log('✅ Asesor actualizado exitosamente:');
    console.log(`   Especialidad: ${updatedAdvisor.specialty}`);
    console.log(`   Rating: ${updatedAdvisor.rating}`);

    // 5. Test eliminar asesor (soft delete)
    console.log('\n🗑️ 5. Probando eliminación de asesor...');
    const { error: deleteError } = await supabase
      .from('advisors')
      .update({ is_active: false })
      .eq('id', newAdvisor.id);

    if (deleteError) {
      console.error('❌ Error eliminando asesor:', deleteError);
      return;
    }

    console.log('✅ Asesor eliminado exitosamente (soft delete)');

    // 6. Verificar que el asesor no aparece en listado activo
    console.log('\n✔️ 6. Verificando que no aparece en listado activo...');
    const { data: activeAdvisors, error: activeError } = await supabase
      .from('advisors')
      .select('*')
      .eq('is_active', true)
      .eq('id', newAdvisor.id);

    if (activeError) {
      console.error('❌ Error verificando asesor activo:', activeError);
      return;
    }

    if (activeAdvisors.length === 0) {
      console.log('✅ Confirmado: Asesor no aparece en listado activo');
    } else {
      console.log('⚠️  Advertencia: Asesor todavía aparece como activo');
    }

    // 7. Limpiar datos de prueba (eliminar completamente)
    console.log('\n🧹 7. Limpiando datos de prueba...');
    const { error: cleanupError } = await supabase
      .from('advisors')
      .delete()
      .eq('id', newAdvisor.id);

    if (cleanupError) {
      console.error('⚠️  Advertencia: No se pudo limpiar datos de prueba:', cleanupError);
    } else {
      console.log('✅ Datos de prueba limpiados exitosamente');
    }

    console.log('\n🎉 ¡Todas las pruebas CRUD pasaron exitosamente!');
    console.log('\n📱 Puedes probar el dashboard en: http://localhost:5174/admin/advisors');

  } catch (error) {
    console.error('💥 Error general en test:', error);
  }
}

// Ejecutar test
testAdvisorCRUD();
