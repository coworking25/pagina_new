import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import WhatsAppChatbot from './components/UI/WhatsAppChatbot';
import ScrollToTop from './components/UI/ScrollToTop';
import ScrollToTopOnRouteChange from './components/UI/ScrollToTopOnRouteChange';
import PageLoader from './components/UI/PageLoader';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { AdminBadgeProvider } from './contexts/AdminBadgeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppStateProvider } from './contexts/AppStateContext';
import './utils/debug';

// Code Splitting: Lazy loading de páginas públicas
const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Advisors = lazy(() => import('./pages/Advisors'));
const Documentation = lazy(() => import('./pages/Documentation'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const TestPage = lazy(() => import('./pages/TestPage'));
const TestAppointmentPage = lazy(() => import('./pages/TestAppointmentPage'));

// Code Splitting: Lazy loading de páginas admin
const AdminLayout = lazy(() => import('./components/Layout/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminAppointments = lazy(() => import('./pages/AdminAppointments'));
const AdminClients = lazy(() => import('./pages/AdminClients'));
const AdminProperties = lazy(() => import('./pages/AdminProperties'));
const AdminAdvisors = lazy(() => import('./pages/AdminAdvisors'));
const AdminInquiries = lazy(() => import('./pages/AdminInquiries'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminCalendar = lazy(() => import('./pages/AdminCalendar').then(module => ({ default: module.AdminCalendarPage })));

// Code Splitting: Lazy loading de páginas de cliente
const ClientLayout = lazy(() => import('./components/client-portal/ClientLayout'));
const ClientDashboard = lazy(() => import('./pages/client-portal/ClientDashboard'));
const ClientChangePassword = lazy(() => import('./pages/client-portal/ClientChangePassword'));
const ClientPayments = lazy(() => import('./pages/client-portal/ClientPayments'));
const ClientProperties = lazy(() => import('./pages/client-portal/ClientProperties'));
const ClientDocuments = lazy(() => import('./pages/client-portal/ClientDocuments'));
const ClientExtractos = lazy(() => import('./pages/client-portal/ClientExtractos'));

// Componente para manejar el layout según la ruta
const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isClientRoute = location.pathname.startsWith('/cliente');
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    console.log('🧭 Navegación a:', location.pathname);
    console.log('📍 Tipo de ruta:', {
      isAdminRoute,
      isClientRoute,
      isLoginPage,
      isPublicRoute: !isAdminRoute && !isClientRoute && !isLoginPage
    });
  }, [location.pathname, isAdminRoute, isClientRoute, isLoginPage]);

  try {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        {/* Solo mostrar Header y Footer en rutas públicas (no admin, ni cliente, ni login) */}
        {!isAdminRoute && !isClientRoute && !isLoginPage && <Header />}
        
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/test-appointment" element={<TestAppointmentPage />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/services" element={<Services />} />
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
                <Route path="calendar" element={<AdminCalendar />} />
                <Route path="clients" element={<AdminClients />} />
                <Route path="properties" element={<AdminProperties />} />
                <Route path="advisors" element={<AdminAdvisors />} />
                <Route path="service-inquiries" element={<AdminInquiries />} />
                <Route path="documents" element={<div>Documentos - En desarrollo</div>} />
                <Route path="reports" element={<div>Reportes - En desarrollo</div>} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Rutas de Cliente - Portal */}
              <Route path="/cliente/*" element={<ClientLayout />}>
                <Route path="dashboard" element={<ClientDashboard />} />
                <Route path="cambiar-password" element={<ClientChangePassword />} />
                <Route path="contratos" element={<ClientProperties />} />
                <Route path="pagos" element={<ClientPayments />} />
                <Route path="extractos" element={<ClientExtractos />} />
                <Route path="documentos" element={<ClientDocuments />} />
                <Route path="perfil" element={<div className="p-6">Perfil - En desarrollo</div>} />
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
      </Suspense>

        {/* Solo mostrar Footer en rutas públicas (no admin, ni cliente, ni login) */}
        {!isAdminRoute && !isClientRoute && !isLoginPage && <Footer />}
        
        {/* Chatbot flotante de WhatsApp - solo en rutas públicas */}
        {!isAdminRoute && !isClientRoute && !isLoginPage && <WhatsAppChatbot />}
        
        {/* Botón flotante para volver arriba - solo en rutas públicas */}
        {!isAdminRoute && !isClientRoute && !isLoginPage && <ScrollToTop />}
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
        <AppStateProvider>
          <NotificationProvider>
            <AdminBadgeProvider>
              <Router>
                <ScrollToTopOnRouteChange />
                <AppLayout />
              </Router>
            </AdminBadgeProvider>
          </NotificationProvider>
        </AppStateProvider>
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