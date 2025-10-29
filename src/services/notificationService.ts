import sgMail from '@sendgrid/mail';
import {
  Notification,
  NotificationChannel,
  NotificationProviderConfig
} from '../types/notifications';

export class NotificationService {
  private config: NotificationProviderConfig;

  constructor(config: NotificationProviderConfig) {
    this.config = config;

    // Initialize SendGrid if configured
    if (config.email?.provider === 'sendgrid' && config.email.api_key) {
      sgMail.setApiKey(config.email.api_key);
    }
  }

  /**
   * Send notification through specified channels
   */
  async sendNotification(notification: Notification): Promise<{
    success: boolean;
    results: Record<NotificationChannel, { success: boolean; error?: string; messageId?: string }>;
  }> {
    const results: Record<NotificationChannel, { success: boolean; error?: string; messageId?: string }> = {
      email: { success: false },
      whatsapp: { success: false },
      sms: { success: false },
      push: { success: false },
      in_app: { success: false }
    };

    let overallSuccess = false;

    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case 'email':
            results.email = await this.sendEmail(notification);
            break;
          case 'whatsapp':
            results.whatsapp = await this.sendWhatsApp(notification);
            break;
          case 'sms':
            results.sms = await this.sendSMS(notification);
            break;
          case 'push':
            results.push = await this.sendPush(notification);
            break;
          case 'in_app':
            results.in_app = await this.sendInApp(notification);
            break;
        }

        if (results[channel].success) {
          overallSuccess = true;
        }
      } catch (error) {
        console.error(`Error sending ${channel} notification:`, error);
        results[channel] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return {
      success: overallSuccess,
      results
    };
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: Notification): Promise<{ success: boolean; error?: string; messageId?: string }> {
    if (!this.config.email || !notification.recipient_email) {
      return { success: false, error: 'Email not configured or recipient email missing' };
    }

    try {
      const msg = {
        to: notification.recipient_email,
        from: {
          email: this.config.email.from_email,
          name: this.config.email.from_name
        },
        subject: notification.subject || 'Notificación',
        html: this.formatMessage(notification.message),
        reply_to: this.config.email.reply_to
      };

      const result = await sgMail.send(msg);

      return {
        success: true,
        messageId: result[0]?.headers?.['x-message-id'] as string
      };
    } catch (error) {
      console.error('SendGrid error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SendGrid error'
      };
    }
  }

  /**
   * Send WhatsApp notification
   */
  private async sendWhatsApp(notification: Notification): Promise<{ success: boolean; error?: string; messageId?: string }> {
    if (!this.config.whatsapp || !notification.recipient_phone) {
      return { success: false, error: 'WhatsApp not configured or recipient phone missing' };
    }

    try {
      // For now, we'll simulate WhatsApp sending
      // In production, integrate with Twilio, 360Dialog, or MessageBird
      console.log('Sending WhatsApp message to:', notification.recipient_phone);
      console.log('Message:', notification.message);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        messageId: `whatsapp_${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'WhatsApp error'
      };
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(notification: Notification): Promise<{ success: boolean; error?: string; messageId?: string }> {
    if (!this.config.sms || !notification.recipient_phone) {
      return { success: false, error: 'SMS not configured or recipient phone missing' };
    }

    try {
      // For now, we'll simulate SMS sending
      // In production, integrate with Twilio, AWS SNS, or MessageBird
      console.log('Sending SMS to:', notification.recipient_phone);
      console.log('Message:', notification.message);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        messageId: `sms_${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SMS error'
      };
    }
  }

  /**
   * Send push notification
   */
  private async sendPush(notification: Notification): Promise<{ success: boolean; error?: string; messageId?: string }> {
    if (!this.config.push) {
      return { success: false, error: 'Push notifications not configured' };
    }

    try {
      // For now, we'll simulate push notification sending
      // In production, integrate with Firebase, OneSignal, or Expo
      console.log('Sending push notification');
      console.log('Title:', notification.subject);
      console.log('Message:', notification.message);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        success: true,
        messageId: `push_${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Push notification error'
      };
    }
  }

  /**
   * Send in-app notification
   */
  private async sendInApp(notification: Notification): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      // For in-app notifications, we would typically store in database
      // and show through the UI. For now, we'll simulate this.
      console.log('Storing in-app notification for user:', notification.recipient_id);
      console.log('Message:', notification.message);

      return {
        success: true,
        messageId: `in_app_${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'In-app notification error'
      };
    }
  }

  /**
   * Format message with basic HTML for emails
   */
  private formatMessage(message: string): string {
    return message
      .replace(/\n/g, '<br>')
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
  }

  /**
   * Validate notification data
   */
  validateNotification(notification: Notification): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!notification.recipient_id) {
      errors.push('Recipient ID is required');
    }

    if (!notification.message) {
      errors.push('Message is required');
    }

    if (!notification.channels || notification.channels.length === 0) {
      errors.push('At least one channel must be specified');
    }

    // Validate channel-specific requirements
    if (notification.channels.includes('email') && !notification.recipient_email) {
      errors.push('Email address is required for email notifications');
    }

    if ((notification.channels.includes('whatsapp') || notification.channels.includes('sms')) && !notification.recipient_phone) {
      errors.push('Phone number is required for WhatsApp/SMS notifications');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Factory function to create notification service
export function createNotificationService(config: NotificationProviderConfig): NotificationService {
  return new NotificationService(config);
}

// Default configuration (should be loaded from environment)
export const defaultNotificationConfig: NotificationProviderConfig = {
  email: {
    provider: 'sendgrid',
    api_key: import.meta.env.VITE_SENDGRID_API_KEY || '',
    from_email: import.meta.env.VITE_FROM_EMAIL || 'noreply@coworking.com',
    from_name: 'CoWorking'
  },
  whatsapp: {
    provider: 'twilio',
    account_sid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
    auth_token: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
    phone_number: import.meta.env.VITE_TWILIO_PHONE_NUMBER || ''
  },
  sms: {
    provider: 'twilio',
    account_sid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
    auth_token: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
    phone_number: import.meta.env.VITE_TWILIO_PHONE_NUMBER || ''
  },
  push: {
    provider: 'firebase',
    server_key: import.meta.env.VITE_FIREBASE_SERVER_KEY || '',
    project_id: import.meta.env.VITE_FIREBASE_PROJECT_ID || ''
  }
};