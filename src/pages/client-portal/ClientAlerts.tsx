import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Calendar,
  Trash2,
  CheckCheck,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getClientAlerts,
  getAlertCounts,
  markAlertAsRead,
  markAllAlertsAsRead,
  dismissAlert,
  subscribeToAlerts,
  getAlertIcon,
  getAlertColor,
  getAlertBgColor,
  getRelativeTime,
  isAlertExpiringSoon,
  type ClientAlert,
  type AlertCounts,
  type AlertSeverity
} from '../../lib/client-portal/clientAlerts';
import { getSession } from '../../lib/client-portal/clientAuth';
import ClientNotificationPermission from '../../components/client-portal/ClientNotificationPermission';

const ClientAlerts: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<ClientAlert[]>([]);
  const [counts, setCounts] = useState<AlertCounts>({ total: 0, unread: 0, high_severity: 0, urgent: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const session = getSession();

  // Cargar alertas iniciales
  useEffect(() => {
    if (!session?.client_id) {
      navigate('/login');
      return;
    }

    loadAlerts();
    loadCounts();

    // Suscribirse a nuevas alertas
    const unsubscribe = subscribeToAlerts(session.client_id, (newAlert) => {
      console.log('🔔 Nueva alerta recibida en tiempo real');
      setAlerts(prev => [newAlert, ...prev]);
      setCounts(prev => ({
        ...prev,
        total: prev.total + 1,
        unread: prev.unread + 1,
        high_severity: newAlert.severity === 'high' ? prev.high_severity + 1 : prev.high_severity,
        urgent: newAlert.alert_type === 'urgent' ? prev.urgent + 1 : prev.urgent
      }));
    });

    return () => unsubscribe();
  }, [session?.client_id, navigate]);

  const loadAlerts = async () => {
    if (!session?.client_id) return;
    
    try {
      setLoading(true);
      const data = await getClientAlerts(session.client_id, filter === 'unread');
      
      // Aplicar filtro de severidad si está activo
      const filteredData = severityFilter === 'all' 
        ? data 
        : data.filter(a => a.severity === severityFilter);
      
      setAlerts(filteredData);
    } catch (error) {
      console.error('Error cargando alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCounts = async () => {
    if (!session?.client_id) return;
    
    try {
      const data = await getAlertCounts(session.client_id);
      setCounts(data);
    } catch (error) {
      console.error('Error cargando contadores:', error);
    }
  };

  // Recargar cuando cambien filtros
  useEffect(() => {
    loadAlerts();
  }, [filter, severityFilter]);

  const handleMarkAsRead = async (alertId: string, currentlyRead: boolean) => {
    if (currentlyRead) return; // Ya está leída

    const success = await markAlertAsRead(alertId);
    if (success) {
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, is_read: true, read_at: new Date().toISOString() } : a
      ));
      setCounts(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!session?.client_id) return;
    
    const count = await markAllAlertsAsRead(session.client_id);
    if (count > 0) {
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true, read_at: new Date().toISOString() })));
      setCounts(prev => ({ ...prev, unread: 0 }));
    }
  };

  const handleDismiss = async (alertId: string) => {
    const success = await dismissAlert(alertId);
    if (success) {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      setCounts(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    }
  };

  const handleAlertClick = async (alert: ClientAlert) => {
    // Marcar como leída
    if (!alert.is_read) {
      await handleMarkAsRead(alert.id, false);
    }

    // Navegar si tiene URL
    if (alert.action_url) {
      navigate(alert.action_url);
    }
  };

  const filteredAlerts = alerts;

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Componente de permisos de notificaciones push */}
      <ClientNotificationPermission />

      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Mis Alertas</h1>
            <p className="text-yellow-50 text-sm sm:text-base">
              Notificaciones importantes sobre tu cuenta
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {counts.total}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 sm:p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">No Leídas</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {counts.unread}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 sm:p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Alta Severidad</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {counts.high_severity}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Urgentes</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {counts.urgent}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              No Leídas
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                severityFilter === 'all'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSeverityFilter('low')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                severityFilter === 'low'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Baja
            </button>
            <button
              onClick={() => setSeverityFilter('medium')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                severityFilter === 'medium'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Media
            </button>
            <button
              onClick={() => setSeverityFilter('high')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                severityFilter === 'high'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Alta
            </button>
          </div>

          {counts.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando alertas...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
          >
            <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ¡Todo al día!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No tienes alertas pendientes en este momento
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleAlertClick(alert)}
                className={`relative p-4 sm:p-5 rounded-lg border ${getAlertBgColor(alert.severity)} ${
                  alert.action_url ? 'cursor-pointer hover:shadow-md' : ''
                } transition-all ${!alert.is_read ? 'ring-2 ring-yellow-400 dark:ring-yellow-600' : ''}`}
              >
                {/* Badge No Leída */}
                {!alert.is_read && (
                  <div className="absolute -top-2 -right-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-500 text-white text-xs font-bold rounded-full animate-pulse">
                      !
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className={`text-3xl sm:text-4xl flex-shrink-0 ${getAlertColor(alert.severity)}`}>
                    {getAlertIcon(alert.alert_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        {alert.title}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {alert.action_url && (
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {alert.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {getRelativeTime(alert.created_at)}
                      </span>
                      <span>•</span>
                      <span className={`font-medium ${getAlertColor(alert.severity)}`}>
                        {alert.severity === 'low' && 'Baja prioridad'}
                        {alert.severity === 'medium' && 'Media prioridad'}
                        {alert.severity === 'high' && 'Alta prioridad'}
                      </span>
                      {alert.expires_at && isAlertExpiringSoon(alert) && (
                        <>
                          <span>•</span>
                          <span className="text-orange-600 dark:text-orange-400 font-medium">
                            Expira pronto
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!alert.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(alert.id, false);
                        }}
                        className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                        title="Marcar como leída"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(alert.id);
                      }}
                      className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                      title="Descartar"
                    >
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Info */}
      {filteredAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Mostrando <span className="font-semibold">{filteredAlerts.length}</span> alerta(s).
            {counts.unread > 0 && (
              <span className="ml-1">
                Tienes <span className="font-semibold text-yellow-600 dark:text-yellow-400">{counts.unread}</span> sin leer.
              </span>
            )}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ClientAlerts;
