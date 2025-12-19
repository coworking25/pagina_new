import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, AlertCircle, Search, TrendingDown, TrendingUp, DollarSign, MinusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';

interface PaymentExtract {
  id: string;
  client_id: string;
  property_code: string;
  property_title: string;
  payment_date: string;
  amount: number;
  payment_type: string;
  status: string;
  receipt_url?: string;
  created_at: string;
  // Campos de desglose
  gross_amount?: number;
  admin_deduction?: number;
  agency_commission?: number;
  net_amount?: number;
  payment_direction?: string;
}

const ClientExtractos: React.FC = () => {
  const [extracts, setExtracts] = useState<PaymentExtract[]>([]);
  const [filteredExtracts, setFilteredExtracts] = useState<PaymentExtract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  useEffect(() => {
    loadPaymentExtracts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [extracts, searchTerm, dateFrom, dateTo, propertyFilter]);

  const loadPaymentExtracts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener client_id del almacenamiento local (mismo patrón que ClientDashboard)
      const session = JSON.parse(localStorage.getItem('client_portal_session') || '{}');
      const clientId = session.client_id;
      
      if (!clientId) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener pagos del cliente con información del contrato
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*, contracts!inner(property_id)')
        .eq('client_id', clientId)
        .order('payment_date', { ascending: false });

      if (paymentsError) {
        console.error('Error loading payments:', paymentsError);
        throw paymentsError;
      }

      // Obtener IDs únicos de propiedades
      const propertyIds = [...new Set(
        (paymentsData || [])
          .map(p => p.contracts?.property_id)
          .filter(id => id != null)
      )];

      // Obtener información de propiedades
      let propertiesMap = new Map();
      if (propertyIds.length > 0) {
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('id, code, title')
          .in('id', propertyIds);

        if (propertiesError) {
          console.error('Error loading properties:', propertiesError);
        } else {
          (propertiesData || []).forEach(prop => {
            propertiesMap.set(prop.id, { code: prop.code, title: prop.title });
          });
        }
      }

      // Transformar los datos
      const transformedExtracts: PaymentExtract[] = (paymentsData || []).map(item => {
        const propertyId = item.contracts?.property_id;
        const property = propertiesMap.get(propertyId);
        
        return {
          id: item.id,
          client_id: item.client_id,
          property_code: property?.code || 'N/A',
          property_title: property?.title || 'Propiedad sin título',
          payment_date: item.payment_date || item.due_date,
          amount: item.amount,
          payment_type: item.payment_type,
          status: item.status,
          receipt_url: item.receipt_url,
          created_at: item.created_at,
          // Campos de desglose
          gross_amount: item.gross_amount,
          admin_deduction: item.admin_deduction,
          agency_commission: item.agency_commission,
          net_amount: item.net_amount,
          payment_direction: item.payment_direction
        };
      });

      setExtracts(transformedExtracts);
      setFilteredExtracts(transformedExtracts);
    } catch (err) {
      console.error('Error loading payment extracts:', err);
      setError('Error al cargar los extractos de pago. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = extracts;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(extract =>
        extract.property_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extract.property_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extract.payment_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por fechas
    if (dateFrom) {
      filtered = filtered.filter(extract =>
        new Date(extract.payment_date) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filtered = filtered.filter(extract =>
        new Date(extract.payment_date) <= new Date(dateTo)
      );
    }

    // Filtro por propiedad
    if (propertyFilter !== 'all') {
      filtered = filtered.filter(extract => extract.property_code === propertyFilter);
    }

    setFilteredExtracts(filtered);
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'initial_payment': 'Pago Inicial',
      'monthly_rent': 'Renta Mensual',
      'deposit': 'Depósito',
      'commission': 'Comisión',
      'maintenance': 'Mantenimiento',
      'other': 'Otro'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'completed': 'Completado',
      'pending': 'Pendiente',
      'failed': 'Fallido',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const generateExtract = async (extract: PaymentExtract) => {
    try {
      // Importar jsPDF dinámicamente
      const { jsPDF } = await import('jspdf');
      
      // Crear nuevo documento PDF
      const doc = new jsPDF();
      
      // Configuración
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // ENCABEZADO - Título principal
      doc.setFillColor(34, 197, 94); // Verde
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('EXTRACTO DE PAGO', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Inmobiliaria - Sistema de Gestión', pageWidth / 2, 28, { align: 'center' });

      // Resetear color de texto
      doc.setTextColor(0, 0, 0);
      y = 50;

      // INFORMACIÓN DEL CLIENTE
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Información del Pago', margin, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Propiedad
      doc.setFont('helvetica', 'bold');
      doc.text('Propiedad:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(extract.property_title, margin + 35, y);
      y += 7;

      // Código
      doc.setFont('helvetica', 'bold');
      doc.text('Código:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(extract.property_code, margin + 35, y);
      y += 7;

      // Fecha de pago
      doc.setFont('helvetica', 'bold');
      doc.text('Fecha de Pago:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(format(new Date(extract.payment_date), 'dd/MM/yyyy', { locale: es }), margin + 35, y);
      y += 7;

      // Tipo de pago
      doc.setFont('helvetica', 'bold');
      doc.text('Tipo:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(getPaymentTypeLabel(extract.payment_type), margin + 35, y);
      y += 7;

      // Estado
      doc.setFont('helvetica', 'bold');
      doc.text('Estado:', margin, y);
      doc.setFont('helvetica', 'normal');
      const statusText = getStatusLabel(extract.status);
      doc.text(statusText, margin + 35, y);
      y += 15;

      // DESGLOSE FINANCIERO
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Desglose Financiero', margin, y);
      y += 10;

      // Tabla de desglose
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y - 5, pageWidth - 2 * margin, 8, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Concepto', margin + 2, y);
      doc.text('Monto', pageWidth - margin - 40, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      
      // Monto principal
      doc.text('Monto del Pago:', margin + 2, y);
      doc.text(formatCurrency(extract.amount), pageWidth - margin - 40, y);
      y += 7;

      // Si hay desglose, mostrarlo
      if (extract.gross_amount && extract.gross_amount > 0) {
        doc.setTextColor(100, 100, 100);
        doc.text('Monto Bruto:', margin + 2, y);
        doc.text(formatCurrency(extract.gross_amount), pageWidth - margin - 40, y);
        y += 7;

        if (extract.admin_deduction && extract.admin_deduction > 0) {
          doc.setTextColor(255, 140, 0);
          doc.text('- Administración:', margin + 2, y);
          doc.text(`-${formatCurrency(extract.admin_deduction)}`, pageWidth - margin - 40, y);
          y += 7;
        }

        if (extract.agency_commission && extract.agency_commission > 0) {
          doc.setTextColor(147, 51, 234);
          doc.text('- Comisión Agencia:', margin + 2, y);
          doc.text(`-${formatCurrency(extract.agency_commission)}`, pageWidth - margin - 40, y);
          y += 7;
        }

        if (extract.net_amount && extract.net_amount > 0) {
          doc.setTextColor(34, 197, 94);
          doc.setFont('helvetica', 'bold');
          doc.text('Monto Neto:', margin + 2, y);
          doc.text(formatCurrency(extract.net_amount), pageWidth - margin - 40, y);
          y += 10;
        }
      }

      // Resetear color
      doc.setTextColor(0, 0, 0);
      y += 10;

      // NOTA INFORMATIVA
      doc.setFillColor(253, 224, 71); // Amarillo claro
      doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F');
      y += 7;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('💡 Este extracto es un comprobante oficial del pago realizado.', margin + 2, y);
      y += 5;
      doc.text('   Conserve este documento para sus registros.', margin + 2, y);
      y += 15;

      // PIE DE PÁGINA
      y = doc.internal.pageSize.getHeight() - 30;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      
      const generatedText = `Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`;
      doc.text(generatedText, pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.text('Inmobiliaria - Sistema de Gestión de Propiedades', pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.text('Este documento es válido sin firma ni sello', pageWidth / 2, y, { align: 'center' });

      // Descargar PDF
      const fileName = `Extracto_${extract.property_code}_${format(new Date(extract.payment_date), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF extract:', error);
      alert('Error al generar el extracto PDF. Por favor, intenta de nuevo.');
    }
  };

  const generateFullExtract = async () => {
    try {
      if (filteredExtracts.length === 0) {
        alert('No hay pagos para generar el extracto');
        return;
      }

      // Importar jsPDF dinámicamente
      const { jsPDF } = await import('jspdf');
      
      // Crear nuevo documento PDF
      const doc = new jsPDF();
      
      // Configuración
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let y = 20;

      // Calcular totales
      const totalAmount = filteredExtracts.reduce((sum, extract) => sum + extract.amount, 0);
      const completedPayments = filteredExtracts.filter(e => e.status === 'completed').length;
      const pendingPayments = filteredExtracts.filter(e => e.status === 'pending').length;

      // ENCABEZADO
      doc.setFillColor(34, 197, 94); // Verde
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('EXTRACTO COMPLETO', pageWidth / 2, 18, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Historial de Pagos', pageWidth / 2, 28, { align: 'center' });
      
      doc.setFontSize(9);
      const period = dateFrom && dateTo
        ? `Período: ${format(new Date(dateFrom), 'dd/MM/yyyy')} - ${format(new Date(dateTo), 'dd/MM/yyyy')}`
        : 'Todos los pagos registrados';
      doc.text(period, pageWidth / 2, 35, { align: 'center' });

      // Resetear color
      doc.setTextColor(0, 0, 0);
      y = 55;

      // RESUMEN EJECUTIVO
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, pageWidth - 2 * margin, 30, 'F');
      
      y += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen Ejecutivo', margin + 5, y);
      
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de Pagos: ${filteredExtracts.length}`, margin + 5, y);
      doc.text(`Completados: ${completedPayments}`, margin + 70, y);
      doc.text(`Pendientes: ${pendingPayments}`, margin + 130, y);
      
      y += 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`Monto Total: ${formatCurrency(totalAmount)}`, margin + 5, y);
      
      y += 15;

      // TABLA DE PAGOS
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalle de Pagos', margin, y);
      y += 8;

      // Encabezados de tabla
      doc.setFillColor(34, 197, 94);
      doc.setTextColor(255, 255, 255);
      doc.rect(margin, y - 5, pageWidth - 2 * margin, 8, 'F');
      
      doc.setFontSize(9);
      doc.text('#', margin + 2, y);
      doc.text('Fecha', margin + 10, y);
      doc.text('Propiedad', margin + 35, y);
      doc.text('Monto', pageWidth - margin - 40, y);
      doc.text('Estado', pageWidth - margin - 15, y);
      
      y += 10;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');

      // Filas de pagos
      filteredExtracts.forEach((extract, index) => {
        // Verificar si necesitamos nueva página
        if (y > pageHeight - 30) {
          doc.addPage();
          y = 20;
          
          // Repetir encabezados
          doc.setFillColor(34, 197, 94);
          doc.setTextColor(255, 255, 255);
          doc.rect(margin, y - 5, pageWidth - 2 * margin, 8, 'F');
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('#', margin + 2, y);
          doc.text('Fecha', margin + 10, y);
          doc.text('Propiedad', margin + 35, y);
          doc.text('Monto', pageWidth - margin - 40, y);
          doc.text('Estado', pageWidth - margin - 15, y);
          y += 10;
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
        }

        // Fila alternada
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margin, y - 5, pageWidth - 2 * margin, 12, 'F');
        }

        doc.setFontSize(8);
        doc.text(`${index + 1}`, margin + 2, y);
        doc.text(format(new Date(extract.payment_date), 'dd/MM/yy'), margin + 10, y);
        
        // Truncar nombre de propiedad si es muy largo
        const propertyName = extract.property_title.length > 25 
          ? extract.property_title.substring(0, 25) + '...' 
          : extract.property_title;
        doc.text(propertyName, margin + 35, y);
        
        doc.text(formatCurrency(extract.amount), pageWidth - margin - 40, y);
        
        // Color según estado
        const status = getStatusLabel(extract.status);
        if (extract.status === 'completed') {
          doc.setTextColor(34, 197, 94); // Verde
        } else if (extract.status === 'pending') {
          doc.setTextColor(234, 179, 8); // Amarillo
        } else {
          doc.setTextColor(239, 68, 68); // Rojo
        }
        doc.text(status.substring(0, 8), pageWidth - margin - 15, y);
        doc.setTextColor(0, 0, 0);
        
        y += 6;
        
        // Tipo y código en segunda línea (más pequeño)
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(`${extract.property_code} - ${getPaymentTypeLabel(extract.payment_type)}`, margin + 35, y);
        doc.setTextColor(0, 0, 0);
        
        y += 8;
      });

      // NOTA FINAL
      y += 10;
      if (y > pageHeight - 50) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(253, 224, 71);
      doc.rect(margin, y, pageWidth - 2 * margin, 15, 'F');
      y += 7;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('💡 Este extracto contiene el historial completo de pagos según los filtros aplicados.', margin + 2, y);
      y += 5;
      doc.text('   Para mayor información, contacte con su asesor o administración.', margin + 2, y);

      // PIE DE PÁGINA en la última página
      y = pageHeight - 25;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.text('Inmobiliaria - Sistema de Gestión de Propiedades', pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.text(`Total de páginas: ${doc.getNumberOfPages()}`, pageWidth / 2, y, { align: 'center' });

      // Descargar
      const fileName = `Extracto_Completo_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating full extract:', error);
      alert('Error al generar el extracto completo. Por favor, intenta de nuevo.');
    }
  };

  // Obtener propiedades únicas para el filtro
  const uniqueProperties = Array.from(new Set(extracts.map(extract => extract.property_code)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando extractos de pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadPaymentExtracts}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Extractos de Pago
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Genera y descarga extractos de tus pagos realizados
          </p>
        </div>

        <button
          onClick={generateFullExtract}
          disabled={filteredExtracts.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-5 h-5" />
          Generar Extracto Completo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pagos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{extracts.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {extracts.filter(e => e.status === 'completed').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {extracts.filter(e => e.status === 'pending').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pagado</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(extracts.filter(e => e.status === 'completed').reduce((sum, e) => sum + e.amount, 0))}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Propiedad, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Propiedad
            </label>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las propiedades</option>
              {uniqueProperties.map(code => {
                const property = extracts.find(e => e.property_code === code);
                return (
                  <option key={code} value={code}>
                    {property?.property_title} ({code})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Payment Extracts List */}
      <div className="space-y-4">
        {filteredExtracts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {extracts.length === 0 ? 'No tienes pagos registrados' : 'No se encontraron pagos con los filtros aplicados'}
            </p>
          </div>
        ) : (
          filteredExtracts.map((extract, index) => (
            <motion.div
              key={extract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-2xl">
                      💰
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {extract.property_title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Código: {extract.property_code}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div>
                          <span className="font-medium">Fecha:</span>
                          <p>{format(new Date(extract.payment_date), 'dd/MM/yyyy', { locale: es })}</p>
                        </div>
                        <div>
                          <span className="font-medium">Monto:</span>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(extract.amount)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Tipo:</span>
                          <p>{getPaymentTypeLabel(extract.payment_type)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Estado:</span>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ml-2 ${getStatusColor(extract.status)}`}>
                            {getStatusLabel(extract.status)}
                          </span>
                        </div>
                      </div>

                      {/* Desglose de Pago - Solo si tiene campos de desglose */}
                      {extract.gross_amount && extract.gross_amount > 0 && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Desglose del Pago
                          </h4>
                          <div className="space-y-2">
                            {/* Monto Bruto */}
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                Monto Pagado
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(extract.gross_amount)}
                              </span>
                            </div>

                            {/* Deducción de Administración */}
                            {extract.admin_deduction && extract.admin_deduction > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <MinusCircle className="w-4 h-4 text-orange-500" />
                                  Administración
                                </span>
                                <span className="font-medium text-orange-600 dark:text-orange-400">
                                  - {formatCurrency(extract.admin_deduction)}
                                </span>
                              </div>
                            )}

                            {/* Comisión de la Agencia */}
                            {extract.agency_commission && extract.agency_commission > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <MinusCircle className="w-4 h-4 text-purple-500" />
                                  Comisión Agencia
                                </span>
                                <span className="font-medium text-purple-600 dark:text-purple-400">
                                  - {formatCurrency(extract.agency_commission)}
                                </span>
                              </div>
                            )}

                            {/* Línea divisora */}
                            <div className="border-t border-gray-300 dark:border-gray-600 my-2"></div>

                            {/* Monto Neto al Propietario */}
                            {extract.net_amount && extract.net_amount > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
                                  <TrendingDown className="w-4 h-4 text-green-500" />
                                  Monto al Propietario
                                </span>
                                <span className="font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(extract.net_amount)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Nota explicativa */}
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                              💡 El monto neto es lo que recibe el propietario después de descontar administración y comisiones.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => generateExtract(extract)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Extracto
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientExtractos;