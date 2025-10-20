// Script para verificar y crear el bucket de documentos del cliente en Supabase Storage
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rcohcrwdexgywhmogzbe.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjb2hjcndkZXhneXdobW9nemJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzM5MTE1OCwiZXhwIjoyMDQyOTY3MTU4fQ.KzJjg8u3Qf4lCY8rrjRPEzFkzS_WOKQOPdOvSRjfZkY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupClientDocumentsBucket() {
  try {
    console.log('🔍 Verificando bucket client-documents...');

    // Verificar si el bucket ya existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listando buckets:', listError);
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'client-documents');

    if (bucketExists) {
      console.log('✅ El bucket client-documents ya existe');
      return;
    }

    // Crear el bucket
    console.log('📦 Creando bucket client-documents...');
    const { data: newBucket, error: createError } = await supabase.storage.createBucket('client-documents', {
      public: false, // Privado por seguridad
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf'
      ]
    });

    if (createError) {
      console.error('❌ Error creando bucket:', createError);
      return;
    }

    console.log('✅ Bucket client-documents creado exitosamente:', newBucket);

    // Configurar políticas de acceso (RLS)
    console.log('🔐 Configurando políticas de seguridad...');
    
    // Nota: Las políticas se deben configurar desde el dashboard de Supabase o SQL
    // Storage > client-documents > Policies
    console.log('⚠️ Recuerda configurar las políticas de Storage en Supabase Dashboard:');
    console.log('   1. Ir a Storage > client-documents > Policies');
    console.log('   2. Agregar política para service_role (INSERT, SELECT, DELETE)');
    console.log('   3. Agregar política para usuarios autenticados si es necesario');

  } catch (error) {
    console.error('❌ Error en setupClientDocumentsBucket:', error);
  }
}

setupClientDocumentsBucket();
