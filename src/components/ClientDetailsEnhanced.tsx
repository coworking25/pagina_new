// =====================================================
// MODAL DE DETALLES DEL CLIENTE - VERSIÓN MEJORADA
// =====================================================
// Incluye todas las funcionalidades del wizard:
// - Información básica
// - Información financiera
// - Documentos subidos
// - Credenciales del portal
// - Configuración de pagos
// - Referencias personales y comerciales
// - Información del contrato
// - Propiedades asignadas

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
  FileText,
  Key,
  CreditCard,
  Users,
  Home,
  Download,
  Eye,
  Shield,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

import type { ClientWithDetails } from '../types/clients';
import { supabase } from '../lib/supabase';

// =====================================================
// INTERFACES
// =====================================================

interface ClientDetailsEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
  onEdit?: () => void;
  onDelete?: (clientId: string) => void;
}

interface PortalCredentials {
  email: string;
  portal_access_enabled: boolean;
  last_login: string | null;
  welcome_email_sent: boolean;
  must_change_password: boolean;
}

interface ClientDocument {
  id: string;
  document_type: string;
  document_name: string;
  file_path: string;
  file_size: number;
  storage_path: string;
  mime_type: string;
  status: string;
  created_at: string;
  is_required: boolean;
}

interface ClientProperty {
  id: string;
  client_id: string;
  property_id: number;
  relation_type: 'owner' | 'tenant' | 'interested' | 'pending_contract';
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  property: {
    id: number;
    code: string;
    title: string;
    type: string;
    location: string;
    price: number;
    cover_image: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    status: string;
  };
  created_at: string;
}

interface Payment {
  id: string;
  client_id: string;
  contract_id?: string;
  amount: number;
  due_date: string;
  paid_date?: string | null;
  status: 'pending' | 'paid' | 'overdue' | 'partial' | 'cancelled';
  payment_method?: string | null;
  payment_type: string;
  receipt_url?: string | null;
  receipt_file_name?: string | null;
  notes?: string | null;
  created_at: string;
}

interface PaymentConfig {
  preferred_payment_method: string;
  billing_day: number;
  payment_concepts: {
    arriendo?: { enabled: boolean; amount: number };
    administracion?: { enabled: boolean; amount: number };
    servicios_publicos?: { enabled: boolean; types: string[]; amount: number };
    otros?: { enabled: boolean; description: string; amount: number };
  };
}

interface ClientReference {
  id: string;
  reference_type: 'personal' | 'commercial';
  name: string;
  phone: string;
  relationship?: string;
  company_name?: string;
}

interface ContractInfo {
  contract_start_date: string | null;
  contract_end_date: string | null;
  deposit_amount: number | null;
  deposit_paid: boolean;
  has_guarantor: boolean;
  guarantor_name: string | null;
  guarantor_document: string | null;
  guarantor_phone: string | null;
  keys_delivered: boolean;
  signatures_complete: boolean;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export const ClientDetailsEnhanced: React.FC<ClientDetailsEnhancedProps> = ({
  isOpen,
  onClose,
  client,
  onEdit,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [credentials, setCredentials] = useState<PortalCredentials | null>(null);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [references, setReferences] = useState<ClientReference[]>([]);
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [properties, setProperties] = useState<ClientProperty[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState<string | null>(null);

  // Cargar datos adicionales cuando se abre el modal
  useEffect(() => {
    if (isOpen && client) {
      loadClientData();
    }
  }, [isOpen, client]);

  const loadClientData = async () => {
    if (!client) return;
    
    setLoading(true);
    try {
      // Cargar credenciales del portal
      const { data: credData } = await supabase
        .from('client_portal_credentials')
        .select('*')
        .eq('client_id', client.id)
        .maybeSingle();
      
      if (credData) {
        setCredentials(credData);
      }

      // Cargar documentos
      const { data: docsData } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });
      
      if (docsData) {
        setDocuments(docsData);
      }

      // Cargar configuración de pagos
      const { data: paymentData } = await supabase
        .from('client_payment_config')
        .select('*')
        .eq('client_id', client.id)
        .maybeSingle();
      
      if (paymentData) {
        setPaymentConfig(paymentData);
      }

      // Cargar referencias
      const { data: refsData } = await supabase
        .from('client_references')
        .select('*')
        .eq('client_id', client.id);
      
      if (refsData) {
        setReferences(refsData);
      }

      // Cargar información del contrato
      const { data: contractData } = await supabase
        .from('client_contract_info')
        .select('*')
        .eq('client_id', client.id)
        .maybeSingle();
      
      if (contractData) {
        setContractInfo(contractData);
      }

      // Cargar propiedades asignadas
      const { data: propsData } = await supabase
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
        .eq('client_id', client.id);
      
      if (propsData) {
        setProperties(propsData as any);
      }

      // Cargar historial de pagos
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('client_id', client.id)
        .order('due_date', { ascending: false });
      
      if (paymentsData) {
        setPayments(paymentsData);
      }

    } catch (error) {
      console.error('❌ Error cargando datos del cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !client) return null;

  const tabs = [
    { id: 'basic', label: 'Información Básica', icon: User },
    { id: 'financial', label: 'Información Financiera', icon: DollarSign },
    { id: 'documents', label: 'Documentos', icon: FileText, count: documents.length },
    { id: 'credentials', label: 'Credenciales', icon: Key },
    { id: 'payments', label: 'Configuración de Pagos', icon: CreditCard },
    { id: 'references', label: 'Referencias', icon: Users, count: references.length },
    { id: 'contract', label: 'Contrato', icon: Shield },
    { id: 'properties', label: 'Propiedades', icon: Home, count: properties.length },
    { id: 'history', label: 'Historial de Pagos', icon: Clock, count: payments.length }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientTypeLabel = (type: string) => {
    const labels = {
      'owner': 'Propietario',
      'renter': 'Arrendatario',
      'buyer': 'Comprador',
      'seller': 'Vendedor'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      'cedula_frente': 'Cédula (Frente)',
      'cedula_reverso': 'Cédula (Reverso)',
      'certificado_laboral': 'Certificado Laboral',
      'certificado_ingresos': 'Certificado de Ingresos',
      'referencias_bancarias': 'Referencias Bancarias',
      'contrato_firmado': 'Contrato Firmado',
      'recibo_pago': 'Recibo de Pago',
      'garantia': 'Documentos del Fiador',
      'comprobante_pago': 'Comprobante de Pago',
      'otro': 'Otro Documento',
      'otros': 'Otros Documentos'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const calculateMonthlyTotal = () => {
    if (!paymentConfig?.payment_concepts) return 0;
    
    const concepts = paymentConfig.payment_concepts;
    let total = 0;
    
    if (concepts.arriendo?.enabled) total += concepts.arriendo.amount || 0;
    if (concepts.administracion?.enabled) total += concepts.administracion.amount || 0;
    if (concepts.servicios_publicos?.enabled) total += concepts.servicios_publicos.amount || 0;
    if (concepts.otros?.enabled) total += concepts.otros.amount || 0;
    
    return total;
  };

  // Función para subir comprobante
  const handleUploadReceipt = async (paymentId: string, file: File) => {
    setUploadingReceipt(paymentId);
    try {
      // 1. Subir archivo a Supabase Storage
      const fileName = `payment-receipts/${paymentId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // 2. Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
        
      // 3. Actualizar registro de pago
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          receipt_url: urlData.publicUrl,
          receipt_file_name: file.name,
          paid_date: new Date().toISOString(),
          status: 'paid'
        })
        .eq('id', paymentId);
        
      if (updateError) throw updateError;
      
      // 4. Recargar pagos
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('client_id', client!.id)
        .order('due_date', { ascending: false });
      
      if (paymentsData) {
        setPayments(paymentsData);
      }
      
      alert('✅ Comprobante subido exitosamente');
    } catch (error) {
      console.error('❌ Error subiendo comprobante:', error);
      alert('❌ Error subiendo comprobante');
    } finally {
      setUploadingReceipt(null);
    }
  };

  const handleViewReceipt = (receiptUrl: string) => {
    setSelectedReceipt(receiptUrl);
    setShowReceiptModal(true);
  };

  const handleDelete = async () => {
    if (!client || !onDelete) return;
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar al cliente ${client.full_name}?\n\n⚠️ Esta acción eliminará PERMANENTEMENTE:\n- Todos los documentos\n- Todas las credenciales del portal\n- Todos los pagos y contratos\n- Todas las propiedades asignadas\n- Todas las comunicaciones\n\nEsta acción NO se puede deshacer.`)) {
      try {
        await onDelete(client.id);
        onClose(); // Cerrar el modal después de eliminar
      } catch (error) {
        console.error('Error eliminando cliente:', error);
        alert('❌ Error al eliminar el cliente');
      }
    }
  };

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
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{client.full_name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-600">{client.document_number}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {getClientTypeLabel(client.client_type)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Editar Cliente
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Eliminar Cliente
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
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
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Tab: Información Básica */}
                {activeTab === 'basic' && (
                  <BasicInfoTab client={client} />
                )}

                {/* Tab: Información Financiera */}
                {activeTab === 'financial' && (
                  <FinancialInfoTab client={client} />
                )}

                {/* Tab: Documentos */}
                {activeTab === 'documents' && (
                  <DocumentsTab 
                    documents={documents} 
                    getDocumentTypeLabel={getDocumentTypeLabel}
                    formatFileSize={formatFileSize}
                  />
                )}

                {/* Tab: Credenciales */}
                {activeTab === 'credentials' && (
                  <CredentialsTab credentials={credentials} />
                )}

                {/* Tab: Configuración de Pagos */}
                {activeTab === 'payments' && (
                  <PaymentsTab 
                    paymentConfig={paymentConfig}
                    calculateMonthlyTotal={calculateMonthlyTotal}
                  />
                )}

                {/* Tab: Referencias */}
                {activeTab === 'references' && (
                  <ReferencesTab references={references} />
                )}

                {/* Tab: Contrato */}
                {activeTab === 'contract' && (
                  <ContractTab contractInfo={contractInfo} />
                )}

                {/* Tab: Propiedades */}
                {activeTab === 'properties' && (
                  <PropertiesTab properties={properties} />
                )}

                {/* Tab: Historial de Pagos */}
                {activeTab === 'history' && (
                  <PaymentsHistoryTab 
                    payments={payments}
                    onUploadReceipt={handleUploadReceipt}
                    onViewReceipt={handleViewReceipt}
                    uploadingReceipt={uploadingReceipt}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal para Ver Comprobante */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowReceiptModal(false)}>
          <div className="relative max-w-4xl w-full bg-white rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            {selectedReceipt.endsWith('.pdf') ? (
              <iframe 
                src={selectedReceipt} 
                className="w-full h-[80vh] rounded-lg"
                title="Comprobante de Pago"
              />
            ) : (
              <img 
                src={selectedReceipt} 
                alt="Comprobante" 
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================
// TAB COMPONENTS
// =====================================================

const BasicInfoTab: React.FC<{ client: ClientWithDetails }> = ({ client }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoCard title="Datos Personales" icon={User}>
        <InfoRow icon={Mail} label="Email" value={client.email || 'No registrado'} />
        <InfoRow icon={Phone} label="Teléfono" value={client.phone} />
        <InfoRow icon={MapPin} label="Dirección" value={client.address || 'No registrada'} />
        <InfoRow icon={Building2} label="Ciudad" value={client.city || 'No registrada'} />
      </InfoCard>

      <InfoCard title="Contacto de Emergencia" icon={AlertTriangle}>
        <InfoRow label="Nombre" value={client.emergency_contact_name || 'No registrado'} />
        <InfoRow icon={Phone} label="Teléfono" value={client.emergency_contact_phone || 'No registrado'} />
      </InfoCard>
    </div>

    <InfoCard title="Fechas" icon={Calendar}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoRow label="Cliente desde" value={new Date(client.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} />
        <InfoRow label="Última actualización" value={new Date(client.updated_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} />
      </div>
    </InfoCard>

    {client.notes && (
      <InfoCard title="Notas" icon={FileText}>
        <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
      </InfoCard>
    )}
  </div>
);

const FinancialInfoTab: React.FC<{ client: ClientWithDetails }> = ({ client }) => (
  <div className="space-y-6">
    <InfoCard title="Información Laboral" icon={Briefcase}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoRow label="Ocupación" value={client.occupation || 'No registrada'} />
        <InfoRow label="Empresa" value={client.company_name || 'No registrada'} />
      </div>
      <InfoRow 
        icon={DollarSign} 
        label="Ingresos Mensuales" 
        value={client.monthly_income ? `$${client.monthly_income.toLocaleString('es-CO')}` : 'No registrado'} 
      />
    </InfoCard>
  </div>
);

const DocumentsTab: React.FC<{ 
  documents: ClientDocument[];
  getDocumentTypeLabel: (type: string) => string;
  formatFileSize: (bytes: number) => string;
}> = ({ documents, getDocumentTypeLabel, formatFileSize }) => {
  
  const handleDownload = async (doc: ClientDocument) => {
    try {
      if (!doc.storage_path) {
        alert('No se encontró la ruta del archivo');
        return;
      }

      // Bucket 'clients' es privado, necesitamos URL firmada temporal
      const { data, error } = await supabase.storage
        .from('clients')
        .createSignedUrl(doc.storage_path, 60); // URL válida por 60 segundos
      
      if (error) {
        console.error('❌ Error creando URL firmada:', error);
        throw error;
      }

      // Descargar usando la URL firmada
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = doc.document_name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('❌ Error descargando documento:', error);
      alert('Error al descargar el documento. Verifica que el archivo existe en Storage.');
    }
  };

  const handleView = async (doc: ClientDocument) => {
    try {
      if (!doc.storage_path) {
        alert('No se encontró la ruta del archivo');
        return;
      }

      // Bucket 'clients' es privado, necesitamos URL firmada temporal
      const { data, error } = await supabase.storage
        .from('clients')
        .createSignedUrl(doc.storage_path, 300); // URL válida por 5 minutos
      
      if (error) {
        console.error('❌ Error creando URL firmada:', error);
        throw error;
      }

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('❌ Error abriendo documento:', error);
      alert('Error al abrir el documento. Verifica que el archivo exists en Storage.');
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No hay documentos subidos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div 
          key={doc.id} 
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{getDocumentTypeLabel(doc.document_type)}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-600">{doc.document_name}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-600">{formatFileSize(doc.file_size || 0)}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-600">
                  {new Date(doc.created_at).toLocaleDateString('es-ES')}
                </span>
                {doc.status === 'verified' && (
                  <>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Verificado
                    </span>
                  </>
                )}
                {doc.is_required && (
                  <>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="flex items-center gap-1 text-sm text-orange-600">
                      <AlertTriangle className="w-4 h-4" />
                      Requerido
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleView(doc)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver documento"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDownload(doc)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Descargar documento"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const CredentialsTab: React.FC<{ credentials: PortalCredentials | null }> = ({ credentials }) => {
  if (!credentials) {
    return (
      <div className="text-center py-12">
        <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No se han configurado credenciales para el portal</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InfoCard title="Acceso al Portal" icon={Key}>
        <InfoRow icon={Mail} label="Email" value={credentials.email} />
        <InfoRow 
          icon={credentials.portal_access_enabled ? CheckCircle : XCircle} 
          label="Acceso Habilitado" 
          value={credentials.portal_access_enabled ? 'Sí' : 'No'}
          valueClassName={credentials.portal_access_enabled ? 'text-green-600' : 'text-red-600'}
        />
        <InfoRow 
          label="Cambio de Contraseña Requerido" 
          value={credentials.must_change_password ? 'Sí' : 'No'}
          valueClassName={credentials.must_change_password ? 'text-yellow-600' : 'text-gray-900'}
        />
      </InfoCard>

      <InfoCard title="Actividad" icon={Clock}>
        <InfoRow 
          label="Último Inicio de Sesión" 
          value={credentials.last_login 
            ? new Date(credentials.last_login).toLocaleString('es-ES') 
            : 'Nunca'
          }
        />
        <InfoRow 
          icon={credentials.welcome_email_sent ? CheckCircle : XCircle} 
          label="Email de Bienvenida Enviado" 
          value={credentials.welcome_email_sent ? 'Sí' : 'No'}
          valueClassName={credentials.welcome_email_sent ? 'text-green-600' : 'text-gray-600'}
        />
      </InfoCard>
    </div>
  );
};

const PaymentsTab: React.FC<{ 
  paymentConfig: PaymentConfig | null;
  calculateMonthlyTotal: () => number;
}> = ({ paymentConfig, calculateMonthlyTotal }) => {
  if (!paymentConfig) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No se ha configurado información de pagos</p>
      </div>
    );
  }

  const concepts = paymentConfig.payment_concepts;
  const total = calculateMonthlyTotal();

  return (
    <div className="space-y-6">
      <InfoCard title="Configuración de Pagos" icon={CreditCard}>
        <InfoRow 
          label="Método de Pago Preferido" 
          value={paymentConfig.preferred_payment_method || 'No especificado'} 
        />
        <InfoRow 
          icon={Calendar} 
          label="Día de Facturación" 
          value={paymentConfig.billing_day ? `Día ${paymentConfig.billing_day}` : 'No especificado'} 
        />
      </InfoCard>

      <InfoCard title="Conceptos de Pago" icon={DollarSign}>
        <div className="space-y-4">
          {concepts.arriendo?.enabled && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-900">Arriendo</span>
              <span className="font-bold text-blue-600">${concepts.arriendo.amount.toLocaleString('es-CO')}</span>
            </div>
          )}
          
          {concepts.administracion?.enabled && (
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="font-medium text-purple-900">Administración</span>
              <span className="font-bold text-purple-600">${concepts.administracion.amount.toLocaleString('es-CO')}</span>
            </div>
          )}
          
          {concepts.servicios_publicos?.enabled && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-green-900">Servicios Públicos</span>
                <span className="font-bold text-green-600">${concepts.servicios_publicos.amount.toLocaleString('es-CO')}</span>
              </div>
              {concepts.servicios_publicos.types && concepts.servicios_publicos.types.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {concepts.servicios_publicos.types.map((type) => (
                    <span key={type} className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded-full">
                      {type}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {concepts.otros?.enabled && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Otros</span>
                <span className="font-bold text-gray-600">${concepts.otros.amount.toLocaleString('es-CO')}</span>
              </div>
              {concepts.otros.description && (
                <p className="text-sm text-gray-600">{concepts.otros.description}</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
            <span className="font-bold text-white text-lg">Total Mensual</span>
            <span className="font-bold text-white text-2xl">${total.toLocaleString('es-CO')}</span>
          </div>
        </div>
      </InfoCard>
    </div>
  );
};

const ReferencesTab: React.FC<{ references: ClientReference[] }> = ({ references }) => {
  if (references.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No hay referencias registradas</p>
      </div>
    );
  }

  const personalRefs = references.filter(r => r.reference_type === 'personal');
  const commercialRefs = references.filter(r => r.reference_type === 'commercial');

  return (
    <div className="space-y-6">
      {personalRefs.length > 0 && (
        <InfoCard title={`Referencias Personales (${personalRefs.length})`} icon={User}>
          <div className="space-y-4">
            {personalRefs.map((ref) => (
              <div key={ref.id} className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">{ref.name}</h4>
                <div className="mt-2 space-y-1">
                  <InfoRow icon={Phone} label="Teléfono" value={ref.phone} />
                  {ref.relationship && (
                    <InfoRow label="Relación" value={ref.relationship} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {commercialRefs.length > 0 && (
        <InfoCard title={`Referencias Comerciales (${commercialRefs.length})`} icon={Briefcase}>
          <div className="space-y-4">
            {commercialRefs.map((ref) => (
              <div key={ref.id} className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900">{ref.name}</h4>
                <div className="mt-2 space-y-1">
                  {ref.company_name && (
                    <InfoRow icon={Building2} label="Empresa" value={ref.company_name} />
                  )}
                  <InfoRow icon={Phone} label="Teléfono" value={ref.phone} />
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      )}
    </div>
  );
};

const ContractTab: React.FC<{ contractInfo: ContractInfo | null }> = ({ contractInfo }) => {
  if (!contractInfo) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No hay información del contrato</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InfoCard title="Fechas del Contrato" icon={Calendar}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow 
            label="Fecha de Inicio" 
            value={contractInfo.contract_start_date 
              ? new Date(contractInfo.contract_start_date).toLocaleDateString('es-ES')
              : 'No especificada'
            }
          />
          <InfoRow 
            label="Fecha de Fin" 
            value={contractInfo.contract_end_date 
              ? new Date(contractInfo.contract_end_date).toLocaleDateString('es-ES')
              : 'No especificada'
            }
          />
        </div>
      </InfoCard>

      <InfoCard title="Depósito" icon={DollarSign}>
        <InfoRow 
          label="Monto del Depósito" 
          value={contractInfo.deposit_amount 
            ? `$${contractInfo.deposit_amount.toLocaleString('es-CO')}`
            : 'No especificado'
          }
        />
        <InfoRow 
          icon={contractInfo.deposit_paid ? CheckCircle : XCircle}
          label="Estado del Depósito" 
          value={contractInfo.deposit_paid ? 'Pagado' : 'Pendiente'}
          valueClassName={contractInfo.deposit_paid ? 'text-green-600' : 'text-yellow-600'}
        />
      </InfoCard>

      {contractInfo.has_guarantor && (
        <InfoCard title="Fiador" icon={User}>
          <InfoRow label="Nombre" value={contractInfo.guarantor_name || 'No especificado'} />
          <InfoRow label="Documento" value={contractInfo.guarantor_document || 'No especificado'} />
          <InfoRow icon={Phone} label="Teléfono" value={contractInfo.guarantor_phone || 'No especificado'} />
        </InfoCard>
      )}

      <InfoCard title="Estado del Contrato" icon={Shield}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow 
            icon={contractInfo.keys_delivered ? CheckCircle : XCircle}
            label="Llaves Entregadas" 
            value={contractInfo.keys_delivered ? 'Sí' : 'No'}
            valueClassName={contractInfo.keys_delivered ? 'text-green-600' : 'text-gray-600'}
          />
          <InfoRow 
            icon={contractInfo.signatures_complete ? CheckCircle : XCircle}
            label="Firmas Completas" 
            value={contractInfo.signatures_complete ? 'Sí' : 'No'}
            valueClassName={contractInfo.signatures_complete ? 'text-green-600' : 'text-gray-600'}
          />
        </div>
      </InfoCard>
    </div>
  );
};

const PropertiesTab: React.FC<{ properties: ClientProperty[] }> = ({ properties }) => {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No hay propiedades asignadas</p>
        <p className="text-sm text-gray-500 mt-2">
          Las propiedades asignadas al cliente aparecerán aquí
        </p>
      </div>
    );
  }

  const getRelationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'owner': 'Propietario',
      'tenant': 'Arrendatario',
      'interested': 'Interesado',
      'pending_contract': 'Contrato Pendiente'
    };
    return labels[type] || type;
  };

  const getRelationTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'owner': 'bg-purple-100 text-purple-800',
      'tenant': 'bg-blue-100 text-blue-800',
      'interested': 'bg-yellow-100 text-yellow-800',
      'pending_contract': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'text-green-600',
      'pending': 'text-yellow-600',
      'completed': 'text-gray-600',
      'cancelled': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <div className="space-y-4">
      {properties.map((prop) => (
        <div 
          key={prop.id} 
          className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {/* Imagen de la propiedad */}
          <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
            {prop.property.cover_image ? (
              <img 
                src={prop.property.cover_image} 
                alt={prop.property.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Información de la propiedad */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{prop.property.title || 'Sin título'}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">{prop.property.code}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRelationTypeColor(prop.relation_type)}`}>
                    {getRelationTypeLabel(prop.relation_type)}
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className={`text-sm font-medium ${getStatusColor(prop.status)}`}>
                    {prop.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                {prop.property.type || 'Sin tipo'}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                {prop.property.location || 'Sin ubicación'}
              </div>
              {prop.property.bedrooms && (
                <div className="flex items-center gap-2 text-gray-600">
                  🛏️ {prop.property.bedrooms} habitaciones
                </div>
              )}
              {prop.property.bathrooms && (
                <div className="flex items-center gap-2 text-gray-600">
                  🚿 {prop.property.bathrooms} baños
                </div>
              )}
              {prop.property.area && (
                <div className="flex items-center gap-2 text-gray-600">
                  📏 {prop.property.area} m²
                </div>
              )}
              {prop.property.price && (
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <DollarSign className="w-4 h-4" />
                  ${prop.property.price.toLocaleString()}
                </div>
              )}
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Asignada el {new Date(prop.created_at).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PaymentsHistoryTab: React.FC<{ 
  payments: Payment[];
  onUploadReceipt: (paymentId: string, file: File) => void;
  onViewReceipt: (receiptUrl: string) => void;
  uploadingReceipt: string | null;
}> = ({ payments, onUploadReceipt, onViewReceipt, uploadingReceipt }) => {
  
  const fileInputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({});

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No hay pagos registrados</p>
        <p className="text-sm text-gray-500 mt-2">
          El historial de pagos del cliente aparecerá aquí
        </p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'overdue': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'paid': 'Pagado',
      'pending': 'Pendiente',
      'overdue': 'Vencido',
      'partial': 'Parcial',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'overdue': 'bg-red-100 text-red-800',
      'partial': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'rent': 'Arriendo',
      'deposit': 'Depósito',
      'administration': 'Administración',
      'utilities': 'Servicios Públicos',
      'late_fee': 'Mora',
      'other': 'Otro'
    };
    return labels[type] || type;
  };

  const handleFileSelect = (paymentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño (máximo 20MB)
      if (file.size > 20 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 20MB.');
        return;
      }
      
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Formato no válido. Solo se permiten imágenes (JPG, PNG, WEBP) o PDF.');
        return;
      }
      
      onUploadReceipt(paymentId, file);
    }
  };

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div 
          key={payment.id} 
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {getStatusIcon(payment.status)}
              <div>
                <h4 className="font-semibold text-gray-900">
                  {getPaymentTypeLabel(payment.payment_type)}
                </h4>
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${getStatusColor(payment.status)}`}>
                  {getStatusLabel(payment.status)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ${payment.amount.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Vencimiento: {new Date(payment.due_date).toLocaleDateString('es-ES')}</span>
            </div>
            {payment.paid_date && (
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-4 h-4" />
                <span>Pagado: {new Date(payment.paid_date).toLocaleDateString('es-ES')}</span>
              </div>
            )}
            {payment.payment_method && (
              <div className="flex items-center gap-2 text-gray-600">
                <CreditCard className="w-4 h-4" />
                <span>{payment.payment_method}</span>
              </div>
            )}
          </div>

          {payment.notes && (
            <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
              📝 {payment.notes}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
            {payment.receipt_url ? (
              <>
                <button
                  onClick={() => onViewReceipt(payment.receipt_url!)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Ver Comprobante
                </button>
                <a
                  href={payment.receipt_url}
                  download={payment.receipt_file_name || 'comprobante.pdf'}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </a>
              </>
            ) : (
              <>
                <input
                  ref={(el) => fileInputRefs.current[payment.id] = el}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileSelect(payment.id, e)}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRefs.current[payment.id]?.click()}
                  disabled={uploadingReceipt === payment.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadingReceipt === payment.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Subir Comprobante
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// =====================================================
// UTILITY COMPONENTS
// =====================================================

const InfoCard: React.FC<{ 
  title: string; 
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-blue-600" />
      {title}
    </h3>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

const InfoRow: React.FC<{ 
  icon?: React.ElementType;
  label: string; 
  value: string | number;
  valueClassName?: string;
}> = ({ icon: Icon, label, value, valueClassName = 'text-gray-900' }) => (
  <div className="flex items-center gap-3">
    {Icon && <Icon className="w-4 h-4 text-gray-400" />}
    <span className="text-gray-600 min-w-[150px]">{label}:</span>
    <span className={`font-medium ${valueClassName}`}>{value}</span>
  </div>
);
