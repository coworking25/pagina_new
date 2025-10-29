#!/usr/bin/env node

/**
 * VERIFICATION SCRIPT: SISTEMA DE NOTIFICACIONES - FASE 3
 *
 * Este script verifica que el sistema de notificaciones esté correctamente
 * configurado y funcional.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function verifyNotificationSystem() {
  console.log('🔍 Verificando sistema de notificaciones...\n');

  let allChecksPass = true;

  // 1. Verificar tablas (intentar operaciones básicas)
  console.log('📋 Verificando tablas...');
  const tables = [
    'notification_preferences',
    'notifications',
    'notification_logs',
    'reminder_rules',
    'scheduled_tasks'
  ];

  for (const table of tables) {
    try {
      // Intentar una operación de selección simple
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.log(`❌ Tabla ${table}: ERROR - ${error.message}`);
        console.log(`   💡 Posible solución: Crear la tabla manualmente en Supabase Dashboard`);
        allChecksPass = false;
      } else {
        console.log(`✅ Tabla ${table}: OK`);
      }
    } catch (error) {
      console.log(`❌ Tabla ${table}: ERROR - ${error.message}`);
      console.log(`   💡 Posible solución: Crear la tabla manualmente en Supabase Dashboard`);
      allChecksPass = false;
    }
  }

  // 2. Verificar datos iniciales
  console.log('\n📊 Verificando datos iniciales...');

  try {
    const { data: rules, error } = await supabase
      .from('reminder_rules')
      .select('name, type, is_active')
      .eq('is_active', true);

    if (error) {
      console.log(`❌ Reglas de recordatorios: ERROR - ${error.message}`);
      allChecksPass = false;
    } else if (!rules || rules.length === 0) {
      console.log('❌ Reglas de recordatorios: No hay reglas activas');
      allChecksPass = false;
    } else {
      console.log(`✅ Reglas de recordatorios: ${rules.length} reglas activas`);
      rules.forEach(rule => {
        console.log(`   - ${rule.name} (${rule.type})`);
      });
    }
  } catch (error) {
    console.log(`❌ Reglas de recordatorios: ERROR - ${error.message}`);
    allChecksPass = false;
  }

  // 3. Verificar configuración de proveedores
  console.log('\n⚙️ Verificando configuración de proveedores...');

  const providers = {
    'SendGrid': process.env.SENDGRID_API_KEY,
    'Twilio Account SID': process.env.TWILIO_ACCOUNT_SID,
    'Twilio Auth Token': process.env.TWILIO_AUTH_TOKEN,
    'Twilio Phone Number': process.env.TWILIO_PHONE_NUMBER,
    'Firebase Server Key': process.env.FIREBASE_SERVER_KEY
  };

  let configuredProviders = 0;
  for (const [name, value] of Object.entries(providers)) {
    if (value) {
      console.log(`✅ ${name}: Configurado`);
      configuredProviders++;
    } else {
      console.log(`⚠️ ${name}: No configurado`);
    }
  }

  if (configuredProviders === 0) {
    console.log('⚠️ Advertencia: No hay proveedores externos configurados. Solo funcionarán notificaciones in-app.');
  }

  // 4. Verificar permisos RLS
  console.log('\n🔒 Verificando permisos RLS...');

  try {
    // Intentar consultar con usuario anónimo (debería fallar para datos sensibles)
    const { error } = await supabase
      .from('reminder_rules')
      .select('*')
      .limit(1);

    if (error && error.code === 'PGRST301') { // RLS bloqueando acceso
      console.log('✅ Políticas RLS: OK (bloqueando acceso no autorizado)');
    } else {
      console.log('⚠️ Políticas RLS: Verificar configuración de seguridad');
    }
  } catch (error) {
    console.log('⚠️ Políticas RLS: Error al verificar');
  }

  // 5. Verificar funciones
  console.log('\n⚡ Verificando funciones...');

  try {
    const { data, error } = await supabase.rpc('get_notification_stats');

    if (error) {
      console.log(`❌ Función get_notification_stats: ERROR - ${error.message}`);
      allChecksPass = false;
    } else {
      console.log('✅ Función get_notification_stats: OK');
    }
  } catch (error) {
    console.log(`❌ Función get_notification_stats: ERROR - ${error.message}`);
    allChecksPass = false;
  }

  // 6. Probar creación de notificación de prueba
  console.log('\n🧪 Probando creación de notificación...');

  try {
    const testNotification = {
      type: 'system_alert',
      priority: 'normal',
      status: 'pending',
      recipient_id: 'test_user',
      recipient_type: 'admin',
      recipient_email: 'test@example.com',
      message: 'Notificación de prueba del sistema de verificación',
      channels: ['email'],
      scheduled_at: new Date().toISOString(),
      retry_count: 0,
      max_retries: 3,
      metadata: { test: true }
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(testNotification)
      .select()
      .single();

    if (error) {
      console.log(`❌ Creación de notificación: ERROR - ${error.message}`);
      allChecksPass = false;
    } else {
      console.log('✅ Creación de notificación: OK');

      // Limpiar notificación de prueba
      await supabase
        .from('notifications')
        .delete()
        .eq('id', data.id);
    }
  } catch (error) {
    console.log(`❌ Creación de notificación: ERROR - ${error.message}`);
    allChecksPass = false;
  }

  // 7. Verificar integración con citas
  console.log('\n📅 Verificando integración con citas...');

  try {
    // Verificar que existe tabla de appointments
    const { error } = await supabase
      .from('appointments')
      .select('count')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      console.log(`❌ Tabla appointments: ERROR - ${error.message}`);
      console.log('   Asegúrate de que la tabla de citas esté creada');
    } else {
      console.log('✅ Tabla appointments: OK');
    }
  } catch (error) {
    console.log(`❌ Tabla appointments: ERROR - ${error.message}`);
  }

  // Resultado final
  console.log('\n' + '='.repeat(50));
  if (allChecksPass) {
    console.log('🎉 ¡Sistema de notificaciones verificado exitosamente!');
    console.log('\n✅ Todas las verificaciones pasaron correctamente.');
    console.log('🚀 El sistema está listo para usar.');
  } else {
    console.log('⚠️ Algunas verificaciones fallaron.');
    console.log('🔧 Revisa los errores arriba y configura lo necesario.');
  }
  console.log('='.repeat(50));

  // Recomendaciones
  console.log('\n💡 RECOMENDACIONES:');
  console.log('1. Configura las variables de entorno para proveedores externos');
  console.log('2. Ejecuta el scheduler regularmente para procesar notificaciones');
  console.log('3. Monitorea las estadísticas de envío en el dashboard');
  console.log('4. Configura las preferencias de notificación de los usuarios');
  console.log('5. Prueba el sistema con notificaciones reales');

  process.exit(allChecksPass ? 0 : 1);
}

// Ejecutar verificación
verifyNotificationSystem().catch(error => {
  console.error('❌ Error fatal durante la verificación:', error);
  process.exit(1);
});