import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { appointmentSyncService } from '../../services/appointmentSyncService';
import Button from '../UI/Button';
import Card from '../UI/Card';
import { getAppointmentTypeText } from '../../utils/translations';

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: any; // Datos combinados de ambas fuentes
}

interface CalendarViewProps {
  advisorId?: string;
  clientId?: string;
  onAppointmentClick?: (appointment: any) => void;
  onDateSelect?: (date: Date) => void;
  height?: number;
  defaultView?: View;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  advisorId,
  clientId,
  onAppointmentClick,
  onDateSelect,
  height = 600,
  defaultView = Views.MONTH,
}) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>(defaultView);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Cargar citas COMBINADAS
  useEffect(() => {
    loadAppointments();
  }, [advisorId, clientId]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // Calcular rango de fechas (últimos 3 meses y próximos 6 meses)
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);

      const filters: any = {};
      if (advisorId) filters.advisor_id = advisorId;
      if (clientId) filters.client_id = clientId;
      filters.start_date = startDate.toISOString();
      filters.end_date = endDate.toISOString();

      // 🔄 Usar servicio de sincronización para obtener TODAS las citas
      const data = await appointmentSyncService.getCombinedAppointments(filters);
      setAppointments(data);
      
      console.log('✅ Citas cargadas en calendario:', {
        total: data.length,
        sources: {
          web: data.filter(a => a.source === 'property_appointment').length,
          calendar: data.filter(a => a.source === 'calendar_appointment').length,
        }
      });
    } catch (error) {
      console.error('Error cargando citas:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Convertir citas a eventos del calendario
  const events: CalendarEvent[] = useMemo(() => {
    return appointments.map(appointment => ({
      id: appointment.id,
      title: appointment.title,
      start: appointment.start,
      end: appointment.end,
      resource: appointment,
    }));
  }, [appointments]);

  // Estilos para los eventos según el tipo, estado Y fuente
  const eventStyleGetter = (event: CalendarEvent) => {
    const appointment = event.resource;
    let backgroundColor = '#3174ad'; // Color por defecto
    let borderColor = '#3174ad';
    let borderStyle = 'solid';

    // Colores según tipo de cita
    switch (appointment.appointment_type) {
      case 'viewing':
        backgroundColor = '#27ae60';
        borderColor = '#27ae60';
        break;
      case 'consultation':
        backgroundColor = '#3498db';
        borderColor = '#3498db';
        break;
      case 'valuation':
        backgroundColor = '#9b59b6';
        borderColor = '#9b59b6';
        break;
      case 'follow_up':
        backgroundColor = '#e67e22';
        borderColor = '#e67e22';
        break;
      case 'meeting':
        backgroundColor = '#95a5a6';
        borderColor = '#95a5a6';
        break;
    }

    // Cambiar estilo según estado
    switch (appointment.status) {
      case 'cancelled':
        backgroundColor = '#e74c3c';
        borderColor = '#e74c3c';
        break;
      case 'completed':
        backgroundColor = '#2ecc71';
        borderColor = '#2ecc71';
        break;
      case 'confirmed':
        // Mantener color original pero más intenso
        break;
    }

    // 🆕 Diferenciador visual: Citas desde la web tienen borde punteado
    if (appointment.source === 'property_appointment') {
      borderStyle = 'dashed';
      borderColor = '#f39c12'; // Naranja para destacar
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderStyle,
        borderWidth: '2px',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        fontSize: '12px',
      },
    };
  };

  // Manejadores de eventos
  const handleEventClick = (event: CalendarEvent) => {
    if (onAppointmentClick) {
      onAppointmentClick(event.resource);
    }
  };

  const handleDateSelect = (slotInfo: any) => {
    if (onDateSelect) {
      onDateSelect(slotInfo.start);
    }
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  // Componente personalizado para mostrar información del evento
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const appointment = event.resource;
    const isFromWeb = appointment.source === 'property_appointment';
    
    return (
      <div className="p-1">
        <div className="font-semibold text-xs truncate flex items-center gap-1">
          {isFromWeb && <span title="Cita desde la web">🌐</span>}
          {appointment.title}
        </div>
        {appointment.contact_name && (
          <div className="text-xs opacity-90 truncate">
            👤 {appointment.contact_name}
          </div>
        )}
        {appointment.property_title && (
          <div className="text-xs opacity-85 truncate">
            🏠 {appointment.property_title}
          </div>
        )}
        {appointment.appointment_type && (
          <div className="text-xs opacity-75">
            📋 {getAppointmentTypeText(appointment.appointment_type)}
          </div>
        )}
      </div>
    );
  };

  // Mensajes en español
  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay citas en este período.',
    showMore: (total: number) => `+ Ver ${total} más`,
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-300">Cargando calendario...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 sm:p-4 bg-white dark:bg-gray-800 shadow-lg">
      {/* Header del Calendario */}
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-lg sm:text-2xl">📅</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              Calendario de Citas
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {appointments.length} cita{appointments.length !== 1 ? 's' : ''} cargada{appointments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            📍 Hoy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAppointments}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            🔄 Actualizar
          </Button>
        </div>
      </div>

      {/* Calendario */}
      <div 
        style={{ height }}
        className="calendar-container bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={currentView}
          onView={handleViewChange}
          date={currentDate}
          onNavigate={handleNavigate}
          onSelectEvent={handleEventClick}
          onSelectSlot={handleDateSelect}
          selectable
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent,
          }}
          messages={messages}
          culture="es"
          popup
          step={60}
          showMultiDayTimes
        />
      </div>

      {/* Leyenda de colores mejorada */}
      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
          <span className="text-base sm:text-lg">🎨</span>
          Leyenda de Tipos y Estados
        </h4>
        
        <div className="space-y-3">
          {/* Tipos de Cita */}
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Tipos de Cita:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 text-xs">
              <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="w-4 h-4 bg-green-500 dark:bg-green-600 rounded shadow-sm"></div>
                <span className="text-gray-700 dark:text-gray-300">Visita</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="w-4 h-4 bg-blue-500 dark:bg-blue-600 rounded shadow-sm"></div>
                <span className="text-gray-700 dark:text-gray-300">Consulta</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="w-4 h-4 bg-purple-500 dark:bg-purple-600 rounded shadow-sm"></div>
                <span className="text-gray-700 dark:text-gray-300">Avalúo</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="w-4 h-4 bg-orange-500 dark:bg-orange-600 rounded shadow-sm"></div>
                <span className="text-gray-700 dark:text-gray-300">Seguimiento</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="w-4 h-4 bg-gray-500 dark:bg-gray-600 rounded shadow-sm"></div>
                <span className="text-gray-700 dark:text-gray-300">Reunión</span>
              </div>
            </div>
          </div>

          {/* Estados */}
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Estados Especiales:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 text-xs">
              <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="w-4 h-4 bg-red-500 dark:bg-red-600 rounded shadow-sm"></div>
                <span className="text-gray-700 dark:text-gray-300">Cancelada</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="w-4 h-4 bg-green-600 dark:bg-green-700 rounded shadow-sm"></div>
                <span className="text-gray-700 dark:text-gray-300">Completada</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="w-4 h-4 border-2 border-dashed border-yellow-500 dark:border-yellow-400 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">🌐 Desde Web</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};