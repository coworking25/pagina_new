import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Save, Loader2, CheckCircle, AlertCircle, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { supabase } from '../lib/supabase';

const AdminProfile: React.FC = () => {
  const { user, updateProfile, changePassword, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || ''
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      let emailChanged = false;

      // Si el email cambió, necesitamos actualizar en Supabase Auth Y en user_profiles
      if (formData.email !== user.email) {
        // Actualizar en Supabase Auth
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });

        if (emailError) {
          throw new Error(`Error actualizando email: ${emailError.message}`);
        }

        // Actualizar también en user_profiles para reflejar el cambio pendiente
        const { error: profileEmailError } = await supabase
          .from('user_profiles')
          .update({ email: formData.email })
          .eq('id', user.id);

        if (profileEmailError) {
          console.warn('⚠️ Error actualizando email en perfil:', profileEmailError);
          // No lanzamos error aquí porque el email se actualizó en Auth
        }

        emailChanged = true;
      }

      // Actualizar otros campos del perfil
      await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        department: formData.department,
        position: formData.position
      });

      // Refrescar los datos del usuario desde la base de datos
      await refreshUser();

      // Mensaje de éxito
      if (emailChanged) {
        setMessage({
          type: 'success',
          text: '✅ Email actualizado. Revisa tu correo nuevo para confirmar el cambio. El perfil se actualizó correctamente.'
        });
      } else {
        setMessage({
          type: 'success',
          text: '✅ Perfil actualizado exitosamente'
        });
      }

      setIsEditing(false);

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMessage(null), 5000);

    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error al actualizar el perfil'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setMessage(null);

    // Validaciones
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Por favor completa todos los campos'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }

    setIsSaving(true);

    try {
      await changePassword(passwordData.newPassword);

      setMessage({
        type: 'success',
        text: 'Contraseña cambiada exitosamente'
      });

      // Limpiar formulario
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setShowPasswordChange(false);

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMessage(null), 5000);

    } catch (error: any) {
      console.error('Error cambiando contraseña:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error al cambiar la contraseña'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Administra tu información personal y configuración de cuenta
        </p>
      </div>

      {/* Mensaje de éxito/error */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
          <span className={`text-sm ${
            message.type === 'success'
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}>
            {message.text}
          </span>
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Información del Perfil */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Información Personal
            </h2>
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nombre Completo
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
              {isEditing && formData.email !== user.email && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  ⚠️ Recibirás un email de confirmación al cambiar tu correo
                </p>
              )}
              {!isEditing && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  💡 Este es tu email actual. Los cambios se reflejan después de guardar.
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                placeholder="+57 300 123 4567"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>

            {/* Departamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Departamento
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                disabled={!isEditing}
                placeholder="Ventas"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>

            {/* Cargo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cargo
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                disabled={!isEditing}
                placeholder="Administrador"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Botones de acción */}
          {isEditing && (
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    full_name: user.full_name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    department: user.department || '',
                    position: user.position || ''
                  });
                }}
                disabled={isSaving}
              >
                Cancelar
              </Button>
            </div>
          )}
        </Card>

        {/* Cambiar Contraseña */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Seguridad
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Administra tu contraseña y configuración de seguridad
              </p>
            </div>
            {!showPasswordChange && (
              <Button
                variant="outline"
                onClick={() => setShowPasswordChange(true)}
                className="flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Cambiar Contraseña
              </Button>
            )}
          </div>

          {showPasswordChange && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleChangePassword}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Cambiar Contraseña
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}

          {!showPasswordChange && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Última actualización de contraseña: {user.updated_at ? new Date(user.updated_at).toLocaleDateString('es-ES') : 'N/A'}</p>
            </div>
          )}
        </Card>

        {/* Información de la Cuenta */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Información de la Cuenta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Rol:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                {user.role}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Estado:</span>
              <span className="ml-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {user.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Miembro desde:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {new Date(user.created_at).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Último acceso:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('es-ES') : 'N/A'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfile;
