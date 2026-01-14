// =====================================================
// SERVICIO: Generación Automática de Alertas de Pagos
// Fecha: 2026-01-14
// Descripción: Genera alertas cuando los pagos están vencidos
// =====================================================

import { supabase } from './supabase';

export interface PaymentAlert {
  client_id: string;
  payment_id: string;
  due_date: string;
  days_overdue: number;
  amount: number;
  payment_concept: string;
}

/**
 * Obtener pagos vencidos que necesitan alerta
 */
export async function getOverduePaymentsForAlerts(): Promise<PaymentAlert[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('payment_schedules')
      .select('id, client_id, due_date, amount, payment_concept, status')
      .in('status', ['pending', 'partial'])
      .lt('due_date', today);

    if (error) throw error;

    return data.map(payment => {
      const dueDate = new Date(payment.due_date);
      const nowDate = new Date();
      nowDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((nowDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        client_id: payment.client_id,
        payment_id: payment.id,
        due_date: payment.due_date,
        days_overdue: diffDays,
        amount: parseFloat(payment.amount),
        payment_concept: payment.payment_concept
      };
    });
  } catch (error) {
    console.error('❌ Error obteniendo pagos vencidos:', error);
    return [];
  }
}

/**
 * Crear alerta de pago vencido en client_alerts
 */
export async function createPaymentOverdueAlert(alert: PaymentAlert): Promise<boolean> {
  try {
    // Verificar si ya existe una alerta para este pago
    const { data: existing } = await supabase
      .from('client_alerts')
      .select('id')
      .eq('client_id', alert.client_id)
      .eq('alert_type', 'payment_overdue')
      .eq('is_read', false)
      .ilike('message', `%${alert.payment_concept}%`)
      .single();

    if (existing) {
      console.log(`ℹ️ Alerta ya existe para pago ${alert.payment_id}`);
      return false; // Ya existe
    }

    // Crear nueva alerta
    const { error } = await supabase
      .from('client_alerts')
      .insert({
        client_id: alert.client_id,
        alert_type: 'payment_overdue',
        severity: alert.days_overdue > 7 ? 'high' : alert.days_overdue > 3 ? 'medium' : 'low',
        title: `Pago vencido: ${alert.payment_concept}`,
        message: `El pago de $${alert.amount.toLocaleString()} venció hace ${alert.days_overdue} día(s). Fecha de vencimiento: ${new Date(alert.due_date).toLocaleDateString('es-ES')}.`,
        action_url: '/payments',
        is_read: false,
        expires_at: null // No expira hasta que se pague
      });

    if (error) throw error;

    console.log(`✅ Alerta creada para pago vencido: ${alert.payment_concept} (${alert.days_overdue} días)`);
    return true;
  } catch (error) {
    console.error('❌ Error creando alerta de pago vencido:', error);
    return false;
  }
}

/**
 * Generar alertas para todos los pagos vencidos
 * Ejecutar esta función periódicamente (diario)
 */
export async function generateOverduePaymentAlerts(): Promise<{ created: number; skipped: number }> {
  try {
    console.log('🔄 Generando alertas de pagos vencidos...');
    
    const overduePayments = await getOverduePaymentsForAlerts();
    console.log(`📋 Encontrados ${overduePayments.length} pagos vencidos`);

    let created = 0;
    let skipped = 0;

    for (const payment of overduePayments) {
      const result = await createPaymentOverdueAlert(payment);
      if (result) {
        created++;
      } else {
        skipped++;
      }
    }

    console.log(`✅ Alertas generadas: ${created} nuevas, ${skipped} ya existían`);
    
    return { created, skipped };
  } catch (error) {
    console.error('❌ Error generando alertas automáticas:', error);
    return { created: 0, skipped: 0 };
  }
}

/**
 * Crear alerta de recordatorio de pago próximo (3 días antes)
 */
export async function createPaymentReminderAlert(clientId: string, _paymentId: string, paymentConcept: string, amount: number, dueDate: string): Promise<boolean> {
  try {
    // Verificar si ya existe recordatorio
    const { data: existing } = await supabase
      .from('client_alerts')
      .select('id')
      .eq('client_id', clientId)
      .eq('alert_type', 'payment_reminder')
      .eq('is_read', false)
      .ilike('message', `%${paymentConcept}%`)
      .single();

    if (existing) {
      return false; // Ya existe
    }

    // Calcular días restantes
    const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    const { error } = await supabase
      .from('client_alerts')
      .insert({
        client_id: clientId,
        alert_type: 'payment_reminder',
        severity: 'medium',
        title: `Recordatorio: ${paymentConcept}`,
        message: `Tienes un pago de $${amount.toLocaleString()} que vence en ${daysUntilDue} día(s). Fecha: ${new Date(dueDate).toLocaleDateString('es-ES')}.`,
        action_url: '/payments',
        is_read: false,
        expires_at: new Date(new Date(dueDate).getTime() + 24 * 60 * 60 * 1000).toISOString() // Expira 1 día después
      });

    if (error) throw error;

    console.log(`✅ Recordatorio creado para: ${paymentConcept}`);
    return true;
  } catch (error) {
    console.error('❌ Error creando recordatorio:', error);
    return false;
  }
}

/**
 * Generar recordatorios para pagos próximos (3 días antes)
 */
export async function generateUpcomingPaymentReminders(): Promise<{ created: number; skipped: number }> {
  try {
    console.log('🔄 Generando recordatorios de pagos próximos...');
    
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    const { data: upcomingPayments, error } = await supabase
      .from('payment_schedules')
      .select('id, client_id, due_date, amount, payment_concept, status')
      .eq('status', 'pending')
      .gte('due_date', today.toISOString().split('T')[0])
      .lte('due_date', threeDaysLater.toISOString().split('T')[0]);

    if (error) throw error;

    let created = 0;
    let skipped = 0;

    for (const payment of upcomingPayments || []) {
      const result = await createPaymentReminderAlert(
        payment.client_id,
        payment.id,
        payment.payment_concept,
        parseFloat(payment.amount),
        payment.due_date
      );
      
      if (result) {
        created++;
      } else {
        skipped++;
      }
    }

    console.log(`✅ Recordatorios generados: ${created} nuevos, ${skipped} ya existían`);
    
    return { created, skipped };
  } catch (error) {
    console.error('❌ Error generando recordatorios:', error);
    return { created: 0, skipped: 0 };
  }
}

/**
 * Actualizar estado de payment_schedules a 'overdue' si están vencidos
 */
export async function updateOverduePaymentStatus(): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('payment_schedules')
      .update({ status: 'overdue' })
      .eq('status', 'pending')
      .lt('due_date', today)
      .select();

    if (error) throw error;

    console.log(`✅ ${data?.length || 0} pagos actualizados a estado 'overdue'`);
    return data?.length || 0;
  } catch (error) {
    console.error('❌ Error actualizando estado de pagos:', error);
    return 0;
  }
}

/**
 * Función principal: Ejecutar todas las tareas de alertas
 * Llamar diariamente desde un cron job o al iniciar sesión
 */
export async function runDailyPaymentAlerts(): Promise<void> {
  console.log('🚀 Iniciando proceso diario de alertas de pagos...');
  
  try {
    // 1. Actualizar estado de pagos vencidos
    await updateOverduePaymentStatus();
    
    // 2. Generar alertas de pagos vencidos
    await generateOverduePaymentAlerts();
    
    // 3. Generar recordatorios de pagos próximos
    await generateUpcomingPaymentReminders();
    
    console.log('✅ Proceso de alertas completado exitosamente');
  } catch (error) {
    console.error('❌ Error en proceso de alertas:', error);
  }
}
