import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { isAuthenticated, getCurrentUser } from '../lib/supabase';
import Login from '../pages/Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = true 
}) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const authenticated = await isAuthenticated();
      const currentUser = getCurrentUser();
      
      if (authenticated && currentUser) {
        if (requireAdmin && currentUser.role !== 'admin') {
          setIsAuth(false);
          return;
        }
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      setIsAuth(false);
    }
  };

  const handleLoginSuccess = () => {
    checkAuthentication();
  };

  // Mostrar loading mientras verifica
  if (isAuth === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando acceso...</p>
        </motion.div>
      </div>
    );
  }

  // Mostrar login si no está autenticado
  if (!isAuth) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Mostrar contenido protegido
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      {children}
    </motion.div>
  );
};

export default ProtectedRoute;
