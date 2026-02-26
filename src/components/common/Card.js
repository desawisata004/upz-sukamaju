import React from 'react';

const Card = ({ children, className = '', onClick, padding = true }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm ${padding ? 'p-4' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;