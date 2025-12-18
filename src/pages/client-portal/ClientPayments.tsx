import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Filter, Download, Search, CheckCircle, Clock, XCircle, AlertCircle, Calendar, X, TrendingUp, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getClientPayments } from '../../lib/client-portal/clientPortalApi';
import type { ClientPayment } from '../../types/clientPortal';
import PaymentCalendarView from '../../components/client-details/PaymentCalendarView';
import { getPaymentSchedulesByClient, getPaymentSummaryByClient } from '../../lib/paymentsApi';

type PaymentStatus = 'all' | 'paid' | 'pending' | 'overdue';
type TimeFilter = 'all' | 'month' | 'quarter' | 'year';

const ClientPayments: React.FC = () => {
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<ClientPayment[]>([]);
  const [paymentSchedules, setPaymentSchedules] = useState<any[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [contractFilter, setContractFilter] = useState<string>('all');

  // Estadísticas
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalPending: 0,
    totalOverdue: 0,
    averageAmount: 0
  });

  useEffect(() => {
    loadPayments();
    loadPaymentSchedules();
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [payments, statusFilter, timeFilter, searchTerm, contractFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClientPayments();
      setPayments(data);
      setFilteredPayments(data);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Error al cargar los pagos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentSchedules = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('client_portal_session') || '{}');
      const clientId = session.client_id;
      
      if (!clientId) {
        console.warn('No client_id found in session');
        return;
      }

      console.log('🔄 Cargando calendario de pagos para cliente:', clientId);
      
      const [schedules, summary] = await Promise.all([
        getPaymentSchedulesByClient(clientId),
        getPaymentSummaryByClient(clientId)
      ]);

      console.log('✅ Calendario cargado:', schedules.length, 'pagos programados');
      console.log('📊 Resumen:', summary);

      setPaymentSchedules(schedules);
      setPaymentSummary(summary);
    } catch (err) {
      console.error('❌ Error loading payment schedules:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Filtro por estado (mapear statusFilter a payment_status de client_payments)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => {
        const paymentStatus = (p as any).payment_status || p.status;
        // Mapear completed -> paid para compatibilidad
        const normalizedStatus = paymentStatus === 'completed' ? 'paid' : paymentStatus;
        return normalizedStatus === statusFilter;
      });
    }

    // Filtro por tiempo
    if (timeFilter !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (timeFilter) {
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(p => {
        const paymentDate = new Date(p.payment_date || p.due_date);
        return paymentDate >= startDate;
      });
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.tenant_name?.toLowerCase().includes(term) ||
        p.contract_number?.toLowerCase().includes(term) ||
        p.transaction_reference?.toLowerCase().includes(term)
      );
    }

    // Filtro por contrato
    if (contractFilter !== 'all') {
      filtered = filtered.filter(p => p.contract_id === contractFilter);
    }

    setFilteredPayments(filtered);
  };

  const calculateStats = () => {
    // NOTA: client_payments usa payment_status (no status), así que mapeamos correctamente
    const paid = payments.filter(p => (p as any).payment_status === 'completed' || p.status === 'paid');
    const pending = payments.filter(p => (p as any).payment_status === 'pending' || p.status === 'pending');
    const overdue = payments.filter(p => (p as any).payment_status === 'overdue' || p.status === 'overdue');

    // client_payments solo tiene "amount" (no amount_paid), así que usamos amount directamente para completed
    const totalReceived = paid.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPending = pending.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOverdue = overdue.reduce((sum, p) => sum + (p.amount || 0), 0);
    const averageAmount = paid.length > 0 ? totalReceived / paid.length : 0;

    setStats({
      totalReceived,
      totalPending,
      totalOverdue,
      averageAmount
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'overdue':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pagado' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', label: 'Vencido' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es });
  };

  const exportToCSV = () => {
    const headers = ['Fecha Vencimiento', 'Fecha Pago', 'Inquilino', 'Contrato', 'Tipo', 'Monto', 'Pagado', 'Mora', 'Estado', 'Referencia'];
    
    const rows = filteredPayments.map(p => [
      p.due_date || '',
      p.payment_date || '',
      p.tenant_name || '',
      p.contract_number || '',
      p.payment_type || '',
      p.amount,
      p.amount_paid || 0,
      p.late_fee_applied || 0,
      p.status,
      p.transaction_reference || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pagos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const uniqueContracts = Array.from(new Set(payments.map(p => p.contract_number).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={loadPayments}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Historial de Pagos</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Gestiona y revisa todos los pagos recibidos</p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setShowCalendar(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base flex-1 sm:flex-none"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden xs:inline">Ver</span> Calendario
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base flex-1 sm:flex-none"
          >
            <Download className="w-4 h-4" />
            Exportar <span className="hidden xs:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Resumen de Calendario de Pagos */}
      {paymentSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {paymentSummary.totalCount || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Programado</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              ${(paymentSummary.totalAmount || 0).toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${(paymentSummary.paidAmount || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pagado</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              ${(paymentSummary.pendingAmount || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pendiente</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {paymentSummary.overdueCount || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Vencidos</p>
            {paymentSummary.overdueAmount > 0 && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                ${paymentSummary.overdueAmount.toLocaleString()}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {paymentSummary.upcomingCount || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Próximos 30 días</p>
            {paymentSummary.upcomingPayments && paymentSummary.upcomingPayments.length > 0 && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {new Date(paymentSummary.upcomingPayments[0].due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Estadísticas de Historial */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 sm:p-4 lg:p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-green-100 text-xs sm:text-sm truncate">Total Recibido</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-0.5 sm:mt-1">{formatCurrency(stats.totalReceived)}</p>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-200 flex-shrink-0" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-3 sm:p-4 lg:p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-yellow-100 text-xs sm:text-sm truncate">Pendiente</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-0.5 sm:mt-1">{formatCurrency(stats.totalPending)}</p>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-yellow-200 flex-shrink-0" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 sm:p-4 lg:p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-red-100 text-xs sm:text-sm truncate">Vencido</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-0.5 sm:mt-1">{formatCurrency(stats.totalOverdue)}</p>
            </div>
            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-red-200 flex-shrink-0" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 sm:p-4 lg:p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-blue-100 text-xs sm:text-sm truncate">Promedio</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-0.5 sm:mt-1">{formatCurrency(stats.averageAmount)}</p>
            </div>
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-200 flex-shrink-0" />
          </div>
        </motion.div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="paid">Pagados</option>
            <option value="pending">Pendientes</option>
            <option value="overdue">Vencidos</option>
          </select>

          {/* Filtro de Tiempo */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todo el tiempo</option>
            <option value="month">Último mes</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último año</option>
          </select>

          {/* Filtro de Contrato */}
          <select
            value={contractFilter}
            onChange={(e) => setContractFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los contratos</option>
            {uniqueContracts.map(contract => (
              <option key={contract} value={contract || ''}>{contract}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Pagos */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inquilino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contrato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Venc.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Pago
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron pagos con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        {getStatusBadge(payment.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.tenant_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.contract_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 capitalize">{payment.payment_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(payment.due_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(payment.payment_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                      {payment.amount_paid && payment.amount_paid !== payment.amount && (
                        <div className="text-xs text-gray-500">Pagado: {formatCurrency(payment.amount_paid)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {payment.late_fee_applied > 0 ? (
                        <div className="text-sm font-medium text-red-600">{formatCurrency(payment.late_fee_applied)}</div>
                      ) : (
                        <div className="text-sm text-gray-400">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{payment.transaction_reference || '-'}</div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de resultados */}
      {filteredPayments.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Mostrando {filteredPayments.length} de {payments.length} pagos
        </div>
      )}

      {/* Modal de Calendario */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCalendar(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Calendario de Pagos
                </h2>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Calendario */}
              {paymentSchedules.length > 0 ? (
                <PaymentCalendarView
                  schedules={paymentSchedules}
                  onViewPayment={(payment) => {
                    console.log('Ver detalle de pago:', payment);
                    // Aquí puedes agregar un modal de detalle si lo necesitas
                  }}
                  readOnly={true}
                />
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No hay pagos programados</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientPayments;
