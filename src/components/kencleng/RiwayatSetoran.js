// src/components/kencleng/RiwayatSetoran.js — UPGRADED
import React from 'react';
import { formatRupiah, formatTimeAgo, formatTanggal } from '../../utils/formatter';
import { STATUS_SETORAN } from '../../config/constants';
import { Spinner } from '../common/Loading';

const statusConfig = {
  [STATUS_SETORAN.PENDING]: { label: 'Menunggu', color: 'var(--kuning)', bg: 'var(--kuning-pale)', icon: '⏳' },
  [STATUS_SETORAN.DITERIMA]: { label: 'Diterima', color: 'var(--hijau)', bg: 'var(--hijau-pale)', icon: '✅' },
  [STATUS_SETORAN.DITOLAK]: { label: 'Ditolak', color: 'var(--danger)', bg: '#fdeaea', icon: '❌' },
};

const SetoranItem = ({ item, onApprove, onReject, kenclengMap }) => {
  const status = statusConfig[item.status] || statusConfig[STATUS_SETORAN.PENDING];
  const kencleng = kenclengMap ? kenclengMap[item.kenclengId] : null;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
      background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)',
      borderLeft: `3px solid ${status.color}`, animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{ width: 38, height: 38, background: status.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
        {status.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--hijau)' }}>{formatRupiah(item.nominal)}</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: status.color, background: status.bg, padding: '2px 8px', borderRadius: 'var(--radius-full)', flexShrink: 0 }}>
            {status.label}
          </span>
        </div>

        {kencleng && (
          <div style={{ fontSize: '0.78rem', color: 'var(--abu-600)', marginBottom: 3, fontWeight: 500 }}>
            🪣 {kencleng.nama}
          </div>
        )}

        {item.catatan && (
          <p style={{ fontSize: '0.78rem', color: 'var(--abu-500)', marginBottom: 3, fontStyle: 'italic' }}>"{item.catatan}"</p>
        )}

        <p style={{ fontSize: '0.72rem', color: 'var(--abu-400)', marginTop: 2 }}>
          {item.createdAt ? formatTanggal(item.createdAt) : '-'}
        </p>

        {item.status === STATUS_SETORAN.DITOLAK && item.alasanDitolak && (
          <p style={{ fontSize: '0.72rem', color: 'var(--danger)', marginTop: 4, fontStyle: 'italic', background: '#fdeaea', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
            Alasan: {item.alasanDitolak}
          </p>
        )}

        {onApprove && item.status === STATUS_SETORAN.PENDING && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => onApprove(item)}
              style={{ padding: '5px 14px', background: 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              ✓ Terima
            </button>
            <button onClick={() => onReject(item)}
              style={{ padding: '5px 14px', background: 'transparent', color: 'var(--danger)', border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              ✕ Tolak
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const RiwayatSetoran = ({ data = [], loading, onApprove, onReject, kenclengMap }) => {
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>;
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

  // Group by date
  const grouped = {};
  data.forEach(item => {
    let dateKey = 'Tanggal tidak diketahui';
    try {
      const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
      if (!isNaN(d)) {
        dateKey = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      }
    } catch (_) {}
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(item);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--abu-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingLeft: 4 }}>
            {date}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(item => (
              <SetoranItem key={item.id} item={item} onApprove={onApprove} onReject={onReject} kenclengMap={kenclengMap} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RiwayatSetoran;
