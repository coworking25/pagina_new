// =====================================================
// TIPOS PARA SISTEMA DE NOTIFICACIONES - FASE 3
// =====================================================

export type NotificationType = 'appointment_reminder' | 'appointment_confirmation' | 'appointment_rescheduled' | 'appointment_cancelled' | 'payment_due' | 'contract_expiring' | 'follow_up' | 'marketing' | 'system_alert';

export type NotificationChannel = 'email' | 'whatsapp' | 'sms' | 'push' | 'in_app';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type ReminderTiming = '1_hour_before' | '24_hours_before' | '1_week_before' | 'custom';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject?: string; // Para emails
  message: string;
  channels: NotificationChannel[];
  variables: string[]; // Variables disponibles en el template (ej: {{client_name}}, {{appointment_date}})
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;

  // Destinatario
  recipient_id: string; // client_id o advisor_id
  recipient_type: 'client' | 'advisor' | 'admin';
  recipient_email?: string;
  recipient_phone?: string;

  // Contenido
  subject?: string;
  message: string;
  template_id?: string;

  // Canales de envío
  channels: NotificationChannel[];

  // Referencias a entidades relacionadas
  appointment_id?: string;
  property_id?: number;
  contract_id?: string;
  payment_id?: string;

  // Programación
  scheduled_at: string;
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;

  // Metadatos
  error_message?: string;
  retry_count: number;
  max_retries: number;

  // Información adicional
  metadata?: Record<string, any>; // Datos adicionales para personalización

  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  user_type: 'client' | 'advisor' | 'admin';

  // Preferencias generales
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;

  // Preferencias específicas por tipo
  appointment_reminders: boolean;
  payment_notifications: boolean;
  contract_notifications: boolean;
  marketing_emails: boolean;
  system_alerts: boolean;

  // Configuración de timing
  reminder_timings: ReminderTiming[];

  // Horarios permitidos para notificaciones
  quiet_hours_start?: string; // HH:MM format
  quiet_hours_end?: string;   // HH:MM format

  // Zona horaria
  timezone: string;

  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: string;
  notification_id: string;
  channel: NotificationChannel;
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  provider_response?: any; // Respuesta del proveedor (SendGrid, Twilio, etc.)
  error_message?: string;
  sent_at: string;
  delivered_at?: string;
  cost?: number; // Costo de envío si aplica
}

// =====================================================
// INTERFACES PARA CONFIGURACIÓN DE PROVEEDORES
// =====================================================

export interface EmailProviderConfig {
  provider: 'sendgrid' | 'aws_ses' | 'mailgun';
  api_key: string;
  from_email: string;
  from_name: string;
  reply_to?: string;
  templates?: Record<string, string>; // ID de templates por tipo
}

export interface WhatsAppProviderConfig {
  provider: 'twilio' | '360dialog' | 'messagebird';
  account_sid?: string; // Para Twilio
  auth_token?: string;  // Para Twilio
  phone_number: string; // Número de teléfono del negocio
  api_key?: string;     // Para otros proveedores
  templates?: Record<string, string>; // ID de templates por tipo
}

export interface SMSProviderConfig {
  provider: 'twilio' | 'aws_sns' | 'messagebird';
  account_sid?: string;
  auth_token?: string;
  phone_number: string;
  api_key?: string;
}

export interface PushProviderConfig {
  provider: 'firebase' | 'onesignal' | 'expo';
  server_key?: string;    // Para Firebase
  app_id?: string;        // Para OneSignal
  project_id?: string;    // Para Firebase
}

export interface NotificationProviderConfig {
  email?: EmailProviderConfig;
  whatsapp?: WhatsAppProviderConfig;
  sms?: SMSProviderConfig;
  push?: PushProviderConfig;
}

// =====================================================
// INTERFACES PARA SCHEDULER Y AUTOMATIZACIÓN
// =====================================================

export interface ScheduledTask {
  id: string;
  type: 'send_notification' | 'send_reminder' | 'check_overdue' | 'cleanup_old_notifications';
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduled_at: string;
  executed_at?: string;
  completed_at?: string;
  failed_at?: string;

  // Parámetros de la tarea
  params: Record<string, any>;

  // Resultados
  result?: any;
  error_message?: string;

  // Reintentos
  retry_count: number;
  max_retries: number;

  created_at: string;
  updated_at: string;
}

export interface ReminderRule {
  id: string;
  name: string;
  type: NotificationType;
  entity_type: 'appointment' | 'payment' | 'contract';
  timing: ReminderTiming;
  custom_hours_before?: number; // Para timing 'custom'
  is_active: boolean;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  template_id: string;

  // Condiciones adicionales
  conditions?: {
    appointment_type?: string[];
    payment_status?: string[];
    contract_status?: string[];
  };

  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFACES PARA DASHBOARD DE NOTIFICACIONES
// =====================================================

export interface NotificationStats {
  total_sent_today: number;
  total_sent_this_week: number;
  total_sent_this_month: number;
  delivery_rate: number; // porcentaje
  failure_rate: number;  // porcentaje
  avg_response_time: number; // en minutos
  cost_this_month: number;
}

export interface NotificationAnalytics {
  by_type: Record<NotificationType, number>;
  by_channel: Record<NotificationChannel, number>;
  by_status: Record<NotificationStatus, number>;
  by_hour: Record<string, number>; // HH:00 format
  by_day: Record<string, number>;  // YYYY-MM-DD format
}

// =====================================================
// INTERFACES PARA FORMULARIOS
// =====================================================

export interface NotificationPreferencesForm {
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  appointment_reminders: boolean;
  payment_notifications: boolean;
  contract_notifications: boolean;
  marketing_emails: boolean;
  system_alerts: boolean;
  reminder_timings: ReminderTiming[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
}

export interface NotificationTemplateForm {
  name: string;
  type: NotificationType;
  subject?: string;
  message: string;
  channels: NotificationChannel[];
  variables: string[];
  is_active: boolean;
}

export interface SendNotificationForm {
  type: NotificationType;
  recipient_id: string;
  recipient_type: 'client' | 'advisor' | 'admin';
  channels: NotificationChannel[];
  subject?: string;
  message: string;
  scheduled_at: string;
  appointment_id?: string;
  property_id?: number;
  contract_id?: string;
  payment_id?: string;
  metadata?: Record<string, any>;
}

// =====================================================
// CONSTANTES Y CONFIGURACIONES
// =====================================================

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  appointment_reminder: 'Recordatorio de Cita',
  appointment_confirmation: 'Confirmación de Cita',
  appointment_rescheduled: 'Cita Reprogramada',
  appointment_cancelled: 'Cita Cancelada',
  payment_due: 'Pago Pendiente',
  contract_expiring: 'Contrato por Vencer',
  follow_up: 'Seguimiento',
  marketing: 'Marketing',
  system_alert: 'Alerta del Sistema'
};

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: 'Correo Electrónico',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  push: 'Notificación Push',
  in_app: 'En la App'
};

export const REMINDER_TIMING_LABELS: Record<ReminderTiming, string> = {
  '1_hour_before': '1 hora antes',
  '24_hours_before': '24 horas antes',
  '1_week_before': '1 semana antes',
  custom: 'Personalizado'
};

export const NOTIFICATION_PRIORITY_COLORS = {
  low: 'gray',
  normal: 'blue',
  high: 'orange',
  urgent: 'red'
} as const;

export const NOTIFICATION_STATUS_COLORS = {
  pending: 'yellow',
  sent: 'blue',
  delivered: 'green',
  failed: 'red',
  cancelled: 'gray'
} as const;

// Templates por defecto
export const DEFAULT_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'appointment_reminder_email',
    name: 'Recordatorio de Cita - Email',
    type: 'appointment_reminder',
    subject: 'Recordatorio: Tienes una cita programada',
    message: `Hola {{client_name}},

Te recordamos que tienes una cita programada para el {{appointment_date}} a las {{appointment_time}}.

Detalles de la cita:
- Propiedad: {{property_title}}
- Asesor: {{advisor_name}}
- Tipo: {{appointment_type}}

Si necesitas reprogramar o cancelar la cita, por favor contáctanos.

Atentamente,
Equipo de CoWorking`,
    channels: ['email'],
    variables: ['client_name', 'appointment_date', 'appointment_time', 'property_title', 'advisor_name', 'appointment_type'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'appointment_reminder_whatsapp',
    name: 'Recordatorio de Cita - WhatsApp',
    type: 'appointment_reminder',
    message: `🔔 *Recordatorio de Cita*

Hola {{client_name}},

Te recordamos que tienes una cita programada para el {{appointment_date}} a las {{appointment_time}}.

🏠 *Propiedad:* {{property_title}}
👨‍💼 *Asesor:* {{advisor_name}}
📅 *Tipo:* {{appointment_type}}

Si necesitas cambios, contáctanos.

_Equipo de CoWorking_`,
    channels: ['whatsapp'],
    variables: ['client_name', 'appointment_date', 'appointment_time', 'property_title', 'advisor_name', 'appointment_type'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];