import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  MessageCircle
} from 'lucide-react';
import { getAllPropertyAppointments, updateAppointmentStatus, deleteAppointment, updateAppointment, getAdvisors, getProperties, sendWhatsAppConfirmationToAdvisor, savePropertyAppointmentSimple, sendWhatsAppToClient } from '../lib/supabase';
import AppointmentDetailsModal from '../components/Modals/AppointmentDetailsModal';
import EditAppointmentModal from '../components/Modals/EditAppointmentModal';
import CreateAppointmentModal from '../components/Modals/CreateAppointmentModal';
import { PropertyAppointment, Advisor, Property } from '../types';

function AdminAppointments() {
  const [appointments, setAppointments] = useState<PropertyAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Estados para modales
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<PropertyAppointment | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{appointmentId: string, status: string} | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [rescheduledDate, setRescheduledDate] = useState('');
  const [rescheduledTime, setRescheduledTime] = useState('');
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [additionalDataLoading, setAdditionalDataLoading] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      console.log('📅 Cargando citas desde Supabase...');

      const appointmentsData = await getAllPropertyAppointments();
      console.log('✅ Citas obtenidas:', appointmentsData);

      setAppointments(appointmentsData);
      setLoading(false);

      // Cargar asesores y propiedades para los modales
      setAdditionalDataLoading(true);
      console.log('🔄 Iniciando carga de datos adicionales...');
      try {
        console.log('🔄 Cargando asesores y propiedades...');
        const [advisorsData, propertiesData] = await Promise.all([
          getAdvisors(),
          getProperties()
        ]);
        console.log('✅ Datos obtenidos de las funciones:', {
          advisorsData: advisorsData?.length || 0,
          propertiesData: propertiesData?.length || 0
        });
        setAdvisors(advisorsData || []);
        setProperties(propertiesData || []);
        console.log('✅ Estados actualizados:', {
          advisorsCount: advisorsData?.length || 0,
          propertiesCount: propertiesData?.length || 0,
          firstProperty: propertiesData?.[0],
          firstAdvisor: advisorsData?.[0],
          propertyIds: propertiesData?.map(p => ({ id: p.id, title: p.title })),
          advisorIds: advisorsData?.map(a => ({ id: a.id, name: a.name }))
        });
      } catch (error) {
        console.error('❌ Error cargando asesores y propiedades:', error);
        setAdvisors([]);
        setProperties([]);
        // Mostrar alerta al usuario
        alert('Advertencia: No se pudieron cargar los datos de asesores y propiedades. Los detalles de citas pueden mostrar información limitada.');
      } finally {
        console.log('🔄 Finalizando carga de datos adicionales, additionalDataLoading = false');
        setAdditionalDataLoading(false);
      }
    } catch (error) {
      console.error('❌ Error cargando citas:', error);
      setAppointments([]);
      setLoading(false);
    }
  };

  // Funciones para manejar modales
  const handleViewDetails = (appointment: PropertyAppointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleEditAppointment = (appointment: PropertyAppointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteAppointment(appointmentId);
      alert('Cita eliminada exitosamente');
      loadAppointments(); // Recargar la lista
    } catch (error) {
      console.error('Error eliminando cita:', error);
      alert('Error al eliminar la cita. Por favor, inténtalo de nuevo.');
    }
  };

  const handleStatusChange = async (appointmentId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled') => {
    // Para estados que requieren explicación, mostrar modal de confirmación
    if (status === 'no_show' || status === 'rescheduled' || status === 'cancelled') {
      setPendingStatusChange({ appointmentId, status });
      setShowStatusModal(true);
      return;
    }

    // Para estados simples, cambiar directamente
    try {
      await updateAppointmentStatus(appointmentId, status);

      // Si se confirma la cita, enviar notificación al asesor
      if (status === 'confirmed') {
        console.log('🔍 Buscando cita con ID:', appointmentId);
        const appointment = appointments.find(a => a.id === appointmentId);
        console.log('📅 Cita encontrada:', appointment);

        if (appointment) {
          console.log('👨 Buscando asesor con ID:', appointment.advisor_id);
          const advisor = advisors.find(a => a.id === appointment.advisor_id);
          console.log('🎯 Asesor encontrado:', advisor);

          console.log('🏠 Buscando propiedad con ID:', appointment.property_id, 'tipo:', typeof appointment.property_id);
          console.log('📋 Propiedades disponibles:', properties.map(p => ({ id: p.id, title: p.title })));
          const property = properties.find(p => p.id === appointment.property_id);
          console.log('🏠 Propiedad encontrada:', property);

          if (advisor && (advisor.phone?.trim() || advisor.whatsapp?.trim())) {
            const phoneNumber = advisor.phone?.trim() || advisor.whatsapp?.trim();
            console.log('📱 Enviando WhatsApp al asesor:', phoneNumber);
            console.log('👤 Datos del asesor:', {
              name: advisor.name,
              phone: advisor.phone,
              whatsapp: advisor.whatsapp,
              hasPhone: !!advisor.phone?.trim(),
              hasWhatsapp: !!advisor.whatsapp?.trim()
            });
            try {
              sendWhatsAppConfirmationToAdvisor(phoneNumber!, {
                client_name: appointment.client_name,
                appointment_date: appointment.appointment_date,
                appointment_type: appointment.appointment_type,
                property_title: property?.title,
                advisor_name: advisor.name,
                client_phone: appointment.client_phone,
                client_email: appointment.client_email
              });
              console.log('✅ WhatsApp enviado exitosamente');
            } catch (whatsappError) {
              console.warn('❌ Error enviando notificación de confirmación al asesor:', whatsappError);
            }
          } else {
            console.warn('⚠️ Asesor sin teléfono configurado:', {
              advisor: advisor?.name,
              phone: advisor?.phone,
              whatsapp: advisor?.whatsapp,
              hasPhone: !!advisor?.phone?.trim(),
              hasWhatsapp: !!advisor?.whatsapp?.trim()
            });
          }
        } else {
          console.warn('⚠️ Cita no encontrada para ID:', appointmentId);
        }
      }

      const statusMessages = {
        confirmed: 'confirmada',
        completed: 'completada',
        pending: 'actualizada'
      };
      alert(`Cita ${statusMessages[status] || 'actualizada'} exitosamente`);
      loadAppointments(); // Recargar la lista
    } catch (error) {
      console.error('Error cambiando estado de cita:', error);
      alert('Error al cambiar el estado de la cita. Por favor, inténtalo de nuevo.');
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    try {
      // Actualizar el estado
      await updateAppointmentStatus(pendingStatusChange.appointmentId, pendingStatusChange.status as any);

      // Si es reprogramación, actualizar la fecha
      if (pendingStatusChange.status === 'rescheduled' && rescheduledDate && rescheduledTime) {
        const newDateTime = new Date(`${rescheduledDate}T${rescheduledTime}`);
        await updateAppointment(pendingStatusChange.appointmentId, {
          appointment_date: newDateTime.toISOString(),
          rescheduled_date: newDateTime.toISOString()
        });
      }

      // Si hay notas, actualizar la cita con las notas de seguimiento
      if (statusNotes.trim()) {
        await updateAppointment(pendingStatusChange.appointmentId, {
          follow_up_notes: statusNotes.trim()
        });
      }

      const statusMessages = {
        cancelled: 'cancelada',
        no_show: 'marcada como no asistió',
        rescheduled: 'reprogramada'
      };

      alert(`Cita ${statusMessages[pendingStatusChange.status as keyof typeof statusMessages] || 'actualizada'} exitosamente`);
      loadAppointments(); // Recargar la lista

      // Limpiar estado
      setShowStatusModal(false);
      setPendingStatusChange(null);
      setStatusNotes('');
      setRescheduledDate('');
      setRescheduledTime('');
    } catch (error) {
      console.error('Error cambiando estado de cita:', error);
      alert('Error al cambiar el estado de la cita. Por favor, inténtalo de nuevo.');
    }
  };

  const handleSendConfirmation = async (appointment: PropertyAppointment) => {
    try {
      // Verificar que los datos adicionales estén cargados
      if (additionalDataLoading) {
        alert('Cargando datos adicionales, por favor espera un momento...');
        return;
      }

      if (properties.length === 0) {
        alert('No se pudieron cargar las propiedades. Inténtalo de nuevo.');
        return;
      }

      console.log('🔍 Enviando confirmación para cita:', {
        appointment_id: appointment.id,
        property_id: appointment.property_id,
        property_id_type: typeof appointment.property_id,
        client_phone: appointment.client_phone
      });

      // Buscar la propiedad y asesor para el mensaje
      const property = appointment.property_id ? properties.find(p => p.id === appointment.property_id) : null;
      const advisor = advisors.find(a => {
        if (!appointment.advisor_id) return false;
        return a.id === appointment.advisor_id;
      });

      console.log('🎯 Enviando confirmación:', {
        cita_id: appointment.id,
        property_id: appointment.property_id,
        property_encontrada: !!property,
        property_title: property?.title,
        advisor_encontrado: !!advisor,
        advisor_name: advisor?.name
      });

      if (!property) {
        alert(`No se pudo encontrar la propiedad con ID ${appointment.property_id}. Verifica que la propiedad existe.`);
        return;
      }

      if (!appointment.client_phone) {
        alert('El cliente no tiene teléfono registrado');
        return;
      }

      if (!appointment.property_id) {
        alert('La cita no tiene una propiedad asignada. No se puede enviar el mensaje de confirmación.');
        return;
      }

      await sendWhatsAppToClient(appointment.client_phone, {
        client_name: appointment.client_name,
        appointment_date: appointment.appointment_date,
        appointment_type: appointment.appointment_type,
        property_title: property?.title,
        advisor_name: advisor?.name,
        appointment_id: appointment.id || 'pendiente'
      });

      alert('Mensaje de confirmación enviado exitosamente al cliente');
    } catch (error) {
      console.error('Error enviando confirmación:', error);
      alert('Error al enviar el mensaje de confirmación');
    }
  };

  const handleSaveAppointment = async (appointmentData: Partial<PropertyAppointment>) => {
    try {
      if (selectedAppointment?.id) {
        await updateAppointment(selectedAppointment.id, appointmentData);
        alert('Cita actualizada exitosamente');
      }
      loadAppointments(); // Recargar la lista
    } catch (error) {
      console.error('Error guardando cita:', error);
      alert('Error al guardar la cita. Por favor, inténtalo de nuevo.');
      throw error; // Re-throw para que el modal maneje el error
    }
  };

  const handleCreateAppointment = async (appointmentData: Partial<PropertyAppointment>) => {
    try {
      // Convertir los datos al formato esperado por savePropertyAppointmentSimple
      const formattedData = {
        client_name: appointmentData.client_name!,
        client_email: appointmentData.client_email!,
        client_phone: appointmentData.client_phone,
        property_id: appointmentData.property_id!,
        advisor_id: appointmentData.advisor_id!,
        appointment_date: appointmentData.appointment_date!,
        appointment_type: appointmentData.appointment_type!,
        visit_type: appointmentData.visit_type!,
        attendees: appointmentData.attendees!,
        special_requests: appointmentData.special_requests,
        contact_method: appointmentData.contact_method!,
        marketing_consent: appointmentData.marketing_consent!
      };

      // Crear la cita
      const createdAppointment = await savePropertyAppointmentSimple(formattedData);
      console.log('✅ Cita creada:', createdAppointment);

      // Enviar WhatsApp al cliente para confirmación
      if (appointmentData.client_phone) {
        console.log('📱 Enviando WhatsApp al cliente:', appointmentData.client_phone);
        console.log('🔍 Datos del formulario:', {
          property_id: appointmentData.property_id,
          property_id_type: typeof appointmentData.property_id,
          advisor_id: appointmentData.advisor_id,
          properties_count: properties.length,
          advisors_count: advisors.length
        });

        // Buscar información de la propiedad y asesor para el mensaje
        const property = properties.find(p => {
          const pId = String(p.id);
          const formId = String(appointmentData.property_id);
          const match = pId === formId;
          console.log('🔍 Comparando propiedad:', { pId, formId, match, title: p.title });
          return match;
        });
        const advisor = advisors.find(a => a.id === appointmentData.advisor_id!);

        console.log('🎯 Resultados de búsqueda:', {
          property_found: !!property,
          property_title: property?.title,
          advisor_found: !!advisor,
          advisor_name: advisor?.name
        });

        try {
          sendWhatsAppToClient(appointmentData.client_phone, {
            client_name: appointmentData.client_name!,
            appointment_date: appointmentData.appointment_date!,
            appointment_type: appointmentData.appointment_type!,
            property_title: property?.title,
            advisor_name: advisor?.name,
            appointment_id: createdAppointment?.id || 'pendiente'
          });
          console.log('✅ WhatsApp enviado al cliente exitosamente');
        } catch (whatsappError) {
          console.warn('❌ Error enviando WhatsApp al cliente:', whatsappError);
          // No fallar la creación de la cita por error en WhatsApp
        }
      } else {
        console.warn('⚠️ Cliente sin teléfono configurado, no se puede enviar WhatsApp');
      }

      alert('Cita creada exitosamente');
      setShowCreateModal(false);
      loadAppointments(); // Recargar la lista
    } catch (error) {
      console.error('Error creando cita:', error);
      alert('Error al crear la cita. Por favor, inténtalo de nuevo.');
      throw error; // Re-throw para que el modal maneje el error
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'no_show': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'rescheduled': return <AlertCircle className="w-5 h-5 text-purple-500" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'no_show': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'rescheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'no_show': return 'No Asistió';
      case 'rescheduled': return 'Reprogramado';
      default: return 'Pendiente';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.client_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Citas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra todas las citas agendadas por los clientes
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Cita
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="completed">Completado</option>
              <option value="no_show">No Asistió</option>
              <option value="rescheduled">Reprogramado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Appointments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAppointments.map((appointment, index) => (
                <motion.tr
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {appointment.client_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {appointment.client_email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {appointment.client_phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(appointment.appointment_date)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {appointment.appointment_type}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {appointment.visit_type}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(appointment.status || 'pending')}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status || 'pending')}`}>
                        {getStatusText(appointment.status || 'pending')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewDetails(appointment)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditAppointment(appointment)}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Editar cita"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => appointment.id && handleDeleteAppointment(appointment.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Eliminar cita"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                      {(appointment.status === 'pending' || !appointment.status) && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSendConfirmation(appointment)}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Enviar confirmación por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => appointment.id && handleStatusChange(appointment.id, 'confirmed')}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Confirmar cita"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay citas encontradas
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron citas que coincidan con los filtros aplicados.
            </p>
          </div>
        )}
      </motion.div>

      {/* Modales */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onEdit={() => {
          setShowDetailsModal(false);
          setShowEditModal(true);
        }}
        onDelete={() => {
          if (selectedAppointment?.id) {
            handleDeleteAppointment(selectedAppointment.id);
          }
        }}
        onStatusChange={(status) => {
          if (selectedAppointment?.id) {
            handleStatusChange(selectedAppointment.id, status);
          }
        }}
        advisors={advisors}
        properties={properties}
        isLoadingAdditionalData={additionalDataLoading}
      />

      <EditAppointmentModal
        appointment={selectedAppointment}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveAppointment}
        advisors={advisors}
        properties={properties}
      />

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateAppointment}
          properties={properties}
          advisors={advisors}
        />
      )}

      {/* Status Change Confirmation Modal */}
      {showStatusModal && pendingStatusChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmar cambio de estado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              ¿Estás seguro de marcar esta cita como {
                pendingStatusChange.status === 'no_show' ? 'cliente no asistió' :
                pendingStatusChange.status === 'rescheduled' ? 'reprogramada' :
                pendingStatusChange.status === 'cancelled' ? 'cancelada' : 'cambiada'
              }?
              {pendingStatusChange.status === 'rescheduled' && (
                <span className="block mt-2 text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ Debes seleccionar la nueva fecha y hora para reprogramar la cita.
                </span>
              )}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notas de seguimiento (opcional)
              </label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Agregue cualquier nota adicional sobre este cambio..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Campos adicionales para reprogramación */}
            {pendingStatusChange?.status === 'rescheduled' && (
              <div className="mb-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nueva fecha de la cita *
                  </label>
                  <input
                    type="date"
                    value={rescheduledDate}
                    onChange={(e) => setRescheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nueva hora de la cita *
                  </label>
                  <input
                    type="time"
                    value={rescheduledTime}
                    onChange={(e) => setRescheduledTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setPendingStatusChange(null);
                  setStatusNotes('');
                  setRescheduledDate('');
                  setRescheduledTime('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={pendingStatusChange?.status === 'rescheduled' && (!rescheduledDate || !rescheduledTime)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAppointments;
