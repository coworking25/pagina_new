import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          type="button"
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isSelected = selectedDate === formatDateForComparison(day.date);
          const isToday = formatDateForComparison(day.date) === formatDateForComparison(new Date());
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(day.date, day.isDisabled)}
              disabled={day.isDisabled}
              className={`
                p-2 text-sm rounded-lg transition-all duration-200 relative
                ${day.isCurrentMonth 
                  ? day.isDisabled
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                }
                ${isSelected 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : ''
                }
                ${isToday && !isSelected 
                  ? 'bg-blue-100 dark:bg-blue-900/30 font-semibold' 
                  : ''
                }
              `}
            >
              {day.date.getDate()}
              {excludeSundays && day.date.getDay() === 0 && day.isCurrentMonth && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <span className="text-xs text-red-600 dark:text-red-400">✕</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
          <span>Hoy</span>
        </div>
        {excludeSundays && (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400" style={{ fontSize: '8px' }}>✕</span>
            </div>
            <span>No disponible</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
