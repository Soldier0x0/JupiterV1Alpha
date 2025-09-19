import React from 'react';
import { motion } from 'framer-motion';

// Skeleton Loading Components
export const SkeletonCard = ({ lines = 2, className = '' }) => (
  <div className={`p-4 bg-zinc-800 rounded-lg border border-zinc-700 ${className}`}>
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-zinc-700 rounded w-full"></div>
      ))}
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
    <div className="p-4 border-b border-zinc-700">
      <div className="animate-pulse">
        <div className="h-4 bg-zinc-700 rounded w-1/4"></div>
      </div>
    </div>
    <div className="divide-y divide-zinc-700">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4">
          <div className="animate-pulse flex space-x-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="h-3 bg-zinc-700 rounded flex-1"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="p-6 bg-zinc-800 rounded-lg border border-zinc-700">
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-zinc-700 rounded w-1/3"></div>
      <div className="h-32 bg-zinc-700 rounded"></div>
      <div className="flex space-x-4">
        <div className="h-3 bg-zinc-700 rounded w-1/4"></div>
        <div className="h-3 bg-zinc-700 rounded w-1/4"></div>
        <div className="h-3 bg-zinc-700 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

// Loading Spinner
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizes[size]} border-2 border-zinc-300 border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

// Loading Overlay
export const LoadingOverlay = ({ message = 'Loading...', children }) => (
  <div className="relative">
    {children}
    <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
        <div className="flex items-center space-x-3">
          <LoadingSpinner />
          <span className="text-white">{message}</span>
        </div>
      </div>
    </div>
  </div>
);

// Empty State
export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action = null,
  className = '' 
}) => (
  <div className={`text-center py-12 ${className}`}>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4"
    >
      <Icon className="w-8 h-8 text-zinc-400" />
    </motion.div>
    <motion.h3
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-xl font-semibold text-white mb-2"
    >
      {title}
    </motion.h3>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="text-zinc-400 mb-6 max-w-md mx-auto"
    >
      {description}
    </motion.p>
    {action && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {action}
      </motion.div>
    )}
  </div>
);

// Error State
export const ErrorState = ({ 
  title = 'Something went wrong', 
  description, 
  retry = null,
  className = '' 
}) => (
  <div className={`text-center py-12 ${className}`}>
    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    {description && (
      <p className="text-zinc-400 mb-6 max-w-md mx-auto">{description}</p>
    )}
    {retry && (
      <button
        onClick={retry}
        className="btn-primary"
      >
        Try Again
      </button>
    )}
  </div>
);
