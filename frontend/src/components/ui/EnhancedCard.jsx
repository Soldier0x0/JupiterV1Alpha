import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const EnhancedCard = ({ 
  title, 
  subtitle, 
  children, 
  variant = 'default',
  collapsible = false,
  defaultExpanded = false,
  priority = 'medium',
  count = null,
  actions = null,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const variants = {
    critical: 'border-l-red-500 bg-red-500/5',
    high: 'border-l-orange-500 bg-orange-500/5',
    medium: 'border-l-yellow-500 bg-yellow-500/5',
    low: 'border-l-green-500 bg-green-500/5',
    info: 'border-l-blue-500 bg-blue-500/5',
    default: 'border-l-zinc-500 bg-zinc-800/50'
  };

  const priorityIcons = {
    critical: <AlertTriangle className="w-5 h-5 text-red-400" />,
    high: <AlertTriangle className="w-5 h-5 text-orange-400" />,
    medium: <Info className="w-5 h-5 text-yellow-400" />,
    low: <CheckCircle className="w-5 h-5 text-green-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const priorityColors = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-green-400',
    info: 'text-blue-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border border-zinc-700 ${variants[variant]} ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {priorityIcons[priority]}
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              {subtitle && (
                <p className="text-sm text-zinc-400">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {count !== null && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full bg-zinc-700 ${priorityColors[priority]}`}>
                {count}
              </span>
            )}
            
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
            
            {collapsible && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-zinc-700 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {(!collapsible || isExpanded) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EnhancedCard;
