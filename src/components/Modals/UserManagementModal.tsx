import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Search,
  X,
  AlertCircle,
  Shield,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar
} from 'lucide-react';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  toggleUserStatus,
  UserProfile,
  CreateUserData
} from '../../lib/supabase';
import Button from '../UI/Button';
import Card from '../UI/Card';
import { useNotificationContext } from '../../contexts/NotificationContext';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserFormData {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'advisor' | 'user';
  phone: string;
  department: string;
  position: string;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'admin' | 'advisor' | 'user' | ''>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState<UserProfile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<UserProfile | null>(null);

  const { addNotification } = useNotificationContext();

  // Form states
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    full_name: '',
    role: 'user',
    phone: '',
    department: '',
    position: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const options: any = {};

      if (roleFilter) options.role = roleFilter;
      if (statusFilter) options.is_active = statusFilter === 'active';
      if (searchTerm) options.search = searchTerm;

      const result = await getUsers(options);
      setUsers(result.data);
    } catch (error: any) {
      console.error('Error loading users:', error);
      addNotification({
        type: 'error',
        priority: 'high',
        title: 'Error',
        message: 'No se pudieron cargar los usuarios',
        action: 'Cerrar'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, roleFilter, statusFilter, searchTerm]);

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'user',
      phone: '',
      department: '',
      position: ''
    });
    setFormError('');
    setShowPassword(false);
  };

  // Handle create user
  const handleCreateUser = async () => {
    try {
      setFormLoading(true);
      setFormError('');

      const userData: CreateUserData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name || undefined,
        role: formData.role,
        phone: formData.phone || undefined,
        department: formData.department || undefined,
        position: formData.position || undefined
      };

      await createUser(userData);

      addNotification({
        type: 'success',
        priority: 'medium',
        title: 'Usuario creado',
        message: `El usuario ${formData.email} ha sido creado exitosamente`,
        action: 'Cerrar'
      });

      resetForm();
      setShowCreateForm(false);
      loadUsers();
    } catch (error: any) {
      setFormError(error.message || 'Error al crear usuario');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update user
  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setFormLoading(true);
      setFormError('');

      const updates: Partial<UserProfile> = {
        full_name: formData.full_name || null,
        role: formData.role,
        phone: formData.phone || null,
        department: formData.department || null,
        position: formData.position || null
      };

      await updateUser(editingUser.id, updates);

      addNotification({
        type: 'success',
        priority: 'medium',
        title: 'Usuario actualizado',
        message: `El usuario ${editingUser.email} ha sido actualizado`,
        action: 'Cerrar'
      });

      resetForm();
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      setFormError(error.message || 'Error al actualizar usuario');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!showDeleteConfirm) return;

    try {
      setFormLoading(true);
      await deleteUser(showDeleteConfirm.id);

      addNotification({
        type: 'success',
        priority: 'medium',
        title: 'Usuario eliminado',
        message: `El usuario ${showDeleteConfirm.email} ha sido eliminado`,
        action: 'Cerrar'
      });

      setShowDeleteConfirm(null);
      loadUsers();
    } catch (error: any) {
      addNotification({
        type: 'error',
        priority: 'high',
        title: 'Error',
        message: error.message || 'Error al eliminar usuario',
        action: 'Cerrar'
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!showPasswordReset) return;

    try {
      setFormLoading(true);
      await resetUserPassword(showPasswordReset.id, newPassword);

      addNotification({
        type: 'success',
        priority: 'medium',
        title: 'Contraseña reseteada',
        message: `La contraseña de ${showPasswordReset.email} ha sido cambiada`,
        action: 'Cerrar'
      });

      setShowPasswordReset(null);
      setNewPassword('');
    } catch (error: any) {
      addNotification({
        type: 'error',
        priority: 'high',
        title: 'Error',
        message: error.message || 'Error al resetear contraseña',
        action: 'Cerrar'
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (user: UserProfile) => {
    try {
      await toggleUserStatus(user.id, !user.is_active);

      addNotification({
        type: 'success',
        priority: 'medium',
        title: user.is_active ? 'Usuario desactivado' : 'Usuario activado',
        message: `${user.email} ha sido ${user.is_active ? 'desactivado' : 'activado'}`,
        action: 'Cerrar'
      });

      loadUsers();
    } catch (error: any) {
      addNotification({
        type: 'error',
        priority: 'high',
        title: 'Error',
        message: error.message || 'Error al cambiar estado del usuario',
        action: 'Cerrar'
      });
    }
  };

  // Open edit form
  const openEditForm = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '', // No mostrar contraseña existente
      full_name: user.full_name || '',
      role: user.role,
      phone: user.phone || '',
      department: user.department || '',
      position: user.position || ''
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'advisor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'advisor': return <Users className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Gestión de Usuarios
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Administra usuarios, roles y permisos del sistema
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters and Actions */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar usuarios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los roles</option>
                    <option value="admin">Administradores</option>
                    <option value="advisor">Asesores</option>
                    <option value="user">Usuarios</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>

                {/* Actions */}
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4" />
                  Nuevo Usuario
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {users.map((user) => (
                    <Card key={user.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {user.full_name || 'Sin nombre'}
                              </h3>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                {user.role}
                              </span>
                              {!user.is_active && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  Inactivo
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {user.phone}
                                </div>
                              )}
                              {user.last_login_at && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Último acceso: {new Date(user.last_login_at).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            {(user.department || user.position) && (
                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 mt-1">
                                {user.department && (
                                  <div className="flex items-center gap-1">
                                    <Building className="w-4 h-4" />
                                    {user.department}
                                  </div>
                                )}
                                {user.position && (
                                  <div className="flex items-center gap-1">
                                    <Briefcase className="w-4 h-4" />
                                    {user.position}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleToggleStatus(user)}
                            variant={user.is_active ? 'secondary' : 'primary'}
                            size="sm"
                          >
                            {user.is_active ? 'Desactivar' : 'Activar'}
                          </Button>

                          <Button
                            onClick={() => openEditForm(user)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            onClick={() => setShowPasswordReset(user)}
                            variant="outline"
                            size="sm"
                          >
                            <Key className="w-4 h-4" />
                          </Button>

                          <Button
                            onClick={() => setShowDeleteConfirm(user)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {users.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No se encontraron usuarios
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Intenta ajustar los filtros de búsqueda
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Create/Edit User Form Modal */}
            <AnimatePresence>
              {(showCreateForm || editingUser) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                      </h3>

                      {formError && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-red-700 dark:text-red-300 text-sm">{formError}</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!!editingUser}
                          />
                        </div>

                        {!editingUser && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Contraseña *
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nombre Completo
                          </label>
                          <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Rol *
                          </label>
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="user">Usuario</option>
                            <option value="advisor">Asesor</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Teléfono
                            </label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Departamento
                            </label>
                            <input
                              type="text"
                              value={formData.department}
                              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Cargo
                          </label>
                          <input
                            type="text"
                            value={formData.position}
                            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Button
                          onClick={() => {
                            setShowCreateForm(false);
                            setEditingUser(null);
                            resetForm();
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={editingUser ? handleUpdateUser : handleCreateUser}
                          disabled={formLoading}
                          className="flex-1"
                        >
                          {formLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              {editingUser ? 'Actualizando...' : 'Creando...'}
                            </div>
                          ) : (
                            editingUser ? 'Actualizar' : 'Crear'
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Reset Modal */}
            <AnimatePresence>
              {showPasswordReset && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => {
                    setShowPasswordReset(null);
                    setNewPassword('');
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Resetear Contraseña
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Nueva contraseña para <strong>{showPasswordReset.email}</strong>
                      </p>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nueva Contraseña *
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ingresa la nueva contraseña"
                        />
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Button
                          onClick={() => {
                            setShowPasswordReset(null);
                            setNewPassword('');
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handlePasswordReset}
                          disabled={formLoading || !newPassword.trim()}
                          className="flex-1"
                        >
                          {formLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Reseteando...
                            </div>
                          ) : (
                            'Resetear'
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Eliminar Usuario
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Esta acción no se puede deshacer
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-6">
                        ¿Estás seguro de que quieres eliminar al usuario <strong>{showDeleteConfirm.email}</strong>?
                        Se eliminarán todos sus datos y acceso al sistema.
                      </p>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => setShowDeleteConfirm(null)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleDeleteUser}
                          disabled={formLoading}
                          variant="outline"
                          className="flex-1"
                        >
                          {formLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Eliminando...
                            </div>
                          ) : (
                            'Eliminar'
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserManagementModal;