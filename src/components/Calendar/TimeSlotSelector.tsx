import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format, addMinutes, isBefore, isAfter, parseISO, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

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

  // Generate time slots from 8:00 AM to 6:00 PM in 30-minute intervals
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const startHour = 8; // 8:00 AM
    const endHour = 18; // 6:00 PM
    const interval = 30; // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }

    return slots;
  }, []);

  const loadAvailability = useCallback(async () => {
    if (!advisorId || !selectedDate) return;

    setLoading(true);
    try {
      // Get advisor weekly availability
      const weeklyAvailability: AdvisorAvailability[] = await calendarService.getAdvisorAvailability(advisorId);

      // Get exceptions for this specific date
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const exceptions: AvailabilityException[] = await calendarService.getAvailabilityExceptions(advisorId, dateString, dateString);

      // Get existing appointments for this date to check conflicts
      const existingAppointments: Appointment[] = await calendarService.getAppointments({
        advisor_id: advisorId,
        start_date: dateString,
        end_date: dateString,
      });

      // Determine day of week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = getDay(selectedDate);

      // Check if there's an exception for this date
      const exceptionForDate = exceptions.find(exc => exc.exception_date === dateString);

      // Create slots with availability and conflicts
      const slotsWithAvailability = timeSlots.map(timeString => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const slotStart = new Date(selectedDate);
        slotStart.setHours(hours, minutes, 0, 0);

        const slotEnd = addMinutes(slotStart, duration);

        let isAvailable = false;
        let conflictReason = '';

        // First check exceptions
        if (exceptionForDate) {
          // Use exception availability
          isAvailable = exceptionForDate.is_available &&
            exceptionForDate.start_time <= timeString &&
            exceptionForDate.end_time >= format(slotEnd, 'HH:mm');

          if (!exceptionForDate.is_available) {
            conflictReason = 'Día no disponible (excepción)';
          } else if (!isAvailable) {
            conflictReason = 'Fuera del horario de excepción';
          }
        } else {
          // Use regular weekly availability
          const dayAvailability = weeklyAvailability.find((avail: AdvisorAvailability) => avail.day_of_week === dayOfWeek);
          isAvailable = dayAvailability?.is_available &&
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
      // Fallback: mark all slots as available if there's an error
      const fallbackSlots = timeSlots.map(time => ({
        time,
        available: true,
        conflict: false,
      }));
      setAvailableSlots(fallbackSlots);
    } finally {
      setLoading(false);
    }
  }, [advisorId, selectedDate, timeSlots, duration]);

  // Load availability and conflicts for the selected date
  useEffect(() => {
    if (selectedDate && advisorId) {
      loadAvailability();
    }
  }, [selectedDate, advisorId, loadAvailability]);

  // Validate selected time when it changes
  useEffect(() => {
    if (selectedTime && onValidationChange) {
      const selectedSlot = availableSlots.find(slot => slot.time === selectedTime);
      if (selectedSlot) {
        if (selectedSlot.conflict) {
          onValidationChange(false, selectedSlot.reason || 'Horario no disponible');
        } else if (!selectedSlot.available) {
          onValidationChange(false, 'Horario fuera del horario de atención');
        } else {
          onValidationChange(true);
        }
      }
    }
  }, [selectedTime, availableSlots, onValidationChange]);

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
    return 'available';
  };

  const getSlotStyles = (slot: TimeSlot) => {
    const status = getSlotStatus(slot);
    const baseStyles = 'p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer text-center font-medium text-sm';

    switch (status) {
      case 'selected':
        return `${baseStyles} bg-blue-600 border-blue-600 text-white shadow-lg transform scale-105`;
      case 'conflict':
        return `${baseStyles} bg-red-50 border-red-300 text-red-700 cursor-not-allowed opacity-60`;
      case 'unavailable':
        return `${baseStyles} bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed opacity-60`;
      case 'available':
      default:
        return `${baseStyles} bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400 hover:shadow-md`;
    }
  };

  const getSlotIcon = (slot: TimeSlot) => {
    const status = getSlotStatus(slot);

    switch (status) {
      case 'selected':
        return <CheckCircle className="w-4 h-4 mx-auto mb-1" />;
      case 'conflict':
        return <XCircle className="w-4 h-4 mx-auto mb-1" />;
      case 'unavailable':
        return <Clock className="w-4 h-4 mx-auto mb-1 opacity-50" />;
      case 'available':
      default:
        return <Clock className="w-4 h-4 mx-auto mb-1" />;
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available && !slot.conflict) {
      onTimeSelect(slot.time);
    }
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando horarios disponibles...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Horarios Disponibles
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 border-2 border-green-300 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-600 border-2 border-blue-600 rounded"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-50 border-2 border-red-300 rounded"></div>
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-50 border-2 border-gray-300 rounded"></div>
          <span>No disponible</span>
        </div>
      </div>

      {/* Time slots grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {availableSlots.map((slot) => (
          <div
            key={slot.time}
            className={getSlotStyles(slot)}
            onClick={() => handleSlotClick(slot)}
            title={slot.reason || formatTime12Hour(slot.time)}
          >
            {getSlotIcon(slot)}
            <div className="text-xs font-semibold">
              {formatTime12Hour(slot.time)}
            </div>
            {slot.conflict && (
              <div className="text-xs mt-1 opacity-75">
                <AlertTriangle className="w-3 h-3 mx-auto" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected time info */}
      {selectedTime && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">
              Horario seleccionado: {formatTime12Hour(selectedTime)}
            </span>
          </div>
          <div className="text-sm text-blue-600 mt-1">
            Duración: {duration} minutos
          </div>
        </div>
      )}

      {/* No slots available message */}
      {availableSlots.length > 0 && availableSlots.every(slot => !slot.available || slot.conflict) && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">No hay horarios disponibles</span>
          </div>
          <div className="text-sm text-amber-600 mt-1">
            El asesor no tiene horarios disponibles para esta fecha.
          </div>
        </div>
      )}
    </Card>
  );
};