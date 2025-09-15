// =====================================================
// API FUNCIONAL PARA EL SISTEMA DE CLIENTES
// =====================================================

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
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

// Crear cliente de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno de Supabase no configuradas');
}

const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

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
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error eliminando cliente:', error);
      throw error;
    }

    console.log('✅ Cliente eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error en deleteClient:', error);
    throw error;
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

// Obtener relaciones de propiedad de un cliente
export async function getClientPropertyRelations(clientId: string): Promise<ClientPropertyRelation[]> {
  try {
    // Intentar seleccionar la propiedad incluyendo cover_image. Si la columna no existe en la tabla properties,
    // reintentar sin ese campo (compatibilidad con esquemas diferentes).
    const selectWithCover = `*, property:properties(id, title, code, type, status, price, images, cover_image)`;

    let resp = await supabase
      .from('client_property_relations')
      .select(selectWithCover)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (resp.error) {
      // Si el error indica columna desconocida (42703) y menciona cover_image, reintentar sin cover_image
      if (resp.error.code === '42703' && /cover_image/.test(String(resp.error.message))) {
        console.warn('⚠️ Campo cover_image no existe en properties, reintentando sin ese campo');
        const selectWithoutCover = `*, property:properties(id, title, code, type, status, price, images)`;
        const retry = await supabase
          .from('client_property_relations')
          .select(selectWithoutCover)
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

        if (retry.error) {
          console.error('❌ Error obteniendo relaciones cliente-propiedad (retry):', retry.error);
          throw retry.error;
        }

        return retry.data || [];
      }

      console.error('❌ Error obteniendo relaciones cliente-propiedad:', resp.error);
      throw resp.error;
    }

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
    getClientPropertySummary
    ,
    generateContractPayments
  };
}
