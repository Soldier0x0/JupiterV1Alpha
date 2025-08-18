import React from 'react';
import { NavLink } from 'react-router-dom';

const SideNav = () => {
  const links = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/alerts', label: 'Alerts', icon: 'bell' },
    { path: '/explore', label: 'Explore', icon: 'search' },
    { path: '/intel', label: 'Intel', icon: 'shield' },
    { path: '/entities', label: 'Entities', icon: 'users' },
    { path: '/cases', label: 'Cases', icon: 'briefcase' },
    { path: '/models', label: 'Models', icon: 'cpu' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <nav className="bg-zinc-900 w-64 h-screen p-4">
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 block px-4 py-2 rounded-xl ${isActive ? 'bg-teal-500 text-white' : 'text-zinc-400'}`
              }
            >
              <span className={`lucide-${link.icon}`} />
              <span>{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SideNav;
