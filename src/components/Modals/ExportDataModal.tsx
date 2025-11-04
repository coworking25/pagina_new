import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle
} from 'lucide-react';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Función en Mantenimiento
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center py-8">
              <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Exportación de Datos Temporalmente Deshabilitada
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Esta funcionalidad está siendo actualizada. Por favor, utiliza la interfaz normal para gestionar los datos.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExportDataModal;