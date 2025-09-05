import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  customItems?: Array<{
    label: string;
    href?: string;
  }>;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customItems }) => {
  const location = useLocation();
  
  const getPathSegments = () => {
    if (customItems) {
      return customItems;
    }
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ label: string; href?: string }> = [
      { label: 'Dashboard', href: '/admin/dashboard' }
    ];
    
    const routeNames: Record<string, string> = {
      'admin': 'Administración',
      'dashboard': 'Dashboard',
      'appointments': 'Citas',
      'properties': 'Propiedades',
      'advisors': 'Asesores',
      'reports': 'Reportes',
      'service-inquiries': 'Consultas'
    };
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      if (segment !== 'admin' && index > 0) {
        const isLast = index === pathSegments.length - 1;
        breadcrumbs.push({
          label: routeNames[segment] || segment,
          href: isLast ? undefined : currentPath
        });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getPathSegments();

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
      <Link
        to="/admin/dashboard"
        className="flex items-center hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
