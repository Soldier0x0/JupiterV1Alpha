import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EnhancedTabs = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  variant = 'default',
  className = '' 
}) => {
  const variants = {
    default: 'border-b border-zinc-700',
    pills: 'bg-zinc-800 p-1 rounded-lg',
    cards: 'space-y-2'
  };

  const tabVariants = {
    default: {
      active: 'text-white bg-zinc-800 border-b-2 border-yellow-400',
      inactive: 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    },
    pills: {
      active: 'text-white bg-zinc-700 shadow-sm',
      inactive: 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
    },
    cards: {
      active: 'text-white bg-zinc-800 border-zinc-600',
      inactive: 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 border-zinc-700'
    }
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      <div className={`flex ${variant === 'cards' ? 'flex-col' : 'flex-wrap gap-2'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${variant === 'cards' ? 'border' : ''}
              ${activeTab === tab.id 
                ? tabVariants[variant].active 
                : tabVariants[variant].inactive
              }
            `}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-2 py-0.5 text-xs bg-zinc-600 text-zinc-300 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EnhancedTabs;
