// src/pages/admin/kelola-kencleng.js
import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import { getAllKencleng, updateKenclengStatus, createKencleng } from '../../services/kenclengService';
import { generateQRCodeDataURL, generateQRData } from '../../utils/qrGenerator';
import { formatRupiah, formatProgress } from '../../utils/formatter';
import { STATUS_KENCLENG } from '../../config/constants';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Spinner } from '../../components/common/Loading';

const KenclengAdminItem = ({ k, onStatusChange, onShowQR }) => {
  const progress = formatProgress(k.saldo, k.target);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        boxShadow: 'var(--shadow-sm)',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 3 }}>{k.nama}</div>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: k.status === STATUS_KENCLENG.AKTIF ? 'var(--hijau-pale)' : '#f5f5f5',
              color: k.status === STATUS_KENCLENG.AKTIF ? 'var(--hijau)' : 'var(--abu-400)',
            }}
          >
            {k.status}
          </span>
        </div>
        <div style={{ fontWeight: 800, color: 'var(--hijau)', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
          {formatRupiah(k.saldo || 0)}
        </div>
      </div>

      <div style={{ height: 6, background: 'var(--abu-100)', borderRadius: 3, marginBottom: 6, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: progress >= 100 ? 'var(--kuning)' : 'linear-gradient(90deg, var(--hijau), var(--hijau-muda))',
            borderRadius: 3,
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--abu-400)', marginBottom: 12 }}>
        <span>Target: {formatRupiah(k.target)}</span>
        <span>{progress}%</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => onShowQR(k)}
          style={{
            padding: '6px 14px',
            background: 'var(--hijau-pale)',
            color: 'var(--hijau)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          📱 QR Code
        </button>

        {k.status === STATUS_KENCLENG.AKTIF ? (
          <button
            onClick={() => onStatusChange(k.id, STATUS_KENCLENG.NONAKTIF)}
            style={{
              padding: '6px 14px',
              background: '#fdeaea',
              color: 'var(--danger)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Nonaktifkan
          </button>
        ) : (
          <button
            onClick={() => onStatusChange(k.id, STATUS_KENCLENG.AKTIF)}
            style={{
              padding: '6px 14px',
              background: 'var(--hijau-pale)',
              color: 'var(--hijau)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Aktifkan
          </button>
        )}
      </div>
    </div>
  );
};

const QRModal = ({ kencleng, onClose }) => {
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    if (!kencleng) return;
    const data = generateQRData(kencleng.id, kencleng.userId, kencleng.nama);
    generateQRCodeDataURL(data).then(setQrUrl);
  }, [kencleng]);

  if (!kencleng) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(28,26,22,0.6)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 500,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: '28px 24px 48px',
          width: '100%',
          maxWidth: 480,
          animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: 'var(--abu-200)',
            borderRadius: 2,
            margin: '-12px auto 20px',
          }}
        />

        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 4 }}>{kencleng.nama}</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--abu-500)', marginBottom: 20 }}>
          QR Code untuk setoran
        </p>

        {qrUrl ? (
          <img
            src={qrUrl}
            alt="QR Code Kencleng"
            style={{
              width: 220,
              height: 220,
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--abu-100)',
              boxShadow: 'var(--shadow-md)',
            }}
          />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Spinner />
          </div>
        )}

        <p style={{ fontSize: '0.75rem', color: 'var(--abu-400)', margin: '16px 0 20px' }}>
          Tunjukkan QR ini kepada pengurus RT saat menyetor
        </p>

        <Button variant="ghost" onClick={onClose} fullWidth>
          Tutup
        </Button>
      </div>
    </div>
  );
};

const AdminKelola = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [qrKencleng, setQrKencleng] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    getAllKencleng().then(setList).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateKenclengStatus(id, status);
      setAlert({ type: 'success', message: 'Status kencleng diperbarui.' });
      load();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    }
  };

  const filtered = list.filter((k) =>
    k.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Header title="Kelola Kencleng" showBack />

      <div className="page-content">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose={3000}
          />
        )}

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Cari kencleng..."
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1.5px solid var(--abu-200)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.9rem',
              background: '#fff',
              fontFamily: 'var(--font-body)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--hijau)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--abu-200)'; }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p>Tidak ada kencleng ditemukan</p>
              </div>
            ) : (
              filtered.map((k) => (
                <KenclengAdminItem
                  key={k.id}
                  k={k}
                  onStatusChange={handleStatusChange}
                  onShowQR={setQrKencleng}
                />
              ))
            )}
          </div>
        )}
      </div>

      {qrKencleng && (
        <QRModal kencleng={qrKencleng} onClose={() => setQrKencleng(null)} />
      )}

      <MobileNav />
    </div>
  );
};

export default AdminKelola;
