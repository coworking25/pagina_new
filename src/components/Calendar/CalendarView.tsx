import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { calendarService, Appointment } from '../../lib/calendarService';
import Button from '../UI/Button';
import Card from '../UI/Card';

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
  resource: Appointment;
}

interface CalendarViewProps {
  advisorId?: string;
  clientId?: string;
  onAppointmentClick?: (appointment: Appointment) => void;
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>(defaultView);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Cargar citas
  useEffect(() => {
    loadAppointments();
  }, [advisorId, clientId]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (advisorId) filters.advisor_id = advisorId;
      if (clientId) filters.client_id = clientId;

      // Cargar citas de los últimos 3 meses y próximos 6 meses
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);

      filters.start_date = startDate.toISOString();
      filters.end_date = endDate.toISOString();

      const data = await calendarService.getAppointments(filters);
      setAppointments(data);
    } catch (error) {
      console.error('Error cargando citas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convertir citas a eventos del calendario
  const events: CalendarEvent[] = useMemo(() => {
    return appointments.map(appointment => ({
      id: appointment.id,
      title: appointment.title,
      start: new Date(appointment.start_time),
      end: new Date(appointment.end_time),
      resource: appointment,
    }));
  }, [appointments]);

  // Estilos para los eventos según el tipo y estado
  const eventStyleGetter = (event: CalendarEvent) => {
    const appointment = event.resource;
    let backgroundColor = '#3174ad'; // Color por defecto
    let borderColor = '#3174ad';

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

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '1px solid',
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
    return (
      <div className="p-1">
        <div className="font-semibold text-xs truncate">
          {appointment.title}
        </div>
        {appointment.contact_name && (
          <div className="text-xs opacity-90 truncate">
            {appointment.contact_name}
          </div>
        )}
        {appointment.appointment_type && (
          <div className="text-xs opacity-75 capitalize">
            {appointment.appointment_type}
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando calendario...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          📅 Calendario de Citas
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAppointments}
          >
            Actualizar
          </Button>
        </div>
      </div>

      <div style={{ height }}>
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

      {/* Leyenda de colores */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Leyenda:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Visita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Consulta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Avalúo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Seguimiento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Reunión</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Cancelada</span>
          </div>
        </div>
      </div>
    </Card>
  );
};