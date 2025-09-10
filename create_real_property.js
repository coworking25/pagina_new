import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gfczfjpyyyyvteyrvhgt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc'
);

async function generateNextCode() {
  const { data, error } = await supabase
    .from('properties')
    .select('code')
    .not('code', 'is', null)
    .order('code', { ascending: false })
    .limit(1);

  if (error) throw error;

  if (!data || data.length === 0) {
    return 'CA-001';
  }

  const lastCode = data[0].code;
  const lastNumber = parseInt(lastCode.split('-')[1]);
  const nextNumber = lastNumber + 1;
  return `CA-${nextNumber.toString().padStart(3, '0')}`;
}

async function createRealProperty() {
  try {
    console.log('🏠 Creando propiedad REAL (sin eliminar)...');
    
    // Generar el siguiente código disponible
    const nextCode = await generateNextCode();
    console.log('🏷️ Código asignado:', nextCode);
    
    // Datos de la propiedad real
    const propertyData = {
      code: nextCode,
      title: 'Apartamento de Prueba - Sistema Funcional',
      description: 'Esta propiedad demuestra que el sistema de creación funciona correctamente. Se puede editar o eliminar desde el dashboard.',
      price: 300000000,
      location: 'Medellín, Antioquia - Zona de Prueba',
      bedrooms: 3,
      bathrooms: 2,
      area: 90,
      type: 'apartment',
      status: 'sale',
      amenities: ['wifi', 'parking', 'security', 'gym'],
      images: [],
      featured: true,
      advisor_id: null
    };
    
    console.log('📝 Creando propiedad con datos:', propertyData);
    
    // Crear la propiedad
    const { data, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creando propiedad:', error);
      return;
    }
    
    console.log('✅ ¡Propiedad creada exitosamente y GUARDADA!');
    console.log('🆔 ID:', data.id);
    console.log('🏷️ Código:', data.code);
    console.log('📍 Título:', data.title);
    console.log('💰 Precio:', data.price.toLocaleString());
    console.log('📍 Ubicación:', data.location);
    
    console.log('\n🎯 La propiedad ya está disponible en el dashboard!');
    console.log('👀 Puedes verla, editarla o eliminarla desde la interfaz web.');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

createRealProperty();
