import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gfczfjpyyyyvteyrvhgt.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzA0NjIsImV4cCI6MjA3MTkwNjQ2Mn0.ngCP1rv5jLYnJlNnuEtshyHsa1FILqBq89bcjv9pshY'
);

async function testUpdate() {
  try {
    console.log('Probando actualización de propiedad...');
    
    // Primero obtener una propiedad existente
    const { data: properties, error: getError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);
    
    if (getError) {
      console.log('Error obteniendo propiedades:', getError);
      return;
    }
    
    if (!properties || properties.length === 0) {
      console.log('No hay propiedades para probar');
      return;
    }
    
    const propertyId = properties[0].id;
    console.log('Probando con propiedad ID:', propertyId);
    
    // Datos de prueba seguros (solo campos que existen)
    const updateData = {
      title: 'Título actualizado - Prueba',
      description: 'Descripción actualizada desde prueba'
    };
    
    console.log('Actualizando con datos:', updateData);
    
    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .select()
      .single();
    
    if (error) {
      console.log('❌ Error en actualización:', error);
    } else {
      console.log('✅ Actualización exitosa:', data);
    }
    
  } catch (err) {
    console.log('Error general:', err);
  }
}

testUpdate();
