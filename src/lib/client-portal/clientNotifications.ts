import { supabase } from '../supabase';

export type NotificationType = 
  | 'payment_due'
  | 'payment_overdue'
  | 'contract_expiring'
  | 'new_document'
  | 'admin_message'
  | 'payment_received'
  | 'maintenance_scheduled';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ClientNotification {
  id: string;
  client_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_payment_id?: string | null;
  related_contract_id?: string | null;
  related_document_id?: string | null;
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

// ==========================================
// OBTENER NOTIFICACIONES DEL CLIENTE
// ==========================================

/**
 * Obtiene todas las notificaciones de un cliente
 * @param clientId - ID del cliente
 * @param onlyUnread - Si es true, solo devuelve notificaciones no leídas
 * @param limit - Límite de resultados (default: 50)
 */
export async function getClientNotifications(
  clientId: string,
  onlyUnread: boolean = false,
  limit: number = 50
): Promise<ClientNotification[]> {
  try {
    let query = supabase
      .from('client_notifications')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (onlyUnread) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error al obtener notificaciones:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error en getClientNotifications:', error);
    return [];
  }
}

// ==========================================
// CONTAR NOTIFICACIONES
// ==========================================

/**
 * Obtiene el conteo de notificaciones de un cliente
 */
export async function getNotificationCounts(clientId: string): Promise<NotificationCounts> {
  try {
    const { data, error } = await supabase
      .from('client_notifications')
      .select('id, is_read, priority')
      .eq('client_id', clientId)
      .eq('is_dismissed', false);

    if (error) {
      console.error('❌ Error al contar notificaciones:', error);
      throw error;
    }

    const notifications = data || [];
    
    return {
      total: notifications.length,
      unread: notifications.filter((n: any) => !n.is_read).length,
      high_priority: notifications.filter((n: any) => n.priority === 'high' || n.priority === 'urgent').length
    };
  } catch (error) {
    console.error('❌ Error en getNotificationCounts:', error);
    return { total: 0, unread: 0, high_priority: 0 };
  }
}

// ==========================================
// MARCAR COMO LEÍDA
// ==========================================

/**
 * Marca una notificación como leída
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('mark_notification_as_read', {
      p_notification_id: notificationId
    });

    if (error) {
      console.error('❌ Error al marcar notificación como leída:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error en markNotificationAsRead:', error);
    return false;
  }
}

// ==========================================
// MARCAR TODAS COMO LEÍDAS
// ==========================================

/**
 * Marca todas las notificaciones de un cliente como leídas
 */
export async function markAllNotificationsAsRead(clientId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('mark_all_notifications_as_read', {
      p_client_id: clientId
    });

    if (error) {
      console.error('❌ Error al marcar todas como leídas:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('❌ Error en markAllNotificationsAsRead:', error);
    return 0;
  }
}

// ==========================================
// DESCARTAR NOTIFICACIÓN
// ==========================================

/**
 * Descarta una notificación (la oculta de la lista)
 */
export async function dismissNotification(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('dismiss_notification', {
      p_notification_id: notificationId
    });

    if (error) {
      console.error('❌ Error al descartar notificación:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error en dismissNotification:', error);
    return false;
  }
}

// ==========================================
// CREAR NOTIFICACIÓN (Admin)
// ==========================================

/**
 * Crea una nueva notificación para un cliente (solo admins)
 */
export async function createNotification(
  clientId: string,
  type: NotificationType,
  title: string,
  message: string,
  priority: NotificationPriority = 'normal',
  relatedPaymentId?: string,
  relatedContractId?: string,
  relatedDocumentId?: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('create_client_notification', {
      p_client_id: clientId,
      p_type: type,
      p_title: title,
      p_message: message,
      p_related_payment_id: relatedPaymentId || null,
      p_related_contract_id: relatedContractId || null,
      p_related_document_id: relatedDocumentId || null,
      p_priority: priority
    });

    if (error) {
      console.error('❌ Error al crear notificación:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error en createNotification:', error);
    return null;
  }
}

// ==========================================
// SUSCRIBIRSE A NOTIFICACIONES EN TIEMPO REAL
// ==========================================

/**
 * Se suscribe a cambios en tiempo real de las notificaciones de un cliente
 * Devuelve una función para cancelar la suscripción
 */
export function subscribeToNotifications(
  clientId: string,
  callback: (notification: ClientNotification) => void
): () => void {
  const channel = supabase
    .channel(`notifications:${clientId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'client_notifications',
        filter: `client_id=eq.${clientId}`
      },
      (payload: any) => {
        console.log('🔔 Nueva notificación recibida:', payload);
        callback(payload.new as ClientNotification);
      }
    )
    .subscribe();

  // Retornar función para desuscribirse
  return () => {
    supabase.removeChannel(channel);
  };
}

// ==========================================
// UTILIDADES
// ==========================================

/**
 * Obtiene el emoji correspondiente al tipo de notificación
 */
export function getNotificationEmoji(type: NotificationType): string {
  const emojiMap: Record<NotificationType, string> = {
    payment_due: '⏰',
    payment_overdue: '🔴',
    contract_expiring: '📋',
    new_document: '📄',
    admin_message: '💬',
    payment_received: '✅',
    maintenance_scheduled: '🔧'
  };
  return emojiMap[type] || '🔔';
}

/**
 * Obtiene el color correspondiente a la prioridad
 */
export function getNotificationColor(priority: NotificationPriority): string {
  const colorMap: Record<NotificationPriority, string> = {
    low: 'text-gray-500',
    normal: 'text-blue-500',
    high: 'text-orange-500',
    urgent: 'text-red-500'
  };
  return colorMap[priority];
}

/**
 * Obtiene el color de fondo correspondiente a la prioridad
 */
export function getNotificationBgColor(priority: NotificationPriority): string {
  const colorMap: Record<NotificationPriority, string> = {
    low: 'bg-gray-50 dark:bg-gray-800',
    normal: 'bg-blue-50 dark:bg-blue-900/20',
    high: 'bg-orange-50 dark:bg-orange-900/20',
    urgent: 'bg-red-50 dark:bg-red-900/20'
  };
  return colorMap[priority];
}

/**
 * Formatea el tiempo relativo (ej: "hace 5 minutos")
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
  if (diffInWeeks < 4) {
    return `Hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
  }

  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/**
 * Reproduce un sonido de notificación (opcional)
 */
export function playNotificationSound(): void {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Ignorar errores si el sonido no está disponible
    });
  } catch (error) {
    // Ignorar errores de audio
  }
}
