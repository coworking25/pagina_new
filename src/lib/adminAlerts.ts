// ============================================
// ADMIN ALERTS API - Sistema de Alertas para Administradores
// ============================================

import { supabase } from './supabase';

// ============================================
// TIPOS Y INTERFACES
// ============================================

export type AdminAlertType = 
  | 'new_appointment'        // Nueva cita agendada
  | 'appointment_cancelled'  // Cita cancelada
  | 'new_client'            // Nuevo cliente registrado
  | 'payment_received'      // Pago recibido
  | 'payment_overdue'       // Pago vencido
  | 'contract_expiring'     // Contrato por vencer
  | 'new_inquiry'           // Nueva consulta de servicio
  | 'property_inactive'     // Propiedad inactiva
  | 'system_alert'          // Alerta del sistema
  | 'task_assigned';        // Tarea asignada

export type AlertSeverity = 'low' | 'medium' | 'high';

export interface AdminAlert {
  id: string;
  user_id: string;
  alert_type: AdminAlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  action_url?: string | null;
  related_appointment_id?: string | null;
  related_client_id?: string | null;
  related_property_id?: number | null;
  related_payment_id?: string | null;
  is_read: boolean;
  read_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminAlertCounts {
  total: number;
  unread: number;
  high_severity: number;
  medium_severity: number;
}

// ============================================
// FUNCIONES PRINCIPALES DE LA API
// ============================================

/**
 * Obtener todas las alertas de un administrador
 */
export async function getAdminAlerts(
  userId: string,
  onlyUnread: boolean = false,
  limit?: number
): Promise<AdminAlert[]> {
  try {
    let query = supabase
      .from('admin_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (onlyUnread) {
      query = query.eq('is_read', false);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener alertas:', error);
      return [];
    }

    // Filtrar alertas expiradas
    const now = new Date();
    return (data || []).filter(alert => {
      if (!alert.expires_at) return true;
      return new Date(alert.expires_at) > now;
    });
  } catch (error) {
    console.error('Error en getAdminAlerts:', error);
    return [];
  }
}

/**
 * Obtener conteos de alertas
 */
export async function getAdminAlertCounts(userId: string): Promise<AdminAlertCounts> {
  try {
    const { data, error } = await supabase
      .from('admin_alerts')
      .select('id, is_read, severity, expires_at')
      .eq('user_id', userId);

    if (error) {
      console.error('Error al obtener conteos:', error);
      return { total: 0, unread: 0, high_severity: 0, medium_severity: 0 };
    }

    // Filtrar alertas expiradas
    const now = new Date();
    const validAlerts = (data || []).filter(alert => {
      if (!alert.expires_at) return true;
      return new Date(alert.expires_at) > now;
    });

    return {
      total: validAlerts.length,
      unread: validAlerts.filter(a => !a.is_read).length,
      high_severity: validAlerts.filter(a => a.severity === 'high').length,
      medium_severity: validAlerts.filter(a => a.severity === 'medium').length
    };
  } catch (error) {
    console.error('Error en getAdminAlertCounts:', error);
    return { total: 0, unread: 0, high_severity: 0, medium_severity: 0 };
  }
}

/**
 * Marcar una alerta como leída
 */
export async function markAdminAlertAsRead(alertId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('admin_alerts')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      console.error('Error al marcar alerta como leída:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en markAdminAlertAsRead:', error);
    return false;
  }
}

/**
 * Marcar todas las alertas como leídas
 */
export async function markAllAdminAlertsAsRead(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('admin_alerts')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select('id');

    if (error) {
      console.error('Error al marcar todas como leídas:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error en markAllAdminAlertsAsRead:', error);
    return 0;
  }
}

/**
 * Eliminar una alerta
 */
export async function dismissAdminAlert(alertId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('admin_alerts')
      .delete()
      .eq('id', alertId);

    if (error) {
      console.error('Error al eliminar alerta:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en dismissAdminAlert:', error);
    return false;
  }
}

/**
 * Crear una nueva alerta
 */
export async function createAdminAlert(
  userId: string,
  alertType: AdminAlertType,
  severity: AlertSeverity,
  title: string,
  message: string,
  options?: {
    action_url?: string;
    related_appointment_id?: string;
    related_client_id?: string;
    related_property_id?: number;
    related_payment_id?: string;
    expires_at?: string;
  }
): Promise<AdminAlert | null> {
  try {
    const { data, error } = await supabase
      .from('admin_alerts')
      .insert({
        user_id: userId,
        alert_type: alertType,
        severity,
        title,
        message,
        ...options
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear alerta:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error en createAdminAlert:', error);
    return null;
  }
}

// ============================================
// SUSCRIPCIÓN EN TIEMPO REAL
// ============================================

/**
 * Suscribirse a nuevas alertas en tiempo real
 */
export function subscribeToAdminAlerts(
  userId: string,
  callback: (alert: AdminAlert) => void
): () => void {
  const channel = supabase
    .channel(`admin_alerts:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_alerts',
        filter: `user_id=eq.${userId}`
      },
      (payload: any) => {
        console.log('📬 Nueva alerta recibida:', payload.new);
        callback(payload.new as AdminAlert);
      }
    )
    .subscribe();

  // Retornar función de limpieza
  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Obtener emoji/icono según tipo de alerta
 */
export function getAdminAlertIcon(type: AdminAlertType): string {
  const icons: Record<AdminAlertType, string> = {
    'new_appointment': '📅',
    'appointment_cancelled': '❌',
    'new_client': '👤',
    'payment_received': '💰',
    'payment_overdue': '⚠️',
    'contract_expiring': '📄',
    'new_inquiry': '💬',
    'property_inactive': '🏢',
    'system_alert': '🔔',
    'task_assigned': '📋'
  };
  return icons[type] || '🔔';
}

/**
 * Obtener color según severidad
 */
export function getAdminAlertColor(severity: AlertSeverity): string {
  const colors: Record<AlertSeverity, string> = {
    low: 'text-blue-600',
    medium: 'text-yellow-600',
    high: 'text-red-600'
  };
  return colors[severity];
}

/**
 * Obtener color de fondo según severidad
 */
export function getAdminAlertBgColor(severity: AlertSeverity): string {
  const colors: Record<AlertSeverity, string> = {
    low: 'bg-blue-50 border-blue-200',
    medium: 'bg-yellow-50 border-yellow-200',
    high: 'bg-red-50 border-red-200'
  };
  return colors[severity];
}

/**
 * Obtener tiempo relativo (ej: "hace 5 minutos")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Hace menos de un minuto';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `Hace ${diffInMonths} mes${diffInMonths !== 1 ? 'es' : ''}`;
}

/**
 * Verificar si una alerta está por expirar (< 24 horas)
 */
export function isAdminAlertExpiringSoon(alert: AdminAlert): boolean {
  if (!alert.expires_at) return false;
  
  const expiryDate = new Date(alert.expires_at);
  const now = new Date();
  const diffInHours = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return diffInHours > 0 && diffInHours < 24;
}

/**
 * Obtener nombre legible del tipo de alerta
 */
export function getAlertTypeName(type: AdminAlertType): string {
  const names: Record<AdminAlertType, string> = {
    'new_appointment': 'Nueva Cita',
    'appointment_cancelled': 'Cita Cancelada',
    'new_client': 'Nuevo Cliente',
    'payment_received': 'Pago Recibido',
    'payment_overdue': 'Pago Vencido',
    'contract_expiring': 'Contrato Vence',
    'new_inquiry': 'Nueva Consulta',
    'property_inactive': 'Propiedad Inactiva',
    'system_alert': 'Alerta del Sistema',
    'task_assigned': 'Tarea Asignada'
  };
  return names[type] || type;
}
