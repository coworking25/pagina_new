import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Search, 
  Filter, 
  User, 
  FileText, 
  Calendar,
  ArrowRight,
  Shield,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import FloatingCard from '../components/UI/FloatingCard';

interface AuditLog {
  id: number;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: any;
  new_data: any;
  changed_by: string;
  changed_at: string;
  user_email?: string; // Si podemos hacer join con auth.users
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTable, setFilterTable] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // Intentar obtener logs de una tabla centralizada de auditoría si existe
      // Si no, simular o buscar en tablas específicas si tienen columnas de auditoría
      
      // NOTA: Como no tenemos una tabla centralizada de auditoría confirmada en el esquema,
      // vamos a intentar leer de una tabla hipotética 'audit_logs' o 'system_logs'.
      // Si no existe, mostraremos un mensaje de configuración necesaria.
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(100);

      if (error) {
        // Si la tabla no existe, manejamos el error silenciosamente para mostrar estado vacío
        console.warn('Tabla audit_logs no encontrada o error de permisos:', error);
        setLogs([]);
      } else {
        setLogs(data || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesTable = filterTable === 'all' || log.table_name === filterTable;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesSearch = searchTerm === '' || 
      JSON.stringify(log.new_data).toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.old_data).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase()));
      
    return matchesTable && matchesAction && matchesSearch;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'UPDATE': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'DELETE': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const formatData = (data: any) => {
    if (!data) return <span className="text-gray-400 italic">N/A</span>;
    return (
      <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto max-w-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Logs de Auditoría
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Registro histórico de cambios en el sistema
          </p>
        </div>
        
        <button 
          onClick={fetchLogs}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          Refrescar Logs
        </button>
      </div>

      {/* Filtros */}
      <FloatingCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en datos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Todas las tablas</option>
              <option value="properties">Propiedades</option>
              <option value="clients">Clientes</option>
              <option value="appointments">Citas</option>
              <option value="users">Usuarios</option>
            </select>
          </div>

          <div className="relative">
            <History className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Todas las acciones</option>
              <option value="INSERT">Creación (INSERT)</option>
              <option value="UPDATE">Actualización (UPDATE)</option>
              <option value="DELETE">Eliminación (DELETE)</option>
            </select>
          </div>
        </div>
      </FloatingCard>

      {/* Tabla de Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay logs disponibles</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              No se encontraron registros de auditoría. Es posible que la tabla 'audit_logs' no exista o no tenga datos aún.
            </p>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left max-w-lg mx-auto">
              <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Configuración Requerida:</h4>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Para activar la auditoría, ejecuta el script SQL de configuración de auditoría en Supabase para crear la tabla y los triggers necesarios.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3">Fecha / Hora</th>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Acción</th>
                  <th className="px-6 py-3">Tabla / ID</th>
                  <th className="px-6 py-3">Cambios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(log.changed_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {log.user_email || log.changed_by || 'Sistema'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">{log.table_name}</span>
                        <span className="text-xs text-gray-500 font-mono">ID: {log.record_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {log.action === 'UPDATE' ? (
                          <>
                            <div className="opacity-50">{formatData(log.old_data)}</div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <div>{formatData(log.new_data)}</div>
                          </>
                        ) : log.action === 'INSERT' ? (
                          <div>{formatData(log.new_data)}</div>
                        ) : (
                          <div className="opacity-50">{formatData(log.old_data)}</div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
