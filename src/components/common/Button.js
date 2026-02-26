import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick,
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
  type = 'button'
}) => {
  const baseStyles = 'rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 touch-target';
  
  const variants = {
    primary: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:bg-gray-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100',
    outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50 active:bg-green-100 disabled:border-gray-300 disabled:text-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-gray-300',
    ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
  };

  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;