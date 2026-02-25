// src/components/common/Card.js
import React from 'react';

const Card = ({
  children,
  style,
  onClick,
  shadow = 'md',
  padding = null,
  className,
  ...props
}) => {
  const shadows = {
    none: 'none',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
  };

  const baseStyle = {
    background: '#fff',
    borderRadius: 'var(--radius-lg)',
    padding: padding || 'clamp(16px, 4vw, 20px)',
    boxShadow: shadows[shadow],
    transition: 'all var(--transition)',
    cursor: onClick ? 'pointer' : 'default',
    width: '100%',
    ...style,
  };

  return (
    <div
      style={baseStyle}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;