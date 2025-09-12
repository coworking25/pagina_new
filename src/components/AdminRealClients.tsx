// =====================================================
// COMPONENTE ADMINISTRATIVO PARA GESTIÓN DE CLIENTES
// =====================================================

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign, 
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  XCircle,
  Download
} from 'lucide-react';

import {
  getClientsWithStats,
  getBasicStats,
  deleteClient,
  getActiveAlerts
} from '../lib/clientsApi';

import type { 
  ClientWithDetails, 
  ClientFilters,
  ClientAlert
} from '../types/clients';

// =====================================================
// INTERFACES Y TIPOS
// =====================================================

interface AdminRealClientsProps {
  className?: string;
}

interface ClientCardProps {
  client: ClientWithDetails;
  onView: (client: ClientWithDetails) => void;
  onEdit: (client: ClientWithDetails) => void;
  onDelete: (clientId: string) => void;
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  change?: string;
}

// =====================================================
// COMPONENTES AUXILIARES
// =====================================================

// Tarjeta de estadísticas
const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, change }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-xs text-green-600 mt-1">
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Tarjeta de cliente
const ClientCard: React.FC<ClientCardProps> = ({ client, onView, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case 'buyer': return 'bg-blue-100 text-blue-800';
      case 'seller': return 'bg-purple-100 text-purple-800';
      case 'renter': return 'bg-yellow-100 text-yellow-800';
      case 'owner': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header con nombre y estado */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{client.full_name}</h3>
          <p className="text-sm text-gray-600">{client.document_number}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
            {client.status}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getClientTypeColor(client.client_type)}`}>
            {client.client_type}
          </span>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span>{client.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{client.phone}</span>
        </div>
      </div>

      {/* Estadísticas del cliente */}
      {client.total_contracts !== undefined && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-md">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Contratos</p>
            <p className="text-lg font-bold text-blue-600">{client.total_contracts || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
            <p className="text-lg font-bold text-orange-600">{client.pending_payments || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Alertas</p>
            <p className="text-lg font-bold text-red-600">{client.active_alerts || 0}</p>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onView(client)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Ver
        </button>
        <button
          onClick={() => onEdit(client)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>
        <button
          onClick={() => onDelete(client.id)}
          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const AdminRealClients: React.FC<AdminRealClientsProps> = ({ className = '' }) => {
  // Estados principales
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [stats, setStats] = useState({
    total_clients: 0,
    total_contracts: 0,
    overdue_payments: 0,
    active_alerts: 0
  });
  const [alerts, setAlerts] = useState<ClientAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ClientFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Estados de modales (para implementación futura)
  const [, setSelectedClient] = useState<ClientWithDetails | null>(null);
  const [, setShowViewModal] = useState(false);
  const [, setShowEditModal] = useState(false);
  const [, setShowCreateModal] = useState(false);

  // =====================================================
  // EFECTOS Y FUNCIONES DE CARGA
  // =====================================================

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [clientsData, statsData, alertsData] = await Promise.all([
        getClientsWithStats(),
        getBasicStats(),
        getActiveAlerts()
      ]);

      setClients(clientsData);
      setStats(statsData);
      setAlerts(alertsData);

      console.log('✅ Datos cargados exitosamente:', {
        clients: clientsData.length,
        stats: statsData,
        alerts: alertsData.length
      });

    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError('Error al cargar los datos de clientes');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros de búsqueda
  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      client.full_name.toLowerCase().includes(searchLower) ||
      client.document_number.toLowerCase().includes(searchLower) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      client.phone.toLowerCase().includes(searchLower)
    );
  });

  // =====================================================
  // HANDLERS DE EVENTOS
  // =====================================================

  const handleViewClient = (client: ClientWithDetails) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleEditClient = (client: ClientWithDetails) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      return;
    }

    try {
      await deleteClient(clientId);
      setClients(prev => prev.filter(c => c.id !== clientId));
      console.log('✅ Cliente eliminado exitosamente');
    } catch (err) {
      console.error('❌ Error eliminando cliente:', err);
      alert('Error al eliminar el cliente');
    }
  };

  const handleCreateClient = () => {
    setSelectedClient(null);
    setShowCreateModal(true);
  };

  // =====================================================
  // RENDERIZADO
  // =====================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
        <button
          onClick={loadInitialData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600">Administra todos los clientes del sistema</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateClient}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Clientes"
          value={stats.total_clients}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatsCard
          title="Contratos Activos"
          value={stats.total_contracts}
          icon={<FileText className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
        />
        <StatsCard
          title="Pagos Vencidos"
          value={stats.overdue_payments}
          icon={<DollarSign className="w-6 h-6 text-orange-600" />}
          color="bg-orange-100"
        />
        <StatsCard
          title="Alertas Activas"
          value={stats.active_alerts}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          color="bg-red-100"
        />
      </div>

      {/* Alertas importantes */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Alertas Importantes</h3>
          </div>
          <div className="space-y-1">
            {alerts.slice(0, 3).map(alert => (
              <p key={alert.id} className="text-sm text-yellow-700">
                • {alert.message || alert.title}
              </p>
            ))}
            {alerts.length > 3 && (
              <p className="text-sm text-yellow-600">
                + {alerts.length - 3} alertas más
              </p>
            )}
          </div>
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar clientes por nombre, documento, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cliente
              </label>
              <select 
                value={filters.client_type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, client_type: e.target.value as any || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="buyer">Comprador</option>
                <option value="seller">Vendedor</option>
                <option value="renter">Arrendatario</option>
                <option value="owner">Propietario</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select 
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="suspended">Suspendido</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de clientes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Clientes ({filteredClients.length})
          </h2>
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron clientes</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Comienza agregando tu primer cliente'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(client => (
              <ClientCard
                key={client.id}
                client={client}
                onView={handleViewClient}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
              />
            ))}
          </div>
        )}
      </div>

      {/* TODO: Modales para Ver, Editar y Crear */}
      {/* Estos se implementarán en el siguiente paso */}
    </div>
  );
};

export default AdminRealClients;
