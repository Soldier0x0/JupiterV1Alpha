import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  
  // Define route mappings
  const routeMap = {
    '/dashboard': 'Dashboard',
    '/dashboard/alerts': 'Alerts',
    '/dashboard/logs': 'Logs',
    '/dashboard/entities': 'Entities',
    '/dashboard/intelligence': 'Intelligence',
    '/dashboard/cases': 'Cases',
    '/dashboard/settings': 'Settings'
  };

  // Generate breadcrumb items
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: 'Home', path: '/dashboard', icon: Home }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Don't add the last segment if it's the same as the previous one
      if (index > 0 && pathSegments[index - 1] !== segment) {
        breadcrumbs.push({
          label,
          path: currentPath,
          isLast: index === pathSegments.length - 1
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on the main dashboard
  if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.path}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          )}
          {breadcrumb.isLast ? (
            <span className="text-zinc-300 font-medium">
              {breadcrumb.icon && <breadcrumb.icon className="w-4 h-4 inline mr-1" />}
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              to={breadcrumb.path}
              className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center"
            >
              {breadcrumb.icon && <breadcrumb.icon className="w-4 h-4 mr-1" />}
              {breadcrumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
