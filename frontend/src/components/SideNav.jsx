import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Building
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

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
    { path: '/dashboard/models', label: 'Models', icon: Cpu },
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
    <motion.nav 
      className="bg-cosmic-dark/90 backdrop-blur-sm w-64 h-screen border-r border-cosmic-border overflow-y-auto"
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6">
        {/* Logo */}
        <motion.div 
          className="flex items-center space-x-3 mb-8"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-jupiter-secondary to-jupiter-primary rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-cosmic-black" />
          </div>
          <div>
            <h2 className="font-bold text-gradient">Jupiter</h2>
            <p className="text-xs text-zinc-500">Security Hub</p>
          </div>
        </motion.div>

        {/* User Info */}
        {user && (
          <motion.div 
            className="bg-cosmic-gray/50 rounded-xl p-4 mb-6 border border-cosmic-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-jupiter-secondary rounded-lg flex items-center justify-center">
                <span className="text-cosmic-black text-sm font-bold">
                  {user.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">{user.email}</p>
                <p className="text-xs text-zinc-500 flex items-center">
                  {isOwner && <span className="text-jupiter-warning mr-1">👑</span>}
                  {isOwner ? 'Owner' : 'Member'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Links */}
        <ul className="space-y-2">
          {links.map((link, index) => (
            <motion.li 
              key={link.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  isActive ? 'nav-link-active' : 'nav-link'
                }
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
};

export default SideNav;