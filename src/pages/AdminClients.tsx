import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  User,
  Mail,
  Phone,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Clock,
  X,
  Save,
  UserCheck,
  PhoneCall,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getServiceInquiries, updateServiceInquiry, deleteServiceInquiry } from '../lib/supabase';

interface Client {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_type: string;
  urgency: string;
  budget: string;
  status: 'pending' | 'contacted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  details: string;
  source: string;
}

function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      console.log('👥 Cargando clientes desde Supabase...');
      
      const inquiriesData = await getServiceInquiries();
      console.log('✅ Clientes obtenidos:', inquiriesData);
      console.log('📊 Número de clientes:', inquiriesData?.length || 0);
      
      // Mapear los datos de ServiceInquiry a Client
      const mappedClients: Client[] = inquiriesData.map((inquiry: any) => ({
        id: inquiry.id || `temp-${Math.random()}`,
        client_name: inquiry.client_name,
        client_email: inquiry.client_email,
        client_phone: inquiry.client_phone,
        service_type: inquiry.service_type,
        urgency: inquiry.urgency || 'normal',
        budget: inquiry.budget || 'No especificado',
        status: inquiry.status || 'pending',
        created_at: inquiry.created_at,
        details: inquiry.details || '',
        source: inquiry.source || 'website'
      }));
      
      console.log('🗂️ Clientes mapeados:', mappedClients);
      console.log('📈 Estados encontrados:', [...new Set(mappedClients.map(c => c.status))]);
      
      setClients(mappedClients);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error cargando clientes:', error);
      setClients([]);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contacted': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'scheduled': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'flexible': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Modal handlers
  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditForm({ ...client });
    setShowEditModal(true);
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  const handleContactClient = (client: Client, method: 'phone' | 'email' | 'whatsapp') => {
    switch (method) {
      case 'phone':
        window.open(`tel:${client.client_phone}`);
        break;
      case 'email':
        window.open(`mailto:${client.client_email}?subject=Contacto desde Coworking Inmobiliario - ${formatServiceType(client.service_type)}`);
        break;
      case 'whatsapp':
        const phoneNumber = client.client_phone.replace(/[^\d]/g, '');
        const serviceType = formatServiceType(client.service_type);
        const urgencyText = client.urgency === 'urgent' ? ' URGENTE' : client.urgency === 'normal' ? '' : ' (flexible)';
        
        const message = `¡Hola ${client.client_name}! 👋

Nos comunicamos desde *Coworking Inmobiliario* para darle seguimiento a su consulta sobre *${serviceType}*${urgencyText}.

📋 *Detalles de su solicitud:*
• Servicio: ${serviceType}
• Presupuesto: ${client.budget}
• Fecha de consulta: ${formatDate(client.created_at)}

Estamos aquí para ayudarle con todas sus necesidades inmobiliarias. ¿Cuándo le viene mejor que conversemos sobre su proyecto?

¡Esperamos poder servirle pronto! 🏠✨

_Coworking Inmobiliaria - Su socio confiable en bienes raíces_`;
        
        window.open(`https://wa.me/57${phoneNumber}?text=${encodeURIComponent(message)}`);
        break;
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    
    try {
      console.log('🔄 Actualizando cliente:', editForm.id, editForm);
      
      // Preparar los datos para actualizar con tipos correctos
      const updateData = {
        client_name: editForm.client_name,
        client_email: editForm.client_email,
        client_phone: editForm.client_phone,
        service_type: editForm.service_type as any,
        urgency: editForm.urgency as any,
        budget: editForm.budget,
        status: editForm.status,
        details: editForm.details,
        updated_at: new Date().toISOString()
      };
      
      // Actualizar en Supabase
      const updatedClient = await updateServiceInquiry(editForm.id!, updateData);
      
      if (updatedClient) {
        console.log('✅ Cliente actualizado correctamente:', updatedClient);
        
        // Actualizar el estado local
        setClients(clients.map(client => 
          client.id === editForm.id ? { ...client, ...updateData } : client
        ));
        
        // Cerrar modal
        setShowEditModal(false);
        setEditForm(null);
        
        // Mostrar notificación de éxito (puedes agregar una librería de toast aquí)
        alert('Cliente actualizado correctamente');
      } else {
        throw new Error('No se pudo actualizar el cliente');
      }
      
    } catch (error) {
      console.error('❌ Error actualizando cliente:', error);
      alert('Error al actualizar el cliente. Por favor, inténtalo de nuevo.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClient) return;
    
    try {
      console.log('🗑️ Eliminando cliente:', selectedClient.id);
      
      // Eliminar en Supabase
      const success = await deleteServiceInquiry(selectedClient.id!);
      
      if (success) {
        console.log('✅ Cliente eliminado correctamente');
        
        // Actualizar el estado local
        setClients(clients.filter(client => client.id !== selectedClient.id));
        
        // Cerrar modal
        setShowDeleteModal(false);
        setSelectedClient(null);
        
        // Mostrar notificación de éxito
        alert('Cliente eliminado correctamente');
      } else {
        throw new Error('No se pudo eliminar el cliente');
      }
      
    } catch (error) {
      console.error('❌ Error eliminando cliente:', error);
      alert('Error al eliminar el cliente. Por favor, inténtalo de nuevo.');
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedClient(null);
    setEditForm(null);
  };

  const formatServiceType = (serviceType: string) => {
    const serviceMap: { [key: string]: string } = {
      'arrendamientos': 'Arrendamientos',
      'ventas': 'Ventas',
      'avaluos': 'Avalúos',
      'remodelacion': 'Remodelación',
      'construccion': 'Construcción',
      'asesorias-contables': 'Asesorías Contables'
    };
    return serviceMap[serviceType] || serviceType;
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.client_phone.includes(searchTerm);
    const matchesService = serviceFilter === 'all' || client.service_type === serviceFilter;
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesService && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Clientes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra todas las consultas e inquiries de clientes
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Cliente
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{clients.length}</p>
            </div>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
              <p className="text-xl font-bold text-yellow-600">
                {clients.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Contactados</p>
              <p className="text-xl font-bold text-purple-600">
                {clients.filter(c => c.status === 'contacted').length}
              </p>
            </div>
            <UserCheck className="w-6 h-6 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Agendados</p>
              <p className="text-xl font-bold text-cyan-600">
                {clients.filter(c => c.status === 'scheduled').length}
              </p>
            </div>
            <Calendar className="w-6 h-6 text-cyan-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">En Progreso</p>
              <p className="text-xl font-bold text-blue-600">
                {clients.filter(c => c.status === 'in_progress').length}
              </p>
            </div>
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completados</p>
              <p className="text-xl font-bold text-green-600">
                {clients.filter(c => c.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Service Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los servicios</option>
              <option value="arrendamientos">Arrendamientos</option>
              <option value="ventas">Ventas</option>
              <option value="avaluos">Avalúos</option>
              <option value="remodelacion">Remodelación</option>
              <option value="construccion">Construcción</option>
              <option value="asesorias-contables">Asesorías Contables</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="contacted">Contactado</option>
              <option value="scheduled">Agendado</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Clients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Presupuesto
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.map((client, index) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {client.client_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {client.client_email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {client.client_phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatServiceType(client.service_type)}
                      </span>
                      <div className="mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(client.urgency)}`}>
                          {client.urgency === 'urgent' && 'Urgente'}
                          {client.urgency === 'normal' && 'Normal'}
                          {client.urgency === 'flexible' && 'Flexible'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {client.budget}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                      {client.status === 'pending' && 'Pendiente'}
                      {client.status === 'contacted' && 'Contactado'}
                      {client.status === 'scheduled' && 'Agendado'}
                      {client.status === 'in_progress' && 'En Progreso'}
                      {client.status === 'completed' && 'Completado'}
                      {client.status === 'cancelled' && 'Cancelado'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(client.created_at)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewClient(client)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditClient(client)}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleContactClient(client, 'whatsapp')}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Contactar por WhatsApp"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteClient(client)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay clientes encontrados
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron clientes que coincidan con los filtros aplicados.
            </p>
          </div>
        )}
      </motion.div>

      {/* Modales */}
      <AnimatePresence>
        {/* Modal Ver Cliente */}
        {showViewModal && selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Detalles del Cliente
                </h2>
                <button
                  onClick={closeModals}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre Completo
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedClient.client_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estado
                    </label>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedClient.status)}`}>
                      {selectedClient.status === 'pending' && 'Pendiente'}
                      {selectedClient.status === 'contacted' && 'Contactado'}
                      {selectedClient.status === 'scheduled' && 'Agendado'}
                      {selectedClient.status === 'in_progress' && 'En Progreso'}
                      {selectedClient.status === 'completed' && 'Completado'}
                      {selectedClient.status === 'cancelled' && 'Cancelado'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{selectedClient.client_email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{selectedClient.client_phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Servicio Solicitado
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {formatServiceType(selectedClient.service_type)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Presupuesto
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedClient.budget}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Urgencia
                    </label>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(selectedClient.urgency)}`}>
                      {selectedClient.urgency === 'urgent' && 'Urgente'}
                      {selectedClient.urgency === 'normal' && 'Normal'}
                      {selectedClient.urgency === 'flexible' && 'Flexible'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha de Registro
                    </label>
                    <p className="text-gray-900 dark:text-white">{formatDate(selectedClient.created_at)}</p>
                  </div>
                </div>
                
                {selectedClient.details && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Detalles Adicionales
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {selectedClient.details}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleContactClient(selectedClient, 'phone')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Llamar
                  </button>
                  <button
                    onClick={() => handleContactClient(selectedClient, 'email')}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </button>
                  <button
                    onClick={() => handleContactClient(selectedClient, 'whatsapp')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal Editar Cliente */}
        {showEditModal && editForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Editar Cliente
                </h2>
                <button
                  onClick={closeModals}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={editForm.client_name}
                      onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estado
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Client['status'] })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="contacted">Contactado</option>
                      <option value="scheduled">Agendado</option>
                      <option value="in_progress">En Progreso</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.client_email}
                      onChange={(e) => setEditForm({ ...editForm, client_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={editForm.client_phone}
                      onChange={(e) => setEditForm({ ...editForm, client_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Servicio
                    </label>
                    <select
                      value={editForm.service_type}
                      onChange={(e) => setEditForm({ ...editForm, service_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="arrendamientos">Arrendamientos</option>
                      <option value="ventas">Ventas</option>
                      <option value="avaluos">Avalúos</option>
                      <option value="remodelacion">Remodelación</option>
                      <option value="construccion">Construcción</option>
                      <option value="asesorias-contables">Asesorías Contables</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Presupuesto
                    </label>
                    <input
                      type="text"
                      value={editForm.budget}
                      onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Urgencia
                    </label>
                    <select
                      value={editForm.urgency}
                      onChange={(e) => setEditForm({ ...editForm, urgency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="flexible">Flexible</option>
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Detalles Adicionales
                  </label>
                  <textarea
                    value={editForm.details}
                    onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detalles adicionales sobre la consulta..."
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </button>
                  <button
                    onClick={closeModals}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal Eliminar Cliente */}
        {showDeleteModal && selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-4">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Eliminar Cliente
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  ¿Estás seguro de que deseas eliminar a{' '}
                  <span className="font-semibold">{selectedClient.client_name}</span>?
                  Toda la información asociada se perderá permanentemente.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </button>
                  <button
                    onClick={closeModals}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminClients;
