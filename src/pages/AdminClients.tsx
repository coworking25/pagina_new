import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ClientWizard from '../components/ClientWizard';
import { ClientDetailsEnhanced } from '../components/ClientDetailsEnhanced';
import { ClientEditForm } from '../components/ClientEditForm';
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
  ChevronDown,
  CheckSquare,
  Square as CheckboxIcon,
  Minus,
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
  createPortalCredentials,
  uploadClientDocument,
  savePaymentConfig,
  saveClientReferences,
  saveContractInfo
} from '../lib/clientsApi';
import { getProperties, updatePropertyStatus } from '../lib/supabase';
import Modal from '../components/UI/Modal';
import { ChevronLeft, ChevronRight, MapPin as MapPinIcon } from 'lucide-react';
import type { Client, Contract, Payment, ClientCommunication, ClientAlert, ClientPropertyRelation, ClientPropertySummary, ClientFormData } from '../types/clients';
import { useMultiSelect } from '../hooks/useMultiSelect';
import { BulkActionBar, BulkActionIcons } from '../components/UI/BulkActionBar';

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
          {/* Barra de bÃºsqueda */}
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
                      {property.code} â€¢ ${property.price?.toLocaleString()} â€¢ {property.type}
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
  const location = useLocation();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false); // Wizard de cliente
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

  // Estados para selecciÃ³n de propiedades en formularios
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [editSelectedPropertyIds, setEditSelectedPropertyIds] = useState<string[]>([]);
  const [loadingFormProperties, setLoadingFormProperties] = useState(false);

  // Estados para modal de detalles de propiedad
  const [showPropertyDetailsModal, setShowPropertyDetailsModal] = useState(false);
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reusable notification helper (same shape used elsewhere)
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    if (type === 'error') {
      alert(`âŒ ${message}`);
    } else if (type === 'success') {
      alert(`âœ… ${message}`);
    } else {
      alert(`â„¹ï¸ ${message}`);
    }
  };

  useEffect(() => {
    loadClients();
    loadAllProperties();
  }, []);

  // Detectar si viene de una alerta y abrir automáticamente el modal correspondiente
  useEffect(() => {
    const state = location.state as any;
    if (state && (state.tab === 'contracts' || state.tab === 'payments') && state.highlightId) {
      // Buscar el cliente que tiene el contrato o pago correspondiente
      const findClientWithAlert = async () => {
        try {
          // Si tenemos un ID especÃ­fico, buscar el cliente correspondiente
          if (state.highlightId) {
            // Para contratos y pagos, necesitamos buscar en la base de datos
            // Por ahora, abriremos la pestaÃ±a correspondiente para todos los clientes
            // En una implementaciÃ³n más avanzada, podrÃ­amos filtrar por el cliente especÃ­fico
            
            // Simular que encontramos un cliente (en producciÃ³n buscarÃ­amos el cliente especÃ­fico)
            if (clients.length > 0) {
              const firstClient = clients[0]; // En producciÃ³n, buscar el cliente correcto
              await handleViewClient(firstClient);
              setActiveTab(state.tab); // Cambiar a la pestaÃ±a correspondiente
            }
          }
        } catch (error) {
          console.error('Error abriendo alerta desde dashboard:', error);
        }
      };

      if (clients.length > 0) {
        findClientWithAlert();
      }
    }
  }, [location.state, clients]);

  // Cargar todas las propiedades disponibles para selecciÃ³n en formularios
  const loadAllProperties = async () => {
    try {
      setLoadingFormProperties(true);
      const properties = await getProperties();
      setAllProperties(properties || []);
    } catch (error) {
      console.error('âŒ Error cargando propiedades para formularios:', error);
      setAllProperties([]);
    } finally {
      setLoadingFormProperties(false);
    }
  };

  const loadClients = async () => {
    try {
      console.log('ðŸ‘¥ Cargando clientes desde Supabase...');
      
      const clientsData = await getClients();
      console.log('âœ… Clientes obtenidos:', clientsData);
      console.log('ðŸ“Š NÃºmero de clientes:', clientsData?.length || 0);
      
      setClients(clientsData || []);
      console.log('ðŸ—‚ï¸ Clientes cargados exitosamente');
    } catch (error) {
      console.error('âŒ Error al cargar clientes:', error);
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
      // Filtrar propiedades que ya tengan relaciÃ³n con el cliente (evitar duplicados en UI)
      const relatedIds = (clientRelations || []).map(r => String(r.property_id));
      const filtered = (props || []).filter((p: any) => !relatedIds.includes(String(p.id)));
      setAvailableProperties(filtered);
      // Guardar en una propiedad temporal la info si se excluyeron items
      (setAvailableProperties as any).excludedCount = (props || []).length - filtered.length;
    } catch (err) {
      console.error('âŒ Error cargando propiedades para asignar:', err);
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
      console.error('âŒ Error asignando propiedades:', err);
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

  // Hook de selecciÃ³n múltiple
  const multiSelect = useMultiSelect({
    items: filteredClients,
    getItemId: (client) => client.id
  });

  // EstadÃ­sticas
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
      console.log('ðŸ” Cargando detalles del cliente:', client.id);
      
      // Cargar contratos
      const contracts = await getContracts(client.id);
      setClientContracts(contracts || []);
      console.log('ðŸ“„ Contratos cargados:', contracts?.length || 0);
      
      // Cargar pagos
      const payments = await getPayments(client.id);
      setClientPayments(payments || []);
      console.log('ðŸ’° Pagos cargados:', payments?.length || 0);
      
      // Cargar comunicaciones
      const communications = await getClientCommunications(client.id);
      setClientCommunications(communications || []);
      console.log('ðŸ“ž Comunicaciones cargadas:', communications?.length || 0);
      
      // Cargar alertas
      const alerts = await getActiveAlerts(client.id);
      setClientAlerts(alerts || []);
      console.log('ðŸš¨ Alertas cargadas:', alerts?.length || 0);
      
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
        console.error('âš ï¸ Error cargando relaciones o resumen:', relError);
      }
      
    } catch (error) {
      console.error('âŒ Error cargando detalles del cliente:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // AcciÃ³n: Marcar relaciÃ³n pendiente como activa (ej. crear contrato fuera de banda o actualizar estado)
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
          console.log('âœ… Contrato creado automáticamente:', createdContract);
        } catch (contractError) {
          console.error('âŒ Error creando contrato automáticamente:', contractError);
          alert('Error al crear contrato automáticamente. La relaciÃ³n no se actualizarÃ¡.');
          return;
        }
      }

      // 3) Actualizar relaciÃ³n
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
          console.log('âœ… Pagos generados para contrato:', createdContract.id);
        } catch (payError) {
          console.error('âŒ Error generando pagos automÃ¡ticos:', payError);
          alert('Contrato creado, pero hubo un error generando los pagos automÃ¡ticos. Revisa la consola.');
        }
      }

      alert('RelaciÃ³n actualizada y contrato creado (si aplicÃ³)');

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
      console.error('âŒ Error marcando relaciÃ³n como activa:', error);
      alert('Error al actualizar la relaciÃ³n. Revisa la consola.');
    }
  };

  // AcciÃ³n: Quitar propiedad asignada al cliente
  const handleRemovePropertyRelation = async (relation: ClientPropertyRelation) => {
    if (!relation || !relation.id || !relation.property_id) return;

    const confirmMessage = `Â¿EstÃ¡s seguro de que quieres quitar la propiedad "${relation.property?.title || `Propiedad #${relation.property_id}`}" del cliente? La propiedad volverÃ¡ a estar disponible para arrendar.`;

    if (!confirm(confirmMessage)) return;

    try {
      // 1) Eliminar la relaciÃ³n cliente-propiedad
      await deleteClientPropertyRelation(relation.id);
      console.log('âœ… RelaciÃ³n cliente-propiedad eliminada:', relation.id);

      // 2) Cambiar el status de la propiedad a 'available'
      await updatePropertyStatus(relation.property_id, 'available', `Propiedad desasignada del cliente ${selectedClient?.full_name}`);
      console.log('âœ… Propiedad marcada como disponible:', relation.property_id);

      alert('Propiedad quitada exitosamente. Ahora estÃ¡ disponible para arrendar.');

      // 3) Recargar relaciones y resumen del cliente
      if (selectedClient) {
        const [relations, summary] = await Promise.all([
          getClientPropertyRelations(selectedClient.id),
          getClientPropertySummary(selectedClient.id)
        ]);
        setClientRelations(relations || []);
        setClientPropertySummary(summary || null);
      }

    } catch (error) {
      console.error('âŒ Error quitando propiedad asignada:', error);
      alert('Error al quitar la propiedad. Revisa la consola.');
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditForm(client);
    setShowEditModal(true);

    // Cargar propiedades asignadas al cliente para ediciÃ³n
    loadClientPropertyAssignments(client.id);
  };

  // Cargar asignaciones de propiedades para un cliente (para ediciÃ³n)
  const loadClientPropertyAssignments = async (clientId: string) => {
    try {
      const relations = await getClientPropertyRelations(clientId);
      const propertyIds = relations.map(relation => String(relation.property_id));
      setEditSelectedPropertyIds(propertyIds);
    } catch (error) {
      console.error('âŒ Error cargando asignaciones de propiedades:', error);
      setEditSelectedPropertyIds([]);
    }
  };

  // FunciÃ³n para abrir modal de detalles de propiedad
  const handleViewPropertyDetails = (property: any) => {
    console.log('ðŸ” Abriendo detalles de propiedad desde cliente:', property);
    setSelectedPropertyForDetails(property);
    setCurrentImageIndex(0); // Reiniciar al primer Ã­ndice
    setShowPropertyDetailsModal(true);
  };

  const handleDeleteClient = async (client: Client) => {
    if (window.confirm(`Â¿EstÃ¡s seguro de que quieres eliminar al cliente ${client.full_name}?`)) {
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

  // ========================================
  // FUNCIONES DE ACCIONES MASIVAS
  // ========================================

  const handleBulkDelete = async () => {
    const count = multiSelect.selectedCount;
    if (window.confirm(`Â¿EstÃ¡s seguro de que quieres eliminar ${count} ${count === 1 ? 'cliente' : 'clientes'}?\n\nâš ï¸ Esta acciÃ³n eliminarÃ¡ PERMANENTEMENTE todos los datos relacionados de ${count === 1 ? 'este cliente' : 'estos clientes'}.\n\nEsta acciÃ³n NO se puede deshacer.`)) {
      try {
        // Capturar los IDs antes de cualquier operaciÃ³n
        const idsToDelete = Array.from(multiSelect.selectedIds);
        console.log('ðŸ—‘ï¸ Eliminando clientes en masa:', idsToDelete);
        
        // Eliminar uno por uno y registrar errores individuales
        const results = await Promise.allSettled(
          idsToDelete.map(async (id) => {
            console.log('ðŸ—‘ï¸ Eliminando cliente:', id);
            await deleteClient(String(id));
            console.log('âœ… Cliente eliminado:', id);
            return id;
          })
        );
        
        // Verificar resultados
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        // Limpiar selecciÃ³n
        multiSelect.clearSelection();
        
        // Refrescar la lista
        await loadClients();
        
        if (failed === 0) {
          alert(`âœ… ${successful} ${successful === 1 ? 'cliente eliminado' : 'clientes eliminados'} exitosamente`);
        } else {
          alert(`âš ï¸ EliminaciÃ³n parcial:\nâœ… ${successful} exitosos\nâŒ ${failed} fallidos\n\nRevisa la consola para más detalles.`);
          console.error('âŒ Errores en eliminaciÃ³n masiva:', results.filter(r => r.status === 'rejected'));
        }
      } catch (error: any) {
        console.error('âŒ Error eliminando clientes:', error);
        alert(`âŒ ${error.message || 'Error al eliminar los clientes'}`);
      }
    }
  };

  const handleBulkChangeStatus = async (newStatus: Client['status']) => {
    const count = multiSelect.selectedCount;
    if (window.confirm(`Â¿Cambiar el estado de ${count} ${count === 1 ? 'cliente' : 'clientes'} a "${newStatus}"?`)) {
      try {
        // Capturar los IDs antes de cualquier operaciÃ³n
        const idsToUpdate = Array.from(multiSelect.selectedIds);
        console.log('ðŸ”„ Cambiando estado en masa a:', newStatus, idsToUpdate);
        
        // Limpiar selecciÃ³n ANTES de actualizar
        multiSelect.clearSelection();
        
        // Actualizar usando los IDs capturados
        const updatePromises = idsToUpdate.map(id => 
          updateClient(String(id), { status: newStatus })
        );
        
        await Promise.all(updatePromises);
        
        // Refrescar la lista
        await loadClients();
        
        alert(`âœ… Estado actualizado para ${count} ${count === 1 ? 'cliente' : 'clientes'}`);
      } catch (error: any) {
        console.error('âŒ Error actualizando estado:', error);
        alert(`âŒ ${error.message || 'Error al actualizar el estado'}`);
      }
    }
  };

  const handleBulkExport = () => {
    try {
      // Capturar los items seleccionados ANTES de cualquier operaciÃ³n
      const itemsToExport = [...multiSelect.selectedItems];
      const count = itemsToExport.length;
      
      // Crear CSV con los clientes seleccionados
      const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Tipo', 'Estado', 'Documento', 'Dirección'];
      const rows = itemsToExport.map(client => [
        client.id || '',
        client.full_name || '',
        client.email || '',
        client.phone || '',
        client.client_type || '',
        client.status || '',
        client.document_number || '',
        client.address || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`âœ… ${count} clientes exportados a CSV`);
    } catch (error) {
      console.error('âŒ Error exportando clientes:', error);
      alert('âŒ Error al exportar los clientes');
    }
  };

  const handleBulkTag = async () => {
    const tag = prompt('Ingresa la etiqueta para asignar a los clientes seleccionados:');
    if (!tag) return;
    
    const count = multiSelect.selectedCount;
    if (window.confirm(`Â¿Asignar la etiqueta "${tag}" a ${count} ${count === 1 ? 'cliente' : 'clientes'}?`)) {
      try {
        console.log('ðŸ·ï¸ Asignando etiqueta en masa:', tag);
        
        // Por ahora solo mostramos una alerta ya que no estÃ¡ implementado el sistema de etiquetas
        // TODO: Implementar sistema de etiquetas en la base de datos
        alert(`âš ï¸ Funcionalidad de etiquetas pendiente de implementaciÃ³n.\nEtiqueta "${tag}" para ${count} ${count === 1 ? 'cliente' : 'clientes'}`);
        
        multiSelect.clearSelection();
      } catch (error: any) {
        console.error('âŒ Error asignando etiqueta:', error);
        alert(`âŒ ${error.message || 'Error al asignar la etiqueta'}`);
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
        const message = `Â¡Hola ${client.full_name}! ðŸ‘‹

Nos comunicamos desde *Coworking Inmobiliario* para darle seguimiento.

Â¡Esperamos poder servirle pronto! ðŸ âœ¨`;
        
        window.open(`https://wa.me/57${phoneNumber}?text=${encodeURIComponent(message)}`);
        break;
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm || !selectedClient) return;
    
    try {
      console.log('ðŸ”„ Actualizando cliente:', editForm);
      
      const updatedClient = await updateClient(selectedClient.id, editForm);
      
      if (updatedClient) {
        console.log('âœ… Cliente actualizado correctamente:', updatedClient);
        
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
      console.error('âŒ Error actualizando cliente:', error);
      alert('Error al actualizar el cliente. Por favor, intÃ©ntalo de nuevo.');
    }
  };

  // Manejar actualizaciones de asignaciones de propiedades
  const handlePropertyAssignmentsUpdate = async (clientId: string) => {
    try {
      // Obtener relaciones actuales
      const currentRelations = await getClientPropertyRelations(clientId);
      const currentPropertyIds = currentRelations.map(r => String(r.property_id));
      
      // Determinar quÃ© agregar y quÃ© eliminar
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
        console.log(`âœ… Agregadas ${toAdd.length} nuevas asignaciones de propiedad`);
      }
      
      // Eliminar relaciones removidas
      if (toRemove.length > 0) {
        for (const relation of toRemove) {
          await deleteClientPropertyRelation(relation.id);
        }
        console.log(`âœ… Eliminadas ${toRemove.length} asignaciones de propiedad`);
      }
    } catch (error) {
      console.error('âš ï¸ Error actualizando asignaciones de propiedades:', error);
      throw error; // Re-lanzar para que sea manejado por el caller
    }
  };

  // Helper para convertir valores numÃ©ricos del wizard
  const sanitizeNumericValue = (value: any): number | undefined => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  };

  // Helper para sanitizar payment_concepts
  const sanitizePaymentConcepts = (concepts: any) => {
    if (!concepts) return undefined;
    
    const sanitized: any = {};
    
    if (concepts.arriendo) {
      sanitized.arriendo = {
        enabled: concepts.arriendo.enabled,
        amount: sanitizeNumericValue(concepts.arriendo.amount) || 0
      };
    }
    
    if (concepts.administracion) {
      sanitized.administracion = {
        enabled: concepts.administracion.enabled,
        amount: sanitizeNumericValue(concepts.administracion.amount) || 0
      };
    }
    
    if (concepts.servicios_publicos) {
      sanitized.servicios_publicos = {
        enabled: concepts.servicios_publicos.enabled,
        amount: sanitizeNumericValue(concepts.servicios_publicos.amount) || 0,
        services: concepts.servicios_publicos.services || []
      };
    }
    
    if (concepts.otros) {
      sanitized.otros = {
        enabled: concepts.otros.enabled,
        amount: sanitizeNumericValue(concepts.otros.amount) || 0,
        description: concepts.otros.description || ''
      };
    }
    
    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
  };

 // NUEVA VERSIÓN MEJORADA DEL handleWizardSubmit
// Copiar y pegar esto en AdminClients.tsx línea 991

// Handler para el wizard de cliente
const handleWizardSubmit = async (wizardData: any) => {
  console.log('\n==============================================');
  console.log('🧙‍♂️ INICIANDO CREACIÓN DE CLIENTE DESDE WIZARD');
  console.log('==============================================');
  console.log('📋 DATOS COMPLETOS RECIBIDOS:', JSON.stringify(wizardData, null, 2));
  
  // Objeto para rastrear qué se guardó exitosamente
  const saveResults = {
    client: { saved: false, id: null as number | null, error: null as any },
    credentials: { saved: false, email: null as string | null, error: null as any },
    documents: { saved: 0, total: 0, errors: [] as string[] },
    payment: { saved: false, error: null as any },
    references: { saved: false, personal: 0, commercial: 0, error: null as any },
    contract: { saved: false, error: null as any },
    properties: { saved: 0, total: 0, error: null as any }
  };

  try {
    // 1. Crear cliente base
    console.log('\n📝 PASO 1: Creando cliente base...');
    const clientData: ClientFormData = {
      full_name: wizardData.full_name,
      document_type: wizardData.document_type,
      document_number: wizardData.document_number,
      phone: wizardData.phone,
      email: wizardData.email || undefined,
      address: wizardData.address || undefined,
      city: wizardData.city || undefined,
      emergency_contact_name: wizardData.emergency_contact_name || undefined,
      emergency_contact_phone: wizardData.emergency_contact_phone || undefined,
      client_type: wizardData.client_type,
      status: wizardData.client_status || 'active',
      monthly_income: sanitizeNumericValue(wizardData.monthly_income),
      occupation: wizardData.occupation || undefined,
      company_name: wizardData.company_name || undefined,
      notes: wizardData.notes || undefined
    };

    console.log('   → Datos a guardar:', clientData);
    const newClient = await createClient(clientData);
    saveResults.client.saved = true;
    saveResults.client.id = Number(newClient.id);
    console.log('   ✅ Cliente creado exitosamente ID:', newClient.id);

    // 2. Crear credenciales del portal
    console.log('\n🔑 PASO 2: Verificando credenciales del portal...');
    const email = wizardData.email || wizardData.portal_email || wizardData.portal_credentials?.email;
    const password = wizardData.password || wizardData.portal_credentials?.password;
    
    console.log('   → wizardData completo:', JSON.stringify(wizardData, null, 2));
    console.log('   → Email:', email);
    console.log('   → Password:', password ? '****** (existe)' : '❌ NO PROPORCIONADA');
    console.log('   → Send welcome email:', wizardData.send_welcome_email || wizardData.portal_credentials?.send_welcome_email);
    console.log('   → Portal access enabled:', wizardData.portal_access_enabled ?? wizardData.portal_credentials?.portal_access_enabled);

    if (password && email) {
      try {
        await createPortalCredentials(
          newClient.id,
          email,
          password,
          wizardData.send_welcome_email || wizardData.portal_credentials?.send_welcome_email || false,
          wizardData.portal_access_enabled ?? wizardData.portal_credentials?.portal_access_enabled ?? true
        );
        saveResults.credentials.saved = true;
        saveResults.credentials.email = email;
        console.log('   ✅ Credenciales del portal creadas');
      } catch (credError: any) {
        saveResults.credentials.error = credError.message;
        console.error('   ❌ Error creando credenciales:', credError);
      }
    } else {
      console.warn('   ⚠️ CREDENCIALES NO CREADAS - Falta email o password');
      if (!email) console.warn('      → Email faltante');
      if (!password) console.warn('      → Password faltante');
      console.warn('      → wizardData.portal_credentials:', wizardData.portal_credentials);
    }

    // 3. Subir documentos
    console.log('\n📄 PASO 3: Verificando documentos...');
    // Los documentos vienen en wizardData.documents como objeto, no array
    const documentsObj = wizardData.documents || {};
    const documents = [];
    
    // Convertir el objeto de documentos a array
    if (documentsObj.cedula_frente && documentsObj.cedula_frente.file) {
      documents.push({ type: 'cedula_frente', file: documentsObj.cedula_frente.file });
    }
    if (documentsObj.cedula_reverso && documentsObj.cedula_reverso.file) {
      documents.push({ type: 'cedula_reverso', file: documentsObj.cedula_reverso.file });
    }
    if (documentsObj.certificado_laboral) {
      documents.push({ type: 'certificado_laboral', file: documentsObj.certificado_laboral });
    }
    if (documentsObj.contrato_firmado) {
      documents.push({ type: 'contrato_firmado', file: documentsObj.contrato_firmado });
    }
    if (documentsObj.otros && Array.isArray(documentsObj.otros)) {
      documentsObj.otros.forEach((doc: any) => {
        if (doc.file) documents.push({ type: 'otros', file: doc.file });
      });
    }
    
    saveResults.documents.total = documents.length;
    console.log('   → Total documentos a subir:', documents.length);

    if (documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        console.log(`   → Documento ${i + 1}/${documents.length}:`, doc.type);
        try {
          await uploadClientDocument(
            newClient.id,
            doc.type,
            doc.file
          );
          saveResults.documents.saved++;
          console.log(`      ✅ Documento ${doc.type} subido exitosamente`);
        } catch (docError: any) {
          saveResults.documents.errors.push(`${doc.type}: ${docError.message}`);
          console.error(`      ❌ Error subiendo documento ${doc.type}:`, docError);
        }
      }
    } else {
      console.log('   ⚠️ No hay documentos para subir');
    }

    // 4. Guardar configuración de pagos
    console.log('\n💰 PASO 4: Verificando configuración de pagos...');
    const paymentConfig = wizardData.payment_config || {};
    console.log('   → Payment config completo:', paymentConfig);
    console.log('   → Preferred payment method:', paymentConfig.preferred_payment_method);
    console.log('   → Billing day:', paymentConfig.billing_day);
    console.log('   → Concepts:', paymentConfig.concepts);

    if (paymentConfig.preferred_payment_method || paymentConfig.concepts) {
      try {
        await savePaymentConfig(newClient.id, {
          preferred_payment_method: paymentConfig.preferred_payment_method,
          billing_day: sanitizeNumericValue(paymentConfig.billing_day) || 1,
          payment_due_days: sanitizeNumericValue(paymentConfig.payment_due_days) || 5,
          send_reminders: paymentConfig.send_reminders ?? true,
          reminder_days_before: sanitizeNumericValue(paymentConfig.reminder_days_before) || 3,
          bank_name: paymentConfig.bank_name || null,
          account_type: paymentConfig.account_type || null,
          account_number: paymentConfig.account_number || null,
          payment_concepts: sanitizePaymentConcepts(paymentConfig.concepts)
        });
        saveResults.payment.saved = true;
        console.log('   ✅ Configuración de pagos guardada');
      } catch (paymentError: any) {
        saveResults.payment.error = paymentError.message;
        console.error('   ❌ Error guardando configuración de pagos:', paymentError);
      }
    } else {
      console.log('   ⚠️ Configuración de pagos NO guardada - No hay datos');
    }

    // 5. Guardar referencias
    console.log('\n👥 PASO 5: Verificando referencias...');
    const references = wizardData.references || {};
    const personalRefs = references.personal || [];
    const commercialRefs = references.commercial || [];
    console.log('   → Referencias objeto completo:', references);
    console.log('   → Referencias personales:', personalRefs.length);
    console.log('   → Referencias comerciales:', commercialRefs.length);

    if (personalRefs.length > 0 || commercialRefs.length > 0) {
      try {
        await saveClientReferences(newClient.id, {
          personal: personalRefs,
          commercial: commercialRefs
        });
        saveResults.references.saved = true;
        saveResults.references.personal = personalRefs.length;
        saveResults.references.commercial = commercialRefs.length;
        const totalRefs = personalRefs.length + commercialRefs.length;
        console.log(`   ✅ Referencias guardadas (${totalRefs} total)`);
      } catch (refError: any) {
        saveResults.references.error = refError.message;
        console.error('   ❌ Error guardando referencias:', refError);
      }
    } else {
      console.log('   ⚠️ Referencias NO guardadas - No hay datos');
    }

    // 6. Guardar información del contrato
    console.log('\n📑 PASO 6: Verificando información del contrato...');
    const contractInfo = wizardData.contract_info || {};
    console.log('   → Contract info completo:', contractInfo);
    console.log('   → Contract type:', contractInfo.contract_type);
    console.log('   → Start date:', contractInfo.start_date);
    console.log('   → End date:', contractInfo.end_date);
    console.log('   → Deposit amount:', contractInfo.deposit_amount);
    console.log('   → Guarantor:', contractInfo.guarantor_required ? 'Sí' : 'No');

    if (contractInfo.start_date || contractInfo.deposit_amount || contractInfo.contract_type) {
      try {
        await saveContractInfo(newClient.id, {
          contract_type: contractInfo.contract_type,
          start_date: contractInfo.start_date,
          end_date: contractInfo.end_date,
          duration_months: sanitizeNumericValue(contractInfo.contract_duration_months),
          deposit_amount: sanitizeNumericValue(contractInfo.deposit_amount),
          deposit_paid: contractInfo.deposit_paid || false,
          guarantor_required: contractInfo.guarantor_required || false,
          guarantor_name: contractInfo.guarantor_name || undefined,
          guarantor_document: contractInfo.guarantor_document || undefined,
          guarantor_phone: contractInfo.guarantor_phone || undefined
        });
        saveResults.contract.saved = true;
        console.log('   ✅ Información del contrato guardada');
      } catch (contractError: any) {
        saveResults.contract.error = contractError.message;
        console.error('   ❌ Error guardando información del contrato:', contractError);
      }
    } else {
      console.log('   ⚠️ Información del contrato NO guardada - No hay datos');
    }

    // 7. Asignar propiedades
    console.log('\n🏠 PASO 7: Verificando propiedades asignadas...');
    const propertyIds = wizardData.assigned_property_ids || [];
    saveResults.properties.total = propertyIds.length;
    console.log('   → Propiedades a asignar:', propertyIds.length);

    if (propertyIds.length > 0) {
      try {
        const relations = propertyIds.map((propertyId: string) => ({
          client_id: newClient.id,
          property_id: propertyId,
          relation_type: 'tenant' as const,
          status: 'active' as const
        }));
        
        await createClientPropertyRelations(relations);
        saveResults.properties.saved = propertyIds.length;
        console.log(`   ✅ ${propertyIds.length} propiedades asignadas`);
      } catch (propError: any) {
        saveResults.properties.error = propError.message;
        console.error('   ❌ Error asignando propiedades:', propError);
      }
    } else {
      console.log('   ⚠️ Propiedades NO asignadas - No hay datos');
    }

    // RESUMEN FINAL
    console.log('\n==============================================');
    console.log('📊 RESUMEN DE GUARDADO');
    console.log('==============================================');
    console.log('Cliente:      ', saveResults.client.saved ? `✅ ID: ${saveResults.client.id}` : '❌');
    console.log('Credenciales: ', saveResults.credentials.saved ? `✅ Email: ${saveResults.credentials.email}` : `⚠️ ${saveResults.credentials.error || 'No configuradas'}`);
    console.log('Documentos:   ', saveResults.documents.saved > 0 ? `✅ ${saveResults.documents.saved}/${saveResults.documents.total}` : `⚠️ 0/${saveResults.documents.total}`);
    console.log('Pagos:        ', saveResults.payment.saved ? '✅' : `⚠️ ${saveResults.payment.error || 'No configurados'}`);
    console.log('Referencias:  ', saveResults.references.saved ? `✅ P:${saveResults.references.personal} C:${saveResults.references.commercial}` : `⚠️ ${saveResults.references.error || 'No agregadas'}`);
    console.log('Contrato:     ', saveResults.contract.saved ? '✅' : `⚠️ ${saveResults.contract.error || 'No configurado'}`);
    console.log('Propiedades:  ', saveResults.properties.saved > 0 ? `✅ ${saveResults.properties.saved}` : `⚠️ ${saveResults.properties.error || 'No asignadas'}`);
    console.log('==============================================\n');

    // Construir mensaje de resumen para el usuario
    const successCount = [
      saveResults.client.saved,
      saveResults.credentials.saved,
      saveResults.documents.saved > 0,
      saveResults.payment.saved,
      saveResults.references.saved,
      saveResults.contract.saved,
      saveResults.properties.saved > 0
    ].filter(Boolean).length;

    const warningMessages = [];
    if (!saveResults.credentials.saved) warningMessages.push('- Credenciales del portal no configuradas');
    if (saveResults.documents.saved === 0 && saveResults.documents.total > 0) warningMessages.push(`- Documentos no subidos (${saveResults.documents.errors.length} errores)`);
    if (!saveResults.payment.saved) warningMessages.push('- Configuración de pagos no guardada');
    if (!saveResults.references.saved) warningMessages.push('- Referencias no agregadas');
    if (!saveResults.contract.saved) warningMessages.push('- Información del contrato no guardada');
    if (saveResults.properties.saved === 0 && saveResults.properties.total > 0) warningMessages.push('- Propiedades no asignadas');

    // Recargar lista de clientes
    await loadClients();

    // Cerrar wizard
    setShowWizard(false);

    // Mostrar mensaje al usuario
    if (warningMessages.length === 0) {
      alert(`✅ Cliente creado exitosamente con TODOS los datos!

📊 Resumen:
- Cliente: ✅ Creado
- Credenciales: ✅ Configuradas
- Documentos: ✅ ${saveResults.documents.saved} subidos
- Pagos: ✅ Configurados
- Referencias: ✅ ${saveResults.references.personal + saveResults.references.commercial} agregadas
- Contrato: ✅ Configurado
- Propiedades: ✅ ${saveResults.properties.saved} asignadas`);
    } else {
      alert(`⚠️ Cliente creado con algunas advertencias

✅ Guardado exitosamente (${successCount}/7 secciones)

⚠️ Secciones con advertencias:
${warningMessages.join('\n')}

Revisa la consola del navegador (F12) para más detalles.`);
    }

  } catch (error: any) {
    console.error('\n❌❌❌ ERROR CRÍTICO EN CREACIÓN DE CLIENTE ❌❌❌');
    console.error('Error:', error);
    console.error('Stack trace:', error.stack);
    console.error('==============================================\n');
    
    alert(`❌ Error crítico al crear el cliente:

${error.message}

Por favor, revisa la consola del navegador (F12) para más detalles.`);
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
            GestiÃ³n de Clientes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra tu base de clientes reales
          </p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      {/* EstadÃ­sticas */}
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

          {/* Checkbox Seleccionar Todo */}
          <div className="flex items-center gap-2">
            <button
              onClick={multiSelect.toggleSelectAll}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {multiSelect.isAllSelected ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : multiSelect.isSomeSelected ? (
                <Minus className="w-5 h-5 text-blue-600" />
              ) : (
                <CheckboxIcon className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {multiSelect.selectedCount > 0 
                  ? `${multiSelect.selectedCount} seleccionado${multiSelect.selectedCount > 1 ? 's' : ''}`
                  : 'Seleccionar todo'
                }
              </span>
            </button>
            {multiSelect.selectedCount > 0 && (
              <button
                onClick={multiSelect.clearSelection}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
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
            className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
          >
            {/* Checkbox de selecciÃ³n - MOVIDO A LA IZQUIERDA */}
            <div className="absolute top-3 left-3 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  multiSelect.toggleSelect(client.id);
                }}
                className={`
                  p-2 rounded-lg shadow-lg transition-all transform hover:scale-110
                  ${multiSelect.isSelected(client.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                  }
                `}
              >
                {multiSelect.isSelected(client.id) ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <CheckboxIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Header con avatar y acciones */}
            <div className="p-4 pl-16 border-b border-gray-100 dark:border-gray-700">
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

            {/* InformaciÃ³n de contacto */}
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

            {/* Acciones rÃ¡pidas */}
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
              ? 'AÃºn no tienes clientes registrados en la base de datos'
              : 'Intenta ajustar los filtros de bÃºsqueda'}
          </p>
          {clients.length === 0 && (
            <button
              onClick={() => setShowWizard(true)}
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
                            <div className="text-sm text-gray-500">{prop.price ? `$${Number(prop.price).toLocaleString()}` : 'Sin precio'} â€” {prop.status}</div>
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


      {/* ========================================
          MODALES VIEJOS ELIMINADOS (1,137 lÃ­neas)
          - Modal Ver Cliente (viejo)
          - Modal Editar Cliente (viejo)
          Reemplazados por:
          - ClientDetailsEnhanced (ver más abajo)
          - ClientEditForm (ver más abajo)
          ======================================== */}


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
              {/* GalerÃ­a de ImÃ¡genes - Columna Principal */}
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

                        {/* NavegaciÃ³n de ImÃ¡genes */}
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

                        {/* Contador de ImÃ¡genes */}
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
                        <span className="ml-2 text-gray-500">Sin imÃ¡genes disponibles</span>
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
                      <span className="text-sm text-gray-600 dark:text-gray-400 block">BaÃ±os</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedPropertyForDetails.bathrooms}</p>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400 block">Ãrea</span>
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

      {/* Modal de Detalles del Cliente - NUEVO */}
      <ClientDetailsEnhanced
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onEdit={() => {
          setShowViewModal(false);
          setShowEditModal(true);
        }}
        onDelete={async (clientId) => {
          try {
            await deleteClient(clientId);
            setClients(clients.filter(c => c.id !== clientId));
            setShowViewModal(false);
            setSelectedClient(null);
            alert('âœ… Cliente eliminado correctamente');
          } catch (error) {
            console.error('âŒ Error eliminando cliente:', error);
            alert('âŒ Error al eliminar el cliente');
          }
        }}
      />

      {/* Modal de EdiciÃ³n del Cliente - NUEVO */}
      <ClientEditForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSave={() => {
          loadClients(); // Recargar lista de clientes
          setShowEditModal(false);
          setSelectedClient(null);
        }}
      />

      {/* Wizard de Nuevo Cliente */}
      <ClientWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSubmit={handleWizardSubmit}
        properties={allProperties}
        loadingProperties={loadingFormProperties}
      />

      {/* Barra de Acciones Masivas */}
      <BulkActionBar
        selectedCount={multiSelect.selectedCount}
        onClearSelection={multiSelect.clearSelection}
        entityName="clientes"
        actions={[
          {
            id: 'delete',
            label: 'Eliminar',
            icon: BulkActionIcons.Delete,
            variant: 'danger',
            onClick: handleBulkDelete
          },
          {
            id: 'activate',
            label: 'Activar',
            icon: BulkActionIcons.Check,
            variant: 'success',
            onClick: () => handleBulkChangeStatus('active')
          },
          {
            id: 'deactivate',
            label: 'Desactivar',
            icon: BulkActionIcons.Check,
            variant: 'default',
            onClick: () => handleBulkChangeStatus('inactive')
          },
          {
            id: 'tag',
            label: 'Etiquetar',
            icon: BulkActionIcons.Tag,
            variant: 'primary',
            onClick: handleBulkTag
          },
          {
            id: 'export',
            label: 'Exportar',
            icon: BulkActionIcons.Download,
            variant: 'default',
            onClick: handleBulkExport
          }
        ]}
      />
    </div>
  );
}

export default AdminClients;
