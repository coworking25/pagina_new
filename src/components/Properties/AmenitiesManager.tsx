import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  X, 
  Save,
  Wifi,
  Car,
  Shield,
  Dumbbell,
  Trees,
  ArrowUp,
  Sofa,
  Wind,
  Zap,
  Dog,
  ShoppingCart,
  Star
} from 'lucide-react';
import { getAmenities, createAmenity, deleteAmenity, Amenity } from '../../lib/supabase';

interface AmenitiesManagerProps {
  onClose: () => void;
  onUpdate: () => void; // Para notificar al padre que recargue la lista
}

export default function AmenitiesManager({ onClose, onUpdate }: AmenitiesManagerProps) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Formulario para nueva amenidad
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Otros');
  const [newIcon, setNewIcon] = useState('Star');

  const categories = [
    'Tecnología',
    'Estacionamiento',
    'Seguridad',
    'Recreación',
    'Zonas Verdes',
    'Servicios',
    'Mobiliario',
    'Clima',
    'Servicios Públicos',
    'Mascotas',
    'Cercanías',
    'Otros'
  ];

  const commonIcons = [
    { name: 'Wifi', icon: Wifi },
    { name: 'Car', icon: Car },
    { name: 'Shield', icon: Shield },
    { name: 'Dumbbell', icon: Dumbbell },
    { name: 'Trees', icon: Trees },
    { name: 'ArrowUp', icon: ArrowUp },
    { name: 'Sofa', icon: Sofa },
    { name: 'Wind', icon: Wind },
    { name: 'Zap', icon: Zap },
    { name: 'Dog', icon: Dog },
    { name: 'ShoppingCart', icon: ShoppingCart },
    { name: 'Star', icon: Star }
  ];

  useEffect(() => {
    loadAmenities();
  }, []);

  const loadAmenities = async () => {
    setLoading(true);
    try {
      const data = await getAmenities();
      setAmenities(data);
    } catch (error) {
      console.error('Error loading amenities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    try {
      await createAmenity({
        name: newName.trim(),
        category: newCategory,
        icon_name: newIcon
      });
      setNewName('');
      await loadAmenities();
      onUpdate(); // Notificar cambio
    } catch (error) {
      console.error('Error creating amenity:', error);
      alert('Error al crear la amenidad');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro? Esto eliminará la amenidad de la lista de selección (no de las propiedades que ya la tienen).')) return;

    try {
      await deleteAmenity(id);
      setAmenities(prev => prev.filter(a => a.id !== id));
      onUpdate();
    } catch (error) {
      console.error('Error deleting amenity:', error);
      alert('Error al eliminar la amenidad');
    }
  };

  // Agrupar por categoría
  const groupedAmenities = amenities.reduce((acc, amenity) => {
    const cat = amenity.category || 'Otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(amenity);
    return acc;
  }, {} as Record<string, Amenity[]>);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Gestionar Catálogo de Amenidades
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {/* Formulario de creación */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Agregar Nueva Amenidad</h4>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre (ej: Jacuzzi)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <select
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {commonIcons.map(icon => (
                  <option key={icon.name} value={icon.name}>{icon.name}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={submitting || !newName.trim()}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Lista de amenidades */}
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedAmenities).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 pl-2 border-l-4 border-blue-500">
                  {category}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {items.map(amenity => (
                    <div key={amenity.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <Star className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{amenity.name}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(amenity.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
