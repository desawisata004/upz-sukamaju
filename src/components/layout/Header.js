import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RT_NAME, APP_NAME } from '../../config/constants';

const Header = ({ title, showBack, rightAction, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/login') return null;

  return (
    <header
      style={{
        background: '#fff',
        borderBottom: '1px solid var(--abu-100)',
        padding: 'clamp(8px, 3vw, 12px) clamp(12px, 4vw, 16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(8px, 3vw, 12px)',
        minHeight: 'clamp(50px, 15vw, 60px)',
        width: '100%',
      }}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'var(--abu-100)',
            border: 'none',
            borderRadius: '50%',
            width: 'clamp(32px, 10vw, 36px)',
            height: 'clamp(32px, 10vw, 36px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(0.9rem, 4vw, 1rem)',
            flexShrink: 0,
          }}
        >
          ←
        </button>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: title ? 'clamp(1rem, 4vw, 1.15rem)' : 'clamp(0.9rem, 3.5vw, 1rem)',
            color: 'var(--hitam)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title || APP_NAME}
        </h2>
        {subtitle && (
          <p style={{ 
            fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', 
            color: 'var(--abu-500)', 
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {subtitle || RT_NAME}
          </p>
        )}
      </div>

      {rightAction && (
        <div style={{ flexShrink: 0 }}>
          {rightAction}
        </div>
      )}
    </header>
  );
};

export default Header;