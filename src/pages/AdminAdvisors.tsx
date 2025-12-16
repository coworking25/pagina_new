import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  Phone,
  Mail,
  MessageCircle,
  Award,
  Calendar,
  UserCheck,
  Image as ImageIcon
} from 'lucide-react';
import { createAdvisor, updateAdvisor, deleteAdvisor, getAdvisorsPaginated } from '../lib/supabase';
import { Advisor } from '../types';
import AdvisorDetailsModal from '../components/AdvisorDetailsModal';
import AdvisorFormModal from '../components/AdvisorFormModal';
import DeleteAdvisorModal from '../components/DeleteAdvisorModal';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/UI/Pagination';

function AdminAdvisors() {
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  
  // Modal states
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Hook de paginación para asesores
  const {
    data: advisors,
    isLoading,
    currentPage,
    totalPages,
    total,
    limit,
    search,
    sortBy,
    sortOrder,
    loadData,
    setPage,
    setLimit,
    setSort,
    setSearch
  } = usePagination<Advisor>({
    initialPage: 1,
    initialLimit: 20,
    initialSortBy: 'name',
    initialSortOrder: 'asc'
  });

  useEffect(() => {
    loadAdvisors();
  }, []);

  const loadAdvisors = async () => {
    console.log('👥 AdminAdvisors: Cargando asesores con paginación');

    await loadData(async (options) => {
      const response = await getAdvisorsPaginated(options);
      return response;
    });
  };

  const refreshAdvisors = async () => {
    console.log('🔄 AdminAdvisors: Refrescando asesores con paginación');

    await loadData(async (options) => {
      const response = await getAdvisorsPaginated(options);
      return response;
    });
  };

  // Modal handlers
  const handleViewDetails = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setIsDetailsModalOpen(true);
  };

  const handleEditAdvisor = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleDeleteAdvisor = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setIsDeleteModalOpen(true);
  };

  const handleCreateAdvisor = () => {
    setSelectedAdvisor(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleSaveAdvisor = async (advisorData: Omit<Advisor, 'id'> | Partial<Advisor>) => {
    setActionLoading(true);
    try {
      if (isEditing && selectedAdvisor) {
        // Update existing advisor
        await updateAdvisor(selectedAdvisor.id, advisorData as Partial<Advisor>);
        console.log('✅ Asesor actualizado exitosamente');
      } else {
        // Create new advisor
        await createAdvisor(advisorData as Omit<Advisor, 'id'>);
        console.log('✅ Asesor creado exitosamente');
      }
      
      // Reload advisors list
      await refreshAdvisors();
      setIsFormModalOpen(false);
      setSelectedAdvisor(null);
    } catch (error) {
      console.error('❌ Error guardando asesor:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAdvisor) return;
    
    setActionLoading(true);
    try {
      await deleteAdvisor(selectedAdvisor.id);
      console.log('✅ Asesor eliminado exitosamente');
      
      // Reload advisors list
      await refreshAdvisors();
      setIsDeleteModalOpen(false);
      setSelectedAdvisor(null);
    } catch (error) {
      console.error('❌ Error eliminando asesor:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const closeModals = () => {
    setIsDetailsModalOpen(false);
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedAdvisor(null);
    setIsEditing(false);
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating
              ? 'text-yellow-500 fill-current'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      );
    }
    return stars;
  };

  const getSpecialtyColor = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case 'ventas': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'arriendos': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'comercial': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'residencial': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };



  const uniqueSpecialties = Array.from(new Set(advisors.map(advisor => advisor.specialty)));

  if (isLoading) {
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">Gestión de Asesores</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 truncate">
            Administra el equipo de asesores inmobiliarios
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateAdvisor}
          className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span className="sm:hidden">Nuevo</span>
          <span className="hidden sm:inline">Nuevo Asesor</span>
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Total Asesores</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{advisors.length}</p>
            </div>
            <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600 flex-shrink-0 ml-2" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Espec. Ventas</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                {advisors.filter(a => a.specialty.toLowerCase().includes('venta')).length}
              </p>
            </div>
            <Award className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600 flex-shrink-0 ml-2" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Espec. Arriendos</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                {advisors.filter(a => a.specialty.toLowerCase().includes('arriendo')).length}
              </p>
            </div>
            <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600 flex-shrink-0 ml-2" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Rating Promedio</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">
                {advisors.length > 0 
                  ? (advisors.reduce((sum, advisor) => sum + advisor.rating, 0) / advisors.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <Star className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-yellow-600 flex-shrink-0 ml-2" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Specialty Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las especialidades</option>
              {uniqueSpecialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Advisors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {advisors.map((advisor, index) => (
          <motion.div
            key={advisor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Advisor Header */}
            <div className="p-4 sm:p-5 lg:p-6 text-center">
              <div className="relative inline-block mb-3 sm:mb-4">
                {advisor.photo ? (
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 mx-auto">
                    <img
                      src={advisor.photo}
                      alt={advisor.name}
                      className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-blue-100 dark:ring-blue-900 dark:border-gray-700"
                      style={{
                        objectPosition: 'center top',
                        imageRendering: 'auto'
                      }}
                      onError={(e) => {
                        // Si falla, mostrar imagen por defecto
                        const target = e.currentTarget;
                        target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=90';
                      }}
                    />
                    {/* Indicador de estado activo */}
                    <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mx-auto border-4 border-white shadow-lg ring-2 ring-gray-100 dark:ring-gray-700 dark:border-gray-700">
                    <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {advisor.name}
              </h3>
              
              <div className="mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSpecialtyColor(advisor.specialty)}`}>
                  {advisor.specialty}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-center mb-2">
                {getRatingStars(advisor.rating)}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {advisor.rating} ({advisor.reviews} reseñas)
                </span>
              </div>

              {/* Experience */}
              {advisor.experience_years && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {advisor.experience_years} años de experiencia
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="px-4 sm:px-5 lg:px-6 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">{advisor.email}</span>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">{advisor.phone}</span>
              </div>

              {advisor.whatsapp && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{advisor.whatsapp}</span>
                </div>
              )}
            </div>

            {/* Availability */}
            {advisor.availability_hours && (
              <div className="px-6 pb-4">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">{advisor.availability_hours}</span>
                </div>
              </div>
            )}

            {/* Bio */}
            {advisor.bio && (
              <div className="px-6 pb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {advisor.bio}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6 flex justify-between">
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleViewDetails(advisor)}
                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Ver perfil"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEditAdvisor(advisor)}
                  className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteAdvisor(advisor)}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
              
              {advisor.calendar_link && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => window.open(advisor.calendar_link, '_blank')}
                >
                  Agenda
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {advisors.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay asesores encontrados
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron asesores que coincidan con los filtros aplicados.
          </p>
        </div>
      )}

      {/* Componente de Paginación */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
          />
        </div>
      )}

      {/* Modals */}
      <AdvisorDetailsModal
        advisor={selectedAdvisor}
        isOpen={isDetailsModalOpen}
        onClose={closeModals}
      />

      <AdvisorFormModal
        advisor={selectedAdvisor}
        isOpen={isFormModalOpen}
        onClose={closeModals}
        onSave={handleSaveAdvisor}
        isEditing={isEditing}
      />

      <DeleteAdvisorModal
        advisor={selectedAdvisor}
        isOpen={isDeleteModalOpen}
        onClose={closeModals}
        onConfirm={handleConfirmDelete}
        isLoading={actionLoading}
      />
    </div>
  );
}

export default AdminAdvisors;
