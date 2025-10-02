import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = true 
}) => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setCheckComplete(true);
    }
  }, [isLoading]);

  // Mostrar loading mientras verifica autenticación
  if (isLoading || !checkComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Verificando autenticación...
          </p>
        </motion.div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated || !user) {
    console.log('❌ Usuario no autenticado - mostrando login');
    return <Login />;
  }

  // Si requiere admin y no es admin, mostrar mensaje de acceso denegado
  if (requireAdmin && !isAdmin) {
    console.log('❌ Usuario no tiene permisos de admin');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
        >
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No tienes permisos suficientes para acceder a esta página.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Usuario: <span className="font-medium">{user.email}</span><br />
            Rol: <span className="font-medium">{user.role}</span>
          </p>
        </motion.div>
      </div>
    );
  }

  // Usuario autenticado y con permisos correctos
  console.log('✅ Autenticación exitosa - mostrando contenido protegido');
  return <>{children}</>;
};

export default ProtectedRoute;
