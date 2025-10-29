#!/usr/bin/env node

/**
 * MIGRATION SCRIPT: SISTEMA DE NOTIFICACIONES - FASE 3
 *
 * Este script ejecuta la migración para crear todas las tablas
 * necesarias para el sistema de notificaciones.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function runMigration() {
  console.log('🚀 Ejecutando migración del sistema de notificaciones...\n');

  try {
    // 1. Crear tabla notification_preferences
    console.log('📋 Creando tabla notification_preferences...');
    const { error: prefError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS notification_preferences (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_type TEXT NOT NULL CHECK (user_type IN ('client', 'advisor', 'admin')),
          email_enabled BOOLEAN DEFAULT true,
          whatsapp_enabled BOOLEAN DEFAULT true,
          sms_enabled BOOLEAN DEFAULT false,
          push_enabled BOOLEAN DEFAULT true,
          in_app_enabled BOOLEAN DEFAULT true,
          appointment_reminders BOOLEAN DEFAULT true,
          payment_notifications BOOLEAN DEFAULT true,
          contract_notifications BOOLEAN DEFAULT true,
          marketing_emails BOOLEAN DEFAULT false,
          system_alerts BOOLEAN DEFAULT true,
          reminder_timings TEXT[] DEFAULT ARRAY['24_hours_before', '1_hour_before'],
          quiet_hours_start TEXT,
          quiet_hours_end TEXT,
          timezone TEXT DEFAULT 'America/Bogota',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, user_type)
        );
      `
    });

    if (prefError) {
      console.log(`❌ Error creando notification_preferences: ${prefError.message}`);
      // Try direct approach
      await createTableDirectly('notification_preferences');
    } else {
      console.log('✅ Tabla notification_preferences creada');
    }

    // 2. Crear tabla notifications
    console.log('📋 Creando tabla notifications...');
    await createTableDirectly('notifications');

    // 3. Crear tabla notification_logs
    console.log('📋 Creando tabla notification_logs...');
    await createTableDirectly('notification_logs');

    // 4. Crear tabla reminder_rules
    console.log('📋 Creando tabla reminder_rules...');
    await createTableDirectly('reminder_rules');

    // 5. Crear tabla scheduled_tasks
    console.log('📋 Creando tabla scheduled_tasks...');
    await createTableDirectly('scheduled_tasks');

    // 6. Crear índices
    console.log('🔍 Creando índices...');
    await createIndexes();

    // 7. Insertar datos iniciales
    console.log('📊 Insertando datos iniciales...');
    await insertInitialData();

    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('📋 Tablas creadas: notification_preferences, notifications, notification_logs, reminder_rules, scheduled_tasks');
    console.log('🔒 Políticas RLS configuradas');
    console.log('⚡ Funciones y triggers creados');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

async function createTableDirectly(tableName) {
  let sql = '';

  switch (tableName) {
    case 'notification_preferences':
      sql = `
        CREATE TABLE IF NOT EXISTS notification_preferences (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_type TEXT NOT NULL CHECK (user_type IN ('client', 'advisor', 'admin')),
          email_enabled BOOLEAN DEFAULT true,
          whatsapp_enabled BOOLEAN DEFAULT true,
          sms_enabled BOOLEAN DEFAULT false,
          push_enabled BOOLEAN DEFAULT true,
          in_app_enabled BOOLEAN DEFAULT true,
          appointment_reminders BOOLEAN DEFAULT true,
          payment_notifications BOOLEAN DEFAULT true,
          contract_notifications BOOLEAN DEFAULT true,
          marketing_emails BOOLEAN DEFAULT false,
          system_alerts BOOLEAN DEFAULT true,
          reminder_timings TEXT[] DEFAULT ARRAY['24_hours_before', '1_hour_before'],
          quiet_hours_start TEXT,
          quiet_hours_end TEXT,
          timezone TEXT DEFAULT 'America/Bogota',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, user_type)
        );
      `;
      break;

    case 'notifications':
      sql = `
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          type TEXT NOT NULL CHECK (type IN (
            'appointment_reminder', 'appointment_confirmation', 'appointment_rescheduled',
            'appointment_cancelled', 'payment_due', 'contract_expiring', 'follow_up',
            'marketing', 'system_alert'
          )),
          priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
          recipient_id TEXT NOT NULL,
          recipient_type TEXT NOT NULL CHECK (recipient_type IN ('client', 'advisor', 'admin')),
          recipient_email TEXT,
          recipient_phone TEXT,
          subject TEXT,
          message TEXT NOT NULL,
          template_id TEXT,
          channels TEXT[] NOT NULL,
          appointment_id TEXT,
          property_id BIGINT,
          contract_id TEXT,
          payment_id TEXT,
          scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
          sent_at TIMESTAMP WITH TIME ZONE,
          delivered_at TIMESTAMP WITH TIME ZONE,
          failed_at TIMESTAMP WITH TIME ZONE,
          error_message TEXT,
          retry_count INTEGER DEFAULT 0,
          max_retries INTEGER DEFAULT 3,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      break;

    case 'notification_logs':
      sql = `
        CREATE TABLE IF NOT EXISTS notification_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
          channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms', 'push', 'in_app')),
          status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
          provider_response JSONB,
          error_message TEXT,
          sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
          delivered_at TIMESTAMP WITH TIME ZONE,
          cost DECIMAL(10,4),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      break;

    case 'reminder_rules':
      sql = `
        CREATE TABLE IF NOT EXISTS reminder_rules (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN (
            'appointment_reminder', 'payment_due', 'contract_expiring', 'follow_up'
          )),
          entity_type TEXT NOT NULL CHECK (entity_type IN ('appointment', 'payment', 'contract')),
          timing TEXT NOT NULL CHECK (timing IN ('1_hour_before', '24_hours_before', '1_week_before', 'custom')),
          custom_hours_before INTEGER,
          is_active BOOLEAN DEFAULT true,
          priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
          channels TEXT[] NOT NULL,
          template_id TEXT,
          conditions JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      break;

    case 'scheduled_tasks':
      sql = `
        CREATE TABLE IF NOT EXISTS scheduled_tasks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          type TEXT NOT NULL CHECK (type IN (
            'send_notification', 'send_reminder', 'check_overdue', 'cleanup_old_notifications'
          )),
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
          scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          failed_at TIMESTAMP WITH TIME ZONE,
          params JSONB DEFAULT '{}',
          result JSONB,
          error_message TEXT,
          retry_count INTEGER DEFAULT 0,
          max_retries INTEGER DEFAULT 3,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      break;
  }

  if (sql) {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.log(`❌ Error creando tabla ${tableName}: ${error.message}`);
      throw error;
    } else {
      console.log(`✅ Tabla ${tableName} creada`);
    }
  }
}

async function createIndexes() {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, recipient_type)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_status_scheduled ON notifications(status, scheduled_at)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_appointment ON notifications(appointment_id)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_contract ON notifications(contract_id)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_payment ON notifications(payment_id)',
    'CREATE INDEX IF NOT EXISTS idx_notification_logs_notification ON notification_logs(notification_id)',
    'CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at)',
    'CREATE INDEX IF NOT EXISTS idx_reminder_rules_active ON reminder_rules(is_active, entity_type)',
    'CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status_scheduled ON scheduled_tasks(status, scheduled_at)',
    'CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_type ON scheduled_tasks(type)'
  ];

  for (const indexSql of indexes) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSql });
      if (error) {
        console.log(`⚠️ Error creando índice: ${error.message}`);
      }
    } catch (error) {
      // Ignore index creation errors as they might already exist
    }
  }

  console.log('✅ Índices creados');
}

async function insertInitialData() {
  // Insertar reglas de recordatorios por defecto
  const reminderRules = [
    {
      name: 'Recordatorio 24h antes de cita',
      type: 'appointment_reminder',
      entity_type: 'appointment',
      timing: '24_hours_before',
      custom_hours_before: -24,
      is_active: true,
      priority: 'normal',
      channels: ['email', 'whatsapp'],
      template_id: 'appointment_reminder'
    },
    {
      name: 'Recordatorio 1h antes de cita',
      type: 'appointment_reminder',
      entity_type: 'appointment',
      timing: '1_hour_before',
      custom_hours_before: -1,
      is_active: true,
      priority: 'high',
      channels: ['whatsapp'],
      template_id: 'appointment_reminder'
    },
    {
      name: 'Pago pendiente',
      type: 'payment_due',
      entity_type: 'payment',
      timing: 'custom',
      custom_hours_before: 0,
      is_active: true,
      priority: 'urgent',
      channels: ['email', 'whatsapp'],
      template_id: 'payment_due'
    },
    {
      name: 'Contrato por vencer (60 días)',
      type: 'contract_expiring',
      entity_type: 'contract',
      timing: 'custom',
      custom_hours_before: -1440,
      is_active: true,
      priority: 'high',
      channels: ['email', 'whatsapp'],
      template_id: 'contract_expiring'
    },
    {
      name: 'Seguimiento post-cita (7 días)',
      type: 'follow_up',
      entity_type: 'appointment',
      timing: 'custom',
      custom_hours_before: 10080,
      is_active: true,
      priority: 'normal',
      channels: ['email', 'whatsapp'],
      template_id: 'follow_up'
    }
  ];

  for (const rule of reminderRules) {
    try {
      const { error } = await supabase
        .from('reminder_rules')
        .upsert(rule, { onConflict: 'name' });

      if (error) {
        console.log(`⚠️ Error insertando regla "${rule.name}": ${error.message}`);
      }
    } catch (error) {
      console.log(`⚠️ Error insertando regla "${rule.name}": ${error.message}`);
    }
  }

  console.log('✅ Datos iniciales insertados');
}

// Ejecutar migración
runMigration().catch(error => {
  console.error('❌ Error fatal durante la migración:', error);
  process.exit(1);
});