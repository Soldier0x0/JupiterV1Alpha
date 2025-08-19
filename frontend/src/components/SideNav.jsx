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
    <div className="w-64 bg-[#111214] border-r border-zinc-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <JupiterIcon className="w-8 h-8" />
          <div>
            <h1 className="text-white font-bold text-lg">Jupiter</h1>
            <p className="text-zinc-500 text-sm">Security Hub</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 pb-4">
          <div className="bg-[#0b0c10] rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.email}</p>
                <p className="text-zinc-400 text-xs">
                  {isOwner && <span className="text-red-400 mr-1">👑</span>}
                  {isOwner ? 'Owner' : 'Member'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group relative ${
                  isActive
                    ? 'bg-red-500 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`} />
                <span className="text-sm font-medium">{item.label}</span>
                
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-lg" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Admin Section */}
        {isOwner && (
          <div className="mt-8">
            <div className="px-4 mb-2">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Administration</p>
            </div>
            <NavLink
              to="/dashboard/admin/tenants"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActivePath('/dashboard/admin/tenants')
                  ? 'bg-red-500 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              <Building className="w-5 h-5" />
              <span className="text-sm font-medium">Tenant Management</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-700">
        <button
          onClick={logout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideNav;