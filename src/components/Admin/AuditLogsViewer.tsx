import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Calendar, 
  Database, 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  X
} from 'lucide-react';
import { getAuditLogs, AuditLog } from '../../lib/supabase';

interface AuditLogsViewerProps {
  onClose?: () => void;
}

export default function AuditLogsViewer({ onClose }: AuditLogsViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTable, setFilterTable] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs(200); // Cargar últimos 200 logs
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.record_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTable = filterTable === 'all' || log.table_name === filterTable;
    const matchesAction = filterAction === 'all' || log.action === filterAction;

    return matchesSearch && matchesTable && matchesAction;
  });

  // Obtener tablas únicas para el filtro
  const uniqueTables = Array.from(new Set(logs.map(log => log.table_name)));

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Icono por acción
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT': return <Plus className="w-4 h-4 text-green-600" />;
      case 'UPDATE': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'DELETE': return <Trash2 className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  // Color por acción
  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <History className="w-6 h-6 mr-2 text-purple-600" />
            Logs de Auditoría
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Historial de cambios y actividades en el sistema
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadLogs}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Recargar"
          >
            <History className="w-5 h-5" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por usuario, ID o tabla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterTable}
          onChange={(e) => setFilterTable(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">Todas las tablas</option>
          {uniqueTables.map(table => (
            <option key={table} value={table}>{table}</option>
          ))}
        </select>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">Todas las acciones</option>
          <option value="INSERT">Creación (INSERT)</option>
          <option value="UPDATE">Edición (UPDATE)</option>
          <option value="DELETE">Eliminación (DELETE)</option>
        </select>
      </div>

      {/* Lista de Logs */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No se encontraron registros de auditoría</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {log.table_name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                          ID: {log.record_id}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <User className="w-3 h-3 mr-1" />
                        {log.user_email || 'Sistema'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(log.changed_at)}
                    </div>
                    <button className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center justify-end w-full">
                      <Eye className="w-3 h-3 mr-1" />
                      {selectedLog?.id === log.id ? 'Ocultar detalles' : 'Ver detalles'}
                    </button>
                  </div>
                </div>

                {/* Detalles Expandibles */}
                <AnimatePresence>
                  {selectedLog?.id === log.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        {log.old_data && (
                          <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                            <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">Valor Anterior</h4>
                            <pre className="whitespace-pre-wrap overflow-x-auto text-gray-700 dark:text-gray-300">
                              {JSON.stringify(log.old_data, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.new_data && (
                          <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                            <h4 className="font-bold text-green-700 dark:text-green-400 mb-2">Valor Nuevo</h4>
                            <pre className="whitespace-pre-wrap overflow-x-auto text-gray-700 dark:text-gray-300">
                              {JSON.stringify(log.new_data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
