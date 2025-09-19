import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  AlertTriangle, 
  Search, 
  Shield, 
  Users, 
  Briefcase, 
  Settings,
  Target
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import JupiterIcon from './JupiterIcon';

const SideNav = () => {
  const { user, logout, isOwner } = useAuth();
  const location = useLocation();

  // Simplified navigation - 7 main sections
  const navItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: Home,
      description: 'Overview and key metrics'
    },
    { 
      path: '/dashboard/alerts', 
      label: 'Alerts', 
      icon: AlertTriangle,
      description: 'Security alerts and investigations'
    },
    { 
      path: '/dashboard/logs', 
      label: 'Logs', 
      icon: Search,
      description: 'Log search and analysis'
    },
        {
          path: '/dashboard/frameworks',
          label: 'Frameworks',
          icon: Shield,
          description: 'Cybersecurity framework analysis'
        },
        {
          path: '/dashboard/extended-frameworks',
          label: 'Extended Frameworks',
          icon: Shield,
          description: 'Advanced security frameworks and fatigue management'
        },
        {
          path: '/dashboard/analyst-features',
          label: 'Analyst Features',
          icon: Target,
          description: 'Reporting, flagging, and gamification'
        },
        {
          path: '/dashboard/security-ops',
          label: 'Security Ops',
          icon: Settings,
          description: 'Admin controls and security monitoring'
        },
        {
          path: '/dashboard/entities',
          label: 'Entities',
          icon: Users,
          description: 'Users, hosts, and assets'
        },
    { 
      path: '/dashboard/intelligence', 
      label: 'Intelligence', 
      icon: Shield,
      description: 'Threat intelligence and IOCs'
    },
    { 
      path: '/dashboard/cases', 
      label: 'Cases', 
      icon: Briefcase,
      description: 'Incident management'
    },
    { 
      path: '/dashboard/settings', 
      label: 'Settings', 
      icon: Settings,
      description: 'Configuration and preferences'
    }
  ];

  const isActivePath = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <JupiterIcon className="w-6 h-6 rounded-full" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Jupiter</h1>
            <p className="text-xs text-zinc-400">SIEM Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2" role="navigation" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                group flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-zinc-900
                ${isActive 
                  ? 'bg-yellow-500/10 text-yellow-400 border-l-4 border-yellow-500' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
              aria-describedby={`nav-${item.path.replace(/[^a-zA-Z0-9]/g, '')}-desc`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.label}</p>
                <p 
                  id={`nav-${item.path.replace(/[^a-zA-Z0-9]/g, '')}-desc`}
                  className="text-xs text-zinc-500 group-hover:text-zinc-400"
                >
                  {item.description}
                </p>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <span className="text-yellow-400 text-sm font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-zinc-500">
              {isOwner ? 'Owner' : 'Analyst'}
            </p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default SideNav;