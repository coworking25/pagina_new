import React from 'react';
import { motion } from 'framer-motion';

/**
 * Componente de loading page
 * Usado como fallback en React.Suspense para code splitting
 */
const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        {/* Spinner animado */}
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-green-600"
          />
        </div>

        {/* Texto de carga con puntos animados */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Cargando
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ...
            </motion.span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Por favor espera un momento
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

/**
 * Componente de loading pequeño (para usar en componentes)
 */
export const SmallLoader: React.FC<{ message?: string }> = ({ message = 'Cargando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="inline-block h-8 w-8 rounded-full border-3 border-gray-200 dark:border-gray-700 border-t-green-600 mb-3"
      />
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
};

/**
 * Componente de skeleton loader (para listas)
 */
export const SkeletonLoader: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-24"
        />
      ))}
    </div>
  );
};

export default PageLoader;
