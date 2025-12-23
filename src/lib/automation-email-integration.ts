/**
 * INTEGRACIÓN: Sistema de Automatización + Emails
 * 
 * Este módulo conecta el sistema de automatización con el sistema de emails,
 * permitiendo que las reglas de automatización envíen emails automáticamente.
 */

import { createClient } from '@supabase/supabase-js';
import {
  sendPaymentReminderEmail,
  sendPaymentOverdueEmail,
  sendAppointmentReminderEmail,
  sendContractExpiringEmail,
  sendWelcomeEmail
} from './email';

// Inicializar cliente de Supabase (compatible Node.js y Vite)
const supabaseUrl = process.env.VITE_SUPABASE_URL || (typeof import.meta !== 'undefined' ? import.meta.env.VITE_SUPABASE_URL : undefined);
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || (typeof import.meta !== 'undefined' ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined);
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Procesa una regla de automatización y envía emails si está configurado
 */
export async function processAutomationRuleWithEmail(
  rule: any,
  triggerData: any
): Promise<{ success: boolean; error?: string; emailSent?: boolean }> {
  try {
    console.log('🔄 Procesando regla con email:', rule.name);

    // Verificar si la regla debe enviar emails
    const actions = rule.actions;
    if (!actions.send_email) {
      console.log('📧 Email no configurado para esta regla');
      return { success: true, emailSent: false };
    }

    // Obtener información del cliente/usuario
    const clientId = triggerData.client_id || triggerData.user_id;
    if (!clientId) {
      console.error('❌ No se encontró client_id en trigger_data');
      return { success: false, error: 'Missing client_id' };
    }

    // Obtener datos del cliente
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, full_name, email, phone')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.error('❌ Error obteniendo cliente:', clientError);
      return { success: false, error: 'Client not found' };
    }

    if (!client.email) {
      console.log('⚠️ Cliente no tiene email configurado');
      return { success: true, emailSent: false };
    }

    // Determinar qué tipo de email enviar según el tipo de alerta
    const alertType = actions.create_client_alert?.alert_type || rule.rule_type;
    let emailResult;

    switch (alertType) {
      case 'payment_reminder':
        emailResult = await sendPaymentReminderEmailFromRule(client, triggerData);
        break;

      case 'payment_overdue':
        emailResult = await sendPaymentOverdueEmailFromRule(client, triggerData);
        break;

      case 'appointment_reminder':
        emailResult = await sendAppointmentReminderEmailFromRule(client, triggerData);
        break;

      case 'contract_expiring':
        emailResult = await sendContractExpiringEmailFromRule(client, triggerData);
        break;

      case 'welcome':
        emailResult = await sendWelcomeEmailFromRule(client, triggerData);
        break;

      default:
        console.log(`⚠️ Tipo de alerta desconocido: ${alertType}`);
        return { success: true, emailSent: false };
    }

    // Registrar resultado en logs de automatización
    if (emailResult.success) {
      console.log('✅ Email enviado exitosamente:', emailResult.messageId);
      
      // Actualizar log de automatización con información del email
      await supabase
        .from('automation_logs')
        .update({
          email_sent: true,
          email_id: emailResult.messageId
        })
        .eq('id', triggerData.log_id);
    }

    return { success: true, emailSent: emailResult.success };
  } catch (error: any) {
    console.error('❌ Error en integración automatización-email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envía email de recordatorio de pago
 */
async function sendPaymentReminderEmailFromRule(client: any, triggerData: any) {
  const amount = triggerData.amount || 0;
  const dueDate = triggerData.due_date || new Date();
  const daysUntilDue = triggerData.days_until_due || 7;
  const paymentId = triggerData.payment_id;

  return await sendPaymentReminderEmail({
    to: client.email,
    clientName: client.full_name,
    amount: parseFloat(amount),
    dueDate: formatDate(dueDate),
    daysUntilDue: parseInt(daysUntilDue),
    paymentUrl: `${window.location.origin}/cliente/pagos${paymentId ? `/${paymentId}` : ''}`
  });
}

/**
 * Envía email de pago vencido
 */
async function sendPaymentOverdueEmailFromRule(client: any, triggerData: any) {
  const amount = triggerData.amount || 0;
  const dueDate = triggerData.due_date || new Date();
  const daysOverdue = triggerData.days_overdue || 1;
  const paymentId = triggerData.payment_id;

  return await sendPaymentOverdueEmail({
    to: client.email,
    clientName: client.full_name,
    amount: parseFloat(amount),
    dueDate: formatDate(dueDate),
    daysOverdue: parseInt(daysOverdue),
    paymentUrl: `${window.location.origin}/cliente/pagos${paymentId ? `/${paymentId}` : ''}`
  });
}

/**
 * Envía email de recordatorio de cita
 */
async function sendAppointmentReminderEmailFromRule(client: any, triggerData: any) {
  const appointmentDate = triggerData.date || new Date();
  const appointmentTime = triggerData.time || '10:00 AM';
  const propertyAddress = triggerData.property_address || 'Por definir';
  const advisorName = triggerData.advisor_name;

  return await sendAppointmentReminderEmail({
    to: client.email,
    clientName: client.full_name,
    appointmentDate: formatDate(appointmentDate),
    appointmentTime: appointmentTime,
    propertyAddress: propertyAddress,
    advisorName: advisorName,
    appointmentUrl: `${window.location.origin}/cliente/citas`
  });
}

/**
 * Envía email de contrato próximo a vencer
 */
async function sendContractExpiringEmailFromRule(client: any, triggerData: any) {
  const endDate = triggerData.end_date || new Date();
  const daysUntilExpiry = triggerData.days_until_expiry || 30;
  const propertyAddress = triggerData.property_address || 'Tu propiedad';
  const advisorName = triggerData.advisor_name;
  const advisorPhone = triggerData.advisor_phone;

  return await sendContractExpiringEmail({
    to: client.email,
    clientName: client.full_name,
    propertyAddress: propertyAddress,
    contractEndDate: formatDate(endDate),
    daysUntilExpiry: parseInt(daysUntilExpiry),
    advisorName: advisorName,
    advisorPhone: advisorPhone,
    renewalUrl: `${window.location.origin}/cliente/contratos`
  });
}

/**
 * Envía email de bienvenida
 */
async function sendWelcomeEmailFromRule(client: any, triggerData: any) {
  return await sendWelcomeEmail({
    to: client.email,
    clientName: client.full_name,
    loginUrl: `${window.location.origin}/login`
  });
}

/**
 * Formatea una fecha en formato legible
 */
function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Envía emails para todos los logs de automatización pendientes
 * Esta función se puede llamar desde un cron job o manualmente
 */
export async function processAutomationEmailQueue(): Promise<void> {
  try {
    console.log('🔄 Procesando cola de emails de automatización...');

    // Obtener logs de automatización de las últimas 24 horas que no han enviado email
    const { data: logs, error } = await supabase
      .from('automation_logs')
      .select(`
        id,
        rule_id,
        trigger_data,
        automation_rules (
          name,
          rule_type,
          actions,
          target_user_type
        )
      `)
      .eq('execution_status', 'success')
      .is('email_sent', null)
      .gte('executed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(50);

    if (error) {
      console.error('❌ Error obteniendo logs:', error);
      return;
    }

    if (!logs || logs.length === 0) {
      console.log('✅ No hay emails pendientes');
      return;
    }

    console.log(`📧 Encontrados ${logs.length} logs pendientes de envío`);

    // Procesar cada log
    for (const log of logs) {
      const rule = log.automation_rules;
      if (!rule) continue;

      // Verificar si la regla tiene send_email habilitado
      if (!rule.actions?.send_email) {
        // Marcar como procesado sin enviar
        await supabase
          .from('automation_logs')
          .update({ email_sent: false })
          .eq('id', log.id);
        continue;
      }

      // Añadir log_id a trigger_data para poder actualizarlo después
      const triggerData = { ...log.trigger_data, log_id: log.id };

      // Procesar y enviar email
      await processAutomationRuleWithEmail(rule, triggerData);

      // Delay para evitar rate limits
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    console.log('✅ Cola de emails procesada');
  } catch (error) {
    console.error('❌ Error procesando cola de emails:', error);
  }
}
