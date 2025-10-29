import { supabase } from '../lib/supabase';
import { NotificationService, createNotificationService, defaultNotificationConfig } from './notificationService';
import {
  Notification,
  NotificationType,
  NotificationChannel,
  ReminderRule,
  PropertyAppointment
} from '../types';
import { format, addMinutes, parseISO, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

export class ReminderService {
  private notificationService: NotificationService;

  constructor(notificationService?: NotificationService) {
    this.notificationService = notificationService || createNotificationService(defaultNotificationConfig);
  }

  /**
   * Schedule reminders for an appointment
   */
  async scheduleAppointmentReminders(appointment: PropertyAppointment): Promise<void> {
    try {
      // Get active reminder rules for appointments
      const { data: rules, error } = await supabase
        .from('reminder_rules')
        .select('*')
        .eq('entity_type', 'appointment')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching reminder rules:', error);
        return;
      }

      if (!rules || rules.length === 0) {
        console.log('No active reminder rules found');
        return;
      }

      // Get client information (we'll use the appointment data directly since it contains client info)
      const client = {
        id: `client_${appointment.client_email}`, // Generate a temporary ID
        full_name: appointment.client_name,
        email: appointment.client_email,
        phone: appointment.client_phone
      };

      // Get advisor information
      const { data: advisor, error: advisorError } = await supabase
        .from('advisors')
        .select('id, name, email, phone')
        .eq('id', appointment.advisor_id)
        .single();

      if (advisorError || !advisor) {
        console.error('Error fetching advisor:', advisorError);
        return;
      }

      // Get property information
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id, title, code')
        .eq('id', appointment.property_id)
        .single();

      if (propertyError || !property) {
        console.error('Error fetching property:', propertyError);
        return;
      }

      // Schedule reminders for each rule
      for (const rule of rules) {
        await this.scheduleReminderForRule(
          rule,
          appointment,
          client,
          advisor,
          property
        );
      }

    } catch (error) {
      console.error('Error scheduling appointment reminders:', error);
    }
  }

  private async scheduleReminderForRule(
    rule: ReminderRule,
    appointment: PropertyAppointment,
    client: any,
    advisor: any,
    property: any
  ): Promise<void> {
    try {
      // Calculate reminder date based on timing_minutes
      const appointmentDate = parseISO(appointment.appointment_date);
      const reminderDate = addMinutes(appointmentDate, -(rule as any).timing_minutes);

      // Don't schedule reminders for past dates
      if (isBefore(reminderDate, new Date())) {
        return;
      }

      // Check if reminder already exists
      const { data: existingReminder, error: checkError } = await supabase
        .from('notifications')
        .select('id')
        .eq('appointment_id', appointment.id)
        .eq('type', rule.type)
        .eq('scheduled_at', reminderDate.toISOString())
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing reminder:', checkError);
        return;
      }

      if (existingReminder) {
        console.log('Reminder already exists for this appointment and timing');
        return;
      }

      // Create notification
      const notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'> = {
        type: rule.type,
        priority: rule.priority || 'normal',
        status: 'pending',
        recipient_id: client.id,
        recipient_type: 'client',
        recipient_email: client.email,
        recipient_phone: client.phone,
        message: this.buildReminderMessage(rule, appointment, client, advisor, property),
        channels: rule.channels,
        appointment_id: appointment.id,
        scheduled_at: reminderDate.toISOString(),
        retry_count: 0,
        max_retries: 3,
        metadata: {
          appointment_type: appointment.appointment_type,
          property_title: property.title,
          advisor_name: advisor.name,
          client_name: client.full_name
        }
      };

      // Add subject for email notifications
      if (rule.channels.includes('email')) {
        notification.subject = this.buildReminderSubject(rule.type);
      }

      // Insert notification into database
      const { data: insertedNotification, error: insertError } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting reminder notification:', insertError);
        return;
      }

      console.log('Reminder scheduled successfully:', insertedNotification.id);

    } catch (error) {
      console.error('Error scheduling reminder for rule:', error);
    }
  }

  /**
   * Process pending notifications (called by scheduler)
   */
  async processPendingNotifications(): Promise<void> {
    try {
      const now = new Date();

      // Get pending notifications that are due
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_at', now.toISOString())
        .limit(50); // Process in batches

      if (error) {
        console.error('Error fetching pending notifications:', error);
        return;
      }

      if (!notifications || notifications.length === 0) {
        return;
      }

      console.log(`Processing ${notifications.length} pending notifications`);

      for (const notification of notifications) {
        await this.processNotification(notification);
      }

    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }

  /**
   * Process a single notification
   */
  private async processNotification(notificationData: any): Promise<void> {
    try {
      const notification: Notification = {
        ...notificationData,
        channels: notificationData.channels as NotificationChannel[]
      };

      // Validate notification
      const validation = this.notificationService.validateNotification(notification);
      if (!validation.isValid) {
        console.error('Invalid notification:', validation.errors);
        await this.updateNotificationStatus(notification.id, 'failed', validation.errors.join(', '));
        return;
      }

      // Send notification
      const result = await this.notificationService.sendNotification(notification);

      if (result.success) {
        // Update status to sent
        await this.updateNotificationStatus(notification.id, 'sent');

        // Log successful sends
        for (const [channel, channelResult] of Object.entries(result.results)) {
          if (channelResult.success) {
            await this.logNotificationSend(
              notification.id,
              channel as NotificationChannel,
              'sent',
              channelResult.messageId
            );
          }
        }
      } else {
        // Handle failures
        const errors = Object.entries(result.results)
          .filter(([, channelResult]) => !channelResult.success)
          .map(([channel, channelResult]) => `${channel}: ${channelResult.error}`)
          .join('; ');

        // Increment retry count
        const newRetryCount = notification.retry_count + 1;

        if (newRetryCount >= notification.max_retries) {
          await this.updateNotificationStatus(notification.id, 'failed', errors);
        } else {
          // Schedule retry (exponential backoff)
          const retryDelay = Math.pow(2, newRetryCount) * 60 * 1000; // minutes
          const retryAt = new Date(Date.now() + retryDelay);

          await supabase
            .from('notifications')
            .update({
              retry_count: newRetryCount,
              scheduled_at: retryAt.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', notification.id);
        }
      }

    } catch (error) {
      console.error('Error processing notification:', error);
      await this.updateNotificationStatus(
        notificationData.id,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Update notification status
   */
  private async updateNotificationStatus(
    notificationId: string,
    status: Notification['status'],
    errorMessage?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'sent') {
      updateData.sent_at = new Date().toISOString();
    } else if (status === 'failed') {
      updateData.failed_at = new Date().toISOString();
      updateData.error_message = errorMessage;
    }

    const { error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', notificationId);

    if (error) {
      console.error('Error updating notification status:', error);
    }
  }

  /**
   * Log notification send
   */
  private async logNotificationSend(
    notificationId: string,
    channel: NotificationChannel,
    status: 'sent' | 'delivered' | 'failed',
    messageId?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_logs')
        .insert({
          notification_id: notificationId,
          channel,
          status,
          sent_at: new Date().toISOString(),
          ...(messageId && { provider_response: { messageId } })
        });

      if (error) {
        console.error('Error logging notification send:', error);
      }
    } catch (error) {
      console.error('Error logging notification send:', error);
    }
  }

  /**
   * Build reminder message with template variables
   */
  private buildReminderMessage(
    rule: ReminderRule,
    appointment: PropertyAppointment,
    client: any,
    advisor: any,
    property: any
  ): string {
    const appointmentDate = parseISO(appointment.appointment_date);
    const formattedDate = format(appointmentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    const formattedTime = format(appointmentDate, 'HH:mm');

    let message = rule.template_id ? this.getTemplateMessage() : '';

    // If no template, use default message
    if (!message) {
      message = `Hola {{client_name}},

Te recordamos que tienes una cita programada para el {{appointment_date}} a las {{appointment_time}}.

Detalles de la cita:
- Propiedad: {{property_title}}
- Asesor: {{advisor_name}}
- Tipo: {{appointment_type}}

Si necesitas reprogramar o cancelar la cita, por favor contáctanos.

Atentamente,
Equipo de CoWorking`;
    }

    // Replace template variables
    return message
      .replace(/{{client_name}}/g, client.full_name)
      .replace(/{{appointment_date}}/g, formattedDate)
      .replace(/{{appointment_time}}/g, formattedTime)
      .replace(/{{property_title}}/g, property.title || property.code || 'N/A')
      .replace(/{{advisor_name}}/g, advisor.name)
      .replace(/{{appointment_type}}/g, appointment.appointment_type);
  }

  /**
   * Build reminder subject for emails
   */
  private buildReminderSubject(type: NotificationType): string {
    switch (type) {
      case 'appointment_reminder':
        return 'Recordatorio: Tienes una cita programada';
      case 'appointment_confirmation':
        return 'Confirmación de tu cita';
      case 'appointment_rescheduled':
        return 'Tu cita ha sido reprogramada';
      case 'appointment_cancelled':
        return 'Tu cita ha sido cancelada';
      default:
        return 'Notificación importante';
    }
  }

  /**
   * Get template message (placeholder - would fetch from database)
   */
  private getTemplateMessage(): string {
    // This would typically fetch from database
    // For now, return empty string to use default
    return '';
  }

  /**
   * Cancel reminders for an appointment
   */
  async cancelAppointmentReminders(appointmentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('appointment_id', appointmentId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error cancelling appointment reminders:', error);
      } else {
        console.log('Appointment reminders cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling appointment reminders:', error);
    }
  }
}

// Factory function to create reminder service
export function createReminderService(notificationService?: NotificationService): ReminderService {
  return new ReminderService(notificationService);
}

// Export singleton instance
export const reminderService = createReminderService();