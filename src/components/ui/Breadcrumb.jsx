import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname?.split('/')?.filter((x) => x);

  const breadcrumbMap = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    'project-details': 'Project Details',
    clients: 'Clients',
    quotes: 'Quotes',
    invoices: 'Invoices',
    analytics: 'Analytics',
    settings: 'Settings',
    items: 'Items',
    'add-edit-item': 'Add/Edit Item',
  };

  const getBreadcrumbName = (pathname) => {
    return breadcrumbMap?.[pathname] || pathname?.charAt(0)?.toUpperCase() + pathname?.slice(1);
  };

  const getBreadcrumbPath = (index) => {
    return '/' + pathnames?.slice(0, index + 1)?.join('/');
  };

  if (pathnames?.length === 0 || (pathnames?.length === 1 && pathnames?.[0] === 'dashboard')) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 px-4 lg:px-6 py-3 bg-background border-b border-border text-sm">
      <Link
        to="/dashboard"
        className="flex items-center text-muted-foreground hover:text-foreground construction-transition"
      >
        <Icon name="Home" size={16} className="mr-1" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>
      {pathnames?.map((pathname, index) => {
        const isLast = index === pathnames?.length - 1;
        const path = getBreadcrumbPath(index);
        const name = getBreadcrumbName(pathname);

        return (
          <React.Fragment key={path}>
            <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            {isLast ? (
              <span className="text-foreground font-medium truncate">{name}</span>
            ) : (
              <Link
                to={path}
                className="text-muted-foreground hover:text-foreground construction-transition truncate"
              >
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;