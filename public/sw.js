// ============================================
// SERVICE WORKER - Push Notifications
// ============================================
// Este archivo se ejecuta en segundo plano y maneja las notificaciones push

const CACHE_NAME = 'coworking-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo-13962586_transparent (1).png'
];

// ============================================
// INSTALACIÓN DEL SERVICE WORKER
// ============================================
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// ============================================
// ACTIVACIÓN DEL SERVICE WORKER
// ============================================
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activado');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ============================================
// MANEJO DE FETCH (Opcional - para PWA)
// ============================================
self.addEventListener('fetch', (event) => {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') return;
  
  // No cachear en localhost (modo desarrollo)
  if (event.request.url.includes('localhost') || event.request.url.includes('127.0.0.1')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retornar cache si existe, sino hacer fetch
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch((error) => {
          console.log('❌ Fetch falló:', error);
          // Retornar una respuesta de fallback si es necesario
          return new Response('Offline - contenido no disponible', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// ============================================
// MANEJO DE NOTIFICACIONES PUSH
// ============================================
self.addEventListener('push', (event) => {
  console.log('📬 Push recibido:', event);
  
  let notificationData = {
    title: 'Nueva Notificación',
    body: 'Tienes una nueva alerta',
    icon: '/logo-13962586_transparent (1).png',
    badge: '/logo-13962586_transparent (1).png',
    vibrate: [200, 100, 200],
    tag: 'notification',
    requireInteraction: false,
    data: {
      url: '/'
    }
  };

  // Parsear datos del push si existen
  if (event.data) {
    try {
      const payload = event.data.json();
      
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.message || payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: notificationData.badge,
        vibrate: payload.severity === 'high' ? [200, 100, 200, 100, 200] : [200, 100, 200],
        tag: payload.tag || payload.alert_type || 'notification',
        requireInteraction: payload.severity === 'high', // Alertas altas requieren interacción
        data: {
          url: payload.action_url || payload.url || '/',
          alert_id: payload.alert_id,
          severity: payload.severity,
          alert_type: payload.alert_type
        }
      };

      // Agregar acciones según tipo de alerta
      if (payload.action_url) {
        notificationData.actions = [
          {
            action: 'open',
            title: 'Ver Detalles',
            icon: '/logo-13962586_transparent (1).png'
          },
          {
            action: 'close',
            title: 'Cerrar',
            icon: '/logo-13962586_transparent (1).png'
          }
        ];
      }

    } catch (error) {
      console.error('Error parseando payload:', error);
    }
  }

  // Mostrar notificación
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// ============================================
// MANEJO DE CLICKS EN NOTIFICACIONES
// ============================================
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Click en notificación:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  const action = event.action;

  if (action === 'close') {
    // Solo cerrar
    return;
  }

  // Abrir o enfocar ventana
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Buscar ventana ya abierta
      for (const client of clientList) {
        if (client.url.includes(urlToOpen.split('?')[0]) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Si no hay ventana abierta, abrir nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ============================================
// MANEJO DE CIERRE DE NOTIFICACIONES
// ============================================
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notificación cerrada:', event.notification.tag);
  
  // Opcional: registrar estadística de notificación cerrada
  // Podríamos enviar analytics aquí
});

// ============================================
// MANEJO DE ERRORES DE PUSH
// ============================================
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('🔄 Suscripción push cambió');
  
  // Re-suscribirse automáticamente
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'BCISUs3qRuKK26aCVP7kO2eX6ITTPlE_aP51e48jS8lkuyCK-o3wUbaVPWYjLt7ijeJJm6oFK_XFV0IDtH8cLLA'
      )
    }).then((subscription) => {
      console.log('✅ Re-suscrito exitosamente');
      // Enviar nueva suscripción al backend
      return fetch('/api/push/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
    })
  );
});

// ============================================
// UTILIDADES
// ============================================

/**
 * Convertir VAPID key de base64 a Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
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

console.log('🚀 Service Worker cargado exitosamente');
