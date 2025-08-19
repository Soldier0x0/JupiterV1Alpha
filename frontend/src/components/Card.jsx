import React from 'react';

const Card = ({ children, className = '', elevated = false }) => {
  const baseClasses = elevated ? 'card-elevated' : 'card';
  
  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
