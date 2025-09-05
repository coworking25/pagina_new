import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '../../store/modalStore';
import { 
  Plus, 
  Building, 
  Users, 
  Calendar, 
  Home,
  X,
  UserCheck
} from 'lucide-react';

const QuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { 
    openPropertyModal, 
    openClientModal, 
    openAppointmentModal, 
    openAdvisorModal 
  } = useModalStore();

  const quickActions = [
    {
      id: 'property',
      label: 'Nueva Propiedad',
      icon: Building,
      action: () => openPropertyModal(),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'client',
      label: 'Nuevo Cliente',
      icon: Users,
      action: () => openClientModal(),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'appointment',
      label: 'Nueva Cita',
      icon: Calendar,
      action: () => openAppointmentModal(),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'advisor',
      label: 'Nuevo Asesor',
      icon: UserCheck,
      action: () => openAdvisorModal(),
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      action: () => navigate('/admin/dashboard'),
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  const handleActionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-20"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Quick Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-16 right-0 space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { delay: index * 0.1 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: 20, 
                    scale: 0.8,
                    transition: { delay: (quickActions.length - index - 1) * 0.05 }
                  }}
                  onClick={() => handleActionClick(action.action)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 ${action.color} text-white rounded-full shadow-lg
                    transition-all duration-200 hover:shadow-xl transform hover:scale-105
                    group min-w-max
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {action.label}
                  </span>
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
          w-14 h-14 rounded-full shadow-lg flex items-center justify-center
          transition-all duration-300 transform hover:scale-110
          ${isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-green-600 hover:bg-green-700'
          }
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={false}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {/* Tooltip for closed state */}
      {!isOpen && (
        <div className="absolute bottom-16 right-0 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Acciones Rápidas
        </div>
      )}
    </div>
  );
};

export default QuickActions;
