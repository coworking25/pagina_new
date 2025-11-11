// ============================================
// TIPOS E INTERFACES PARA EL PORTAL DE CLIENTES
// ============================================

// Credenciales de Cliente
export interface ClientCredentials {
  id: string;
  client_id: string;
  email: string;
  is_active: boolean;
  must_change_password: boolean;
  last_login: string | null;
  last_password_change: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
}

// Sesión de Cliente
export interface ClientSession {
  client_id: string;
  email: string;
  full_name: string;
  must_change_password: boolean;
  token: string;
  expires_at: string;
}

// Login Request
export interface ClientLoginRequest {
  email: string;
  password: string;
}

// Login Response
export interface ClientLoginResponse {
  success: boolean;
  session?: ClientSession;
  error?: string;
  must_change_password?: boolean;
}

// Cambio de Contraseña
export interface ChangePasswordRequest {
  client_id: string;
  old_password: string;
  new_password: string;
}

// Reset de Contraseña
export interface ResetPasswordRequest {
  email: string;
}

// Perfil de Cliente (vista portal)
export interface ClientProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  document_type: string;
  document_number: string;
  address: string;
  city: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  occupation: string;
  company_name: string;
  created_at: string;
}

// Contrato (vista cliente)
export interface ClientContract {
  id: string;
  contract_number: string;
  contract_type: 'rental' | 'sale' | 'management';
  status: 'active' | 'expired' | 'terminated';
  start_date: string;
  end_date: string;
  signature_date: string;
  monthly_rent: number;
  deposit_amount: number;
  administration_fee: number;
  payment_day: number;
  property?: {
    id: number;
    title: string;
    code: string;
    address: string;
    city: string;
    images: string[];
    bedrooms: number;
    bathrooms: number;
    area: number;
  };
  landlord?: {
    full_name: string;
    phone: string;
    email: string;
  };
  notes: string;
}

// Propiedad (vista cliente)
export interface ClientProperty {
  id: string;
  client_id: string;
  property_id: number;
  relation_type: 'owner' | 'tenant' | 'interested' | 'pending_contract';
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
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
}

// Pago (vista cliente)
export interface ClientPayment {
  id: string;
  contract_id: string;
  payment_type: 'rent' | 'deposit' | 'administration' | 'utilities' | 'late_fee';
  amount: number;
  amount_paid: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  payment_method: string | null;
  transaction_reference: string | null;
  due_date: string;
  payment_date: string | null;
  period_start: string | null;
  period_end: string | null;
  late_fee_applied: number;
  recipient_type: string | null;
  payment_direction: 'incoming' | 'outgoing' | null;
  notes: string;
  // Campos adicionales para vista del propietario
  tenant_name?: string;
  contract_number?: string;
  property_title?: string;
  contract?: {
    contract_number: string;
    property_title: string;
  };
}

// Documento (vista cliente)
export interface ClientDocument {
  id: string;
  client_id: string;
  contract_id: string | null;
  document_type: string;
  document_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: string;
  expiration_date: string | null;
  is_required: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Alerta (vista cliente)
export interface ClientAlert {
  id: string;
  client_id: string;
  alert_type: string; // Flexible para aceptar cualquier valor de la BD
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  status: string;
  priority: string;
  read_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// Comunicación/Mensaje
export interface ClientCommunication {
  id: string;
  client_id: string;
  sender_type: 'admin' | 'client' | 'system';
  sender_id: string | null;
  subject: string;
  description: string; // Columna en BD
  communication_type: string;
  priority: 'low' | 'normal' | 'high';
  status: string;
  read_at: string | null;
  category: 'general' | 'payment' | 'contract' | 'maintenance' | 'document' | 'other';
  communication_date: string;
  created_at: string;
  updated_at: string;
}

// Extracto Mensual
export interface MonthlyExtract {
  contract_id: string;
  contract_number: string;
  property_title: string;
  client_name: string;
  month: number;
  year: number;
  
  // Pagos del mes
  rent_amount: number;
  rent_paid: number;
  rent_status: string;
  
  administration_amount: number;
  administration_paid: number;
  administration_status: string;
  
  utilities_amount: number;
  utilities_paid: number;
  utilities_status: string;
  
  late_fees: number;
  
  // Totales
  total_due: number;
  total_paid: number;
  total_pending: number;
  
  // Estado
  is_current: boolean;
  days_overdue: number;
}

// Resumen Anual
export interface AnnualSummary {
  contract_id: string;
  year: number;
  
  total_rent_year: number;
  total_administration_year: number;
  total_utilities_year: number;
  total_late_fees_year: number;
  total_due_year: number;
  
  total_paid_year: number;
  total_pending_year: number;
  
  months_paid: number;
  months_pending: number;
  months_with_late_fees: number;
  
  payment_compliance_percentage: number;
}

// Estado de Cuenta
export interface AccountStatus {
  client_id: string;
  client_name: string;
  
  active_contracts: number;
  total_pending_amount: number;
  total_overdue_amount: number;
  next_payment_date: string | null;
  next_payment_amount: number;
  
  is_up_to_date: boolean;
  has_overdue_payments: boolean;
  max_days_overdue: number;
}

// Dashboard Summary (resumen para cliente)
export interface ClientDashboardSummary {
  client_id: string;
  full_name: string;
  
  active_contracts_count: number;
  pending_payments_count: number;
  overdue_payments_count: number;
  
  next_payment_due_date: string | null;
  next_payment_amount: number;
  
  total_paid_this_month: number;
  total_paid_this_year: number;
  
  recent_payments: ClientPayment[];
  upcoming_payments: ClientPayment[];
}

// Filtros de Pagos
export interface PaymentFilters {
  status?: 'pending' | 'paid' | 'overdue' | 'partial';
  payment_type?: 'rent' | 'deposit' | 'administration' | 'utilities' | 'late_fee';
  date_from?: string;
  date_to?: string;
  contract_id?: string;
}

// Filtros de Documentos
export interface DocumentFilters {
  document_type?: string;
  contract_id?: string;
  status?: string;
}

// Datos para generar PDF de extracto
export interface ExtractPDFData {
  client: {
    full_name: string;
    document_number: string;
    email: string;
    phone: string;
  };
  contract: {
    contract_number: string;
    property_title: string;
    monthly_rent: number;
    start_date: string;
    end_date: string;
  };
  period: {
    month: number;
    year: number;
  };
  payments: {
    concept: string;
    due_date: string;
    amount: number;
    amount_paid: number;
    status: string;
    payment_date: string | null;
  }[];
  summary: {
    total_due: number;
    total_paid: number;
    total_pending: number;
    late_fees: number;
  };
}

// Response genérica de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
