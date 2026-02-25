// src/components/common/Loading.js
import React from 'react';

export const Spinner = ({ size = 32, color = 'var(--hijau)' }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `3px solid var(--abu-200)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }}
  />
);

export const LoadingPage = ({ text = 'Memuat...' }) => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      background: 'var(--coklat-pale)',
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        background: 'var(--hijau)',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      🪣
    </div>
    <Spinner size={36} />
    <p style={{ color: 'var(--abu-500)', fontSize: '0.9rem' }}>{text}</p>
  </div>
);

export const SkeletonCard = () => (
  <div
    style={{
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      boxShadow: 'var(--shadow-sm)',
    }}
  >
    <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
    <div className="skeleton" style={{ height: 32, width: '40%', marginBottom: 12 }} />
    <div className="skeleton" style={{ height: 8, width: '100%', borderRadius: 4 }} />
  </div>
);

const Loading = LoadingPage;
export default Loading;