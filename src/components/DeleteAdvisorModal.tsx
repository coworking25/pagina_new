import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2, Loader } from 'lucide-react';
import { Advisor } from '../types';

interface DeleteAdvisorModalProps {
  advisor: Advisor | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

function DeleteAdvisorModal({ advisor, isOpen, onClose, onConfirm, isLoading = false }: DeleteAdvisorModalProps) {
  if (!advisor) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting advisor:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-red-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3" />
                  <h2 className="text-xl font-bold">Eliminar Asesor</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                {advisor.photo ? (
                  <img
                    src={advisor.photo}
                    alt={advisor.name}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  ¿Eliminar a {advisor.name}?
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400">
                  Esta acción no se puede deshacer. El asesor será marcado como inactivo y ya no aparecerá en el sistema.
                </p>
              </div>

              {/* Advisor Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Especialidad:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {advisor.specialty}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {advisor.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Teléfono:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {advisor.phone}
                    </span>
                  </div>
                  {advisor.experience_years && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Experiencia:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {advisor.experience_years} años
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  Cancelar
                </motion.button>
                
                <motion.button
                  onClick={handleConfirm}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar Asesor
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DeleteAdvisorModal;
