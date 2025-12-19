import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Home,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  Bed,
  Bath,
  Maximize
} from 'lucide-react';
import Card from '../../components/UI/Card';
import { getMyContracts, getContractById } from '../../lib/client-portal/clientPortalApi';
import type { ClientContract } from '../../types/clientPortal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ClientContracts: React.FC = () => {
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<ClientContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getMyContracts();
      
      if (response.success && response.data) {
        setContracts(response.data);
      } else {
        setError(response.error || 'Error al cargar contratos');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar contratos');
    } finally {
      setLoading(false);
    }
  };

  const handleViewContract = async (contract: ClientContract) => {
    setSelectedContract(contract);
    setShowModal(true);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      active: {
        label: 'Activo',
        color: 'green',
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-400',
        icon: CheckCircle
      },
      pending: {
        label: 'Pendiente',
        color: 'yellow',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-700 dark:text-yellow-400',
        icon: Clock
      },
      expired: {
        label: 'Expirado',
        color: 'red',
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-400',
        icon: XCircle
      },
      cancelled: {
        label: 'Cancelado',
        color: 'gray',
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        text: 'text-gray-700 dark:text-gray-400',
        icon: XCircle
      }
    };

    return configs[status as keyof typeof configs] || configs.pending;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es });
  };

  const getContractDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  };

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const days = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando contratos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadContracts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mis Contratos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {contracts.length} {contracts.length === 1 ? 'contrato' : 'contratos'} encontrado{contracts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Contracts Grid */}
      {contracts.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No tienes contratos
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Aún no tienes contratos registrados en el sistema
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contracts.map((contract, index) => {
            const statusConfig = getStatusConfig(contract.status);
            const StatusIcon = statusConfig.icon;
            const remainingDays = getRemainingDays(contract.end_date);
            const isExpiringSoon = remainingDays > 0 && remainingDays <= 30;

            return (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  {/* Property Image */}
                  {contract.property?.images && contract.property.images.length > 0 && (
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                      <img
                        src={contract.property.images[0]}
                        alt={contract.property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-3 right-3 ${statusConfig.bg} ${statusConfig.text} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig.label}
                      </div>
                    </div>
                  )}

                  {/* Contract Info */}
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Home className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {contract.property?.title || 'Propiedad sin título'}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Contrato #{contract.contract_number}
                      </p>
                    </div>

                    {/* Property Details */}
                    {contract.property && (
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        {contract.property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            {contract.property.bedrooms}
                          </div>
                        )}
                        {contract.property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            {contract.property.bathrooms}
                          </div>
                        )}
                        {contract.property.area && (
                          <div className="flex items-center gap-1">
                            <Maximize className="w-4 h-4" />
                            {contract.property.area}m²
                          </div>
                        )}
                      </div>
                    )}

                    {/* Address */}
                    {contract.property?.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        {contract.property.address}, {contract.property.city}
                      </div>
                    )}

                    {/* Rent Amount */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Arriendo mensual
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(contract.monthly_rent)}
                      </span>
                    </div>

                    {/* Contract Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          Inicio
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(contract.start_date)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          Fin
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(contract.end_date)}
                        </p>
                      </div>
                    </div>

                    {/* Expiring Soon Warning */}
                    {isExpiringSoon && contract.status === 'active' && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                        <span className="text-sm text-yellow-800 dark:text-yellow-300">
                          Vence en {remainingDays} {remainingDays === 1 ? 'día' : 'días'}
                        </span>
                      </div>
                    )}

                    {/* View Details Button */}
                    <button
                      onClick={() => handleViewContract(contract)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalles
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Contract Details Modal */}
      <AnimatePresence>
        {showModal && selectedContract && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Detalles del Contrato
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      #{selectedContract.contract_number}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Property Information */}
                {selectedContract.property && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Home className="w-5 h-5 text-blue-600" />
                      Información de la Propiedad
                    </h3>
                    
                    {selectedContract.property.images && selectedContract.property.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {selectedContract.property.images.slice(0, 3).map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Property ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Título</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedContract.property.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Código</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedContract.property.code}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedContract.property.address}, {selectedContract.property.city}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contract Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Detalles del Contrato
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Contrato</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {selectedContract.contract_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {getStatusConfig(selectedContract.status).label}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Inicio</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedContract.start_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Fin</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedContract.end_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Duración</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getContractDuration(selectedContract.start_date, selectedContract.end_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Día de Pago</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedContract.payment_day} de cada mes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Información Financiera
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Arriendo Mensual</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(selectedContract.monthly_rent)}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Depósito</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(selectedContract.deposit_amount || 0)}
                      </p>
                    </div>
                    {selectedContract.administration_fee && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg col-span-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cuota de Administración</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {formatCurrency(selectedContract.administration_fee)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Landlord Information */}
                {selectedContract.landlord && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Propietario
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedContract.landlord.full_name}
                          </p>
                        </div>
                      </div>
                      {selectedContract.landlord.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {selectedContract.landlord.phone}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedContract.landlord.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {selectedContract.landlord.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedContract.notes && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notas Adicionales
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {selectedContract.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implementar descarga de contrato PDF
                      console.log('Descargar contrato:', selectedContract.id);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Contrato
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientContracts;
