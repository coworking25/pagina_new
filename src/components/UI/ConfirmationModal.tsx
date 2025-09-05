import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: 'text-red-600',
          bgColor: 'bg-red-100',
          buttonColor: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'info':
        return {
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-100',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default:
        return {
          iconColor: 'text-red-600',
          bgColor: 'bg-red-100',
          buttonColor: 'bg-red-600 hover:bg-red-700 text-white'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${styles.bgColor}`}>
                    <AlertTriangle className={`h-6 w-6 ${styles.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Message */}
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                >
                  {cancelText}
                </Button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${styles.buttonColor}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
