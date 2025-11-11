import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, DollarSign, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Card from '../UI/Card';
import type { ClientPayment } from '../../types/clientPortal';

interface PaymentCalendarProps {
  payments: ClientPayment[];
}

const PaymentCalendar: React.FC<PaymentCalendarProps> = ({ payments }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPayment, setSelectedPayment] = useState<ClientPayment | null>(null);

  // Obtener mes y año actual
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Nombres de los meses
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Días de la semana
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Obtener primer día del mes (0 = domingo, 1 = lunes, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Obtener último día del mes
  const lastDateOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Obtener último día del mes anterior
  const lastDateOfPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Navegar al mes anterior
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Volver al mes actual
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Obtener color según estado del pago
  const getPaymentStatusColor = (payment: ClientPayment) => {
    switch (payment.status) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'partial':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    }
  };

  // Obtener icono según estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'overdue':
        return AlertCircle;
      case 'partial':
        return DollarSign;
      default:
        return Calendar;
    }
  };

  // Agrupar pagos por fecha
  const paymentsByDate = useMemo(() => {
    const grouped: { [key: string]: ClientPayment[] } = {};
    
    payments.forEach(payment => {
      const dueDate = new Date(payment.due_date);
      // Usar getMonth() y getDate() directamente como números para comparación
      const dateKey = `${dueDate.getFullYear()}-${dueDate.getMonth()}-${dueDate.getDate()}`;
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(payment);
    });
    
    return grouped;
  }, [payments]);

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Días del mes anterior (grises)
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = lastDateOfPrevMonth - i;
      days.push({
        date: day,
        isCurrentMonth: false,
        isPrevMonth: true,
        payments: []
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= lastDateOfMonth; day++) {
      const dateKey = `${currentYear}-${currentMonth}-${day}`;
      const dayPayments = paymentsByDate[dateKey] || [];
      
      days.push({
        date: day,
        isCurrentMonth: true,
        isPrevMonth: false,
        payments: dayPayments
      });
    }
    
    // Días del mes siguiente (para completar la grilla)
    const remainingDays = 42 - days.length; // 6 semanas × 7 días = 42
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        isPrevMonth: false,
        payments: []
      });
    }
    
    return days;
  }, [currentYear, currentMonth, firstDayOfMonth, lastDateOfMonth, lastDateOfPrevMonth, paymentsByDate]);

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Formatear tipo de pago
  const formatPaymentType = (type: string) => {
    const types: { [key: string]: string } = {
      rent: 'Arriendo',
      deposit: 'Depósito',
      administration: 'Administración',
      utilities: 'Servicios',
      late_fee: 'Mora'
    };
    return types[type] || type;
  };

  // Formatear estado
  const formatStatus = (status: string) => {
    const statuses: { [key: string]: string } = {
      paid: 'Pagado',
      pending: 'Pendiente',
      overdue: 'Vencido',
      partial: 'Pago Parcial'
    };
    return statuses[status] || status;
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Calendario de Pagos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {monthNames[currentMonth]} {currentYear}
            </p>
          </div>
        </div>

        {/* Controles de navegación */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Pagado</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Pendiente</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Vencido</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Parcial</span>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grilla del calendario */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const isToday = day.isCurrentMonth && 
                          day.date === new Date().getDate() && 
                          currentMonth === new Date().getMonth() &&
                          currentYear === new Date().getFullYear();

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`
                min-h-[80px] p-2 rounded-lg border-2 transition-all
                ${day.isCurrentMonth 
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                  : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800'}
                ${isToday ? 'ring-2 ring-green-500' : ''}
                ${day.payments.length > 0 ? 'cursor-pointer hover:shadow-md' : ''}
              `}
            >
              {/* Número del día */}
              <div className={`
                text-sm font-medium mb-1
                ${day.isCurrentMonth 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-400 dark:text-gray-600'}
                ${isToday ? 'text-green-600 dark:text-green-400 font-bold' : ''}
              `}>
                {day.date}
              </div>

              {/* Indicadores de pagos */}
              {day.payments.length > 0 && (
                <div className="space-y-1">
                  {day.payments.slice(0, 2).map((payment) => {
                    const StatusIcon = getStatusIcon(payment.status);
                    return (
                      <div
                        key={payment.id}
                        onClick={() => setSelectedPayment(payment)}
                        className={`
                          flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border
                          ${getPaymentStatusColor(payment)}
                          hover:opacity-80 transition-opacity
                        `}
                      >
                        <StatusIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate flex-1">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    );
                  })}
                  {day.payments.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      +{day.payments.length - 2} más
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Modal de detalle del pago */}
      <AnimatePresence>
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPayment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getPaymentStatusColor(selectedPayment)}`}>
                    {React.createElement(getStatusIcon(selectedPayment.status), {
                      className: 'w-5 h-5'
                    })}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Detalle del Pago
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatPaymentType(selectedPayment.payment_type)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                  <span className={`font-medium ${
                    selectedPayment.status === 'paid' ? 'text-green-600 dark:text-green-400' :
                    selectedPayment.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                    selectedPayment.status === 'overdue' ? 'text-red-600 dark:text-red-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`}>
                    {formatStatus(selectedPayment.status)}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>

                {selectedPayment.amount_paid > 0 && selectedPayment.amount_paid < selectedPayment.amount && (
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Pagado:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(selectedPayment.amount_paid)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Fecha de vencimiento:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(selectedPayment.due_date).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {selectedPayment.payment_date && (
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Fecha de pago:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(selectedPayment.payment_date).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {selectedPayment.payment_method && (
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Método de pago:</span>
                    <span className="text-gray-900 dark:text-white capitalize">
                      {selectedPayment.payment_method}
                    </span>
                  </div>
                )}

                {selectedPayment.transaction_reference && (
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Referencia:</span>
                    <span className="text-gray-900 dark:text-white font-mono text-sm">
                      {selectedPayment.transaction_reference}
                    </span>
                  </div>
                )}

                {selectedPayment.late_fee_applied > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Mora aplicada:</span>
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {formatCurrency(selectedPayment.late_fee_applied)}
                    </span>
                  </div>
                )}

                {selectedPayment.notes && (
                  <div className="py-2">
                    <span className="text-gray-600 dark:text-gray-400 block mb-1">Notas:</span>
                    <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                      {selectedPayment.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Botón de cerrar */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default PaymentCalendar;
