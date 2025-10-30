import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixRLSPolicies() {
  console.log('🔧 Corrigiendo políticas RLS para client_credentials...');

  const sql = `
    -- Eliminar políticas problemáticas
    DROP POLICY IF EXISTS "Clients can view their own credentials" ON client_credentials;
    DROP POLICY IF EXISTS "Clients can update their own credentials" ON client_credentials;

    -- Crear nuevas políticas que permitan el login
    -- Política para SELECT: permitir acceso público para login (filtrado por aplicación)
    CREATE POLICY "Allow login access" ON client_credentials
      FOR SELECT USING (true);

    -- Política para UPDATE: solo usuarios autenticados pueden actualizar sus propios datos
    CREATE POLICY "Clients can update their own credentials" ON client_credentials
      FOR UPDATE USING (client_id::text = auth.uid()::text);

    -- Política para INSERT: solo advisors pueden crear credenciales
    CREATE POLICY "Advisors can create credentials" ON client_credentials
      FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'advisor');

    -- Política para DELETE: solo advisors pueden eliminar credenciales
    CREATE POLICY "Advisors can delete credentials" ON client_credentials
      FOR DELETE USING (auth.jwt() ->> 'role' = 'advisor');
  `;

  try {
    const { data, error } = await supabase.rpc('exec', { query: sql });

    if (error) {
      console.log('❌ Error al ejecutar SQL:', error.message);
    } else {
      console.log('✅ Políticas RLS corregidas exitosamente');
    }
  } catch (err) {
    console.log('❌ Error de conexión:', err.message);
  }
}

fixRLSPolicies().catch(console.error);