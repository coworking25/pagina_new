// ============================================
// GENERACIÓN DE REPORTES Y EXTRACTOS
// Para el Portal de Clientes
// ============================================

import { supabase } from '../supabase';
import { getAuthenticatedClientId } from './clientAuth';
import type {
  MonthlyExtract,
  AnnualSummary,
  AccountStatus,
  ExtractPDFData,
  ApiResponse
} from '../../types/clientPortal';

// ============================================
// EXTRACTOS MENSUALES
// ============================================

/**
 * Generar extracto mensual de pagos
 */
export async function generateMonthlyExtract(
  contractId: string,
  month: number,
  year: number
): Promise<ApiResponse<MonthlyExtract>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    // Usar la función SQL creada en el script 04
    const { data, error } = await supabase.rpc('generate_monthly_extract', {
      p_contract_id: contractId,
      p_month: month,
      p_year: year
    });

    if (error) {
      console.error('Error en generate_monthly_extract:', error);
      return {
        success: false,
        error: 'Error al generar extracto mensual'
      };
    }

    return {
      success: true,
      data: data as MonthlyExtract
    };
  } catch (error) {
    console.error('Error en generateMonthlyExtract:', error);
    return {
      success: false,
      error: 'Error al generar extracto mensual'
    };
  }
}

/**
 * Generar extracto del mes actual
 */
export async function generateCurrentMonthExtract(
  contractId: string
): Promise<ApiResponse<MonthlyExtract>> {
  const now = new Date();
  return generateMonthlyExtract(contractId, now.getMonth() + 1, now.getFullYear());
}

// ============================================
// RESUMEN ANUAL
// ============================================

/**
 * Generar resumen anual de pagos
 */
export async function generateAnnualSummary(
  contractId: string,
  year: number
): Promise<ApiResponse<AnnualSummary>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    // Usar la función SQL creada en el script 04
    const { data, error } = await supabase.rpc('generate_annual_summary', {
      p_contract_id: contractId,
      p_year: year
    });

    if (error) {
      console.error('Error en generate_annual_summary:', error);
      return {
        success: false,
        error: 'Error al generar resumen anual'
      };
    }

    return {
      success: true,
      data: data as AnnualSummary
    };
  } catch (error) {
    console.error('Error en generateAnnualSummary:', error);
    return {
      success: false,
      error: 'Error al generar resumen anual'
    };
  }
}

/**
 * Generar resumen del año actual
 */
export async function generateCurrentYearSummary(
  contractId: string
): Promise<ApiResponse<AnnualSummary>> {
  const currentYear = new Date().getFullYear();
  return generateAnnualSummary(contractId, currentYear);
}

// ============================================
// ESTADO DE CUENTA
// ============================================

/**
 * Obtener estado de cuenta del cliente
 */
export async function getAccountStatus(): Promise<ApiResponse<AccountStatus>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    // Usar la función SQL creada en el script 04
    const { data, error } = await supabase.rpc('get_account_status', {
      p_client_id: clientId
    });

    if (error) {
      console.error('Error en get_account_status:', error);
      return {
        success: false,
        error: 'Error al obtener estado de cuenta'
      };
    }

    return {
      success: true,
      data: data as AccountStatus
    };
  } catch (error) {
    console.error('Error en getAccountStatus:', error);
    return {
      success: false,
      error: 'Error al obtener estado de cuenta'
    };
  }
}

// ============================================
// DATOS PARA PDF
// ============================================

/**
 * Obtener datos para generar PDF de extracto
 */
export async function getExtractPDFData(
  contractId: string,
  month: number,
  year: number
): Promise<ApiResponse<ExtractPDFData>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    // Usar la función SQL creada en el script 04
    const { data, error } = await supabase.rpc('get_extract_pdf_data', {
      p_contract_id: contractId,
      p_month: month,
      p_year: year
    });

    if (error) {
      console.error('Error en get_extract_pdf_data:', error);
      return {
        success: false,
        error: 'Error al obtener datos para PDF'
      };
    }

    return {
      success: true,
      data: data as ExtractPDFData
    };
  } catch (error) {
    console.error('Error en getExtractPDFData:', error);
    return {
      success: false,
      error: 'Error al obtener datos para PDF'
    };
  }
}

// ============================================
// DESCARGA DE RECIBOS
// ============================================

/**
 * Obtener URL del recibo de pago
 */
export async function getPaymentReceiptUrl(
  paymentId: string
): Promise<ApiResponse<string>> {
  try {
    const clientId = getAuthenticatedClientId();
    if (!clientId) {
      return {
        success: false,
        error: 'No estás autenticado'
      };
    }

    // Verificar que el pago pertenece al cliente
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, client_id, transaction_reference')
      .eq('id', paymentId)
      .or(`client_id.eq.${clientId},beneficiary_id.eq.${clientId}`)
      .single();

    if (paymentError || !payment) {
      return {
        success: false,
        error: 'Pago no encontrado'
      };
    }

    // Buscar documento de recibo en client_documents
    const { data: document, error: docError } = await supabase
      .from('client_documents')
      .select('file_path')
      .eq('client_id', clientId)
      .eq('document_type', 'payment_receipt')
      .ilike('document_name', `%${paymentId}%`)
      .single();

    if (docError || !document || !document.file_path) {
      return {
        success: false,
        error: 'Recibo no disponible'
      };
    }

    // Generar URL pública del documento
    const { data: urlData } = supabase.storage
      .from('payment-receipts')
      .getPublicUrl(document.file_path);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: 'Error al generar URL del recibo'
      };
    }

    return {
      success: true,
      data: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error en getPaymentReceiptUrl:', error);
    return {
      success: false,
      error: 'Error al obtener recibo'
    };
  }
}

/**
 * Descargar recibo de pago
 */
export async function downloadPaymentReceipt(
  paymentId: string
): Promise<void> {
  const response = await getPaymentReceiptUrl(paymentId);
  
  if (response.success && response.data) {
    window.open(response.data, '_blank');
  } else {
    alert(response.error || 'Error al descargar recibo');
  }
}

// ============================================
// GENERACIÓN DE PDF (Cliente-side)
// ============================================

/**
 * Generar PDF de extracto mensual
 * Nota: Esta función requiere una librería de generación de PDF
 * como jspdf o @react-pdf/renderer
 */
export async function generateExtractPDF(
  contractId: string,
  month: number,
  year: number
): Promise<ApiResponse<Blob>> {
  try {
    // 1. Obtener datos del extracto
    const dataResponse = await getExtractPDFData(contractId, month, year);
    
    if (!dataResponse.success || !dataResponse.data) {
      return {
        success: false,
        error: dataResponse.error || 'Error al obtener datos'
      };
    }

    const pdfData = dataResponse.data;

    // 2. Generar PDF con jsPDF
    // Nota: Necesitas instalar jspdf: npm install jspdf
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Configuración
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('EXTRACTO DE PAGOS', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Información del cliente
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${pdfData.client.full_name}`, margin, y);
    y += 7;
    doc.text(`Documento: ${pdfData.client.document_number}`, margin, y);
    y += 7;
    doc.text(`Contrato: ${pdfData.contract.contract_number}`, margin, y);
    y += 7;
    doc.text(`Propiedad: ${pdfData.contract.property_title}`, margin, y);
    y += 10;

    // Periodo
    doc.setFont('helvetica', 'bold');
    doc.text(`Periodo: ${getMonthName(pdfData.period.month)} ${pdfData.period.year}`, margin, y);
    y += 15;

    // Tabla de pagos
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE PAGOS', margin, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Encabezados de tabla
    const colWidths = [60, 30, 30, 30, 30];
    const cols = ['Concepto', 'Vencimiento', 'Monto', 'Pagado', 'Estado'];
    
    cols.forEach((col, i) => {
      const x = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(col, x, y);
    });
    y += 7;

    // Línea separadora
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    // Filas de pagos
    pdfData.payments.forEach(payment => {
      doc.text(payment.concept, margin, y);
      doc.text(formatDate(payment.due_date), margin + 60, y);
      doc.text(formatCurrency(payment.amount), margin + 90, y);
      doc.text(formatCurrency(payment.amount_paid), margin + 120, y);
      doc.text(translateStatus(payment.status), margin + 150, y);
      y += 7;

      // Nueva página si es necesario
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 5;
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Resumen
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN', margin, y);
    y += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Total a Pagar: ${formatCurrency(pdfData.summary.total_due)}`, margin, y);
    y += 7;
    doc.text(`Total Pagado: ${formatCurrency(pdfData.summary.total_paid)}`, margin, y);
    y += 7;
    doc.text(`Saldo Pendiente: ${formatCurrency(pdfData.summary.total_pending)}`, margin, y);
    y += 7;
    if (pdfData.summary.late_fees > 0) {
      doc.setTextColor(255, 0, 0);
      doc.text(`Mora Aplicada: ${formatCurrency(pdfData.summary.late_fees)}`, margin, y);
      doc.setTextColor(0, 0, 0);
    }

    // Generar blob
    const pdfBlob = doc.output('blob');

    return {
      success: true,
      data: pdfBlob
    };
  } catch (error) {
    console.error('Error en generateExtractPDF:', error);
    return {
      success: false,
      error: 'Error al generar PDF'
    };
  }
}

/**
 * Descargar extracto como PDF
 */
export async function downloadExtractPDF(
  contractId: string,
  month: number,
  year: number
): Promise<void> {
  const response = await generateExtractPDF(contractId, month, year);
  
  if (response.success && response.data) {
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Extracto_${year}_${month.toString().padStart(2, '0')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    alert(response.error || 'Error al generar PDF');
  }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Formatear moneda en pesos colombianos
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Formatear fecha
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Traducir estado de pago
 */
function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    'paid': 'Pagado',
    'pending': 'Pendiente',
    'overdue': 'Vencido',
    'partial': 'Parcial'
  };
  return translations[status] || status;
}

/**
 * Obtener nombre del mes
 */
function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month - 1] || '';
}

/**
 * Generar nombre de archivo para extracto
 */
export function generateExtractFileName(
  contractNumber: string,
  month: number,
  year: number
): string {
  const monthPadded = month.toString().padStart(2, '0');
  return `Extracto_${contractNumber}_${year}_${monthPadded}.pdf`;
}
