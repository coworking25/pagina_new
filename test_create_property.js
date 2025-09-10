import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreateProperty() {
  console.log('🧪 Probando creación de propiedad...\n');
  
  try {
    // Generar próximo código
    const { data: lastProperty } = await supabase
      .from('properties')
      .select('code')
      .not('code', 'is', null)
      .order('code', { ascending: false })
      .limit(1);
    
    let nextCode = 'CA-001';
    if (lastProperty && lastProperty.length > 0) {
      const lastCode = lastProperty[0].code;
      const match = lastCode.match(/CA-(\d+)/);
      if (match) {
        const nextNumber = parseInt(match[1]) + 1;
        nextCode = `CA-${nextNumber.toString().padStart(3, '0')}`;
      }
    }
    
    console.log(`🏷️ Código para prueba: ${nextCode}`);
    
    // Crear propiedad de prueba
    const testProperty = {
      code: nextCode,
      title: 'Propiedad de Prueba - Sistema de Imágenes',
      description: 'Esta es una propiedad de prueba para verificar el sistema de subida de imágenes',
      price: 250000000,
      location: 'Medellín, Antioquia',
      bedrooms: 3,
      bathrooms: 2,
      area: 85,
      type: 'apartment',
      status: 'sale',
      amenities: ['wifi', 'parking', 'security'],
      images: [],
      featured: false,
      advisor_id: null
    };
    
    console.log('📝 Datos de la propiedad:', testProperty);
    
    const { data, error } = await supabase
      .from('properties')
      .insert([testProperty])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error:', error);
      console.log('📋 Detalles del error:', error.message);
      console.log('🔍 Código de error:', error.code);
      return;
    }
    
    console.log('✅ Propiedad creada exitosamente!');
    console.log('🆔 ID:', data.id);
    console.log('🏷️ Código:', data.code);
    console.log('📍 Título:', data.title);
    
    // Limpiar - eliminar la propiedad de prueba
    await supabase
      .from('properties')
      .delete()
      .eq('id', data.id);
    
    console.log('🧹 Propiedad de prueba eliminada');
    console.log('\n🎉 ¡Sistema funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testCreateProperty();
