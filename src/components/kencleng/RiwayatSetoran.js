// src/components/kencleng/RiwayatSetoran.js
import React from 'react';
import { formatRupiah, formatTimeAgo } from '../../utils/formatter';
import { STATUS_SETORAN } from '../../config/constants';
import { Spinner } from '../common/Loading';

const statusConfig = {
  [STATUS_SETORAN.PENDING]: { label: 'Menunggu', color: 'var(--kuning)', bg: 'var(--kuning-pale)', icon: '⏳' },
  [STATUS_SETORAN.DITERIMA]: { label: 'Diterima', color: 'var(--hijau)', bg: 'var(--hijau-pale)', icon: '✅' },
  [STATUS_SETORAN.DITOLAK]: { label: 'Ditolak', color: 'var(--danger)', bg: '#fdeaea', icon: '❌' },
};

const SetoranItem = ({ item, onApprove, onReject }) => {
  const status = statusConfig[item.status] || statusConfig[STATUS_SETORAN.PENDING];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: '14px 16px',
        background: '#fff',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 40,
          height: 40,
          background: status.bg,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          flexShrink: 0,
        }}
      >
        {status.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--hijau)',
            }}
          >
            {formatRupiah(item.nominal)}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: status.color,
              background: status.bg,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              flexShrink: 0,
            }}
          >
            {status.label}
          </span>
        </div>

        {item.catatan && (
          <p style={{ fontSize: '0.8rem', color: 'var(--abu-500)', marginTop: 2 }}>
            {item.catatan}
          </p>
        )}

        <p style={{ fontSize: '0.75rem', color: 'var(--abu-400)', marginTop: 4 }}>
          {item.createdAt ? formatTimeAgo(item.createdAt) : '-'}
        </p>

        {item.status === STATUS_SETORAN.DITOLAK && item.alasanDitolak && (
          <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4, fontStyle: 'italic' }}>
            Alasan: {item.alasanDitolak}
          </p>
        )}

        {/* RT Actions */}
        {onApprove && item.status === STATUS_SETORAN.PENDING && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={() => onApprove(item)}
              style={{
                padding: '5px 14px',
                background: 'var(--hijau)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all var(--transition)',
              }}
            >
              ✓ Terima
            </button>
            <button
              onClick={() => onReject(item)}
              style={{
                padding: '5px 14px',
                background: 'transparent',
                color: 'var(--danger)',
                border: '1.5px solid var(--danger)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all var(--transition)',
              }}
            >
              ✕ Tolak
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const RiwayatSetoran = ({ data = [], loading, onApprove, onReject }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
        <Spinner />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <p style={{ fontWeight: 600, color: 'var(--abu-700)' }}>Belum ada riwayat setoran</p>
        <p style={{ fontSize: '0.875rem' }}>Setoran akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((item) => (
        <SetoranItem
          key={item.id}
          item={item}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
};

export default RiwayatSetoran;