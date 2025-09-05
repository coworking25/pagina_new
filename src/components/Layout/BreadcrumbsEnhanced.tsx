import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ComponentType<any>;
}

const BreadcrumbsEnhanced: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home/dashboard
    breadcrumbs.push({
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: HomeIcon
    });

    // Add path-based breadcrumbs
    let currentPath = '';
    
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      
      if (segment === 'admin') return; // Skip admin segment
      
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Customize labels for better UX
      switch (segment) {
        case 'properties':
          label = 'Propiedades';
          break;
        case 'clients':
          label = 'Clientes';
          break;
        case 'advisors':
          label = 'Asesores';
          break;
        case 'appointments':
          label = 'Citas';
          break;
        case 'analytics':
          label = 'Análisis';
          break;
        case 'reports':
          label = 'Reportes';
          break;
        case 'settings':
          label = 'Configuración';
          break;
        case 'dashboard':
          return; // Skip dashboard if already added
      }

      breadcrumbs.push({
        label,
        path: currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on dashboard
  }

  const handleQuickNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'h' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigate('/admin/dashboard');
    }
  };

  return (
    <nav 
      className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      aria-label="Breadcrumb"
      onKeyDown={handleQuickNavigation}
      tabIndex={0}
    >
      <div className="flex items-center space-x-1 overflow-x-auto w-full">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = breadcrumb.icon;
          
          return (
            <React.Fragment key={breadcrumb.path}>
              {index > 0 && (
                <ChevronRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
              
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center"
              >
                {isLast ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                    {Icon && (
                      <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                    <span className="font-medium text-green-700 dark:text-green-300 whitespace-nowrap">
                      {breadcrumb.label}
                    </span>
                  </div>
                ) : (
                  <Link
                    to={breadcrumb.path}
                    className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    {Icon && (
                      <Icon className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                    )}
                    <span className="hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap">
                      {breadcrumb.label}
                    </span>
                  </Link>
                )}
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

export default BreadcrumbsEnhanced;
