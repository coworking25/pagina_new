import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Home,
  MessageSquare,
  Users,
  BarChart3,
  X,
  Zap,
  ArrowUpRight
} from 'lucide-react';

const QuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'appointments',
      label: 'Citas del Día',
      icon: Calendar,
      action: () => navigate('/admin/appointments'),
      color: 'bg-blue-500 hover:bg-blue-600',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'properties',
      label: 'Propiedades',
      icon: Home,
      action: () => navigate('/admin/properties'),
      color: 'bg-green-500 hover:bg-green-600',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'inquiries',
      label: 'Consultas Servicio',
      icon: MessageSquare,
      action: () => navigate('/admin/service-inquiries'),
      color: 'bg-emerald-500 hover:bg-emerald-600',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'advisors',
      label: 'Asesores',
      icon: Users,
      action: () => navigate('/admin/advisors'),
      color: 'bg-purple-500 hover:bg-purple-600',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: BarChart3,
      action: () => navigate('/admin/reports'),
      color: 'bg-orange-500 hover:bg-orange-600',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      action: () => navigate('/admin/dashboard'),
      color: 'bg-gray-500 hover:bg-gray-600',
      gradient: 'from-gray-500 to-gray-600'
    }
  ];

  const handleActionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 group">
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Quick Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-16 sm:bottom-20 right-0 space-y-2 sm:space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    transition: { delay: index * 0.1, type: "spring", stiffness: 300 }
                  }}
                  exit={{
                    opacity: 0,
                    x: 20,
                    scale: 0.8,
                    transition: { delay: (quickActions.length - index - 1) * 0.05 }
                  }}
                  onClick={() => handleActionClick(action.action)}
                  className={`
                    relative flex items-center space-x-2 sm:space-x-3 px-3 sm:px-5 py-2 sm:py-3 text-white rounded-xl sm:rounded-2xl shadow-xl
                    transition-all duration-300 transform hover:scale-105 overflow-hidden
                    bg-gradient-to-r ${action.gradient} hover:shadow-2xl
                    border border-white/20 backdrop-blur-sm
                  `}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="text-xs sm:text-sm font-medium whitespace-nowrap relative z-10">
                    {action.label}
                  </span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10" />
                </motion.button>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center
          transition-all duration-500 transform hover:scale-110 overflow-hidden
          ${isOpen
            ? 'bg-gradient-to-r from-red-500 to-red-600 rotate-45'
            : 'bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 hover:shadow-blue-500/25'
          }
          border-2 border-white/20
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={false}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        {isOpen ? (
          <X className="w-5 h-5 sm:w-7 sm:h-7 text-white relative z-10" />
        ) : (
          <Zap className="w-5 h-5 sm:w-7 sm:h-7 text-white relative z-10" />
        )}
      </motion.button>

      {/* Tooltip for closed state */}
      {!isOpen && (
        <div className="absolute bottom-16 sm:bottom-20 right-0 bg-gray-900/90 dark:bg-gray-700/90 text-white text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none backdrop-blur-sm border border-white/10">
          Acciones Rápidas
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/90 dark:border-t-gray-700/90"></div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
