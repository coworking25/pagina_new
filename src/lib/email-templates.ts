/**
 * TEMPLATES HTML PARA EMAILS
 * Templates profesionales y responsivos para notificaciones
 */

// Estilos base para todos los emails
const baseStyles = `
  body { 
    margin: 0; 
    padding: 0; 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f4f4f5;
  }
  .container { 
    max-width: 600px; 
    margin: 0 auto; 
    background-color: #ffffff;
  }
  .header { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px 20px; 
    text-align: center;
  }
  .header h1 { 
    color: #ffffff; 
    margin: 0; 
    font-size: 28px;
    font-weight: 600;
  }
  .content { 
    padding: 40px 30px;
  }
  .button { 
    display: inline-block;
    padding: 14px 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    margin: 20px 0;
  }
  .info-box {
    background-color: #f9fafb;
    border-left: 4px solid #667eea;
    padding: 16px;
    margin: 20px 0;
    border-radius: 4px;
  }
  .warning-box {
    background-color: #fef2f2;
    border-left: 4px solid #ef4444;
    padding: 16px;
    margin: 20px 0;
    border-radius: 4px;
  }
  .footer { 
    background-color: #f9fafb;
    padding: 30px;
    text-align: center;
    color: #6b7280;
    font-size: 14px;
  }
`;

/**
 * Template: Recordatorio de Pago
 */
export function PaymentReminderEmailTemplate(params: {
  clientName: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  paymentUrl: string;
}) {
  const urgencyColor = params.daysUntilDue <= 3 ? '#ef4444' : '#667eea';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recordatorio de Pago</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Recordatorio de Pago</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${params.clientName}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Te recordamos que tu pago está próximo a vencer.
      </p>
      
      <div class="info-box">
        <p style="margin: 8px 0;"><strong>Monto:</strong> $${params.amount.toLocaleString()}</p>
        <p style="margin: 8px 0;"><strong>Fecha de vencimiento:</strong> ${params.dueDate}</p>
        <p style="margin: 8px 0; color: ${urgencyColor};">
          <strong>Vence en ${params.daysUntilDue} día${params.daysUntilDue !== 1 ? 's' : ''}</strong>
        </p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Realiza tu pago a tiempo para evitar recargos por mora.
      </p>
      
      <div style="text-align: center;">
        <a href="${params.paymentUrl}" class="button">Ver Detalles del Pago</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        Si ya realizaste el pago, por favor ignora este mensaje.
      </p>
    </div>
    <div class="footer">
      <p>Tu Coworking - Sistema de Gestión</p>
      <p>Este es un mensaje automático, por favor no respondas a este email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Template: Pago Vencido
 */
export function PaymentOverdueEmailTemplate(params: {
  clientName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  paymentUrl: string;
  contactPhone?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pago Vencido</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
      <h1>⚠️ Pago Vencido</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${params.clientName}</strong>,</p>
      
      <div class="warning-box">
        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #dc2626;">
          Tu pago está vencido desde hace ${params.daysOverdue} día${params.daysOverdue !== 1 ? 's' : ''}.
        </p>
      </div>
      
      <div class="info-box">
        <p style="margin: 8px 0;"><strong>Monto vencido:</strong> $${params.amount.toLocaleString()}</p>
        <p style="margin: 8px 0;"><strong>Fecha de vencimiento:</strong> ${params.dueDate}</p>
        <p style="margin: 8px 0; color: #ef4444;">
          <strong>Días vencidos:</strong> ${params.daysOverdue}
        </p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6;">
        <strong>⚡ Acción requerida:</strong> Por favor realiza el pago lo antes posible para evitar:
      </p>
      
      <ul style="font-size: 15px; line-height: 1.8; color: #374151;">
        <li>Recargos adicionales por mora</li>
        <li>Suspensión temporal del servicio</li>
        <li>Afectación de tu historial crediticio</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${params.paymentUrl}" class="button">Pagar Ahora</a>
      </div>
      
      ${params.contactPhone ? `
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
        ¿Necesitas ayuda? Contáctanos al <strong>${params.contactPhone}</strong>
      </p>
      ` : ''}
    </div>
    <div class="footer">
      <p>Tu Coworking - Sistema de Gestión</p>
      <p>Este es un mensaje automático, por favor no respondas a este email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Template: Recordatorio de Cita
 */
export function AppointmentReminderEmailTemplate(params: {
  clientName: string;
  appointmentDate: string;
  appointmentTime: string;
  propertyAddress: string;
  advisorName?: string;
  advisorPhone?: string;
  appointmentUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recordatorio de Cita</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
      <h1>📅 Recordatorio de Cita</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${params.clientName}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Te recordamos que tienes una cita programada para <strong>mañana</strong>.
      </p>
      
      <div class="info-box">
        <p style="margin: 8px 0;"><strong>📆 Fecha:</strong> ${params.appointmentDate}</p>
        <p style="margin: 8px 0;"><strong>🕐 Hora:</strong> ${params.appointmentTime}</p>
        <p style="margin: 8px 0;"><strong>📍 Dirección:</strong> ${params.propertyAddress}</p>
        ${params.advisorName ? `<p style="margin: 8px 0;"><strong>👤 Asesor:</strong> ${params.advisorName}</p>` : ''}
        ${params.advisorPhone ? `<p style="margin: 8px 0;"><strong>📞 Teléfono:</strong> ${params.advisorPhone}</p>` : ''}
      </div>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Por favor confirma tu asistencia o avísanos si necesitas reprogramar.
      </p>
      
      <div style="text-align: center;">
        <a href="${params.appointmentUrl}" class="button">Ver Detalles de la Cita</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        💡 <strong>Consejo:</strong> Llega 5 minutos antes para una mejor experiencia.
      </p>
    </div>
    <div class="footer">
      <p>Tu Coworking - Sistema de Gestión</p>
      <p>Este es un mensaje automático, por favor no respondas a este email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Template: Contrato por Vencer
 */
export function ContractExpiringEmailTemplate(params: {
  clientName: string;
  endDate: string;
  daysUntilExpiry: number;
  propertyAddress: string;
  renewalUrl: string;
  advisorName?: string;
  advisorPhone?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrato por Vencer</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
      <h1>📄 Contrato por Vencer</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${params.clientName}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Te informamos que tu contrato está próximo a vencer.
      </p>
      
      <div class="info-box">
        <p style="margin: 8px 0;"><strong>Propiedad:</strong> ${params.propertyAddress}</p>
        <p style="margin: 8px 0;"><strong>Fecha de vencimiento:</strong> ${params.endDate}</p>
        <p style="margin: 8px 0; color: #d97706;">
          <strong>Vence en ${params.daysUntilExpiry} días</strong>
        </p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6;">
        <strong>¿Deseas renovar tu contrato?</strong> Contacta a tu asesor para iniciar el proceso de renovación.
      </p>
      
      ${params.advisorName || params.advisorPhone ? `
      <div class="info-box">
        <p style="margin: 0; font-size: 15px; font-weight: 600;">Tu Asesor:</p>
        ${params.advisorName ? `<p style="margin: 8px 0;">${params.advisorName}</p>` : ''}
        ${params.advisorPhone ? `<p style="margin: 8px 0;">📞 ${params.advisorPhone}</p>` : ''}
      </div>
      ` : ''}
      
      <div style="text-align: center;">
        <a href="${params.renewalUrl}" class="button">Renovar Contrato</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        Si decides no renovar, por favor avísanos con anticipación.
      </p>
    </div>
    <div class="footer">
      <p>Tu Coworking - Sistema de Gestión</p>
      <p>Este es un mensaje automático, por favor no respondas a este email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Template: Email de Bienvenida
 */
export function WelcomeEmailTemplate(params: {
  clientName: string;
  loginUrl: string;
  supportEmail: string;
  supportPhone: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👋 ¡Bienvenido!</h1>
    </div>
    <div class="content">
      <p style="font-size: 18px; line-height: 1.6;">Hola <strong>${params.clientName}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6;">
        ¡Bienvenido a <strong>Tu Coworking</strong>! Estamos encantados de tenerte con nosotros.
      </p>
      
      <div class="info-box">
        <p style="margin: 0; font-size: 15px; font-weight: 600;">✨ Tu portal está listo</p>
        <p style="margin: 12px 0 0 0; font-size: 14px; color: #6b7280;">
          Accede a tu cuenta para gestionar pagos, citas y contratos.
        </p>
      </div>
      
      <div style="text-align: center;">
        <a href="${params.loginUrl}" class="button">Acceder a Mi Portal</a>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
        <strong>Desde tu portal puedes:</strong>
      </p>
      
      <ul style="font-size: 15px; line-height: 1.8; color: #374151;">
        <li>💰 Consultar y pagar tus facturas</li>
        <li>📅 Agendar y gestionar citas</li>
        <li>📄 Ver tus contratos y documentos</li>
        <li>🔔 Recibir notificaciones importantes</li>
        <li>💬 Contactar con tu asesor</li>
      </ul>
      
      <div class="info-box">
        <p style="margin: 0; font-size: 14px; font-weight: 600;">¿Necesitas ayuda?</p>
        <p style="margin: 8px 0;">📧 ${params.supportEmail}</p>
        <p style="margin: 8px 0;">📞 ${params.supportPhone}</p>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
        Estamos aquí para ayudarte. ¡Disfruta tu experiencia! 🎉
      </p>
    </div>
    <div class="footer">
      <p>Tu Coworking - Sistema de Gestión</p>
      <p>Este es un mensaje automático, por favor no respondas a este email.</p>
    </div>
  </div>
</body>
</html>
  `;
}
