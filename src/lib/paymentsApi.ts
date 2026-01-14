// =====================================================
// API: Gestión de Pagos Programados (payment_schedules)
// Fecha: Diciembre 17, 2025
// =====================================================

import { supabase } from './supabase';

// =====================================================
// TIPOS
// =====================================================

export interface PaymentSchedule {
  id: string;
  client_id: string;
  property_id?: number | null;
  payment_concept: string;
  amount: number;
  currency: string;
  due_date: string;
  payment_date?: string | null;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  notes?: string | null;
  payment_method?: string | null;
  receipt_id?: string | null;
  paid_amount: number;
  remaining_amount: number;
  is_recurring: boolean;
  recurrence_frequency?: string | null;
  parent_schedule_id?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface CreatePaymentScheduleInput {
  client_id: string;
  property_id?: number | null;
  payment_concept: string;
  amount: number;
  currency?: string;
  due_date: string;
  notes?: string;
  is_recurring?: boolean;
  recurrence_frequency?: 'monthly' | 'quarterly' | 'yearly';
}

export interface UpdatePaymentScheduleInput {
  payment_concept?: string;
  amount?: number;
  due_date?: string;
  payment_date?: string;
  status?: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  notes?: string;
  payment_method?: string;
  paid_amount?: number;
}

// =====================================================
// FUNCIONES CRUD
// =====================================================

/**
 * Obtener todos los pagos programados
 */
export async function getAllPaymentSchedules() {
  try {
    const { data, error } = await supabase
      .from('payment_schedules')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('❌ Error en getAllPaymentSchedules:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Error cargando todos los pagos programados:', error);
    return [];
  }
}

/**
 * Obtener pagos programados por cliente
 */
export async function getPaymentSchedulesByClient(clientId: string) {
  try {
    const { data, error } = await supabase
      .from('payment_schedules')
      .select('*')
      .eq('client_id', clientId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('❌ Error en getPaymentSchedulesByClient:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Error cargando pagos programados:', error);
    return [];
  }
}

/**
 * Obtener pagos programados por propiedad
 */
export async function getPaymentSchedulesByProperty(propertyId: number) {
  const { data, error } = await supabase
    .from('payment_schedules')
    .select(`
      *,
      client:clients(id, full_name, email, phone)
    `)
    .eq('property_id', propertyId)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Obtener pagos por estado
 */
export async function getPaymentSchedulesByStatus(status: string) {
  const { data, error } = await supabase
    .from('payment_schedules')
    .select(`
      *,
      client:clients(id, full_name, email, phone),
      property:properties(id, title, code)
    `)
    .eq('status', status)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Obtener pagos vencidos
 */
export async function getOverduePayments() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('payment_schedules')
      .select('*')
      .in('status', ['pending', 'partial'])
      .lt('due_date', today)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('❌ Error en getOverduePayments:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Error cargando pagos vencidos:', error);
    return [];
  }
}

/**
 * Obtener pagos del mes actual
 */
export async function getCurrentMonthPayments() {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('payment_schedules')
      .select('*')
      .gte('due_date', firstDay)
      .lte('due_date', lastDay)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('❌ Error en getCurrentMonthPayments:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Error cargando pagos del mes actual:', error);
    return [];
  }
}

/**
 * Obtener un pago programado por ID
 */
export async function getPaymentScheduleById(id: string) {
  const { data, error } = await supabase
    .from('payment_schedules')
    .select(`
      *,
      client:clients(id, full_name, email, phone, document_type, document_number),
      property:properties(id, title, code, address),
      receipt:payment_receipts(id, file_name, file_path, payment_amount, payment_date, status)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Crear un pago programado
 */
export async function createPaymentSchedule(input: CreatePaymentScheduleInput) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('payment_schedules')
      .insert({
        client_id: input.client_id,
        property_id: input.property_id || null,
        payment_concept: input.payment_concept,
        amount: input.amount,
        currency: input.currency || 'COP',
        due_date: input.due_date,
        notes: input.notes || null,
        is_recurring: input.is_recurring || false,
        recurrence_frequency: input.recurrence_frequency || null,
        status: 'pending',
        paid_amount: 0,
        // remaining_amount se calcula automáticamente (columna generada)
        created_by: userData?.user?.id || null,
        updated_by: userData?.user?.id || null
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando pago programado:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en createPaymentSchedule:', error);
    throw error;
  }
}

/**
 * Actualizar un pago programado
 */
export async function updatePaymentSchedule(id: string, input: UpdatePaymentScheduleInput) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    // Preparar datos de actualización (sin remaining_amount - es columna generada)
    const updateData: any = {
      ...input,
      updated_by: userData?.user?.id || null
    };
    
    const { data, error } = await supabase
      .from('payment_schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando pago programado:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error en updatePaymentSchedule:', error);
    throw error;
  }
}

/**
 * Marcar pago como completado
 */
export async function markPaymentAsCompleted(id: string, paymentDate: string, paymentMethod?: string) {
  const { data: payment } = await getPaymentScheduleById(id);
  
  const { data, error } = await supabase
    .from('payment_schedules')
    .update({
      status: 'paid',
      payment_date: paymentDate,
      payment_method: paymentMethod || null,
      paid_amount: payment.amount
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Eliminar un pago programado
 */
export async function deletePaymentSchedule(id: string) {
  const { error } = await supabase
    .from('payment_schedules')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Generar pagos recurrentes automáticamente
 */
export async function generateRecurringPayments(parentScheduleId: string, months: number = 12) {
  // Obtener el pago padre
  const { data: parent } = await getPaymentScheduleById(parentScheduleId);
  
  if (!parent.is_recurring) {
    throw new Error('El pago no está configurado como recurrente');
  }

  const payments = [];
  let currentDate = new Date(parent.due_date);

  for (let i = 1; i <= months; i++) {
    // Calcular siguiente fecha según frecuencia
    if (parent.recurrence_frequency === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (parent.recurrence_frequency === 'quarterly') {
      currentDate.setMonth(currentDate.getMonth() + 3);
    } else if (parent.recurrence_frequency === 'yearly') {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }

    payments.push({
      client_id: parent.client_id,
      property_id: parent.property_id,
      payment_concept: parent.payment_concept,
      amount: parent.amount,
      currency: parent.currency,
      due_date: currentDate.toISOString().split('T')[0],
      is_recurring: true,
      recurrence_frequency: parent.recurrence_frequency,
      parent_schedule_id: parentScheduleId,
      notes: `Generado automáticamente desde ${parent.payment_concept}`
    });
  }

  const { data, error } = await supabase
    .from('payment_schedules')
    .insert(payments)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Ejecutar función para marcar pagos vencidos
 */
export async function updateOverduePayments() {
  const { error } = await supabase.rpc('update_overdue_payment_schedules');
  
  if (error) throw error;
  return true;
}

// =====================================================
// ESTADÍSTICAS Y REPORTES
// =====================================================

/**
 * Obtener resumen de pagos por cliente
 */
export async function getPaymentSummaryByClient(clientId: string) {
  const { data, error } = await supabase
    .from('payment_schedules')
    .select('status, amount, paid_amount, due_date, payment_concept')
    .eq('client_id', clientId);

  if (error) throw error;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  // Calcular próximos 30 días
  const next30Days = new Date(today);
  next30Days.setDate(next30Days.getDate() + 30);
  const next30DaysStr = next30Days.toISOString().split('T')[0];

  // Filtrar pagos vencidos
  const overduePayments = data.filter(p => 
    (p.status === 'overdue' || (p.status === 'pending' && p.due_date < todayStr))
  );

  // Filtrar próximos pagos (próximos 30 días)
  const upcomingPayments = data.filter(p => 
    (p.status === 'pending' || p.status === 'partial') && 
    p.due_date >= todayStr && 
    p.due_date <= next30DaysStr
  ).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const summary = {
    totalAmount: data.reduce((sum, p) => sum + p.amount, 0),
    paidAmount: data.reduce((sum, p) => sum + (p.paid_amount || 0), 0),
    pendingAmount: data.reduce((sum, p) => {
      if (p.status === 'pending' || p.status === 'partial') {
        return sum + (p.amount - (p.paid_amount || 0));
      }
      return sum;
    }, 0),
    overdueCount: overduePayments.length,
    overdueAmount: overduePayments.reduce((sum, p) => sum + (p.amount - (p.paid_amount || 0)), 0),
    upcomingCount: upcomingPayments.length,
    upcomingPayments: upcomingPayments.slice(0, 5).map(p => ({
      concept: p.payment_concept || 'Pago',
      amount: p.amount,
      due_date: p.due_date
    }))
  };

  return summary;
}

/**
 * Obtener estadísticas generales de pagos
 */
export async function getPaymentStatistics() {
  const { data, error } = await supabase
    .from('payment_schedules')
    .select('status, amount, paid_amount, due_date');

  if (error) throw error;

  const today = new Date().toISOString().split('T')[0];
  
  const stats = {
    total: data.length,
    pending: data.filter(p => p.status === 'pending').length,
    paid: data.filter(p => p.status === 'paid').length,
    overdue: data.filter(p => p.status === 'overdue').length,
    partial: data.filter(p => p.status === 'partial').length,
    dueToday: data.filter(p => p.due_date === today).length,
    dueThisWeek: data.filter(p => {
      const dueDate = new Date(p.due_date);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return dueDate <= weekFromNow && dueDate >= new Date();
    }).length,
    totalExpected: data.reduce((sum, p) => sum + p.amount, 0),
    totalCollected: data.reduce((sum, p) => sum + p.paid_amount, 0),
    totalPending: data.reduce((sum, p) => sum + (p.amount - p.paid_amount), 0)
  };

  return stats;
}
