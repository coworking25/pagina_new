import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Home,
  FileText,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  ChevronRight,
  Sun,
  Moon,
  HelpCircle,
  User,
  AlertTriangle,
  Shield,
  Newspaper
} from 'lucide-react';
import { useAdminBadges } from '../../contexts/AdminBadgeContext';
import { useAuth } from '../../contexts/AuthContext';
import QuickActions from './QuickActions';
import AdminNotificationCenter, { AdminNotificationBadge } from './AdminNotificationCenter';
import { getAdminAlertCounts } from '../../lib/adminAlerts';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: number;
}

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0);
  const { badges } = useAdminBadges();
  const { user: currentUser } = useAuth();

  // Cargar conteo de alertas
  const loadAlertsCount = async (userId: string) => {
    try {
      const counts = await getAdminAlertCounts(userId);
      setAlertsCount(counts.unread);
    } catch (error) {
      console.error('Error al cargar conteo de alertas:', error);
    }
  };

  // Cargar conteo inicial y actualizar cada 30 segundos
  useEffect(() => {
    if (currentUser?.id) {
      loadAlertsCount(currentUser.id);
      
      const interval = setInterval(() => {
        loadAlertsCount(currentUser.id);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard'
    },
    {
      id: 'alerts',
      label: 'Mis Alertas',
      icon: AlertTriangle,
      path: '/admin/alerts',
      badge: alertsCount
    },
    {
      id: 'appointments',
      label: 'Citas',
      icon: Calendar,
      path: '/admin/appointments',
      badge: badges.appointments
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: Calendar,
      path: '/admin/calendar'
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
      path: '/admin/clients'
    },
    {
      id: 'properties',
      label: 'Propiedades',
      icon: Home,
      path: '/admin/properties'
    },
    {
      id: 'advisors',
      label: 'Asesores',
      icon: Users,
      path: '/admin/advisors'
    },
    {
      id: 'service-inquiries',
      label: 'Consultas',
      icon: HelpCircle,
      path: '/admin/service-inquiries',
      badge: badges.clients
    },
    {
      id: 'news',
      label: 'Noticias',
      icon: Newspaper,
      path: '/admin/news'
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: BarChart3,
      path: '/admin/reports'
    },
    {
      id: 'audit-logs',
      label: 'Auditoría',
      icon: Shield,
      path: '/admin/audit-logs'
    },
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: User,
      path: '/admin/profile'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      path: '/admin/settings'
    }
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const SidebarItem = ({ item }: { item: MenuItem }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <motion.button
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          navigate(item.path);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 group ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <div className="flex items-center space-x-3">
          <Icon 
            className={`w-5 h-5 ${
              isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
            }`} 
          />
          <span className="font-medium">{item.label}</span>
        </div>
        <div className="flex items-center space-x-2">
          {item.badge && item.badge > 0 && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              isActive 
                ? 'bg-white/20 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
          {isActive && <ChevronRight className="w-4 h-4" />}
        </div>
      </motion.button>
    );
  };

  const Sidebar = ({ isMobile = false }) => (
    <motion.div
      initial={isMobile ? { x: -300 } : undefined}
      animate={isMobile ? { x: 0 } : undefined}
      exit={isMobile ? { x: -300 } : undefined}
      className={`${
        isMobile ? 'fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[280px]' : 'relative w-64'
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg flex flex-col h-full`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-3 group">
          <div className="relative">
            <img
              src="/logo-13962586_transparent (1).png"
              alt="Coworking Inmobiliario"
              className="w-12 h-12 object-contain transition-all duration-300 group-hover:scale-110 drop-shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-green-400 to-purple-500 rounded-lg blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Coworking Inmobiliario</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarItem key={item.id} item={item} />
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={() => navigate('/admin/profile')}
          className="flex items-center space-x-3 mb-4 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {currentUser?.full_name || currentUser?.email || 'Usuario'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentUser?.role === 'admin' ? 'Administrador' : 'Asesor'} →
            </p>
          </div>
        </button>
        
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <Sidebar isMobile />
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  Panel de Administración
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Gestiona tu inmobiliaria desde aquí
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {currentUser?.id && (
                <AdminNotificationBadge 
                  userId={currentUser.id}
                  onClick={() => setNotificationCenterOpen(!notificationCenterOpen)}
                />
              )}
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Quick Actions Floating Button */}
      <QuickActions />

      {/* Notification Center Modal */}
      <AnimatePresence>
        {notificationCenterOpen && currentUser?.id && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotificationCenterOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 right-4 z-50"
            >
              <AdminNotificationCenter 
                userId={currentUser.id}
                onClose={() => setNotificationCenterOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminLayout;
