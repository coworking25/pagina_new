import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  TrendingUp,
  Heart,
  Eye,
  Phone,
  Trophy,
  Activity,
  Download,
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  Settings,
  PieChart,
  LineChart,
  BarChart,
  Upload,
  CheckCircle,
  Clock,
  Database,
  Shield
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  getCompleteDashboardData,
  getClientReport,
  getAppointmentReport,
  getFinancialReport,
  getContractReport,
  getCommunicationReport,
  getDocumentsReport,
  getAlertsReport,
  getAdvisorsReport
} from '../../lib/analytics-expanded';
import {
  CompleteDashboardData,
  ClientReport,
  AppointmentReport,
  FinancialReport,
  ContractReport,
  CommunicationReport,
  DocumentsReport,
  AlertsReport,
  AdvisorsReport
} from '../../types/analytics';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType =
  | 'overview'
  | 'properties'
  | 'clients'
  | 'appointments'
  | 'financial'
  | 'contracts'
  | 'communications'
  | 'documents'
  | 'alerts'
  | 'advisors'
  | 'operations'
  | 'export';

const ReportsModalExpanded: React.FC<ReportsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dashboardData, setDashboardData] = useState<CompleteDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30); // días

  // Estados individuales para cada reporte
  const [clientData, setClientData] = useState<ClientReport | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentReport | null>(null);
  const [financialData, setFinancialData] = useState<FinancialReport | null>(null);
  const [contractData, setContractData] = useState<ContractReport | null>(null);
  const [communicationData, setCommunicationData] = useState<CommunicationReport | null>(null);
  const [documentsData, setDocumentsData] = useState<DocumentsReport | null>(null);
  const [alertsData, setAlertsData] = useState<AlertsReport | null>(null);
  const [advisorsData, setAdvisorsData] = useState<AdvisorsReport | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
      loadIndividualReports();
    }
  }, [isOpen, dateRange]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 ReportsModal: Cargando dashboard completo...');

      const data = await getCompleteDashboardData(dateRange);

      console.log('📊 ReportsModal: Dashboard completo recibido:', data);

      setDashboardData(data);
    } catch (error) {
      console.error('❌ Error cargando dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadIndividualReports = async () => {
    // Cargar reportes individuales en paralelo
    const loadPromises = [
      getClientReport(dateRange).then(setClientData).catch(err => {
        console.error('Error cargando clientes:', err);
        setClientData(null);
      }),
      getAppointmentReport(dateRange).then(setAppointmentData).catch(err => {
        console.error('Error cargando citas:', err);
        setAppointmentData(null);
      }),
      getFinancialReport(dateRange).then(setFinancialData).catch(err => {
        console.error('Error cargando financieros:', err);
        setFinancialData(null);
      }),
      getContractReport().then(setContractData).catch(err => {
        console.error('Error cargando contratos:', err);
        setContractData(null);
      }),
      getCommunicationReport(dateRange).then(setCommunicationData).catch(err => {
        console.error('Error cargando comunicaciones:', err);
        setCommunicationData(null);
      }),
      getDocumentsReport(dateRange).then(setDocumentsData).catch(err => {
        console.error('Error cargando documentos:', err);
        setDocumentsData(null);
      }),
      getAlertsReport(dateRange).then(setAlertsData).catch(err => {
        console.error('Error cargando alertas:', err);
        setAlertsData(null);
      }),
      getAdvisorsReport(dateRange).then(setAdvisorsData).catch(err => {
        console.error('Error cargando asesores:', err);
        setAdvisorsData(null);
      }),
    ];

    await Promise.allSettled(loadPromises);
  };

  const handleExport = async (type: 'likes' | 'views' | 'contacts') => {
    // TODO: Implementar función de exportación
    console.log('Exportando:', type);
    // const csv = await exportReport(type);
    // const blob = new Blob([csv], { type: 'text/csv' });
    // const url = window.URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = `reporte_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
    // window.URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Resumen General', icon: BarChart3 },
    { id: 'properties' as TabType, label: 'Propiedades', icon: Trophy },
    { id: 'clients' as TabType, label: 'Clientes', icon: Users },
    { id: 'appointments' as TabType, label: 'Citas', icon: Calendar },
    { id: 'financial' as TabType, label: 'Financiero', icon: DollarSign },
    { id: 'contracts' as TabType, label: 'Contratos', icon: FileText },
    { id: 'communications' as TabType, label: 'Comunicaciones', icon: MessageSquare },
    { id: 'documents' as TabType, label: 'Documentos', icon: FileText },
    { id: 'alerts' as TabType, label: 'Alertas', icon: AlertTriangle },
    { id: 'advisors' as TabType, label: 'Asesores', icon: UserCheck },
    { id: 'operations' as TabType, label: 'Operativo', icon: Settings },
    { id: 'export' as TabType, label: 'Exportar', icon: Download },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Reportes y Analytics Completos
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Análisis integral de todo el sistema inmobiliario
                </p>
              </div>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value={7}>Últimos 7 días</option>
                <option value={30}>Últimos 30 días</option>
                <option value={90}>Últimos 90 días</option>
                <option value={365}>Último año</option>
              </select>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : dashboardData ? (
              <>
                {activeTab === 'overview' && (
                  <OverviewTab dashboardData={dashboardData} />
                )}
                {activeTab === 'properties' && (
                  <PropertiesTab analytics={dashboardData.propertyAnalytics || { totalLikes: 0, totalViews: 0, totalContacts: 0, uniqueVisitors: 0, topProperties: [] }} />
                )}
                {activeTab === 'clients' && (
                  <ClientsTab report={clientData} />
                )}
                {activeTab === 'appointments' && (
                  <AppointmentsTab report={appointmentData} />
                )}
                {activeTab === 'financial' && (
                  <FinancialTab report={financialData} />
                )}
                {activeTab === 'contracts' && (
                  <ContractsTab report={contractData} />
                )}
                {activeTab === 'communications' && (
                  <CommunicationsTab report={communicationData} />
                )}
                {activeTab === 'documents' && (
                  <DocumentsTab report={documentsData} />
                )}
                {activeTab === 'alerts' && (
                  <AlertsTab report={alertsData} />
                )}
                {activeTab === 'advisors' && (
                  <AdvisorsTab report={advisorsData} />
                )}
                {activeTab === 'operations' && (
                  <OperationsTab documentsReport={documentsData} />
                )}
                {activeTab === 'export' && (
                  <ExportTab onExport={handleExport} />
                )}
              </>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Error al cargar datos
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No se pudieron cargar los datos del dashboard. Inténtalo de nuevo.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ==================== OVERVIEW TAB ====================
const OverviewTab: React.FC<{ dashboardData: CompleteDashboardData }> = ({ dashboardData }) => {
  const { propertyAnalytics, clientReport, appointmentReport, financialReport } = dashboardData;

  const overviewStats = [
    {
      label: 'Total Clientes',
      value: clientReport.totalClients,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: '+5%'
    },
    {
      label: 'Total Likes',
      value: propertyAnalytics?.totalLikes || 0,
      icon: Heart,
      color: 'from-green-500 to-emerald-500',
      change: '+12%'
    },
    {
      label: 'Total Citas',
      value: appointmentReport.totalAppointments,
      icon: Calendar,
      color: 'from-orange-500 to-amber-500',
      change: '+8%'
    },
    {
      label: 'Ingresos Totales',
      value: `$${financialReport.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-purple-500 to-indigo-500',
      change: '+15%'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stat.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💰 Ingresos Mensuales
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBarChart data={financialReport.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ingresos']}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        {/* Clients by Type */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            👥 Distribución de Clientes
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={clientReport.clientsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {clientReport.clientsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ==================== PROPERTIES TAB ====================
const PropertiesTab: React.FC<{ analytics: any }> = ({ analytics }) => {
  const stats = [
    {
      label: 'Total Likes',
      value: analytics.totalLikes || 0,
      icon: Heart,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Total Vistas',
      value: analytics.totalViews || 0,
      icon: Eye,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Total Contactos',
      value: analytics.totalContacts || 0,
      icon: Phone,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Visitantes Únicos',
      value: analytics.uniqueVisitors || 0,
      icon: Activity,
      color: 'from-purple-500 to-indigo-500'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stat.value.toLocaleString()}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Top Properties */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          🏆 Top 10 Propiedades Más Populares
        </h3>

        <div className="space-y-3">
          {analytics.topProperties?.map((property: any, index: number) => (
            <motion.div
              key={property.property_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="text-3xl font-bold w-12 text-center">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {property.title}
                  </h4>
                  <span className="text-xs font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    {property.code}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                    <Heart className="w-4 h-4" />
                    <span>{property.total_likes}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                    <Eye className="w-4 h-4" />
                    <span>{property.total_views}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <Phone className="w-4 h-4" />
                    <span>{property.total_contacts}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Score</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {property.popularity_score}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== CLIENTS TAB ====================
const ClientsTab: React.FC<{ report: ClientReport | null }> = ({ report }) => {
  if (!report) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando Reporte de Clientes
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Obteniendo datos de clientes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Clientes</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.totalClients}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Contratos Activos</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.activeContracts}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Nuevos Este Mes</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.newClientsThisMonth}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Con Pagos Vencidos</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.clientsWithOverduePayments}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            👥 Clientes por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={report.clientsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {report.clientsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Clientes por Estado
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBarChart data={report.clientsByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="status" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ==================== APPOINTMENTS TAB ====================
const AppointmentsTab: React.FC<{ report: AppointmentReport | null }> = ({ report }) => {
  if (!report) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando Reporte de Citas
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Obteniendo datos de citas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Citas</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.totalAppointments}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Conversión</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.conversionRate.toFixed(1)}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Próximas Citas</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.upcomingAppointments}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Rating Promedio</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.averageRating.toFixed(1)} ⭐
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📅 Citas por Estado
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={report.appointmentsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {report.appointmentsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🎯 Citas por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBarChart data={report.appointmentsByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="type" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ==================== FINANCIAL TAB ====================
const FinancialTab: React.FC<{ report: FinancialReport | null }> = ({ report }) => {
  if (!report) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando Reporte Financiero
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Obteniendo datos financieros...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos Totales</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            ${report.totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pagos Pendientes</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            ${report.pendingPayments.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pagos Vencidos</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            ${report.overduePayments.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pago Promedio</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            ${report.averagePaymentAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💰 Ingresos Mensuales
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBarChart data={report.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ingresos']}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💳 Pagos por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={report.paymentsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {report.paymentsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ==================== CONTRACTS TAB ====================
const ContractsTab: React.FC<{ report: ContractReport | null }> = ({ report }) => {
  if (!report) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando Reporte de Contratos
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Obteniendo datos de contratos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Contratos</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.totalContracts}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Contratos Activos</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.activeContracts}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Próximos a Vencer</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.expiringContracts}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Valor Promedio</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            ${report.averageContractValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📋 Contratos por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={report.contractsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {report.contractsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Duración Promedio de Contratos
          </h3>
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {report.averageContractDuration.toFixed(1)}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Meses promedio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== COMMUNICATIONS TAB ====================
const CommunicationsTab: React.FC<{ report: CommunicationReport | null }> = ({ report }) => {
  if (!report) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando Reporte de Comunicaciones
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Obteniendo datos de comunicaciones...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Comunicaciones</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.totalCommunications}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Respuesta</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.responseRate.toFixed(1)}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Seguimientos Pendientes</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.pendingFollowUps}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tipos de Comunicación</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.communicationsByType.length}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💬 Comunicaciones por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBarChart data={report.communicationsByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="type" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            👥 Comunicaciones por Asesor
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={report.communicationsByAdvisor}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {report.communicationsByAdvisor.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ==================== DOCUMENTS TAB ====================
const DocumentsTab: React.FC<{ report: DocumentsReport | null }> = ({ report }) => {
  if (!report) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando Reporte de Documentos
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Obteniendo datos de documentos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Documentos</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.totalDocuments}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Subidas Recientes</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.recentUploads}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Próximos a Vencer</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.expiringDocuments}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tipos de Documento</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.documentsByType.length}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📋 Documentos por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBarChart data={report.documentsByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="type" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Documentos por Estado
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={report.documentsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {report.documentsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#10b981', '#f59e0b', '#ef4444'][index % 3]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Document Management Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          💡 Consejos para la Gestión de Documentos
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Mantén los documentos organizados por tipo y cliente</li>
          <li>• Revisa regularmente los documentos próximos a vencer</li>
          <li>• Utiliza nombres descriptivos para facilitar la búsqueda</li>
          <li>• Realiza backups regulares de documentos importantes</li>
        </ul>
      </div>
    </div>
  );
};

// ==================== ALERTS TAB ====================
const AlertsTab: React.FC<{ report: AlertsReport | null }> = ({ report }) => {
  if (!report) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando Reporte de Alertas
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Obteniendo datos de alertas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Alertas</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.totalAlerts}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Alertas Activas</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.activeAlerts}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Alertas Críticas</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.criticalAlerts}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Alertas Recientes</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.recentAlerts}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🚨 Alertas por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={report.alertsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {report.alertsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#10b981', '#3b82f6'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Alertas por Prioridad
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBarChart data={report.alertsByPriority}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="priority" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ==================== ADVISORS TAB ====================
const AdvisorsTab: React.FC<{ report: AdvisorsReport | null }> = ({ report }) => {
  if (!report) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando Reporte de Asesores
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Obteniendo datos de asesores...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Asesores</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.totalAdvisors}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Asesores Activos</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.activeAdvisors}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Clientes Asignados</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.totalClientsAssigned}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Promedio por Asesor</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {report.averageClientsPerAdvisor.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Advisors Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          🏆 Rendimiento de Asesores
        </h3>

        <div className="space-y-4">
          {report.advisorsPerformance.map((advisor, index) => (
            <motion.div
              key={advisor.advisor}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="text-2xl font-bold w-12 text-center">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {advisor.advisor}
                  </h4>
                  <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                    {advisor.clients_count} clientes
                  </span>
                </div>

                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <FileText className="w-4 h-4" />
                    <span>{advisor.contracts_closed} contratos</span>
                  </div>
                  <div className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
                    <DollarSign className="w-4 h-4" />
                    <span>${advisor.total_revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Score</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {((advisor.clients_count * 10) + (advisor.contracts_closed * 20) + (advisor.total_revenue / 1000)).toFixed(0)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Advisors by Specialty */}
      {report.advisorsBySpecialty.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🎯 Asesores por Especialidad
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={report.advisorsBySpecialty}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {report.advisorsBySpecialty.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// ==================== OPERATIONS TAB ====================
const OperationsTab: React.FC<{ documentsReport: DocumentsReport | null }> = ({ documentsReport }) => {
  if (!documentsReport) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Cargando Reporte Operativo
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Obteniendo datos operativos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Documents Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          📄 Gestión de Documentos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Documentos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {documentsReport.totalDocuments}
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Upload className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Subidas Recientes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {documentsReport.recentUploads}
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Próximos a Vencer</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {documentsReport.expiringDocuments}
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tipos de Documento</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {documentsReport.documentsByType.length}
            </p>
          </div>
        </div>

        {/* Documents Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              📋 Documentos por Tipo
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsBarChart data={documentsReport.documentsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="type" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              📊 Documentos por Estado
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={documentsReport.documentsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {documentsReport.documentsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#f59e0b', '#ef4444'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Operations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          ⚙️ Operaciones del Sistema
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Sistema Activo</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Uptime: 99.9%</p>
                </div>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Base de Datos</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Conexión estable</p>
                </div>
              </div>
              <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="font-medium text-purple-800 dark:text-purple-200">Último Backup</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Hace 2 horas</p>
                </div>
              </div>
              <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">Seguridad</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Actualizada</p>
                </div>
              </div>
              <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== EXPORT TAB ====================
const ExportTab: React.FC<{ onExport: (type: 'likes' | 'views' | 'contacts') => void }> = ({ onExport }) => {
  const exportOptions = [
    {
      type: 'likes' as const,
      label: 'Exportar Likes',
      description: 'Descargar todos los "me gusta" de propiedades',
      icon: Heart,
      color: 'from-red-500 to-pink-500'
    },
    {
      type: 'views' as const,
      label: 'Exportar Vistas',
      description: 'Descargar todas las visualizaciones de propiedades',
      icon: Eye,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      type: 'contacts' as const,
      label: 'Exportar Contactos',
      description: 'Descargar todos los contactos por propiedad',
      icon: Phone,
      color: 'from-green-500 to-emerald-500'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          💾 Exportar Reportes
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Descarga tus reportes en formato CSV para análisis externo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onExport(option.type)}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow text-left"
            >
              <div className={`p-3 bg-gradient-to-br ${option.color} rounded-lg w-fit mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {option.label}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {option.description}
              </p>
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 text-sm font-medium">
                <Download className="w-4 h-4" />
                <span>Descargar CSV</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          📊 Próximamente: Más Opciones de Exportación
        </h4>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          En futuras versiones podrás exportar reportes de clientes, contratos, pagos, citas y más.
        </p>
      </div>
    </div>
  );
};

export default ReportsModalExpanded;