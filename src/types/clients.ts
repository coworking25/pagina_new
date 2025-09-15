// =====================================================
// INTERFACES PARA EL SISTEMA DE CLIENTES
// =====================================================

// =====================================================
// TIPOS BÁSICOS Y ENUMS
// =====================================================

export type ClientType = 'buyer' | 'seller' | 'renter' | 'owner' | 'tenant' | 'landlord';
export type ClientStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'blocked';
export type ContractType = 'rental' | 'sale' | 'management';
export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated' | 'pending_renewal';
export type PaymentType = 'rent' | 'deposit' | 'administration' | 'utilities' | 'late_fee' | 'other';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'partial' | 'cancelled';
export type CommunicationType = 'call' | 'email' | 'whatsapp' | 'meeting' | 'visit' | 'sms' | 'other';
export type CommunicationStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_answer';
export type DocumentStatus = 'active' | 'expired' | 'replaced' | 'invalid';
export type AlertType = 'payment_due' | 'payment_overdue' | 'contract_expiring' | 'contract_expired' | 'document_missing' | 'document_expiring' | 'follow_up' | 'maintenance' | 'renewal_required' | 'other';
export type AlertPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AlertStatus = 'active' | 'resolved' | 'dismissed' | 'snoozed';
export type DocumentType = 'cedula' | 'pasaporte' | 'nit';
export type RenewalType = 'automatic' | 'manual' | 'none';

// =====================================================
// INTERFACE PRINCIPAL: CLIENT
// =====================================================
export interface Client {
  id: string;
  
  // Información Personal
  full_name: string;
  document_type: DocumentType;
  document_number: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // Información Demográfica Adicional
  birth_date?: string;
  gender?: string;
  marital_status?: string;
  preferred_contact_method?: string;
  
  // Tipo y Estado
  client_type: ClientType;
  status: ClientStatus;
  
  // Información Financiera
  monthly_income?: number;
  occupation?: string;
  company_name?: string;
  budget_range?: string;
  
  // Información de Marketing y Seguimiento
  referral_source?: string;
  property_requirements?: string;
  
  // Asignación y Metadatos
  assigned_advisor_id?: string;
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFACE: CONTRACT
// =====================================================
export interface Contract {
  id: string;
  
  // Referencias
  client_id: string;
  property_id?: string;
  landlord_id?: string;
  
  // Información del Contrato
  contract_type: ContractType;
  contract_number?: string;
  status: ContractStatus;
  
  // Fechas
  start_date: string;
  end_date?: string;
  signature_date?: string;
  
  // Información Financiera
  monthly_rent?: number;
  deposit_amount?: number;
  administration_fee?: number;
  sale_price?: number;
  
  // Términos del Contrato
  contract_duration_months?: number;
  renewal_type: RenewalType;
  payment_day: number;
  late_fee_percentage: number;
  
  // Metadatos
  notes?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFACE: PAYMENT
// =====================================================
export interface Payment {
  id: string;
  
  // Referencias
  contract_id: string;
  client_id: string;
  
  // Información del Pago
  payment_type: PaymentType;
  amount: number;
  amount_paid: number;
  status: PaymentStatus;
  
  // Fechas
  due_date: string;
  payment_date?: string;
  period_start?: string;
  period_end?: string;
  
  // Detalles del Pago
  payment_method?: string;
  transaction_reference?: string;
  late_fee_applied: number;
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFACE: CLIENT_COMMUNICATION
// =====================================================
export interface ClientCommunication {
  id: string;
  
  // Referencias
  client_id: string;
  advisor_id?: string;
  
  // Información de la Comunicación
  communication_type: CommunicationType;
  subject?: string;
  description?: string;
  outcome?: string;
  
  // Estado y Seguimiento
  status: CommunicationStatus;
  follow_up_required: boolean;
  follow_up_date?: string;
  
  // Timestamps
  communication_date: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFACE: CLIENT_DOCUMENT
// =====================================================
export interface ClientDocument {
  id: string;
  
  // Referencias
  client_id: string;
  contract_id?: string;
  
  // Información del Documento
  document_type: string;
  document_name: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  
  // Estado y Validez
  status: DocumentStatus;
  expiration_date?: string;
  is_required: boolean;
  
  // Metadatos
  uploaded_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFACE: CLIENT_ALERT
// =====================================================
export interface ClientAlert {
  id: string;
  
  // Referencias
  client_id: string;
  contract_id?: string;
  payment_id?: string;
  
  // Información de la Alerta
  alert_type: AlertType;
  title: string;
  message?: string;
  description?: string;
  priority: AlertPriority;
  
  // Estado y Fechas
  status: AlertStatus;
  due_date?: string;
  resolved_date?: string;
  resolved_by?: string;
  
  // Configuración de Notificaciones
  auto_generated: boolean;
  notification_sent: boolean;
  notification_date?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// =====================================================
// INTERFACES EXTENDIDAS CON RELACIONES
// =====================================================

// Cliente con información completa
export interface ClientWithDetails extends Client {
  // Relaciones calculadas
  total_contracts?: number;
  active_contracts?: number;
  pending_payments?: number;
  overdue_payments?: number;
  active_alerts?: number;
  
  // Información del asesor
  advisor_name?: string;
  
  // Contratos relacionados
  contracts?: Contract[];
  
  // Pagos relacionados
  payments?: Payment[];
  
  // Comunicaciones relacionadas
  communications?: ClientCommunication[];
  
  // Documentos relacionados
  documents?: ClientDocument[];
  
  // Alertas relacionadas
  alerts?: ClientAlert[];
}

// Contrato con información del cliente
export interface ContractWithClient extends Contract {
  client?: Client;
  landlord?: Client;
  
  // Pagos del contrato
  payments?: Payment[];
  
  // Información calculada
  total_payments?: number;
  pending_amount?: number;
  next_payment_date?: string;
  days_until_expiry?: number;
}

// Pago con información completa
export interface PaymentWithDetails extends Payment {
  client?: Client;
  contract?: Contract;
  
  // Información calculada
  days_overdue?: number;
  is_overdue?: boolean;
  remaining_amount?: number;
}

// Comunicación con información del cliente y asesor
export interface CommunicationWithDetails extends ClientCommunication {
  client?: Client;
  advisor_name?: string;
}

// Alerta con información completa
export interface AlertWithDetails extends ClientAlert {
  client?: Client;
  contract?: Contract;
  payment?: Payment;
  
  // Información calculada
  days_until_due?: number;
  is_urgent?: boolean;
}

// =====================================================
// INTERFACES PARA FORMULARIOS
// =====================================================

// Formulario para crear/editar cliente
export interface ClientFormData {
  full_name: string;
  document_type: DocumentType;
  document_number: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  client_type: ClientType;
  status: ClientStatus;
  monthly_income?: number;
  occupation?: string;
  company_name?: string;
  assigned_advisor_id?: string;
  notes?: string;
  // Campos adicionales
  birth_date?: string;
  gender?: string;
  marital_status?: string;
  preferred_contact_method?: string;
  budget_range?: string;
  referral_source?: string;
  property_requirements?: string;
}

// Formulario para crear/editar contrato
export interface ContractFormData {
  client_id: string;
  property_id?: string;
  landlord_id?: string;
  contract_type: ContractType;
  contract_number?: string;
  status: ContractStatus;
  start_date: string;
  end_date?: string;
  signature_date?: string;
  monthly_rent?: number;
  deposit_amount?: number;
  administration_fee?: number;
  sale_price?: number;
  contract_duration_months?: number;
  renewal_type: RenewalType;
  payment_day: number;
  late_fee_percentage: number;
  notes?: string;
}

// Formulario para crear/editar pago
export interface PaymentFormData {
  contract_id: string;
  client_id: string;
  payment_type: PaymentType;
  amount: number;
  amount_paid?: number;
  status: PaymentStatus;
  due_date: string;
  payment_date?: string;
  period_start?: string;
  period_end?: string;
  payment_method?: string;
  transaction_reference?: string;
  late_fee_applied?: number;
  notes?: string;
}

// Formulario para crear/editar comunicación
export interface CommunicationFormData {
  client_id: string;
  advisor_id?: string;
  communication_type: CommunicationType;
  subject?: string;
  description?: string;
  outcome?: string;
  status: CommunicationStatus;
  follow_up_required: boolean;
  follow_up_date?: string;
  communication_date: string;
}

// =====================================================
// INTERFACES PARA FILTROS Y BÚSQUEDA
// =====================================================

export interface ClientFilters {
  client_type?: ClientType;
  status?: ClientStatus;
  assigned_advisor_id?: string;
  city?: string;
  search?: string; // Búsqueda por nombre, documento, email, teléfono
  date_from?: string;
  date_to?: string;
}

export interface ContractFilters {
  contract_type?: ContractType;
  status?: ContractStatus;
  client_id?: string;
  property_id?: string;
  expiring_soon?: boolean; // Contratos que vencen en los próximos 60 días
}

export interface PaymentFilters {
  status?: PaymentStatus;
  payment_type?: PaymentType;
  client_id?: string;
  contract_id?: string;
  overdue_only?: boolean;
  due_date_from?: string;
  due_date_to?: string;
}

export interface AlertFilters {
  alert_type?: AlertType;
  priority?: AlertPriority;
  status?: AlertStatus;
  client_id?: string;
  assigned_advisor_id?: string;
}

// =====================================================
// INTERFACES PARA DASHBOARD Y ESTADÍSTICAS
// =====================================================

export interface ClientStats {
  total_clients: number;
  active_clients: number;
  tenants: number;
  landlords: number;
  buyers: number;
  sellers: number;
  new_this_month: number;
  pending_clients: number;
}

export interface ContractStats {
  total_contracts: number;
  active_contracts: number;
  expiring_soon: number; // Próximos 60 días
  expired_contracts: number;
  total_monthly_income: number;
}

export interface PaymentStats {
  total_payments_due: number;
  overdue_payments: number;
  collected_this_month: number;
  pending_amount: number;
  overdue_amount: number;
}

export interface AlertStats {
  total_active_alerts: number;
  high_priority_alerts: number;
  payment_alerts: number;
  contract_alerts: number;
  document_alerts: number;
}

export interface DashboardStats {
  clients: ClientStats;
  contracts: ContractStats;
  payments: PaymentStats;
  alerts: AlertStats;
}

// =====================================================
// INTERFACES PARA RESPUESTAS DE API
// =====================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// =====================================================
// TIPOS PARA UTILIDADES
// =====================================================

export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  direction: SortDirection;
}

export interface PaginationOptions {
  page: number;
  per_page: number;
  sort?: SortOptions;
}

// =====================================================
// CONFIGURACIÓN DE COLORES PARA UI
// =====================================================

export const CLIENT_TYPE_COLORS = {
  tenant: 'blue',
  landlord: 'green',
  buyer: 'orange',
  seller: 'purple'
} as const;

export const CLIENT_STATUS_COLORS = {
  active: 'green',
  inactive: 'gray',
  pending: 'yellow',
  blocked: 'red'
} as const;

export const PAYMENT_STATUS_COLORS = {
  paid: 'green',
  pending: 'yellow',
  overdue: 'red',
  partial: 'orange',
  cancelled: 'gray'
} as const;

export const ALERT_PRIORITY_COLORS = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  urgent: 'red'
} as const;

// =====================================================
// CONFIGURACIÓN DE ICONOS
// =====================================================

export const CLIENT_TYPE_ICONS = {
  tenant: 'Home',
  landlord: 'Building',
  buyer: 'ShoppingCart',
  seller: 'DollarSign'
} as const;

export const COMMUNICATION_TYPE_ICONS = {
  call: 'Phone',
  email: 'Mail',
  whatsapp: 'MessageCircle',
  meeting: 'Users',
  visit: 'MapPin',
  sms: 'Smartphone',
  other: 'MessageSquare'
} as const;

export const ALERT_TYPE_ICONS = {
  payment_due: 'Clock',
  payment_overdue: 'AlertTriangle',
  contract_expiring: 'Calendar',
  contract_expired: 'XCircle',
  document_missing: 'FileX',
  document_expiring: 'FileWarning',
  follow_up: 'Phone',
  maintenance: 'Tool',
  renewal_required: 'RefreshCw',
  other: 'Info'
} as const;
