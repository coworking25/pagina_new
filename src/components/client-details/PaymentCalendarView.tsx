// =====================================================
// CALENDARIO VISUAL CON MARCADORES DE PAGOS
// Muestra días con pagos en formato calendario mensual
// =====================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  X,
  Plus,
  Eye
} from 'lucide-react';

interface PaymentSchedule {
  id: string;
  client_id: string;
  property_id?: number | null;
  payment_concept: string;
  amount: number;
  due_date: string;
  payment_date?: string | null;
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

interface PaymentCalendarViewProps {
  schedules: PaymentSchedule[];
  onDayClick?: (date: Date, payments: PaymentSchedule[]) => void;
  onCreatePayment?: (date: Date) => void;
  onViewPayment?: (payment: PaymentSchedule) => void;
  readOnly?: boolean;
}

const PaymentCalendarView: React.FC<PaymentCalendarViewProps> = ({
  schedules,
  onDayClick,
  onCreatePayment,
  onViewPayment,
  readOnly = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Debug: Mostrar pagos recibidos
  console.log('📅 PaymentCalendarView - Pagos recibidos:', schedules.length);
  console.log('📅 Primeros 3 pagos:', schedules.slice(0, 3));

  // Obtener días del mes
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  // Obtener pagos de un día específico
  const getPaymentsForDay = (date: Date): PaymentSchedule[] => {
    const filtered = schedules.filter(s => {
      if (!s.due_date) {
        console.log('⚠️ Pago sin due_date:', s);
        return false;
      }
      
      // Normalizar la fecha del pago (puede venir con timezone)
      const dueDateStr = s.due_date.split('T')[0]; // "2025-12-05"
      const [year, month, day] = dueDateStr.split('-').map(Number);
      
      // Comparar año, mes y día
      const matches = (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 && // JavaScript months are 0-indexed
        date.getDate() === day
      );

      if (matches) {
        console.log(`✅ Coincidencia encontrada para ${date.toDateString()}:`, s.payment_concept);
      }
      
      return matches;
    });

    if (filtered.length > 0) {
      console.log(`📅 Día ${date.getDate()}: ${filtered.length} pago(s)`);
    }

    return filtered;
  };

  // Calcular estado del día según pagos
  const getDayStatus = (payments: PaymentSchedule[]) => {
    if (payments.length === 0) return 'none';
    
    const allPaid = payments.every(p => p.status === 'paid');
    const anyOverdue = payments.some(p => p.status === 'overdue');
    const anyPartial = payments.some(p => p.status === 'partial');
    const anyPending = payments.some(p => p.status === 'pending');

    if (allPaid) return 'paid';
    if (anyOverdue) return 'overdue';
    if (anyPartial) return 'partial';
    if (anyPending) return 'pending';
    return 'none';
  };

  // Colores según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500 text-white';
      case 'overdue': return 'bg-red-500 text-white';
      case 'partial': return 'bg-orange-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  // Icono según estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-3 h-3" />;
      case 'overdue': return <AlertCircle className="w-3 h-3" />;
      case 'partial': return <DollarSign className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      default: return null;
    }
  };

  // Calcular días de atraso
  const getDaysOverdue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day);
    const payments = getPaymentsForDay(date);
    setSelectedDate(date);
    onDayClick?.(date, payments);
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Días vacíos antes del primer día
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-1"></div>
      );
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const payments = getPaymentsForDay(date);
      const status = getDayStatus(payments);
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate?.getTime() === date.getTime();
      const isPast = date < today;

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleDayClick(day)}
          className={`
            aspect-square p-1 cursor-pointer rounded-lg transition-all
            ${isToday ? 'ring-2 ring-blue-500' : ''}
            ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}
            ${!isSelected && status === 'none' ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
          `}
        >
          <div className="h-full flex flex-col items-center justify-between">
            {/* Número del día */}
            <span className={`
              text-sm font-medium
              ${isToday ? 'text-blue-600 font-bold' : ''}
              ${isPast && status === 'none' ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}
            `}>
              {day}
            </span>

            {/* Indicadores de pagos */}
            {payments.length > 0 && (
              <div className="w-full space-y-0.5">
                {payments.slice(0, 3).map((payment) => {
                  const daysOverdue = payment.status === 'overdue' ? getDaysOverdue(payment.due_date) : 0;
                  const isPaidLate = payment.payment_date && payment.status === 'paid' ? (() => {
                    const dueDate = new Date(payment.due_date);
                    const paidDate = new Date(payment.payment_date);
                    return Math.floor((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                  })() : 0;
                  
                  return (
                    <div
                      key={payment.id}
                      className={`
                        px-1 py-0.5 rounded text-[10px] font-medium
                        flex items-center justify-between gap-1
                        ${getStatusColor(payment.status)}
                      `}
                      title={`${payment.payment_concept} - $${payment.amount.toLocaleString()}\n${
                        payment.payment_date 
                          ? `Pagado: ${new Date(payment.payment_date).toLocaleDateString('es-ES')}\n${
                              isPaidLate > 0 ? `Con ${isPaidLate} día(s) de retraso` : 
                              isPaidLate < 0 ? `Anticipado ${Math.abs(isPaidLate)} día(s)` : 
                              'A tiempo'
                            }`
                          : `Vence: ${new Date(payment.due_date).toLocaleDateString('es-ES')}`
                      }`}
                    >
                      <span className="truncate flex-1">
                        ${(payment.amount / 1000).toFixed(0)}k
                      </span>
                      {getStatusIcon(payment.status)}
                      {daysOverdue > 0 && (
                        <span className="text-[8px] font-bold">-{daysOverdue}d</span>
                      )}
                      {payment.payment_date && isPaidLate > 0 && (
                        <span className="text-[8px] font-bold">+{isPaidLate}d</span>
                      )}
                    </div>
                  );
                })}
                
                {payments.length > 3 && (
                  <div className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-[10px] text-center">
                    +{payments.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    return days;
  };

  const selectedDayPayments = selectedDate ? getPaymentsForDay(selectedDate) : [];

  return (
    <div className="space-y-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthNames[month]} {year}
          </h3>
        </div>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Leyenda de estados */}
      <div className="flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Pagado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Pendiente</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Parcial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Vencido</span>
        </div>
      </div>

      {/* Grid del calendario */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        {/* Nombres de días */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Modal de detalle del día seleccionado */}
      <AnimatePresence>
        {selectedDate && selectedDayPayments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {selectedDate.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedDayPayments.length} pago(s) programado(s)
                </p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {selectedDayPayments.map(payment => {
                const daysOverdue = payment.status === 'overdue' ? getDaysOverdue(payment.due_date) : 0;
                
                return (
                  <div
                    key={payment.id}
                    className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {payment.payment_concept}
                        </h5>
                        {payment.property && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {payment.property.code} - {payment.property.title}
                          </p>
                        )}
                      </div>
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
                        ${getStatusColor(payment.status)}
                      `}>
                        {getStatusIcon(payment.status)}
                        {payment.status === 'paid' && 'Pagado'}
                        {payment.status === 'pending' && 'Pendiente'}
                        {payment.status === 'partial' && 'Parcial'}
                        {payment.status === 'overdue' && `Vencido (${daysOverdue}d)`}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${payment.amount.toLocaleString()}
                        </p>
                        {payment.status === 'partial' && payment.paid_amount && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Pagado: ${payment.paid_amount.toLocaleString()}
                          </p>
                        )}
                        {payment.payment_date && payment.status === 'paid' && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Pagado el {new Date(payment.payment_date).toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>

                      {onViewPayment && (
                        <button
                          onClick={() => onViewPayment(payment)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalle
                        </button>
                      )}
                    </div>

                    {payment.description && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {payment.description}
                      </p>
                    )}

                    {/* Alerta de pago vencido */}
                    {daysOverdue > 0 && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-700 dark:text-red-400">
                          <p className="font-medium">⚠️ Pago vencido</p>
                          <p>Este pago lleva <span className="font-bold">{daysOverdue} día(s)</span> de retraso</p>
                          <p className="text-xs mt-1">
                            Fecha de vencimiento: {new Date(payment.due_date).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Información de atraso en pago ya realizado */}
                    {payment.payment_date && payment.status === 'paid' && (
                      (() => {
                        const dueDate = new Date(payment.due_date);
                        const paidDate = new Date(payment.payment_date);
                        const diffDays = Math.floor((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                        
                        if (diffDays > 0) {
                          return (
                            <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded flex items-start gap-2">
                              <Clock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-orange-700 dark:text-orange-400">
                                <p className="font-medium">Pagado con retraso</p>
                                <p>Se pagó {diffDays} día(s) después de la fecha de vencimiento</p>
                              </div>
                            </div>
                          );
                        } else if (diffDays < 0) {
                          return (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-blue-700 dark:text-blue-400">
                                <p className="font-medium">✓ Pagado anticipadamente</p>
                                <p>Se pagó {Math.abs(diffDays)} día(s) antes de la fecha de vencimiento</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()
                    )}
                  </div>
                );
              })}

              {!readOnly && onCreatePayment && (
                <button
                  onClick={() => onCreatePayment(selectedDate)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                >
                  <Plus className="w-4 h-4" />
                  Agregar otro pago en esta fecha
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón para agregar pago si no hay día seleccionado */}
      {!readOnly && !selectedDate && onCreatePayment && (
        <button
          onClick={() => onCreatePayment(new Date())}
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600"
        >
          <Plus className="w-4 h-4" />
          Crear nuevo pago
        </button>
      )}
    </div>
  );
};

export default PaymentCalendarView;
