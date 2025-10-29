const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurar cliente de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createNotificationTables() {
  console.log('🚀 Creando tablas del sistema de notificaciones...\n');

  try {
    // 1. Crear tabla notification_preferences
    console.log('📋 Creando tabla notification_preferences...');
    const { error: prefError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS notification_preferences (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          user_type VARCHAR(50) NOT NULL DEFAULT 'client',
          email_enabled BOOLEAN DEFAULT true,
          sms_enabled BOOLEAN DEFAULT false,
          whatsapp_enabled BOOLEAN DEFAULT false,
          push_enabled BOOLEAN DEFAULT true,
          reminder_24h BOOLEAN DEFAULT true,
          reminder_1h BOOLEAN DEFAULT true,
          reminder_15m BOOLEAN DEFAULT false,
          timezone VARCHAR(50) DEFAULT 'America/Bogota',
          quiet_hours_start TIME DEFAULT '22:00',
          quiet_hours_end TIME DEFAULT '08:00',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, user_type)
        );

        -- Políticas RLS
        ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view own preferences" ON notification_preferences
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can update own preferences" ON notification_preferences
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Admins can view all preferences" ON notification_preferences
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
            )
          );
      `
    });

    if (prefError) {
      console.log(`❌ Error creando notification_preferences: ${prefError.message}`);
      console.log('💡 Intenta crear esta tabla manualmente en el Dashboard de Supabase');
    } else {
      console.log('✅ Tabla notification_preferences creada');
    }

    // 2. Crear tabla notifications
    console.log('📬 Creando tabla notifications...');
    const { error: notifError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          type VARCHAR(100) NOT NULL,
          priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
          recipient_id VARCHAR(255) NOT NULL,
          recipient_type VARCHAR(50) DEFAULT 'client',
          recipient_email VARCHAR(255),
          recipient_phone VARCHAR(50),
          message TEXT NOT NULL,
          channels JSONB DEFAULT '["email"]',
          scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          sent_at TIMESTAMP WITH TIME ZONE,
          retry_count INTEGER DEFAULT 0,
          max_retries INTEGER DEFAULT 3,
          error_message TEXT,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Índices
        CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
        CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at);
        CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, recipient_type);
        CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

        -- Políticas RLS
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view own notifications" ON notifications
          FOR SELECT USING (auth.uid()::text = recipient_id OR recipient_type = 'admin');

        CREATE POLICY "Admins can manage all notifications" ON notifications
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
            )
          );
      `
    });

    if (notifError) {
      console.log(`❌ Error creando notifications: ${notifError.message}`);
      console.log('💡 Intenta crear esta tabla manualmente en el Dashboard de Supabase');
    } else {
      console.log('✅ Tabla notifications creada');
    }

    // 3. Crear tabla notification_logs
    console.log('📝 Creando tabla notification_logs...');
    const { error: logError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS notification_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
          channel VARCHAR(50) NOT NULL,
          status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed', 'delivered', 'read')),
          provider_response JSONB,
          error_message TEXT,
          sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Índices
        CREATE INDEX IF NOT EXISTS idx_notification_logs_notification_id ON notification_logs(notification_id);
        CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);

        -- Políticas RLS
        ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Admins can view all logs" ON notification_logs
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
            )
          );
      `
    });

    if (logError) {
      console.log(`❌ Error creando notification_logs: ${logError.message}`);
      console.log('💡 Intenta crear esta tabla manualmente en el Dashboard de Supabase');
    } else {
      console.log('✅ Tabla notification_logs creada');
    }

    // 4. Crear tabla reminder_rules
    console.log('⏰ Creando tabla reminder_rules...');
    const { error: rulesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS reminder_rules (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('appointment_reminder', 'payment_reminder', 'contract_reminder', 'system_alert')),
          trigger_event VARCHAR(100) NOT NULL,
          timing_minutes INTEGER NOT NULL,
          is_active BOOLEAN DEFAULT true,
          message_template TEXT NOT NULL,
          channels JSONB DEFAULT '["email"]',
          conditions JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Políticas RLS
        ALTER TABLE reminder_rules ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Admins can manage reminder rules" ON reminder_rules
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
            )
          );
      `
    });

    if (rulesError) {
      console.log(`❌ Error creando reminder_rules: ${rulesError.message}`);
      console.log('💡 Intenta crear esta tabla manualmente en el Dashboard de Supabase');
    } else {
      console.log('✅ Tabla reminder_rules creada');
    }

    // 5. Crear tabla scheduled_tasks
    console.log('📅 Creando tabla scheduled_tasks...');
    const { error: tasksError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS scheduled_tasks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          task_type VARCHAR(100) NOT NULL,
          reference_id VARCHAR(255),
          scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
          priority INTEGER DEFAULT 1,
          payload JSONB DEFAULT '{}',
          retry_count INTEGER DEFAULT 0,
          max_retries INTEGER DEFAULT 3,
          error_message TEXT,
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Índices
        CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON scheduled_tasks(status);
        CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_scheduled_at ON scheduled_tasks(scheduled_at);
        CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_type ON scheduled_tasks(task_type);

        -- Políticas RLS
        ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Admins can manage scheduled tasks" ON scheduled_tasks
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
            )
          );
      `
    });

    if (tasksError) {
      console.log(`❌ Error creando scheduled_tasks: ${tasksError.message}`);
      console.log('💡 Intenta crear esta tabla manualmente en el Dashboard de Supabase');
    } else {
      console.log('✅ Tabla scheduled_tasks creada');
    }

    // 6. Insertar reglas de recordatorios por defecto
    console.log('📝 Insertando reglas de recordatorios por defecto...');
    const defaultRules = [
      {
        name: 'Recordatorio 24 horas antes',
        type: 'appointment_reminder',
        trigger_event: 'appointment_created',
        timing_minutes: 1440, // 24 horas
        is_active: true,
        message_template: 'Recordatorio: Tienes una cita programada para mañana a las {appointment_time}. Propiedad: {property_title}',
        channels: ['email', 'push'],
        conditions: { status: 'confirmed' }
      },
      {
        name: 'Recordatorio 1 hora antes',
        type: 'appointment_reminder',
        trigger_event: 'appointment_created',
        timing_minutes: 60,
        is_active: true,
        message_template: 'Recordatorio: Tu cita está programada para dentro de 1 hora. Dirección: {property_address}',
        channels: ['email', 'sms', 'push'],
        conditions: { status: 'confirmed' }
      },
      {
        name: 'Recordatorio 15 minutos antes',
        type: 'appointment_reminder',
        trigger_event: 'appointment_created',
        timing_minutes: 15,
        is_active: false, // Desactivado por defecto
        message_template: 'Tu cita comienza en 15 minutos. Te esperamos en {property_address}',
        channels: ['sms', 'push'],
        conditions: { status: 'confirmed' }
      },
      {
        name: 'Recordatorio de pago pendiente',
        type: 'payment_reminder',
        trigger_event: 'contract_created',
        timing_minutes: 2880, // 48 horas
        is_active: true,
        message_template: 'Recordatorio: Tienes un pago pendiente por el contrato de {property_title}. Monto: ${contract_amount}',
        channels: ['email', 'whatsapp'],
        conditions: { payment_status: 'pending' }
      }
    ];

    for (const rule of defaultRules) {
      const { error: insertError } = await supabase
        .from('reminder_rules')
        .upsert(rule, { onConflict: 'name' });

      if (insertError) {
        console.log(`❌ Error insertando regla "${rule.name}": ${insertError.message}`);
      } else {
        console.log(`✅ Regla "${rule.name}" insertada`);
      }
    }

    // 7. Crear función get_notification_stats
    console.log('⚡ Creando función get_notification_stats...');
    const { error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION get_notification_stats()
        RETURNS JSON AS $$
        BEGIN
          RETURN json_build_object(
            'total_notifications', (SELECT COUNT(*) FROM notifications),
            'pending_notifications', (SELECT COUNT(*) FROM notifications WHERE status = 'pending'),
            'sent_today', (SELECT COUNT(*) FROM notifications WHERE DATE(sent_at) = CURRENT_DATE),
            'failed_last_24h', (SELECT COUNT(*) FROM notifications WHERE status = 'failed' AND created_at > NOW() - INTERVAL '24 hours'),
            'active_reminder_rules', (SELECT COUNT(*) FROM reminder_rules WHERE is_active = true)
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (funcError) {
      console.log(`❌ Error creando función get_notification_stats: ${funcError.message}`);
    } else {
      console.log('✅ Función get_notification_stats creada');
    }

    console.log('\n🎉 ¡Migración completada!');
    console.log('\n💡 RECOMENDACIONES:');
    console.log('1. Ejecuta el script de verificación para confirmar que todo funciona');
    console.log('2. Configura las variables de entorno para proveedores externos');
    console.log('3. Prueba el sistema creando una cita de prueba');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
createNotificationTables().catch(error => {
  console.error('❌ Error fatal durante la migración:', error);
  process.exit(1);
});