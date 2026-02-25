// src/components/layout/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RT_NAME, APP_NAME } from '../../config/constants';

const Header = ({ title, showBack, rightAction, subtitle }) => {
  const navigate = useNavigate();

  return (
    <header
      style={{
        background: '#fff',
        borderBottom: '1px solid var(--abu-100)',
        padding: '12px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minHeight: '60px',
      }}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'var(--abu-100)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            flexShrink: 0,
            transition: 'all var(--transition)',
          }}
        >
          ←
        </button>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: title ? '1.15rem' : '1rem',
            color: 'var(--hitam)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title || APP_NAME}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: 'var(--abu-500)', marginTop: 1 }}>
            {subtitle || RT_NAME}
          </p>
        )}
      </div>

      {rightAction && <div style={{ flexShrink: 0 }}>{rightAction}</div>}
    </header>
  );
};

export default Header;