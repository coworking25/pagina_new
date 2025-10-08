import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AdminLayout from './components/Layout/AdminLayout';
import WhatsAppChatbot from './components/UI/WhatsAppChatbot';
import ScrollToTop from './components/UI/ScrollToTop';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import ServiceDetail from './pages/ServiceDetail';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Advisors from './pages/Advisors';
import Documentation from './pages/Documentation';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminAppointments from './pages/AdminAppointments';
import AdminClients from './pages/AdminClients';
import AdminProperties from './pages/AdminProperties';
import AdminAdvisors from './pages/AdminAdvisors';
import AdminInquiries from './pages/AdminInquiries';
import AdminSettings from './pages/AdminSettings';
import TestPage from './pages/TestPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { AdminBadgeProvider } from './contexts/AdminBadgeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './utils/debug';

// Componente para manejar el layout según la ruta
const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    console.log('🧭 Navegación a:', location.pathname);
    console.log('📍 Tipo de ruta:', {
      isAdminRoute,
      isLoginPage,
      isPublicRoute: !isAdminRoute && !isLoginPage
    });
  }, [location.pathname, isAdminRoute, isLoginPage]);

  try {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        {/* Solo mostrar Header y Footer en rutas públicas (no admin ni login) */}
        {!isAdminRoute && !isLoginPage && <Header />}
        
        <AnimatePresence mode="wait">
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/services/:serviceId" element={<ServiceDetail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/advisors" element={<Advisors />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            
            {/* Rutas Admin */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="advisors" element={<AdminAdvisors />} />
              <Route path="service-inquiries" element={<AdminInquiries />} />
              <Route path="documents" element={<div>Documentos - En desarrollo</div>} />
              <Route path="reports" element={<div>Reportes - En desarrollo</div>} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* Ruta de fallback para 404 */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 pt-20">
                  <div className="text-center p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      Página no encontrada
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      La página que buscas no existe.
                    </p>
                    <a
                      href="/"
                      className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Volver al Inicio
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </AnimatePresence>

        {/* Solo mostrar Footer en rutas públicas (no admin ni login) */}
        {!isAdminRoute && !isLoginPage && <Footer />}
        
        {/* Chatbot flotante de WhatsApp - solo en rutas públicas */}
        {!isAdminRoute && !isLoginPage && <WhatsAppChatbot />}
        
        {/* Botón flotante para volver arriba - solo en rutas públicas */}
        {!isAdminRoute && !isLoginPage && <ScrollToTop />}
      </div>
    );
  } catch (error) {
    console.error('❌ Error crítico en AppLayout:', error);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Error de aplicación
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ha ocurrido un error crítico. Por favor, recarga la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Recargar Aplicación
          </button>
        </div>
      </div>
    );
  }
};

function App() {
  useEffect(() => {
    console.log('🚀 Aplicación iniciada');
    console.log('🌐 Entorno:', import.meta.env.MODE);
    console.log('📦 Versión:', import.meta.env.VITE_APP_VERSION || 'desarrollo');
    
    // Capturar errores globales
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Error global capturado:', event.error);
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Promise rechazada no manejada:', event.reason);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  try {
    return (
      <AuthProvider>
        <NotificationProvider>
          <AdminBadgeProvider>
            <Router>
              <AppLayout />
            </Router>
          </AdminBadgeProvider>
        </NotificationProvider>
      </AuthProvider>
    );
  } catch (error) {
    console.error('❌ Error crítico en App:', error);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Error crítico
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            La aplicación no puede iniciarse correctamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Intentar de Nuevo
          </button>
        </div>
      </div>
    );
  }
}

export default App;