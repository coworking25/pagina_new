/**
 * SISTEMA DE NOTIFICACIONES POR EMAIL
 * Integración con Resend para envío de emails transaccionales
 */

import { Resend } from 'resend';
import { 
  PaymentReminderEmailTemplate, 
  AppointmentReminderEmailTemplate,
  PaymentOverdueEmailTemplate,
  ContractExpiringEmailTemplate,
  WelcomeEmailTemplate
} from './email-templates';

// Inicializar cliente de Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email del remitente (debe estar verificado en Resend)
const FROM_EMAIL = process.env.EMAIL_FROM || 'notificaciones@tucoworking.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Tu Coworking';

/**
 * Interfaz para datos de email
 */
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Enviar email genérico
 */
export async function sendEmail(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY no configurado. Email no enviado:', data.subject);
      return { success: false, error: 'API key no configurada' };
    }

    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
      replyTo: data.replyTo
    });

    if (result.data) {
      console.log('✅ Email enviado:', { to: data.to, subject: data.subject, id: result.data.id });
      return { success: true, messageId: result.data.id };
    } else {
      console.error('❌ Error al enviar email:', result.error);
      return { success: false, error: result.error?.message };
    }
  } catch (error) {
    console.error('❌ Excepción al enviar email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Enviar recordatorio de pago
 */
export async function sendPaymentReminderEmail(params: {
  to: string;
  clientName: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  paymentUrl: string;
}) {
  const html = PaymentReminderEmailTemplate(params);
  
  return await sendEmail({
    to: params.to,
    subject: `Recordatorio: Pago próximo a vencer (${params.daysUntilDue} días)`,
    html,
    text: `Hola ${params.clientName}, te recordamos que tu pago de $${params.amount} vence el ${params.dueDate} (en ${params.daysUntilDue} días). Realiza tu pago en: ${params.paymentUrl}`
  });
}

/**
 * Enviar alerta de pago vencido
 */
export async function sendPaymentOverdueEmail(params: {
  to: string;
  clientName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  paymentUrl: string;
  contactPhone?: string;
}) {
  const html = PaymentOverdueEmailTemplate(params);
  
  return await sendEmail({
    to: params.to,
    subject: '⚠️ Pago Vencido - Acción Requerida',
    html,
    text: `Hola ${params.clientName}, tu pago de $${params.amount} está vencido desde el ${params.dueDate} (${params.daysOverdue} días). Por favor contacta a tu asesor o realiza el pago inmediatamente en: ${params.paymentUrl}`
  });
}

/**
 * Enviar recordatorio de cita
 */
export async function sendAppointmentReminderEmail(params: {
  to: string;
  clientName: string;
  appointmentDate: string;
  appointmentTime: string;
  propertyAddress: string;
  advisorName?: string;
  advisorPhone?: string;
  appointmentUrl: string;
}) {
  const html = AppointmentReminderEmailTemplate(params);
  
  return await sendEmail({
    to: params.to,
    subject: `📅 Recordatorio: Cita mañana a las ${params.appointmentTime}`,
    html,
    text: `Hola ${params.clientName}, te recordamos que tienes una cita mañana (${params.appointmentDate}) a las ${params.appointmentTime} para visitar: ${params.propertyAddress}. Ver detalles: ${params.appointmentUrl}`
  });
}

/**
 * Enviar notificación de contrato por vencer
 */
export async function sendContractExpiringEmail(params: {
  to: string;
  clientName: string;
  endDate: string;
  daysUntilExpiry: number;
  propertyAddress: string;
  renewalUrl: string;
  advisorName?: string;
  advisorPhone?: string;
}) {
  const html = ContractExpiringEmailTemplate(params);
  
  return await sendEmail({
    to: params.to,
    subject: `📄 Contrato por Vencer (${params.daysUntilExpiry} días)`,
    html,
    text: `Hola ${params.clientName}, tu contrato para ${params.propertyAddress} vence el ${params.endDate} (en ${params.daysUntilExpiry} días). Contacta a tu asesor para renovar: ${params.renewalUrl}`
  });
}

/**
 * Enviar email de bienvenida
 */
export async function sendWelcomeEmail(params: {
  to: string;
  clientName: string;
  loginUrl: string;
  supportEmail: string;
  supportPhone: string;
}) {
  const html = WelcomeEmailTemplate(params);
  
  return await sendEmail({
    to: params.to,
    subject: '👋 Bienvenido a Tu Coworking',
    html,
    text: `Hola ${params.clientName}, bienvenido a Tu Coworking. Accede a tu portal: ${params.loginUrl}. Soporte: ${params.supportEmail} | ${params.supportPhone}`
  });
}

/**
 * Enviar email de prueba (para testing)
 */
export async function sendTestEmail(to: string) {
  return await sendEmail({
    to,
    subject: 'Test Email - Sistema de Notificaciones',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>✅ Email de Prueba</h2>
        <p>Este es un email de prueba del sistema de notificaciones.</p>
        <p>Si recibes este mensaje, la configuración es correcta.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          ${FROM_NAME} | ${new Date().toLocaleString()}
        </p>
      </div>
    `,
    text: 'Email de prueba - Sistema funcionando correctamente'
  });
}

/**
 * Verificar configuración de email
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!FROM_EMAIL;
}

/**
 * Obtener información de configuración (sin exponer el API key)
 */
export function getEmailConfig() {
  return {
    configured: isEmailConfigured(),
    fromEmail: FROM_EMAIL,
    fromName: FROM_NAME,
    hasApiKey: !!process.env.RESEND_API_KEY
  };
}
