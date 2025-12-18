// =====================================================
// GESTIÓN DE RECIBOS DE PAGO DEL CLIENTE
// Subida, verificación y gestión de recibos
// =====================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Image as ImageIcon,
  FileCheck,
  X
} from 'lucide-react';
import {
  getReceiptsByClient,
  uploadPaymentReceipt,
  verifyReceipt,
  deletePaymentReceipt,
  downloadReceipt
} from '../../lib/receiptsApi';
import ReceiptUploadZone from './ReceiptUploadZone';

interface ClientPaymentReceiptsProps {
  clientId: string;
}

interface PaymentReceipt {
  id: string;
  client_id: string;
  schedule_id?: string | null;
  file_name: string;
  file_path: string;
  file_size?: number | null;
  file_type?: string | null;
  payment_amount: number;
  payment_date: string;
  payment_method?: string | null;
  payment_reference?: string | null;
  description?: string | null;
  notes?: string | null;
  status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  uploaded_at: string;
  schedule?: {
    id: string;
    payment_concept: string;
    amount: number;
    due_date: string;
  };
}

interface ReceiptStatistics {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  totalAmount: number;
}

const ClientPaymentReceipts: React.FC<ClientPaymentReceiptsProps> = ({ clientId }) => {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<ReceiptStatistics | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const receiptsData = await getReceiptsByClient(clientId);
      setReceipts(receiptsData);
      
      // Calcular estadísticas locales
      const stats = {
        total: receiptsData.length,
        pending: receiptsData.filter((r: any) => r.status === 'pending').length,
        verified: receiptsData.filter((r: any) => r.status === 'verified').length,
        rejected: receiptsData.filter((r: any) => r.status === 'rejected').length,
        totalAmount: receiptsData
          .filter((r: any) => r.status === 'verified')
          .reduce((sum: number, r: any) => sum + r.payment_amount, 0)
      };
      setStatistics(stats);
    } catch (error) {
      console.error('Error cargando recibos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, data: any) => {
    try {
      await uploadPaymentReceipt(file, {
        ...data,
        client_id: clientId
      });
      await loadData();
      setShowUploadZone(false);
    } catch (error) {
      console.error('Error subiendo recibo:', error);
      throw error;
    }
  };

  const handleVerify = async (receiptId: string, status: 'verified' | 'rejected') => {
    try {
      await verifyReceipt(receiptId, {
        status,
        verification_notes: verificationNotes || undefined
      });
      await loadData();
      setShowVerifyModal(false);
      setSelectedReceipt(null);
      setVerificationNotes('');
    } catch (error) {
      console.error('Error verificando recibo:', error);
      alert('Error al verificar el recibo');
    }
  };

  const handleDelete = async (receiptId: string) => {
    if (!confirm('¿Está seguro de eliminar este recibo?')) return;

    try {
      await deletePaymentReceipt(receiptId);
      await loadData();
    } catch (error) {
      console.error('Error eliminando recibo:', error);
      alert('Error al eliminar el recibo');
    }
  };

  const handleDownload = (receipt: PaymentReceipt) => {
    downloadReceipt(receipt.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified': return 'Verificado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedReceipts = [...filteredReceipts].sort((a, b) => {
    return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
  });

  const isImage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics.total}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Pendientes</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics.pending}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Verificados</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics.verified}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Rechazados</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics.rejected}
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Monto Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${statistics.totalAmount.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Header con filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar recibos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="verified">Verificados</option>
            <option value="rejected">Rechazados</option>
          </select>
        </div>

        <button
          onClick={() => setShowUploadZone(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Subir Recibo
        </button>
      </div>

      {/* Lista de recibos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
        {sortedReceipts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No hay recibos subidos</p>
            <button
              onClick={() => setShowUploadZone(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Subir primer recibo
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Archivo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Fecha Pago
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Método
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {sortedReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {isImage(receipt.file_name) ? (
                          <ImageIcon className="w-5 h-5 text-blue-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {receipt.file_name}
                          </div>
                          {receipt.file_size && (
                            <div className="text-xs text-gray-500">
                              {(receipt.file_size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {new Date(receipt.payment_date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                      ${receipt.payment_amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {receipt.payment_method || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                        {getStatusIcon(receipt.status)}
                        {getStatusLabel(receipt.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedReceipt(receipt);
                            setShowPreview(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="Ver recibo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(receipt)}
                          className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {receipt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedReceipt(receipt);
                                setShowVerifyModal(true);
                              }}
                              className="p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded"
                              title="Verificar"
                            >
                              <FileCheck className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(receipt.id)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de upload */}
      <AnimatePresence>
        {showUploadZone && (
          <ReceiptUploadZone
            clientId={clientId}
            onUpload={handleUpload}
            onClose={() => setShowUploadZone(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal de preview */}
      <AnimatePresence>
        {showPreview && selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Preview del Recibo
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {isImage(selectedReceipt.file_name) ? (
                    <img
                      src={selectedReceipt.file_path}
                      alt={selectedReceipt.file_name}
                      className="w-full rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                      <FileText className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Preview no disponible para este tipo de archivo
                      </p>
                      <button
                        onClick={() => handleDownload(selectedReceipt)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Descargar Archivo
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Monto</label>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${selectedReceipt.payment_amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Fecha de Pago</label>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedReceipt.payment_date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    {selectedReceipt.payment_method && (
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Método</label>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedReceipt.payment_method}</p>
                      </div>
                    )}
                    {selectedReceipt.payment_reference && (
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Referencia</label>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedReceipt.payment_reference}</p>
                      </div>
                    )}
                  </div>

                  {selectedReceipt.verification_notes && (
                    <div className="pt-4 border-t">
                      <label className="text-sm text-gray-600 dark:text-gray-400">Notas de Verificación</label>
                      <p className="text-gray-900 dark:text-white">{selectedReceipt.verification_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de verificación */}
      <AnimatePresence>
        {showVerifyModal && selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowVerifyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Verificar Recibo
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas de Verificación
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Añade notas sobre la verificación..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleVerify(selectedReceipt.id, 'verified')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Verificar
                  </button>
                  <button
                    onClick={() => handleVerify(selectedReceipt.id, 'rejected')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setVerificationNotes('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientPaymentReceipts;
