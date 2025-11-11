// ============================================
// API DEL PORTAL DE CLIENTES
// Funciones para consultar datos del portal
// ============================================

import { supabase } from '../supabase';
import { getAuthenticatedClientId, clearSession } from './clientAuth';
import type {
  ClientProfile,
  ClientContract,
  ClientPayment,
  ClientDocument,
  ClientDashboardSummary,
  ClientProperty,
  PaymentFilters,
  DocumentFilters,
  ApiResponse,
  ClientAlert,
  ClientCommunication
} from '../../types/clientPortal';

// ============================================
// HELPER: MANEJO DE ERRORES Y SESIÓN
// ============================================

/**
 * Verificar si un error es de autenticación (sesión expirada o no autorizado)
 */
function isAuthError(error: any): boolean {
  if (!error) return false;
  
  // Errores de PostgreSQL relacionados con autenticación
  const authErrorCodes = ['PGRST301', 'PGRST302', '42501'];
  
  // Verificar código de error
  if (error.code && authErrorCodes.includes(error.code)) {
    return true;
  }
  
  // Verificar mensaje de error
  const authErrorMessages = [
    'JWT expired',
    'invalid JWT',
    'not authenticated',
    'permission denied',
    'no rows returned',
    'session expired'
  ];
  
  const errorMessage = (error.message || '').toLowerCase();
  return authErrorMessages.some(msg => errorMessage.includes(msg));
}

/**
 * Manejar error de autenticación (limpiar sesión y redirigir)
 */
function handleAuthError(): void {
  console.warn('🔒 Sesión expirada o no autorizada. Redirigiendo al login...');
  clearSession();
  
  // Redirigir al login del portal de clientes
  if (typeof window !== 'undefined') {
    window.location.href = '/login?expired=true&type=client';
  }
}

/**
 * Wrapper para manejar errores de Supabase
 */
function handleSupabaseError<T>(error: any, defaultMessage: string): ApiResponse<T> {
  // Si es error de autenticación, manejar especialmente
  if (isAuthError(error)) {
    handleAuthError();
    return {
      success: false,
      error: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
    };
  }
  
  // Error genérico
  console.error('Error en Supabase:', error);
  return {
    success: false,
    error: error.message || defaultMessage
  };
}

// ============================================
// PERFIL DE CLIENTE
// ============================================

/**
 * Obtener perfil del cliente autenticado
 */
export async function getMyProfile(): Promise<ApiResponse<ClientProfile>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    const { data, error } = await supabase
      .from('clients')
      .select(`
        id,
        full_name,
        email,
        phone,
        document_type,
        document_number,
        address,
        city,
        emergency_contact_name,
        emergency_contact_phone,
        occupation,
        company_name,
        created_at
      `)
      .eq('id', clientId)
      .single();

    if (error) {
      return {
        success: false,
        error: 'Error al obtener perfil'
      };
    }

    return {
      success: true,
      data: data as ClientProfile
    };
  } catch (error) {
    console.error('Error en getMyProfile:', error);
    return {
      success: false,
      error: 'Error al obtener perfil'
    };
  }
}

/**
 * Actualizar perfil del cliente
 */
export async function updateMyProfile(
  updates: Partial<ClientProfile>
): Promise<ApiResponse<void>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    // Solo permitir actualizar ciertos campos
    const allowedFields = [
      'phone',
      'address',
      'city',
      'emergency_contact_name',
      'emergency_contact_phone',
      'occupation',
      'company_name'
    ];

    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key as keyof ClientProfile];
        return obj;
      }, {} as any);

    const { error } = await supabase
      .from('clients')
      .update({
        ...filteredUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);

    if (error) {
      return {
        success: false,
        error: 'Error al actualizar perfil'
      };
    }

    return {
      success: true,
      message: 'Perfil actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error en updateMyProfile:', error);
    return {
      success: false,
      error: 'Error al actualizar perfil'
    };
  }
}

// ============================================
// CONTRATOS
// ============================================

/**
 * Obtener todos los contratos del cliente
 */
export async function getMyContracts(): Promise<ApiResponse<ClientContract[]>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    const { data, error } = await supabase
      .from('contracts')
      .select(`
        id,
        contract_number,
        contract_type,
        status,
        start_date,
        end_date,
        signature_date,
        monthly_rent,
        deposit_amount,
        administration_fee,
        payment_day,
        notes,
        property_id,
        landlord_id
      `)
      .or(`client_id.eq.${clientId},landlord_id.eq.${clientId}`)
      .order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        error: 'Error al obtener contratos'
      };
    }

    // Obtener datos de propiedades y propietarios
    const contractsWithDetails = await Promise.all(
      (data || []).map(async (contract) => {
        let property = null;
        let landlord = null;

        // Obtener propiedad si existe
        if (contract.property_id) {
          const { data: propData } = await supabase
            .from('properties')
            .select('id, title, code, address, city, images, bedrooms, bathrooms, area')
            .eq('id', contract.property_id)
            .single();
          
          property = propData;
        }

        // Obtener propietario si existe
        if (contract.landlord_id) {
          const { data: landlordData } = await supabase
            .from('clients')
            .select('full_name, phone, email')
            .eq('id', contract.landlord_id)
            .single();
          
          landlord = landlordData;
        }

        return {
          ...contract,
          property,
          landlord
        } as ClientContract;
      })
    );

    return {
      success: true,
      data: contractsWithDetails
    };
  } catch (error) {
    console.error('Error en getMyContracts:', error);
    return {
      success: false,
      error: 'Error al obtener contratos'
    };
  }
}

/**
 * Obtener un contrato específico
 */
export async function getContractById(
  contractId: string
): Promise<ApiResponse<ClientContract>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .or(`client_id.eq.${clientId},landlord_id.eq.${clientId}`)
      .single();

    if (error || !data) {
      return {
        success: false,
        error: 'Contrato no encontrado'
      };
    }

    // Obtener detalles de propiedad y propietario
    let property = null;
    let landlord = null;

    if (data.property_id) {
      const { data: propData } = await supabase
        .from('properties')
        .select('id, title, code, address, city, images, bedrooms, bathrooms, area')
        .eq('id', data.property_id)
        .single();
      property = propData;
    }

    if (data.landlord_id) {
      const { data: landlordData } = await supabase
        .from('clients')
        .select('full_name, phone, email')
        .eq('id', data.landlord_id)
        .single();
      landlord = landlordData;
    }

    return {
      success: true,
      data: {
        ...data,
        property,
        landlord
      } as ClientContract
    };
  } catch (error) {
    console.error('Error en getContractById:', error);
    return {
      success: false,
      error: 'Error al obtener contrato'
    };
  }
}

// ============================================
// PAGOS
// ============================================

/**
 * Obtener todos los pagos del cliente
 */
export async function getMyPayments(
  filters?: PaymentFilters
): Promise<ApiResponse<ClientPayment[]>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    let query = supabase
      .from('payments')
      .select('*')
      .or(`client_id.eq.${clientId},beneficiary_id.eq.${clientId}`);

    // Aplicar filtros
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.payment_type) {
      query = query.eq('payment_type', filters.payment_type);
    }
    if (filters?.contract_id) {
      query = query.eq('contract_id', filters.contract_id);
    }
    if (filters?.date_from) {
      query = query.gte('due_date', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('due_date', filters.date_to);
    }

    query = query.order('due_date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: 'Error al obtener pagos'
      };
    }

    // Obtener información del contrato para cada pago
    const paymentsWithContracts = await Promise.all(
      (data || []).map(async (payment) => {
        let contract = null;
        
        if (payment.contract_id) {
          const { data: contractData } = await supabase
            .from('contracts')
            .select('contract_number, property_id')
            .eq('id', payment.contract_id)
            .single();

          if (contractData && contractData.property_id) {
            const { data: propData } = await supabase
              .from('properties')
              .select('title')
              .eq('id', contractData.property_id)
              .single();

            contract = {
              contract_number: contractData.contract_number,
              property_title: propData?.title || 'Sin propiedad'
            };
          }
        }

        return {
          ...payment,
          contract
        } as ClientPayment;
      })
    );

    return {
      success: true,
      data: paymentsWithContracts
    };
  } catch (error) {
    console.error('Error en getMyPayments:', error);
    return {
      success: false,
      error: 'Error al obtener pagos'
    };
  }
}

/**
 * Obtener pagos pendientes
 */
export async function getPendingPayments(): Promise<ApiResponse<ClientPayment[]>> {
  return getMyPayments({ status: 'pending' });
}

/**
 * Obtener pagos vencidos
 */
export async function getOverduePayments(): Promise<ApiResponse<ClientPayment[]>> {
  return getMyPayments({ status: 'overdue' });
}

/**
 * Obtener próximos pagos (próximos 30 días)
 */
export async function getUpcomingPayments(): Promise<ApiResponse<ClientPayment[]>> {
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);

  return getMyPayments({
    status: 'pending',
    date_from: today.toISOString().split('T')[0],
    date_to: in30Days.toISOString().split('T')[0]
  });
}

// ============================================
// DOCUMENTOS
// ============================================

/**
 * Obtener todos los documentos del cliente
 */
export async function getMyDocuments(
  filters?: DocumentFilters
): Promise<ApiResponse<ClientDocument[]>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    let query = supabase
      .from('client_documents')
      .select('*')
      .eq('client_id', clientId);

    // Aplicar filtros
    if (filters?.document_type) {
      query = query.eq('document_type', filters.document_type);
    }
    if (filters?.contract_id) {
      query = query.eq('contract_id', filters.contract_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: 'Error al obtener documentos'
      };
    }

    return {
      success: true,
      data: data as ClientDocument[]
    };
  } catch (error) {
    console.error('Error en getMyDocuments:', error);
    return {
      success: false,
      error: 'Error al obtener documentos'
    };
  }
}

/**
 * Obtener documentos por tipo
 */
export async function getDocumentsByType(
  documentType: string
): Promise<ApiResponse<ClientDocument[]>> {
  return getMyDocuments({ document_type: documentType });
}

// ============================================
// DASHBOARD SUMMARY
// ============================================

/**
 * Obtener resumen para el dashboard del cliente
 */
export async function getClientDashboardSummary(): Promise<ApiResponse<ClientDashboardSummary>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      handleAuthError();
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    // Usar la función SQL actualizada que devuelve JSON
    const { data, error } = await supabase.rpc('get_client_dashboard_summary', {
      p_client_id: clientId
    });

    if (error) {
      console.error('Error llamando a función SQL:', error);
      
      // Verificar si es error de autenticación
      if (isAuthError(error)) {
        return handleSupabaseError(error, 'Error al obtener resumen del dashboard');
      }
      
      return {
        success: false,
        error: 'Error al obtener resumen del dashboard'
      };
    }

    // La función SQL ahora devuelve JSON, no necesita casting
    return {
      success: true,
      data: data as ClientDashboardSummary
    };
  } catch (error) {
    console.error('Error en getClientDashboardSummary:', error);
    return handleSupabaseError(error, 'Error al obtener resumen del dashboard');
  }
}

// ============================================
// COMUNICACIONES (SOLO LECTURA)
// ============================================

/**
 * Obtener historial de comunicaciones
 */
export async function getMyCommunications(): Promise<ApiResponse<any[]>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    const { data, error } = await supabase
      .from('client_communications')
      .select('*')
      .eq('client_id', clientId)
      .order('communication_date', { ascending: false });

    if (error) {
      return {
        success: false,
        error: 'Error al obtener comunicaciones'
      };
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error en getMyCommunications:', error);
    return {
      success: false,
      error: 'Error al obtener comunicaciones'
    };
  }
}

/**
 * Crear nueva comunicación (mensaje del cliente al admin)
 */
export async function createCommunication(
  subject: string,
  description: string
): Promise<ApiResponse<void>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    const { error } = await supabase
      .from('client_communications')
      .insert({
        client_id: clientId,
        communication_type: 'message',
        subject,
        description,
        status: 'pending',
        priority: 'normal',
        communication_date: new Date().toISOString()
      });

    if (error) {
      return {
        success: false,
        error: 'Error al crear comunicación'
      };
    }

    return {
      success: true,
      message: 'Mensaje enviado exitosamente'
    };
  } catch (error) {
    console.error('Error en createCommunication:', error);
    return {
      success: false,
      error: 'Error al crear comunicación'
    };
  }
}

// ============================================
// ALERTAS (SOLO LECTURA)
// ============================================

/**
 * Obtener alertas activas del cliente
 */
export async function getMyAlerts(): Promise<ApiResponse<any[]>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    const { data, error } = await supabase
      .from('client_alerts')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'active')
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true });

    if (error) {
      return {
        success: false,
        error: 'Error al obtener alertas'
      };
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error en getMyAlerts:', error);
    return {
      success: false,
      error: 'Error al obtener alertas'
    };
  }
}

// ============================================
// FUNCIONES ESPECÍFICAS PARA PROPIETARIOS
// ============================================

/**
 * Obtener todos los pagos recibidos (para propietarios/landlords)
 * Incluye información de inquilinos y contratos
 */
export async function getClientPayments(): Promise<ClientPayment[]> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      throw new Error('No autenticado');
    }

    // Obtener contratos donde el cliente es inquilino (client_id)
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, contract_number, client_id')
      .eq('client_id', clientId);

    if (contractsError) {
      console.error('Error obteniendo contratos:', contractsError);
      throw contractsError;
    }

    if (!contracts || contracts.length === 0) {
      return [];
    }

    const contractIds = contracts.map(c => c.id);

    // Obtener todos los pagos de esos contratos
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .in('contract_id', contractIds)
      .order('due_date', { ascending: false });

    if (paymentsError) {
      console.error('Error obteniendo pagos:', paymentsError);
      throw paymentsError;
    }

    if (!payments || payments.length === 0) {
      return [];
    }

    // Enriquecer pagos con información de contratos e inquilinos
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        const contract = contracts.find(c => c.id === payment.contract_id);
        let tenant_name = '';
        let contract_number = contract?.contract_number || '';

        if (contract) {
          // Obtener nombre del inquilino
          const { data: tenantData } = await supabase
            .from('clients')
            .select('full_name')
            .eq('id', contract.client_id)
            .single();

          if (tenantData) {
            tenant_name = tenantData.full_name;
          }
        }

        return {
          ...payment,
          tenant_name,
          contract_number
        } as ClientPayment;
      })
    );

    return enrichedPayments;
  } catch (error) {
    console.error('Error en getClientPayments:', error);
    throw error;
  }
}

// ============================================
// PROPIEDADES DEL CLIENTE
// ============================================

/**
 * Obtener propiedades asignadas al cliente autenticado
 */
export async function getClientProperties(): Promise<ClientProperty[]> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      throw new Error('No estás autenticado');
    }

    // Obtener relaciones cliente-propiedad
    const { data: relations, error: relationsError } = await supabase
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
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (relationsError) {
      console.error('Error obteniendo relaciones cliente-propiedad:', relationsError);
      throw relationsError;
    }

    if (!relations || relations.length === 0) {
      return [];
    }

    // Formatear respuesta
    return relations.map(relation => ({
      id: relation.id,
      client_id: relation.client_id,
      property_id: relation.property_id,
      relation_type: relation.relation_type,
      status: relation.status,
      created_at: relation.created_at,
      updated_at: relation.updated_at,
      property: relation.property
    })) as ClientProperty[];

  } catch (error) {
    console.error('Error en getClientProperties:', error);
    throw error;
  }
}

// ============================================
// DOCUMENTOS DEL CLIENTE
// ============================================

/**
 * Obtener documentos del cliente autenticado
 */
export async function getClientDocuments(): Promise<ClientDocument[]> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      throw new Error('No estás autenticado');
    }

    const { data: documents, error } = await supabase
      .from('client_documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo documentos del cliente:', error);
      throw error;
    }

    if (!documents || documents.length === 0) {
      return [];
    }

    return documents as ClientDocument[];

  } catch (error) {
    console.error('Error en getClientDocuments:', error);
    throw error;
  }
}

// ============================================
// ALERTAS DEL CLIENTE
// ============================================

/**
 * Obtener alertas activas del cliente autenticado
 * Solo retorna alertas no leídas y no expiradas
 */
export async function getClientAlerts(): Promise<ApiResponse<ClientAlert[]>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    const now = new Date().toISOString();

    const { data: alerts, error } = await supabase
      .from('client_alerts')
      .select('*')
      .eq('client_id', clientId)
      .or(`expires_at.is.null,expires_at.gt.${now}`) // No expiradas
      .order('created_at', { ascending: false });

    if (error) {
      return handleSupabaseError<ClientAlert[]>(error, 'Error al obtener alertas');
    }

    return {
      success: true,
      data: (alerts || []) as ClientAlert[]
    };

  } catch (error) {
    console.error('Error en getClientAlerts:', error);
    return {
      success: false,
      error: 'Error al obtener alertas'
    };
  }
}

/**
 * Marcar una alerta como leída
 */
export async function markAlertAsRead(alertId: string): Promise<ApiResponse<void>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from('client_alerts')
      .update({
        status: 'read',
        read_at: now,
        updated_at: now
      })
      .eq('id', alertId)
      .eq('client_id', clientId); // Seguridad: solo puede actualizar sus propias alertas

    if (error) {
      return handleSupabaseError<void>(error, 'Error al marcar alerta como leída');
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Error en markAlertAsRead:', error);
    return {
      success: false,
      error: 'Error al marcar alerta como leída'
    };
  }
}

/**
 * Descartar/eliminar una alerta
 * Realiza soft delete actualizando is_read y ocultando la alerta
 */
export async function dismissAlert(alertId: string): Promise<ApiResponse<void>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    const now = new Date().toISOString();

    // Soft delete: marcamos como resolved y expirada inmediatamente
    const { error } = await supabase
      .from('client_alerts')
      .update({
        status: 'resolved',
        read_at: now,
        expires_at: now, // Expiramos inmediatamente para ocultar
        updated_at: now
      })
      .eq('id', alertId)
      .eq('client_id', clientId); // Seguridad: solo puede eliminar sus propias alertas

    if (error) {
      return handleSupabaseError<void>(error, 'Error al descartar alerta');
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Error en dismissAlert:', error);
    return {
      success: false,
      error: 'Error al descartar alerta'
    };
  }
}

// ============================================
// COMUNICACIONES DEL CLIENTE
// ============================================

/**
 * Obtener comunicaciones/mensajes del cliente autenticado
 * Ordena por fecha más reciente primero
 */
export async function getClientCommunications(): Promise<ApiResponse<ClientCommunication[]>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    const { data: communications, error } = await supabase
      .from('client_communications')
      .select('*')
      .eq('client_id', clientId)
      .order('communication_date', { ascending: false });

    if (error) {
      return handleSupabaseError<ClientCommunication[]>(error, 'Error al obtener mensajes');
    }

    return {
      success: true,
      data: (communications || []) as ClientCommunication[]
    };

  } catch (error) {
    console.error('Error en getClientCommunications:', error);
    return {
      success: false,
      error: 'Error al obtener mensajes'
    };
  }
}

/**
 * Marcar una comunicación como leída
 */
export async function markCommunicationAsRead(communicationId: string): Promise<ApiResponse<void>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from('client_communications')
      .update({
        read_at: now,
        updated_at: now
      })
      .eq('id', communicationId)
      .eq('client_id', clientId); // Seguridad: solo puede actualizar sus propios mensajes

    if (error) {
      return handleSupabaseError<void>(error, 'Error al marcar mensaje como leído');
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Error en markCommunicationAsRead:', error);
    return {
      success: false,
      error: 'Error al marcar mensaje como leído'
    };
  }
}

/**
 * Archivar una comunicación
 */
export async function archiveCommunication(communicationId: string): Promise<ApiResponse<void>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from('client_communications')
      .update({
        status: 'cancelled',
        updated_at: now
      })
      .eq('id', communicationId)
      .eq('client_id', clientId); // Seguridad: solo puede archivar sus propios mensajes

    if (error) {
      return handleSupabaseError<void>(error, 'Error al archivar mensaje');
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Error en archiveCommunication:', error);
    return {
      success: false,
      error: 'Error al archivar mensaje'
    };
  }
}

/**
 * Enviar un nuevo mensaje (cliente → admin)
 */
export async function sendClientMessage(
  subject: string,
  message: string,
  category: string
): Promise<ApiResponse<void>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from('client_communications')
      .insert({
        client_id: clientId,
        sender_type: 'client',
        sender_id: clientId,
        subject: subject,
        description: message,
        communication_type: 'message',
        priority: 'normal',
        status: 'unread', // Para el admin
        category: category,
        communication_date: now,
        created_at: now,
        updated_at: now
      });

    if (error) {
      return handleSupabaseError<void>(error, 'Error al enviar mensaje');
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Error en sendClientMessage:', error);
    return {
      success: false,
      error: 'Error al enviar mensaje'
    };
  }
}
