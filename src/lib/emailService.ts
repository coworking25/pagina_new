import sgMail from '@sendgrid/mail';

// Configurar SendGrid con la API key
const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY;
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'noreply@coworkinginmobiliario.com';

// Verificar si estamos en el navegador
const isBrowser = typeof window !== 'undefined';

// Configurar la API key si está disponible y no estamos en el navegador
if (SENDGRID_API_KEY && !isBrowser) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Servicio de envío de emails usando SendGrid
 */
export class EmailService {
  private static instance: EmailService;
  private isConfigured: boolean;

  private constructor() {
    this.isConfigured = Boolean(SENDGRID_API_KEY);
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Verificar si el servicio está configurado
   */
  public isServiceConfigured(): boolean {
    // En el navegador, siempre devolver true (usar Edge Functions)
    if (isBrowser) {
      return true;
    }
    // En servidor, verificar SendGrid
    return this.isConfigured;
  }

  /**
   * Enviar email básico
   */
  public async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // Si estamos en el navegador, usar Edge Function
      if (isBrowser) {
        return this.sendEmailViaEdgeFunction(options);
      }

      // Si estamos en Node.js/server, usar SendGrid directamente
      if (!this.isConfigured) {
        console.warn('⚠️ Email service not configured. Please set VITE_SENDGRID_API_KEY in your environment variables.');
        return {
          success: false,
          error: 'Email service not configured'
        };
      }

      const msg = {
        to: options.to,
        from: options.from || FROM_EMAIL,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await sgMail.send(msg);

      console.log('📧 Email sent successfully:', {
        to: options.to,
        subject: options.subject,
        messageId: result[0]?.headers?.['x-message-id']
      });

      return {
        success: true,
        messageId: result[0]?.headers?.['x-message-id']
      };

    } catch (error: any) {
      console.error('❌ Error sending email:', error);

      return {
        success: false,
        error: error.message || 'Unknown error occurred while sending email'
      };
    }
  }

  /**
   * Enviar email usando Supabase Edge Function (para navegador)
   */
  private async sendEmailViaEdgeFunction(options: EmailOptions): Promise<EmailResult> {
    try {
      // Importar supabase dinámicamente para evitar problemas de inicialización
      const { supabase } = await import('./supabase');

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          from: options.from || FROM_EMAIL,
        },
      });

      if (error) {
        console.error('❌ Error calling Edge Function:', error);
        return {
          success: false,
          error: error.message || 'Error calling email service'
        };
      }

      if (data?.success) {
        console.log('📧 Email sent via Edge Function:', {
          to: options.to,
          subject: options.subject,
          messageId: data.messageId
        });

        return {
          success: true,
          messageId: data.messageId
        };
      } else {
        console.error('❌ Edge Function returned error:', data?.error);
        return {
          success: false,
          error: data?.error || 'Unknown error from email service'
        };
      }

    } catch (error: any) {
      console.error('❌ Error sending email via Edge Function:', error);
      return {
        success: false,
        error: error.message || 'Error communicating with email service'
      };
    }
  }

  /**
   * Enviar email de credenciales del portal
   */
  public async sendPortalCredentials(
    clientEmail: string,
    clientName: string,
    password: string,
    portalUrl: string = 'https://portal.coworkinginmobiliario.com'
  ): Promise<EmailResult> {
    const subject = 'Bienvenido a tu Portal de Cliente - Credenciales de Acceso';
    const html = this.generatePortalCredentialsTemplate(clientName, clientEmail, password, portalUrl);

    return this.sendEmail({
      to: clientEmail,
      subject,
      html,
      text: `Hola ${clientName}, tus credenciales de acceso al portal son: Email: ${clientEmail}, Contraseña: ${password}. URL: ${portalUrl}`
    });
  }

  /**
   * Enviar confirmación de cita
   */
  public async sendAppointmentConfirmation(
    clientEmail: string,
    clientName: string,
    appointmentDetails: {
      date: string;
      time: string;
      propertyTitle: string;
      advisorName: string;
      advisorPhone: string;
    }
  ): Promise<EmailResult> {
    const subject = 'Confirmación de Cita Agendada';
    const html = this.generateAppointmentConfirmationTemplate(clientName, appointmentDetails);

    return this.sendEmail({
      to: clientEmail,
      subject,
      html
    });
  }

  /**
   * Enviar recordatorio de pago
   */
  public async sendPaymentReminder(
    clientEmail: string,
    clientName: string,
    paymentDetails: {
      amount: number;
      dueDate: string;
      description: string;
      paymentLink?: string;
    }
  ): Promise<EmailResult> {
    const subject = 'Recordatorio de Pago Pendiente';
    const html = this.generatePaymentReminderTemplate(clientName, paymentDetails);

    return this.sendEmail({
      to: clientEmail,
      subject,
      html
    });
  }

  /**
   * Enviar email de bienvenida
   */
  public async sendWelcomeEmail(
    clientEmail: string,
    clientName: string
  ): Promise<EmailResult> {
    const subject = 'Bienvenido a Coworking Inmobiliario';
    const html = this.generateWelcomeTemplate(clientName);

    return this.sendEmail({
      to: clientEmail,
      subject,
      html
    });
  }

  /**
   * Template HTML para credenciales del portal
   */
  private generatePortalCredentialsTemplate(
    clientName: string,
    email: string,
    password: string,
    portalUrl: string
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Credenciales del Portal</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; border: 2px solid #667eea; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Bienvenido a tu Portal</h1>
            <p>Coworking Inmobiliario</p>
          </div>
          <div class="content">
            <h2>Hola ${clientName},</h2>
            <p>Tu cuenta ha sido creada exitosamente. Aquí tienes tus credenciales de acceso al portal de clientes:</p>

            <div class="credentials">
              <h3>📋 Tus Credenciales</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Contraseña temporal:</strong> ${password}</p>
              <p style="color: #e74c3c; font-weight: bold;">⚠️ IMPORTANTE: Cambia tu contraseña en el primer inicio de sesión</p>
            </div>

            <div style="text-align: center;">
              <a href="${portalUrl}" class="button">🔗 Acceder al Portal</a>
            </div>

            <p>Con tu portal podrás:</p>
            <ul>
              <li>Ver todas tus propiedades de interés</li>
              <li>Revisar el estado de tus citas</li>
              <li>Acceder a documentos importantes</li>
              <li>Ver tu historial de pagos</li>
              <li>Contactar directamente con tu asesor</li>
            </ul>

            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>¡Bienvenido al equipo!</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a esta dirección.</p>
            <p>Coworking Inmobiliario © 2024</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML para confirmación de cita
   */
  private generateAppointmentConfirmationTemplate(
    clientName: string,
    details: { date: string; time: string; propertyTitle: string; advisorName: string; advisorPhone: string }
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Cita</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #27ae60; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Cita Confirmada</h1>
            <p>Coworking Inmobiliario</p>
          </div>
          <div class="content">
            <h2>Hola ${clientName},</h2>
            <p>Tu cita ha sido agendada exitosamente. Aquí están los detalles:</p>

            <div class="details">
              <h3>📋 Detalles de la Cita</h3>
              <p><strong>📅 Fecha:</strong> ${details.date}</p>
              <p><strong>🕐 Hora:</strong> ${details.time}</p>
              <p><strong>🏠 Propiedad:</strong> ${details.propertyTitle}</p>
              <p><strong>👨‍💼 Asesor:</strong> ${details.advisorName}</p>
              <p><strong>📞 Teléfono del asesor:</strong> ${details.advisorPhone}</p>
            </div>

            <p><strong>Recuerda:</strong></p>
            <ul>
              <li>Llega 10 minutos antes de la hora programada</li>
              <li>Trae identificación y documentos necesarios</li>
              <li>Si necesitas cancelar o reprogramar, contacta con anticipación</li>
            </ul>

            <p>¡Te esperamos!</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a esta dirección.</p>
            <p>Coworking Inmobiliario © 2024</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML para recordatorio de pago
   */
  private generatePaymentReminderTemplate(
    clientName: string,
    details: { amount: number; dueDate: string; description: string; paymentLink?: string }
  ): string {
    const formattedAmount = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(details.amount);

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recordatorio de Pago</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .payment-info { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #e74c3c; margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #e74c3c; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Recordatorio de Pago</h1>
            <p>Coworking Inmobiliario</p>
          </div>
          <div class="content">
            <h2>Hola ${clientName},</h2>
            <p>Te recordamos que tienes un pago pendiente:</p>

            <div class="payment-info">
              <h3>📋 Detalles del Pago</h3>
              <div class="amount">${formattedAmount}</div>
              <p><strong>📅 Fecha límite:</strong> ${details.dueDate}</p>
              <p><strong>📝 Descripción:</strong> ${details.description}</p>
            </div>

            ${details.paymentLink ? `
            <div style="text-align: center;">
              <a href="${details.paymentLink}" class="button">💳 Pagar Ahora</a>
            </div>
            ` : ''}

            <p>Por favor, realiza el pago antes de la fecha límite para evitar cargos adicionales o suspensión de servicios.</p>

            <p>Si ya realizaste el pago, puedes ignorar este mensaje.</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a esta dirección.</p>
            <p>Coworking Inmobiliario © 2024</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML para email de bienvenida
   */
  private generateWelcomeTemplate(clientName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .services { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Bienvenido!</h1>
            <p>Coworking Inmobiliario</p>
          </div>
          <div class="content">
            <h2>Hola ${clientName},</h2>
            <p>¡Bienvenido a Coworking Inmobiliario! Estamos emocionados de tenerte como parte de nuestra comunidad.</p>

            <div class="services">
              <h3>🏢 Nuestros Servicios</h3>
              <ul>
                <li><strong>Asesoría inmobiliaria personalizada</strong></li>
                <li><strong>Amplia cartera de propiedades</strong></li>
                <li><strong>Trámites y gestiones completas</strong></li>
                <li><strong>Seguimiento y soporte continuo</strong></li>
                <li><strong>Portal de cliente 24/7</strong></li>
              </ul>
            </div>

            <p>Nuestro equipo de asesores especializados está listo para ayudarte a encontrar la propiedad perfecta para ti.</p>

            <p>¿Necesitas ayuda? No dudes en contactarnos:</p>
            <ul>
              <li>📞 Teléfono: [Tu número de teléfono]</li>
              <li>📧 Email: [Tu email de contacto]</li>
              <li>💬 WhatsApp: [Tu número de WhatsApp]</li>
            </ul>

            <p>¡Esperamos poder servirte pronto!</p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a esta dirección.</p>
            <p>Coworking Inmobiliario © 2024</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Enviar email de bienvenida con credenciales del portal
   */
  async sendWelcomeEmailWithCredentials(
    clientName: string,
    email: string,
    temporaryPassword: string
  ): Promise<EmailResult> {
    const portalUrl = window.location.origin + '/cliente/login';
    
    const html = `
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido al Portal de Clientes</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          code { background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido al Portal de Clientes!</h1>
          </div>
          <div class="content">
            <h2>Hola ${clientName},</h2>
            <p>Nos complace informarte que tu cuenta en el Portal de Clientes ha sido creada exitosamente.</p>
            
            <div class="credentials">
              <h3>📧 Tus Credenciales de Acceso</h3>
              <p><strong>Usuario (Email):</strong> ${email}</p>
              <p><strong>Contraseña Temporal:</strong> <code>${temporaryPassword}</code></p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Por tu seguridad, te recomendamos cambiar tu contraseña en tu primer inicio de sesión.
            </div>
            
            <p>Desde el portal podrás:</p>
            <ul>
              <li>✅ Consultar tus contratos activos</li>
              <li>✅ Ver el estado de tus pagos</li>
              <li>✅ Descargar extractos y facturas</li>
              <li>✅ Gestionar tus documentos</li>
              <li>✅ Ver tus propiedades asignadas</li>
              <li>✅ Comunicarte con nosotros</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${portalUrl}" class="button">Ingresar al Portal</a>
            </div>
            
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            
            <p>¡Bienvenido a bordo!</p>
            <p><strong>Equipo de Coworking</strong></p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Coworking. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
Hola ${clientName},

¡Bienvenido al Portal de Clientes de Coworking!

TUS CREDENCIALES DE ACCESO:
Usuario (Email): ${email}
Contraseña Temporal: ${temporaryPassword}

⚠️ IMPORTANTE: Por tu seguridad, te recomendamos cambiar tu contraseña en tu primer inicio de sesión.

Desde el portal podrás:
- Consultar tus contratos activos
- Ver el estado de tus pagos
- Descargar extractos y facturas
- Gestionar tus documentos
- Ver tus propiedades asignadas
- Comunicarte con nosotros

Ingresa al portal aquí: ${portalUrl}

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.

¡Bienvenido a bordo!
Equipo de Coworking

---
Este es un correo automático, por favor no respondas a este mensaje.
© ${new Date().getFullYear()} Coworking. Todos los derechos reservados.
    `;
    
    return this.sendEmail({
      to: email,
      subject: '🎉 Bienvenido al Portal de Clientes - Coworking',
      html,
      text
    });
  }
}

// Exportar instancia singleton
export const emailService = EmailService.getInstance();