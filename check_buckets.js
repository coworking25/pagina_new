import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gfczfjpyyyyvteyrvhgt.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzA0NjIsImV4cCI6MjA3MTkwNjQ2Mn0.ngCP1rv5jLYnJlNnuEtshyHsa1FILqBq89bcjv9pshY'
);

async function checkBuckets() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('Error obteniendo buckets:', error);
      return;
    }
    
    console.log('Buckets disponibles:');
    data.forEach(bucket => {
      console.log(`- ${bucket.name} (público: ${bucket.public})`);
    });
    
  } catch (err) {
    console.log('Error de conexión:', err);
  }
}

checkBuckets();
