import { useState, useCallback, useMemo } from 'react';

export interface UseMultiSelectOptions<T> {
  items: T[];
  getItemId: (item: T) => string | number;
}

export function useMultiSelect<T>({ items, getItemId }: UseMultiSelectOptions<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Seleccionar/deseleccionar un item
  const toggleSelect = useCallback((id: string | number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Seleccionar todos
  const selectAll = useCallback(() => {
    const allIds = items.map(item => getItemId(item));
    setSelectedIds(new Set(allIds));
  }, [items, getItemId]);

  // Deseleccionar todos
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Verificar si un item está seleccionado
  const isSelected = useCallback((id: string | number) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  // Verificar si todos están seleccionados
  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedIds.size === items.length;
  }, [items.length, selectedIds.size]);

  // Verificar si algunos están seleccionados (para estado indeterminado)
  const isSomeSelected = useMemo(() => {
    return selectedIds.size > 0 && selectedIds.size < items.length;
  }, [items.length, selectedIds.size]);

  // Obtener items seleccionados
  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.has(getItemId(item)));
  }, [items, selectedIds, getItemId]);

  // Contar seleccionados
  const selectedCount = selectedIds.size;

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  }, [isAllSelected, clearSelection, selectAll]);

  return {
    selectedIds,
    selectedItems,
    selectedCount,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isSomeSelected,
    toggleSelectAll
  };
}
