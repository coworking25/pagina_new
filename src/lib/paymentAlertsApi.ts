// =====================================================
// API DE ALERTAS DE PAGOS
// Funciones para gestionar alertas automáticas
// =====================================================

import { supabase } from './supabase';
import type { PaymentSchedule } from '../types/payments';

// ============================================
// TIPOS
// ============================================

export interface PaymentAlertSettings {
  id: string;
  client_id: string;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  sms_enabled: boolean;
  days_before_due: number[];
  send_on_due_date: boolean;
  send_overdue_alerts: boolean;
  overdue_alert_frequency: number;
  preferred_time: string;
  timezone: string;
  email?: string;
  whatsapp_number?: string;
  sms_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentAlertSent {
  id: string;
  payment_schedule_id: string;
  client_id: string;
  alert_type: AlertType;
  channel: 'email' | 'whatsapp' | 'sms';
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read';
  subject?: string;
  message: string;
  payment_amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date: string;
  days_overdue: number;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  failed_reason?: string;
  retry_count: number;
  provider_message_id?: string;
  provider_response?: any;
  created_at: string;
}

export type AlertType = 
  | 'reminder_7_days'
  | 'reminder_3_days'
  | 'reminder_1_day'
  | 'due_today'
  | 'overdue_1_day'
  | 'overdue_3_days'
  | 'overdue_7_days'
  | 'overdue_15_days'
  | 'payment_received'
  | 'partial_payment_received';

export interface PaymentAlertTemplate {
  id: string;
  name: string;
  alert_type: AlertType;
  channel: 'email' | 'whatsapp' | 'sms';
  subject_template?: string;
  message_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertToSend {
  payment: PaymentSchedule;
  client: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  settings: PaymentAlertSettings;
  alert_type: AlertType;
  days_until_due?: number;
  days_overdue?: number;
}

// ============================================
// CONFIGURACIÓN DE ALERTAS
// ============================================

/**
 * Obtener configuración de alertas de un cliente
 */
export async function getClientAlertSettings(clientId: string): Promise<PaymentAlertSettings | null> {
  const { data, error } = await supabase
    .from('payment_alert_settings')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (error) {
    console.error('Error getting alert settings:', error);
    return null;
  }

  return data;
}

/**
 * Actualizar configuración de alertas de un cliente
 */
export async function updateClientAlertSettings(
  clientId: string, 
  settings: Partial<PaymentAlertSettings>
): Promise<boolean> {
  const { error } = await supabase
    .from('payment_alert_settings')
    .update(settings)
    .eq('client_id', clientId);

  if (error) {
    console.error('Error updating alert settings:', error);
    return false;
  }

  return true;
}

// ============================================
// DETECCIÓN DE PAGOS QUE NECESITAN ALERTAS
// ============================================

/**
 * Obtener pagos que necesitan alertas HOY
 */
export async function getPaymentsNeedingAlerts(): Promise<AlertToSend[]> {
  console.log('🔍 Buscando pagos que necesitan alertas...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Obtener todos los pagos programados pendientes o parciales
  const { data: payments, error: paymentsError } = await supabase
    .from('payment_schedules')
    .select(`
      *,
      client:clients!payment_schedules_client_id_fkey (
        id,
        full_name,
        email,
        phone
      )
    `)
    .in('status', ['pending', 'partial'])
    .order('due_date', { ascending: true });

  if (paymentsError) {
    console.error('Error getting payments:', paymentsError);
    return [];
  }

  if (!payments || payments.length === 0) {
    console.log('No hay pagos pendientes');
    return [];
  }

  console.log(`📅 Encontrados ${payments.length} pagos pendientes/parciales`);

  const alertsToSend: AlertToSend[] = [];

  for (const payment of payments) {
    if (!payment.client) continue;

    // Obtener configuración de alertas del cliente
    const settings = await getClientAlertSettings(payment.client_id);
    if (!settings || !settings.is_active) continue;

    const dueDate = new Date(payment.due_date);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let alertType: AlertType | null = null;

    // Determinar tipo de alerta
    if (daysUntilDue < 0) {
      // Pago vencido
      const daysOverdue = Math.abs(daysUntilDue);
      
      if (!settings.send_overdue_alerts) continue;

      // Verificar última alerta de vencido
      const lastOverdueAlert = await getLastAlertSent(payment.id, 'overdue');
      
      if (lastOverdueAlert) {
        const daysSinceLastAlert = Math.floor(
          (today.getTime() - new Date(lastOverdueAlert.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Solo enviar si han pasado los días de frecuencia configurados
        if (daysSinceLastAlert < settings.overdue_alert_frequency) {
          continue;
        }
      }

      // Seleccionar tipo de alerta según días vencidos
      if (daysOverdue >= 15) alertType = 'overdue_15_days';
      else if (daysOverdue >= 7) alertType = 'overdue_7_days';
      else if (daysOverdue >= 3) alertType = 'overdue_3_days';
      else if (daysOverdue >= 1) alertType = 'overdue_1_day';

      if (alertType) {
        alertsToSend.push({
          payment,
          client: payment.client,
          settings,
          alert_type: alertType,
          days_overdue: daysOverdue
        });
      }
    } else if (daysUntilDue === 0) {
      // Vence hoy
      if (settings.send_on_due_date) {
        const alreadySent = await hasAlertBeenSent(payment.id, 'due_today');
        if (!alreadySent) {
          alertsToSend.push({
            payment,
            client: payment.client,
            settings,
            alert_type: 'due_today',
            days_until_due: 0
          });
        }
      }
    } else {
      // Recordatorios antes del vencimiento
      if (settings.days_before_due.includes(daysUntilDue)) {
        let reminderType: AlertType | null = null;
        
        if (daysUntilDue === 7) reminderType = 'reminder_7_days';
        else if (daysUntilDue === 3) reminderType = 'reminder_3_days';
        else if (daysUntilDue === 1) reminderType = 'reminder_1_day';

        if (reminderType) {
          const alreadySent = await hasAlertBeenSent(payment.id, reminderType);
          if (!alreadySent) {
            alertsToSend.push({
              payment,
              client: payment.client,
              settings,
              alert_type: reminderType,
              days_until_due: daysUntilDue
            });
          }
        }
      }
    }
  }

  console.log(`📬 Total de alertas a enviar: ${alertsToSend.length}`);
  return alertsToSend;
}

/**
 * Verificar si ya se envió una alerta específica para un pago
 */
async function hasAlertBeenSent(paymentId: string, alertType: AlertType): Promise<boolean> {
  const { data, error } = await supabase
    .from('payment_alerts_sent')
    .select('id')
    .eq('payment_schedule_id', paymentId)
    .eq('alert_type', alertType)
    .eq('status', 'sent')
    .limit(1);

  if (error) {
    console.error('Error checking alert:', error);
    return false;
  }

  return data && data.length > 0;
}

/**
 * Obtener última alerta de vencido enviada
 */
async function getLastAlertSent(paymentId: string, prefix: string): Promise<PaymentAlertSent | null> {
  const { data, error } = await supabase
    .from('payment_alerts_sent')
    .select('*')
    .eq('payment_schedule_id', paymentId)
    .like('alert_type', `${prefix}%`)
    .eq('status', 'sent')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

// ============================================
// PLANTILLAS Y GENERACIÓN DE MENSAJES
// ============================================

/**
 * Obtener plantilla de mensaje
 */
export async function getAlertTemplate(
  alertType: AlertType, 
  channel: 'email' | 'whatsapp' | 'sms'
): Promise<PaymentAlertTemplate | null> {
  const { data, error } = await supabase
    .from('payment_alert_templates')
    .select('*')
    .eq('alert_type', alertType)
    .eq('channel', channel)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error getting template:', error);
    return null;
  }

  return data;
}

/**
 * Generar mensaje desde plantilla
 */
export function generateMessage(
  template: PaymentAlertTemplate,
  alert: AlertToSend
): { subject?: string; message: string } {
  const variables = {
    '{client_name}': alert.client.full_name,
    '{payment_concept}': alert.payment.payment_concept,
    '{amount}': alert.payment.amount.toLocaleString('es-CO'),
    '{due_date}': new Date(alert.payment.due_date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    '{days_until_due}': alert.days_until_due?.toString() || '0',
    '{days_overdue}': alert.days_overdue?.toString() || '0',
    '{paid_amount}': (alert.payment.paid_amount || 0).toLocaleString('es-CO'),
    '{remaining_amount}': (alert.payment.remaining_amount || alert.payment.amount).toLocaleString('es-CO')
  };

  let message = template.message_template;
  let subject = template.subject_template;

  // Reemplazar variables en mensaje
  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(key, 'g'), value);
    if (subject) {
      subject = subject.replace(new RegExp(key, 'g'), value);
    }
  }

  return { subject, message };
}

// ============================================
// ENVÍO DE ALERTAS
// ============================================

/**
 * Procesar y enviar todas las alertas pendientes
 */
export async function processPaymentAlerts(): Promise<{
  total: number;
  sent: number;
  failed: number;
}> {
  console.log('🚀 Iniciando procesamiento de alertas de pagos...');

  const alertsToSend = await getPaymentsNeedingAlerts();
  
  let sent = 0;
  let failed = 0;

  for (const alert of alertsToSend) {
    // Enviar por email si está habilitado
    if (alert.settings.email_enabled && alert.client.email) {
      const emailSent = await sendEmailAlert(alert);
      if (emailSent) sent++;
      else failed++;
    }

    // Enviar por WhatsApp si está habilitado
    if (alert.settings.whatsapp_enabled && alert.client.phone) {
      const whatsappSent = await sendWhatsAppAlert(alert);
      if (whatsappSent) sent++;
      else failed++;
    }

    // Pequeña pausa entre envíos
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`✅ Procesamiento completado: ${sent} enviadas, ${failed} fallidas`);

  return {
    total: alertsToSend.length,
    sent,
    failed
  };
}

/**
 * Enviar alerta por email
 */
async function sendEmailAlert(alert: AlertToSend): Promise<boolean> {
  try {
    const template = await getAlertTemplate(alert.alert_type, 'email');
    if (!template) {
      console.error('No se encontró plantilla de email para', alert.alert_type);
      return false;
    }

    const { subject, message } = generateMessage(template, alert);

    console.log(`📧 Enviando email a ${alert.client.email}`);

    // TODO: Integrar con servicio de email (Resend, SendGrid, etc)
    // Por ahora, solo registramos en la base de datos
    
    const { error } = await supabase
      .from('payment_alerts_sent')
      .insert({
        payment_schedule_id: alert.payment.id,
        client_id: alert.client.id,
        alert_type: alert.alert_type,
        channel: 'email',
        status: 'sent', // Cambiar a 'pending' cuando se integre email real
        subject,
        message,
        payment_amount: alert.payment.amount,
        paid_amount: alert.payment.paid_amount || 0,
        remaining_amount: alert.payment.remaining_amount || alert.payment.amount,
        due_date: alert.payment.due_date,
        days_overdue: alert.days_overdue || 0,
        sent_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error registrando alerta de email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
}

/**
 * Enviar alerta por WhatsApp
 */
async function sendWhatsAppAlert(alert: AlertToSend): Promise<boolean> {
  try {
    const template = await getAlertTemplate(alert.alert_type, 'whatsapp');
    if (!template) {
      console.error('No se encontró plantilla de WhatsApp para', alert.alert_type);
      return false;
    }

    const { message } = generateMessage(template, alert);

    console.log(`📱 Enviando WhatsApp a ${alert.client.phone}`);

    // TODO: Integrar con Twilio, Meta API, o servicio de WhatsApp
    // Por ahora, solo registramos en la base de datos
    
    const { error } = await supabase
      .from('payment_alerts_sent')
      .insert({
        payment_schedule_id: alert.payment.id,
        client_id: alert.client.id,
        alert_type: alert.alert_type,
        channel: 'whatsapp',
        status: 'sent', // Cambiar a 'pending' cuando se integre WhatsApp real
        message,
        payment_amount: alert.payment.amount,
        paid_amount: alert.payment.paid_amount || 0,
        remaining_amount: alert.payment.remaining_amount || alert.payment.amount,
        due_date: alert.payment.due_date,
        days_overdue: alert.days_overdue || 0,
        sent_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error registrando alerta de WhatsApp:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
    return false;
  }
}

// ============================================
// HISTORIAL Y ESTADÍSTICAS
// ============================================

/**
 * Obtener historial de alertas de un cliente
 */
export async function getClientAlertHistory(
  clientId: string,
  limit: number = 50
): Promise<PaymentAlertSent[]> {
  const { data, error } = await supabase
    .from('payment_alerts_sent')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error getting alert history:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtener estadísticas de alertas
 */
export async function getAlertsStatistics(clientId?: string) {
  let query = supabase
    .from('payment_alerts_sent')
    .select('alert_type, channel, status');

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error getting statistics:', error);
    return null;
  }

  const stats = {
    total: data.length,
    by_type: {} as Record<string, number>,
    by_channel: {} as Record<string, number>,
    by_status: {} as Record<string, number>
  };

  data.forEach(alert => {
    stats.by_type[alert.alert_type] = (stats.by_type[alert.alert_type] || 0) + 1;
    stats.by_channel[alert.channel] = (stats.by_channel[alert.channel] || 0) + 1;
    stats.by_status[alert.status] = (stats.by_status[alert.status] || 0) + 1;
  });

  return stats;
}

/**
 * Marcar alerta como entregada (webhook del proveedor)
 */
export async function markAlertDelivered(
  alertId: string,
  providerMessageId?: string,
  providerResponse?: any
): Promise<boolean> {
  const { error } = await supabase
    .from('payment_alerts_sent')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      provider_message_id: providerMessageId,
      provider_response: providerResponse
    })
    .eq('id', alertId);

  if (error) {
    console.error('Error marking alert as delivered:', error);
    return false;
  }

  return true;
}

/**
 * Marcar alerta como fallida
 */
export async function markAlertFailed(
  alertId: string,
  reason: string,
  providerResponse?: any
): Promise<boolean> {
  const { error } = await supabase
    .from('payment_alerts_sent')
    .update({
      status: 'failed',
      failed_reason: reason,
      provider_response: providerResponse,
      retry_count: supabase.rpc('increment', { x: 1 })
    })
    .eq('id', alertId);

  if (error) {
    console.error('Error marking alert as failed:', error);
    return false;
  }

  return true;
}
