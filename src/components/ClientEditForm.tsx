// ===========================================================
// FORMULARIO DE EDICIÓN COMPLETA DEL CLIENTE
// ===========================================================
// Permite editar todos los campos del wizard organizados en tabs

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  DollarSign,
  Key,
  CreditCard,
  Shield,
  Save,
  AlertCircle,
  FileText
} from 'lucide-react';

import type { ClientWithDetails } from '../types/clients';
import { supabase } from '../lib/supabase';
import { updateClient, uploadClientDocument, deleteClientFile } from '../lib/clientsApi';
import DocumentUploader from './UI/DocumentUploader';

// =====================================================
// INTERFACES
// =====================================================

interface ClientEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
  onSave: () => void;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export const ClientEditForm: React.FC<ClientEditFormProps> = ({
  isOpen,
  onClose,
  client,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estados para cada sección
  const [basicData, setBasicData] = useState({
    full_name: '',
    document_type: 'cedula',
    document_number: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    client_type: 'renter',
    status: 'active',
    notes: ''
  });

  const [financialData, setFinancialData] = useState({
    monthly_income: 0,
    occupation: '',
    company_name: ''
  });

  const [credentialsData, setCredentialsData] = useState({
    email: '',
    portal_access_enabled: true,
    must_change_password: false
  });

  const [paymentData, setPaymentData] = useState({
    preferred_payment_method: '',
    billing_day: 1,
    arriendo_enabled: false,
    arriendo_amount: 0,
    admin_enabled: false,
    admin_amount: 0,
    servicios_enabled: false,
    servicios_amount: 0,
    servicios_types: [] as string[],
    otros_enabled: false,
    otros_amount: 0,
    otros_description: ''
  });

  const [contractData, setContractData] = useState({
    contract_start_date: '',
    contract_end_date: '',
    deposit_amount: 0,
    deposit_paid: false,
    has_guarantor: false,
    guarantor_name: '',
    guarantor_document: '',
    guarantor_phone: '',
    keys_delivered: false,
    signatures_complete: false
  });

  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && client) {
      loadClientData();
      loadClientDocuments();
    }
  }, [isOpen, client]);

  const loadClientDocuments = async () => {
    if (!client) return;

    try {
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingDocuments(data || []);
    } catch (error) {
      console.error('Error cargando documentos:', error);
    }
  };

  const loadClientData = async () => {
    if (!client) return;

    // Cargar datos básicos
    setBasicData({
      full_name: client.full_name,
      document_type: client.document_type,
      document_number: client.document_number,
      phone: client.phone,
      email: client.email || '',
      address: client.address || '',
      city: client.city || '',
      emergency_contact_name: client.emergency_contact_name || '',
      emergency_contact_phone: client.emergency_contact_phone || '',
      client_type: client.client_type,
      status: client.status,
      notes: client.notes || ''
    });

    setFinancialData({
      monthly_income: client.monthly_income || 0,
      occupation: client.occupation || '',
      company_name: client.company_name || ''
    });

    // Cargar credenciales
    const { data: credData } = await supabase
      .from('client_portal_credentials')
      .select('*')
      .eq('client_id', client.id)
      .maybeSingle();

    if (credData) {
      setCredentialsData({
        email: credData.email,
        portal_access_enabled: credData.portal_access_enabled,
        must_change_password: credData.must_change_password
      });
    }

    // Cargar configuración de pagos
    const { data: paymentConfigData } = await supabase
      .from('client_payment_config')
      .select('*')
      .eq('client_id', client.id)
      .maybeSingle();

    if (paymentConfigData) {
      const concepts = paymentConfigData.payment_concepts || {};
      setPaymentData({
        preferred_payment_method: paymentConfigData.preferred_payment_method || '',
        billing_day: paymentConfigData.billing_day || 1,
        arriendo_enabled: concepts.arriendo?.enabled || false,
        arriendo_amount: concepts.arriendo?.amount || 0,
        admin_enabled: concepts.administracion?.enabled || false,
        admin_amount: concepts.administracion?.amount || 0,
        servicios_enabled: concepts.servicios_publicos?.enabled || false,
        servicios_amount: concepts.servicios_publicos?.amount || 0,
        servicios_types: concepts.servicios_publicos?.types || [],
        otros_enabled: concepts.otros?.enabled || false,
        otros_amount: concepts.otros?.amount || 0,
        otros_description: concepts.otros?.description || ''
      });
    }

    // Cargar información del contrato
    const { data: contractInfoData } = await supabase
      .from('client_contract_info')
      .select('*')
      .eq('client_id', client.id)
      .maybeSingle();

    if (contractInfoData) {
      // NOTA: client_contract_info NO tiene start_date/end_date (solo campos de depósito, fiador, llaves, firmas)
      setContractData({
        contract_start_date: '', // No existe en BD, dejamos vacío
        contract_end_date: '', // No existe en BD, dejamos vacío
        deposit_amount: contractInfoData.deposit_amount || 0,
        deposit_paid: contractInfoData.deposit_paid || false,
        has_guarantor: contractInfoData.guarantor_required || false,
        guarantor_name: contractInfoData.guarantor_name || '',
        guarantor_document: contractInfoData.guarantor_document_number || '',
        guarantor_phone: contractInfoData.guarantor_phone || '',
        keys_delivered: contractInfoData.keys_delivered || false,
        signatures_complete: (contractInfoData.contract_signed_by_client && contractInfoData.contract_signed_by_landlord) || false
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!basicData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es requerido';
    }

    if (!basicData.document_number.trim()) {
      newErrors.document_number = 'El número de documento es requerido';
    }

    if (!basicData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (basicData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !client) {
      return;
    }

    try {
      setLoading(true);

      // 1. Actualizar cliente base
      await updateClient(client.id, {
        ...basicData,
        ...financialData,
        document_type: basicData.document_type as 'cedula' | 'pasaporte' | 'nit',
        client_type: basicData.client_type as 'owner' | 'renter' | 'buyer' | 'seller',
        status: basicData.status as 'active' | 'inactive' | 'suspended'
      });

      // 2. Actualizar credenciales si existen
      const { data: existingCred } = await supabase
        .from('client_portal_credentials')
        .select('id')
        .eq('client_id', client.id)
        .maybeSingle();

      if (existingCred) {
        await supabase
          .from('client_portal_credentials')
          .update({
            email: credentialsData.email,
            portal_access_enabled: credentialsData.portal_access_enabled,
            must_change_password: credentialsData.must_change_password
          })
          .eq('client_id', client.id);
      }

      // 3. Actualizar configuración de pagos
      const paymentConcepts = {
        arriendo: paymentData.arriendo_enabled ? {
          enabled: true,
          amount: paymentData.arriendo_amount
        } : { enabled: false, amount: 0 },
        administracion: paymentData.admin_enabled ? {
          enabled: true,
          amount: paymentData.admin_amount
        } : { enabled: false, amount: 0 },
        servicios_publicos: paymentData.servicios_enabled ? {
          enabled: true,
          amount: paymentData.servicios_amount,
          types: paymentData.servicios_types
        } : { enabled: false, amount: 0, types: [] },
        otros: paymentData.otros_enabled ? {
          enabled: true,
          amount: paymentData.otros_amount,
          description: paymentData.otros_description
        } : { enabled: false, amount: 0, description: '' }
      };

      const { data: existingPayment } = await supabase
        .from('client_payment_config')
        .select('id')
        .eq('client_id', client.id)
        .maybeSingle();

      if (existingPayment) {
        await supabase
          .from('client_payment_config')
          .update({
            preferred_payment_method: paymentData.preferred_payment_method,
            billing_day: paymentData.billing_day,
            payment_concepts: paymentConcepts
          })
          .eq('client_id', client.id);
      } else {
        await supabase
          .from('client_payment_config')
          .insert({
            client_id: client.id,
            preferred_payment_method: paymentData.preferred_payment_method,
            billing_day: paymentData.billing_day,
            payment_concepts: paymentConcepts
          });
      }

      // 4. Actualizar información del contrato
      const { data: existingContract } = await supabase
        .from('client_contract_info')
        .select('id')
        .eq('client_id', client.id)
        .maybeSingle();

      // Mapear campos correctamente según la estructura de la BD
      // NOTA: start_date y end_date NO están en client_contract_info (tabla tiene 44 columnas sin fechas de contrato)
      const contractDataForDB = {
        deposit_amount: contractData.deposit_amount || 0,
        deposit_paid: contractData.deposit_paid || false,
        deposit_payment_date: contractData.deposit_paid ? new Date().toISOString().split('T')[0] : null,
        guarantor_required: contractData.has_guarantor || false,
        guarantor_name: contractData.guarantor_name || null,
        guarantor_document_type: null,
        guarantor_document_number: contractData.guarantor_document || null,
        guarantor_phone: contractData.guarantor_phone || null,
        guarantor_email: null,
        guarantor_address: null,
        keys_delivered: contractData.keys_delivered || false,
        keys_quantity: 0,
        keys_delivery_date: contractData.keys_delivered ? new Date().toISOString().split('T')[0] : null,
        contract_signed_by_client: contractData.signatures_complete || false,
        contract_signed_date_client: contractData.signatures_complete ? new Date().toISOString().split('T')[0] : null,
        contract_signed_by_landlord: contractData.signatures_complete || false,
        contract_signed_date_landlord: contractData.signatures_complete ? new Date().toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString()
      };

      try {
        if (existingContract) {
          const { error: updError } = await supabase
            .from('client_contract_info')
            .update(contractDataForDB)
            .eq('client_id', client.id);

          if (updError) throw updError;
        } else {
          const { error: insError } = await supabase
            .from('client_contract_info')
            .insert({
              client_id: client.id,
              ...contractDataForDB
            });

          if (insError) throw insError;
        }

        alert('✅ Cliente actualizado exitosamente');
        onSave();
        onClose();
      } catch (contractErr) {
        console.error('❌ Error al guardar contract info. Payload:', contractDataForDB);
        console.error('❌ Supabase error:', contractErr);
        // Mostrar mensaje pero NO cerrar el modal para que el usuario pueda seguir editando
        alert('⚠️ No se pudo guardar la información del contrato. Revisa la consola para más detalles.');
      }

    } catch (error) {
      console.error('❌ Error actualizando cliente:', error);
      alert('Error al actualizar el cliente');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !client) return null;

  const tabs = [
    { id: 'basic', label: 'Información Básica', icon: User },
    { id: 'financial', label: 'Información Financiera', icon: DollarSign },
    { id: 'credentials', label: 'Credenciales', icon: Key },
    { id: 'payments', label: 'Pagos', icon: CreditCard },
    { id: 'contract', label: 'Contrato', icon: Shield },
    { id: 'documents', label: 'Documentos', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-top transition-all transform bg-white shadow-2xl rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-gray-900">Editar Cliente: {client.full_name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-white'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6 max-h-[600px] overflow-y-auto">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <BasicInfoForm 
                  data={basicData} 
                  setData={setBasicData} 
                  errors={errors} 
                />
              )}

              {/* Financial Info Tab */}
              {activeTab === 'financial' && (
                <FinancialInfoForm 
                  data={financialData} 
                  setData={setFinancialData} 
                />
              )}

              {/* Credentials Tab */}
              {activeTab === 'credentials' && (
                <CredentialsForm 
                  data={credentialsData} 
                  setData={setCredentialsData} 
                />
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <PaymentsForm 
                  data={paymentData} 
                  setData={setPaymentData} 
                />
              )}

              {/* Contract Tab */}
              {activeTab === 'contract' && (
                <ContractForm 
                  data={contractData} 
                  setData={setContractData} 
                />
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <DocumentsForm
                  clientId={client.id}
                  existingDocuments={existingDocuments}
                  onDocumentUploaded={loadClientDocuments}
                  onDocumentDeleted={loadClientDocuments}
                />
              )}
            </div>

            {/* Footer with buttons */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertCircle className="w-4 h-4" />
                <span>Los campos marcados con * son obligatorios</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// FORM SECTIONS
// =====================================================

const BasicInfoForm: React.FC<{
  data: any;
  setData: (data: any) => void;
  errors: Record<string, string>;
}> = ({ data, setData, errors }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre Completo *
        </label>
        <input
          type="text"
          value={data.full_name}
          onChange={(e) => setData({ ...data, full_name: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.full_name ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Documento
        </label>
        <select
          value={data.document_type}
          onChange={(e) => setData({ ...data, document_type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
          value={data.document_number}
          onChange={(e) => setData({ ...data, document_number: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.document_number ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.document_number && <p className="mt-1 text-sm text-red-600">{errors.document_number}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono *
        </label>
        <input
          type="text"
          value={data.phone}
          onChange={(e) => setData({ ...data, phone: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.phone ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ciudad
        </label>
        <input
          type="text"
          value={data.city}
          onChange={(e) => setData({ ...data, city: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Cliente
        </label>
        <select
          value={data.client_type}
          onChange={(e) => setData({ ...data, client_type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="owner">Propietario</option>
          <option value="renter">Arrendatario</option>
          <option value="buyer">Comprador</option>
          <option value="seller">Vendedor</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <select
          value={data.status}
          onChange={(e) => setData({ ...data, status: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="suspended">Suspendido</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contacto de Emergencia
        </label>
        <input
          type="text"
          value={data.emergency_contact_name}
          onChange={(e) => setData({ ...data, emergency_contact_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Nombre"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono de Emergencia
        </label>
        <input
          type="text"
          value={data.emergency_contact_phone}
          onChange={(e) => setData({ ...data, emergency_contact_phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Teléfono"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          value={data.notes}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Notas adicionales sobre el cliente..."
        />
      </div>
    </div>
  </div>
);

const FinancialInfoForm: React.FC<{
  data: any;
  setData: (data: any) => void;
}> = ({ data, setData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ingresos Mensuales
        </label>
        <input
          type="number"
          value={data.monthly_income}
          onChange={(e) => setData({ ...data, monthly_income: parseFloat(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ocupación
        </label>
        <input
          type="text"
          value={data.occupation}
          onChange={(e) => setData({ ...data, occupation: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Ocupación"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Empresa
        </label>
        <input
          type="text"
          value={data.company_name}
          onChange={(e) => setData({ ...data, company_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Nombre de la empresa"
        />
      </div>
    </div>
  </div>
);

const CredentialsForm: React.FC<{
  data: any;
  setData: (data: any) => void;
}> = ({ data, setData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email del Portal
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="email@ejemplo.com"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.portal_access_enabled}
            onChange={(e) => setData({ ...data, portal_access_enabled: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Acceso al Portal Habilitado</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.must_change_password}
            onChange={(e) => setData({ ...data, must_change_password: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Requerir Cambio de Contraseña</span>
        </label>
      </div>
    </div>
  </div>
);

const PaymentsForm: React.FC<{
  data: any;
  setData: (data: any) => void;
}> = ({ data, setData }) => {
  const calculateTotal = () => {
    let total = 0;
    if (data.arriendo_enabled) total += data.arriendo_amount;
    if (data.admin_enabled) total += data.admin_amount;
    if (data.servicios_enabled) total += data.servicios_amount;
    if (data.otros_enabled) total += data.otros_amount;
    return total;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Método de Pago Preferido
          </label>
          <select
            value={data.preferred_payment_method}
            onChange={(e) => setData({ ...data, preferred_payment_method: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione...</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia Bancaria</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Día de Facturación
          </label>
          <input
            type="number"
            min="1"
            max="31"
            value={data.billing_day}
            onChange={(e) => setData({ ...data, billing_day: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conceptos de Pago */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Conceptos de Pago</h4>

        {/* Arriendo */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={data.arriendo_enabled}
              onChange={(e) => setData({ ...data, arriendo_enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium text-gray-900">Arriendo</span>
          </label>
          {data.arriendo_enabled && (
            <input
              type="number"
              value={data.arriendo_amount}
              onChange={(e) => setData({ ...data, arriendo_amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Monto"
            />
          )}
        </div>

        {/* Administración */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={data.admin_enabled}
              onChange={(e) => setData({ ...data, admin_enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium text-gray-900">Administración</span>
          </label>
          {data.admin_enabled && (
            <input
              type="number"
              value={data.admin_amount}
              onChange={(e) => setData({ ...data, admin_amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Monto"
            />
          )}
        </div>

        {/* Servicios Públicos */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={data.servicios_enabled}
              onChange={(e) => setData({ ...data, servicios_enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium text-gray-900">Servicios Públicos</span>
          </label>
          {data.servicios_enabled && (
            <input
              type="number"
              value={data.servicios_amount}
              onChange={(e) => setData({ ...data, servicios_amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Monto"
            />
          )}
        </div>

        {/* Otros */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={data.otros_enabled}
              onChange={(e) => setData({ ...data, otros_enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium text-gray-900">Otros</span>
          </label>
          {data.otros_enabled && (
            <div className="space-y-3">
              <input
                type="number"
                value={data.otros_amount}
                onChange={(e) => setData({ ...data, otros_amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Monto"
              />
              <input
                type="text"
                value={data.otros_description}
                onChange={(e) => setData({ ...data, otros_description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción"
              />
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <span className="font-bold text-blue-900">Total Mensual</span>
        <span className="font-bold text-2xl text-blue-600">${calculateTotal().toLocaleString('es-CO')}</span>
      </div>
    </div>
  );
};

const ContractForm: React.FC<{
  data: any;
  setData: (data: any) => void;
}> = ({ data, setData }) => {
  // Función para formatear fecha correctamente
  const formatDateForInput = (dateValue: string) => {
    if (!dateValue) return '';
    try {
      // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
      }
      // Si no, intentar parsear y formatear
      const date = new Date(dateValue);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Inicio
          </label>
          <input
            type="date"
            value={formatDateForInput(data.contract_start_date)}
            onChange={(e) => setData({ ...data, contract_start_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Fin
          </label>
          <input
            type="date"
            value={formatDateForInput(data.contract_end_date)}
            onChange={(e) => setData({ ...data, contract_end_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monto del Depósito
        </label>
        <input
          type="number"
          value={data.deposit_amount}
          onChange={(e) => setData({ ...data, deposit_amount: parseFloat(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
      </div>

      <div className="flex items-center gap-6 pt-7">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.deposit_paid}
            onChange={(e) => setData({ ...data, deposit_paid: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Depósito Pagado</span>
        </label>
      </div>
    </div>

    {/* Fiador */}
    <div className="space-y-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={data.has_guarantor}
          onChange={(e) => setData({ ...data, has_guarantor: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="font-medium text-gray-900">¿Tiene Fiador?</span>
      </label>

      {data.has_guarantor && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Fiador
            </label>
            <input
              type="text"
              value={data.guarantor_name}
              onChange={(e) => setData({ ...data, guarantor_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documento del Fiador
            </label>
            <input
              type="text"
              value={data.guarantor_document}
              onChange={(e) => setData({ ...data, guarantor_document: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono del Fiador
            </label>
            <input
              type="text"
              value={data.guarantor_phone}
              onChange={(e) => setData({ ...data, guarantor_phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>

    {/* Estado del Contrato */}
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Estado del Contrato</h4>
      
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={data.keys_delivered}
          onChange={(e) => setData({ ...data, keys_delivered: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">Llaves Entregadas</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={data.signatures_complete}
          onChange={(e) => setData({ ...data, signatures_complete: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">Firmas Completas</span>
      </label>
    </div>
  </div>
);
};

const DocumentsForm: React.FC<{
  clientId: string;
  existingDocuments: any[];
  onDocumentUploaded: () => void;
  onDocumentDeleted: () => void;
}> = ({ clientId, existingDocuments, onDocumentUploaded, onDocumentDeleted }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>('cedula_frente');

  const documentTypes = [
    { value: 'cedula_frente', label: 'Cédula (Frente)' },
    { value: 'cedula_reverso', label: 'Cédula (Reverso)' },
    { value: 'certificado_laboral', label: 'Certificado Laboral' },
    { value: 'certificado_ingresos', label: 'Certificado de Ingresos' },
    { value: 'referencias_bancarias', label: 'Referencias Bancarias' },
    { value: 'contrato_firmado', label: 'Contrato Firmado' },
    { value: 'recibo_pago', label: 'Recibo de Pago' },
    { value: 'garantia', label: 'Documentos del Fiador' },
    { value: 'otro', label: 'Otro Documento' }
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await uploadClientDocument(clientId, selectedDocType as any, file);
      alert('✅ Documento subido exitosamente');
      onDocumentUploaded();
      e.target.value = ''; // Reset input
    } catch (error) {
      console.error('Error subiendo documento:', error);
      alert('❌ Error al subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, storagePath: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      // Eliminar de Storage
      if (storagePath) {
        await deleteClientFile(storagePath);
      }

      // Eliminar de la base de datos
      const { error } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      alert('✅ Documento eliminado');
      onDocumentDeleted();
    } catch (error) {
      console.error('Error eliminando documento:', error);
      alert('❌ Error al eliminar el documento');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  };

  const getDocumentTypeLabel = (type: string): string => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Uploader */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-gray-900 mb-4">Subir Nuevo Documento</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Documento
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Archivo
            </label>
            <input
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.zip,.rar"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
        </div>

        {uploading && (
          <div className="mt-4 flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm">Subiendo documento...</span>
          </div>
        )}

        <p className="mt-3 text-xs text-gray-500">
          Formatos permitidos: PDF, JPG, PNG, Word, Excel, ZIP, RAR • Máximo 20MB
        </p>
      </div>

      {/* Lista de documentos existentes */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Documentos Subidos ({existingDocuments.length})</h4>
        
        {existingDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay documentos subidos aún
          </div>
        ) : (
          <div className="space-y-3">
            {existingDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {getDocumentTypeLabel(doc.document_type)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {doc.document_name} • {formatFileSize(doc.file_size)}
                      </p>
                      {doc.created_at && (
                        <p className="text-xs text-gray-400">
                          Subido: {new Date(doc.created_at).toLocaleDateString('es-CO')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {doc.file_path && (
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Ver
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc.id, doc.storage_path)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
