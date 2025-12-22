/**
 * CENTRO DE NOTIFICACIONES PARA ADMIN
 * Similar al Portal de Clientes pero adaptado para administradores
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminNotifications,
  getNotificationCounts,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  subscribeToNotifications,
  getNotificationEmoji,
  getNotificationColor,
  getNotificationBgColor,
  getRelativeTime,
  playNotificationSound,
  getNotificationRoute,
  type AdminNotification,
  type NotificationCounts
} from '../../lib/adminNotifications';

// =====================================================
// BADGE DE NOTIFICACIONES (para topbar)
// =====================================================

interface NotificationBadgeProps {
  userId: string;
  onClick?: () => void;
}

export const AdminNotificationBadge: React.FC<NotificationBadgeProps> = ({ userId, onClick }) => {
  const [counts, setCounts] = useState<NotificationCounts>({ total: 0, unread: 0, high_priority: 0 });

  // Cargar contadores iniciales
  useEffect(() => {
    loadCounts();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadCounts, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Suscribirse a notificaciones en tiempo real
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(userId, () => {
      loadCounts(); // Actualizar contadores cuando llega una nueva notificación
    });
    
    return unsubscribe;
  }, [userId]);

  const loadCounts = async () => {
    const newCounts = await getNotificationCounts(userId);
    setCounts(newCounts);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <Bell className={`w-6 h-6 ${
        counts.unread > 0 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-gray-600 dark:text-gray-400'
      }`} />
      {counts.unread > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
        >
          {counts.unread > 99 ? '99+' : counts.unread}
        </motion.span>
      )}
    </motion.button>
  );
};

// =====================================================
// CENTRO DE NOTIFICACIONES (Modal principal)
// =====================================================

interface AdminNotificationCenterProps {
  userId: string;
  onClose?: () => void;
}

const AdminNotificationCenter: React.FC<AdminNotificationCenterProps> = ({ userId, onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({ total: 0, unread: 0, high_priority: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Cargar notificaciones iniciales
  useEffect(() => {
    loadNotifications();
  }, [userId, filter]);

  // Suscribirse a notificaciones en tiempo real
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(userId, (newNotification) => {
      // Agregar nueva notificación al inicio
      setNotifications((prev) => [newNotification, ...prev]);
      
      // Actualizar contadores
      setCounts((prev: NotificationCounts) => ({
        total: prev.total + 1,
        unread: prev.unread + 1,
        high_priority: prev.high_priority + (newNotification.priority === 'high' || newNotification.priority === 'urgent' ? 1 : 0)
      }));

      // Reproducir sonido
      if (soundEnabled) {
        playNotificationSound();
      }

      // Mostrar notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/logo-13962586_transparent (1).png',
          badge: '/logo-13962586_transparent (1).png'
        });
      }
    });

    // Solicitar permisos de notificación del navegador
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return unsubscribe;
  }, [userId, soundEnabled]);

  const loadNotifications = async () => {
    setLoading(true);
    const onlyUnread = filter === 'unread';
    const data = await getAdminNotifications(userId, onlyUnread);
    setNotifications(data);
    
    const newCounts = await getNotificationCounts(userId);
    setCounts(newCounts);
    
    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId: string, isRead: boolean) => {
    if (isRead) return; // Ya está leída
    
    const success = await markNotificationAsRead(notificationId);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
      setCounts((prev: NotificationCounts) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
    }
  };

  const handleMarkAllAsRead = async () => {
    const count = await markAllNotificationsAsRead(userId);
    if (count > 0) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setCounts((prev: NotificationCounts) => ({ ...prev, unread: 0 }));
    }
  };

  const handleDismiss = async (notificationId: string) => {
    const success = await dismissNotification(notificationId);
    if (success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setCounts((prev: NotificationCounts) => ({
        total: Math.max(0, prev.total - 1),
        unread: Math.max(0, prev.unread - 1),
        high_priority: prev.high_priority // Recalcular si es necesario
      }));
    }
  };

  const handleNotificationClick = (notification: AdminNotification) => {
    // Marcar como leída
    if (!notification.is_read) {
      handleMarkAsRead(notification.id, notification.is_read);
    }
    
    // Navegar a la ruta correspondiente
    const route = getNotificationRoute(notification);
    navigate(route);
    
    // Cerrar modal
    if (onClose) {
      onClose();
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  return (
    <div className="w-[500px] max-w-[95vw] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Notificaciones
            </h2>
            {counts.unread > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                {counts.unread}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Filtros y acciones */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              Todas ({counts.total})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              No leídas ({counts.unread})
            </button>
          </div>

          <div className="flex gap-2">
            {counts.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Marcar todas como leídas"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {filter === 'unread' ? 'No hay notificaciones sin leer' : 'No hay notificaciones'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {filter === 'unread' ? '¡Todo al día!' : 'Las notificaciones aparecerán aquí'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-all ${
                  !notification.is_read
                    ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  {/* Emoji */}
                  <div className={`text-2xl flex-shrink-0 ${getNotificationColor(notification.priority)}`}>
                    {getNotificationEmoji(notification.type)}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {getRelativeTime(notification.created_at)}
                      </span>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id, notification.is_read)}
                            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors"
                            title="Marcar como leída"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDismiss(notification.id)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                          title="Descartar"
                        >
                          <Trash2 className="w-4 h-4" />
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
      <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-center text-gray-600 dark:text-gray-400">
          {counts.total} notificación{counts.total !== 1 ? 'es' : ''} en total
          {counts.high_priority > 0 && (
            <> · <span className="text-red-600 dark:text-red-400 font-medium">
              {counts.high_priority} prioritaria{counts.high_priority !== 1 ? 's' : ''}
            </span></>
          )}
        </p>
      </div>
    </div>
  );
};

export default AdminNotificationCenter;
