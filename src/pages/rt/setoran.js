// src/pages/rt/setoran.js
import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import RiwayatSetoran from '../../components/kencleng/RiwayatSetoran';
import { getPendingSetoran, approveSetoran, rejectSetoran } from '../../services/kenclengService';
import { notifySetoranDiterima, notifySetoranDitolak } from '../../services/notificationService';
import Alert from '../../components/common/Alert';
import Card from '../../components/common/Card';
import { formatRupiah } from '../../utils/formatter';

const RTSetoranPage = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [alasan, setAlasan] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadPending = async () => {
    setLoading(true);
    const data = await getPendingSetoran();
    setPending(data);
    setLoading(false);
  };

  useEffect(() => { loadPending(); }, []);

  const handleApprove = async (setoran) => {
    setProcessing(true);
    try {
      await approveSetoran(setoran.id, setoran.kenclengId, setoran.nominal);
      await notifySetoranDiterima(setoran.userId, setoran.nominal);
      setAlert({ type: 'success', message: `Setoran ${formatRupiah(setoran.nominal)} berhasil diterima.` });
      loadPending();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    setProcessing(true);
    try {
      await rejectSetoran(rejectModal.id, alasan);
      await notifySetoranDitolak(rejectModal.userId, rejectModal.nominal, alasan);
      setAlert({ type: 'warning', message: `Setoran ${formatRupiah(rejectModal.nominal)} ditolak.` });
      setRejectModal(null);
      setAlasan('');
      loadPending();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="app-layout">
      <Header title="Konfirmasi Setoran" showBack />

      <div className="page-content">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose={3000}
          />
        )}

        {/* Pending count banner */}
        {!loading && pending.length > 0 && (
          <div
            style={{
              background: 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 18px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#fff',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>📬</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                {pending.length} Setoran Menunggu
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                Total: {formatRupiah(pending.reduce((a, s) => a + s.nominal, 0))}
              </div>
            </div>
          </div>
        )}

        <RiwayatSetoran
          data={pending}
          loading={loading}
          onApprove={handleApprove}
          onReject={(s) => setRejectModal(s)}
        />

        {/* Reject Modal */}
        {rejectModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(28,26,22,0.5)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              zIndex: 500,
              animation: 'fadeIn 0.2s ease',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setRejectModal(null); }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                padding: '24px 20px 40px',
                width: '100%',
                maxWidth: 480,
                animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <h3 style={{ marginBottom: 6 }}>Tolak Setoran</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--abu-500)', marginBottom: 16 }}>
                Setoran sebesar {formatRupiah(rejectModal.nominal)} akan ditolak.
              </p>

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--abu-500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Alasan Penolakan
              </label>
              <input
                type="text"
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Masukkan alasan..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1.5px solid var(--abu-200)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  marginBottom: 16,
                  fontFamily: 'var(--font-body)',
                }}
              />

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setRejectModal(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--abu-100)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={processing}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--danger)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: processing ? 0.6 : 1,
                  }}
                >
                  {processing ? 'Memproses...' : 'Tolak'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default RTSetoranPage;
