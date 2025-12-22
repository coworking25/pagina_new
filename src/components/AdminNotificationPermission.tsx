import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Check, X, Info, Loader, Shield } from 'lucide-react';
import {
  getPushPermissionStatus,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendTestNotification,
  getNotificationStats,
  type PushPermissionStatus
} from '../lib/pushNotifications';
import { useAuth } from '../contexts/AuthContext';

const AdminNotificationPermission: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<PushPermissionStatus>({
    supported: false,
    permission: 'default',
    subscribed: false,
    subscription: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState({ total_subscriptions: 0, active_subscriptions: 0, inactive_subscriptions: 0 });
  const [showDetails, setShowDetails] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    loadStatus();
    if (user?.id) {
      loadStats();
    }
  }, [user?.id]);

  const loadStatus = async () => {
    try {
      const currentStatus = await getPushPermissionStatus();
      setStatus(currentStatus);
    } catch (err) {
      console.error('Error cargando estado:', err);
    }
  };

  const loadStats = async () => {
    if (!user?.id) return;
    try {
      const data = await getNotificationStats(user.id, 'admin');
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  const handleSubscribe = async () => {
    if (!user?.id) {
      setError('Debes iniciar sesión para activar notificaciones');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await subscribeToPushNotifications(user.id, 'admin');
      setSuccess('✅ ¡Notificaciones activadas exitosamente!');
      await loadStatus();
      await loadStats();
    } catch (err: any) {
      setError(err.message || 'Error al activar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await unsubscribeFromPushNotifications(user.id, 'admin');
      setSuccess('❌ Notificaciones desactivadas');
      await loadStatus();
      await loadStats();
    } catch (err: any) {
      setError(err.message || 'Error al desactivar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await sendTestNotification();
      setSuccess('🔔 Notificación de prueba enviada');
    } catch (err: any) {
      setError(err.message || 'Error al enviar notificación de prueba');
    } finally {
      setLoading(false);
    }
  };

  // Si no está soportado, no mostrar nada
  if (!status.supported) {
    return null;
  }

  // Si ya está suscrito y no hay errores, mostrar versión compacta
  if (status.subscribed && !showDetails) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">
                Notificaciones Activas
              </p>
              <p className="text-xs text-green-700">
                Recibirás alertas administrativas en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(true)}
            className="text-sm text-green-700 hover:text-green-900 underline"
          >
            Gestionar
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Shield size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Notificaciones Push Admin</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Recibe alertas administrativas en tiempo real
                </p>
              </div>
            </div>
            {showDetails && status.subscribed && (
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Mensajes */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start space-x-3"
            >
              <X className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start space-x-3"
            >
              <Check className="text-green-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-green-900">Éxito</p>
                <p className="text-sm text-green-700 mt-1">{success}</p>
              </div>
            </motion.div>
          )}

          {/* Estado actual */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Info size={18} className="text-gray-600" />
              <h4 className="font-semibold text-gray-900">Estado Actual</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Permisos:</p>
                <p className="font-medium text-gray-900">
                  {status.permission === 'granted' && '✅ Concedidos'}
                  {status.permission === 'denied' && '❌ Denegados'}
                  {status.permission === 'default' && '⏳ Pendientes'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Suscripción:</p>
                <p className="font-medium text-gray-900">
                  {status.subscribed ? '✅ Activa' : '❌ Inactiva'}
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          {stats.total_subscriptions > 0 && (
            <div className="bg-indigo-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-indigo-900 mb-3">Estadísticas</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-indigo-600">{stats.total_subscriptions}</p>
                  <p className="text-xs text-indigo-700">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.active_subscriptions}</p>
                  <p className="text-xs text-green-700">Activas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">{stats.inactive_subscriptions}</p>
                  <p className="text-xs text-gray-700">Inactivas</p>
                </div>
              </div>
            </div>
          )}

          {/* Beneficios */}
          {!status.subscribed && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Beneficios:</h4>
              <ul className="space-y-2">
                {[
                  'Recibe alertas de nuevas citas al instante',
                  'Notificaciones de pagos vencidos urgentes',
                  'Avisos de nuevos clientes registrados',
                  'Alertas de tareas asignadas',
                  'No te pierdas consultas importantes',
                  'Notificaciones incluso con el panel cerrado'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                    <Check className="text-indigo-600 flex-shrink-0 mt-0.5" size={16} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Acciones */}
          <div className="space-y-3">
            {!status.subscribed ? (
              <button
                onClick={handleSubscribe}
                disabled={loading || status.permission === 'denied'}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Activando...</span>
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    <span>Activar Notificaciones</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleTestNotification}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Bell size={20} />
                      <span>Enviar Notificación de Prueba</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleUnsubscribe}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <>
                      <BellOff size={20} />
                      <span>Desactivar Notificaciones</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Nota sobre permisos denegados */}
          {status.permission === 'denied' && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>Permisos denegados:</strong> Para activar las notificaciones, debes permitirlas en la configuración de tu navegador.
              </p>
            </div>
          )}

          {/* Info adicional para admins */}
          {status.subscribed && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Tip:</strong> Las notificaciones se enviarán automáticamente cuando se creen nuevas alertas administrativas de alta prioridad.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminNotificationPermission;
