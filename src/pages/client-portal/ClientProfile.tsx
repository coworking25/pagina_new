import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Save,
  Edit3
} from 'lucide-react';
import { getMyProfile, updateMyProfile } from '../../lib/client-portal/clientPortalApi';
import type { ClientProfile } from '../../types/clientPortal';
import Card from '../../components/UI/Card';

const ClientProfile: React.FC = () => {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      phone: '',
      address: '',
      city: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      occupation: '',
      company_name: ''
    }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await getMyProfile();

      if (response.success && response.data) {
        setProfile(response.data);
        reset({
          phone: response.data.phone || '',
          address: response.data.address || '',
          city: response.data.city || '',
          emergency_contact_name: response.data.emergency_contact_name || '',
          emergency_contact_phone: response.data.emergency_contact_phone || '',
          occupation: response.data.occupation || '',
          company_name: response.data.company_name || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    // Validación básica
    const errors: string[] = [];
    if (!data.phone?.trim()) errors.push('Teléfono es requerido');
    if (!data.address?.trim()) errors.push('Dirección es requerida');
    if (!data.city?.trim()) errors.push('Ciudad es requerida');
    if (!data.emergency_contact_name?.trim()) errors.push('Nombre de contacto de emergencia es requerido');
    if (!data.emergency_contact_phone?.trim()) errors.push('Teléfono de contacto de emergencia es requerido');

    if (errors.length > 0) {
      setSaveMessage({ type: 'error', message: errors.join(', ') });
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage(null);

      const response = await updateMyProfile({
        phone: data.phone,
        address: data.address,
        city: data.city,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        occupation: data.occupation || undefined,
        company_name: data.company_name || undefined
      });

      if (response.success) {
        setSaveMessage({ type: 'success', message: 'Perfil actualizado exitosamente' });
        setIsEditing(false);
        // Recargar perfil para obtener datos actualizados
        await loadProfile();
      } else {
        setSaveMessage({ type: 'error', message: response.error || 'Error al actualizar perfil' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage({ type: 'error', message: 'Error al actualizar perfil' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      reset({
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        emergency_contact_name: profile.emergency_contact_name || '',
        emergency_contact_phone: profile.emergency_contact_phone || '',
        occupation: profile.occupation || '',
        company_name: profile.company_name || ''
      });
    }
    setIsEditing(false);
    setSaveMessage(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar perfil
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No se pudo cargar la información de tu perfil.
          </p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Reintentar
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Mi Perfil
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Gestiona tu información personal y de contacto
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            <Edit3 className="w-4 h-4" />
            Editar Perfil
          </button>
        )}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-3 ${
            saveMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}
        >
          {saveMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm">{saveMessage.message}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* Información Personal */}
        <Card className="p-4 sm:p-5 lg:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            Información Personal
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Nombre Completo (solo lectura) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre Completo
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{profile.full_name}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Este campo no se puede modificar
              </p>
            </div>

            {/* Email (solo lectura) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correo Electrónico
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{profile.email}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Este campo no se puede modificar
              </p>
            </div>

            {/* Tipo y Número de Documento (solo lectura) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Documento
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-900 dark:text-white">{profile.document_type}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de Documento
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-900 dark:text-white">{profile.document_number}</span>
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono *
              </label>
              {isEditing ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('phone')}
                    type="tel"
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.phone
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="Ingresa tu teléfono"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{profile.phone || 'No especificado'}</span>
                </div>
              )}
              {errors.phone && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ciudad *
              </label>
              {isEditing ? (
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('city')}
                    type="text"
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.city
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="Ingresa tu ciudad"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{profile.city || 'No especificado'}</span>
                </div>
              )}
              {errors.city && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.city.message}</p>
              )}
            </div>
          </div>

          {/* Dirección (full width) */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dirección *
            </label>
            {isEditing ? (
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  {...register('address')}
                  rows={3}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.address
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Ingresa tu dirección completa"
                />
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-900 dark:text-white">{profile.address || 'No especificado'}</span>
              </div>
            )}
            {errors.address && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.address.message}</p>
            )}
          </div>
        </Card>

        {/* Información Laboral */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-600" />
            Información Laboral
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ocupación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ocupación
              </label>
              {isEditing ? (
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('occupation')}
                    type="text"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Ingresa tu ocupación"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{profile.occupation || 'No especificado'}</span>
                </div>
              )}
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Empresa
              </label>
              {isEditing ? (
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('company_name')}
                    type="text"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Ingresa el nombre de tu empresa"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Building className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{profile.company_name || 'No especificado'}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Contacto de Emergencia */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-green-600" />
            Contacto de Emergencia
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre de Contacto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Contacto *
              </label>
              {isEditing ? (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('emergency_contact_name')}
                    type="text"
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.emergency_contact_name
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="Nombre del contacto de emergencia"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{profile.emergency_contact_name || 'No especificado'}</span>
                </div>
              )}
              {errors.emergency_contact_name && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.emergency_contact_name.message}</p>
              )}
            </div>

            {/* Teléfono de Contacto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono del Contacto *
              </label>
              {isEditing ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('emergency_contact_phone')}
                    type="tel"
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.emergency_contact_phone
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="Teléfono del contacto de emergencia"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{profile.emergency_contact_phone || 'No especificado'}</span>
                </div>
              )}
              {errors.emergency_contact_phone && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.emergency_contact_phone.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Información del Sistema */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Información del Sistema
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Registro
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <CheckCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {new Date(profile.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado de la Cuenta
              </label>
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-400 font-medium">Activa</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Botones de Acción */}
        {isEditing && (
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ClientProfile;