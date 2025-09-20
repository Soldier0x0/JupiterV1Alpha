import React from 'react';

const JupiterIcon = ({ className = "w-6 h-6" }) => {
  return (
    <img 
      src="https://images.pexels.com/photos/87651/jupiter-planet-great-red-spot-solar-system-87651.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=center"
      alt="Planet Jupiter"
      className={`${className} object-cover`}
      onError={(e) => {
        // Fallback to a different Jupiter image if the first one fails
        e.target.src = "https://images.unsplash.com/photo-1630839437035-dac17da580d0?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=center";
      }}
    />
  );
};

export default JupiterIcon;