import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, X, Trash2 } from 'lucide-react';
import {
  getClientNotifications,
  getNotificationCounts,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  subscribeToNotifications,
  getNotificationEmoji,
  getNotificationBgColor,
  getRelativeTime,
  playNotificationSound,
  type ClientNotification,
  type NotificationCounts
} from '../../lib/client-portal/clientNotifications';

interface NotificationCenterProps {
  clientId: string;
  onClose?: () => void;
}

export default function NotificationCenter({ clientId, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({ total: 0, unread: 0, high_priority: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [soundEnabled, setSoundEnabled] = useState(false);

  // ==========================================
  // CARGAR NOTIFICACIONES
  // ==========================================
  
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [notificationData, countData] = await Promise.all([
        getClientNotifications(clientId, filter === 'unread'),
        getNotificationCounts(clientId)
      ]);
      
      setNotifications(notificationData);
      setCounts(countData);
    } catch (error) {
      console.error('❌ Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [clientId, filter]);

  // ==========================================
  // SUSCRIPCIÓN EN TIEMPO REAL
  // ==========================================

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(clientId, (newNotification: ClientNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setCounts((prev: NotificationCounts) => ({
        total: prev.total + 1,
        unread: prev.unread + 1,
        high_priority: (newNotification.priority === 'high' || newNotification.priority === 'urgent') 
          ? prev.high_priority + 1 
          : prev.high_priority
      }));

      // Reproducir sonido si está habilitado
      if (soundEnabled) {
        playNotificationSound();
      }

      // Mostrar notificación del navegador (si tiene permisos)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [clientId, soundEnabled]);

  // ==========================================
  // SOLICITAR PERMISOS DE NOTIFICACIÓN
  // ==========================================

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Permisos de notificación concedidos');
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // ==========================================
  // ACCIONES
  // ==========================================

  const handleMarkAsRead = async (notificationId: string, isRead: boolean) => {
    if (isRead) return;

    const success = await markNotificationAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setCounts((prev: NotificationCounts) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
    }
  };

  const handleMarkAllAsRead = async () => {
    const count = await markAllNotificationsAsRead(clientId);
    if (count > 0) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setCounts((prev: NotificationCounts) => ({ ...prev, unread: 0 }));
    }
  };

  const handleDismiss = async (notificationId: string) => {
    const success = await dismissNotification(notificationId);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setCounts((prev: NotificationCounts) => ({
        total: Math.max(0, prev.total - 1),
        unread: prev.unread,
        high_priority: prev.high_priority
      }));
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Notificaciones
            </h2>
            {counts.unread > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                {counts.unread}
              </span>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Filtros y Acciones */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Todas ({counts.total})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                filter === 'unread'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              No leídas ({counts.unread})
            </button>
          </div>

          {counts.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
              title="Marcar todas como leídas"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Marcar todas</span>
            </button>
          )}
        </div>

        {/* Toggle de sonido */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="sound-toggle"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
          />
          <label htmlFor="sound-toggle" className="text-xs text-gray-600 dark:text-gray-400">
            🔊 Activar sonido
          </label>
        </div>
      </div>

      {/* Lista de Notificaciones */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Te avisaremos cuando haya novedades
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
                className={`border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                  !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex gap-3">
                    {/* Emoji/Icono */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                      getNotificationBgColor(notification.priority)
                    }`}>
                      {getNotificationEmoji(notification.type)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-semibold text-sm ${
                          !notification.is_read 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {getRelativeTime(notification.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {notification.message}
                      </p>

                      {/* Acciones */}
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id, notification.is_read)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            Marcar leída
                          </button>
                        )}
                        <button
                          onClick={() => handleDismiss(notification.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Descartar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            {counts.total === 1 
              ? '1 notificación total' 
              : `${counts.total} notificaciones totales`}
            {counts.high_priority > 0 && (
              <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
                • {counts.high_priority} prioritaria{counts.high_priority !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE: Badge de Notificaciones
// ==========================================

interface NotificationBadgeProps {
  clientId: string;
  onClick?: () => void;
}

export function NotificationBadge({ clientId, onClick }: NotificationBadgeProps) {
  const [counts, setCounts] = useState<NotificationCounts>({ total: 0, unread: 0, high_priority: 0 });

  useEffect(() => {
    const loadCounts = async () => {
      const data = await getNotificationCounts(clientId);
      setCounts(data);
    };

    loadCounts();

    // Actualizar cada 30 segundos
    const interval = setInterval(loadCounts, 30000);

    // Suscribirse a cambios en tiempo real
    const unsubscribe = subscribeToNotifications(clientId, () => {
      loadCounts();
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [clientId]);

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
      title="Notificaciones"
    >
      <Bell className={`w-5 h-5 ${
        counts.unread > 0 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-gray-600 dark:text-gray-400'
      }`} />
      
      {counts.unread > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full"
        >
          {counts.unread > 9 ? '9+' : counts.unread}
        </motion.span>
      )}
    </button>
  );
}
