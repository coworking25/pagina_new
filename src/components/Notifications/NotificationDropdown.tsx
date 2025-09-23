import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown = ({ onClose }: NotificationDropdownProps) => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, getUnreadCount } = useNotificationContext();

  const handleAlertAction = (notification: any) => {
    // Navegar basado en el tipo de notificación
    if (notification.data?.type) {
      switch (notification.data.type) {
        case 'appointment_status_change':
        case 'appointment_deleted':
          navigate('/admin/appointments');
          break;
        case 'overdue_payment':
        case 'expiring_contract':
        case 'contract_renewal':
          navigate('/admin/clients', {
            state: {
              tab: 'contracts',
              filter: notification.data.type === 'overdue_payment' ? 'payments' : 'expiring'
            }
          });
          break;
        case 'inactive_property':
          navigate('/admin/properties', {
            state: { filter: 'inactive' }
          });
          break;
        case 'unfollowed_lead':
        case 'lead_no_contact':
          navigate('/admin/inquiries', {
            state: { filter: 'unfollowed' }
          });
          break;
        default:
          // Para otras acciones, usar el campo action si existe
          if (notification.action && notification.action.startsWith('/')) {
            navigate(notification.action);
          }
      }
    } else if (notification.action && notification.action.startsWith('/')) {
      navigate(notification.action);
    }
  };

  const unreadCount = getUnreadCount();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notificaciones
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={() => {
                markAllAsRead();
                onClose();
              }}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
          </p>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">¡Todo al día!</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              No hay notificaciones pendientes
            </p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => {
                if (!notification.read) {
                  markAsRead(notification.id);
                }
                handleAlertAction(notification);
                onClose();
              }}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  notification.priority === 'high'
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                }`}>
                  {notification.priority === 'high' ? (
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-medium">
                    {notification.action}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 10 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationDropdown;