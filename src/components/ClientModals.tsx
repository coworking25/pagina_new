// =====================================================
// MODALES PARA GESTIÓN DE CLIENTES
// =====================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  DollarSign,
  Calendar,
  AlertTriangle,
  Edit,
  UserPlus
} from 'lucide-react';

import {
  createClient,
  updateClient
} from '../lib/clientsApi';

import type {
  Client,
  ClientWithDetails,
  ClientFormData
} from '../types/clients';

// =====================================================
// INTERFACES
// =====================================================

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ViewClientModalProps extends BaseModalProps {
  client: ClientWithDetails | null;
}

// =====================================================
// COMPONENTE: MODAL BASE
// =====================================================

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`inline-block w-full ${sizeClasses[size]} my-8 overflow-hidden text-left align-top transition-all transform bg-white shadow-xl rounded-lg`}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// MODAL: VER CLIENTE
// =====================================================

export const ViewClientModal: React.FC<ViewClientModalProps> = ({ isOpen, onClose, client }) => {
  if (!client) return null;

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
    <Modal isOpen={isOpen} onClose={onClose} title="Información del Cliente" size="xl">
      <div className="space-y-6">
        {/* Header con estado */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{client.full_name}</h2>
            <p className="text-gray-600">{client.document_number}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(client.status)}`}>
              {client.status}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getClientTypeColor(client.client_type)}`}>
              {client.client_type}
            </span>
          </div>
        </div>

        {/* Información personal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{client.email || 'No registrado'}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Teléfono:</span>
                <span className="font-medium">{client.phone}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Dirección:</span>
                <span className="font-medium">{client.address || 'No registrada'}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Ciudad:</span>
                <span className="font-medium">{client.city || 'No registrada'}</span>
              </div>
            </div>
          </div>

          {/* Información financiera */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Información Financiera
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Ingresos Mensuales:</span>
                <span className="font-medium">
                  {client.monthly_income 
                    ? `$${client.monthly_income.toLocaleString()}` 
                    : 'No registrado'
                  }
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Ocupación:</span>
                <span className="font-medium">{client.occupation || 'No registrada'}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Empresa:</span>
                <span className="font-medium">{client.company_name || 'No registrada'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contacto de emergencia */}
        {(client.emergency_contact_name || client.emergency_contact_phone) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Contacto de Emergencia
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">{client.emergency_contact_name || 'No registrado'}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Teléfono:</span>
                <span className="font-medium">{client.emergency_contact_phone || 'No registrado'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        {(client.total_contracts !== undefined || client.pending_payments !== undefined) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Contratos</p>
                <p className="text-2xl font-bold text-blue-900">{client.total_contracts || 0}</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-yellow-900">{client.pending_payments || 0}</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Alertas</p>
                <p className="text-2xl font-bold text-red-900">{client.active_alerts || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notas */}
        {client.notes && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Notas</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{client.notes}</p>
            </div>
          </div>
        )}

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Creado: {new Date(client.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Actualizado: {new Date(client.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// =====================================================
// MODAL: CREAR/EDITAR CLIENTE
// =====================================================

interface ClientFormModalProps extends BaseModalProps {
  client?: ClientWithDetails | null;
  onSave: (client: Client) => void;
  mode: 'create' | 'edit';
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({ 
  isOpen, 
  onClose, 
  client, 
  onSave, 
  mode 
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    full_name: '',
    document_type: 'cedula',
    document_number: '',
    phone: '',
    client_type: 'buyer',
    status: 'active'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del cliente si estamos editando
  useEffect(() => {
    if (mode === 'edit' && client) {
      setFormData({
        full_name: client.full_name,
        document_type: client.document_type,
        document_number: client.document_number,
        phone: client.phone,
        email: client.email,
        address: client.address,
        city: client.city,
        emergency_contact_name: client.emergency_contact_name,
        emergency_contact_phone: client.emergency_contact_phone,
        client_type: client.client_type,
        status: client.status,
        monthly_income: client.monthly_income,
        occupation: client.occupation,
        company_name: client.company_name,
        assigned_advisor_id: client.assigned_advisor_id,
        notes: client.notes
      });
    } else {
      // Reset form para modo crear
      setFormData({
        full_name: '',
        document_type: 'cedula',
        document_number: '',
        phone: '',
        client_type: 'buyer',
        status: 'active'
      });
    }
    setErrors({});
  }, [mode, client, isOpen]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es requerido';
    }

    if (!formData.document_number.trim()) {
      newErrors.document_number = 'El número de documento es requerido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      let savedClient: Client;
      
      if (mode === 'create') {
        savedClient = await createClient(formData);
      } else if (client) {
        savedClient = await updateClient(client.id, formData);
      } else {
        throw new Error('Cliente no encontrado para editar');
      }

      onSave(savedClient);
      onClose();
      
    } catch (error) {
      console.error(`❌ Error ${mode === 'create' ? 'creando' : 'actualizando'} cliente:`, error);
      alert(`Error al ${mode === 'create' ? 'crear' : 'actualizar'} el cliente`);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en inputs
  const handleInputChange = (field: keyof ClientFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || undefined : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const title = mode === 'create' ? 'Crear Nuevo Cliente' : 'Editar Cliente';
  const submitText = mode === 'create' ? 'Crear Cliente' : 'Guardar Cambios';
  const Icon = mode === 'create' ? UserPlus : Edit;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Información Personal
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={handleInputChange('full_name')}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.full_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ingrese el nombre completo"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento
              </label>
              <select
                value={formData.document_type}
                onChange={handleInputChange('document_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="cedula">Cédula</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="nit">NIT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Documento *
              </label>
              <input
                type="text"
                value={formData.document_number}
                onChange={handleInputChange('document_number')}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.document_number ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Número de documento"
              />
              {errors.document_number && (
                <p className="mt-1 text-sm text-red-600">{errors.document_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Número de teléfono"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange('email')}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Correo electrónico"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={handleInputChange('city')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Ciudad"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={handleInputChange('address')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Dirección completa"
            />
          </div>
        </div>

        {/* Tipo y Estado */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Tipo y Estado</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cliente
              </label>
              <select
                value={formData.client_type}
                onChange={handleInputChange('client_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
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
                value={formData.status}
                onChange={handleInputChange('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="suspended">Suspendido</option>
              </select>
            </div>
          </div>
        </div>

        {/* Información Financiera */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Información Financiera
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingresos Mensuales
              </label>
              <input
                type="number"
                value={formData.monthly_income || ''}
                onChange={handleInputChange('monthly_income')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ocupación
              </label>
              <input
                type="text"
                value={formData.occupation || ''}
                onChange={handleInputChange('occupation')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Ocupación"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <input
                type="text"
                value={formData.company_name || ''}
                onChange={handleInputChange('company_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre de la empresa"
              />
            </div>
          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Contacto de Emergencia
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Contacto
              </label>
              <input
                type="text"
                value={formData.emergency_contact_name || ''}
                onChange={handleInputChange('emergency_contact_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del contacto de emergencia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono del Contacto
              </label>
              <input
                type="text"
                value={formData.emergency_contact_phone || ''}
                onChange={handleInputChange('emergency_contact_phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Teléfono del contacto de emergencia"
              />
            </div>
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={handleInputChange('notes')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Notas adicionales sobre el cliente..."
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Icon className="w-4 h-4" />
                {submitText}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
