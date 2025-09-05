import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  LayoutDashboard,
  Building,
  Users,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  MapPin,
  DollarSign,
  UserCheck
} from 'lucide-react';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeMap: { [key: string]: { title: string; icon: React.ComponentType<any> } } = {
    'admin': { title: 'Administración', icon: Settings },
    'dashboard': { title: 'Dashboard', icon: LayoutDashboard },
    'properties': { title: 'Propiedades', icon: Building },
    'clients': { title: 'Clientes', icon: Users },
    'advisors': { title: 'Asesores', icon: UserCheck },
    'appointments': { title: 'Citas', icon: Calendar },
    'reports': { title: 'Reportes', icon: BarChart3 },
    'settings': { title: 'Configuración', icon: Settings },
    'payments': { title: 'Finanzas', icon: DollarSign },
    'locations': { title: 'Ubicaciones', icon: MapPin },
    'documents': { title: 'Documentos', icon: FileText }
  };

  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: any[] = [];

    pathSegments.forEach((segment, index) => {
      const route = routeMap[segment];
      if (route) {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        breadcrumbs.push({
          title: route.title,
          path: path,
          icon: route.icon,
          isLast: index === pathSegments.length - 1
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6 bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {breadcrumbs.map((crumb, index) => {
        const Icon = crumb.icon;
        return (
          <React.Fragment key={crumb.path}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            )}
            <button
              onClick={() => navigate(crumb.path)}
              disabled={crumb.isLast}
              className={`
                flex items-center space-x-1 px-2 py-1 rounded transition-colors
                ${crumb.isLast 
                  ? 'text-green-600 dark:text-green-400 font-medium cursor-default' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{crumb.title}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
