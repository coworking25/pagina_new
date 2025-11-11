import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  X
} from 'lucide-react';
import type { ClientAlert } from '../../types/clientPortal';
import Card from '../UI/Card';

interface AlertsSectionProps {
  alerts: ClientAlert[];
  onMarkAsRead: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

const AlertsSection: React.FC<AlertsSectionProps> = ({
  alerts,
  onMarkAsRead,
  onDismiss
}) => {
  if (alerts.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <CheckCircle className="w-5 h-5" />
          <p>No tienes alertas pendientes</p>
        </div>
      </Card>
    );
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="w-5 h-5" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5" />;
      case 'low':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          text: 'text-red-900 dark:text-red-100'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          text: 'text-yellow-900 dark:text-yellow-100'
        };
      case 'low':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-900 dark:text-blue-100'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          icon: 'text-gray-600 dark:text-gray-400',
          text: 'text-gray-900 dark:text-gray-100'
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Alertas ({alerts.length})
        </h2>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const styles = getAlertStyles(alert.severity);
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 ${styles.bg} border ${styles.border}`}>
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`${styles.icon} mt-0.5`}>
                    {getAlertIcon(alert.severity)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${styles.text} mb-1`}>
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {alert.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                      <span>{formatDate(alert.created_at)}</span>
                      {alert.alert_type && (
                        <span className="capitalize">{alert.alert_type.replace('_', ' ')}</span>
                      )}
                    </div>

                    {/* Actions */}
                    {alert.status === 'active' && (
                      <button
                        onClick={() => onMarkAsRead(alert.id)}
                        className={`mt-2 text-xs font-medium ${styles.icon} hover:underline`}
                      >
                        Marcar como leída
                      </button>
                    )}
                  </div>

                  {/* Dismiss Button */}
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Descartar alerta"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsSection;
