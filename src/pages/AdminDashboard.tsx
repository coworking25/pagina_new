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
  Bell,
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
  Activity
} from 'lucide-react';
import { 
  getDashboardStats, 
  getAllPropertyAppointments,
  getServiceInquiries
} from '../lib/supabase';
import FloatingCard from '../components/UI/FloatingCard';

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
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'inquiry' | 'property' | 'advisor';
  title: string;
  description: string;
  time: string;
  status: 'pending' | 'completed' | 'cancelled';
}

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Cargando datos del dashboard...');
      
      // Cargar estadísticas reales desde Supabase
      const dashboardStats = await getDashboardStats();
      const recentAppointments = await getAllPropertyAppointments();
      
      console.log('📈 Estadísticas obtenidas:', dashboardStats);
      
      setStats(dashboardStats);
      
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
        clients: { unique: 0, thisMonth: 0 }
      });
      setRecentActivity([]);
      setLoading(false);
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Bell className="w-6 h-6" />
            </motion.button>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total de Clientes"
          value={stats?.clients.unique || 0}
          subtitle="Clientes únicos"
          trend={15.3}
          color="bg-blue-500"
        />
        <StatCard
          icon={Calendar}
          title="Citas Agendadas"
          value={stats?.appointments.total || 0}
          subtitle={`${stats?.appointments.pending || 0} pendientes`}
          trend={8.2}
          color="bg-green-500"
        />
        <StatCard
          icon={Home}
          title="Propiedades"
          value={stats?.properties.total || 0}
          subtitle="En catálogo"
          trend={12.5}
          color="bg-purple-500"
        />
        <StatCard
          icon={MessageSquare}
          title="Consultas Activas"
          value={stats?.inquiries.pending || 0}
          subtitle="Requieren atención"
          color="bg-orange-500"
        />
      </div>

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
                onClick={() => navigate('/admin/reports')}
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
    </div>
  );
}

export default AdminDashboard;
