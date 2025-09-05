import React from 'react';
import { Clock } from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotSelectorProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  availableSlots?: string[];
  disabled?: boolean;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedTime,
  onTimeSelect,
  availableSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ],
  disabled = false
}) => {
  const timeSlots: TimeSlot[] = availableSlots.map(time => ({
    time,
    available: true
  }));

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 < 12 ? 'AM' : 'PM';
    return `${hour12}:${minutes} ${period}`;
  };

  if (disabled) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">
          Selecciona una fecha para ver horarios disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
        <Clock className="w-5 h-5" />
        <span className="font-medium">Horarios disponibles</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {timeSlots.map((slot) => (
          <button
            key={slot.time}
            type="button"
            onClick={() => onTimeSelect(slot.time)}
            disabled={!slot.available}
            className={`
              px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200
              ${selectedTime === slot.time
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                : slot.available
                  ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <div className="text-center">
              <div className="font-semibold">{formatTime(slot.time)}</div>
              {!slot.available && (
                <div className="text-xs mt-1 text-red-500">No disponible</div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {selectedTime && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              Horario seleccionado: {formatTime(selectedTime)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;
