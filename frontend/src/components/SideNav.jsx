import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  AlertTriangle, 
  Search, 
  Shield, 
  Users, 
  Briefcase, 
  Cpu, 
  Settings,
  Zap,
  Building,
  GraduationCap,
  Eye,
  Brain,
  Database,
  HardDrive
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import JupiterIcon from './JupiterIcon';

const SideNav = () => {
  const { user, logout, isOwner } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: Home },
    { path: '/dashboard/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/dashboard/explore', label: 'Explore', icon: Search },
    { path: '/dashboard/intel', label: 'Intel', icon: Shield },
    { path: '/dashboard/entities', label: 'Entities', icon: Users },
    { path: '/dashboard/cases', label: 'Cases', icon: Briefcase },
    { path: '/dashboard/automations', label: 'SOAR', icon: Zap },
    { path: '/dashboard/ai-console', label: 'AI Console', icon: Brain },
    { path: '/dashboard/deception', label: 'Deception', icon: Eye },
    { path: '/dashboard/knowledge', label: 'Knowledge', icon: Database },
    { path: '/dashboard/local-models', label: 'Local Models', icon: HardDrive },
    { path: '/dashboard/mcp', label: 'MCP', icon: Zap },
    { path: '/dashboard/models', label: 'Models', icon: Cpu },
    { path: '/dashboard/training', label: 'Training', icon: GraduationCap },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings }
  ];

  const isActivePath = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="w-64 bg-background-secondary border-r border-neutral-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center space-x-3">
          <JupiterIcon className="w-8 h-8" />
          <div>
            <h1 className="text-heading text-lg font-semibold">Jupiter</h1>
            <p className="text-caption">Security Platform</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-6 border-b border-neutral-800">
          <div className="bg-background-tertiary rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-neutral-200 text-sm font-medium truncate">{user.email}</p>
                <p className="text-caption text-xs">
                  {isOwner && <span className="text-primary-400 mr-1">★</span>}
                  {isOwner ? 'Administrator' : 'User'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 border-r-2 border-primary-500'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                } flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium relative`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : 'text-neutral-500'}`} />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Admin Section */}
        {isOwner && (
          <div className="mt-8">
            <div className="px-4 mb-3">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Administration</p>
            </div>
            <NavLink
              to="/dashboard/admin/tenants"
              className={`${
                isActivePath('/dashboard/admin/tenants')
                  ? 'bg-primary-500/10 text-primary-400 border-r-2 border-primary-500'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              } flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium`}
            >
              <Building className="w-5 h-5" />
              <span className="text-sm">Tenant Management</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={logout}
          className="w-full btn-ghost text-sm py-2"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default SideNav;