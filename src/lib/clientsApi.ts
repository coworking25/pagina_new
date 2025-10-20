// =====================================================
// API FUNCIONAL PARA EL SISTEMA DE CLIENTES
// =====================================================

import { supabase } from './supabase';
import type { 
  Client, 
  Contract, 
  Payment, 
  ClientCommunication, 
  ClientAlert,
  ClientWithDetails,
  ClientFormData,
  ContractFormData,
  ClientFilters,
  ClientPropertyRelation,
  ClientPropertySummary
} from '../types/clients';
import { updatePropertyStatus } from './supabase';

// Usar el cliente singleton exportado desde src/lib/supabase.ts

// =====================================================
// FUNCIONES PARA CLIENTES
// =====================================================

// Obtener todos los clientes
export async function getClients(filters?: ClientFilters): Promise<Client[]> {
  try {
    let query = supabase
      .from('clients')
      .select('*');

    if (filters) {
      if (filters.client_type) {
        query = query.eq('client_type', filters.client_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.assigned_advisor_id) {
        query = query.eq('assigned_advisor_id', filters.assigned_advisor_id);
      }
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,document_number.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo clientes:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error en getClients:', error);
    throw error;
  }
}

// Obtener clientes con estadísticas usando vista
export async function getClientsWithStats(): Promise<ClientWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('clients_summary')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo clientes con stats:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error en getClientsWithStats:', error);
    throw error;
  }
}

// Obtener cliente por ID
export async function getClientById(id: string): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error obteniendo cliente:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Error en getClientById:', error);
    throw error;
  }
}

// Crear nuevo cliente
export async function createClient(clientData: ClientFormData): Promise<Client> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando cliente:', error);
      throw error;
    }

    console.log('✅ Cliente creado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en createClient:', error);
    throw error;
  }
}

// Actualizar cliente
export async function updateClient(id: string, clientData: Partial<ClientFormData>): Promise<Client> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando cliente:', error);
      throw error;
    }

    console.log('✅ Cliente actualizado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en updateClient:', error);
    throw error;
  }
}

// Eliminar cliente
export async function deleteClient(id: string): Promise<boolean> {
  try {
    console.log('🗑️ Intentando eliminar cliente:', id);
    
    const { error, data } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Error eliminando cliente:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Error eliminando cliente: ${error.message}`);
    }

    console.log('✅ Cliente eliminado exitosamente:', data);
    return true;
  } catch (error: any) {
    console.error('❌ Error en deleteClient:', error);
    throw new Error(error.message || 'Error desconocido al eliminar cliente');
  }
}

// =====================================================
// FUNCIONES PARA CONTRATOS
// =====================================================

// Obtener contratos
export async function getContracts(clientId?: string): Promise<Contract[]> {
  try {
    let query = supabase
      .from('contracts')
      .select('*');

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo contratos:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error en getContracts:', error);
    throw error;
  }
}

// Crear nuevo contrato
export async function createContract(contractData: ContractFormData): Promise<Contract> {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .insert([contractData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando contrato:', error);
      throw error;
    }

    console.log('✅ Contrato creado exitosamente:', data);

    // Si el contrato queda activo y está asociado a una propiedad, marcar la propiedad como ocupada
    try {
      if (data && data.status === 'active' && data.property_id) {
        await updatePropertyStatus(data.property_id, 'rented', `Contrato activado: ${data.id}`);

        // Asegurar que exista una relación cliente-propiedad marcada como active
        try {
          const relPayload = {
            client_id: data.client_id,
            property_id: data.property_id,
            relation_type: 'tenant',
            status: 'active'
          };
          // Intentar upsert en client_property_relations por client_id y property_id
          const { error: relError } = await supabase
            .from('client_property_relations')
            .upsert([relPayload], { onConflict: 'client_id,property_id' });
          if (relError) console.warn('⚠️ Error upsert client_property_relations:', relError);
        } catch (re) {
          console.warn('⚠️ Error asegurando relación cliente-propiedad:', re);
        }
      }
    } catch (statusErr) {
      console.warn('⚠️ Error actualizando estado de propiedad tras crear contrato:', statusErr);
    }

    return data;
  } catch (error) {
    console.error('❌ Error en createContract:', error);
    throw error;
  }
}

// Generar pagos automáticos para un contrato
export async function generateContractPayments(contractId: string, monthsAhead: number = 12): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('generate_monthly_payments', {
      p_contract_id: contractId,
      p_months_ahead: monthsAhead
    });

    if (error) {
      console.error('❌ Error generando pagos:', error);
      throw error;
    }

    console.log(`✅ ${data} pagos generados exitosamente`);
    return data;
  } catch (error) {
    console.error('❌ Error en generateContractPayments:', error);
    throw error;
  }
}

// =====================================================
// FUNCIONES PARA PAGOS
// =====================================================

// Obtener pagos
export async function getPayments(clientId?: string, contractId?: string): Promise<Payment[]> {
  try {
    let query = supabase
      .from('payments')
      .select('*');

    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (contractId) {
      query = query.eq('contract_id', contractId);
    }

    const { data, error } = await query.order('due_date', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo pagos:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error en getPayments:', error);
    throw error;
  }
}

// Obtener pagos próximos a vencer
export async function getUpcomingPayments(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('upcoming_payments')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo pagos próximos:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error en getUpcomingPayments:', error);
    throw error;
  }
}

// Marcar pago como pagado
export async function markPaymentAsPaid(
  paymentId: string, 
  amountPaid: number, 
  paymentMethod?: string, 
  transactionReference?: string
): Promise<Payment> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        amount_paid: amountPaid,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: paymentMethod,
        transaction_reference: transactionReference
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error marcando pago como pagado:', error);
      throw error;
    }

    console.log('✅ Pago marcado como pagado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en markPaymentAsPaid:', error);
    throw error;
  }
}

// =====================================================
// FUNCIONES PARA COMUNICACIONES
// =====================================================

// Obtener comunicaciones de un cliente
export async function getClientCommunications(clientId: string): Promise<ClientCommunication[]> {
  try {
    const { data, error } = await supabase
      .from('client_communications')
      .select('*')
      .eq('client_id', clientId)
      .order('communication_date', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo comunicaciones:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error en getClientCommunications:', error);
    throw error;
  }
}

// =====================================================
// FUNCIONES PARA ALERTAS
// =====================================================

// Obtener alertas activas
export async function getActiveAlerts(clientId?: string): Promise<ClientAlert[]> {
  try {
    let query = supabase
      .from('client_alerts')
      .select('*')
      .eq('status', 'active');

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query.order('priority', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo alertas:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error en getActiveAlerts:', error);
    throw error;
  }
}

// Resolver alerta
export async function resolveAlert(alertId: string, resolvedBy?: string): Promise<ClientAlert> {
  try {
    const { data, error } = await supabase
      .from('client_alerts')
      .update({
        status: 'resolved',
        resolved_date: new Date().toISOString(),
        resolved_by: resolvedBy
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error resolviendo alerta:', error);
      throw error;
    }

    console.log('✅ Alerta resuelta exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en resolveAlert:', error);
    throw error;
  }
}

// =====================================================
// FUNCIONES PARA ESTADÍSTICAS
// =====================================================

// Obtener estadísticas básicas
export async function getBasicStats() {
  try {
    const [
      clientsResult,
      contractsResult,
      paymentsResult,
      alertsResult
    ] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('contracts').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'overdue'),
      supabase.from('client_alerts').select('*', { count: 'exact', head: true }).eq('status', 'active')
    ]);

    return {
      total_clients: clientsResult.count || 0,
      total_contracts: contractsResult.count || 0,
      overdue_payments: paymentsResult.count || 0,
      active_alerts: alertsResult.count || 0
    };
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    throw error;
  }
}

// =====================================================
// FUNCIONES PARA RELACIONES CLIENTE-PROPIEDAD
// =====================================================

// Obtener relaciones de propiedad de un cliente (versión simplificada)
export async function getClientPropertyRelations(clientId: string): Promise<ClientPropertyRelation[]> {
  try {
    // Consulta simplificada sin cover_image para evitar problemas de compatibilidad
    const selectQuery = `*, property:properties(id, title, code, type, status, price, images, bedrooms, bathrooms, area, location, description, amenities)`;

    const resp = await supabase
      .from('client_property_relations')
      .select(selectQuery)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (resp.error) {
      console.error('❌ Error obteniendo relaciones cliente-propiedad:', resp.error);
      throw resp.error;
    }

    console.log('✅ Consulta exitosa, obtenidas', resp.data?.length || 0, 'relaciones para cliente', clientId);
    return resp.data || [];
  } catch (error) {
    console.error('❌ Error en getClientPropertyRelations:', error);
    throw error;
  }
}

// Crear múltiples relaciones cliente-propiedad en lote
export async function createClientPropertyRelations(relations: Array<Omit<ClientPropertyRelation, 'id' | 'created_at' | 'updated_at'>>): Promise<ClientPropertyRelation[]> {
  try {
    const { data, error } = await supabase
      .from('client_property_relations')
      .insert(relations)
      .select();

    if (error) {
      console.error('❌ Error creando relaciones cliente-propiedad en lote:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error en createClientPropertyRelations:', error);
    throw error;
  }
}

// Crear relación cliente-propiedad
export async function createClientPropertyRelation(relation: Omit<ClientPropertyRelation, 'id' | 'created_at' | 'updated_at'>): Promise<ClientPropertyRelation> {
  try {
    const { data, error } = await supabase
      .from('client_property_relations')
      .insert(relation)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando relación cliente-propiedad:', error);
      throw error;
    }

    console.log('✅ Relación cliente-propiedad creada:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en createClientPropertyRelation:', error);
    throw error;
  }
}

// Actualizar relación cliente-propiedad
export async function updateClientPropertyRelation(id: string, updates: Partial<ClientPropertyRelation>): Promise<ClientPropertyRelation> {
  try {
    const { data, error } = await supabase
      .from('client_property_relations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando relación cliente-propiedad:', error);
      throw error;
    }

    console.log('✅ Relación cliente-propiedad actualizada:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en updateClientPropertyRelation:', error);
    throw error;
  }
}

// Eliminar relación cliente-propiedad
export async function deleteClientPropertyRelation(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('client_property_relations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error eliminando relación cliente-propiedad:', error);
      throw error;
    }

    console.log('✅ Relación cliente-propiedad eliminada');
    return true;
  } catch (error) {
    console.error('❌ Error en deleteClientPropertyRelation:', error);
    throw error;
  }
}

// Obtener resumen de propiedades de un cliente
export async function getClientPropertySummary(clientId: string): Promise<ClientPropertySummary> {
  try {
    const { data, error } = await supabase
      .rpc('get_client_property_summary', { client_uuid: clientId });

    if (error) {
      console.error('❌ Error obteniendo resumen de propiedades:', error);
      throw error;
    }

    return data?.[0] || {
      owned_properties: 0,
      rented_properties: 0,
      interested_properties: 0,
      pending_contracts: 0,
      active_contracts: 0
    };
  } catch (error) {
    console.error('❌ Error en getClientPropertySummary:', error);
    throw error;
  }
}

// Verificar si existe un cliente con el mismo tipo y número de documento
export async function checkClientExists(documentType: string, documentNumber: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .eq('document_type', documentType)
      .eq('document_number', documentNumber)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error verificando existencia de cliente:', error);
      throw error;
    }

    return !!data; // Retorna true si existe, false si no
  } catch (error) {
    console.error('❌ Error en checkClientExists:', error);
    throw error;
  }
}

// Exponer funciones globalmente para debug en desarrollo
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).clientsAPI = {
    getClients,
    getClientsWithStats,
    createClient,
    updateClient,
    deleteClient,
    getContracts,
    createContract,
    getPayments,
    markPaymentAsPaid,
    getClientCommunications,
    getActiveAlerts,
    resolveAlert,
    getBasicStats,
    getClientPropertyRelations,
    createClientPropertyRelations,
    createClientPropertyRelation,
    updateClientPropertyRelation,
    deleteClientPropertyRelation,
    getClientPropertySummary,
    generateContractPayments,
    checkClientExists
  };
}

// =====================================================
// FUNCIONES ENRIQUECIDAS PARA ADMIN (con joins)
// =====================================================

/**
 * Obtener contratos con información completa para vista admin
 * Incluye: inquilino, landlord, propiedad
 */
export async function getContractsEnriched(clientId?: string): Promise<any[]> {
  try {
    console.log('🔍 getContractsEnriched llamada con clientId:', clientId);
    
    let query = supabase
      .from('contracts')
      .select('*');

    if (clientId) {
      // Traer contratos donde el cliente es inquilino O propietario
      const orFilter = `client_id.eq.${clientId},landlord_id.eq.${clientId}`;
      console.log('🔍 Filtro OR:', orFilter);
      query = query.or(orFilter);
    }

    const { data: contracts, error } = await query.order('created_at', { ascending: false });

    console.log('📊 Contratos encontrados:', contracts?.length || 0);
    
    if (error) {
      console.error('❌ Error obteniendo contratos:', error);
      throw error;
    }

    if (!contracts || contracts.length === 0) {
      console.log('⚠️ No se encontraron contratos para clientId:', clientId);
      return [];
    }

    // Enriquecer con información de inquilino, landlord y propiedad
    const enrichedContracts = await Promise.all(
      contracts.map(async (contract) => {
        // Obtener info del inquilino (tenant)
        let tenant = null;
        if (contract.client_id) {
          const { data: tenantData } = await supabase
            .from('clients')
            .select('full_name, email, phone, document_number')
            .eq('id', contract.client_id)
            .single();
          tenant = tenantData;
        }

        // Obtener info del propietario (landlord)
        let landlord = null;
        if (contract.landlord_id) {
          const { data: landlordData } = await supabase
            .from('clients')
            .select('full_name, email, phone')
            .eq('id', contract.landlord_id)
            .single();
          landlord = landlordData;
        }

        // Obtener info de la propiedad (si existe property_id)
        let property = null;
        if (contract.property_id) {
          const { data: propData } = await supabase
            .from('properties')
            .select('title, code, location, bedrooms, bathrooms, area')
            .eq('id', contract.property_id)
            .single();
          property = propData;
        }

        // Contar pagos asociados
        const { count: paymentCount } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('contract_id', contract.id);

        return {
          ...contract,
          tenant,
          landlord,
          property,
          payment_count: paymentCount || 0
        };
      })
    );

    return enrichedContracts;
  } catch (error) {
    console.error('❌ Error en getContractsEnriched:', error);
    throw error;
  }
}

/**
 * Obtener pagos con información completa para vista admin
 * Incluye: inquilino, contrato, propiedad
 */
export async function getPaymentsEnriched(clientId?: string, contractId?: string): Promise<any[]> {
  try {
    console.log('💰 getPaymentsEnriched llamada con clientId:', clientId, 'contractId:', contractId);
    
    let payments = [];
    
    if (clientId && !contractId) {
      console.log('💰 Buscando contratos del cliente...');
      // Si se pasa un clientId, buscar pagos de contratos donde el cliente es inquilino O landlord
      // Primero obtener contratos del cliente
      const { data: clientContracts } = await supabase
        .from('contracts')
        .select('id')
        .or(`client_id.eq.${clientId},landlord_id.eq.${clientId}`);
      
      console.log('💰 Contratos encontrados:', clientContracts?.length || 0);
      
      if (clientContracts && clientContracts.length > 0) {
        const contractIds = clientContracts.map(c => c.id);
        console.log('💰 IDs de contratos:', contractIds);
        
        const { data: paymentsData, error } = await supabase
          .from('payments')
          .select('*')
          .in('contract_id', contractIds)
          .order('due_date', { ascending: false });
        
        console.log('💰 Pagos encontrados:', paymentsData?.length || 0);
        
        if (error) {
          console.error('❌ Error obteniendo pagos:', error);
          throw error;
        }
        payments = paymentsData || [];
      }
    } else {
      // Consulta normal
      let query = supabase
        .from('payments')
        .select('*');

      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      if (contractId) {
        query = query.eq('contract_id', contractId);
      }

      const { data: paymentsData, error } = await query.order('due_date', { ascending: false });
      
      if (error) {
        console.error('❌ Error obteniendo pagos:', error);
        throw error;
      }
      payments = paymentsData || [];
    }

    if (!payments || payments.length === 0) {
      return [];
    }

    // Enriquecer con información de inquilino y contrato
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        // Obtener info del cliente/inquilino
        let client = null;
        if (payment.client_id) {
          const { data: clientData } = await supabase
            .from('clients')
            .select('full_name, email, phone')
            .eq('id', payment.client_id)
            .single();
          client = clientData;
        }

        // Obtener info del contrato
        let contract = null;
        let property = null;
        if (payment.contract_id) {
          const { data: contractData } = await supabase
            .from('contracts')
            .select('contract_number, property_id, monthly_rent')
            .eq('id', payment.contract_id)
            .single();
          
          contract = contractData;

          // Si el contrato tiene propiedad, obtenerla
          if (contractData && contractData.property_id) {
            const { data: propData } = await supabase
              .from('properties')
              .select('title, code, location')
              .eq('id', contractData.property_id)
              .single();
            property = propData;
          }
        }

        return {
          ...payment,
          client_name: client?.full_name || 'N/A',
          client_email: client?.email,
          client_phone: client?.phone,
          contract_number: contract?.contract_number,
          property_title: property?.title,
          property_code: property?.code,
          property_location: property?.location
        };
      })
    );

    return enrichedPayments;
  } catch (error) {
    console.error('❌ Error en getPaymentsEnriched:', error);
    throw error;
  }
}

// =====================================================
// FUNCIONES PARA WIZARD DE CLIENTES
// =====================================================

// Crear credenciales del portal del cliente
export async function createPortalCredentials(
  clientId: string,
  email: string,
  password: string,
  sendWelcomeEmail: boolean = false,
  portalAccessEnabled: boolean = true
): Promise<any> {
  try {
    // Hash de la contraseña (en producción usar bcrypt u otro hash seguro)
    // Por ahora guardamos una versión simple
    const passwordHash = btoa(password); // Base64 como ejemplo

    const credentialData = {
      client_id: clientId,
      email: email,
      password_hash: passwordHash,
      must_change_password: true, // Forzar cambio en primer login
      portal_access_enabled: portalAccessEnabled,
      welcome_email_sent: sendWelcomeEmail,
      last_login: null
    };

    const { data, error } = await supabase
      .from('client_portal_credentials')
      .insert([credentialData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando credenciales del portal:', error);
      throw error;
    }

    console.log('✅ Credenciales del portal creadas exitosamente');

    // TODO: Si sendWelcomeEmail es true, enviar email con credenciales
    if (sendWelcomeEmail) {
      console.log('📧 Email de bienvenida pendiente de envío a:', email);
      // Aquí integrar servicio de email (SendGrid, Resend, etc.)
    }

    return data;
  } catch (error) {
    console.error('❌ Error en createPortalCredentials:', error);
    throw error;
  }
}

// Subir documento del cliente a Supabase Storage
export async function uploadClientDocument(
  clientId: string,
  documentType: 'cedula_frente' | 'cedula_reverso' | 'certificado_laboral' | 'contrato_firmado',
  file: File
): Promise<any> {
  try {
    // Validar archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no válido. Solo se permiten JPG, PNG y PDF');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('El archivo excede el tamaño máximo de 5MB');
    }

    // Generar nombre único para el archivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `${clientId}/${documentType}_${Date.now()}.${fileExtension}`;
    const bucketName = 'client-documents';

    // Subir archivo a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Error subiendo archivo:', uploadError);
      throw uploadError;
    }

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    // Guardar registro en la tabla client_documents
    const documentData = {
      client_id: clientId,
      document_type: documentType,
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: null, // TODO: Agregar ID del usuario que sube
      verified: false
    };

    const { data: docData, error: docError } = await supabase
      .from('client_documents')
      .insert([documentData])
      .select()
      .single();

    if (docError) {
      console.error('❌ Error guardando documento en BD:', docError);
      throw docError;
    }

    console.log('✅ Documento subido exitosamente:', documentType);
    return docData;
  } catch (error) {
    console.error('❌ Error en uploadClientDocument:', error);
    throw error;
  }
}

// Guardar configuración de pagos del cliente
export async function savePaymentConfig(
  clientId: string,
  paymentConfig: {
    preferred_payment_method?: string;
    billing_day?: number;
    payment_due_days?: number;
    payment_concepts?: {
      arriendo?: { enabled: boolean; amount: number };
      administracion?: { enabled: boolean; amount: number };
      servicios_publicos?: { enabled: boolean; amount: number; services: string[] };
      otros?: { enabled: boolean; amount: number; description: string };
    };
  }
): Promise<any> {
  try {
    const configData = {
      client_id: clientId,
      preferred_payment_method: paymentConfig.preferred_payment_method,
      billing_day: paymentConfig.billing_day,
      payment_due_days: paymentConfig.payment_due_days,
      payment_concepts: paymentConfig.payment_concepts || {},
      auto_generate_invoices: false,
      send_payment_reminders: true
    };

    const { data, error } = await supabase
      .from('client_payment_config')
      .insert([configData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error guardando configuración de pagos:', error);
      throw error;
    }

    console.log('✅ Configuración de pagos guardada exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error en savePaymentConfig:', error);
    throw error;
  }
}

// Guardar referencias del cliente (personales y comerciales)
export async function saveClientReferences(
  clientId: string,
  references: {
    personal?: Array<{ name: string; phone: string; relationship: string }>;
    commercial?: Array<{ company_name: string; contact_person: string; phone: string }>;
  }
): Promise<any> {
  try {
    const referencesToInsert: any[] = [];

    // Referencias personales
    if (references.personal && references.personal.length > 0) {
      references.personal.forEach(ref => {
        referencesToInsert.push({
          client_id: clientId,
          reference_type: 'personal',
          name: ref.name,
          phone: ref.phone,
          relationship: ref.relationship,
          company_name: null,
          contact_person: null,
          verified: false
        });
      });
    }

    // Referencias comerciales
    if (references.commercial && references.commercial.length > 0) {
      references.commercial.forEach(ref => {
        referencesToInsert.push({
          client_id: clientId,
          reference_type: 'commercial',
          name: ref.contact_person,
          phone: ref.phone,
          company_name: ref.company_name,
          contact_person: ref.contact_person,
          relationship: 'comercial',
          verified: false
        });
      });
    }

    if (referencesToInsert.length === 0) {
      console.log('⚠️ No hay referencias para guardar');
      return [];
    }

    const { data, error } = await supabase
      .from('client_references')
      .insert(referencesToInsert)
      .select();

    if (error) {
      console.error('❌ Error guardando referencias:', error);
      throw error;
    }

    console.log(`✅ ${data.length} referencias guardadas exitosamente`);
    return data;
  } catch (error) {
    console.error('❌ Error en saveClientReferences:', error);
    throw error;
  }
}

// Guardar información del contrato (usando tabla client_contract_info)
export async function saveContractInfo(
  clientId: string,
  contractInfo: {
    contract_type?: string;
    start_date?: string;
    end_date?: string;
    duration_months?: number;
    deposit_amount?: number;
    deposit_paid?: boolean;
    guarantor_required?: boolean;
    guarantor_name?: string;
    guarantor_document?: string;
    guarantor_phone?: string;
  }
): Promise<any> {
  try {
    const contractData = {
      client_id: clientId,
      deposit_amount: contractInfo.deposit_amount || 0,
      deposit_paid: contractInfo.deposit_paid || false,
      deposit_paid_date: contractInfo.deposit_paid ? new Date().toISOString() : null,
      guarantor_required: contractInfo.guarantor_required || false,
      guarantor_name: contractInfo.guarantor_name || null,
      guarantor_document: contractInfo.guarantor_document || null,
      guarantor_phone: contractInfo.guarantor_phone || null,
      guarantor_email: null,
      keys_delivered: false,
      keys_quantity: 0,
      contract_signed: false,
      contract_signed_date: null,
      inventory_completed: false
    };

    const { data, error } = await supabase
      .from('client_contract_info')
      .insert([contractData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error guardando información del contrato:', error);
      throw error;
    }

    console.log('✅ Información del contrato guardada exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error en saveContractInfo:', error);
    throw error;
  }
}
