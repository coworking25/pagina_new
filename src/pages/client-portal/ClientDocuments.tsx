import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, AlertCircle, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import { getClientDocuments } from '../../lib/client-portal/clientPortalApi';
import type { ClientDocument } from '../../types/clientPortal';

const ClientDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, searchTerm, typeFilter]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClientDocuments();
      setDocuments(data);
      setFilteredDocuments(data);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Error al cargar los documentos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = documents;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDocumentTypeLabel(doc.document_type).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.document_type === typeFilter);
    }

    setFilteredDocuments(filtered);
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'cedula_frente': 'Cédula (Frente)',
      'cedula_reverso': 'Cédula (Reverso)',
      'certificado_laboral': 'Certificado Laboral',
      'certificado_ingresos': 'Certificado de Ingresos',
      'referencias_bancarias': 'Referencias Bancarias',
      'contrato_firmado': 'Contrato Firmado',
      'recibo_pago': 'Recibo de Pago',
      'garantia': 'Documentos del Fiador',
      'comprobante_pago': 'Comprobante de Pago',
      'otro': 'Otro Documento',
      'otros': 'Otros Documentos'
    };
    return labels[type] || type;
  };

  const getDocumentIcon = (type: string) => {
    const icons: Record<string, string> = {
      'cedula_frente': '🆔',
      'cedula_reverso': '🆔',
      'certificado_laboral': '💼',
      'certificado_ingresos': '💰',
      'referencias_bancarias': '🏦',
      'contrato_firmado': '📄',
      'recibo_pago': '🧾',
      'garantia': '🛡️',
      'comprobante_pago': '💳',
      'otro': '📎',
      'otros': '📎'
    };
    return icons[type] || '📄';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'verified': 'Verificado',
      'pending': 'Pendiente',
      'rejected': 'Rechazado',
      'expired': 'Expirado'
    };
    return labels[status] || status;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleDownload = async (doc: ClientDocument) => {
    try {
      if (!doc.file_path) {
        alert('No se encontró la ruta del archivo');
        return;
      }

      // Crear URL firmada temporal para descarga
      const { data, error } = await supabase
        .storage
        .from('clients')
        .createSignedUrl(doc.file_path, 60); // URL válida por 60 segundos

      if (error) {
        console.error('Error creando URL firmada:', error);
        throw error;
      }

      // Descargar usando la URL firmada
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = doc.document_name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error descargando documento:', error);
      alert('Error al descargar el documento. Verifica que el archivo existe.');
    }
  };

  const handleView = async (doc: ClientDocument) => {
    try {
      if (!doc.file_path) {
        alert('No se encontró la ruta del archivo');
        return;
      }

      // Crear URL firmada temporal para vista
      const { data, error } = await supabase
        .storage
        .from('clients')
        .createSignedUrl(doc.file_path, 300); // URL válida por 5 minutos

      if (error) {
        console.error('Error creando URL firmada:', error);
        throw error;
      }

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error abriendo documento:', error);
      alert('Error al abrir el documento. Verifica que el archivo existe.');
    }
  };

  // Obtener tipos únicos para el filtro
  const documentTypes = Array.from(new Set(documents.map(doc => doc.document_type)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadDocuments}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mis Documentos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona y descarga tus documentos personales y de contratos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Documentos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verificados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {documents.filter(d => d.status === 'verified').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {documents.filter(d => d.status === 'pending').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los tipos</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>
                  {getDocumentTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {documents.length === 0 ? 'No tienes documentos subidos' : 'No se encontraron documentos con los filtros aplicados'}
            </p>
          </div>
        ) : (
          filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-2xl">
                    {getDocumentIcon(doc.document_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {getDocumentTypeLabel(doc.document_type)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {doc.document_name}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Tamaño: {formatFileSize(doc.file_size || 0)}</span>
                      <span>Subido: {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: es })}</span>
                      {doc.expiration_date && (
                        <span className="text-orange-600 dark:text-orange-400">
                          Expira: {format(new Date(doc.expiration_date), 'dd/MM/yyyy', { locale: es })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                        {getStatusLabel(doc.status)}
                      </span>
                      {doc.is_required && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Requerido
                        </span>
                      )}
                    </div>

                    {doc.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                        "{doc.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleView(doc)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientDocuments;