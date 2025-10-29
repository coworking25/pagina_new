import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../UI/Button';
import Card from '../UI/Card';
import { Clock, Calendar, Plus, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdvisorAvailability {
  id: string;
  advisor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface AvailabilityException {
  id: string;
  advisor_id: string;
  exception_date: string;
  is_available: boolean;
  start_time?: string;
  end_time?: string;
  reason?: string;
}

interface Advisor {
  id: string;
  name: string;
  email: string;
}

interface AvailabilityManagerProps {
  advisorId: string;
  advisorName?: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  advisorId,
  advisorName
}) => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<AdvisorAvailability[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'weekly' | 'exceptions'>('weekly');
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>(advisorId || '');
  const [loadingAdvisors, setLoadingAdvisors] = useState(false);

  // Estado para nueva excepción
  const [newException, setNewException] = useState({
    exception_date: '',
    is_available: false,
    start_time: '',
    end_time: '',
    reason: ''
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadAdvisors();
    } else {
      setSelectedAdvisorId(advisorId);
      setLoading(false); // Para usuarios no admin, no esperamos carga de asesores
    }
  }, [isAdmin, advisorId]);

  useEffect(() => {
    if (selectedAdvisorId) {
      loadAvailability();
      loadExceptions();
    } else if (!isAdmin) {
      // Si no es admin y no hay advisorId, mostrar mensaje de error
      setLoading(false);
    }
  }, [selectedAdvisorId, isAdmin]);

  const loadAvailability = async () => {
    if (!selectedAdvisorId) return;

    try {
      const { data, error } = await supabase
        .from('advisor_availability')
        .select('*')
        .eq('advisor_id', selectedAdvisorId)
        .order('day_of_week');

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const loadExceptions = async () => {
    if (!selectedAdvisorId) return;

    try {
      const { data, error } = await supabase
        .from('availability_exceptions')
        .select('*')
        .eq('advisor_id', selectedAdvisorId)
        .order('exception_date', { ascending: false });

      if (error) throw error;
      setExceptions(data || []);
    } catch (error) {
      console.error('Error loading exceptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (dayOfWeek: number, field: string, value: any) => {
    if (!selectedAdvisorId) return;

    try {
      const existing = availability.find(a => a.day_of_week === dayOfWeek);

      if (existing) {
        const { error } = await supabase
          .from('advisor_availability')
          .update({ [field]: value })
          .eq('id', existing.id);

        if (error) throw error;

        setAvailability(prev =>
          prev.map(a =>
            a.day_of_week === dayOfWeek ? { ...a, [field]: value } : a
          )
        );
      } else {
        const { data, error } = await supabase
          .from('advisor_availability')
          .insert({
            advisor_id: selectedAdvisorId,
            day_of_week: dayOfWeek,
            start_time: '09:00',
            end_time: '17:00',
            is_available: true,
            [field]: value
          })
          .select()
          .single();

        if (error) throw error;

        setAvailability(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const addException = async () => {
    if (!selectedAdvisorId || !newException.exception_date) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('availability_exceptions')
        .insert({
          advisor_id: selectedAdvisorId,
          exception_date: newException.exception_date,
          is_available: newException.is_available,
          start_time: newException.is_available ? newException.start_time : null,
          end_time: newException.is_available ? newException.end_time : null,
          reason: newException.reason || null
        })
        .select()
        .single();

      if (error) throw error;

      setExceptions(prev => [data, ...prev]);
      setNewException({
        exception_date: '',
        is_available: false,
        start_time: '',
        end_time: '',
        reason: ''
      });
    } catch (error) {
      console.error('Error adding exception:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteException = async (exceptionId: string) => {
    try {
      const { error } = await supabase
        .from('availability_exceptions')
        .delete()
        .eq('id', exceptionId);

      if (error) throw error;

      setExceptions(prev => prev.filter(e => e.id !== exceptionId));
    } catch (error) {
      console.error('Error deleting exception:', error);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM format
  };

  const loadAdvisors = async () => {
    setLoadingAdvisors(true);
    try {
      const { data, error } = await supabase
        .from('advisors')
        .select('id, name, email')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;
      setAdvisors(data || []);
    } catch (error) {
      console.error('Error loading advisors:', error);
    } finally {
      setLoadingAdvisors(false);
      setLoading(false); // Para admins, terminamos la carga inicial aquí
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Cargando disponibilidad...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Disponibilidad
            </h2>
            {advisorName && !isAdmin && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configurando horarios para {advisorName}
              </p>
            )}
          </div>
        </div>

        {/* Advisor Selector for Admin */}
        {isAdmin && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Seleccionar Asesor
            </label>
            <select
              value={selectedAdvisorId}
              onChange={(e) => setSelectedAdvisorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
              disabled={loadingAdvisors}
            >
              <option value="">
                {loadingAdvisors ? 'Cargando asesores...' : 'Seleccionar asesor'}
              </option>
              {advisors.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.name} ({advisor.email})
                </option>
              ))}
            </select>
            {!selectedAdvisorId && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                Selecciona un asesor para gestionar su disponibilidad
              </p>
            )}
          </div>
        )}

        {/* Show content only when advisor is selected OR when user is admin */}
        {(selectedAdvisorId || isAdmin) && (
          <>
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'weekly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Horarios Semanales
          </button>
          <button
            onClick={() => setActiveTab('exceptions')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'exceptions'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Excepciones
          </button>
        </div>

        {/* Weekly Availability Tab */}
        {activeTab === 'weekly' && selectedAdvisorId && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Configura tus horarios de trabajo regulares para cada día de la semana.
                Los clientes podrán agendar citas solo dentro de estos horarios.
              </p>
            </div>

            {DAYS_OF_WEEK.map((day) => {
              const dayAvailability = availability.find(a => a.day_of_week === day.value);

              return (
                <div key={day.value} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-900 dark:text-white w-24">
                      {day.label}
                    </span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={dayAvailability?.is_available ?? false}
                        onChange={(e) => updateAvailability(day.value, 'is_available', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Disponible
                      </span>
                    </label>
                  </div>

                  {dayAvailability?.is_available && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Desde:</label>
                        <input
                          type="time"
                          value={dayAvailability.start_time ? formatTime(dayAvailability.start_time) : '09:00'}
                          onChange={(e) => updateAvailability(day.value, 'start_time', e.target.value)}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Hasta:</label>
                        <input
                          type="time"
                          value={dayAvailability.end_time ? formatTime(dayAvailability.end_time) : '17:00'}
                          onChange={(e) => updateAvailability(day.value, 'end_time', e.target.value)}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Show message when no advisor is selected for weekly tab */}
        {activeTab === 'weekly' && !selectedAdvisorId && isAdmin && (
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Selecciona un Asesor
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Elige un asesor de la lista desplegable arriba para gestionar su disponibilidad semanal.
            </p>
          </div>
        )}

        {/* Exceptions Tab */}
        {activeTab === 'exceptions' && selectedAdvisorId && (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Agrega excepciones para días específicos donde tu disponibilidad sea diferente
                a la habitual (vacaciones, días festivos, citas médicas, etc.).
              </p>
            </div>

            {/* Add New Exception */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Agregar Excepción
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={newException.exception_date}
                    onChange={(e) => setNewException(prev => ({ ...prev, exception_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Razón (opcional)
                  </label>
                  <input
                    type="text"
                    value={newException.reason}
                    onChange={(e) => setNewException(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Vacaciones, cita médica, etc."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newException.is_available}
                      onChange={(e) => setNewException(prev => ({ ...prev, is_available: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Disponible este día
                    </span>
                  </label>
                </div>
                {newException.is_available && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Hora inicio
                      </label>
                      <input
                        type="time"
                        value={newException.start_time}
                        onChange={(e) => setNewException(prev => ({ ...prev, start_time: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Hora fin
                      </label>
                      <input
                        type="time"
                        value={newException.end_time}
                        onChange={(e) => setNewException(prev => ({ ...prev, end_time: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={addException}
                  disabled={saving || !newException.exception_date}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {saving ? 'Agregando...' : 'Agregar Excepción'}
                </Button>
              </div>
            </Card>

            {/* Existing Exceptions */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Excepciones Existentes
              </h3>
              {exceptions.length === 0 ? (
                <Card className="p-6">
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    No hay excepciones configuradas
                  </p>
                </Card>
              ) : (
                exceptions.map((exception) => (
                  <Card key={exception.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(exception.exception_date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            exception.is_available
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {exception.is_available ? 'Disponible' : 'No disponible'}
                          </div>
                        </div>
                        {exception.reason && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {exception.reason}
                          </p>
                        )}
                        {exception.is_available && exception.start_time && exception.end_time && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Horario: {formatTime(exception.start_time)} - {formatTime(exception.end_time)}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteException(exception.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Show message when no advisor is selected for exceptions tab */}
        {activeTab === 'exceptions' && !selectedAdvisorId && isAdmin && (
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Selecciona un Asesor
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Elige un asesor de la lista desplegable arriba para gestionar sus excepciones de disponibilidad.
            </p>
          </div>
        )}
          </>
        )}

        {/* Show message when no advisor is available for non-admin users */}
        {!isAdmin && !advisorId && (
          <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-lg text-center">
            <Users className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
              Acceso Denegado
            </h3>
            <p className="text-red-600 dark:text-red-400">
              No tienes permisos para gestionar la disponibilidad. Contacta a un administrador.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};