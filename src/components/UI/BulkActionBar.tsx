import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Edit, Check, Download, Mail, Tag, UserPlus, Star } from 'lucide-react';
import { ReactNode } from 'react';

export interface BulkAction {
  id: string;
  label: string;
  icon: ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'primary';
  onClick: () => void;
}

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: BulkAction[];
  entityName?: string; // "propiedades", "citas", "clientes"
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  actions,
  entityName = 'elementos'
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  const getVariantStyles = (variant: BulkAction['variant'] = 'default') => {
    const styles = {
      default: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
      danger: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30',
      success: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30',
      primary: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
    };
    return styles[variant];
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4 backdrop-blur-lg">
          {/* Contador */}
          <div className="flex items-center gap-2 text-white font-medium">
            <div className="bg-white/20 rounded-full px-3 py-1">
              <span className="text-sm font-bold">{selectedCount}</span>
            </div>
            <span className="text-sm">
              {selectedCount === 1 ? entityName.slice(0, -1) : entityName} seleccionado{selectedCount === 1 ? '' : 's'}
            </span>
          </div>

          {/* Separador */}
          <div className="h-8 w-px bg-white/30" />

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                  transition-all duration-200 transform hover:scale-105
                  ${getVariantStyles(action.variant)}
                `}
                title={action.label}
              >
                {action.icon}
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClearSelection}
            className="ml-2 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Deseleccionar todo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Iconos predefinidos para acciones comunes
export const BulkActionIcons = {
  Delete: <Trash2 className="w-4 h-4" />,
  Edit: <Edit className="w-4 h-4" />,
  Check: <Check className="w-4 h-4" />,
  Download: <Download className="w-4 h-4" />,
  Email: <Mail className="w-4 h-4" />,
  Tag: <Tag className="w-4 h-4" />,
  AssignUser: <UserPlus className="w-4 h-4" />,
  Feature: <Star className="w-4 h-4" />
};
