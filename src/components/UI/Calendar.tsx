import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  excludeSundays?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  excludeSundays = true,
  minDate = new Date(),
  maxDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior (grises)
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isDisabled: true
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isDisabled =
        date < minDate ||
        (maxDate && date > maxDate) ||
        (excludeSundays && date.getDay() === 0);

      days.push({
        date,
        isCurrentMonth: true,
        isDisabled
      });
    }

    // Días del siguiente mes (grises)
    const remainingDays = 42 - days.length; // 6 semanas × 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isDisabled: true
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleDateClick = (date: Date, isDisabled: boolean) => {
    if (isDisabled) return;

    const dateString = date.toISOString().split('T')[0];
    onDateSelect(dateString);
  };

  const formatDateForComparison = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDayStatus = (day: any) => {
    const isSelected = selectedDate === formatDateForComparison(day.date);
    const isToday = formatDateForComparison(day.date) === formatDateForComparison(new Date());
    const isHovered = hoveredDate === formatDateForComparison(day.date);

    if (day.isDisabled) return 'disabled';
    if (isSelected) return 'selected';
    if (isHovered) return 'hovered';
    if (isToday) return 'today';
    return 'available';
  };

  const getDayStyles = (day: any) => {
    const status = getDayStatus(day);
    const baseStyles = 'relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center text-sm font-semibold border-2 group';

    switch (status) {
      case 'selected':
        return `${baseStyles} bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 text-white shadow-xl transform scale-110 ring-4 ring-blue-200 dark:ring-blue-800`;
      case 'hovered':
        return `${baseStyles} bg-gradient-to-br from-blue-400 to-blue-500 border-blue-400 text-white shadow-lg transform scale-105`;
      case 'today':
        return `${baseStyles} bg-gradient-to-br from-green-400 to-emerald-500 border-green-400 text-white shadow-lg ring-2 ring-green-300 dark:ring-green-700`;
      case 'disabled':
        return `${baseStyles} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50`;
      case 'available':
      default:
        return `${baseStyles} bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:shadow-lg hover:transform hover:scale-105 hover:border-blue-300 dark:hover:border-blue-500`;
    }
  };

  const getDayIcon = (day: any) => {
    const status = getDayStatus(day);

    if (status === 'today') {
      return <CalendarIcon className="w-4 h-4 absolute -top-1 -right-1 text-green-600" />;
    }

    if (excludeSundays && day.date.getDay() === 0 && day.isCurrentMonth && !day.isDisabled) {
      return <span className="absolute inset-0 flex items-center justify-center text-red-500 font-bold">✕</span>;
    }

    return null;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl"
    >
      {/* Header del calendario */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigateMonth('prev')}
          className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 group"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
        </motion.button>

        <motion.div
          key={`${currentMonth.getMonth()}-${currentMonth.getFullYear()}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {months[currentMonth.getMonth()]}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {currentMonth.getFullYear()}
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1, x: 2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigateMonth('next')}
          className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 group"
        >
          <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
        </motion.button>
      </motion.div>

      {/* Días de la semana */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-7 gap-2 mb-4"
      >
        {weekDays.map((day, index) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 py-3 rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            {day}
          </motion.div>
        ))}
      </motion.div>

      {/* Días del mes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-7 gap-2"
      >
        {days.map((day, index) => {
          const isSelected = selectedDate === formatDateForComparison(day.date);
          const isToday = formatDateForComparison(day.date) === formatDateForComparison(new Date());

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + (index * 0.02) }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => handleDateClick(day.date, day.isDisabled)}
              onMouseEnter={() => setHoveredDate(formatDateForComparison(day.date))}
              onMouseLeave={() => setHoveredDate(null)}
              disabled={day.isDisabled}
              className={getDayStyles(day)}
              title={`${day.date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}${day.isDisabled ? ' (No disponible)' : ''}`}
            >
              {/* Background gradient animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

              <span className="relative z-10 font-bold">
                {day.date.getDate()}
              </span>

              {/* Icon overlay */}
              {getDayIcon(day)}

              {/* Today indicator */}
              {isToday && !isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Enhanced Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs"
      >
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full"></div>
          <span className="text-blue-700 dark:text-blue-300 font-medium">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
          <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full"></div>
          <span className="text-green-700 dark:text-green-300 font-medium">Hoy</span>
        </div>
        {excludeSundays && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
            <span className="text-red-600 dark:text-red-400 font-bold">✕</span>
            <span className="text-red-700 dark:text-red-300 font-medium">No disponible</span>
          </div>
        )}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="w-3 h-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400 font-medium">Otro mes</span>
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 flex justify-center gap-2"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const today = new Date();
            const todayString = formatDateForComparison(today);
            if (today >= minDate && (!maxDate || today <= maxDate) && (!excludeSundays || today.getDay() !== 0)) {
              onDateSelect(todayString);
            }
          }}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Hoy
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Calendar;
