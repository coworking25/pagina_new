import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, Sun, Moon, Zap } from 'lucide-react';
import { format, addMinutes, isBefore, isAfter, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

import { calendarService, AdvisorAvailability, AvailabilityException, Appointment } from '../../lib/calendarService';
import Card from '../UI/Card';

export interface TimeSlot {
  time: string; // HH:MM format
  available: boolean;
  conflict?: boolean;
  reason?: string;
}

export interface TimeSlotSelectorProps {
  selectedDate: Date;
  advisorId?: string;
  selectedTime?: string;
  duration?: number; // in minutes, default 60
  onTimeSelect: (time: string) => void;
  onValidationChange?: (isValid: boolean, message?: string) => void;
  className?: string;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedDate,
  advisorId,
  selectedTime,
  duration = 60,
  onTimeSelect,
  onValidationChange,
  className = '',
}) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  // 🔧 FIX: loadAvailability ahora genera los slots internamente para evitar dependencias circulares
  const loadAvailability = useCallback(async () => {
    // 🔧 FIX: Validar ANTES de ejecutar la función
    if (!advisorId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    setLoading(true);
    try {
      // 🎯 FIX CRÍTICO: Manejar fecha correctamente
      // Crear una fecha local limpia sin problemas de zona horaria
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      const localDate = new Date(year, month, day, 0, 0, 0, 0);
      
      // Determinar día de la semana (0 = Domingo, 6 = Sábado)
      const dayOfWeek = localDate.getDay();
      
      // Obtener fecha de "hoy" en hora local (sin componente de tiempo)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const isToday = localDate.getTime() === today.getTime();
      
      console.log('🗓️ DEBUG TimeSlotSelector:', {
        selectedDateInput: selectedDate,
        year, month, day,
        localDate: localDate.toISOString(),
        localDateString: localDate.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        dayOfWeek: dayOfWeek,
        dayName: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dayOfWeek],
        today: today.toLocaleDateString('es-CO'),
        isToday: isToday,
        currentTime: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
      });
      
      // 🎯 FIX: Generar slots considerando día de la semana y hora actual
      const slots: string[] = [];
      const startHour = 9;
      const interval = 30;
      
      // 🎯 CAMBIO 1: Sábados solo hasta 12:00 PM (mediodía)
      const endHour = dayOfWeek === 6 ? 12 : 17; // Sábado = 6
      
      console.log(`📅 Horario para ${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dayOfWeek]}: ${startHour}:00 - ${endHour}:00`);

      // 🎯 CAMBIO 2: Si es hoy, obtener hora actual
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // 🎯 FILTRO: Si es hoy, solo mostrar horas futuras (con margen de 1 hora)
          if (isToday) {
            const slotMinutesFromMidnight = hour * 60 + minute;
            const currentMinutesFromMidnight = currentHour * 60 + currentMinute;
            const marginMinutes = 60; // Margen de 1 hora después de la hora actual
            
            if (slotMinutesFromMidnight < currentMinutesFromMidnight + marginMinutes) {
              console.log(`⏭️ Saltando slot ${timeString} (ya pasó o muy cercano)`);
              continue;
            }
          }
          
          slots.push(timeString);
        }
      }
      
      console.log(`✅ Generados ${slots.length} slots de tiempo para ${isToday ? 'HOY' : localDate.toLocaleDateString('es-CO')}`);

      // Get advisor weekly availability
      const weeklyAvailability: AdvisorAvailability[] = await calendarService.getAdvisorAvailability(advisorId);

      // Get exceptions for this specific date
      const dateString = format(localDate, 'yyyy-MM-dd');
      const exceptions: AvailabilityException[] = await calendarService.getAvailabilityExceptions(advisorId, dateString, dateString);

      // Get existing appointments for this date to check conflicts
      const existingAppointments: Appointment[] = await calendarService.getAppointments({
        advisor_id: advisorId,
        start_date: dateString,
        end_date: dateString,
      });

      // 🎯 dayOfWeek ya fue declarado arriba para determinar endHour
      // No redeclarar aquí

      // Check if there's an exception for this date
      const exceptionForDate = exceptions.find(exc => exc.exception_date === dateString);

      // Create slots with availability and conflicts
      const slotsWithAvailability = slots.map(timeString => {
        const [hours, minutes] = timeString.split(':').map(Number);
        // 🎯 FIX: Usar localDate para evitar problemas de zona horaria
        const slotStart = new Date(localDate);
        slotStart.setHours(hours, minutes, 0, 0);

        const slotEnd = addMinutes(slotStart, duration);

        let isAvailable = false;
        let conflictReason = '';

        // First check exceptions
        if (exceptionForDate) {
          // Use exception availability
          isAvailable = exceptionForDate.is_available &&
            (exceptionForDate.start_time || '00:00') <= timeString &&
            (exceptionForDate.end_time || '23:59') >= format(slotEnd, 'HH:mm');

          if (!exceptionForDate.is_available) {
            conflictReason = 'Día no disponible (excepción)';
          } else if (!isAvailable) {
            conflictReason = 'Fuera del horario de excepción';
          }
        } else {
          // Use regular weekly availability
          const dayAvailability = weeklyAvailability.find((avail: AdvisorAvailability) => avail.day_of_week === dayOfWeek);
          isAvailable = dayAvailability?.is_available === true &&
            dayAvailability.start_time <= timeString &&
            dayAvailability.end_time >= format(slotEnd, 'HH:mm');

          if (!isAvailable) {
            conflictReason = 'Fuera del horario regular';
          }
        }

        // Check for conflicts with existing appointments
        const hasConflict = existingAppointments.some((appointment: Appointment) => {
          if (appointment.status === 'cancelled') return false;

          const appointmentStart = parseISO(appointment.start_time);
          const appointmentEnd = parseISO(appointment.end_time);

          // Check if this slot overlaps with any existing appointment
          const overlaps = !(
            isBefore(slotEnd, appointmentStart) ||
            isAfter(slotStart, appointmentEnd)
          );

          return overlaps;
        });

        if (hasConflict) {
          conflictReason = 'Conflicto con cita existente';
        }

        return {
          time: timeString,
          available: isAvailable,
          conflict: hasConflict,
          reason: conflictReason,
        };
      });

      setAvailableSlots(slotsWithAvailability);
    } catch (error) {
      console.error('Error loading availability:', error);
      // Fallback: generate default slots
      const slots: string[] = [];
      const startHour = 9;
      const endHour = 17;
      const interval = 30;

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(timeString);
        }
      }
      
      const fallbackSlots = slots.map(time => ({
        time,
        available: true,
        conflict: false,
      }));
      setAvailableSlots(fallbackSlots);
    } finally {
      setLoading(false);
    }
  }, [advisorId, selectedDate, duration]); // 🔧 FIX: Solo dependencias primitivas

  // Load availability and conflicts for the selected date
  useEffect(() => {
    if (selectedDate && advisorId) {
      loadAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, advisorId, duration]); // 🔧 FIX: Usar solo las dependencias primitivas, no loadAvailability
  // Ref para rastrear la última validación y evitar llamadas innecesarias
  const lastValidationRef = useRef<{ time: string | null; isValid: boolean; message?: string } | null>(null);

  // Validate selected time when it changes
  useEffect(() => {
    if (selectedTime && onValidationChange) {
      const selectedSlot = availableSlots.find(slot => slot.time === selectedTime);
      if (selectedSlot) {
        let isValid = false;
        let message: string | undefined = undefined;

        if (selectedSlot.conflict) {
          isValid = false;
          message = selectedSlot.reason || 'Horario no disponible';
        } else if (!selectedSlot.available) {
          isValid = false;
          message = 'Horario fuera del horario de atención';
        } else {
          isValid = true;
        }

        // Solo llamar a onValidationChange si el resultado cambió
        const last = lastValidationRef.current;
        if (!last || last.time !== selectedTime || last.isValid !== isValid || last.message !== message) {
          lastValidationRef.current = { time: selectedTime, isValid, message };
          onValidationChange(isValid, message);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTime, availableSlots]);

  const formatTime12Hour = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getSlotStatus = (slot: TimeSlot) => {
    if (slot.conflict) return 'conflict';
    if (!slot.available) return 'unavailable';
    if (selectedTime === slot.time) return 'selected';
    if (hoveredSlot === slot.time) return 'hovered';
    return 'available';
  };

  const getSlotStyles = (slot: TimeSlot) => {
    const status = getSlotStatus(slot);
    const baseStyles = 'relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer text-center font-semibold text-sm overflow-hidden group';

    switch (status) {
      case 'selected':
        return `${baseStyles} bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 text-white shadow-xl transform scale-105 ring-4 ring-blue-200 dark:ring-blue-800`;
      case 'hovered':
        return `${baseStyles} bg-gradient-to-br from-green-400 to-green-500 border-green-400 text-white shadow-lg transform scale-102`;
      case 'conflict':
        return `${baseStyles} bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 cursor-not-allowed opacity-75`;
      case 'unavailable':
        return `${baseStyles} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60`;
      case 'available':
      default:
        return `${baseStyles} bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:shadow-lg hover:transform hover:scale-102 hover:border-green-400 dark:hover:border-green-600`;
    }
  };

  const getSlotIcon = (slot: TimeSlot) => {
    const status = getSlotStatus(slot);
    const [hours] = slot.time.split(':').map(Number);
    const isMorning = hours < 12;

    switch (status) {
      case 'selected':
        return <CheckCircle className="w-5 h-5 mx-auto mb-2 animate-pulse" />;
      case 'hovered':
        return <Zap className="w-5 h-5 mx-auto mb-2 animate-bounce" />;
      case 'conflict':
        return <XCircle className="w-5 h-5 mx-auto mb-2" />;
      case 'unavailable':
        return <Clock className="w-5 h-5 mx-auto mb-2 opacity-50" />;
      case 'available':
      default:
        return isMorning ?
          <Sun className="w-5 h-5 mx-auto mb-2 text-yellow-500" /> :
          <Moon className="w-5 h-5 mx-auto mb-2 text-indigo-500" />;
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available && !slot.conflict) {
      onTimeSelect(slot.time);
    }
  };

  // 🔧 FIX: Mover useMemo ANTES del return condicional (regla de hooks)
  // Group slots by morning/afternoon
  const groupedSlots = useMemo(() => {
    const morning = availableSlots.filter(slot => {
      const [hours] = slot.time.split(':').map(Number);
      return hours < 12;
    });
    const afternoon = availableSlots.filter(slot => {
      const [hours] = slot.time.split(':').map(Number);
      return hours >= 12;
    });
    return { morning, afternoon };
  }, [availableSlots]);

  // 🔧 FIX: Return condicional DESPUÉS de todos los hooks
  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600 dark:text-gray-400 font-medium"
          >
            Cargando horarios disponibles...
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-1 bg-blue-200 dark:bg-blue-800 rounded-full mt-4 max-w-xs"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-600" />
          Horarios Disponibles
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
          {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </motion.div>

      {/* Enhanced Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6 flex flex-wrap gap-3 text-xs"
      >
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
          <Sun className="w-4 h-4 text-yellow-500" />
          <span className="text-green-700 dark:text-green-300 font-medium">Mañana</span>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <Moon className="w-4 h-4 text-indigo-500" />
          <span className="text-indigo-700 dark:text-indigo-300 font-medium">Tarde</span>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
          <CheckCircle className="w-4 h-4 text-blue-500" />
          <span className="text-blue-700 dark:text-blue-300 font-medium">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-700 dark:text-red-300 font-medium">Ocupado</span>
        </div>
      </motion.div>

      {/* Morning Slots */}
      <AnimatePresence>
        {groupedSlots.morning.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-5 h-5 text-yellow-500" />
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Horarios de Mañana</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupedSlots.morning.map((slot, index) => (
                <motion.div
                  key={slot.time}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={getSlotStyles(slot)}
                  onClick={() => handleSlotClick(slot)}
                  onMouseEnter={() => setHoveredSlot(slot.time)}
                  onMouseLeave={() => setHoveredSlot(null)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title={slot.reason || formatTime12Hour(slot.time)}
                >
                  {/* Background gradient animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    {getSlotIcon(slot)}
                    <div className="font-bold text-sm mb-1">
                      {formatTime12Hour(slot.time)}
                    </div>
                    {slot.conflict && (
                      <div className="text-xs opacity-75 flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Ocupado</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Afternoon Slots */}
      <AnimatePresence>
        {groupedSlots.afternoon.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Moon className="w-5 h-5 text-indigo-500" />
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Horarios de Tarde</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupedSlots.afternoon.map((slot, index) => (
                <motion.div
                  key={slot.time}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (groupedSlots.morning.length * 0.05) + (index * 0.05) }}
                  className={getSlotStyles(slot)}
                  onClick={() => handleSlotClick(slot)}
                  onMouseEnter={() => setHoveredSlot(slot.time)}
                  onMouseLeave={() => setHoveredSlot(null)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title={slot.reason || formatTime12Hour(slot.time)}
                >
                  {/* Background gradient animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    {getSlotIcon(slot)}
                    <div className="font-bold text-sm mb-1">
                      {formatTime12Hour(slot.time)}
                    </div>
                    {slot.conflict && (
                      <div className="text-xs opacity-75 flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Ocupado</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected time info */}
      <AnimatePresence>
        {selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <CheckCircle className="w-5 h-5" />
              </motion.div>
              <div>
                <span className="font-bold text-lg">
                  Horario seleccionado: {formatTime12Hour(selectedTime)}
                </span>
                <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Duración: {duration} minutos • {duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : `${duration}m`}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No slots available message */}
      {availableSlots.length > 0 && availableSlots.every(slot => !slot.available || slot.conflict) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
        >
          <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="w-5 h-5" />
            </motion.div>
            <div>
              <span className="font-bold">No hay horarios disponibles</span>
              <div className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                El asesor no tiene horarios disponibles para esta fecha. Intenta con otra fecha.
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
};