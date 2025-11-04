import React, { useState } from 'react';
import { CalendarView } from '../components/Calendar/CalendarView';
import { AppointmentModal } from '../components/Calendar/AppointmentModal';
import CalendarAppointmentDetailsModal from '../components/Calendar/CalendarAppointmentDetailsModal';
import { AvailabilityManager } from '../components/Calendar/AvailabilityManager';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import { Calendar, Settings, Plus, Users, Clock, UserCheck } from 'lucide-react';
import { deleteAppointment } from '../lib/supabase';

interface AdminCalendarPageProps {
  userId?: string;
}

export const AdminCalendarPage: React.FC<AdminCalendarPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'availability' | 'settings'>('calendar');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setShowAppointmentModal(true);
  };

  // 👁️ Clic en evento del calendario - Mostrar detalles
  const handleViewAppointmentDetails = (appointment: any) => {
    console.log('📅 Mostrando detalles de cita:', appointment);
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  // ✏️ Editar desde el modal de detalles
  const handleEditFromDetails = () => {
    console.log('✏️ Abriendo modal de edición desde detalles');
    setShowDetailsModal(false);
    setShowAppointmentModal(true);
    // selectedAppointment ya está establecido
  };

  // 🗑️ Eliminar desde el modal de detalles
  const handleDeleteFromDetails = async () => {
    if (!selectedAppointment) return;
    
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar esta cita?');
    if (!confirmed) return;

    try {
      console.log('🗑️ Eliminando cita:', selectedAppointment.id);
      await deleteAppointment(selectedAppointment.id);
      
      setShowDetailsModal(false);
      setSelectedAppointment(null);
      setRefreshKey(prev => prev + 1); // Refresh calendar
      
      alert('✅ Cita eliminada correctamente');
    } catch (error) {
      console.error('❌ Error al eliminar cita:', error);
      alert('Error al eliminar la cita. Por favor intenta de nuevo.');
    }
  };

  const handleAppointmentSaved = () => {
    setShowAppointmentModal(false);
    setSelectedAppointment(null);
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  const tabs = [
    {
      id: 'calendar' as const,
      label: 'Calendario',
      icon: Calendar,
      description: 'Vista general del calendario y citas'
    },
    {
      id: 'availability' as const,
      label: 'Disponibilidad',
      icon: UserCheck,
      description: 'Gestionar horarios de asesores'
    },
    {
      id: 'settings' as const,
      label: 'Configuración',
      icon: Settings,
      description: 'Configuración general del calendario y notificaciones'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                Sistema de Calendario Avanzado
              </h1>
              <p className="mt-2 text-gray-600">
                Gestión completa de citas con integración a Google Calendar
              </p>
            </div>
            <Button onClick={handleNewAppointment} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Cita
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              {/* Calendar View */}
              <Card className="p-6">
                <CalendarView
                  key={refreshKey}
                  onAppointmentClick={handleViewAppointmentDetails}
                />
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                      <p className="text-2xl font-bold text-gray-900">--</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Asesores Activos</p>
                      <p className="text-2xl font-bold text-gray-900">--</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Próxima Cita</p>
                      <p className="text-2xl font-bold text-gray-900">--:--</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <AvailabilityManager
              advisorId=""
              advisorName=""
            />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Additional Settings */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Configuración General</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración predeterminada de citas (minutos)
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option value="30">30 minutos</option>
                      <option value="60">1 hora</option>
                      <option value="90">1.5 horas</option>
                      <option value="120">2 horas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recordatorio automático (horas antes)
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option value="1">1 hora</option>
                      <option value="2">2 horas</option>
                      <option value="24">24 horas</option>
                      <option value="48">48 horas</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoConfirm"
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="autoConfirm" className="ml-2 text-sm text-gray-700">
                      Confirmar automáticamente citas nuevas
                    </label>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Appointment Details Modal */}
        <CalendarAppointmentDetailsModal
          appointment={selectedAppointment}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAppointment(null);
          }}
          onEdit={handleEditFromDetails}
          onDelete={handleDeleteFromDetails}
        />

        {/* Appointment Create/Edit Modal */}
        {showAppointmentModal && (
          <AppointmentModal
            isOpen={showAppointmentModal}
            onClose={() => {
              setShowAppointmentModal(false);
              setSelectedAppointment(null);
            }}
            appointment={selectedAppointment}
            onSave={handleAppointmentSaved}
          />
        )}
      </div>
    </div>
  );
};