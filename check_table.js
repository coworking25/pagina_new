import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gfczfjpyyyyvteyrvhgt.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzA0NjIsImV4cCI6MjA3MTkwNjQ2Mn0.ngCP1rv5jLYnJlNnuEtshyHsa1FILqBq89bcjv9pshY'
);

async function checkTable() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Error:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Columnas disponibles en properties:');
      console.log(Object.keys(data[0]));
    } else {
      console.log('No hay datos en la tabla properties - intentando obtener estructura...');
      
      // Intentar obtener estructura vacía
      const { data: emptyData, error: emptyError } = await supabase
        .from('properties')
        .select('*')
        .limit(0);
        
      console.log('Error al obtener estructura:', emptyError);
    }
  } catch (err) {
    console.log('Error de conexión:', err);
  }
}

checkTable();
