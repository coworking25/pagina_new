// Script para configurar el bucket de Storage en Supabase automáticamente
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rcohcrwdexgywhmogzbe.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjb2hjcndkZXhneXdobW9nemJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzM5MTE1OCwiZXhwIjoyMDQyOTY3MTU4fQ.KzJjg8u3Qf4lCY8rrjRPEzFkzS_WOKQOPdOvSRjfZkY';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorageBucket() {
  console.log('🚀 Iniciando configuración del bucket de Storage...\n');

  try {
    // PASO 1: Verificar si el bucket ya existe
    console.log('📦 Paso 1: Verificando buckets existentes...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listando buckets:', listError.message);
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'client-documents');

    if (bucketExists) {
      console.log('✅ El bucket "client-documents" ya existe');
    } else {
      // PASO 2: Crear el bucket
      console.log('📦 Paso 2: Creando bucket "client-documents"...');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('client-documents', {
        public: false, // Privado
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/pdf'
        ]
      });

      if (createError) {
        console.error('❌ Error creando bucket:', createError.message);
        return;
      }

      console.log('✅ Bucket "client-documents" creado exitosamente');
    }

    // PASO 3: Configurar políticas RLS mediante SQL
    console.log('\n🔐 Paso 3: Configurando políticas de seguridad...');
    
    const sqlPolicies = `
      -- Eliminar política si ya existe
      DROP POLICY IF EXISTS "Service role full access to client documents" ON storage.objects;
      
      -- Crear política para service_role
      CREATE POLICY "Service role full access to client documents"
      ON storage.objects
      FOR ALL
      TO service_role
      USING (bucket_id = 'client-documents')
      WITH CHECK (bucket_id = 'client-documents');
    `;

    const { error: policyError } = await supabase.rpc('exec_sql', { 
      sql: sqlPolicies 
    }).catch(() => {
      // Si la función exec_sql no existe, intentar con query directo
      return supabase.from('_').select('*').limit(0);
    });

    if (policyError) {
      console.log('⚠️ No se pudieron crear las políticas automáticamente');
      console.log('   Por favor, ejecuta el archivo "setup_storage_bucket_policies.sql" en Supabase SQL Editor');
    } else {
      console.log('✅ Políticas de seguridad configuradas');
    }

    // PASO 4: Verificar configuración
    console.log('\n✅ Paso 4: Verificando configuración final...');
    const { data: finalBuckets } = await supabase.storage.listBuckets();
    const clientBucket = finalBuckets?.find(b => b.name === 'client-documents');

    if (clientBucket) {
      console.log('\n📊 CONFIGURACIÓN DEL BUCKET:');
      console.log('   ID:', clientBucket.id);
      console.log('   Nombre:', clientBucket.name);
      console.log('   Público:', clientBucket.public ? 'Sí' : 'No (Privado) ✓');
      console.log('   Límite de tamaño:', clientBucket.file_size_limit ? `${(clientBucket.file_size_limit / 1024 / 1024).toFixed(2)} MB` : 'No especificado');
      console.log('   Tipos permitidos:', clientBucket.allowed_mime_types || 'Todos');
      console.log('   Creado:', new Date(clientBucket.created_at).toLocaleString());
    }

    // PASO 5: Probar subida de archivo
    console.log('\n🧪 Paso 5: Probando subida de archivo...');
    const testFileName = 'test/test_file.txt';
    const testContent = 'Este es un archivo de prueba para verificar que el bucket funciona correctamente.';
    
    const { error: uploadError } = await supabase.storage
      .from('client-documents')
      .upload(testFileName, new Blob([testContent], { type: 'text/plain' }), {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.log('⚠️ Error en prueba de subida:', uploadError.message);
      console.log('   Esto puede deberse a que las políticas RLS no están configuradas correctamente');
      console.log('   Ejecuta el archivo "setup_storage_bucket_policies.sql" en Supabase SQL Editor');
    } else {
      console.log('✅ Prueba de subida exitosa');
      
      // Eliminar archivo de prueba
      await supabase.storage.from('client-documents').remove([testFileName]);
      console.log('✅ Archivo de prueba eliminado');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ CONFIGURACIÓN COMPLETADA');
    console.log('='.repeat(70));
    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('   1. Si viste advertencias sobre políticas, ejecuta:');
    console.log('      setup_storage_bucket_policies.sql en Supabase SQL Editor');
    console.log('   2. El bucket está listo para usar en la aplicación');
    console.log('   3. Las funciones en clientsApi.ts ya están configuradas');
    console.log('\n🎉 ¡Puedes empezar a subir documentos de clientes!\n');

  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error);
    console.log('\n💡 SOLUCIÓN ALTERNATIVA:');
    console.log('   1. Ve a Supabase Dashboard → Storage');
    console.log('   2. Clic en "New Bucket"');
    console.log('   3. Nombre: client-documents');
    console.log('   4. Public: No (desmarcar)');
    console.log('   5. File size limit: 5 MB');
    console.log('   6. Allowed MIME types: image/jpeg, image/png, application/pdf');
    console.log('   7. Clic en "Save"');
    console.log('   8. Ejecuta setup_storage_bucket_policies.sql en SQL Editor\n');
  }
}

setupStorageBucket();
