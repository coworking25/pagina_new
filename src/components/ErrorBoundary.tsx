import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * 
 * Captura errores de JavaScript en cualquier parte del árbol de componentes hijo,
 * registra esos errores y muestra una UI de respaldo en lugar de crashear toda la app.
 * 
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Actualizar estado para mostrar la UI de respaldo en el siguiente renderizado
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Registrar error para monitoreo (puede integrarse con Sentry, LogRocket, etc.)
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Aquí puedes enviar el error a un servicio de monitoreo
    // Ejemplo: Sentry.captureException(error, { extra: errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Si se proporciona un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de error por defecto
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            {/* Icono de Error */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-6">
                <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              ¡Ups! Algo salió mal
            </h1>

            {/* Descripción */}
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Lo sentimos, ha ocurrido un error inesperado. 
              Nuestro equipo ha sido notificado y estamos trabajando para solucionarlo.
            </p>

            {/* Detalles del Error (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-8 text-left">
                <details className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <summary className="cursor-pointer font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Detalles técnicos (solo visible en desarrollo)
                  </summary>
                  <div className="mt-4 space-y-2">
                    <div>
                      <strong className="text-red-600 dark:text-red-400">Error:</strong>
                      <pre className="mt-2 p-3 bg-white dark:bg-gray-800 rounded overflow-auto text-sm">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong className="text-red-600 dark:text-red-400">Stack Trace:</strong>
                        <pre className="mt-2 p-3 bg-white dark:bg-gray-800 rounded overflow-auto text-sm max-h-64">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Recargar Página
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-all duration-200 shadow-lg border-2 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <Home className="w-5 h-5 mr-2" />
                Ir al Inicio
              </button>
            </div>

            {/* Información de Contacto */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Si el problema persiste, por favor contáctanos en{' '}
                <a 
                  href="mailto:soporte@coworking25.com" 
                  className="text-green-600 dark:text-green-400 hover:underline font-medium"
                >
                  soporte@coworking25.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
