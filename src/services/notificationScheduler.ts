import { supabase } from '../lib/supabase';
import { reminderService } from './reminderService';

export class NotificationScheduler {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    // Constructor without parameters
  }

  /**
   * Start the scheduler
   */
  start(intervalMinutes: number = 5): void {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    console.log(`Starting notification scheduler with ${intervalMinutes} minute intervals`);
    this.isRunning = true;

    // Run immediately on start
    this.processPendingTasks();

    // Set up recurring interval
    this.intervalId = setInterval(() => {
      this.processPendingTasks();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Notification scheduler stopped');
  }

  /**
   * Process all pending scheduled tasks
   */
  private async processPendingTasks(): Promise<void> {
    try {
      console.log('Processing pending notification tasks...');

      // Process pending notifications
      await reminderService.processPendingNotifications();

      // Process other scheduled tasks (reminders, follow-ups, etc.)
      await this.processScheduledReminders();
      await this.processOverduePayments();
      await this.processExpiringContracts();
      await this.processFollowUps();

      // Clean up old notifications
      await this.cleanupOldNotifications();

      console.log('Finished processing pending tasks');
    } catch (error) {
      console.error('Error processing pending tasks:', error);
    }
  }

  /**
   * Process scheduled reminders for appointments
   */
  private async processScheduledReminders(): Promise<void> {
    try {
      const now = new Date();

      // Find appointments that need reminders
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          client_name,
          client_email,
          client_phone,
          property_id,
          advisor_id,
          appointment_type,
          status
        `)
        .eq('status', 'confirmed')
        .gte('appointment_date', now.toISOString())
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments for reminders:', error);
        return;
      }

      if (!appointments || appointments.length === 0) {
        return;
      }

      // Process each appointment
      for (const appointment of appointments) {
        // Cast to PropertyAppointment with required fields
        const fullAppointment = {
          ...appointment,
          visit_type: 'presencial' as const,
          attendees: 1,
          contact_method: 'whatsapp' as const,
          marketing_consent: false
        };
        await reminderService.scheduleAppointmentReminders(fullAppointment);
      }

    } catch (error) {
      console.error('Error processing scheduled reminders:', error);
    }
  }

  /**
   * Process overdue payment notifications
   */
  private async processOverduePayments(): Promise<void> {
    try {
      const now = new Date();

      // Find overdue payments
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          id,
          client_id,
          contract_id,
          amount,
          due_date,
          status
        `)
        .eq('status', 'pending')
        .lt('due_date', now.toISOString());

      if (error) {
        console.error('Error fetching overdue payments:', error);
        return;
      }

      if (!payments || payments.length === 0) {
        return;
      }

      // Create notifications for overdue payments
      for (const payment of payments) {
        await this.createPaymentNotification(payment, 'payment_due');
      }

    } catch (error) {
      console.error('Error processing overdue payments:', error);
    }
  }

  /**
   * Process expiring contract notifications
   */
  private async processExpiringContracts(): Promise<void> {
    try {
      const now = new Date();
      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(now.getDate() + 60);

      // Find contracts expiring soon
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select(`
          id,
          client_id,
          contract_type,
          end_date,
          status
        `)
        .eq('status', 'active')
        .gte('end_date', now.toISOString())
        .lte('end_date', sixtyDaysFromNow.toISOString());

      if (error) {
        console.error('Error fetching expiring contracts:', error);
        return;
      }

      if (!contracts || contracts.length === 0) {
        return;
      }

      // Create notifications for expiring contracts
      for (const contract of contracts) {
        await this.createContractNotification(contract, 'contract_expiring');
      }

    } catch (error) {
      console.error('Error processing expiring contracts:', error);
    }
  }

  /**
   * Process follow-up notifications
   */
  private async processFollowUps(): Promise<void> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Find completed appointments that need follow-up
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          client_name,
          client_email,
          client_phone,
          appointment_date,
          status,
          follow_up_notes
        `)
        .eq('status', 'completed')
        .lt('appointment_date', sevenDaysAgo.toISOString())
        .is('follow_up_notes', null); // No follow-up done yet

      if (error) {
        console.error('Error fetching appointments for follow-up:', error);
        return;
      }

      if (!appointments || appointments.length === 0) {
        return;
      }

      // Create follow-up notifications
      for (const appointment of appointments) {
        await this.createFollowUpNotification(appointment);
      }

    } catch (error) {
      console.error('Error processing follow-ups:', error);
    }
  }

  /**
   * Create payment-related notification
   */
  private async createPaymentNotification(payment: any, type: 'payment_due' | 'payment_overdue'): Promise<void> {
    try {
      // Check if notification already exists
      const { data: existing, error: checkError } = await supabase
        .from('notifications')
        .select('id')
        .eq('type', type)
        .eq('payment_id', payment.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing payment notification:', checkError);
        return;
      }

      if (existing) return; // Already exists

      // Get client info
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id, full_name, email, phone')
        .eq('id', payment.client_id)
        .single();

      if (clientError || !client) {
        console.error('Error fetching client for payment notification:', clientError);
        return;
      }

      // Create notification
      const notification = {
        type,
        priority: type === 'payment_overdue' ? 'urgent' : 'high',
        status: 'pending',
        recipient_id: client.id,
        recipient_type: 'client',
        recipient_email: client.email,
        recipient_phone: client.phone,
        message: this.buildPaymentMessage(type, payment),
        channels: ['email', 'whatsapp'],
        scheduled_at: new Date().toISOString(),
        payment_id: payment.id,
        retry_count: 0,
        max_retries: 3
      };

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notification);

      if (insertError) {
        console.error('Error creating payment notification:', insertError);
      }

    } catch (error) {
      console.error('Error creating payment notification:', error);
    }
  }

  /**
   * Create contract-related notification
   */
  private async createContractNotification(contract: any, type: 'contract_expiring' | 'contract_expired'): Promise<void> {
    try {
      // Check if notification already exists
      const { data: existing, error: checkError } = await supabase
        .from('notifications')
        .select('id')
        .eq('type', type)
        .eq('contract_id', contract.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing contract notification:', checkError);
        return;
      }

      if (existing) return; // Already exists

      // Get client info
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id, full_name, email, phone')
        .eq('id', contract.client_id)
        .single();

      if (clientError || !client) {
        console.error('Error fetching client for contract notification:', clientError);
        return;
      }

      // Create notification
      const notification = {
        type,
        priority: 'high',
        status: 'pending',
        recipient_id: client.id,
        recipient_type: 'client',
        recipient_email: client.email,
        recipient_phone: client.phone,
        message: this.buildContractMessage(type, contract),
        channels: ['email', 'whatsapp'],
        scheduled_at: new Date().toISOString(),
        contract_id: contract.id,
        retry_count: 0,
        max_retries: 3
      };

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notification);

      if (insertError) {
        console.error('Error creating contract notification:', insertError);
      }

    } catch (error) {
      console.error('Error creating contract notification:', error);
    }
  }

  /**
   * Create follow-up notification
   */
  private async createFollowUpNotification(appointment: any): Promise<void> {
    try {
      // Check if notification already exists
      const { data: existing, error: checkError } = await supabase
        .from('notifications')
        .select('id')
        .eq('type', 'follow_up')
        .eq('appointment_id', appointment.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing follow-up notification:', checkError);
        return;
      }

      if (existing) return; // Already exists

      // Create notification
      const notification = {
        type: 'follow_up',
        priority: 'normal',
        status: 'pending',
        recipient_id: `client_${appointment.client_email}`, // Generate ID
        recipient_type: 'client',
        recipient_email: appointment.client_email,
        recipient_phone: appointment.client_phone,
        message: this.buildFollowUpMessage(appointment),
        channels: ['email', 'whatsapp'],
        scheduled_at: new Date().toISOString(),
        appointment_id: appointment.id,
        retry_count: 0,
        max_retries: 3
      };

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notification);

      if (insertError) {
        console.error('Error creating follow-up notification:', insertError);
      }

    } catch (error) {
      console.error('Error creating follow-up notification:', error);
    }
  }

  /**
   * Clean up old notifications and logs
   */
  private async cleanupOldNotifications(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Delete old notifications
      const { error: notificationError } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .in('status', ['sent', 'delivered', 'cancelled']);

      if (notificationError) {
        console.error('Error cleaning up old notifications:', notificationError);
      }

      // Delete old notification logs
      const { error: logError } = await supabase
        .from('notification_logs')
        .delete()
        .lt('sent_at', thirtyDaysAgo.toISOString());

      if (logError) {
        console.error('Error cleaning up old notification logs:', logError);
      }

    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Build payment notification message
   */
  private buildPaymentMessage(type: string, payment: any): string {
    const amount = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(payment.amount);

    const dueDate = new Date(payment.due_date).toLocaleDateString('es-CO');

    if (type === 'payment_due') {
      return `Recordatorio de pago pendiente

Tienes un pago pendiente por ${amount} con fecha límite ${dueDate}.

Por favor, realiza el pago correspondiente para evitar inconvenientes.

Equipo de CoWorking`;
    } else {
      return `Pago vencido

Tienes un pago vencido por ${amount} que debía pagarse el ${dueDate}.

Por favor, contacta con nosotros para regularizar la situación.

Equipo de CoWorking`;
    }
  }

  /**
   * Build contract notification message
   */
  private buildContractMessage(type: string, contract: any): string {
    const endDate = new Date(contract.end_date).toLocaleDateString('es-CO');

    if (type === 'contract_expiring') {
      return `Contrato próximo a vencer

Tu contrato de ${contract.contract_type} vence el ${endDate}.

Por favor, contacta con nosotros si deseas renovar o hacer algún cambio.

Equipo de CoWorking`;
    } else {
      return `Contrato vencido

Tu contrato de ${contract.contract_type} venció el ${endDate}.

Por favor, contacta con nosotros para regularizar la situación.

Equipo de CoWorking`;
    }
  }

  /**
   * Build follow-up message
   */
  private buildFollowUpMessage(appointment: any): string {
    return `Seguimiento post-cita

Hola ${appointment.client_name},

Esperamos que la cita del ${new Date(appointment.appointment_date).toLocaleDateString('es-CO')} haya sido de tu agrado.

¿Hay algo en lo que podamos ayudarte? ¿Necesitas más información sobre propiedades o servicios?

Estamos aquí para servirte.

Equipo de CoWorking`;
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; nextRun?: Date } {
    return {
      isRunning: this.isRunning,
      nextRun: this.intervalId ? new Date(Date.now() + 5 * 60 * 1000) : undefined // Assuming 5 minute intervals
    };
  }
}

// Export singleton instance
export const notificationScheduler = new NotificationScheduler();