// src/components/common/Card.js
import React from 'react';

const Card = ({
  children,
  style,
  onClick,
  shadow = 'md',
  padding = '20px',
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
    padding,
    boxShadow: shadows[shadow],
    transition: 'all var(--transition)',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  const hoverStyle = onClick
    ? { transform: 'translateY(-1px)', boxShadow: 'var(--shadow-lg)' }
    : {};

  return (
    <div
      style={baseStyle}
      className={className}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) Object.assign(e.currentTarget.style, hoverStyle);
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = shadows[shadow];
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;