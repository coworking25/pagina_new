const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para generar código basado en el tipo
function generatePropertyCode(type, index) {
  let prefix = '';
  
  switch(type) {
    case 'apartment':
      prefix = 'AP';
      break;
    case 'apartaestudio':
      prefix = 'AE';
      break;
    case 'house':
      prefix = 'CA';
      break;
    case 'office':
      prefix = 'OF';
      break;
    case 'commercial':
      prefix = 'LC';
      break;
    default:
      prefix = 'PR';
  }
  
  // Formato: XX-NNN (ej: AP-001, CA-015)
  const number = String(index).padStart(3, '0');
  return `${prefix}-${number}`;
}

async function assignCodesToProperties() {
  try {
    console.log('🔄 Iniciando asignación de códigos a propiedades...\n');

    // 1. Obtener todas las propiedades
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, title, type, code')
      .order('id', { ascending: true });

    if (fetchError) {
      console.error('❌ Error al obtener propiedades:', fetchError);
      return;
    }

    console.log(`📊 Total de propiedades encontradas: ${properties.length}\n`);

    // 2. Agrupar por tipo para asignar números secuenciales
    const propertiesByType = {};
    
    properties.forEach(prop => {
      if (!propertiesByType[prop.type]) {
        propertiesByType[prop.type] = [];
      }
      propertiesByType[prop.type].push(prop);
    });

    console.log('📋 Propiedades por tipo:');
    Object.keys(propertiesByType).forEach(type => {
      console.log(`   ${type}: ${propertiesByType[type].length} propiedades`);
    });
    console.log('');

    // 3. Asignar códigos
    let updated = 0;
    let alreadyHadCode = 0;
    let errors = 0;

    for (const type in propertiesByType) {
      const props = propertiesByType[type];
      
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        
        // Si ya tiene código, saltar
        if (prop.code) {
          console.log(`⏭️  ID ${prop.id}: Ya tiene código "${prop.code}" - ${prop.title}`);
          alreadyHadCode++;
          continue;
        }

        // Generar nuevo código
        const newCode = generatePropertyCode(type, i + 1);

        // Actualizar en la base de datos
        const { error: updateError } = await supabase
          .from('properties')
          .update({ code: newCode })
          .eq('id', prop.id);

        if (updateError) {
          console.error(`❌ Error actualizando ID ${prop.id}:`, updateError);
          errors++;
        } else {
          console.log(`✅ ID ${prop.id}: Código asignado "${newCode}" - ${prop.title}`);
          updated++;
        }
      }
    }

    // 4. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN:');
    console.log('='.repeat(60));
    console.log(`✅ Propiedades actualizadas: ${updated}`);
    console.log(`⏭️  Ya tenían código: ${alreadyHadCode}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📊 Total procesado: ${properties.length}`);
    console.log('='.repeat(60));

    // 5. Verificar resultados
    console.log('\n🔍 Verificando códigos asignados...\n');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('properties')
      .select('id, code, title, type')
      .order('code', { ascending: true });

    if (!verifyError && verifyData) {
      console.log('📋 Códigos asignados:');
      verifyData.forEach(prop => {
        if (prop.code) {
          console.log(`   ${prop.code} - ${prop.title} (${prop.type})`);
        } else {
          console.log(`   ⚠️  SIN CÓDIGO - ${prop.title} (ID: ${prop.id})`);
        }
      });
      
      const withCode = verifyData.filter(p => p.code).length;
      const withoutCode = verifyData.filter(p => !p.code).length;
      
      console.log(`\n✅ Con código: ${withCode}`);
      console.log(`⚠️  Sin código: ${withoutCode}`);
    }

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar
assignCodesToProperties();
