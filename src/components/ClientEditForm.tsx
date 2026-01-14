import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  DollarSign,
  Home,
  FileText,
  Users,
  Save,
  AlertCircle,
  CreditCard
} from 'lucide-react';

import type { ClientWithDetails } from '../types/clients';
import { supabase } from '../lib/supabase';
import { useClientForm } from '../hooks/useClientForm';
import { ReferencesForm } from './client-details/ReferencesForm';
import { PropertiesForm } from './client-details/PropertiesForm';
import { PaymentsHistoryForm } from './client-details/PaymentsHistoryForm';
import DocumentUploader from './UI/DocumentUploader';

interface ClientEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
  onSave: () => void;
}

export const ClientEditForm: React.FC<ClientEditFormProps> = ({
  isOpen,
  onClose,
  client,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('general');
  
  // Listas de datos relacionados
  const [references, setReferences] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [availableProperties, setAvailableProperties] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // Hook del formulario principal
  const { form, isLoading, generalError, saveClient } = useClientForm(client, onSave);
  const { register, formState: { errors }, watch } = form;

  // Cargar datos relacionados cuando cambia el cliente
  useEffect(() => {
    if (client && isOpen) {
      loadRelatedData();
    }
  }, [client, isOpen]);

  const loadRelatedData = async () => {
    if (!client) return;

    try {
      // 1. Referencias
      const { data: refs } = await supabase
        .from('client_references')
        .select('*')
        .eq('client_id', client.id);
      setReferences(refs || []);

      // 2. Propiedades Asignadas
      const { data: props } = await supabase
        .from('client_property_relations')
        .select(`
          *,
          property:properties!inner(
            id,
            code,
            title,
            type,
            location,
            price,
            cover_image,
            bedrooms,
            bathrooms,
            area,
            status
          )
        `)
        .eq('client_id', client.id)
        .eq('status', 'active');
      setProperties(props || []);

      // 3. Propiedades Disponibles (para el dropdown)
      const { data: availProps } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available');
      setAvailableProperties(availProps || []);

      // 4. Historial de Pagos
      const { data: payHistory } = await supabase
        .from('payment_schedules')
        .select('*')
        .eq('client_id', client.id)
        .order('due_date', { ascending: false });
      setPayments(payHistory || []);

    } catch (error) {
      console.error('Error loading related data:', error);
    }
  };

  if (!isOpen || !client) return null;

  const tabs = [
    { id: 'general', label: 'Información General', icon: User },
    { id: 'references', label: 'Referencias', icon: Users },
    { id: 'properties', label: 'Propiedades', icon: Home },
    { id: 'billing', label: 'Configuración de Pagos', icon: CreditCard },
    { id: 'history', label: 'Historial', icon: DollarSign },
    { id: 'documents', label: 'Documentos', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {client.full_name || 'Editar Cliente'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {client.document_number} • {client.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {generalError}
            </div>
          )}

          <form id="client-form" onSubmit={saveClient}>
            
            {/* TAB: GENERAL */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Datos Personales */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Datos Personales</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
                      <input
                        {...register('full_name')}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo Doc.</label>
                        <select
                          {...register('document_type')}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="cedula">Cédula</option>
                          <option value="nit">NIT</option>
                          <option value="pasaporte">Pasaporte</option>
                          <option value="cedula_extranjeria">Cédula Extranjería</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número Doc.</label>
                        <input
                          {...register('document_number')}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        {errors.document_number && <p className="text-red-500 text-xs mt-1">{errors.document_number.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                        <input
                          {...register('phone')}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                          {...register('email')}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                      <input
                        {...register('address')}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Información Adicional */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">Información Adicional</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ocupación</label>
                      <input
                        {...register('occupation')}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Empresa</label>
                      <input
                        {...register('company_name')}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ingresos Mensuales</label>
                      <input
                        type="number"
                        {...register('monthly_income', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contacto Emergencia</label>
                        <input
                          {...register('emergency_contact_name')}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tel. Emergencia</label>
                        <input
                          {...register('emergency_contact_phone')}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Portal de Clientes */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Acceso al Portal</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('portal_access_enabled')}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Habilitar acceso al portal</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('must_change_password')}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Forzar cambio de contraseña</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email de Acceso</label>
                    <input
                      {...register('portal_email')}
                      className="w-full md:w-1/2 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BILLING */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Método de Pago</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Método Preferido</label>
                        <select
                          {...register('preferred_payment_method')}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="transferencia">Transferencia Bancaria</option>
                          <option value="efectivo">Efectivo</option>
                          <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Día de Facturación</label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          {...register('billing_day', { valueAsNumber: true })}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Conceptos de Cobro</h3>
                    <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      {/* Arriendo */}
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          {...register('arriendo_enabled')}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="w-24 text-sm font-medium">Arriendo</span>
                        <input
                          type="number"
                          placeholder="Monto"
                          {...register('arriendo_amount', { valueAsNumber: true })}
                          className="flex-1 px-3 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>

                      {/* Administración */}
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          {...register('admin_enabled')}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="w-24 text-sm font-medium">Admin.</span>
                        <input
                          type="number"
                          placeholder="Monto"
                          {...register('admin_amount', { valueAsNumber: true })}
                          className="flex-1 px-3 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>

                      {/* Servicios */}
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          {...register('servicios_enabled')}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="w-24 text-sm font-medium">Servicios</span>
                        <input
                          type="number"
                          placeholder="Monto Estimado"
                          {...register('servicios_amount', { valueAsNumber: true })}
                          className="flex-1 px-3 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>

                      {/* Otros */}
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          {...register('otros_enabled')}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="w-24 text-sm font-medium">Otros</span>
                        <input
                          type="number"
                          placeholder="Monto"
                          {...register('otros_amount', { valueAsNumber: true })}
                          className="flex-1 px-3 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      {watch('otros_enabled') && (
                        <input
                          placeholder="Descripción del cobro adicional"
                          {...register('otros_description')}
                          className="w-full mt-2 px-3 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* TAB: REFERENCES */}
          {activeTab === 'references' && (
            <ReferencesForm
              references={references}
              setReferences={setReferences}
              clientId={client.id}
            />
          )}

          {/* TAB: PROPERTIES */}
          {activeTab === 'properties' && (
            <PropertiesForm
              properties={properties}
              availableProperties={availableProperties}
              setProperties={setProperties}
              clientId={client.id}
              onPropertiesChange={loadRelatedData}
            />
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'history' && (
            <PaymentsHistoryForm payments={payments} />
          )}

          {/* TAB: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <DocumentUploader
                clientId={client.id}
                onUploadComplete={() => {
                  // Recargar documentos si fuera necesario
                }}
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={saveClient}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};
