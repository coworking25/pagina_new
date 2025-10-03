import { useState, useCallback } from 'react';
import { PaginationOptions, PaginatedResponse } from '../lib/supabase';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
}

interface UsePaginationReturn<T> {
  // Estado
  currentPage: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  isLoading: boolean;
  data: T[];
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;

  // Acciones
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSort: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  setSearch: (search: string) => void;
  resetPagination: () => void;

  // Utilidades
  paginationOptions: PaginationOptions;
  loadData: (fetchFunction: (options: PaginationOptions) => Promise<PaginatedResponse<T>>) => Promise<void>;
}

export function usePagination<T>({
  initialPage = 1,
  initialLimit = 10,
  initialSortBy,
  initialSortOrder = 'desc'
}: UsePaginationOptions = {}): UsePaginationReturn<T> {
  // Estado básico de paginación
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [search, setSearch] = useState('');

  // Estado de datos
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Opciones de paginación para las consultas
  const paginationOptions: PaginationOptions = {
    page: currentPage,
    limit,
    sortBy,
    sortOrder,
    search: search || undefined
  };

  // Función para cargar datos
  const loadData = useCallback(async (
    fetchFunction: (options: PaginationOptions) => Promise<PaginatedResponse<T>>
  ) => {
    setIsLoading(true);
    try {
      const response = await fetchFunction(paginationOptions);

      setData(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setHasNext(response.hasNext);
      setHasPrev(response.hasPrev);
    } catch (error) {
      console.error('❌ Error loading paginated data:', error);
      // Resetear estado en caso de error
      setData([]);
      setTotal(0);
      setTotalPages(0);
      setHasNext(false);
      setHasPrev(false);
    } finally {
      setIsLoading(false);
    }
  }, [paginationOptions]);

  // Acciones
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setLimitValue = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Resetear a primera página cuando cambia el límite
  }, []);

  const setSort = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc' = 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Resetear a primera página cuando cambia el ordenamiento
  }, []);

  const setSearchValue = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setCurrentPage(1); // Resetear a primera página cuando cambia la búsqueda
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setLimit(initialLimit);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
    setSearch('');
  }, [initialPage, initialLimit, initialSortBy, initialSortOrder]);

  return {
    // Estado
    currentPage,
    limit,
    sortBy,
    sortOrder,
    search,
    isLoading,
    data,
    total,
    totalPages,
    hasNext,
    hasPrev,

    // Acciones
    setPage,
    setLimit: setLimitValue,
    setSort,
    setSearch: setSearchValue,
    resetPagination,

    // Utilidades
    paginationOptions,
    loadData
  };
}