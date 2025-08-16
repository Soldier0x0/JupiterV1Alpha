import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-zinc-900 rounded-2xl shadow-card p-4 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
