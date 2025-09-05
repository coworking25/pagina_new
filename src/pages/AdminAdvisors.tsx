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
import { getAdvisors } from '../lib/supabase';
import { Advisor } from '../types';

function AdminAdvisors() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  useEffect(() => {
    loadAdvisors();
  }, []);

  const loadAdvisors = async () => {
    try {
      console.log('👥 Cargando asesores desde Supabase...');
      
      const advisorsData = await getAdvisors();
      console.log('✅ Asesores obtenidos:', advisorsData);
      
      setAdvisors(advisorsData);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error cargando asesores:', error);
      setAdvisors([]);
      setLoading(false);
    }
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

  const filteredAdvisors = advisors.filter(advisor => {
    const matchesSearch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advisor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'all' || advisor.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  const uniqueSpecialties = Array.from(new Set(advisors.map(advisor => advisor.specialty)));

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Asesores</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra el equipo de asesores inmobiliarios
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Asesor
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Asesores</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{advisors.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Especialistas en Ventas</p>
              <p className="text-2xl font-bold text-blue-600">
                {advisors.filter(a => a.specialty.toLowerCase().includes('venta')).length}
              </p>
            </div>
            <Award className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Especialistas en Arriendos</p>
              <p className="text-2xl font-bold text-green-600">
                {advisors.filter(a => a.specialty.toLowerCase().includes('arriendo')).length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rating Promedio</p>
              <p className="text-2xl font-bold text-yellow-600">
                {advisors.length > 0 
                  ? (advisors.reduce((sum, advisor) => sum + advisor.rating, 0) / advisors.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdvisors.map((advisor, index) => (
          <motion.div
            key={advisor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Advisor Header */}
            <div className="p-6 text-center">
              <div className="relative inline-block mb-4">
                {advisor.photo ? (
                  <img
                    src={advisor.photo}
                    alt={advisor.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
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
            <div className="px-6 pb-4 space-y-2">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm truncate">{advisor.email}</span>
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
            <div className="px-6 pb-6 flex justify-between">
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Ver perfil"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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

      {filteredAdvisors.length === 0 && (
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
    </div>
  );
}

export default AdminAdvisors;
