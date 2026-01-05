import React, { useState } from 'react';
import { X, Home } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PropertiesFormProps {
  properties: any[];
  availableProperties: any[];
  setProperties: (props: any[]) => void;
  clientId: string;
  onPropertiesChange: () => void;
}

export const PropertiesForm: React.FC<PropertiesFormProps> = ({ properties, availableProperties, setProperties, clientId, onPropertiesChange }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [relationType, setRelationType] = useState<'owner' | 'tenant' | 'interested' | 'pending_contract'>('tenant');

  const handleAssignProperty = async () => {
    if (!selectedPropertyId) {
      alert('Selecciona una propiedad');
      return;
    }

    try {
      // 1. Crear la relación cliente-propiedad
      const { data, error } = await supabase
        .from('client_property_relations')
        .insert({
          client_id: clientId,
          property_id: parseInt(selectedPropertyId),
          relation_type: relationType,
          status: 'active'
        })
        .select(`
          *,
          property:properties!inner(
            id,
            code,
            title,
            type,
            location,
            price,
            cover_image,
            bedrooms,
            bathrooms,
            area,
            status
          )
        `)
        .single();

      if (error) throw error;

      // 2. Actualizar el status de la propiedad a 'rented'
      const { error: updateError } = await supabase
        .from('properties')
        .update({ status: 'rented' })
        .eq('id', parseInt(selectedPropertyId));

      if (updateError) {
        console.error('Error actualizando status de propiedad:', updateError);
        // No lanzamos error aquí para no detener el proceso, pero lo registramos
      }

      setProperties([...properties, data]);
      setSelectedPropertyId('');
      setRelationType('tenant');
      onPropertiesChange();
    } catch (error) {
      console.error('Error asignando propiedad:', error);
      alert('Error al asignar propiedad');
    }
  };

  const handleUnassignProperty = async (relationId: string) => {
    if (!confirm('¿Estás seguro de desasignar esta propiedad del cliente?')) return;

    try {
      // 1. Obtener la información de la relación antes de eliminarla
      const relationToDelete = properties.find(p => p.id === relationId);
      if (!relationToDelete) {
        alert('No se encontró la relación a eliminar');
        return;
      }

      // 2. Eliminar la relación
      const { error } = await supabase
        .from('client_property_relations')
        .delete()
        .eq('id', relationId);

      if (error) throw error;

      // 3. Cambiar el status de la propiedad de vuelta a 'available'
      const { error: updateError } = await supabase
        .from('properties')
        .update({ status: 'available' })
        .eq('id', relationToDelete.property_id);

      if (updateError) {
        console.error('Error actualizando status de propiedad:', updateError);
        // No lanzamos error aquí para no detener el proceso, pero lo registramos
      }

      setProperties(properties.filter(p => p.id !== relationId));
      onPropertiesChange();
    } catch (error) {
      console.error('Error desasignando propiedad:', error);
      alert('Error al desasignar propiedad');
    }
  };

  const getRelationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'owner': 'Propietario',
      'tenant': 'Arrendatario',
      'interested': 'Interesado',
      'pending_contract': 'Contrato Pendiente'
    };
    return labels[type] || type;
  };

  const getRelationTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'owner': 'bg-purple-100 text-purple-800',
      'tenant': 'bg-blue-100 text-blue-800',
      'interested': 'bg-yellow-100 text-yellow-800',
      'pending_contract': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Filtrar propiedades que ya están asignadas
  const unassignedProperties = availableProperties.filter(prop =>
    !properties.some(assigned => assigned.property_id === prop.id)
  );

  return (
    <div className="space-y-6">
      {/* Formulario para asignar propiedad */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Asignar Propiedad</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Propiedad Disponible
            </label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una propiedad...</option>
              {unassignedProperties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.code} - {prop.title} ({prop.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Relación
            </label>
            <select
              value={relationType}
              onChange={(e) => setRelationType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="tenant">Arrendatario</option>
              <option value="owner">Propietario</option>
              <option value="interested">Interesado</option>
              <option value="pending_contract">Contrato Pendiente</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleAssignProperty}
            disabled={!selectedPropertyId}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Asignar Propiedad
          </button>
        </div>
      </div>

      {/* Lista de propiedades asignadas */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Propiedades Asignadas ({properties.length})</h4>

        {properties.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay propiedades asignadas
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {/* Imagen de la propiedad */}
                <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                  {prop.property.cover_image ? (
                    <img
                      src={prop.property.cover_image}
                      alt={prop.property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Información de la propiedad */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{prop.property.title || 'Sin título'}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{prop.property.code}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRelationTypeColor(prop.relation_type)}`}>
                          {getRelationTypeLabel(prop.relation_type)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnassignProperty(prop.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-4"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      🏠 {prop.property.type || 'Sin tipo'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      📍 {prop.property.location || 'Sin ubicación'}
                    </div>
                    {prop.property.bedrooms && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        🛏️ {prop.property.bedrooms} habitaciones
                      </div>
                    )}
                    {prop.property.bathrooms && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        🚿 {prop.property.bathrooms} baños
                      </div>
                    )}
                    {prop.property.area && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        📏 {prop.property.area} m²
                      </div>
                    )}
                    {prop.property.price && (
                      <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                        💰 ${prop.property.price.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Asignada el {new Date(prop.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
