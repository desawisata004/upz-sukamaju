// src/components/common/Alert.js
import React, { useEffect } from 'react';

const types = {
  success: { 
    bg: 'var(--hijau-pale)', 
    color: 'var(--hijau)', 
    icon: '✅', 
    border: 'var(--hijau)' 
  },
  error: { 
    bg: '#fdeaea', 
    color: 'var(--danger)', 
    icon: '❌', 
    border: 'var(--danger)' 
  },
  warning: { 
    bg: 'var(--kuning-pale)', 
    color: 'var(--kuning)', 
    icon: '⚠️', 
    border: 'var(--kuning)' 
  },
  info: { 
    bg: '#eaf3fb', 
    color: 'var(--info)', 
    icon: 'ℹ️', 
    border: 'var(--info)' 
  },
};

const Alert = ({ type = 'info', message, onClose, autoClose = 0 }) => {
  const t = types[type] || types.info;

  useEffect(() => {
    if (autoClose > 0 && onClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!message) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        background: t.bg,
        border: `1px solid ${t.border}22`,
        borderLeft: `3px solid ${t.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        animation: 'fadeIn 0.2s ease',
        marginBottom: '12px',
      }}
    >
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{t.icon}</span>
      <p style={{ color: t.color, fontSize: '0.875rem', flex: 1, fontWeight: 500 }}>{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: t.color,
            fontSize: '1.1rem',
            lineHeight: 1,
            padding: '0 2px',
            flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;