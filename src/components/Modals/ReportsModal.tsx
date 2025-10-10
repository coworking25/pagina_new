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
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  getDashboardAnalytics, 
  getTopProperties,
  exportReport 
} from '../../lib/analytics';
import { DashboardAnalytics, TopProperty } from '../../types/analytics';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'top-properties' | 'activity' | 'export';

const ReportsModal: React.FC<ReportsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [topProperties, setTopProperties] = useState<TopProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30); // días

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen, dateRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 ReportsModal: Cargando analytics...');
      
      const [analyticsData, topPropsData] = await Promise.all([
        getDashboardAnalytics(),
        getTopProperties(10, dateRange)
      ]);
      
      console.log('📊 ReportsModal: Analytics recibidos:', analyticsData);
      console.log('🏆 ReportsModal: Top properties:', topPropsData);
      
      setAnalytics(analyticsData);
      setTopProperties(topPropsData);
    } catch (error) {
      console.error('❌ Error cargando analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (type: 'likes' | 'views' | 'contacts') => {
    try {
      const csv = await exportReport(type);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${type}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exportando reporte:', error);
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Resumen', icon: BarChart3 },
    { id: 'top-properties' as TabType, label: 'Top Propiedades', icon: Trophy },
    { id: 'activity' as TabType, label: 'Actividad Reciente', icon: Activity },
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
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Reportes y Analytics
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Análisis de interacciones y popularidad
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
          <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <OverviewTab analytics={analytics} />
                )}
                {activeTab === 'top-properties' && (
                  <TopPropertiesTab properties={topProperties} />
                )}
                {activeTab === 'activity' && (
                  <ActivityTab analytics={analytics} />
                )}
                {activeTab === 'export' && (
                  <ExportTab onExport={handleExport} />
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ==================== OVERVIEW TAB ====================
const OverviewTab: React.FC<{ analytics: DashboardAnalytics | null }> = ({ analytics }) => {
  const stats = [
    {
      label: 'Total Likes',
      value: analytics?.totalLikes || 0,
      icon: Heart,
      color: 'from-green-500 to-emerald-500',
      change: '+12%'
    },
    {
      label: 'Total Vistas',
      value: analytics?.totalViews || 0,
      icon: Eye,
      color: 'from-blue-500 to-cyan-500',
      change: '+8%'
    },
    {
      label: 'Total Contactos',
      value: analytics?.totalContacts || 0,
      icon: Phone,
      color: 'from-orange-500 to-amber-500',
      change: '+15%'
    },
    {
      label: 'Visitantes Únicos',
      value: analytics?.uniqueVisitors || 0,
      icon: Activity,
      color: 'from-purple-500 to-indigo-500',
      change: '+5%'
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
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stat.value.toLocaleString()}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tendencia de Interacciones
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analytics?.chartData || []}>
            <defs>
              <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="likes" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorLikes)"
              name="Me Gusta"
            />
            <Area 
              type="monotone" 
              dataKey="views" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorViews)"
              name="Vistas"
            />
            <Area 
              type="monotone" 
              dataKey="contacts" 
              stroke="#f59e0b" 
              fillOpacity={1} 
              fill="url(#colorContacts)"
              name="Contactos"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ==================== TOP PROPERTIES TAB ====================
const TopPropertiesTab: React.FC<{ properties: TopProperty[] }> = ({ properties }) => {
  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}º`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          🏆 Top 10 Propiedades Más Populares
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Score = (Likes × 3) + (Vistas × 1) + (Contactos × 5)
        </p>
      </div>

      <div className="space-y-3">
        {properties.map((property, index) => (
          <motion.div
            key={property.property_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              {/* Posición */}
              <div className="text-3xl font-bold w-12 text-center">
                {getMedalEmoji(index)}
              </div>

              {/* Info de la propiedad */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {property.title}
                  </h4>
                  <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {property.code}
                  </span>
                </div>

                {/* Estadísticas */}
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

              {/* Score */}
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Score</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {property.popularity_score}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No hay datos suficientes para mostrar el ranking</p>
        </div>
      )}
    </div>
  );
};

// ==================== ACTIVITY TAB ====================
const ActivityTab: React.FC<{ analytics: DashboardAnalytics | null }> = ({ analytics }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        📋 Actividad Reciente
      </h3>

      <div className="space-y-3">
        {analytics?.recentActivity?.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.property_title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activity.details}
              </p>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(activity.timestamp).toLocaleTimeString()}
            </span>
          </motion.div>
        ))}
      </div>

      {(!analytics?.recentActivity || analytics.recentActivity.length === 0) && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No hay actividad reciente</p>
        </div>
      )}
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
    </div>
  );
};

export default ReportsModal;
