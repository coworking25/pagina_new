/**
 * BIBLIOTECA DE NOTIFICACIONES PARA ADMIN
 * Similar al sistema del Portal de Clientes pero adaptado para usuarios admin
 */

import { supabase } from './supabase';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export type AdminNotificationType =
  | 'new_appointment'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'new_client'
  | 'payment_received'
  | 'payment_overdue'
  | 'contract_expiring'
  | 'contract_expired'
  | 'new_property'
  | 'property_inactive'
  | 'new_inquiry'
  | 'system_alert'
  | 'task_assigned';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface AdminNotification {
  id: string;
  user_id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  related_appointment_id?: string | null;
  related_client_id?: string | null;
  related_property_id?: number | null;
  related_payment_id?: string | null;
  related_contract_id?: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  priority: NotificationPriority;
  created_at: string;
  read_at?: string | null;
  dismissed_at?: string | null;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  high_priority: number;
}

// =====================================================
// FUNCIONES DE API
// =====================================================

/**
 * Obtener notificaciones del administrador actual
 */
export async function getAdminNotifications(
  userId: string,
  onlyUnread: boolean = false,
  limit: number = 50
): Promise<AdminNotification[]> {
  try {
    let query = supabase
      .from('admin_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (onlyUnread) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching admin notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAdminNotifications:', error);
    return [];
  }
}

/**
 * Obtener contadores de notificaciones
 */
export async function getNotificationCounts(userId: string): Promise<NotificationCounts> {
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('is_read, priority')
      .eq('user_id', userId)
      .eq('is_dismissed', false);

    if (error) {
      console.error('Error fetching notification counts:', error);
      return { total: 0, unread: 0, high_priority: 0 };
    }

    const total = data?.length || 0;
    const unread = data?.filter((n: any) => !n.is_read).length || 0;
    const high_priority = data?.filter((n: any) => 
      (n.priority === 'high' || n.priority === 'urgent') && !n.is_read
    ).length || 0;

    return { total, unread, high_priority };
  } catch (error) {
    console.error('Error in getNotificationCounts:', error);
    return { total: 0, unread: 0, high_priority: 0 };
  }
}

/**
 * Marcar una notificación como leída
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('mark_admin_notification_as_read', {
      p_notification_id: notificationId
    });

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return false;
  }
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('mark_all_admin_notifications_as_read', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return 0;
  }
}

/**
 * Descartar una notificación (ocultar permanentemente)
 */
export async function dismissNotification(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('dismiss_admin_notification', {
      p_notification_id: notificationId
    });

    if (error) {
      console.error('Error dismissing notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in dismissNotification:', error);
    return false;
  }
}

/**
 * Crear una notificación (solo para testing o acciones manuales)
 */
export async function createNotification(
  userId: string,
  type: AdminNotificationType,
  title: string,
  message: string,
  relatedIds?: {
    appointmentId?: string;
    clientId?: string;
    propertyId?: number;
    paymentId?: string;
    contractId?: string;
  },
  priority: NotificationPriority = 'normal'
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('create_admin_notification', {
      p_user_id: userId,
      p_type: type,
      p_title: title,
      p_message: message,
      p_related_appointment_id: relatedIds?.appointmentId || null,
      p_related_client_id: relatedIds?.clientId || null,
      p_related_property_id: relatedIds?.propertyId || null,
      p_related_payment_id: relatedIds?.paymentId || null,
      p_related_contract_id: relatedIds?.contractId || null,
      p_priority: priority
    });

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createNotification:', error);
    return null;
  }
}

/**
 * Suscribirse a notificaciones en tiempo real
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: AdminNotification) => void
): () => void {
  const channel = supabase
    .channel(`admin_notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload: any) => {
        callback(payload.new as AdminNotification);
      }
    )
    .subscribe();

  // Función de cleanup
  return () => {
    supabase.removeChannel(channel);
  };
}

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Obtener emoji según el tipo de notificación
 */
export function getNotificationEmoji(type: AdminNotificationType): string {
  const emojiMap: Record<AdminNotificationType, string> = {
    new_appointment: '📅',
    appointment_cancelled: '❌',
    appointment_rescheduled: '🔄',
    new_client: '👤',
    payment_received: '💰',
    payment_overdue: '⚠️',
    contract_expiring: '📋',
    contract_expired: '🔴',
    new_property: '🏠',
    property_inactive: '🔕',
    new_inquiry: '💬',
    system_alert: '🔔',
    task_assigned: '📝'
  };
  
  return emojiMap[type] || '🔔';
}

/**
 * Obtener color según prioridad
 */
export function getNotificationColor(priority: NotificationPriority): string {
  const colorMap: Record<NotificationPriority, string> = {
    low: 'text-gray-600 dark:text-gray-400',
    normal: 'text-blue-600 dark:text-blue-400',
    high: 'text-orange-600 dark:text-orange-400',
    urgent: 'text-red-600 dark:text-red-400'
  };
  
  return colorMap[priority];
}

/**
 * Obtener color de fondo según prioridad
 */
export function getNotificationBgColor(priority: NotificationPriority): string {
  const bgColorMap: Record<NotificationPriority, string> = {
    low: 'bg-gray-50 dark:bg-gray-800',
    normal: 'bg-blue-50 dark:bg-blue-900/20',
    high: 'bg-orange-50 dark:bg-orange-900/20',
    urgent: 'bg-red-50 dark:bg-red-900/20'
  };
  
  return bgColorMap[priority];
}

/**
 * Formatear tiempo relativo (ej: "Hace 5 minutos")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Ahora mismo';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Hace ${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Ayer';
  }
  if (diffInDays < 7) {
    return `Hace ${diffInDays} días`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks === 1) {
    return 'Hace 1 semana';
  }
  if (diffInWeeks < 4) {
    return `Hace ${diffInWeeks} semanas`;
  }

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  });
}

/**
 * Reproducir sonido de notificación
 */
export function playNotificationSound(): void {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch((error) => {
      console.warn('Could not play notification sound:', error);
    });
  } catch (error) {
    console.warn('Error playing notification sound:', error);
  }
}

/**
 * Obtener ruta de navegación según tipo de notificación
 */
export function getNotificationRoute(notification: AdminNotification): string {
  switch (notification.type) {
    case 'new_appointment':
    case 'appointment_cancelled':
    case 'appointment_rescheduled':
      return '/admin/appointments';
    
    case 'new_client':
      return '/admin/clients';
    
    case 'payment_received':
    case 'payment_overdue':
      return '/admin/clients'; // Tab de pagos
    
    case 'contract_expiring':
    case 'contract_expired':
      return '/admin/clients'; // Tab de contratos
    
    case 'new_property':
    case 'property_inactive':
      return '/admin/properties';
    
    case 'new_inquiry':
      return '/admin/service-inquiries';
    
    case 'system_alert':
    case 'task_assigned':
      return '/admin/dashboard';
    
    default:
      return '/admin/dashboard';
  }
}
