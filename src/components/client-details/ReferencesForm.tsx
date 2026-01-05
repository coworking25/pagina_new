import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Reference {
  id: string;
  client_id: string;
  reference_type: 'personal' | 'commercial';
  name: string;
  phone: string;
  relationship?: string;
  company_name?: string;
}

interface ReferencesFormProps {
  references: Reference[];
  setReferences: (refs: Reference[]) => void;
  clientId: string;
}

export const ReferencesForm: React.FC<ReferencesFormProps> = ({ references, setReferences, clientId }) => {
  const [newReference, setNewReference] = useState({
    reference_type: 'personal' as 'personal' | 'commercial',
    name: '',
    phone: '',
    relationship: '',
    company_name: ''
  });

  const handleAddReference = async () => {
    if (!newReference.name || !newReference.phone) {
      alert('Nombre y teléfono son requeridos');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('client_references')
        .insert({
          client_id: clientId,
          reference_type: newReference.reference_type,
          name: newReference.name,
          phone: newReference.phone,
          relationship: newReference.reference_type === 'personal' ? newReference.relationship : null,
          company_name: newReference.reference_type === 'commercial' ? newReference.company_name : null
        })
        .select()
        .single();

      if (error) throw error;

      setReferences([...references, data]);
      setNewReference({
        reference_type: 'personal',
        name: '',
        phone: '',
        relationship: '',
        company_name: ''
      });
    } catch (error) {
      console.error('Error agregando referencia:', error);
      alert('Error al agregar referencia');
    }
  };

  const handleDeleteReference = async (refId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta referencia?')) return;

    try {
      const { error } = await supabase
        .from('client_references')
        .delete()
        .eq('id', refId);

      if (error) throw error;

      setReferences(references.filter(r => r.id !== refId));
    } catch (error) {
      console.error('Error eliminando referencia:', error);
      alert('Error al eliminar referencia');
    }
  };

  const personalRefs = references.filter(r => r.reference_type === 'personal');
  const commercialRefs = references.filter(r => r.reference_type === 'commercial');

  return (
    <div className="space-y-6">
      {/* Formulario para agregar nueva referencia */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Agregar Nueva Referencia</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Referencia
            </label>
            <select
              value={newReference.reference_type}
              onChange={(e) => setNewReference({ ...newReference, reference_type: e.target.value as 'personal' | 'commercial' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="personal">Personal</option>
              <option value="commercial">Comercial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={newReference.name}
              onChange={(e) => setNewReference({ ...newReference, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Teléfono *
            </label>
            <input
              type="text"
              value={newReference.phone}
              onChange={(e) => setNewReference({ ...newReference, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="Número de teléfono"
            />
          </div>

          {newReference.reference_type === 'personal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Relación
              </label>
              <input
                type="text"
                value={newReference.relationship}
                onChange={(e) => setNewReference({ ...newReference, relationship: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Amigo, Familiar, Compañero"
              />
            </div>
          )}

          {newReference.reference_type === 'commercial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Empresa
              </label>
              <input
                type="text"
                value={newReference.company_name}
                onChange={(e) => setNewReference({ ...newReference, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre de la empresa"
              />
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleAddReference}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar Referencia
          </button>
        </div>
      </div>

      {/* Lista de referencias personales */}
      {personalRefs.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Referencias Personales ({personalRefs.length})</h4>
          {personalRefs.map((ref) => (
            <div key={ref.id} className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-blue-900 dark:text-blue-100">{ref.name}</h5>
                  <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p>📞 {ref.phone}</p>
                    {ref.relationship && <p>👥 {ref.relationship}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteReference(ref.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de referencias comerciales */}
      {commercialRefs.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Referencias Comerciales ({commercialRefs.length})</h4>
          {commercialRefs.map((ref) => (
            <div key={ref.id} className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-purple-900 dark:text-purple-100">{ref.name}</h5>
                  <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p>📞 {ref.phone}</p>
                    {ref.company_name && <p>🏢 {ref.company_name}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteReference(ref.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {references.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No hay referencias registradas
        </div>
      )}
    </div>
  );
};
