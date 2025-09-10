// Solución alternativa: Upload vía API Edge Function
// Esta función bypassa las políticas RLS usando el service role

const SUPABASE_URL = 'https://gfczfjpyyyyvteyrvhgt.supabase.co';
// Necesitaremos el SERVICE_ROLE_KEY correcto

export async function uploadImageViaAPI(file: File, propertyCode: string): Promise<string> {
  try {
    console.log(`🚀 Subiendo imagen vía API para ${propertyCode}...`);
    
    // Crear FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('propertyCode', propertyCode);
    
    // Llamar a nuestra API personalizada
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    console.log('✅ Imagen subida exitosamente:', result.url);
    return result.url;
    
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error);
    throw error;
  }
}

// Función para crear la API route en Next.js/Vite
export const imageUploadAPICode = `
// api/upload-image.ts (si usas Next.js)
// o crear en tu backend

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  '${SUPABASE_URL}',
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Variable de entorno
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const propertyCode = formData.get('propertyCode') as string;

    if (!file || !propertyCode) {
      return Response.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    // Generar nombre único
    const fileExt = file.name.split('.').pop();
    const fileName = \`\${Date.now()}.\${fileExt}\`;
    const filePath = \`\${propertyCode}/\${fileName}\`;

    // Subir usando service role (bypassa RLS)
    const { error } = await supabase.storage
      .from('property-images')
      .upload(filePath, file);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Obtener URL pública
    const { data } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);

    return Response.json({ url: data.publicUrl });

  } catch (error) {
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}
`;

console.log('💡 Código para API Route generado. Necesitarás implementar esto en tu backend.');
