import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Home, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Settings,
  TrendingUp,
  TrendingDown,
  Eye,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  ArrowUpRight,
  Activity,
  DollarSign,
  ExternalLink,
  Check,
  X,
  Shield
} from 'lucide-react';
import { useNotificationContext } from '../contexts/NotificationContext';
import { 
  getDashboardStats, 
  getAllPropertyAppointments,
  getServiceInquiries,
  getRevenueTrends,
  getSmartAlerts
} from '../lib/supabase';
import FloatingCard from '../components/UI/FloatingCard';
import ReportsModal from '../components/Modals/ReportsModal';
import UserManagementModal from '../components/Modals/UserManagementModal';
import { useAuth } from '../contexts/AuthContext';
import { usePersistedState } from '../hooks/usePersistedState';
import { useAppState } from '../contexts/AppStateContext';

interface DashboardStats {
  properties: {
    total: number;
    forSale: number;
    forRent: number;
    sold: number;
    rented: number;
    featured: number;
  };
  appointments: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  inquiries: {
    total: number;
    pending: number;
    thisMonth: number;
    byService: Record<string, number>;
  };
  advisors: {
    total: number;
    active: number;
  };
  clients: {
    unique: number;
    thisMonth: number;
  };
  financial: {
    monthlyRevenue: number;
    annualRevenue: number;
    commissionsThisMonth: number;
    commissionsThisYear: number;
    pendingPayments: number;
    overduePayments: number;
    averagePropertyROI: number;
    salesPipeline: number;
    leadConversionRate: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'inquiry' | 'property' | 'advisor';
  title: string;
  description: string;
  time: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface RevenueTrend {
  month: string;
  revenue: number;
  commissions: number;
}

interface SmartAlert {
  id: string;
  type: 'overdue_payment' | 'expiring_contract' | 'unfollowed_lead' | 'maintenance_due' | 'upcoming_payment' | 'contract_renewal' | 'inactive_property' | 'property_no_views' | 'lead_no_contact';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: string;
  data: any;
}

interface SmartAlertsData {
  critical: SmartAlert[];
  warnings: SmartAlert[];
  totalCount: number;
}

function AdminDashboard() {
  const { state: stats, setState: setStats } = usePersistedState({
    key: 'dashboard-stats',
    initialValue: null as DashboardStats | null,
    expirationTime: 60 * 60 * 1000 // 1 hora
  });
  const { state: recentActivity, setState: setRecentActivity } = usePersistedState({
    key: 'dashboard-recent-activity',
    initialValue: [] as RecentActivity[],
    expirationTime: 60 * 60 * 1000
  });
  const [loading, setLoading] = useState(true);
  const { state: revenueTrends, setState: setRevenueTrends } = usePersistedState({
    key: 'dashboard-revenue-trends',
    initialValue: [] as RevenueTrend[],
    expirationTime: 60 * 60 * 1000
  });
  const { state: smartAlerts, setState: setSmartAlerts } = usePersistedState({
    key: 'dashboard-smart-alerts',
    initialValue: null as SmartAlertsData | null,
    expirationTime: 60 * 60 * 1000
  });
  const { state: isReportsModalOpen, setState: setIsReportsModalOpen } = usePersistedState({
    key: 'dashboard-reports-modal',
    initialValue: false,
    expirationTime: 30 * 60 * 1000 // 30 minutos
  });
  const { state: isUserManagementModalOpen, setState: setIsUserManagementModalOpen } = usePersistedState({
    key: 'dashboard-user-management-modal',
    initialValue: false,
    expirationTime: 30 * 60 * 1000
  });
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { updateAppState } = useAppState();

  // Usar el contexto de notificaciones
  const {
    updateNotifications
  } = useNotificationContext();

  useEffect(() => {
    loadDashboardData();
    // Actualizar estado global de la app
    updateAppState({
      currentView: 'dashboard',
      lastVisitedRoute: '/admin/dashboard'
    });
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Cargando datos del dashboard...');
      
      // Cargar datos en paralelo
      const [dashboardStats, recentAppointments, trends, alerts] = await Promise.all([
        getDashboardStats(),
        getAllPropertyAppointments(),
        getRevenueTrends(),
        getSmartAlerts()
      ]);
      
      console.log('📈 Estadísticas obtenidas:', dashboardStats);
      console.log('📊 Tendencias de ingresos:', trends);
      console.log('🚨 Alertas inteligentes:', alerts);
      
      setStats(dashboardStats);
      setRevenueTrends(trends);
      setSmartAlerts(alerts);
      
      // Convertir alertas en notificaciones para el sistema de notificaciones
      const alertNotifications = [
        ...alerts.critical.map(alert => ({
          id: alert.id,
          type: 'alert',
          priority: 'high' as const,
          title: alert.title,
          message: alert.description,
          action: alert.actionRequired,
          timestamp: new Date(),
          read: false,
          data: alert
        })),
        ...alerts.warnings.map(alert => ({
          id: alert.id,
          type: 'alert',
          priority: 'low' as const,
          title: alert.title,
          message: alert.description,
          action: alert.actionRequired,
          timestamp: new Date(),
          read: false,
          data: alert
        }))
      ];
      
      updateNotifications(alertNotifications);
      
      // Convertir citas recientes en actividad reciente
      const recentActivities: RecentActivity[] = recentAppointments
        .slice(0, 4)
        .map((appointment: any) => ({
          id: appointment.id,
          type: 'appointment' as const,
          title: `${appointment.status === 'pending' ? 'Nueva cita agendada' : 'Cita actualizada'}`,
          description: `${appointment.client_name} - ${appointment.appointment_type}`,
          time: `Hace ${Math.floor(Math.random() * 60)} minutos`,
          status: appointment.status as 'pending' | 'completed' | 'cancelled'
        }));
      
      setRecentActivity(recentActivities);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
      
      // Fallback con datos básicos
      setStats({
        properties: { total: 0, forSale: 0, forRent: 0, sold: 0, rented: 0, featured: 0 },
        appointments: { total: 0, pending: 0, confirmed: 0, completed: 0 },
        inquiries: { total: 0, pending: 0, thisMonth: 0, byService: {} },
        advisors: { total: 0, active: 0 },
        clients: { unique: 0, thisMonth: 0 },
        financial: {
          monthlyRevenue: 0,
          annualRevenue: 0,
          commissionsThisMonth: 0,
          commissionsThisYear: 0,
          pendingPayments: 0,
          overduePayments: 0,
          averagePropertyROI: 0,
          salesPipeline: 0,
          leadConversionRate: 0
        }
      });
      setRecentActivity([]);
      setLoading(false);
    }
  };

  const handleAlertAction = (alert: SmartAlert) => {
    switch (alert.type) {
      case 'overdue_payment':
      case 'upcoming_payment':
        // Ir a la página de clientes/contratos con filtro
        navigate('/admin/clients', { 
          state: { 
            tab: 'contracts',
            filter: 'payments',
            highlightId: alert.data?.id 
          }
        });
        break;
      
      case 'expiring_contract':
      case 'contract_renewal':
        // Ir a contratos con filtro de próximos a vencer
        navigate('/admin/clients', { 
          state: { 
            tab: 'contracts',
            filter: 'expiring',
            highlightId: alert.data?.id 
          }
        });
        break;
      
      case 'inactive_property':
        // Ir a propiedades con filtro de inactivas
        navigate('/admin/properties', { 
          state: { 
            filter: 'inactive',
            highlightId: alert.data?.id 
          }
        });
        break;
      
      case 'unfollowed_lead':
      case 'lead_no_contact':
        // Ir a consultas de servicio con filtro de pendientes
        navigate('/admin/service-inquiries', { 
          state: { 
            filter: 'pending',
            highlightId: alert.data?.id 
          }
        });
        break;
      
      default:
        console.log('Tipo de alerta no reconocido:', alert.type);
    }
  };

  const dismissAlert = async (alertId: string) => {
    // Aquí podríamos implementar lógica para marcar alertas como leídas/descartadas
    // Por ahora solo removemos del estado local
    if (smartAlerts) {
      const updatedAlerts = {
        critical: smartAlerts.critical.filter(alert => alert.id !== alertId),
        warnings: smartAlerts.warnings.filter(alert => alert.id !== alertId),
        totalCount: smartAlerts.totalCount - 1
      };
      setSmartAlerts(updatedAlerts);
    }
  };



  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle: string;
    trend?: number;
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <FloatingCard hover glowEffect elevation="high" className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl ${color} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium ml-1">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
        <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{subtitle}</p>
      </div>
      </FloatingCard>
    </motion.div>
  );

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
    const getIcon = () => {
      switch (activity.type) {
        case 'appointment': return Calendar;
        case 'inquiry': return MessageSquare;
        case 'property': return Home;
        case 'advisor': return Users;
        default: return FileText;
      }
    };

    const getStatusIcon = () => {
      switch (activity.status) {
        case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
        default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      }
    };

    const Icon = getIcon();

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3"
      >
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white">{activity.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
        </div>
        {getStatusIcon()}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-blue-100 mt-2">Bienvenido al centro de control</p>
          </div>
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUserManagementModalOpen(true)}
                className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="Gestionar Usuarios"
              >
                <Users className="w-6 h-6" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Settings className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Financial Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center mb-4">
          <TrendingUp className="w-6 h-6 mr-3" />
          <h2 className="text-xl font-bold">Métricas Financieras</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Ingresos Mensuales</p>
                <p className="text-2xl font-bold">${(stats?.financial.monthlyRevenue || 0).toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Comisiones del Mes</p>
                <p className="text-2xl font-bold">${(stats?.financial.commissionsThisMonth || 0).toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Pipeline de Ventas</p>
                <p className="text-2xl font-bold">${(stats?.financial.salesPipeline || 0).toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-200" />
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-yellow-300">${(stats?.financial.pendingPayments || 0).toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Pagos Vencidos</p>
                <p className="text-2xl font-bold text-red-300">${(stats?.financial.overduePayments || 0).toLocaleString()}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-200" />
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Conversión de Leads</p>
                <p className="text-2xl font-bold">{(stats?.financial.leadConversionRate || 0).toFixed(1)}%</p>
              </div>
              <Activity className="w-8 h-8 text-green-200" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Revenue Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center mb-4">
          <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tendencias de Ingresos (12 meses)</h2>
        </div>
        <div className="h-64">
          <div className="flex items-end justify-between h-full space-x-2">
            {revenueTrends.map((trend, index) => {
              const maxRevenue = Math.max(...revenueTrends.map(t => t.revenue));
              const revenueHeight = maxRevenue > 0 ? (trend.revenue / maxRevenue) * 100 : 0;
              const maxCommission = Math.max(...revenueTrends.map(t => t.commissions));
              const commissionHeight = maxCommission > 0 ? (trend.commissions / maxCommission) * 100 : 0;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex items-end justify-center space-x-1 mb-2">
                    {/* Barra de ingresos */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${revenueHeight}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="w-3 bg-blue-500 rounded-t"
                      title={`Ingresos: $${trend.revenue.toLocaleString()}`}
                    />
                    {/* Barra de comisiones */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${commissionHeight}%` }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                      className="w-3 bg-green-500 rounded-t"
                      title={`Comisiones: $${trend.commissions.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 transform -rotate-45 origin-top">
                    {trend.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Ingresos</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Comisiones</span>
          </div>
        </div>
      </motion.div>

      {/* Smart Alerts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 mr-3 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alertas Inteligentes</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Críticas ({smartAlerts ? smartAlerts.critical.length : 0})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Advertencias ({smartAlerts ? smartAlerts.warnings.length : 0})</span>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        {smartAlerts && smartAlerts.critical.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Alertas Críticas
            </h3>
            <div className="space-y-3">
              {smartAlerts.critical.slice(0, 3).map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer group"
                  onClick={() => handleAlertAction(alert)}
                >
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800 dark:text-red-200">{alert.title}</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{alert.description}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">{alert.actionRequired}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200">
                      Alta Prioridad
                    </span>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlertAction(alert);
                        }}
                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        title="Ir a revisar"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlert(alert.id);
                        }}
                        className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        title="Descartar alerta"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Warning Alerts */}
        {smartAlerts && smartAlerts.warnings.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Advertencias
            </h3>
            <div className="space-y-3">
              {smartAlerts.warnings.slice(0, 3).map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors cursor-pointer group"
                  onClick={() => handleAlertAction(alert)}
                >
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">{alert.title}</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{alert.description}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 font-medium">{alert.actionRequired}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      alert.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200' :
                      alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                    }`}>
                      {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Media' : 'Baja'} Prioridad
                    </span>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlertAction(alert);
                        }}
                        className="p-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                        title="Ir a revisar"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlert(alert.id);
                        }}
                        className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        title="Descartar alerta"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* No alerts message */}
        {smartAlerts && !smartAlerts.critical.length && !smartAlerts.warnings.length && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¡Todo en orden!</h3>
            <p className="text-gray-600 dark:text-gray-400">No hay alertas activas en este momento.</p>
          </div>
        )}
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <FloatingCard hover elevation="high" className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-600" />
              Actividad Reciente
            </h2>
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </FloatingCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <FloatingCard hover elevation="high" className="relative p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <ArrowUpRight className="w-6 h-6 mr-2 text-green-600" />
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/calendar')}
                className="group relative w-full flex items-center p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-xl hover:shadow-lg transition-all duration-300 border border-cyan-200/50 dark:border-cyan-700/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mr-3 relative z-10" />
                <span className="text-gray-900 dark:text-white font-medium relative z-10">Sistema de Calendario</span>
                <ArrowUpRight className="w-4 h-4 ml-auto text-cyan-600 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/appointments')}
                className="group relative w-full flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl hover:shadow-lg transition-all duration-300 border border-blue-200/50 dark:border-blue-700/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 relative z-10" />
                <span className="text-gray-900 dark:text-white font-medium relative z-10">Ver Citas del Día</span>
                <ArrowUpRight className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/clients')}
                className="group relative w-full flex items-center p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl hover:shadow-lg transition-all duration-300 border border-indigo-200/50 dark:border-indigo-700/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 relative z-10" />
                <span className="text-gray-900 dark:text-white font-medium relative z-10">Gestionar Clientes</span>
                <ArrowUpRight className="w-4 h-4 ml-auto text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/properties')}
                className="group relative w-full flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl hover:shadow-lg transition-all duration-300 border border-green-200/50 dark:border-green-700/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Home className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 relative z-10" />
                <span className="text-gray-900 dark:text-white font-medium relative z-10">Agregar Propiedad</span>
                <ArrowUpRight className="w-4 h-4 ml-auto text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/service-inquiries')}
                className="group relative w-full flex items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl hover:shadow-lg transition-all duration-300 border border-emerald-200/50 dark:border-emerald-700/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 relative z-10" />
                <span className="text-gray-900 dark:text-white font-medium relative z-10">Consultas de Servicio</span>
                <ArrowUpRight className="w-4 h-4 ml-auto text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10" />
              </motion.button>

              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsUserManagementModalOpen(true)}
                  className="group relative w-full flex items-center p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl hover:shadow-lg transition-all duration-300 border border-red-200/50 dark:border-red-700/50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Shield className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 relative z-10" />
                  <span className="text-gray-900 dark:text-white font-medium relative z-10">Gestionar Usuarios</span>
                  <ArrowUpRight className="w-4 h-4 ml-auto text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10" />
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/advisors')}
                className="group relative w-full flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl hover:shadow-lg transition-all duration-300 border border-purple-200/50 dark:border-purple-700/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3 relative z-10" />
                <span className="text-gray-900 dark:text-white font-medium relative z-10">Gestionar Asesores</span>
                <ArrowUpRight className="w-4 h-4 ml-auto text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsReportsModalOpen(true)}
                className="group relative w-full flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl hover:shadow-lg transition-all duration-300 border border-orange-200/50 dark:border-orange-700/50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3 relative z-10" />
                <span className="text-gray-900 dark:text-white font-medium relative z-10">Ver Reportes</span>
                <ArrowUpRight className="w-4 h-4 ml-auto text-orange-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10" />
              </motion.button>
            </div>
          </FloatingCard>
        </motion.div>
      </div>

      {/* Reports Modal */}
      <ReportsModal 
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />

      {/* User Management Modal */}
      <UserManagementModal 
        isOpen={isUserManagementModalOpen}
        onClose={() => setIsUserManagementModalOpen(false)}
      />
    </div>
  );
}

export default AdminDashboard;
