import React from 'react';
import { NavLink } from 'react-router-dom';
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
  const { user, isOwner } = useAuth();

  const links = [
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
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  // Add admin links for owners
  if (isOwner) {
    links.push({
      path: '/dashboard/admin/tenants',
      label: 'Tenants',
      icon: Building
    });
  }

  return (
    <nav className="bg-[#111214] w-64 h-screen border-r border-red-600/20 overflow-y-auto">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <JupiterIcon className="w-10 h-10 rounded-full" />
          <div>
            <h2 className="font-bold text-white">Jupiter</h2>
            <p className="text-xs text-zinc-500">Security Hub</p>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-[#0b0c10] rounded-lg p-4 mb-6 border border-zinc-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">{user.email}</p>
                <p className="text-xs text-zinc-500 flex items-center">
                  {isOwner && <span className="text-red-400 mr-1">👑</span>}
                  {isOwner ? 'Owner' : 'Member'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  isActive 
                    ? 'flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500 text-white font-medium transition-colors duration-200'
                    : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors duration-200'
                }
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default SideNav;