// =====================================================
// CALENDARIO DE PAGOS DEL CLIENTE
// Gestión de pagos programados/recurrentes
// =====================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  Search,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  X
} from 'lucide-react';
import {
  getPaymentSchedulesByClient,
  createPaymentSchedule,
  updatePaymentSchedule,
  markPaymentAsCompleted,
  deletePaymentSchedule,
  generateRecurringPayments,
  getPaymentSummaryByClient
} from '../../lib/paymentsApi';
import PaymentScheduleForm from './PaymentScheduleForm';
import PaymentCalendarView from './PaymentCalendarView';

interface ClientPaymentScheduleProps {
  clientId: string;
  properties?: any[];
}

interface PaymentSchedule {
  id: string;
  client_id: string;
  property_id?: number | null;
  payment_concept: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  paid_amount?: number;
  payment_method?: string | null;
  payment_reference?: string | null;
  description?: string | null;
  notes?: string | null;
  is_recurring?: boolean;
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly' | null;
  parent_schedule_id?: string | null;
  property?: {
    code: string;
    title: string;
    location: string;
  };
}

interface PaymentSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueCount: number;
  upcomingCount: number;
}

const ClientPaymentSchedule: React.FC<ClientPaymentScheduleProps> = ({ clientId, properties = [] }) => {
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PaymentSchedule | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<PaymentSchedule | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar'); // Modo de vista

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando pagos para cliente:', clientId);
      const [schedulesData, summaryData] = await Promise.all([
        getPaymentSchedulesByClient(clientId),
        getPaymentSummaryByClient(clientId)
      ]);
      console.log('✅ Pagos cargados:', schedulesData.length);
      console.log('📋 Primeros 3:', schedulesData.slice(0, 3));
      setSchedules(schedulesData);
      setSummary(summaryData);
    } catch (error) {
      console.error('❌ Error cargando calendario de pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSchedule(null);
    setShowForm(true);
  };

  const handleEdit = (schedule: PaymentSchedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingSchedule) {
        await updatePaymentSchedule(editingSchedule.id, data);
      } else {
        await createPaymentSchedule({ ...data, client_id: clientId });
      }
      await loadData();
      setShowForm(false);
      setEditingSchedule(null);
    } catch (error) {
      console.error('Error guardando pago:', error);
      alert('Error al guardar el pago');
    }
  };

  const handleMarkAsPaid = async (schedule: PaymentSchedule) => {
    if (!confirm('¿Marcar este pago como completado?')) return;

    try {
      await markPaymentAsCompleted(schedule.id, new Date().toISOString(), 'manual');
      await loadData();
    } catch (error) {
      console.error('Error marcando pago como completado:', error);
      alert('Error al marcar el pago como completado');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este pago programado?')) return;

    try {
      await deletePaymentSchedule(id);
      await loadData();
    } catch (error) {
      console.error('Error eliminando pago:', error);
      alert('Error al eliminar el pago');
    }
  };

  const handleGenerateRecurring = async (schedule: PaymentSchedule) => {
    const months = prompt('¿Cuántos meses generar? (máximo 24)');
    if (!months) return;

    const count = parseInt(months);
    if (isNaN(count) || count < 1 || count > 24) {
      alert('Número inválido. Debe ser entre 1 y 24');
      return;
    }

    try {
      await generateRecurringPayments(schedule.id, count);
      await loadData();
      alert(`${count} pagos recurrentes generados exitosamente`);
    } catch (error) {
      console.error('Error generando pagos recurrentes:', error);
      alert('Error al generar pagos recurrentes');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'partial': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'partial': return 'Parcial';
      case 'overdue': return 'Vencido';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.payment_concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    const matchesYear = new Date(schedule.due_date).getFullYear() === yearFilter;
    return matchesSearch && matchesStatus && matchesYear;
  });

  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de vista */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Calendario de Pagos
        </h3>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Calendario
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Lista
          </button>
        </div>
      </div>

      {/* Resumen */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${summary.totalAmount.toLocaleString()}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Pagado</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${summary.paidAmount.toLocaleString()}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Pendiente</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${summary.pendingAmount.toLocaleString()}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Vencidos</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.overdueCount}
            </div>
            {summary.overdueAmount > 0 && (
              <div className="text-xs text-red-600 mt-1">
                ${summary.overdueAmount.toLocaleString()}
              </div>
            )}
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Próximos 30 días</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.upcomingCount}
            </div>
            {summary.upcomingPayments && summary.upcomingPayments.length > 0 && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {new Date(summary.upcomingPayments[0].due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vista de Calendario */}
      {viewMode === 'calendar' && (
        <PaymentCalendarView
          schedules={schedules}
          onDayClick={(date, payments) => {
            console.log('Día seleccionado:', date, payments);
          }}
          onCreatePayment={() => {
            setEditingSchedule(null);
            setShowForm(true);
          }}
          onViewPayment={(payment) => {
            setSelectedSchedule(payment);
            setShowDetails(true);
          }}
          readOnly={false}
        />
      )}

      {/* Vista de Lista */}
      {viewMode === 'list' && (
        <>
          {/* Header con filtros */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pagos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="paid">Pagados</option>
            <option value="overdue">Vencidos</option>
            <option value="partial">Parciales</option>
            <option value="cancelled">Cancelados</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          >
            {[2023, 2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Pago
        </button>
      </div>

      {/* Lista de pagos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
        {sortedSchedules.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No hay pagos programados</p>
            <button
              onClick={handleCreate}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Crear primer pago
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Fecha Venc.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Concepto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Propiedad
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {sortedSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {new Date(schedule.due_date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {schedule.payment_concept}
                        </span>
                        {schedule.is_recurring && (
                          <span title="Pago recurrente">
                            <RefreshCw className="w-3 h-3 text-blue-600" />
                          </span>
                        )}
                      </div>
                      {schedule.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {schedule.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {schedule.property ? (
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {schedule.property.code}
                          </div>
                          <div className="text-xs">{schedule.property.title}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                      ${schedule.amount.toLocaleString()}
                      {schedule.paid_amount && schedule.paid_amount > 0 && schedule.status === 'partial' && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Pagado: ${schedule.paid_amount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                        {getStatusIcon(schedule.status)}
                        {getStatusLabel(schedule.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setShowDetails(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {schedule.status !== 'paid' && (
                          <>
                            <button
                              onClick={() => handleEdit(schedule)}
                              className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMarkAsPaid(schedule)}
                              className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              title="Marcar como pagado"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {schedule.is_recurring && !schedule.parent_schedule_id && (
                          <button
                            onClick={() => handleGenerateRecurring(schedule)}
                            className="p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded"
                            title="Generar pagos recurrentes"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      <AnimatePresence>
        {showForm && (
          <PaymentScheduleForm
            schedule={editingSchedule}
            clientId={clientId}
            properties={properties}
            onSave={handleSave}
            onClose={() => {
              setShowForm(false);
              setEditingSchedule(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal de detalles */}
      <AnimatePresence>
        {showDetails && selectedSchedule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Detalles del Pago
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Concepto</label>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedSchedule.payment_concept}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Monto</label>
                    <p className="font-medium text-gray-900 dark:text-white">${selectedSchedule.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Fecha de Vencimiento</label>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedSchedule.due_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Estado</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSchedule.status)}`}>
                      {getStatusIcon(selectedSchedule.status)}
                      {getStatusLabel(selectedSchedule.status)}
                    </span>
                  </div>
                </div>

                {selectedSchedule.description && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Descripción</label>
                    <p className="text-gray-900 dark:text-white">{selectedSchedule.description}</p>
                  </div>
                )}

                {selectedSchedule.notes && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Notas Internas</label>
                    <p className="text-gray-900 dark:text-white">{selectedSchedule.notes}</p>
                  </div>
                )}

                {selectedSchedule.payment_method && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Método de Pago</label>
                    <p className="text-gray-900 dark:text-white">{selectedSchedule.payment_method}</p>
                  </div>
                )}

                {selectedSchedule.payment_reference && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Referencia</label>
                    <p className="text-gray-900 dark:text-white">{selectedSchedule.payment_reference}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default ClientPaymentSchedule;
