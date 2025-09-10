import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  'https://gfczfjpyyyyvteyrvhgt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY3pmanB5eXl5dnRleXJ2aGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMDQ2MiwiZXhwIjoyMDcxOTA2NDYyfQ.WAInZ2JCFaFZtz-wY2pkVpvBPKAfLmjJNB31ZZSR3Jc'
);

async function createMissingTables() {
  try {
    console.log('📊 Creando tablas de estadísticas faltantes...');
    
    // Leer el archivo SQL
    const sqlContent = readFileSync('./sql/12_create_property_stats_system.sql', 'utf8');
    
    // Ejecutar el SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error ejecutando SQL:', error);
      
      // Intentar crear las tablas una por una
      console.log('🔧 Intentando crear tablas individualmente...');
      
      // Crear property_stats
      const { error: error1 } = await supabase
        .from('property_stats')
        .select('id')
        .limit(1);
        
      if (error1 && error1.code === 'PGRST204') {
        console.log('📋 Creando tabla property_stats...');
        const createStats = `
          CREATE TABLE IF NOT EXISTS property_stats (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
            views INTEGER DEFAULT 0,
            inquiries INTEGER DEFAULT 0,
            appointments INTEGER DEFAULT 0,
            last_viewed TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(property_id)
          );
        `;
        await supabase.rpc('exec_sql', { sql: createStats });
      }
      
      // Crear property_activity
      const { error: error2 } = await supabase
        .from('property_activity')
        .select('id')
        .limit(1);
        
      if (error2 && error2.code === 'PGRST204') {
        console.log('📋 Creando tabla property_activity...');
        const createActivity = `
          CREATE TABLE IF NOT EXISTS property_activity (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
            activity_type VARCHAR(50) NOT NULL,
            user_info JSONB,
            details JSONB,
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        await supabase.rpc('exec_sql', { sql: createActivity });
      }
      
    } else {
      console.log('✅ SQL ejecutado exitosamente');
    }
    
    // Verificar que las tablas existen ahora
    console.log('🔍 Verificando tablas creadas...');
    
    const { data: statsTest, error: statsError } = await supabase
      .from('property_stats')
      .select('id')
      .limit(1);
      
    const { data: activityTest, error: activityError } = await supabase
      .from('property_activity')
      .select('id')
      .limit(1);
      
    if (!statsError) {
      console.log('✅ Tabla property_stats existe');
    } else {
      console.log('❌ Tabla property_stats no existe:', statsError.message);
    }
    
    if (!activityError) {
      console.log('✅ Tabla property_activity existe');
    } else {
      console.log('❌ Tabla property_activity no existe:', activityError.message);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

createMissingTables();
