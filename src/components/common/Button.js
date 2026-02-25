// src/components/common/Button.js
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

const sizes = {
  sm: { padding: '6px 14px', fontSize: '0.8rem', height: '32px' },
  md: { padding: '10px 20px', fontSize: '0.9rem', height: '42px' },
  lg: { padding: '14px 28px', fontSize: '1rem', height: '52px' },
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon,
  style: extStyle,
  ...props
}) => {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: 'var(--radius-full)',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all var(--transition)',
    width: fullWidth ? '100%' : 'auto',
    letterSpacing: '0.01em',
    ...v,
    ...s,
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
              width: '14px',
              height: '14px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
          />
          Memproses...
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
