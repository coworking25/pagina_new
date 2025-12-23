/**
 * SCRIPT DE PRUEBA - SISTEMA DE EMAILS
 * Ejecutar con: npm run test:email
 * O con: tsx test-email.ts
 */

import 'dotenv/config';
import { 
  sendTestEmail,
  sendPaymentReminderEmail,
  sendAppointmentReminderEmail,
  getEmailConfig
} from './src/lib/email';

async function testEmails() {
  console.log('🧪 Iniciando pruebas del sistema de emails...\n');

  // 1. Verificar configuración
  const config = getEmailConfig();
  console.log('📋 Configuración:');
  console.log('  - Configurado:', config.configured ? '✅ Sí' : '❌ No');
  console.log('  - Tiene API Key:', config.hasApiKey ? '✅ Sí' : '❌ No');
  console.log('  - From Email:', config.fromEmail);
  console.log('  - From Name:', config.fromName);
  console.log('');

  if (!config.configured) {
    console.error('❌ ERROR: Sistema no configurado.');
    console.log('Por favor configura RESEND_API_KEY en el archivo .env');
    process.exit(1);
  }

  // 2. Solicitar email de destino
  const testEmail = process.argv[2] || process.env.TEST_EMAIL;
  
  if (!testEmail) {
    console.error('❌ ERROR: Debes proporcionar un email de destino.');
    console.log('\nUso:');
    console.log('  npm run test:email tu-email@example.com');
    console.log('  o');
    console.log('  tsx test-email.ts tu-email@example.com');
    console.log('  o');
    console.log('  Agrega TEST_EMAIL=tu-email@example.com en .env');
    process.exit(1);
  }

  console.log(`📧 Email de destino: ${testEmail}\n`);

  // 3. Test 1: Email básico de prueba
  console.log('📤 Test 1: Enviando email de prueba básico...');
  const test1 = await sendTestEmail(testEmail);
  if (test1.success) {
    console.log(`   ✅ Email enviado exitosamente (ID: ${test1.messageId})`);
  } else {
    console.log(`   ❌ Error: ${test1.error}`);
  }
  console.log('');

  // Delay para evitar rate limit (2 requests/second)
  await new Promise(resolve => setTimeout(resolve, 600));

  // 4. Test 2: Email de recordatorio de pago
  console.log('📤 Test 2: Enviando recordatorio de pago...');
  const test2 = await sendPaymentReminderEmail({
    to: testEmail,
    clientName: 'Juan Pérez',
    amount: 1500000,
    dueDate: '30 de Diciembre, 2025',
    daysUntilDue: 7,
    paymentUrl: 'https://tucoworking.com/cliente/pagos/123'
  });
  if (test2.success) {
    console.log(`   ✅ Email enviado exitosamente (ID: ${test2.messageId})`);
  } else {
    console.log(`   ❌ Error: ${test2.error}`);
  }
  console.log('');

  // Delay para evitar rate limit
  await new Promise(resolve => setTimeout(resolve, 600));

  // 5. Test 3: Email de recordatorio de cita
  console.log('📤 Test 3: Enviando recordatorio de cita...');
  const test3 = await sendAppointmentReminderEmail({
    to: testEmail,
    clientName: 'María González',
    appointmentDate: '24 de Diciembre, 2025',
    appointmentTime: '10:00 AM',
    propertyAddress: 'Oficina 301, Edificio Central, Calle 100',
    advisorName: 'Carlos Rodríguez',
    advisorPhone: '+57 300 123 4567',
    appointmentUrl: 'https://tucoworking.com/cliente/citas/456'
  });
  if (test3.success) {
    console.log(`   ✅ Email enviado exitosamente (ID: ${test3.messageId})`);
  } else {
    console.log(`   ❌ Error: ${test3.error}`);
  }
  console.log('');

  // 6. Resumen
  console.log('📊 Resumen de pruebas:');
  const successCount = [test1, test2, test3].filter(t => t.success).length;
  console.log(`   ✅ Exitosos: ${successCount}/3`);
  console.log(`   ❌ Fallidos: ${3 - successCount}/3`);
  console.log('');

  if (successCount === 3) {
    console.log('🎉 ¡Todos los tests pasaron! El sistema de emails está funcionando correctamente.');
    console.log('');
    console.log('💡 Próximos pasos:');
    console.log('   1. Revisa tu bandeja de entrada (y spam)');
    console.log('   2. Verifica los emails en el Dashboard de Resend');
    console.log('   3. El sistema está listo para producción');
  } else {
    console.log('⚠️  Algunos tests fallaron. Revisa los errores arriba.');
    console.log('');
    console.log('💡 Posibles causas:');
    console.log('   - API Key incorrecta');
    console.log('   - Dominio no verificado en Resend');
    console.log('   - Límite de emails diario alcanzado');
    console.log('   - Conexión a internet');
  }
  console.log('');
}

// Ejecutar tests
testEmails().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
