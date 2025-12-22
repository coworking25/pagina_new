/**
 * API para gestionar alertas de clientes
 * Sistema de alertas independiente al de notificaciones
 */

import { supabase } from '../supabase';

// ==========================================
// TIPOS Y INTERFACES
// ==========================================

export type AlertType = 
  | 'payment_reminder'    // Recordatorio de pago próximo
  | 'payment_overdue'     // Pago vencido
  | 'document_expiring'   // Documento por expirar
  | 'contract_expiring'   // Contrato por vencer
  | 'general'            // Alerta general
  | 'urgent';            // Alerta urgente

export type AlertSeverity = 'low' | 'medium' | 'high';

export interface ClientAlert {
  id: string;
  client_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  action_url?: string | null;
  is_read: boolean;
  read_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertCounts {
  total: number;
  unread: number;
  high_severity: number;
  urgent: number;
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Obtener todas las alertas del cliente
 */
export async function getClientAlerts(
  clientId: string,
  onlyUnread: boolean = false,
  limit?: number
): Promise<ClientAlert[]> {
  try {
    console.log('📋 Obteniendo alertas para cliente:', clientId);

    let query = supabase
      .from('client_alerts')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    // Filtrar solo no leídas si se solicita
    if (onlyUnread) {
      query = query.eq('is_read', false);
    }

    // Filtrar alertas no expiradas
    query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    // Limitar resultados si se especifica
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error al obtener alertas:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} alertas obtenidas`);
    return data || [];
  } catch (error) {
    console.error('❌ Error en getClientAlerts:', error);
    throw error;
  }
}

/**
 * Obtener contadores de alertas
 */
export async function getAlertCounts(clientId: string): Promise<AlertCounts> {
  try {
    const { data, error } = await supabase
      .from('client_alerts')
      .select('is_read, severity, alert_type')
      .eq('client_id', clientId)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    if (error) throw error;

    const counts: AlertCounts = {
      total: data?.length || 0,
      unread: data?.filter(a => !a.is_read).length || 0,
      high_severity: data?.filter(a => a.severity === 'high').length || 0,
      urgent: data?.filter(a => a.alert_type === 'urgent').length || 0
    };

    return counts;
  } catch (error) {
    console.error('❌ Error en getAlertCounts:', error);
    return { total: 0, unread: 0, high_severity: 0, urgent: 0 };
  }
}

/**
 * Marcar alerta como leída
 */
export async function markAlertAsRead(alertId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('client_alerts')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      console.error('❌ Error al marcar alerta como leída:', error);
      return false;
    }

    console.log('✅ Alerta marcada como leída:', alertId);
    return true;
  } catch (error) {
    console.error('❌ Error en markAlertAsRead:', error);
    return false;
  }
}

/**
 * Marcar todas las alertas como leídas
 */
export async function markAllAlertsAsRead(clientId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('client_alerts')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('client_id', clientId)
      .eq('is_read', false)
      .select();

    if (error) {
      console.error('❌ Error al marcar todas las alertas como leídas:', error);
      return 0;
    }

    const count = data?.length || 0;
    console.log(`✅ ${count} alertas marcadas como leídas`);
    return count;
  } catch (error) {
    console.error('❌ Error en markAllAlertsAsRead:', error);
    return 0;
  }
}

/**
 * Eliminar alerta (soft delete - marcar como expirada)
 */
export async function dismissAlert(alertId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('client_alerts')
      .update({ 
        expires_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      console.error('❌ Error al descartar alerta:', error);
      return false;
    }

    console.log('✅ Alerta descartada:', alertId);
    return true;
  } catch (error) {
    console.error('❌ Error en dismissAlert:', error);
    return false;
  }
}

/**
 * Suscribirse a nuevas alertas en tiempo real
 */
export function subscribeToAlerts(
  clientId: string,
  callback: (alert: ClientAlert) => void
): () => void {
  console.log('🔔 Suscribiéndose a alertas en tiempo real para cliente:', clientId);

  const channel = supabase
    .channel(`client_alerts:${clientId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'client_alerts',
        filter: `client_id=eq.${clientId}`
      },
      (payload: any) => {
        console.log('🔔 Nueva alerta recibida:', payload.new);
        callback(payload.new as ClientAlert);
      }
    )
    .subscribe();

  // Retornar función para cancelar suscripción
  return () => {
    console.log('❌ Cancelando suscripción a alertas');
    supabase.removeChannel(channel);
  };
}

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

/**
 * Obtener emoji según tipo de alerta
 */
export function getAlertIcon(type: AlertType): string {
  const icons: Record<AlertType, string> = {
    payment_reminder: '💰',
    payment_overdue: '⚠️',
    document_expiring: '📄',
    contract_expiring: '📋',
    general: 'ℹ️',
    urgent: '🚨'
  };
  return icons[type] || 'ℹ️';
}

/**
 * Obtener color según severidad
 */
export function getAlertColor(severity: AlertSeverity): string {
  const colors: Record<AlertSeverity, string> = {
    low: 'text-blue-600 dark:text-blue-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-red-600 dark:text-red-400'
  };
  return colors[severity] || 'text-gray-600 dark:text-gray-400';
}

/**
 * Obtener color de fondo según severidad
 */
export function getAlertBgColor(severity: AlertSeverity): string {
  const colors: Record<AlertSeverity, string> = {
    low: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    medium: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  };
  return colors[severity] || 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
}

/**
 * Obtener tiempo relativo (ej: "Hace 5 minutos")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Verificar si una alerta está próxima a expirar (menos de 24 horas)
 */
export function isAlertExpiringSoon(alert: ClientAlert): boolean {
  if (!alert.expires_at) return false;
  
  const expiresAt = new Date(alert.expires_at);
  const now = new Date();
  const diffInHours = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return diffInHours > 0 && diffInHours < 24;
}
