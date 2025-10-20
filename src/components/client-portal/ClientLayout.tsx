import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  FileText,
  CreditCard,
  FileBarChart,
  FolderOpen,
  User,
  LogOut,
  Bell,
  Settings
} from 'lucide-react';
import { getSession, clientLogout } from '../../lib/client-portal/clientAuth';
import type { ClientSession } from '../../types/clientPortal';

const ClientLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<ClientSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);

  // Verificar sesión al cargar
  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate('/login');
    } else {
      setSession(currentSession);
    }
  }, [navigate]);

  const handleLogout = async () => {
    await clientLogout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/cliente/dashboard',
      icon: Home,
      label: 'Dashboard',
      description: 'Resumen general'
    },
    {
      path: '/cliente/contratos',
      icon: FileText,
      label: 'Mis Contratos',
      description: 'Contratos activos'
    },
    {
      path: '/cliente/pagos',
      icon: CreditCard,
      label: 'Mis Pagos',
      description: 'Historial de pagos'
    },
    {
      path: '/cliente/extractos',
      icon: FileBarChart,
      label: 'Extractos',
      description: 'Reportes y extractos'
    },
    {
      path: '/cliente/documentos',
      icon: FolderOpen,
      label: 'Documentos',
      description: 'Mis documentos'
    },
    {
      path: '/cliente/perfil',
      icon: User,
      label: 'Mi Perfil',
      description: 'Datos personales'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full z-30 top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y Menu Mobile */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    Portal de Clientes
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bienvenido, {session.full_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Notificaciones */}
              <button className="relative p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Configuración */}
              <button
                onClick={() => navigate('/cliente/perfil')}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs opacity-75">{item.description}</p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
              {session.full_name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                {session.full_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 lg:hidden flex flex-col"
            >
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        active
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs opacity-75">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Footer Sidebar Mobile */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {session.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {session.full_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session.email}
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Alerta de cambio de contraseña */}
      {session.must_change_password && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-yellow-50 dark:bg-yellow-900/20 border-t-4 border-yellow-400 p-4 z-20">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Atención:</strong> Debes cambiar tu contraseña temporal
              </p>
            </div>
            <button
              onClick={() => navigate('/cliente/perfil')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              Cambiar Ahora
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientLayout;
