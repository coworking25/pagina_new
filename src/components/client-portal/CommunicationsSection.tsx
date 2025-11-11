import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  MailOpen,
  AlertCircle,
  FileText,
  Wrench,
  MessageCircle,
  Archive,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import type { ClientCommunication } from '../../types/clientPortal';
import Card from '../UI/Card';

interface CommunicationsSectionProps {
  communications: ClientCommunication[];
  onMarkAsRead: (communicationId: string) => void;
  onArchive: (communicationId: string) => void;
  onSendMessage: (subject: string, message: string, category: string) => void;
}

const CommunicationsSection: React.FC<CommunicationsSectionProps> = ({
  communications,
  onMarkAsRead,
  onArchive,
  onSendMessage
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newCategory, setNewCategory] = useState<'general' | 'payment' | 'contract' | 'maintenance' | 'document' | 'other'>('general');

  // Iconos por categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment':
        return AlertCircle;
      case 'contract':
        return FileText;
      case 'maintenance':
        return Wrench;
      case 'document':
        return FileText;
      case 'general':
      default:
        return MessageCircle;
    }
  };

  // Colores por prioridad
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-900 dark:text-red-100',
          icon: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
        };
      case 'low':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-900 dark:text-blue-100',
          icon: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
        };
      default: // normal
        return {
          bg: 'bg-gray-50 dark:bg-gray-800/50',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-900 dark:text-gray-100',
          icon: 'text-gray-600 dark:text-gray-400',
          badge: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        };
    }
  };

  // Formatear fecha relativa
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleToggleExpand = (id: string, readAt: string | null) => {
    setExpandedId(expandedId === id ? null : id);
    
    // Marcar como leído al expandir si no ha sido leído
    if (expandedId !== id && !readAt) {
      onMarkAsRead(id);
    }
  };

  const handleSendNewMessage = () => {
    if (!newSubject.trim() || !newMessage.trim()) return;
    
    onSendMessage(newSubject, newMessage, newCategory);
    
    // Limpiar formulario
    setNewSubject('');
    setNewMessage('');
    setNewCategory('general');
    setShowNewMessage(false);
  };

    const unreadCount = communications.filter(comm => !comm.read_at).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Mensajes
          </h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {unreadCount} mensaje{unreadCount !== 1 ? 's' : ''} sin leer
            </p>
          )}
        </div>
        <button
          onClick={() => setShowNewMessage(!showNewMessage)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Send className="w-4 h-4" />
          Nuevo Mensaje
        </button>
      </div>

      {/* Formulario de nuevo mensaje */}
      <AnimatePresence>
        {showNewMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Nuevo Mensaje
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="general">General</option>
                    <option value="payment">Pagos</option>
                    <option value="contract">Contrato</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="document">Documentos</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Asunto
                  </label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Escribe el asunto del mensaje"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe tu mensaje aquí"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowNewMessage(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSendNewMessage}
                    disabled={!newSubject.trim() || !newMessage.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Enviar Mensaje
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de mensajes */}
      {communications.length === 0 ? (
        <Card className="p-8 text-center">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            No tienes mensajes
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {communications.map((comm, index) => {
            const styles = getPriorityStyles(comm.priority);
            const CategoryIcon = getCategoryIcon(comm.category);
            const isExpanded = expandedId === comm.id;
            const isUnread = !comm.read_at;

            return (
              <motion.div
                key={comm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`overflow-hidden transition-all ${
                    isUnread ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  {/* Header del mensaje */}
                  <div
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      isExpanded ? 'border-b border-gray-200 dark:border-gray-700' : ''
                    }`}
                    onClick={() => handleToggleExpand(comm.id, comm.read_at)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icono de estado */}
                      <div className={`${styles.bg} p-2 rounded-lg flex-shrink-0`}>
                        {isUnread ? (
                          <Mail className={`w-5 h-5 ${styles.icon}`} />
                        ) : (
                          <MailOpen className={`w-5 h-5 ${styles.icon}`} />
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-semibold ${isUnread ? 'font-bold' : ''} ${styles.text}`}>
                            {comm.subject}
                          </h3>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <CategoryIcon className="w-3 h-3" />
                            {comm.category}
                          </span>
                          <span>{formatDate(comm.created_at)}</span>
                          {comm.priority !== 'normal' && (
                            <span className={`px-2 py-0.5 rounded-full ${styles.badge} text-xs font-medium`}>
                              {comm.priority === 'high' ? 'Urgente' : 'Baja prioridad'}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            De: {comm.sender_type === 'admin' ? 'Administración' : comm.sender_type === 'system' ? 'Sistema' : 'Tú'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contenido expandido */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-200 dark:border-gray-700"
                      >
                        <div className="p-4 space-y-4">
                          {/* Mensaje */}
                          <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {comm.description}
                            </p>
                          </div>

                          {/* Acciones */}
                          <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                            {comm.status !== 'archived' && (
                              <button
                                onClick={() => onArchive(comm.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                <Archive className="w-4 h-4" />
                                Archivar
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunicationsSection;
