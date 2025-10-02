import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  loginUser, 
  logoutUser, 
  getCurrentUser, 
  isAuthenticated,
  isAdmin,
  isAdvisor,
  onAuthStateChange,
  updateUserProfile,
  changePassword,
  requestPasswordReset,
  UserProfile
} from '../lib/supabase';

// =====================================================
// INTERFACES
// =====================================================

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAdvisor: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// =====================================================
// CONTEXT
// =====================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =====================================================
// PROVIDER
// =====================================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const [isAdminState, setIsAdminState] = useState(false);
  const [isAdvisorState, setIsAdvisorState] = useState(false);

  // Cargar usuario al iniciar
  useEffect(() => {
    loadUser();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = onAuthStateChange((event) => {
      console.log('🔔 Auth event:', event);
      
      if (event === 'SIGNED_IN') {
        loadUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticatedState(false);
        setIsAdminState(false);
        setIsAdvisorState(false);
      } else if (event === 'TOKEN_REFRESHED') {
        loadUser();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Función para cargar usuario
  const loadUser = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Cargando usuario...');

      const authenticated = await isAuthenticated();
      setIsAuthenticatedState(authenticated);

      if (authenticated) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          // Verificar roles
          const adminStatus = await isAdmin();
          const advisorStatus = await isAdvisor();
          
          setIsAdminState(adminStatus);
          setIsAdvisorState(advisorStatus);

          console.log('✅ Usuario cargado:', {
            email: currentUser.email,
            role: currentUser.role,
            isAdmin: adminStatus,
            isAdvisor: advisorStatus
          });
        }
      } else {
        setUser(null);
        setIsAdminState(false);
        setIsAdvisorState(false);
      }

    } catch (error) {
      console.error('❌ Error cargando usuario:', error);
      setUser(null);
      setIsAuthenticatedState(false);
      setIsAdminState(false);
      setIsAdvisorState(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Función de login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Iniciando login...');

      const response = await loginUser(email, password);
      setUser(response.user);
      setIsAuthenticatedState(true);

      // Verificar roles
      const adminStatus = await isAdmin();
      const advisorStatus = await isAdvisor();
      
      setIsAdminState(adminStatus);
      setIsAdvisorState(advisorStatus);

      console.log('✅ Login exitoso');

    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('🔓 Cerrando sesión...');

      await logoutUser();
      
      setUser(null);
      setIsAuthenticatedState(false);
      setIsAdminState(false);
      setIsAdvisorState(false);

      console.log('✅ Sesión cerrada');

    } catch (error) {
      console.error('❌ Error en logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      console.log('📝 Actualizando perfil...');

      const updatedProfile = await updateUserProfile(updates);
      setUser(updatedProfile);

      console.log('✅ Perfil actualizado');

    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      throw error;
    }
  };

  // Función para cambiar contraseña
  const changePasswordHandler = async (newPassword: string) => {
    try {
      console.log('🔑 Cambiando contraseña...');

      await changePassword(newPassword);

      console.log('✅ Contraseña cambiada');

    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      throw error;
    }
  };

  // Función para solicitar reseteo de contraseña
  const requestPasswordResetHandler = async (email: string) => {
    try {
      console.log('📧 Solicitando reseteo de contraseña...');

      await requestPasswordReset(email);

      console.log('✅ Email de reseteo enviado');

    } catch (error) {
      console.error('❌ Error solicitando reseteo:', error);
      throw error;
    }
  };

  // Función para refrescar usuario
  const refreshUser = async () => {
    await loadUser();
  };

  // Valor del contexto
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: isAuthenticatedState,
    isAdmin: isAdminState,
    isAdvisor: isAdvisorState,
    login,
    logout,
    updateProfile,
    changePassword: changePasswordHandler,
    requestPasswordReset: requestPasswordResetHandler,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =====================================================
// HOOK
// =====================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

// =====================================================
// EXPORT
// =====================================================

export default AuthContext;
