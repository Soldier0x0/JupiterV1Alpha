import React from 'react';
import { NavLink } from 'react-router-dom';

const SideNav = () => {
  const links = [
    { path: '/', label: 'Home' },
    { path: '/alerts', label: 'Alerts' },
    { path: '/explore', label: 'Explore' },
    { path: '/intel', label: 'Intel' },
    { path: '/entities', label: 'Entities' },
    { path: '/cases', label: 'Cases' },
    { path: '/models', label: 'Models' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="bg-zinc-900 w-64 h-screen p-4">
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-xl ${isActive ? 'bg-teal-500 text-white' : 'text-zinc-400'}`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SideNav;
