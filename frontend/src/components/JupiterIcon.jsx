import React from 'react';

const JupiterIcon = ({ className = "w-6 h-6" }) => {
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      {/* Planet Jupiter with characteristic bands */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-b from-orange-300 via-yellow-200 to-orange-400 shadow-lg">
        {/* Jupiter's characteristic bands */}
        <div className="absolute top-2 left-0 right-0 h-0.5 bg-orange-600 opacity-60 rounded-full"></div>
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-yellow-700 opacity-40 rounded-full"></div>
        <div className="absolute bottom-3 left-0 right-0 h-0.5 bg-orange-700 opacity-50 rounded-full"></div>
        <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-yellow-800 opacity-30 rounded-full"></div>
        
        {/* Great Red Spot */}
        <div className="absolute top-1/2 right-1 w-1.5 h-1 bg-red-500 rounded-full opacity-70 transform -translate-y-1/2"></div>
      </div>
    </div>
  );
};

export default JupiterIcon;