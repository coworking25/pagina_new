import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njxrtfyqnzakagwewzrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qeHJ0Znlxbnpha2Fnd2V3enJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDYyMzY2MywiZXhwIjoyMDUwMTk5NjYzfQ.ey9L7UE3IzHgdVsIyRUP6u4w7fIMLnD4b3uM4CqQPGc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDuplicateProperties() {
  console.log('🧹 Limpiando propiedades duplicadas...\n');
  
  try {
    // Primero, obtener todas las propiedades para analizar
    const { data: allProperties, error: fetchError } = await supabase
      .from('properties')
      .select('id, code, title, created_at, advisor_id')
      .order('created_at', { ascending: true });
    
    if (fetchError) {
      console.error('❌ Error al obtener propiedades:', fetchError);
      return;
    }
    
    console.log(`📊 Total de propiedades encontradas: ${allProperties.length}`);
    
    // Identificar duplicados por código
    const propertyGroups = {};
    allProperties.forEach(prop => {
      if (prop.code) {
        if (!propertyGroups[prop.code]) {
          propertyGroups[prop.code] = [];
        }
        propertyGroups[prop.code].push(prop);
      }
    });
    
    // Encontrar propiedades sin código (las antiguas)
    const propertiesWithoutCode = allProperties.filter(prop => !prop.code);
    console.log(`📋 Propiedades sin código (para eliminar): ${propertiesWithoutCode.length}`);
    
    // Encontrar duplicados con código
    const duplicateGroups = Object.entries(propertyGroups).filter(([code, props]) => props.length > 1);
    console.log(`🔄 Grupos con duplicados: ${duplicateGroups.length}`);
    
    let toDelete = [];
    
    // Agregar propiedades sin código a la lista de eliminación
    toDelete = toDelete.concat(propertiesWithoutCode.map(p => p.id));
    
    // Para cada grupo de duplicados, mantener solo el más reciente (con advisor_id)
    duplicateGroups.forEach(([code, props]) => {
      console.log(`\n🔍 Analizando duplicados para código ${code}:`);
      props.forEach(prop => {
        console.log(`   ID: ${prop.id}, Fecha: ${prop.created_at}, Advisor: ${prop.advisor_id || 'Sin asignar'}`);
      });
      
      // Ordenar por fecha de creación (más reciente primero)
      const sortedProps = props.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Mantener solo el más reciente, eliminar el resto
      const toKeep = sortedProps[0];
      const toDeleteFromGroup = sortedProps.slice(1);
      
      console.log(`   ✅ Mantener: ID ${toKeep.id} (más reciente)`);
      toDeleteFromGroup.forEach(prop => {
        console.log(`   ❌ Eliminar: ID ${prop.id} (duplicado)`);
        toDelete.push(prop.id);
      });
    });
    
    if (toDelete.length === 0) {
      console.log('\n✅ No hay propiedades duplicadas para eliminar');
      return;
    }
    
    console.log(`\n🗑️  Eliminando ${toDelete.length} propiedades duplicadas...`);
    
    // Eliminar en lotes para evitar timeouts
    const batchSize = 10;
    let deletedCount = 0;
    
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = toDelete.slice(i, i + batchSize);
      
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .in('id', batch);
      
      if (deleteError) {
        console.error(`❌ Error eliminando lote ${i/batchSize + 1}:`, deleteError);
      } else {
        deletedCount += batch.length;
        console.log(`✅ Lote ${i/batchSize + 1} eliminado (${batch.length} propiedades)`);
      }
    }
    
    console.log(`\n🎉 Limpieza completada: ${deletedCount} propiedades eliminadas`);
    
    // Verificar resultado final
    const { data: finalProperties, error: finalError } = await supabase
      .from('properties')
      .select('id, code, title')
      .order('code');
    
    if (finalError) {
      console.error('❌ Error verificando resultado:', finalError);
    } else {
      console.log(`\n📊 Resultado final: ${finalProperties.length} propiedades únicas`);
      console.log('\n📋 Propiedades restantes:');
      finalProperties.forEach(prop => {
        console.log(`   ${prop.code}: ${prop.title}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

cleanDuplicateProperties();
