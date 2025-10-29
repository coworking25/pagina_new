import React, { createContext, useContext, ReactNode } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';

// =====================================================
// INTERFACES
// =====================================================

interface AppState {
  // Estado global de la aplicación
  currentView: string;
  lastVisitedRoute: string;
  globalFilters: Record<string, any>;
  openModals: string[];
  formData: Record<string, any>;
}

interface AppStateContextType {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  clearAppState: () => void;
}

// =====================================================
// CONTEXTO
// =====================================================

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// =====================================================
// PROVIDER
// =====================================================

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const { state: appState, setState: setAppState } = usePersistedState({
    key: 'app-global-state',
    initialValue: {
      currentView: '',
      lastVisitedRoute: '',
      globalFilters: {},
      openModals: [],
      formData: {}
    } as AppState,
    expirationTime: 24 * 60 * 60 * 1000 // 24 horas
  });

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState({
      ...appState,
      ...updates
    });
  };

  const clearAppState = () => {
    setAppState({
      currentView: '',
      lastVisitedRoute: '',
      globalFilters: {},
      openModals: [],
      formData: {}
    });
  };

  const value: AppStateContextType = {
    appState,
    updateAppState,
    clearAppState
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

// =====================================================
// HOOK
// =====================================================

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);

  if (context === undefined) {
    throw new Error('useAppState debe ser usado dentro de un AppStateProvider');
  }

  return context;
};

// =====================================================
// EXPORT
// =====================================================

export default AppStateContext;