import React from 'react';

const JupiterIcon = ({ className = "w-6 h-6" }) => {
  return (
    <div className={`${className} relative`}>
      {/* Professional Jupiter SIEM Logo */}
      <svg 
        viewBox="0 0 48 48" 
        className="w-full h-full"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring - Security perimeter */}
        <circle 
          cx="24" 
          cy="24" 
          r="23" 
          stroke="url(#gradient1)" 
          strokeWidth="1"
          className="opacity-60"
        />
        
        {/* Inner security layers */}
        <circle 
          cx="24" 
          cy="24" 
          r="18" 
          stroke="url(#gradient2)" 
          strokeWidth="1.5"
          className="opacity-80"
        />
        
        {/* Core Jupiter planet with modern gradient */}
        <circle 
          cx="24" 
          cy="24" 
          r="14" 
          fill="url(#jupiterGradient)"
        />
        
        {/* Jupiter's signature bands - stylized */}
        <ellipse 
          cx="24" 
          cy="20" 
          rx="12" 
          ry="2" 
          fill="url(#bandGradient1)"
          className="opacity-40"
        />
        <ellipse 
          cx="24" 
          cy="24" 
          rx="13" 
          ry="1.5" 
          fill="url(#bandGradient2)"
          className="opacity-50"
        />
        <ellipse 
          cx="24" 
          cy="28" 
          rx="11" 
          ry="2" 
          fill="url(#bandGradient3)"
          className="opacity-45"
        />
        
        {/* Central security shield */}
        <path 
          d="M24 14L29 17V24C29 27.5 26.5 30 24 30C21.5 30 19 27.5 19 24V17L24 14Z" 
          fill="url(#shieldGradient)"
          className="opacity-90"
        />
        
        {/* Security checkmark */}
        <path 
          d="M21.5 23L23.5 25L26.5 21" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="opacity-95"
        />
        
        {/* Orbital scanning lines */}
        <circle 
          cx="24" 
          cy="24" 
          r="20" 
          stroke="url(#scanGradient)" 
          strokeWidth="0.5"
          strokeDasharray="3 6"
          className="opacity-30 animate-spin"
          style={{ animationDuration: '20s' }}
        />
        
        <defs>
          {/* Professional gradient definitions */}
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#F7931E" />
          </linearGradient>
          
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8A50" />
            <stop offset="100%" stopColor="#FFB627" />
          </linearGradient>
          
          <radialGradient id="jupiterGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="40%" stopColor="#FF8C00" />
            <stop offset="80%" stopColor="#FF6347" />
            <stop offset="100%" stopColor="#DC143C" />
          </radialGradient>
          
          <linearGradient id="bandGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="50%" stopColor="#D2691E" />
            <stop offset="100%" stopColor="#8B4513" />
          </linearGradient>
          
          <linearGradient id="bandGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A0522D" />
            <stop offset="50%" stopColor="#F4A460" />
            <stop offset="100%" stopColor="#A0522D" />
          </linearGradient>
          
          <linearGradient id="bandGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#CD853F" />
            <stop offset="50%" stopColor="#DEB887" />
            <stop offset="100%" stopColor="#CD853F" />
          </linearGradient>
          
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4FC3F7" />
            <stop offset="50%" stopColor="#29B6F6" />
            <stop offset="100%" stopColor="#0277BD" />
          </linearGradient>
          
          <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E676" />
            <stop offset="100%" stopColor="#1DE9B6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default JupiterIcon;