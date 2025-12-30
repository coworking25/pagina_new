// ============================================
// PUSH NOTIFICATIONS MANAGER
// Sistema completo de gestión de notificaciones push
// ============================================

import { supabase } from './supabase';

// ============================================
// TIPOS Y INTERFACES
// ============================================

export interface PushSubscription {
  id?: string;
  user_id: string;
  user_type: 'client' | 'admin';
  subscription_data: PushSubscriptionJSON;
  user_agent?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationPayload {
  title: string;
  message: string;
  severity?: 'low' | 'medium' | 'high';
  alert_type?: string;
  action_url?: string;
  alert_id?: string;
  icon?: string;
}

export interface PushPermissionStatus {
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  subscription: PushSubscriptionJSON | null;
}

// VAPID Public Key - Debe configurarse en variables de entorno
// Para generar: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

// ============================================
// VERIFICACIÓN Y REGISTRO
// ============================================

/**
 * Verificar si el navegador soporta notificaciones push
 */
export function isPushNotificationSupported(): boolean {
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasPushManager = 'PushManager' in window;
  const hasNotification = 'Notification' in window;
  
  console.log('🔍 Verificando soporte Push:', {
    serviceWorker: hasServiceWorker,
    pushManager: hasPushManager,
    notification: hasNotification,
    supported: hasServiceWorker && hasPushManager && hasNotification
  });
  
  return hasServiceWorker && hasPushManager && hasNotification;
}

/**
 * Obtener estado actual de permisos y suscripción
 */
export async function getPushPermissionStatus(): Promise<PushPermissionStatus> {
  console.log('🔄 Iniciando getPushPermissionStatus...');
  
  if (!isPushNotificationSupported()) {
    console.log('❌ Push no soportado');
    return {
      supported: false,
      permission: 'denied',
      subscribed: false,
      subscription: null
    };
  }

  console.log('✅ Push soportado, obteniendo permisos...');
  const permission = Notification.permission;
  console.log('🔐 Permission actual:', permission);
  
  let subscribed = false;
  let subscription: PushSubscriptionJSON | null = null;

  try {
    // Intentar registrar el Service Worker si no está registrado
    console.log('⏳ Verificando Service Worker...');
    let registration: ServiceWorkerRegistration | null | undefined = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      console.log('📝 Service Worker no encontrado, registrando...');
      registration = await registerServiceWorker(); // Puede ser null
      if (!registration) {
        console.log('❌ No se pudo registrar Service Worker');
        return {
          supported: true,
          permission,
          subscribed: false,
          subscription: null
        };
      }
    }
    
    console.log('✅ Service Worker disponible');
    const pushSubscription = await registration.pushManager.getSubscription();
    console.log('📋 Suscripción actual:', pushSubscription);
    
    if (pushSubscription) {
      subscribed = true;
      subscription = pushSubscription.toJSON();
    }
  } catch (error) {
    console.error('❌ Error obteniendo estado de suscripción:', error);
  }

  const result = {
    supported: true,
    permission,
    subscribed,
    subscription
  };
  
  console.log('📱 Resultado final:', result);
  return result;
}

/**
 * Registrar Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers no soportados');
    return null;
  }

  try {
    // Desregistrar cualquier Service Worker anterior
    const existingRegistration = await navigator.serviceWorker.getRegistration();
    if (existingRegistration) {
      console.log('🔄 Desregistrando Service Worker antiguo...');
      await existingRegistration.unregister();
      console.log('✅ Service Worker antiguo desregistrado');
    }

    // Registrar nuevo Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('✅ Service Worker registrado:', registration);

    // Esperar a que esté activo
    if (registration.installing) {
      await new Promise((resolve) => {
        registration.installing!.addEventListener('statechange', (e: Event) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === 'activated') {
            resolve(true);
          }
        });
      });
    }

    return registration;
  } catch (error) {
    console.error('❌ Error registrando Service Worker:', error);
    return null;
  }
}

// ============================================
// PERMISOS Y SUSCRIPCIÓN
// ============================================

/**
 * Solicitar permiso de notificaciones
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications no soportadas');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  const permission = await Notification.requestPermission();
  console.log('📬 Permiso de notificaciones:', permission);
  
  return permission;
}

/**
 * Suscribirse a notificaciones push
 */
export async function subscribeToPushNotifications(
  userId: string,
  userType: 'client' | 'admin'
): Promise<PushSubscription | null> {
  try {
    // 1. Verificar soporte
    if (!isPushNotificationSupported()) {
      throw new Error('Push notifications no soportadas en este navegador');
    }

    // 2. Solicitar permiso
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Permiso de notificaciones denegado');
    }

    // 3. Registrar Service Worker si no está registrado
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      const reg = await registerServiceWorker();
      if (!reg) {
        throw new Error('No se pudo registrar Service Worker');
      }
      registration = reg;
    }

    // Esperar a que esté listo
    await navigator.serviceWorker.ready;

    // 4. Crear suscripción push
    console.log('🔑 Usando clave VAPID:', VAPID_PUBLIC_KEY);
    console.log('🔑 Longitud clave:', VAPID_PUBLIC_KEY.length);
    
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource;
    console.log('🔑 Application Server Key convertida:', applicationServerKey);
    
    console.log('📱 Intentando suscribirse al push manager...');
    const pushSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    }).catch((error) => {
      console.error('❌ Error detallado en subscribe:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      throw error;
    });

    console.log('✅ Suscripción push creada:', pushSubscription);

    // 5. Guardar en base de datos
    const subscriptionData: PushSubscription = {
      user_id: userId,
      user_type: userType,
      subscription_data: pushSubscription.toJSON(),
      user_agent: navigator.userAgent,
      is_active: true
    };

    // Primero verificar si ya existe una suscripción para este usuario
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('user_type', userType)
      .single();

    let data, error;
    if (existing) {
      // Actualizar suscripción existente
      const result = await supabase
        .from('push_subscriptions')
        .update(subscriptionData)
        .eq('user_id', userId)
        .eq('user_type', userType)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insertar nueva suscripción
      const result = await supabase
        .from('push_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error guardando suscripción:', error);
      throw error;
    }

    console.log('✅ Suscripción guardada en BD:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en suscripción push:', error);
    throw error;
  }
}

/**
 * Cancelar suscripción a notificaciones push
 */
export async function unsubscribeFromPushNotifications(
  userId: string,
  userType: 'client' | 'admin'
): Promise<boolean> {
  try {
    // 1. Obtener suscripción actual
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;

    // 2. Cancelar suscripción del navegador
    const unsubscribed = await subscription.unsubscribe();
    console.log('✅ Suscripción cancelada:', unsubscribed);

    // 3. Marcar como inactiva en BD
    const { error } = await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('user_type', userType);

    if (error) {
      console.error('Error desactivando suscripción en BD:', error);
    }

    return unsubscribed;
  } catch (error) {
    console.error('❌ Error cancelando suscripción:', error);
    return false;
  }
}

// ============================================
// ENVÍO DE NOTIFICACIONES
// ============================================

/**
 * Enviar notificación push a un usuario
 * NOTA: Esta función debe llamarse desde el backend con web-push library
 * Aquí solo está la estructura para referencia
 */
export async function sendPushNotification(
  userId: string,
  userType: 'client' | 'admin',
  payload: NotificationPayload
): Promise<boolean> {
  try {
    // En producción, esto se hace desde el backend
    // Aquí solo mostramos la estructura del endpoint
    
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        user_type: userType,
        payload
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error enviando notificación:', error);
    return false;
  }
}

/**
 * Enviar notificación de prueba
 */
export async function sendTestNotification(): Promise<void> {
  console.log('🧪 Iniciando notificación de prueba...');
  
  if (!isPushNotificationSupported()) {
    throw new Error('Notificaciones no soportadas');
  }

  console.log('🔐 Verificando permisos:', Notification.permission);
  if (Notification.permission !== 'granted') {
    throw new Error('Permiso no concedido');
  }

  // PRUEBA 1: Notificación nativa directa (no requiere Service Worker)
  console.log('📢 Método 1: Notificación nativa directa...');
  const notification = new Notification('🔔 Notificación de Prueba', {
    body: 'Las notificaciones están funcionando correctamente',
    tag: 'test-notification-direct',
    requireInteraction: false
  });
  
  notification.onclick = () => {
    console.log('👆 Usuario hizo clic en la notificación');
    window.focus();
    notification.close();
  };
  
  console.log('✅ Notificación directa enviada');
  
  // Esperar 2 segundos y probar con Service Worker también
  setTimeout(async () => {
    try {
      console.log('📢 Método 2: Notificación via Service Worker...');
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker listo para mostrar notificación');
      
      await registration.showNotification('🔔 Notificación SW', {
        body: 'Esta es la notificación via Service Worker',
        tag: 'test-notification-sw',
        requireInteraction: false
      });
      
      console.log('✅ Notificación SW enviada exitosamente');
    } catch (err) {
      console.error('❌ Error en notificación SW:', err);
    }
  }, 2000);
}

// ============================================
// GESTIÓN DE SUSCRIPCIONES (BD)
// ============================================

/**
 * Obtener todas las suscripciones activas de un usuario
 */
export async function getUserSubscriptions(
  userId: string,
  userType: 'client' | 'admin'
): Promise<PushSubscription[]> {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('user_type', userType)
    .eq('is_active', true);

  if (error) {
    console.error('Error obteniendo suscripciones:', error);
    return [];
  }

  return data || [];
}

/**
 * Limpiar suscripciones inactivas o expiradas
 */
export async function cleanupInactiveSubscriptions(
  userId: string,
  userType: 'client' | 'admin'
): Promise<number> {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('user_type', userType)
    .eq('is_active', false)
    .select('id');

  if (error) {
    console.error('Error limpiando suscripciones:', error);
    return 0;
  }

  return data?.length || 0;
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Convertir VAPID key de base64 a Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Verificar si ya está suscrito
 */
export async function isSubscribed(
  userId: string,
  userType: 'client' | 'admin'
): Promise<boolean> {
  try {
    const status = await getPushPermissionStatus();
    if (!status.subscribed) return false;

    // Verificar en BD
    const { data } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('user_type', userType)
      .eq('is_active', true)
      .limit(1)
      .single();

    return !!data;
  } catch (error) {
    return false;
  }
}

/**
 * Obtener estadísticas de notificaciones
 */
export async function getNotificationStats(
  userId: string,
  userType: 'client' | 'admin'
): Promise<{
  total_subscriptions: number;
  active_subscriptions: number;
  inactive_subscriptions: number;
}> {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('is_active')
    .eq('user_id', userId)
    .eq('user_type', userType);

  if (error || !data) {
    return { total_subscriptions: 0, active_subscriptions: 0, inactive_subscriptions: 0 };
  }

  return {
    total_subscriptions: data.length,
    active_subscriptions: data.filter(s => s.is_active).length,
    inactive_subscriptions: data.filter(s => !s.is_active).length
  };
}

console.log('🔔 Push Notifications Manager cargado');
