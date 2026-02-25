import React from 'react';

const variants = {
  primary: {
    background: 'var(--hijau)',
    color: '#fff',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--hijau)',
    border: '1.5px solid var(--hijau)',
  },
  danger: {
    background: 'var(--danger)',
    color: '#fff',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--abu-700)',
    border: '1.5px solid var(--abu-200)',
  },
  kuning: {
    background: 'var(--kuning)',
    color: '#fff',
    border: 'none',
  },
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon,
  style: extStyle,
  ...props
}) => {
  const v = variants[variant] || variants.primary;

  const sizeStyles = {
    sm: {
      padding: 'clamp(4px, 2vw, 6px) clamp(10px, 3vw, 14px)',
      fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)',
      minHeight: 'clamp(28px, 8vw, 32px)',
    },
    md: {
      padding: 'clamp(8px, 2.5vw, 10px) clamp(16px, 4vw, 20px)',
      fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
      minHeight: 'clamp(38px, 10vw, 42px)',
    },
    lg: {
      padding: 'clamp(12px, 3vw, 14px) clamp(20px, 5vw, 28px)',
      fontSize: 'clamp(0.9rem, 3.5vw, 1rem)',
      minHeight: 'clamp(48px, 12vw, 52px)',
    },
  };

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(4px, 2vw, 8px)',
    borderRadius: 'var(--radius-full)',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all var(--transition)',
    width: fullWidth ? '100%' : 'auto',
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
    ...v,
    ...sizeStyles[size],
    ...extStyle,
  };

  return (
    <button
      type={type}
      style={baseStyle}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span
            style={{
              display: 'inline-block',
              width: 'clamp(12px, 3vw, 14px)',
              height: 'clamp(12px, 3vw, 14px)',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
          />
          <span>Memproses...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;