// Archivo de tema centralizado para Coworking Inmobiliario
export const brandTheme = {
  // Colores principales de la marca
  colors: {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7', 
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',  // Verde principal
      600: '#16a34a',  // Verde oscuro
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    accent: {
      gold: '#fbbf24',
      orange: '#f97316',
      blue: '#3b82f6',
      purple: '#8b5cf6',
      red: '#ef4444',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    }
  },

  // Gradientes personalizados
  gradients: {
    primary: 'from-green-400 to-green-600',
    secondary: 'from-gray-50 to-gray-100',
    dark: 'from-gray-800 to-gray-900',
    success: 'from-green-400 via-green-500 to-green-600',
    accent: 'from-blue-500 via-purple-500 to-green-500',
  },

  // Tipografía
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Poppins', 'Inter', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    }
  },

  // Espaciado y layout
  spacing: {
    sidebar: {
      width: '16rem',     // 256px
      collapsed: '4rem',  // 64px
    },
    topbar: {
      height: '3.5rem',   // 56px
    },
    content: {
      padding: '1.5rem',  // 24px
      maxWidth: '120rem', // 1920px
    }
  },

  // Componentes específicos
  components: {
    card: {
      shadow: 'shadow-lg hover:shadow-xl',
      border: 'border border-gray-200 dark:border-gray-700',
      background: 'bg-white dark:bg-gray-800',
      radius: 'rounded-lg',
    },
    button: {
      primary: 'bg-green-600 hover:bg-green-700 text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      radius: 'rounded-lg',
      shadow: 'shadow-sm hover:shadow-md',
    },
    input: {
      base: 'border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
      focus: 'focus:ring-2 focus:ring-green-500 focus:border-transparent',
    }
  },

  // Configuración del sidebar por categorías
  navigation: {
    categories: {
      dashboard: {
        color: 'bg-blue-600',
        lightColor: 'bg-blue-50 dark:bg-blue-900/20',
        textColor: 'text-blue-600 dark:text-blue-400',
      },
      properties: {
        color: 'bg-green-600',
        lightColor: 'bg-green-50 dark:bg-green-900/20',
        textColor: 'text-green-600 dark:text-green-400',
      },
      clients: {
        color: 'bg-purple-600',
        lightColor: 'bg-purple-50 dark:bg-purple-900/20',
        textColor: 'text-purple-600 dark:text-purple-400',
      },
      advisors: {
        color: 'bg-orange-600',
        lightColor: 'bg-orange-50 dark:bg-orange-900/20',
        textColor: 'text-orange-600 dark:text-orange-400',
      },
      appointments: {
        color: 'bg-pink-600',
        lightColor: 'bg-pink-50 dark:bg-pink-900/20',
        textColor: 'text-pink-600 dark:text-pink-400',
      },
      finances: {
        color: 'bg-emerald-600',
        lightColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        textColor: 'text-emerald-600 dark:text-emerald-400',
      },
      analytics: {
        color: 'bg-indigo-600',
        lightColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        textColor: 'text-indigo-600 dark:text-indigo-400',
      },
      system: {
        color: 'bg-gray-600',
        lightColor: 'bg-gray-50 dark:bg-gray-900/20',
        textColor: 'text-gray-600 dark:text-gray-400',
      }
    }
  },

  // Información de la empresa
  brand: {
    name: 'Coworking Inmobiliario',
    tagline: 'La luz te guía a casa',
    logo: '/logo-coworking.png',
    contact: {
      phone: '+57 300 123 4567',
      email: 'info@coworkinginmobiliario.com',
      address: 'Medellín, Colombia',
      whatsapp: '+57 300 123 4567',
    },
    social: {
      facebook: '#',
      instagram: '#', 
      twitter: '#',
      linkedin: '#',
    }
  },

  // Animaciones
  animations: {
    transition: 'transition-all duration-200 ease-in-out',
    hover: 'hover:scale-105 hover:shadow-lg',
    slideIn: 'animate-in slide-in-from-left duration-300',
    fadeIn: 'animate-in fade-in duration-300',
  }
};

// Utilidades para usar el tema
export const getNavigationColor = (category: keyof typeof brandTheme.navigation.categories) => {
  return brandTheme.navigation.categories[category];
};

export const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info') => {
  const colors = {
    success: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20', 
    error: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    info: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  };
  return colors[status];
};

export default brandTheme;
