// =====================================================
// FUNCIONES DE ANALYTICS EXPANDIDAS
// Reportes completos del sistema (clientes, citas, pagos, etc.)
// =====================================================

import { supabase } from './supabase';
import { getDashboardAnalytics } from './analytics';

// =====================================================
// REPORTES DE CLIENTES
// =====================================================

export interface ClientReport {
  totalClients: number;
  clientsByType: { type: string; count: number }[];
  clientsByStatus: { status: string; count: number }[];
  clientsByAdvisor: { advisor: string; count: number }[];
  newClientsThisMonth: number;
  activeContracts: number;
  clientsWithOverduePayments: number;
}

export const getClientReport = async (daysBack: number = 30): Promise<ClientReport> => {
  try {
    const { data, error } = await supabase
      .rpc('get_client_report', { days_back: daysBack });

    if (error) throw error;

    return data as ClientReport;
  } catch (error) {
    console.error('Error obteniendo reporte de clientes:', error);
    return {
      totalClients: 0,
      clientsByType: [],
      clientsByStatus: [],
      clientsByAdvisor: [],
      newClientsThisMonth: 0,
      activeContracts: 0,
      clientsWithOverduePayments: 0
    };
  }
};

// =====================================================
// REPORTES DE CITAS
// =====================================================

export interface AppointmentReport {
  totalAppointments: number;
  appointmentsByStatus: { status: string; count: number }[];
  appointmentsByType: { type: string; count: number }[];
  appointmentsByAdvisor: { advisor: string; count: number }[];
  conversionRate: number;
  averageRating: number;
  upcomingAppointments: number;
}

export const getAppointmentReport = async (daysBack: number = 30): Promise<AppointmentReport> => {
  try {
    const { data, error } = await supabase
      .rpc('get_appointment_report', { days_back: daysBack });

    if (error) throw error;

    return data as AppointmentReport;
  } catch (error) {
    console.error('Error obteniendo reporte de citas:', error);
    return {
      totalAppointments: 0,
      appointmentsByStatus: [],
      appointmentsByType: [],
      appointmentsByAdvisor: [],
      conversionRate: 0,
      averageRating: 0,
      upcomingAppointments: 0
    };
  }
};

// =====================================================
// REPORTES FINANCIEROS
// =====================================================

export interface FinancialReport {
  totalRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  paymentsByType: { type: string; amount: number; count: number }[];
  monthlyRevenue: { month: string; amount: number }[];
  averagePaymentAmount: number;
}

export const getFinancialReport = async (daysBack: number = 30): Promise<FinancialReport> => {
  try {
    const { data, error } = await supabase
      .rpc('get_financial_report', { days_back: daysBack });

    if (error) throw error;

    return data as FinancialReport;
  } catch (error) {
    console.error('Error obteniendo reporte financiero:', error);
    return {
      totalRevenue: 0,
      pendingPayments: 0,
      overduePayments: 0,
      paymentsByType: [],
      monthlyRevenue: [],
      averagePaymentAmount: 0
    };
  }
};

// =====================================================
// REPORTES DE CONTRATOS
// =====================================================

export interface ContractReport {
  totalContracts: number;
  activeContracts: number;
  contractsByType: { type: string; count: number }[];
  expiringContracts: number;
  averageContractValue: number;
  averageContractDuration: number;
}

export const getContractReport = async (): Promise<ContractReport> => {
  try {
    const { data, error } = await supabase
      .rpc('get_contract_report');

    if (error) throw error;

    return data as ContractReport;
  } catch (error) {
    console.error('Error obteniendo reporte de contratos:', error);
    return {
      totalContracts: 0,
      activeContracts: 0,
      contractsByType: [],
      expiringContracts: 0,
      averageContractValue: 0,
      averageContractDuration: 0
    };
  }
};

// =====================================================
// REPORTES DE COMUNICACIONES
// =====================================================

export interface CommunicationReport {
  totalCommunications: number;
  communicationsByType: { type: string; count: number }[];
  communicationsByAdvisor: { advisor: string; count: number }[];
  pendingFollowUps: number;
  responseRate: number;
}

export const getCommunicationReport = async (daysBack: number = 30): Promise<CommunicationReport> => {
  try {
    const { data, error } = await supabase
      .rpc('get_communication_report', { days_back: daysBack });

    if (error) throw error;

    return data as CommunicationReport;
  } catch (error) {
    console.error('Error obteniendo reporte de comunicaciones:', error);
    return {
      totalCommunications: 0,
      communicationsByType: [],
      communicationsByAdvisor: [],
      pendingFollowUps: 0,
      responseRate: 0
    };
  }
};

// =====================================================
// REPORTES DE DOCUMENTOS
// =====================================================

export interface DocumentsReport {
  totalDocuments: number;
  documentsByType: { type: string; count: number }[];
  documentsByStatus: { status: string; count: number }[];
  recentUploads: number;
  expiringDocuments: number;
}

export const getDocumentsReport = async (daysBack: number = 30): Promise<DocumentsReport> => {
  try {
    const { data, error } = await supabase
      .rpc('get_documents_report', { days_back: daysBack });

    if (error) throw error;

    return data as DocumentsReport;
  } catch (error) {
    console.error('Error obteniendo reporte de documentos:', error);
    return {
      totalDocuments: 0,
      documentsByType: [],
      documentsByStatus: [],
      recentUploads: 0,
      expiringDocuments: 0
    };
  }
};

// =====================================================
// REPORTES DE ALERTAS
// =====================================================

export interface AlertsReport {
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  alertsByType: { type: string; count: number }[];
  alertsByPriority: { priority: string; count: number }[];
  recentAlerts: number;
}

export const getAlertsReport = async (daysBack: number = 30): Promise<AlertsReport> => {
  try {
    const { data, error } = await supabase
      .rpc('get_alerts_report', { days_back: daysBack });

    if (error) throw error;

    return data as AlertsReport;
  } catch (error) {
    console.error('Error obteniendo reporte de alertas:', error);
    return {
      totalAlerts: 0,
      activeAlerts: 0,
      criticalAlerts: 0,
      alertsByType: [],
      alertsByPriority: [],
      recentAlerts: 0
    };
  }
};

// =====================================================
// REPORTES DE ASESORES
// =====================================================

export interface AdvisorsReport {
  totalAdvisors: number;
  activeAdvisors: number;
  totalClientsAssigned: number;
  averageClientsPerAdvisor: number;
  advisorsPerformance: {
    advisor: string;
    clients_count: number;
    contracts_closed: number;
    total_revenue: number;
  }[];
  advisorsBySpecialty: { specialty: string; count: number }[];
}

export const getAdvisorsReport = async (daysBack: number = 30): Promise<AdvisorsReport> => {
  try {
    const { data, error } = await supabase
      .rpc('get_advisors_report', { days_back: daysBack });

    if (error) throw error;

    return data as AdvisorsReport;
  } catch (error) {
    console.error('Error obteniendo reporte de asesores:', error);
    return {
      totalAdvisors: 0,
      activeAdvisors: 0,
      totalClientsAssigned: 0,
      averageClientsPerAdvisor: 0,
      advisorsPerformance: [],
      advisorsBySpecialty: []
    };
  }
};

export const getCompleteDashboardData = async (
  daysBack: number = 30
): Promise<CompleteDashboardData> => {
  try {
    console.log('🔄 Obteniendo dashboard completo...');

    const { data, error } = await supabase
      .rpc('get_complete_dashboard_data', { days_back: daysBack });

    if (error) throw error;

    console.log('✅ Dashboard completo obtenido');

    return data as CompleteDashboardData;
  } catch (error) {
    console.error('❌ Error obteniendo dashboard completo:', error);
    return {
      propertyAnalytics: null,
      clientReport: {
        totalClients: 0,
        clientsByType: [],
        clientsByStatus: [],
        clientsByAdvisor: [],
        newClientsThisMonth: 0,
        activeContracts: 0,
        clientsWithOverduePayments: 0
      },
      appointmentReport: {
        totalAppointments: 0,
        appointmentsByStatus: [],
        appointmentsByType: [],
        appointmentsByAdvisor: [],
        conversionRate: 0,
        averageRating: 0,
        upcomingAppointments: 0
      },
      financialReport: {
        totalRevenue: 0,
        pendingPayments: 0,
        overduePayments: 0,
        paymentsByType: [],
        monthlyRevenue: [],
        averagePaymentAmount: 0
      },
      contractReport: {
        totalContracts: 0,
        activeContracts: 0,
        contractsByType: [],
        expiringContracts: 0,
        averageContractValue: 0,
        averageContractDuration: 0
      },
      communicationReport: {
        totalCommunications: 0,
        communicationsByType: [],
        communicationsByAdvisor: [],
        pendingFollowUps: 0,
        responseRate: 0
      },
      documentsReport: {
        totalDocuments: 0,
        documentsByType: [],
        documentsByStatus: [],
        recentUploads: 0,
        expiringDocuments: 0
      },
      alertsReport: {
        totalAlerts: 0,
        activeAlerts: 0,
        criticalAlerts: 0,
        alertsByType: [],
        alertsByPriority: [],
        recentAlerts: 0
      },
      advisorsReport: {
        totalAdvisors: 0,
        activeAdvisors: 0,
        totalClientsAssigned: 0,
        averageClientsPerAdvisor: 0,
        advisorsPerformance: [],
        advisorsBySpecialty: []
      }
    };
  }
};