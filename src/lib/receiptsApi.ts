// =====================================================
// API: Gestión de Recibos de Pago (payment_receipts)
// Fecha: Diciembre 17, 2025
// =====================================================

import { supabase } from './supabase';

// =====================================================
// TIPOS
// =====================================================

export interface PaymentReceipt {
  id: string;
  client_id: string;
  schedule_id?: string | null;
  file_name: string;
  file_path: string;
  file_size?: number | null;
  file_type?: string | null;
  payment_amount: number;
  payment_date: string;
  payment_method?: string | null;
  payment_reference?: string | null;
  description?: string | null;
  notes?: string | null;
  status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  uploaded_at: string;
  uploaded_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UploadReceiptInput {
  client_id: string;
  schedule_id?: string | null;
  payment_amount: number;
  payment_date: string;
  payment_method?: string;
  payment_reference?: string;
  description?: string;
  notes?: string;
}

export interface VerifyReceiptInput {
  status: 'verified' | 'rejected';
  verification_notes?: string;
}

// =====================================================
// FUNCIONES CRUD
// =====================================================

/**
 * Obtener todos los recibos
 */
export async function getAllPaymentReceipts() {
  const { data, error } = await supabase
    .from('payment_receipts')
    .select(`
      *,
      client:clients(id, full_name, email),
      schedule:payment_schedules(id, payment_concept, amount, due_date),
      verified_by_user:advisors!verified_by(id, name, email)
    `)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Obtener recibos por cliente
 */
export async function getReceiptsByClient(clientId: string) {
  try {
    const { data, error } = await supabase
      .from('payment_receipts')
      .select('*')
      .eq('client_id', clientId)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('❌ Error en getReceiptsByClient:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Error cargando recibos del cliente:', error);
    return [];
  }
}

/**
 * Obtener recibos pendientes de verificación
 */
export async function getPendingReceipts() {
  const { data, error } = await supabase
    .from('payment_receipts')
    .select(`
      *,
      client:clients(id, full_name, email, phone),
      schedule:payment_schedules(id, payment_concept, amount, due_date)
    `)
    .eq('status', 'pending')
    .order('uploaded_at', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Obtener un recibo por ID
 */
export async function getReceiptById(id: string) {
  const { data, error } = await supabase
    .from('payment_receipts')
    .select(`
      *,
      client:clients(id, full_name, email, phone, document_type, document_number),
      schedule:payment_schedules(id, payment_concept, amount, due_date, status),
      verified_by_user:advisors!verified_by(id, name, email)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Subir un recibo de pago
 */
export async function uploadPaymentReceipt(
  file: File,
  input: UploadReceiptInput
) {
  const { data: userData } = await supabase.auth.getUser();
  
  // 1. Subir archivo a Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `receipts/${input.client_id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('payment-receipts')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('payment-receipts')
    .getPublicUrl(filePath);

  // 3. Crear registro en base de datos
  const { data, error } = await supabase
    .from('payment_receipts')
    .insert({
      ...input,
      file_name: file.name,
      file_path: publicUrl,
      file_size: file.size,
      file_type: file.type,
      status: 'pending',
      uploaded_by: userData?.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Verificar o rechazar un recibo
 */
export async function verifyReceipt(id: string, input: VerifyReceiptInput) {
  const { data: userData } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('payment_receipts')
    .update({
      status: input.status,
      verification_notes: input.verification_notes || null,
      verified_at: new Date().toISOString(),
      verified_by: userData?.user?.id
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Eliminar un recibo
 */
export async function deletePaymentReceipt(id: string) {
  // 1. Obtener información del recibo
  const { data: receipt } = await getReceiptById(id);
  
  // 2. Eliminar archivo de Storage
  const pathParts = receipt.file_path.split('/');
  const storagePath = pathParts.slice(-3).join('/'); // receipts/client_id/filename
  
  const { error: deleteStorageError } = await supabase.storage
    .from('payment-receipts')
    .remove([storagePath]);

  if (deleteStorageError) console.error('Error eliminando archivo:', deleteStorageError);

  // 3. Eliminar registro de base de datos
  const { error } = await supabase
    .from('payment_receipts')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Descargar un recibo
 */
export async function downloadReceipt(id: string) {
  const { data: receipt } = await getReceiptById(id);
  
  // Abrir en nueva pestaña
  window.open(receipt.file_path, '_blank');
}

/**
 * Obtener URL firmada para descarga segura
 */
export async function getReceiptSignedUrl(id: string, expiresIn: number = 3600) {
  const { data: receipt } = await getReceiptById(id);
  
  const pathParts = receipt.file_path.split('/');
  const storagePath = pathParts.slice(-3).join('/');
  
  const { data, error } = await supabase.storage
    .from('payment-receipts')
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

// =====================================================
// ESTADÍSTICAS
// =====================================================

/**
 * Obtener estadísticas de recibos
 */
export async function getReceiptStatistics() {
  const { data, error } = await supabase
    .from('payment_receipts')
    .select('status, payment_amount');

  if (error) throw error;

  const stats = {
    total: data.length,
    pending: data.filter(r => r.status === 'pending').length,
    verified: data.filter(r => r.status === 'verified').length,
    rejected: data.filter(r => r.status === 'rejected').length,
    totalAmount: data
      .filter(r => r.status === 'verified')
      .reduce((sum, r) => sum + r.payment_amount, 0)
  };

  return stats;
}

/**
 * Obtener recibos por rango de fechas
 */
export async function getReceiptsByDateRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('payment_receipts')
    .select(`
      *,
      client:clients(id, full_name, email),
      schedule:payment_schedules(id, payment_concept, amount)
    `)
    .gte('payment_date', startDate)
    .lte('payment_date', endDate)
    .order('payment_date', { ascending: false });

  if (error) throw error;
  return data;
}
