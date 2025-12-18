// =====================================================
// WORKER DE ALERTAS AUTOMÁTICAS
// Se ejecuta periódicamente para enviar alertas
// =====================================================

import { processPaymentAlerts } from './lib/paymentAlertsApi';

/**
 * Función principal del worker
 * Se puede ejecutar como:
 * 1. Cron job (cada hora)
 * 2. Vercel Cron (serverless)
 * 3. Manual desde admin
 */
export async function runPaymentAlertsWorker() {
  console.log('🤖 Payment Alerts Worker iniciado:', new Date().toISOString());
  
  try {
    const result = await processPaymentAlerts();
    
    console.log('📊 Resultado del procesamiento:');
    console.log(`   Total de alertas detectadas: ${result.total}`);
    console.log(`   Enviadas exitosamente: ${result.sent}`);
    console.log(`   Fallidas: ${result.failed}`);
    
    return {
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error en worker de alertas:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

// Si se ejecuta directamente con Node
if (require.main === module) {
  runPaymentAlertsWorker()
    .then(result => {
      console.log('\n✅ Worker completado:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Worker falló:', error);
      process.exit(1);
    });
}
