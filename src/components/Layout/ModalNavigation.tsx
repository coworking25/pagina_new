import React from 'react';
import { motion } from 'framer-motion';
import { useModalStore } from '../../store/modalStore';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowLeftIcon,
  XMarkIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

interface ModalNavigationProps {
  currentModalType: string;
  onClose: () => void;
}

const ModalNavigation: React.FC<ModalNavigationProps> = ({ currentModalType, onClose }) => {
  const { 
    switchToModal, 
    goBackInModals, 
    modalHistory
  } = useModalStore();

  const modalOptions = [
    {
      type: 'property',
      title: 'Propiedad',
      icon: BuildingOfficeIcon,
      action: () => switchToModal('property'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      type: 'client',
      title: 'Cliente',
      icon: UserGroupIcon,
      action: () => switchToModal('client'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      type: 'appointment',
      title: 'Cita',
      icon: CalendarIcon,
      action: () => switchToModal('appointment'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      type: 'advisor',
      title: 'Asesor',
      icon: UserGroupIcon,
      action: () => switchToModal('advisor'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const availableModals = modalOptions.filter(modal => modal.type !== currentModalType);

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Left: Back and Close */}
      <div className="flex items-center space-x-2">
        {modalHistory.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goBackInModals}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            title="Volver al modal anterior"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </motion.button>
        )}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          title="Cerrar modal"
        >
          <XMarkIcon className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Center: Modal Type Indicator */}
      <div className="flex items-center space-x-2">
        <ArrowsRightLeftIcon className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Cambiar a:
        </span>
      </div>

      {/* Right: Switch Modal Options */}
      <div className="flex items-center space-x-2">
        {availableModals.map((modal) => (
          <motion.button
            key={modal.type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={modal.action}
            className={`flex items-center px-3 py-2 rounded-lg text-white text-xs font-medium transition-all ${modal.color}`}
            title={`Cambiar a ${modal.title}`}
          >
            <modal.icon className="h-4 w-4 mr-1" />
            {modal.title}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ModalNavigation;
