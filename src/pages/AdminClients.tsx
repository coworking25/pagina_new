import { useState, useEffect, useRef } from 'react';
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
  CheckCircle,
  AlertCircle,
  Home,
  DollarSign,
  FileText,
  X,
  MapPin,
  Briefcase,
  Clock,
  ChevronDown
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
  getClientPropertyRelations,
  updateClientPropertyRelation,
  getClientPropertySummary,
  createClientPropertyRelations,
  deleteClientPropertyRelation,
  generateContractPayments,
  checkClientExists
} from '../lib/clientsApi';
import { getProperties } from '../lib/supabase';
import Modal from '../components/UI/Modal';
import { ChevronLeft, ChevronRight, MapPin as MapPinIcon } from 'lucide-react';
import type { Client, Contract, Payment, ClientCommunication, ClientAlert, ClientPropertyRelation, ClientPropertySummary, ClientFormData, ContractFormData } from '../types/clients';

// Componente PropertySelector personalizado
interface PropertySelectorProps {
  properties: any[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  loading: boolean;
  placeholder: string;
}

function PropertySelector({ properties, selectedIds, onSelectionChange, loading, placeholder }: PropertySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleProperty = (propertyId: string) => {
    const newSelected = selectedIds.includes(propertyId)
      ? selectedIds.filter(id => id !== propertyId)
      : [...selectedIds, propertyId];
    onSelectionChange(newSelected);
  };

  const handleRemoveProperty = (propertyId: string) => {
    onSelectionChange(selectedIds.filter(id => id !== propertyId));
  };

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProperties = properties.filter(property => selectedIds.includes(property.id));

  if (loading) {
    return (
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cargando propiedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Chips de propiedades seleccionadas */}
      <div className="min-h-[42px] border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700">
        <div className="flex flex-wrap gap-1">
          {selectedProperties.map(property => (
            <span
              key={property.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
            >
              {property.title} ({property.code})
              <button
                type="button"
                onClick={() => handleRemoveProperty(property.id)}
                className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {selectedIds.length === 0 ? placeholder : 'Agregar más...'}
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Barra de búsqueda */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
            <input
              type="text"
              placeholder="Buscar propiedades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Lista de propiedades */}
          <div className="max-h-48 overflow-y-auto">
            {filteredProperties.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No se encontraron propiedades
              </div>
            ) : (
              filteredProperties.map(property => (
                <div
                  key={property.id}
                  className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                  onClick={() => handleToggleProperty(property.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(property.id)}
                    onChange={() => {}} // Controlado por el onClick del div
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {property.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {property.code} • ${property.price?.toLocaleString()} • {property.type}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  
  // Estados para datos adicionales del cliente
  const [clientContracts, setClientContracts] = useState<Contract[]>([]);
  const [clientPayments, setClientPayments] = useState<Payment[]>([]);
  const [clientCommunications, setClientCommunications] = useState<ClientCommunication[]>([]);
  const [clientAlerts, setClientAlerts] = useState<ClientAlert[]>([]);
  const [clientRelations, setClientRelations] = useState<ClientPropertyRelation[]>([]);
  const [clientPropertySummary, setClientPropertySummary] = useState<ClientPropertySummary | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'contracts', 'payments', 'communications', 'alerts', 'relaciones', 'analysis'
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableProperties, setAvailableProperties] = useState<any[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Estados para selección de propiedades en formularios
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [createSelectedPropertyIds, setCreateSelectedPropertyIds] = useState<string[]>([]);
  const [editSelectedPropertyIds, setEditSelectedPropertyIds] = useState<string[]>([]);
  const [loadingFormProperties, setLoadingFormProperties] = useState(false);

  // Estados para modal de detalles de propiedad
  const [showPropertyDetailsModal, setShowPropertyDetailsModal] = useState(false);
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reusable notification helper (same shape used elsewhere)
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    if (type === 'error') {
      alert(`❌ ${message}`);
    } else if (type === 'success') {
      alert(`✅ ${message}`);
    } else {
      alert(`ℹ️ ${message}`);
    }
  };
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
    client_type: 'tenant' as const, // Changed from 'renter' to 'tenant'
    status: 'active' as const,
    monthly_income: '',
    occupation: '',
    company_name: '',
    notes: '',
    // Contract-related fields
    start_date: '',
    contract_type: 'rental',
    end_date: '',
    monthly_rent: '',
    deposit_amount: '',
    contract_duration_months: '12'
  });

  useEffect(() => {
    loadClients();
    loadAllProperties();
  }, []);

  // Cargar todas las propiedades disponibles para selección en formularios
  const loadAllProperties = async () => {
    try {
      setLoadingFormProperties(true);
      const properties = await getProperties();
      setAllProperties(properties || []);
    } catch (error) {
      console.error('❌ Error cargando propiedades para formularios:', error);
      setAllProperties([]);
    } finally {
      setLoadingFormProperties(false);
    }
  };

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

  // Asignar propiedades a un cliente (modal)
  const openAssignModal = async (client: Client) => {
    setSelectedClient(client);
    setShowAssignModal(true);
    setSelectedPropertyIds([]);

    try {
      setLoadingProperties(true);
      const props = await getProperties();
      // Filtrar propiedades que ya tengan relación con el cliente (evitar duplicados en UI)
      const relatedIds = (clientRelations || []).map(r => String(r.property_id));
      const filtered = (props || []).filter((p: any) => !relatedIds.includes(String(p.id)));
      setAvailableProperties(filtered);
      // Guardar en una propiedad temporal la info si se excluyeron items
      (setAvailableProperties as any).excludedCount = (props || []).length - filtered.length;
    } catch (err) {
      console.error('❌ Error cargando propiedades para asignar:', err);
      setAvailableProperties([]);
      (setAvailableProperties as any).excludedCount = 0;
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleToggleSelectProperty = (id: string) => {
    setSelectedPropertyIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAssignProperties = async () => {
    if (!selectedClient) {
      alert('Selecciona primero un cliente');
      return;
    }
    if (selectedPropertyIds.length === 0) {
      alert('Selecciona al menos una propiedad para asignar');
      return;
    }

    // Preparar relaciones por defecto
    const relationsToCreate = selectedPropertyIds.map(pid => ({
      client_id: selectedClient.id,
      property_id: pid,
      relation_type: 'interested',
      status: 'pending'
    }));

    try {
      setIsAssigning(true);
      await createClientPropertyRelations(relationsToCreate as any[]);
      showNotification('Propiedades asignadas correctamente', 'success');
      setShowAssignModal(false);

      // Recargar relaciones y resumen
      const [relations, summary] = await Promise.all([
        getClientPropertyRelations(selectedClient.id),
        getClientPropertySummary(selectedClient.id)
      ]);
      setClientRelations(relations || []);
      setClientPropertySummary(summary || null);
    } catch (err: any) {
      console.error('❌ Error asignando propiedades:', err);
      showNotification(err?.message || 'Error asignando propiedades. Revisa la consola.', 'error');
    } finally {
      setIsAssigning(false);
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
      
      // Cargar relaciones cliente-propiedad y resumen
      try {
        const [relations, summary] = await Promise.all([
          getClientPropertyRelations(client.id),
          getClientPropertySummary(client.id)
        ]);
        setClientRelations(relations || []);
        setClientPropertySummary(summary || null);
        console.log('\ud83d\udcc3 Relaciones cargadas:', relations?.length || 0);
        console.log('\ud83d\udcca Resumen de propiedades:', summary || {});
      } catch (relError) {
        console.error('⚠️ Error cargando relaciones o resumen:', relError);
      }
      
    } catch (error) {
      console.error('❌ Error cargando detalles del cliente:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Acción: Marcar relación pendiente como activa (ej. crear contrato fuera de banda o actualizar estado)
  const handleMarkRelationActive = async (relation: ClientPropertyRelation) => {
    if (!relation || !relation.id) return;

    try {
      // 1) Preparar datos del contrato
      const startDate = relation.lease_start_date || new Date().toISOString().split('T')[0];
      const durationMonths = relation.lease_start_date ? relation.lease_end_date ? Math.max(1, Math.round((new Date(relation.lease_end_date).getTime() - new Date(startDate).getTime())/(1000*60*60*24*30))) : 12 : 12;
      const monthlyRent = relation.property?.price ? Number(relation.property.price) : undefined;

      // 2) Crear contrato si no existe
      let createdContract: any = null;
      if (!relation.contract_id) {
        try {
          const contractData = {
            client_id: relation.client_id,
            property_id: relation.property_id?.toString(),
            contract_type: 'rental',
            status: 'active',
            start_date: startDate,
            end_date: undefined,
            monthly_rent: monthlyRent,
            deposit_amount: monthlyRent ? Math.round(monthlyRent) : undefined,
            contract_duration_months: durationMonths,
            renewal_type: 'manual',
            payment_day: 1,
            late_fee_percentage: 5
          } as any;

          createdContract = await createContract(contractData);
          console.log('✅ Contrato creado automáticamente:', createdContract);
        } catch (contractError) {
          console.error('❌ Error creando contrato automáticamente:', contractError);
          alert('Error al crear contrato automáticamente. La relación no se actualizará.');
          return;
        }
      }

      // 3) Actualizar relación
      const updates: Partial<ClientPropertyRelation> = {
        status: 'active',
        relation_type: relation.relation_type === 'pending_contract' ? 'tenant' : relation.relation_type,
        lease_start_date: startDate,
        contract_id: createdContract ? createdContract.id : relation.contract_id
      };

      const updated = await updateClientPropertyRelation(relation.id, updates as any);

      // 4) Generar pagos si creamos contrato
      if (createdContract && createdContract.id) {
        try {
          await generateContractPayments(createdContract.id, 12);
          console.log('✅ Pagos generados para contrato:', createdContract.id);
        } catch (payError) {
          console.error('❌ Error generando pagos automáticos:', payError);
          alert('Contrato creado, pero hubo un error generando los pagos automáticos. Revisa la consola.');
        }
      }

      alert('Relación actualizada y contrato creado (si aplicó)');

      // 5) Recargar relaciones y resumen
      if (selectedClient) {
        const [relations, summary] = await Promise.all([
          getClientPropertyRelations(selectedClient.id),
          getClientPropertySummary(selectedClient.id)
        ]);
        setClientRelations(relations || []);
        setClientPropertySummary(summary || null);
      }

      return updated;
    } catch (error) {
      console.error('❌ Error marcando relación como activa:', error);
      alert('Error al actualizar la relación. Revisa la consola.');
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditForm(client);
    setShowEditModal(true);

    // Cargar propiedades asignadas al cliente para edición
    loadClientPropertyAssignments(client.id);
  };

  // Cargar asignaciones de propiedades para un cliente (para edición)
  const loadClientPropertyAssignments = async (clientId: string) => {
    try {
      const relations = await getClientPropertyRelations(clientId);
      const propertyIds = relations.map(relation => String(relation.property_id));
      setEditSelectedPropertyIds(propertyIds);
    } catch (error) {
      console.error('❌ Error cargando asignaciones de propiedades:', error);
      setEditSelectedPropertyIds([]);
    }
  };

  // Función para abrir modal de detalles de propiedad
  const handleViewPropertyDetails = (property: any) => {
    console.log('🔍 Abriendo detalles de propiedad desde cliente:', property);
    setSelectedPropertyForDetails(property);
    setCurrentImageIndex(0); // Reiniciar al primer índice
    setShowPropertyDetailsModal(true);
  };

  const handleDeleteClient = async (client: Client) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al cliente ${client.full_name}?`)) {
      try {
        await deleteClient(client.id);
        setClients(clients.filter(c => c.id !== client.id));
        alert('Cliente eliminado correctamente');
      } catch (error) {
        console.error('Error eliminando cliente:', error);
        alert('Error al eliminar el cliente');
      }
    }
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
        
        // Manejar cambios en asignaciones de propiedades
        await handlePropertyAssignmentsUpdate(selectedClient.id);
        
        setClients(clients.map(client => 
          client.id === selectedClient.id ? { ...client, ...updatedClient } : client
        ));
        
        setShowEditModal(false);
        setEditForm({});
        setSelectedClient(null);
        setEditSelectedPropertyIds([]);
        
        alert('Cliente actualizado correctamente');
      }
    } catch (error) {
      console.error('❌ Error actualizando cliente:', error);
      alert('Error al actualizar el cliente. Por favor, inténtalo de nuevo.');
    }
  };

  // Manejar actualizaciones de asignaciones de propiedades
  const handlePropertyAssignmentsUpdate = async (clientId: string) => {
    try {
      // Obtener relaciones actuales
      const currentRelations = await getClientPropertyRelations(clientId);
      const currentPropertyIds = currentRelations.map(r => String(r.property_id));
      
      // Determinar qué agregar y qué eliminar
      const toAdd = editSelectedPropertyIds.filter(id => !currentPropertyIds.includes(id));
      const toRemove = currentRelations.filter(r => !editSelectedPropertyIds.includes(String(r.property_id)));
      
      // Crear nuevas relaciones
      if (toAdd.length > 0) {
        const relationsToCreate = toAdd.map(pid => ({
          client_id: clientId,
          property_id: pid,
          relation_type: 'interested',
          status: 'pending'
        }));
        await createClientPropertyRelations(relationsToCreate as any[]);
        console.log(`✅ Agregadas ${toAdd.length} nuevas asignaciones de propiedad`);
      }
      
      // Eliminar relaciones removidas
      if (toRemove.length > 0) {
        for (const relation of toRemove) {
          await deleteClientPropertyRelation(relation.id);
        }
        console.log(`✅ Eliminadas ${toRemove.length} asignaciones de propiedad`);
      }
    } catch (error) {
      console.error('⚠️ Error actualizando asignaciones de propiedades:', error);
      throw error; // Re-lanzar para que sea manejado por el caller
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
      client_type: 'tenant' as const, // Changed from 'renter' to 'tenant'
      status: 'active' as const,
      monthly_income: '',
      occupation: '',
      company_name: '',
      notes: ''
    });
    setCreateSelectedPropertyIds([]);
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

      // Verificar si ya existe un cliente con el mismo tipo y número de documento
      try {
        const clientExists = await checkClientExists(createForm.document_type, createForm.document_number.trim());
        if (clientExists) {
          alert(`Ya existe un cliente con ${createForm.document_type} número ${createForm.document_number}. Por favor, verifica los datos o busca el cliente existente.`);
          return;
        }
      } catch (checkError) {
        console.error('⚠️ Error verificando existencia del cliente:', checkError);
        // Continuar con la creación si no se puede verificar (por si acaso)
      }
      
      // Preparar datos del cliente (solo campos que existen en la BD)
      const clientData: ClientFormData = {
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

      // Si se seleccionaron propiedades, crear las relaciones
      if (createSelectedPropertyIds.length > 0) {
        try {
          console.log('🏠 Creando relaciones cliente-propiedad...');
          
          const relationsToCreate = createSelectedPropertyIds.map(pid => ({
            client_id: newClient.id,
            property_id: pid,
            relation_type: 'interested',
            status: 'pending'
          }));

          await createClientPropertyRelations(relationsToCreate as any[]);
          console.log('✅ Relaciones cliente-propiedad creadas');
        } catch (relationError) {
          console.error('⚠️ Error creando relaciones cliente-propiedad (cliente creado exitosamente):', relationError);
          alert('Cliente creado exitosamente, pero hubo un error al asignar las propiedades. Puedes asignarlas manualmente después.');
        }
      }
      if (createForm.start_date && (createForm.client_type === 'renter' || createForm.client_type === 'tenant')) {
        try {
          console.log('📄 Creando contrato para el cliente...');
          
          const contractData: ContractFormData = {
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
      
    } catch (error: any) {
      console.error('❌ Error creando cliente:', error);

      // Manejar errores específicos
      if (error?.code === '23505') {
        // Error de clave duplicada
        alert(`Ya existe un cliente con ${createForm.document_type} número ${createForm.document_number}. Por favor, verifica los datos o busca el cliente existente.`);
      } else if (error?.message?.includes('duplicate key')) {
        // Otro tipo de error de duplicado
        alert('Ya existe un cliente con estos datos. Por favor, verifica la información.');
      } else {
        // Error genérico
        alert('Error al crear el cliente. Por favor, inténtalo de nuevo.');
      }
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            {/* Header con avatar y acciones */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {client.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
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
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleViewClient(client)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Ver detalles completos"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditClient(client)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Editar cliente"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Eliminar cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {client.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white truncate">{client.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                    <p className="text-gray-900 dark:text-white">{client.phone}</p>
                  </div>
                </div>

                {client.document_number && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Documento</p>
                      <p className="text-gray-900 dark:text-white">{client.document_number}</p>
                    </div>
                  </div>
                )}

                {(client.city || client.address) && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ubicación</p>
                      <p className="text-gray-900 dark:text-white truncate">
                        {client.city || client.address}
                      </p>
                    </div>
                  </div>
                )}

                {(client.occupation || client.company_name) && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Profesión</p>
                      <p className="text-gray-900 dark:text-white truncate">
                        {client.occupation || client.company_name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Información financiera (si existe) */}
              {client.monthly_income && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-green-800 dark:text-green-200 font-medium">
                      ${client.monthly_income.toLocaleString()} / mes
                    </span>
                  </div>
                </div>
              )}

              {/* Fecha de registro */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Clock className="w-3 h-3" />
                <span>Registrado: {formatDate(client.created_at)}</span>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="px-4 pb-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleContactClient(client, 'phone')}
                  className="flex items-center justify-center gap-1 bg-green-600 text-white py-2 px-3 rounded-lg text-xs hover:bg-green-700 transition-colors"
                  title="Llamar"
                >
                  <Phone className="w-3 h-3" />
                  <span className="hidden sm:inline">Llamar</span>
                </button>
                <button
                  onClick={() => handleContactClient(client, 'email')}
                  className="flex items-center justify-center gap-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-xs hover:bg-blue-700 transition-colors"
                  title="Enviar email"
                >
                  <Mail className="w-3 h-3" />
                  <span className="hidden sm:inline">Email</span>
                </button>
                <button
                  onClick={() => handleContactClient(client, 'whatsapp')}
                  className="flex items-center justify-center gap-1 bg-green-500 text-white py-2 px-3 rounded-lg text-xs hover:bg-green-600 transition-colors"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              </div>
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

      {/* Modal Asignar Propiedades */}
      {showAssignModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Asignar Propiedades a {selectedClient.full_name}</h3>
                <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5"/></button>
              </div>

              <div className="space-y-4">
                {loadingProperties ? (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    Cargando propiedades...
                  </div>
                ) : availableProperties.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No hay propiedades disponibles para asignar.</p>
                ) : (
                  <>
                    {((setAvailableProperties as any).excludedCount || 0) > 0 && (
                      <p className="text-sm text-gray-500">Se excluyeron {((setAvailableProperties as any).excludedCount)} propiedades que ya estaban relacionadas con este cliente.</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableProperties.map(prop => (
                        <label key={prop.id} className="p-3 border rounded-lg flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={selectedPropertyIds.includes(prop.id)} onChange={() => handleToggleSelectProperty(prop.id)} />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{prop.title}</div>
                            <div className="text-sm text-gray-500">{prop.price ? `$${Number(prop.price).toLocaleString()}` : 'Sin precio'} — {prop.status}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
                <button
                  onClick={handleAssignProperties}
                  disabled={isAssigning || selectedPropertyIds.length === 0}
                  className={`px-4 py-2 rounded-lg text-white ${isAssigning || selectedPropertyIds.length === 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isAssigning ? 'Asignando...' : `Asignar (${selectedPropertyIds.length})`}
                </button>
              </div>
            </div>
          </motion.div>
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
                <button
                  onClick={() => setActiveTab('relaciones')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'relaciones'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Propiedades ({clientRelations.length})
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'analysis'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Análisis
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

                    {/* Propiedades Asignadas - Resumen */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 flex items-center">
                        <Home className="w-5 h-5 mr-2 text-blue-600" />
                        Propiedades Asignadas ({clientRelations.length})
                      </h3>

                      {clientRelations.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Home className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 dark:text-gray-400 text-sm">No hay propiedades asignadas</p>
                          <button
                            onClick={() => selectedClient && openAssignModal(selectedClient)}
                            className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Asignar Propiedad
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {clientRelations.slice(0, 3).map((rel) => (
                            <div key={rel.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {rel.property?.images && rel.property.images.length > 0 ? (
                                    <img
                                      src={rel.property.images[0]}
                                      alt={rel.property.title}
                                      className="w-12 h-12 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                      <Home className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                      {rel.property?.title || `Propiedad #${rel.property_id}`}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {rel.property?.code} • {rel.property?.type} • ${rel.property?.price?.toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getContractStatusColor(rel.status || 'pending')}`}>
                                        {rel.status}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {rel.relation_type}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleViewPropertyDetails(rel.property)}
                                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                  title="Ver detalles de la propiedad"
                                >
                                  Ver
                                </button>
                              </div>
                            </div>
                          ))}

                          {clientRelations.length > 3 && (
                            <div className="text-center pt-2">
                              <button
                                onClick={() => setActiveTab('relaciones')}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                              >
                                Ver todas las {clientRelations.length} propiedades →
                              </button>
                            </div>
                          )}

                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <button
                              onClick={() => selectedClient && openAssignModal(selectedClient)}
                              className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Asignar Más Propiedades
                            </button>
                          </div>
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
                
                {/* Pestaña Relaciones */}
                {activeTab === 'relaciones' && !loadingDetails && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <Home className="w-5 h-5 mr-2 text-blue-600" />
                        Propiedades Asignadas ({clientRelations.length})
                      </h3>
                      <button
                        onClick={() => selectedClient && openAssignModal(selectedClient)}
                        disabled={!selectedClient}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          !selectedClient
                            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        } transition-colors`}
                      >
                        Asignar Propiedad
                      </button>
                    </div>

                    {clientRelations.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No hay propiedades asignadas
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Asigna propiedades a este cliente para comenzar a gestionar sus intereses inmobiliarios.
                        </p>
                        <button
                          onClick={() => selectedClient && openAssignModal(selectedClient)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Asignar Primera Propiedad
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {clientRelations.map((rel) => (
                          <div key={rel.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Imagen de la propiedad */}
                            <div className="relative h-32 bg-gray-200 dark:bg-gray-600">
                              {rel.property?.images && rel.property.images.length > 0 ? (
                                <img
                                  src={rel.property.images[0]}
                                  alt={rel.property.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Home className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                              <div className="absolute top-2 right-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContractStatusColor(rel.status || 'pending')}`}>
                                  {rel.status}
                                </span>
                              </div>
                            </div>

                            {/* Información de la propiedad */}
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 truncate">
                                    {rel.property?.title || `Propiedad #${rel.property_id}`}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    Código: {rel.property?.code} • {rel.property?.type}
                                  </p>
                                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                    ${rel.property?.price?.toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {/* Características principales */}
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-600 rounded text-xs">
                                  <div className="font-medium text-gray-900 dark:text-white">{rel.property?.bedrooms || 0}</div>
                                  <div className="text-gray-600 dark:text-gray-400">Hab</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-600 rounded text-xs">
                                  <div className="font-medium text-gray-900 dark:text-white">{rel.property?.bathrooms || 0}</div>
                                  <div className="text-gray-600 dark:text-gray-400">Baños</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-600 rounded text-xs">
                                  <div className="font-medium text-gray-900 dark:text-white">{rel.property?.area || 0}m²</div>
                                  <div className="text-gray-600 dark:text-gray-400">Área</div>
                                </div>
                              </div>

                              {/* Ubicación */}
                              <div className="mb-3">
                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {rel.property?.location}
                                </p>
                              </div>

                              {/* Estado de la propiedad */}
                              <div className="mb-3">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rel.property?.status || 'available')}`}>
                                  {rel.property?.status === 'available' && 'Disponible'}
                                  {rel.property?.status === 'sale' && 'En Venta'}
                                  {rel.property?.status === 'rent' && 'En Arriendo'}
                                  {rel.property?.status === 'sold' && 'Vendido'}
                                  {rel.property?.status === 'rented' && 'Arrendado'}
                                  {rel.property?.status === 'reserved' && 'Reservado'}
                                  {rel.property?.status === 'maintenance' && 'Mantenimiento'}
                                  {rel.property?.status === 'pending' && 'Pendiente'}
                                </span>
                              </div>

                              {/* Descripción corta */}
                              {rel.property?.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                  {rel.property.description.length > 80
                                    ? `${rel.property.description.substring(0, 80)}...`
                                    : rel.property.description
                                  }
                                </p>
                              )}

                              {/* Tipo de relación y acciones */}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                  {rel.relation_type}
                                </span>
                                <div className="flex gap-2">
                                  {rel.status === 'pending' || rel.relation_type === 'pending_contract' ? (
                                    <button
                                      onClick={() => handleMarkRelationActive(rel)}
                                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                      title="Marcar como activa"
                                    >
                                      Activar
                                    </button>
                                  ) : null}
                                  <button
                                    onClick={() => handleViewPropertyDetails(rel.property)}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                    title="Ver detalles de la propiedad"
                                  >
                                    Ver
                                  </button>
                                </div>
                              </div>

                              {rel.message && (
                                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
                                  {rel.message}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Pestaña Análisis */}
                {activeTab === 'analysis' && !loadingDetails && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Análisis y Preferencias</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                        <p className="text-sm text-gray-500">Propiedades Interesadas</p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{clientPropertySummary?.interested_properties ?? 0}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                        <p className="text-sm text-gray-500">Contratos Pendientes</p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{clientPropertySummary?.pending_contracts ?? 0}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                        <p className="text-sm text-gray-500">Contratos Activos</p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{clientPropertySummary?.active_contracts ?? 0}</p>
                      </div>
                    </div>

                    <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                      <p className="text-sm text-gray-500">Preferencias y Requisitos</p>
                      <p className="text-gray-900 dark:text-white mt-2">{selectedClient?.property_requirements || 'No especificado'}</p>
                    </div>
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
            className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Editar Cliente: {selectedClient.full_name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Modifica la información del cliente según sea necesario
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Información Personal
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={editForm.full_name || ''}
                      onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
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
                        value={editForm.document_type || 'cedula'}
                        onChange={(e) => setEditForm({...editForm, document_type: e.target.value as any})}
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
                        value={editForm.document_number || ''}
                        onChange={(e) => setEditForm({...editForm, document_number: e.target.value})}
                        placeholder="1234567890"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        value={editForm.birth_date || ''}
                        onChange={(e) => setEditForm({...editForm, birth_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Género
                      </label>
                      <select
                        value={editForm.gender || ''}
                        onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Seleccionar</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estado Civil
                    </label>
                    <select
                      value={editForm.marital_status || ''}
                      onChange={(e) => setEditForm({...editForm, marital_status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="soltero">Soltero/a</option>
                      <option value="casado">Casado/a</option>
                      <option value="union_libre">Unión Libre</option>
                      <option value="divorciado">Divorciado/a</option>
                      <option value="viudo">Viudo/a</option>
                    </select>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-green-600" />
                    Información de Contacto
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
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
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Método de Contacto Preferido
                    </label>
                    <select
                      value={editForm.preferred_contact_method || 'phone'}
                      onChange={(e) => setEditForm({...editForm, preferred_contact_method: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="phone">Teléfono</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
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
                      value={editForm.city || ''}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      placeholder="Bogotá"
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
                        value={editForm.emergency_contact_name || ''}
                        onChange={(e) => setEditForm({...editForm, emergency_contact_name: e.target.value})}
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
                        value={editForm.emergency_contact_phone || ''}
                        onChange={(e) => setEditForm({...editForm, emergency_contact_phone: e.target.value})}
                        placeholder="+57 301 234 5678"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Información Profesional y Financiera */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                    Información Profesional
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ocupación
                      </label>
                      <input
                        type="text"
                        value={editForm.occupation || ''}
                        onChange={(e) => setEditForm({...editForm, occupation: e.target.value})}
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
                        value={editForm.company_name || ''}
                        onChange={(e) => setEditForm({...editForm, company_name: e.target.value})}
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
                      value={editForm.monthly_income || ''}
                      onChange={(e) => setEditForm({...editForm, monthly_income: e.target.value ? parseInt(e.target.value) : undefined})}
                      placeholder="2500000"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rango de Presupuesto
                    </label>
                    <select
                      value={editForm.budget_range || ''}
                      onChange={(e) => setEditForm({...editForm, budget_range: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="1-3">1M - 3M COP</option>
                      <option value="3-5">3M - 5M COP</option>
                      <option value="5-10">5M - 10M COP</option>
                      <option value="10-20">10M - 20M COP</option>
                      <option value="20+">Más de 20M COP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fuente de Referencia
                    </label>
                    <select
                      value={editForm.referral_source || ''}
                      onChange={(e) => setEditForm({...editForm, referral_source: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="google">Google</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="amigo">Amigo/Familiar</option>
                      <option value="sitio_web">Sitio Web</option>
                      <option value="recomendacion">Recomendación</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo de Cliente *
                      </label>
                      <select
                        value={editForm.client_type || 'renter'}
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
                        Estado *
                      </label>
                      <select
                        value={editForm.status || 'active'}
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Requisitos de Propiedad
                    </label>
                    <textarea
                      value={editForm.property_requirements || ''}
                      onChange={(e) => setEditForm({...editForm, property_requirements: e.target.value})}
                      placeholder="Número de habitaciones, zona preferida, amenidades requeridas..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Propiedades Asignadas
                    </label>
                    <PropertySelector
                      properties={allProperties}
                      selectedIds={editSelectedPropertyIds}
                      onSelectionChange={setEditSelectedPropertyIds}
                      loading={loadingFormProperties}
                      placeholder="Seleccionar propiedades..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notas Adicionales
                    </label>
                    <textarea
                      value={editForm.notes || ''}
                      onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                      placeholder="Información adicional sobre el cliente..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            className="bg-white dark:bg-gray-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <User className="w-6 h-6 mr-3 text-blue-600" />
                    Crear Nuevo Cliente
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Complete la información del cliente para registrarlo en el sistema
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateClient(); }} className="space-y-8">
                {/* Información Personal */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Información Personal
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre Completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={createForm.full_name}
                        onChange={(e) => setCreateForm({...createForm, full_name: e.target.value})}
                        placeholder="Ej: Juan Pérez García"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo de Documento <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={createForm.document_type}
                        onChange={(e) => setCreateForm({...createForm, document_type: e.target.value as any})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="cedula">Cédula de Ciudadanía</option>
                        <option value="pasaporte">Pasaporte</option>
                        <option value="nit">NIT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Número de Documento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={createForm.document_number}
                        onChange={(e) => setCreateForm({...createForm, document_number: e.target.value})}
                        placeholder="1234567890"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo de Cliente <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={createForm.client_type}
                        onChange={(e) => setCreateForm({...createForm, client_type: e.target.value as any})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="tenant">Arrendatario</option>
                        <option value="landlord">Arrendador</option>
                        <option value="buyer">Comprador</option>
                        <option value="seller">Vendedor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estado
                      </label>
                      <select
                        value={createForm.status}
                        onChange={(e) => setCreateForm({...createForm, status: e.target.value as any})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="pending">Pendiente</option>
                        <option value="blocked">Bloqueado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-green-600" />
                    Información de Contacto
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={createForm.phone}
                        onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                        placeholder="+57 300 123 4567"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                        placeholder="correo@ejemplo.com"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={createForm.address}
                        onChange={(e) => setCreateForm({...createForm, address: e.target.value})}
                        placeholder="Calle 123 #45-67, Barrio Centro"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={createForm.city}
                        onChange={(e) => setCreateForm({...createForm, city: e.target.value})}
                        placeholder="Bogotá"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Información Profesional */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                    Información Profesional
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ocupación
                      </label>
                      <input
                        type="text"
                        value={createForm.occupation}
                        onChange={(e) => setCreateForm({...createForm, occupation: e.target.value})}
                        placeholder="Ingeniero, Médico, Empresario..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Empresa
                      </label>
                      <input
                        type="text"
                        value={createForm.company_name}
                        onChange={(e) => setCreateForm({...createForm, company_name: e.target.value})}
                        placeholder="ABC Ltda., Universidad Nacional..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ingresos Mensuales (COP)
                      </label>
                      <input
                        type="number"
                        value={createForm.monthly_income}
                        onChange={(e) => setCreateForm({...createForm, monthly_income: e.target.value})}
                        placeholder="2500000"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Contacto de Emergencia */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                    Contacto de Emergencia
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre del Contacto
                      </label>
                      <input
                        type="text"
                        value={createForm.emergency_contact_name}
                        onChange={(e) => setCreateForm({...createForm, emergency_contact_name: e.target.value})}
                        placeholder="María García Pérez"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Teléfono del Contacto
                      </label>
                      <input
                        type="tel"
                        value={createForm.emergency_contact_phone}
                        onChange={(e) => setCreateForm({...createForm, emergency_contact_phone: e.target.value})}
                        placeholder="+57 301 234 5678"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Notas Adicionales */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-gray-600" />
                    Notas Adicionales
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Observaciones
                    </label>
                    <textarea
                      value={createForm.notes}
                      onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                      placeholder="Información adicional relevante sobre el cliente..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Propiedades de Interés (Opcional) */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Home className="w-5 h-5 mr-2 text-blue-600" />
                    Propiedades de Interés (Opcional)
                  </h3>

                  <PropertySelector
                    properties={allProperties}
                    selectedIds={createSelectedPropertyIds}
                    onSelectionChange={setCreateSelectedPropertyIds}
                    loading={loadingProperties}
                    placeholder="Buscar propiedades..."
                  />

                  {createSelectedPropertyIds.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Se crearán {createSelectedPropertyIds.length} relación(es) de interés con el cliente.
                      </p>
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetCreateForm();
                    }}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium flex items-center"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Crear Cliente
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Detalles de Propiedad */}
      <Modal
        isOpen={showPropertyDetailsModal}
        onClose={() => setShowPropertyDetailsModal(false)}
        title={selectedPropertyForDetails?.title || 'Detalles de Propiedad'}
        size="full"
      >
        {selectedPropertyForDetails && (
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Galería de Imágenes - Columna Principal */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  {/* Imagen Principal */}
                  <div className="relative h-96 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4 overflow-hidden">
                    {selectedPropertyForDetails.images && selectedPropertyForDetails.images.length > 0 ? (
                      <>
                        <img
                          src={selectedPropertyForDetails.images[currentImageIndex]}
                          alt={selectedPropertyForDetails.title}
                          className="w-full h-full object-cover"
                        />

                        {/* Navegación de Imágenes */}
                        {selectedPropertyForDetails.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(prev =>
                                  prev === 0 ? selectedPropertyForDetails.images.length - 1 : prev - 1
                                );
                              }}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(prev =>
                                  prev === selectedPropertyForDetails.images.length - 1 ? 0 : prev + 1
                                );
                              }}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>
                          </>
                        )}

                        {/* Contador de Imágenes */}
                        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg text-sm">
                          {currentImageIndex + 1} / {selectedPropertyForDetails.images.length}
                        </div>

                        {/* Badge de Estado */}
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(selectedPropertyForDetails.status)}`}>
                            {selectedPropertyForDetails.status === 'available' && 'Disponible'}
                            {selectedPropertyForDetails.status === 'sale' && 'En Venta'}
                            {selectedPropertyForDetails.status === 'rent' && 'En Arriendo'}
                            {selectedPropertyForDetails.status === 'sold' && 'Vendido'}
                            {selectedPropertyForDetails.status === 'rented' && 'Arrendado'}
                            {selectedPropertyForDetails.status === 'reserved' && 'Reservado'}
                            {selectedPropertyForDetails.status === 'maintenance' && 'Mantenimiento'}
                            {selectedPropertyForDetails.status === 'pending' && 'Pendiente'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-16 h-16 text-gray-400" />
                        <span className="ml-2 text-gray-500">Sin imágenes disponibles</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {selectedPropertyForDetails.images && selectedPropertyForDetails.images.length > 1 && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {selectedPropertyForDetails.images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${selectedPropertyForDetails.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Información Lateral */}
              <div className="space-y-6">
                {/* Precio y Código */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                      ${selectedPropertyForDetails?.price?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Código: {selectedPropertyForDetails.code}
                    </p>
                  </div>

                  {/* Características principales */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400 block">Habitaciones</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedPropertyForDetails.bedrooms}</p>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400 block">Baños</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedPropertyForDetails.bathrooms}</p>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400 block">Área</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedPropertyForDetails.area}m²</p>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400 block">Tipo</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{selectedPropertyForDetails.type}</p>
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Ubicación
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedPropertyForDetails.address}, {selectedPropertyForDetails.city}
                  </p>
                </div>

                {/* Descripción */}
                {selectedPropertyForDetails.description && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Descripción</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {selectedPropertyForDetails.description}
                    </p>
                  </div>
                )}

                {/* Amenidades */}
                {selectedPropertyForDetails.amenities && selectedPropertyForDetails.amenities.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Amenidades</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPropertyForDetails.amenities.map((amenity: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminClients;
