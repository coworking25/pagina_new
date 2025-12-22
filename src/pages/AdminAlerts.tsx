import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Check, X, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  AdminAlert,
  AdminAlertCounts,
  AlertSeverity,
  AdminAlertType,
  getAdminAlerts,
  getAdminAlertCounts,
  markAdminAlertAsRead,
  markAllAdminAlertsAsRead,
  dismissAdminAlert,
  subscribeToAdminAlerts,
  getAdminAlertIcon,
  getAdminAlertColor,
  getAdminAlertBgColor,
  getRelativeTime,
  isAdminAlertExpiringSoon,
  getAlertTypeName
} from '../lib/adminAlerts';

const AdminAlerts: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [counts, setCounts] = useState<AdminAlertCounts>({
    total: 0,
    unread: 0,
    high_severity: 0,
    medium_severity: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AdminAlertType | 'all'>('all');

  // Cargar alertas
  const loadAlerts = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    const data = await getAdminAlerts(user.id, filter === 'unread');
    
    // Aplicar filtros de severidad y tipo
    let filteredData = data;
    if (severityFilter !== 'all') {
      filteredData = filteredData.filter((a: AdminAlert) => a.severity === severityFilter);
    }
    if (typeFilter !== 'all') {
      filteredData = filteredData.filter((a: AdminAlert) => a.alert_type === typeFilter);
    }
    
    setAlerts(filteredData);
    setLoading(false);
  };

  // Cargar conteos
  const loadCounts = async () => {
    if (!user?.id) return;
    const data = await getAdminAlertCounts(user.id);
    setCounts(data);
  };

  // Marcar como leída
  const handleMarkAsRead = async (alertId: string) => {
    const success = await markAdminAlertAsRead(alertId);
    if (success) {
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, is_read: true, read_at: new Date().toISOString() } : a
      ));
      await loadCounts();
    }
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    const updatedCount = await markAllAdminAlertsAsRead(user.id);
    if (updatedCount > 0) {
      await loadAlerts();
      await loadCounts();
    }
  };

  // Eliminar alerta
  const handleDismiss = async (alertId: string) => {
    const success = await dismissAdminAlert(alertId);
    if (success) {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      await loadCounts();
    }
  };

  // Navegar a URL de acción
  const handleAction = async (alert: AdminAlert) => {
    if (!alert.is_read) {
      await handleMarkAsRead(alert.id);
    }
    if (alert.action_url) {
      window.location.href = alert.action_url;
    }
  };

  // Efectos
  useEffect(() => {
    if (!user?.id) return;
    
    loadAlerts();
    loadCounts();

    // Suscripción en tiempo real
    const unsubscribe = subscribeToAdminAlerts(user.id, (newAlert: AdminAlert) => {
      console.log('📬 Nueva alerta recibida:', newAlert);
      setAlerts(prev => [newAlert, ...prev]);
      setCounts((prev: AdminAlertCounts) => ({
        ...prev,
        total: prev.total + 1,
        unread: prev.unread + 1,
        high_severity: newAlert.severity === 'high' ? prev.high_severity + 1 : prev.high_severity,
        medium_severity: newAlert.severity === 'medium' ? prev.medium_severity + 1 : prev.medium_severity
      }));
    });

    return () => unsubscribe();
  }, [user?.id, filter, severityFilter, typeFilter]);

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Debes iniciar sesión para ver las alertas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con gradiente */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Bell size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mis Alertas</h1>
            <p className="text-blue-100 mt-1">Centro de notificaciones del sistema</p>
          </div>
        </div>
      </motion.div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{counts.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="text-blue-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">No Leídas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{counts.unread}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Alta Severidad</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{counts.high_severity}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Media Severidad</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{counts.medium_severity}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                No Leídas
              </button>
            </div>
          </div>

          {/* Filtro por severidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severidad
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>

          {/* Filtro por tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AdminAlertType | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="new_appointment">Nueva Cita</option>
              <option value="appointment_cancelled">Cita Cancelada</option>
              <option value="new_client">Nuevo Cliente</option>
              <option value="payment_received">Pago Recibido</option>
              <option value="payment_overdue">Pago Vencido</option>
              <option value="contract_expiring">Contrato Vence</option>
              <option value="new_inquiry">Nueva Consulta</option>
              <option value="property_inactive">Propiedad Inactiva</option>
              <option value="system_alert">Alerta del Sistema</option>
              <option value="task_assigned">Tarea Asignada</option>
            </select>
          </div>
        </div>

        {/* Botón marcar todas como leídas */}
        {counts.unread > 0 && (
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={handleMarkAllAsRead}
              className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Check size={20} />
              <span>Marcar todas como leídas ({counts.unread})</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Lista de alertas */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : alerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-md p-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Todo al día!
            </h3>
            <p className="text-gray-600">
              No tienes alertas pendientes
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-lg shadow-md border-l-4 overflow-hidden ${
                  alert.is_read ? 'opacity-60' : ''
                } ${getAdminAlertBgColor(alert.severity)}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Icono */}
                      <div className="text-4xl flex-shrink-0">
                        {getAdminAlertIcon(alert.alert_type)}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`text-lg font-semibold ${getAdminAlertColor(alert.severity)}`}>
                            {alert.title}
                          </h3>
                          {!alert.is_read && (
                            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                              NUEVA
                            </span>
                          )}
                          {isAdminAlertExpiringSoon(alert) && (
                            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                              EXPIRA PRONTO
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 mb-3 whitespace-pre-line">
                          {alert.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="font-medium">
                            {getAlertTypeName(alert.alert_type)}
                          </span>
                          <span>•</span>
                          <span>{getRelativeTime(alert.created_at)}</span>
                          {alert.expires_at && (
                            <>
                              <span>•</span>
                              <span>Expira: {new Date(alert.expires_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="flex-shrink-0 ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar alerta"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Acciones */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {!alert.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center space-x-2"
                      >
                        <Check size={16} />
                        <span>Marcar como leída</span>
                      </button>
                    )}

                    {alert.action_url && (
                      <button
                        onClick={() => handleAction(alert)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Ver Detalles →
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AdminAlerts;
