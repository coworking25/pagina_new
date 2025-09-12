import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  User,
  Mail,
  Phone,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  CheckCircle,
  AlertCircle,
  Home,
  DollarSign,
  FileText,
  X
} from 'lucide-react';
import { 
  getClients, 
  createClient, 
  updateClient, 
  deleteClient,
  createContract,
  getContracts,
  getPayments,
  getClientCommunications,
  getActiveAlerts,
  markPaymentAsPaid
} from '../lib/clientsApi';
import type { Client, Contract, Payment, ClientCommunication, ClientAlert } from '../types/clients';

function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  
  // Estados para datos adicionales del cliente
  const [clientContracts, setClientContracts] = useState<Contract[]>([]);
  const [clientPayments, setClientPayments] = useState<Payment[]>([]);
  const [clientCommunications, setClientCommunications] = useState<ClientCommunication[]>([]);
  const [clientAlerts, setClientAlerts] = useState<ClientAlert[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'contracts', 'payments', 'communications', 'alerts'
  const [createForm, setCreateForm] = useState({
    full_name: '',
    document_type: 'cedula' as const,
    document_number: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    client_type: 'renter' as const,
    status: 'active' as const,
    monthly_income: '',
    occupation: '',
    company_name: '',
    notes: '',
    // Campos adicionales para contrato
    contract_type: 'rental' as const,
    start_date: '',
    end_date: '',
    monthly_rent: '',
    deposit_amount: '',
    contract_duration_months: '12'
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      console.log('👥 Cargando clientes desde Supabase...');
      
      const clientsData = await getClients();
      console.log('✅ Clientes obtenidos:', clientsData);
      console.log('📊 Número de clientes:', clientsData?.length || 0);
      
      setClients(clientsData || []);
      console.log('🗂️ Clientes cargados exitosamente');
    } catch (error) {
      console.error('❌ Error al cargar clientes:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de filtrado
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      client.phone.includes(searchTerm) ||
      (client.document_number && client.document_number.includes(searchTerm));
    
    const matchesType = typeFilter === 'all' || client.client_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Estadísticas
  const stats = {
    total: clients.length,
    renters: clients.filter(c => c.client_type === 'renter' || c.client_type === 'tenant').length,
    owners: clients.filter(c => c.client_type === 'owner' || c.client_type === 'landlord').length,
    buyers: clients.filter(c => c.client_type === 'buyer').length,
    sellers: clients.filter(c => c.client_type === 'seller').length,
    active: clients.filter(c => c.status === 'active').length,
    inactive: clients.filter(c => c.status === 'inactive').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'suspended': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'blocked': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'renter': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'tenant': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';  // Agregado para compatibilidad
      case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'landlord': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';  // Agregado para compatibilidad
      case 'buyer': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'seller': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatClientType = (type: string) => {
    switch (type) {
      case 'renter': return 'Inquilino';
      case 'tenant': return 'Inquilino';  // Agregado para compatibilidad
      case 'owner': return 'Propietario';
      case 'landlord': return 'Propietario';  // Agregado para compatibilidad
      case 'buyer': return 'Comprador';
      case 'seller': return 'Vendedor';
      default: return type;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'pending': return 'Pendiente';
      case 'suspended': return 'Suspendido';
      case 'blocked': return 'Bloqueado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'partial': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'terminated': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'draft': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getAlertPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Modal handlers
  const handleViewClient = async (client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
    setActiveTab('info');
    
    // Cargar detalles adicionales del cliente
    setLoadingDetails(true);
    try {
      console.log('🔍 Cargando detalles del cliente:', client.id);
      
      // Cargar contratos
      const contracts = await getContracts(client.id);
      setClientContracts(contracts || []);
      console.log('📄 Contratos cargados:', contracts?.length || 0);
      
      // Cargar pagos
      const payments = await getPayments(client.id);
      setClientPayments(payments || []);
      console.log('💰 Pagos cargados:', payments?.length || 0);
      
      // Cargar comunicaciones
      const communications = await getClientCommunications(client.id);
      setClientCommunications(communications || []);
      console.log('📞 Comunicaciones cargadas:', communications?.length || 0);
      
      // Cargar alertas
      const alerts = await getActiveAlerts(client.id);
      setClientAlerts(alerts || []);
      console.log('🚨 Alertas cargadas:', alerts?.length || 0);
      
    } catch (error) {
      console.error('❌ Error cargando detalles del cliente:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditForm(client);
    setShowEditModal(true);
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  const handleContactClient = (client: Client, method: 'phone' | 'email' | 'whatsapp') => {
    switch (method) {
      case 'phone':
        window.open(`tel:${client.phone}`);
        break;
      case 'email':
        window.open(`mailto:${client.email}?subject=Contacto desde Coworking Inmobiliario`);
        break;
      case 'whatsapp':
        const phoneNumber = client.phone.replace(/[^\d]/g, '');
        const message = `¡Hola ${client.full_name}! 👋

Nos comunicamos desde *Coworking Inmobiliario* para darle seguimiento.

¡Esperamos poder servirle pronto! 🏠✨`;
        
        window.open(`https://wa.me/57${phoneNumber}?text=${encodeURIComponent(message)}`);
        break;
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm || !selectedClient) return;
    
    try {
      console.log('🔄 Actualizando cliente:', editForm);
      
      const updatedClient = await updateClient(selectedClient.id, editForm);
      
      if (updatedClient) {
        console.log('✅ Cliente actualizado correctamente:', updatedClient);
        
        setClients(clients.map(client => 
          client.id === selectedClient.id ? { ...client, ...updatedClient } : client
        ));
        
        setShowEditModal(false);
        setEditForm({});
        setSelectedClient(null);
        
        alert('Cliente actualizado correctamente');
      }
    } catch (error) {
      console.error('❌ Error actualizando cliente:', error);
      alert('Error al actualizar el cliente. Por favor, inténtalo de nuevo.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedClient) return;
    
    try {
      console.log('🗑️ Eliminando cliente:', selectedClient.id);
      
      await deleteClient(selectedClient.id);
      
      setClients(clients.filter(client => client.id !== selectedClient.id));
      setShowDeleteModal(false);
      setSelectedClient(null);
      
      alert('Cliente eliminado correctamente');
    } catch (error) {
      console.error('❌ Error eliminando cliente:', error);
      alert('Error al eliminar el cliente. Por favor, inténtalo de nuevo.');
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      full_name: '',
      document_type: 'cedula' as const,
      document_number: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      client_type: 'renter' as const,
      status: 'active' as const,
      monthly_income: '',
      occupation: '',
      company_name: '',
      notes: '',
      contract_type: 'rental' as const,
      start_date: '',
      end_date: '',
      monthly_rent: '',
      deposit_amount: '',
      contract_duration_months: '12'
    });
  };

  const handleCreateClient = async () => {
    try {
      // Validaciones básicas
      if (!createForm.full_name.trim()) {
        alert('El nombre completo es requerido');
        return;
      }
      if (!createForm.document_number.trim()) {
        alert('El número de documento es requerido');
        return;
      }
      if (!createForm.phone.trim()) {
        alert('El teléfono es requerido');
        return;
      }

      console.log('👤 Creando nuevo cliente:', createForm);
      
      // Preparar datos del cliente
      const clientData = {
        full_name: createForm.full_name.trim(),
        document_type: createForm.document_type,
        document_number: createForm.document_number.trim(),
        phone: createForm.phone.trim(),
        email: createForm.email.trim() || undefined,
        address: createForm.address.trim() || undefined,
        city: createForm.city.trim() || undefined,
        emergency_contact_name: createForm.emergency_contact_name.trim() || undefined,
        emergency_contact_phone: createForm.emergency_contact_phone.trim() || undefined,
        client_type: createForm.client_type,
        status: createForm.status,
        monthly_income: createForm.monthly_income ? Number(createForm.monthly_income) : undefined,
        occupation: createForm.occupation.trim() || undefined,
        company_name: createForm.company_name.trim() || undefined,
        notes: createForm.notes.trim() || undefined
      };

      // Crear cliente
      const newClient = await createClient(clientData);
      console.log('✅ Cliente creado:', newClient);

      // Si tiene fechas de contrato, crear contrato también
      if (createForm.start_date && (createForm.client_type === 'renter' || createForm.client_type === 'tenant')) {
        try {
          console.log('📄 Creando contrato para el cliente...');
          
          const contractData = {
            client_id: newClient.id,
            contract_type: createForm.contract_type,
            status: 'active' as const,
            start_date: createForm.start_date,
            end_date: createForm.end_date || undefined,
            monthly_rent: createForm.monthly_rent ? Number(createForm.monthly_rent) : undefined,
            deposit_amount: createForm.deposit_amount ? Number(createForm.deposit_amount) : undefined,
            contract_duration_months: Number(createForm.contract_duration_months),
            renewal_type: 'manual' as const,
            payment_day: 1,
            late_fee_percentage: 5
          };

          const newContract = await createContract(contractData);
          console.log('✅ Contrato creado:', newContract);
        } catch (contractError) {
          console.error('⚠️ Error creando contrato (cliente creado exitosamente):', contractError);
          alert('Cliente creado exitosamente, pero hubo un error al crear el contrato. Puedes agregarlo manualmente después.');
        }
      }

      // Actualizar lista de clientes
      await loadClients();
      
      // Cerrar modal y resetear formulario
      setShowCreateModal(false);
      resetCreateForm();
      
      alert('Cliente creado exitosamente');
      
    } catch (error) {
      console.error('❌ Error creando cliente:', error);
      alert('Error al crear el cliente. Por favor, inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Cargando clientes...
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Conectando con la base de datos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Clientes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra tu base de clientes reales
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inquilinos</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.renters}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Propietarios</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.owners}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Compradores</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.buyers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactivos</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos los tipos</option>
            <option value="renter">Inquilinos</option>
            <option value="owner">Propietarios</option>
            <option value="buyer">Compradores</option>
            <option value="seller">Vendedores</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="pending">Pendientes</option>
            <option value="suspended">Suspendidos</option>
            <option value="blocked">Bloqueados</option>
          </select>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {client.full_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                    {formatStatus(client.status)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(client.client_type)}`}>
                    {formatClientType(client.client_type)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleViewClient(client)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditClient(client)}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClient(client)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{client.phone}</span>
              </div>
              {client.document_number && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{client.document_number}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(client.created_at)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleContactClient(client, 'phone')}
                className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700"
              >
                <Phone className="w-3 h-3" />
                Llamar
              </button>
              <button
                onClick={() => handleContactClient(client, 'email')}
                className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700"
              >
                <Mail className="w-3 h-3" />
                Email
              </button>
              <button
                onClick={() => handleContactClient(client, 'whatsapp')}
                className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white py-1 px-2 rounded text-xs hover:bg-green-600"
              >
                <MessageSquare className="w-3 h-3" />
                WhatsApp
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron clientes
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {clients.length === 0 
              ? 'Aún no tienes clientes registrados en la base de datos'
              : 'Intenta ajustar los filtros de búsqueda'}
          </p>
          {clients.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              Crear Primer Cliente
            </button>
          )}
        </div>
      )}

      {/* Modal Ver Cliente */}
      {showViewModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedClient.full_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedClient.status)}`}>
                      {formatStatus(selectedClient.status)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedClient.client_type)}`}>
                      {formatClientType(selectedClient.client_type)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pestañas */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Información
                </button>
                <button
                  onClick={() => setActiveTab('contracts')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'contracts'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Contratos ({clientContracts.length})
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'payments'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Pagos ({clientPayments.length})
                </button>
                <button
                  onClick={() => setActiveTab('communications')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'communications'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Comunicaciones ({clientCommunications.length})
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'alerts'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Alertas ({clientAlerts.length})
                </button>
              </div>

              {/* Contenido de las pestañas */}
              <div className="min-h-[400px]">
                {loadingDetails && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando detalles...</span>
                  </div>
                )}

                {/* Pestaña Información */}
                {activeTab === 'info' && !loadingDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                        Información Personal
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900 dark:text-white">{selectedClient.email || 'No especificado'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Teléfono
                        </label>
                        <p className="text-gray-900 dark:text-white">{selectedClient.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Documento
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedClient.document_type?.toUpperCase()} {selectedClient.document_number}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Dirección
                        </label>
                        <p className="text-gray-900 dark:text-white">{selectedClient.address || 'No especificada'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Ciudad
                        </label>
                        <p className="text-gray-900 dark:text-white">{selectedClient.city || 'No especificada'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                        Información Adicional
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Ocupación
                        </label>
                        <p className="text-gray-900 dark:text-white">{selectedClient.occupation || 'No especificada'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Empresa
                        </label>
                        <p className="text-gray-900 dark:text-white">{selectedClient.company_name || 'No especificada'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Ingresos Mensuales
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedClient.monthly_income ? formatCurrency(selectedClient.monthly_income) : 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Contacto de Emergencia
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedClient.emergency_contact_name || 'No especificado'}
                          {selectedClient.emergency_contact_phone && ` - ${selectedClient.emergency_contact_phone}`}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Fecha de Registro
                        </label>
                        <p className="text-gray-900 dark:text-white">{formatDate(selectedClient.created_at)}</p>
                      </div>
                      {selectedClient.notes && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notas
                          </label>
                          <p className="text-gray-900 dark:text-white text-sm">{selectedClient.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pestaña Contratos */}
                {activeTab === 'contracts' && !loadingDetails && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Contratos ({clientContracts.length})
                      </h3>
                    </div>
                    {clientContracts.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No hay contratos registrados</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {clientContracts.map((contract) => (
                          <div key={contract.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContractStatusColor(contract.status)}`}>
                                    {contract.status}
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {contract.contract_type}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Contrato #{contract.contract_number || contract.id.slice(0, 8)}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Inicio:</span>
                                <p className="font-medium">{formatDate(contract.start_date)}</p>
                              </div>
                              {contract.end_date && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Fin:</span>
                                  <p className="font-medium">{formatDate(contract.end_date)}</p>
                                </div>
                              )}
                              {contract.monthly_rent && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Arriendo:</span>
                                  <p className="font-medium">{formatCurrency(contract.monthly_rent)}</p>
                                </div>
                              )}
                              {contract.deposit_amount && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Depósito:</span>
                                  <p className="font-medium">{formatCurrency(contract.deposit_amount)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Pestaña Pagos */}
                {activeTab === 'payments' && !loadingDetails && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Historial de Pagos ({clientPayments.length})
                      </h3>
                    </div>
                    {clientPayments.length === 0 ? (
                      <div className="text-center py-8">
                        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No hay pagos registrados</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {clientPayments.slice(0, 10).map((payment) => (
                          <div key={payment.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                                    {payment.status}
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {payment.payment_type}
                                  </span>
                                </div>
                                <p className="font-medium text-lg">{formatCurrency(payment.amount)}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Fecha límite:</span>
                                <p className="font-medium">{formatDate(payment.due_date)}</p>
                              </div>
                              {payment.payment_date && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Fecha pago:</span>
                                  <p className="font-medium">{formatDate(payment.payment_date)}</p>
                                </div>
                              )}
                              {payment.amount_paid > 0 && (
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Pagado:</span>
                                  <p className="font-medium">{formatCurrency(payment.amount_paid)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {clientPayments.length > 10 && (
                          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Mostrando 10 de {clientPayments.length} pagos
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Pestaña Comunicaciones */}
                {activeTab === 'communications' && !loadingDetails && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Historial de Comunicaciones ({clientCommunications.length})
                      </h3>
                    </div>
                    {clientCommunications.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No hay comunicaciones registradas</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {clientCommunications.slice(0, 10).map((comm) => (
                          <div key={comm.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">{comm.communication_type}</span>
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {formatDate(comm.communication_date)}
                                  </span>
                                </div>
                                {comm.subject && (
                                  <p className="font-medium text-gray-900 dark:text-white">{comm.subject}</p>
                                )}
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                comm.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {comm.status}
                              </span>
                            </div>
                            {comm.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{comm.description}</p>
                            )}
                            {comm.outcome && (
                              <p className="text-sm text-gray-800 dark:text-gray-300">
                                <strong>Resultado:</strong> {comm.outcome}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Pestaña Alertas */}
                {activeTab === 'alerts' && !loadingDetails && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Alertas Activas ({clientAlerts.length})
                      </h3>
                    </div>
                    {clientAlerts.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No hay alertas activas</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {clientAlerts.map((alert) => (
                          <div key={alert.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertPriorityColor(alert.priority)}`}>
                                    {alert.priority}
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {alert.alert_type}
                                  </span>
                                </div>
                                <p className="font-medium text-gray-900 dark:text-white">{alert.title}</p>
                              </div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {formatDate(alert.created_at)}
                              </span>
                            </div>
                            {alert.message && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{alert.message}</p>
                            )}
                            {alert.due_date && (
                              <p className="text-sm text-gray-800 dark:text-gray-300">
                                <strong>Fecha límite:</strong> {formatDate(alert.due_date)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditClient(selectedClient);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar Cliente
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Editar Cliente
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={editForm.full_name || ''}
                      onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo de Cliente
                    </label>
                    <select
                      value={editForm.client_type || ''}
                      onChange={(e) => setEditForm({...editForm, client_type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="renter">Inquilino</option>
                      <option value="owner">Propietario</option>
                      <option value="buyer">Comprador</option>
                      <option value="seller">Vendedor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estado
                    </label>
                    <select
                      value={editForm.status || ''}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="pending">Pendiente</option>
                      <option value="suspended">Suspendido</option>
                      <option value="blocked">Bloqueado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Documento
                    </label>
                    <input
                      type="text"
                      value={editForm.document_number || ''}
                      onChange={(e) => setEditForm({...editForm, document_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Crear Cliente */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Crear Nuevo Cliente
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                    Información Personal
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={createForm.full_name}
                      onChange={(e) => setCreateForm({...createForm, full_name: e.target.value})}
                      placeholder="Ej: Juan Pérez García"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo Documento *
                      </label>
                      <select
                        value={createForm.document_type}
                        onChange={(e) => setCreateForm({...createForm, document_type: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="cedula">Cédula</option>
                        <option value="pasaporte">Pasaporte</option>
                        <option value="nit">NIT</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Número Documento *
                      </label>
                      <input
                        type="text"
                        value={createForm.document_number}
                        onChange={(e) => setCreateForm({...createForm, document_number: e.target.value})}
                        placeholder="1234567890"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={createForm.phone}
                        onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                        placeholder="+57 300 123 4567"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                        placeholder="correo@ejemplo.com"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={createForm.address}
                      onChange={(e) => setCreateForm({...createForm, address: e.target.value})}
                      placeholder="Calle 123 #45-67"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={createForm.city}
                      onChange={(e) => setCreateForm({...createForm, city: e.target.value})}
                      placeholder="Bogotá"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo de Cliente *
                      </label>
                      <select
                        value={createForm.client_type}
                        onChange={(e) => setCreateForm({...createForm, client_type: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="renter">Inquilino</option>
                        <option value="owner">Propietario</option>
                        <option value="buyer">Comprador</option>
                        <option value="seller">Vendedor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Estado *
                      </label>
                      <select
                        value={createForm.status}
                        onChange={(e) => setCreateForm({...createForm, status: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="pending">Pendiente</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Información Adicional y Contrato */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                    Información Adicional
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ocupación
                      </label>
                      <input
                        type="text"
                        value={createForm.occupation}
                        onChange={(e) => setCreateForm({...createForm, occupation: e.target.value})}
                        placeholder="Ingeniero"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Empresa
                      </label>
                      <input
                        type="text"
                        value={createForm.company_name}
                        onChange={(e) => setCreateForm({...createForm, company_name: e.target.value})}
                        placeholder="ABC Ltda."
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ingresos Mensuales
                    </label>
                    <input
                      type="number"
                      value={createForm.monthly_income}
                      onChange={(e) => setCreateForm({...createForm, monthly_income: e.target.value})}
                      placeholder="2500000"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contacto Emergencia
                      </label>
                      <input
                        type="text"
                        value={createForm.emergency_contact_name}
                        onChange={(e) => setCreateForm({...createForm, emergency_contact_name: e.target.value})}
                        placeholder="María García"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Teléfono Emergencia
                      </label>
                      <input
                        type="tel"
                        value={createForm.emergency_contact_phone}
                        onChange={(e) => setCreateForm({...createForm, emergency_contact_phone: e.target.value})}
                        placeholder="+57 301 234 5678"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Sección de Contrato (solo para inquilinos) */}
                  {(createForm.client_type === 'renter' || createForm.client_type === 'tenant') && (
                    <>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 mt-6">
                        Información del Contrato
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Fecha de Inicio
                          </label>
                          <input
                            type="date"
                            value={createForm.start_date}
                            onChange={(e) => setCreateForm({...createForm, start_date: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Fecha de Finalización
                          </label>
                          <input
                            type="date"
                            value={createForm.end_date}
                            onChange={(e) => setCreateForm({...createForm, end_date: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Arriendo Mensual
                          </label>
                          <input
                            type="number"
                            value={createForm.monthly_rent}
                            onChange={(e) => setCreateForm({...createForm, monthly_rent: e.target.value})}
                            placeholder="1500000"
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Depósito
                          </label>
                          <input
                            type="number"
                            value={createForm.deposit_amount}
                            onChange={(e) => setCreateForm({...createForm, deposit_amount: e.target.value})}
                            placeholder="1500000"
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Duración (meses)
                          </label>
                          <input
                            type="number"
                            value={createForm.contract_duration_months}
                            onChange={(e) => setCreateForm({...createForm, contract_duration_months: e.target.value})}
                            placeholder="12"
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notas
                    </label>
                    <textarea
                      value={createForm.notes}
                      onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                      placeholder="Información adicional sobre el cliente..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateClient}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Cliente
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {showDeleteModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Confirmar Eliminación
                </h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Estás seguro de que quieres eliminar al cliente <strong>{selectedClient.full_name}</strong>?
                Esta acción no se puede deshacer.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar Cliente
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AdminClients;
