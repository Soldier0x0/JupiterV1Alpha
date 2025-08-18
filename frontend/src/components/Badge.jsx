import React from 'react';

const Badge = ({ text, color = 'bg-teal-500' }) => {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${color}`}>
      {text}
    </span>
  );
};

export default Badge;
