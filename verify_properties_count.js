// Script para verificar el conteo de propiedades en Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umhvimxqmjdqhzwnwyuh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaHZpbXhxbWpkcWh6d253eXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NDI1MDksImV4cCI6MjA1MDAxODUwOX0.aA1PwKBKOKdPNk6ZnEWv9kLQp8q68R6T90kqIL6gvXg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPropertiesCount() {
  try {
    console.log('🔍 Verificando conteo de propiedades en la base de datos...\n');

    // Obtener todas las propiedades (sin límite)
    const { data: allProperties, error: allError, count: allCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (allError) {
      console.error('❌ Error obteniendo propiedades:', allError);
      return;
    }

    console.log(`✅ Total de propiedades en la base de datos: ${allCount}`);
    console.log(`✅ Propiedades obtenidas: ${allProperties?.length || 0}\n`);

    // Contar por estado
    const statusCount = {};
    allProperties?.forEach(p => {
      statusCount[p.status] = (statusCount[p.status] || 0) + 1;
    });

    console.log('📊 Distribución por estado:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log('\n📋 Listado de propiedades:');
    allProperties?.forEach((p, index) => {
      console.log(`   ${index + 1}. ${p.code} - ${p.title} (${p.status})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyPropertiesCount();
