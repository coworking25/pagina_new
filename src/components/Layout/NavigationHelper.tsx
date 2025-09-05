import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useModalStore } from '../../store/modalStore';
import {
  HomeIcon,
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

const NavigationHelper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    modalHistory, 
    currentModal, 
    goBackInModals, 
    closeAllModals,
    openNavigationModal 
  } = useModalStore();

  const isDashboard = location.pathname === '/admin/dashboard';
  const hasModalHistory = modalHistory.length > 0;
  const hasActiveModal = currentModal !== null;

  const handleGoHome = () => {
    closeAllModals();
    navigate('/admin/dashboard');
  };

  const handleOpenCommandPalette = () => {
    openNavigationModal();
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col space-y-3">
      {/* Go to Dashboard Button */}
      {!isDashboard && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onClick={handleGoHome}
          className="group flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105"
          title="Volver al Dashboard"
        >
          <HomeIcon className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Dashboard</span>
        </motion.button>
      )}

      {/* Modal Navigation Back Button */}
      {hasModalHistory && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onClick={goBackInModals}
          className="group flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105"
          title="Volver al modal anterior"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Anterior</span>
        </motion.button>
      )}

      {/* Switch Between Modals */}
      {hasActiveModal && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onClick={handleOpenCommandPalette}
          className="group flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105"
          title="Cambiar modal"
        >
          <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Cambiar</span>
        </motion.button>
      )}

      {/* Command Palette Trigger */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        onClick={handleOpenCommandPalette}
        className="group flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105"
        title="Command Palette (Ctrl+K)"
      >
        <CommandLineIcon className="h-5 w-5 mr-2" />
        <span className="text-sm font-medium">Comandos</span>
      </motion.button>
    </div>
  );
};

export default NavigationHelper;
