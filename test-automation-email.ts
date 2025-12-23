/**
 * TEST: Integración Automatización + Emails
 * 
 * Prueba el sistema de envío de emails desde las reglas de automatización
 */

import 'dotenv/config';
import { processAutomationEmailQueue } from './src/lib/automation-email-integration';

async function testAutomationEmailIntegration() {
  console.log('🧪 Iniciando prueba de integración Automatización + Emails\n');
  console.log('='.repeat(60));

  try {
    // Procesar cola de emails pendientes
    await processAutomationEmailQueue();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Prueba completada');
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Revisa tu bandeja de entrada');
    console.log('   2. Verifica los logs en la base de datos:');
    console.log('      SELECT * FROM automation_logs WHERE email_sent = true;');
    console.log('   3. Revisa el Dashboard de Resend:');
    console.log('      https://resend.com/emails');

  } catch (error: any) {
    console.error('\n❌ Error en la prueba:', error.message);
    console.error(error);
  }
}

// Ejecutar prueba
testAutomationEmailIntegration();
