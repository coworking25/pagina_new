import { supabase } from './supabase';

export interface EmailSettings {
  sendgridApiKey: string;
  fromEmail: string;
  emailEnabled: boolean;
  portalCredentialsEnabled: boolean;
  appointmentConfirmationsEnabled: boolean;
  paymentRemindersEnabled: boolean;
  welcomeEmailsEnabled: boolean;
  testEmailAddress?: string;
}

/**
 * Obtener configuración de email desde Supabase
 */
export async function getEmailSettings(): Promise<EmailSettings | null> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', [
        'sendgrid_api_key',
        'from_email',
        'email_enabled',
        'portal_credentials_enabled',
        'appointment_confirmations_enabled',
        'payment_reminders_enabled',
        'welcome_emails_enabled',
        'test_email_address'
      ]);

    if (error) {
      console.error('❌ Error obteniendo configuración de email:', error);
      return null;
    }

    // Convertir los datos a un objeto EmailSettings
    const settings: Partial<EmailSettings> = {};

    data.forEach(item => {
      switch (item.key) {
        case 'sendgrid_api_key':
          settings.sendgridApiKey = item.value;
          break;
        case 'from_email':
          settings.fromEmail = item.value;
          break;
        case 'email_enabled':
          settings.emailEnabled = item.value === 'true';
          break;
        case 'portal_credentials_enabled':
          settings.portalCredentialsEnabled = item.value === 'true';
          break;
        case 'appointment_confirmations_enabled':
          settings.appointmentConfirmationsEnabled = item.value === 'true';
          break;
        case 'payment_reminders_enabled':
          settings.paymentRemindersEnabled = item.value === 'true';
          break;
        case 'welcome_emails_enabled':
          settings.welcomeEmailsEnabled = item.value === 'true';
          break;
        case 'test_email_address':
          settings.testEmailAddress = item.value;
          break;
      }
    });

    return settings as EmailSettings;
  } catch (error) {
    console.error('❌ Error en getEmailSettings:', error);
    return null;
  }
}

/**
 * Guardar configuración de email en Supabase
 */
export async function saveEmailSettings(settings: Partial<EmailSettings>): Promise<boolean> {
  try {
    const settingsToUpdate: Array<{ key: string; value: string }> = [];

    if (settings.sendgridApiKey !== undefined) {
      settingsToUpdate.push({
        key: 'sendgrid_api_key',
        value: settings.sendgridApiKey
      });
    }

    if (settings.fromEmail !== undefined) {
      settingsToUpdate.push({
        key: 'from_email',
        value: settings.fromEmail
      });
    }

    if (settings.emailEnabled !== undefined) {
      settingsToUpdate.push({
        key: 'email_enabled',
        value: settings.emailEnabled.toString()
      });
    }

    if (settings.portalCredentialsEnabled !== undefined) {
      settingsToUpdate.push({
        key: 'portal_credentials_enabled',
        value: settings.portalCredentialsEnabled.toString()
      });
    }

    if (settings.appointmentConfirmationsEnabled !== undefined) {
      settingsToUpdate.push({
        key: 'appointment_confirmations_enabled',
        value: settings.appointmentConfirmationsEnabled.toString()
      });
    }

    if (settings.paymentRemindersEnabled !== undefined) {
      settingsToUpdate.push({
        key: 'payment_reminders_enabled',
        value: settings.paymentRemindersEnabled.toString()
      });
    }

    if (settings.welcomeEmailsEnabled !== undefined) {
      settingsToUpdate.push({
        key: 'welcome_emails_enabled',
        value: settings.welcomeEmailsEnabled.toString()
      });
    }

    if (settings.testEmailAddress !== undefined) {
      settingsToUpdate.push({
        key: 'test_email_address',
        value: settings.testEmailAddress
      });
    }

    if (settingsToUpdate.length === 0) {
      console.log('⚠️ No hay configuraciones para actualizar');
      return true;
    }

    // Usar upsert para actualizar o insertar
    const { error } = await supabase
      .from('settings')
      .upsert(settingsToUpdate, { onConflict: 'key' });

    if (error) {
      console.error('❌ Error guardando configuración de email:', error);
      return false;
    }

    console.log('✅ Configuración de email guardada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error en saveEmailSettings:', error);
    return false;
  }
}

/**
 * Verificar si el servicio de email está configurado y funcional
 */
export async function testEmailConfiguration(testEmail?: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const settings = await getEmailSettings();

    if (!settings) {
      return {
        success: false,
        message: 'No se pudo obtener la configuración de email'
      };
    }

    if (!settings.emailEnabled) {
      return {
        success: false,
        message: 'Los emails están deshabilitados en la configuración'
      };
    }

    if (!settings.sendgridApiKey) {
      return {
        success: false,
        message: 'La API key de SendGrid no está configurada'
      };
    }

    if (!settings.fromEmail) {
      return {
        success: false,
        message: 'El email remitente no está configurado'
      };
    }

    // Intentar enviar un email de prueba
    const testEmailAddress = testEmail || settings.testEmailAddress || 'test@example.com';

    // Importar dinámicamente para evitar problemas de inicialización
    const { emailService } = await import('./emailService');

    const result = await emailService.sendEmail({
      to: testEmailAddress,
      subject: 'Prueba de configuración - Coworking Inmobiliario',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🧪 Email de Prueba</h2>
          <p>Este es un email de prueba para verificar la configuración de SendGrid.</p>
          <p><strong>Fecha de envío:</strong> ${new Date().toLocaleString('es-CO')}</p>
          <p>Si recibes este email, la configuración está funcionando correctamente.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Coworking Inmobiliario - Sistema de Email</p>
        </div>
      `
    });

    if (result.success) {
      return {
        success: true,
        message: `Email de prueba enviado exitosamente a ${testEmailAddress}`,
        details: {
          messageId: result.messageId,
          recipient: testEmailAddress
        }
      };
    } else {
      return {
        success: false,
        message: `Error al enviar email de prueba: ${result.error}`,
        details: result
      };
    }

  } catch (error: any) {
    console.error('❌ Error probando configuración de email:', error);
    return {
      success: false,
      message: `Error interno: ${error.message}`,
      details: error
    };
  }
}

/**
 * Obtener configuración por defecto para inicialización
 */
export function getDefaultEmailSettings(): EmailSettings {
  return {
    sendgridApiKey: '',
    fromEmail: 'noreply@coworkinginmobiliario.com',
    emailEnabled: false,
    portalCredentialsEnabled: true,
    appointmentConfirmationsEnabled: true,
    paymentRemindersEnabled: true,
    welcomeEmailsEnabled: true,
    testEmailAddress: ''
  };
}