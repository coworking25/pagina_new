import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CreditCard,
  AlertCircle,
  Calendar,
  TrendingUp,
  DollarSign,
  Home,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { getClientDashboardSummary } from '../../lib/client-portal/clientPortalApi';
import type { ClientDashboardSummary } from '../../types/clientPortal';
import Card from '../../components/UI/Card';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ClientDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await getClientDashboardSummary();
      
      if (response.success && response.data) {
        setSummary(response.data);
      } else {
        setError(response.error || 'Error al cargar datos');
      }
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError('Error al cargar el dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Reintentar
          </button>
        </Card>
      </div>
    );
  }

  if (!summary) return null;

  const stats = [
    {
      icon: FileText,
      label: 'Contratos Activos',
      value: summary.active_contracts_count,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      action: () => navigate('/cliente/contratos')
    },
    {
      icon: Clock,
      label: 'Pagos Pendientes',
      value: summary.pending_payments_count,
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      action: () => navigate('/cliente/pagos')
    },
    {
      icon: XCircle,
      label: 'Pagos Vencidos',
      value: summary.overdue_payments_count,
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      action: () => navigate('/cliente/pagos?status=overdue'),
      alert: summary.overdue_payments_count > 0
    },
    {
      icon: TrendingUp,
      label: 'Total Pagado (Este Año)',
      value: new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(summary.total_paid_this_year),
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      action: () => navigate('/cliente/extractos')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bienvenido, {summary.full_name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aquí puedes ver un resumen de tu actividad
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={stat.action}
              className="cursor-pointer"
            >
              <Card
                className={`p-6 hover:shadow-lg transition-shadow ${
                  stat.alert ? 'ring-2 ring-red-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
                {stat.alert && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Requiere atención
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Próximo Pago */}
      {summary.next_payment_due_date && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-start gap-4">
              <div className="bg-green-600 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Próximo Pago
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Vence el {new Date(summary.next_payment_due_date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0
                    }).format(summary.next_payment_amount)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate('/cliente/pagos')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Ver Detalles
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Pagos Recientes y Próximos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pagos Recientes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Pagos Recientes
              </h3>
              <button
                onClick={() => navigate('/cliente/pagos')}
                className="text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Ver todos
              </button>
            </div>
            <div className="space-y-3">
              {summary.recent_payments && summary.recent_payments.length > 0 ? (
                summary.recent_payments.slice(0, 5).map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {payment.payment_type === 'rent' ? 'Arriendo' : 
                         payment.payment_type === 'administration' ? 'Administración' : 
                         payment.payment_type === 'utilities' ? 'Servicios' : 
                         payment.payment_type}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('es-ES') : 'Sin fecha'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0
                        }).format(payment.amount)}
                      </p>
                      <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">
                        Pagado
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No hay pagos recientes
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Próximos Pagos */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                Próximos Pagos
              </h3>
              <button
                onClick={() => navigate('/cliente/pagos?status=pending')}
                className="text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Ver todos
              </button>
            </div>
            <div className="space-y-3">
              {summary.upcoming_payments && summary.upcoming_payments.length > 0 ? (
                summary.upcoming_payments.slice(0, 5).map((payment, index) => {
                  const isOverdue = new Date(payment.due_date) < new Date();
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isOverdue
                          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {payment.payment_type === 'rent' ? 'Arriendo' : 
                           payment.payment_type === 'administration' ? 'Administración' : 
                           payment.payment_type === 'utilities' ? 'Servicios' : 
                           payment.payment_type}
                        </p>
                        <p className={`text-xs ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          Vence: {new Date(payment.due_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0
                          }).format(payment.amount)}
                        </p>
                        <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                          isOverdue
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {isOverdue ? 'Vencido' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No hay pagos pendientes
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Accesos Rápidos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Accesos Rápidos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/cliente/contratos')}
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow text-left group"
          >
            <Home className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gray-900 dark:text-white">Mis Propiedades</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ver contratos</p>
          </button>
          
          <button
            onClick={() => navigate('/cliente/pagos')}
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow text-left group"
          >
            <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gray-900 dark:text-white">Pagar</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Realizar pago</p>
          </button>
          
          <button
            onClick={() => navigate('/cliente/extractos')}
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow text-left group"
          >
            <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gray-900 dark:text-white">Extractos</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Descargar reportes</p>
          </button>
          
          <button
            onClick={() => navigate('/cliente/documentos')}
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow text-left group"
          >
            <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-gray-900 dark:text-white">Documentos</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ver archivos</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientDashboard;
