import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

const ProgressiveDisclosure = ({ 
  title, 
  summary, 
  details, 
  level = 'medium',
  defaultExpanded = false,
  showToggle = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const levelStyles = {
    high: 'bg-zinc-800 border-zinc-600',
    medium: 'bg-zinc-800/80 border-zinc-700',
    low: 'bg-zinc-800/60 border-zinc-700/80'
  };

  return (
    <div className={`rounded-lg border ${levelStyles[level]} ${className}`}>
      {/* Summary View */}
      <div 
        className={`p-4 ${showToggle ? 'cursor-pointer hover:bg-zinc-700/50' : ''} transition-colors`}
        onClick={() => showToggle && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-white mb-1">{title}</h4>
            <p className="text-sm text-zinc-300">{summary}</p>
          </div>
          
          {showToggle && (
            <div className="flex items-center space-x-2 ml-4">
              <span className="text-xs text-zinc-400">
                {isExpanded ? 'Hide details' : 'Show details'}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detailed View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-zinc-700/50"
          >
            <div className="p-4 bg-zinc-900/50">
              {details}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressiveDisclosure;
