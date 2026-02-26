import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { Spinner } from '../../components/common/Loading';
import { getPendingSetoran, approveSetoran, rejectSetoran } from '../../services/kenclengService';
import { formatRupiah, formatTanggal } from '../../utils/formatter';
import { useAuth } from '../../hooks/useAuth';

const SetoranItem = ({ item, onApprove, onReject }) => {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 40, height: 40, background: 'var(--kuning-pale)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
          ⏳
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{formatRupiah(item.nominal)}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>{item.createdAt ? formatTanggal(item.createdAt) : '-'}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', marginBottom: 4 }}>
            <span style={{ fontWeight: 600 }}>{item.namaWarga || '-'}</span>
            <span style={{ color: 'var(--abu-400)' }}>RT {item.rt || '-'}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--abu-500)', marginBottom: 8 }}>
            ID: <span style={{ fontFamily: 'monospace' }}>{item.kenclengId}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onApprove(item)}
              style={{ padding: '6px 16px', background: 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              ✓ Terima
            </button>
            <button
              onClick={() => onReject(item)}
              style={{ padding: '6px 16px', background: 'transparent', color: 'var(--danger)', border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              ✗ Tolak
            </button>
            <button
              onClick={() => setShowDetail(!showDetail)}
              style={{ padding: '6px 12px', background: 'var(--abu-100)', color: 'var(--abu-700)', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              {showDetail ? 'Tutup' : 'Detail'}
            </button>
          </div>

          {showDetail && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--abu-100)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Metode</div>
                  <div style={{ fontWeight: 600 }}>{item.metode || 'Tunai'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>Catatan</div>
                  <div style={{ fontWeight: 600 }}>{item.catatan || '-'}</div>
                </div>
              </div>
              {item.foto && (
                <div style={{ marginTop: 12 }}>
                  <img src={item.foto} alt="Bukti" style={{ width: '100%', borderRadius: 'var(--radius-sm)' }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const RTVerifikasiPage = () => {
  const { userData } = useAuth();
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [processing, setProcessing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPendingSetoran();
      setPendingList(data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Gagal memuat data: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (item) => {
    setProcessing(true);
    try {
      await approveSetoran(item.id, item.kenclengId, item.nominal);
      setAlert({ type: 'success', message: `✅ Setoran ${formatRupiah(item.nominal)} diterima` });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (item) => {
    const alasan = prompt('Alasan penolakan:');
    if (!alasan) return;
    
    setProcessing(true);
    try {
      await rejectSetoran(item.id, alasan);
      setAlert({ type: 'warning', message: `❌ Setoran ditolak` });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleMassal = () => {
    if (pendingList.length === 0) return;
    if (confirm(`Terima ${pendingList.length} setoran sekaligus?`)) {
      // Implementasi massal
      alert('Fitur verifikasi massal akan diimplementasikan');
    }
  };

  const totalPending = pendingList.reduce((a, s) => a + (s.nominal || 0), 0);

  return (
    <div className="app-layout">
      <Header
        title="Verifikasi Setoran"
        subtitle={`RT 01 - ${userData?.nama || 'Sukamaju'}`}
        showBack
        rightAction={
          <button
            onClick={handleMassal}
            disabled={pendingList.length === 0}
            style={{ background: 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: pendingList.length === 0 ? 'not-allowed' : 'pointer', opacity: pendingList.length === 0 ? 0.5 : 1 }}
          >
            ✓ Verifikasi Massal
          </button>
        }
      />

      <div className="page-content">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={3000} />}

        {/* Info Setoran Hari Ini */}
        <Card style={{ background: 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))', color: '#fff', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>SETORAN HARI INI</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{formatRupiah(totalPending)}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{pendingList.length} setoran menunggu</div>
            </div>
            <div style={{ fontSize: '3rem', opacity: 0.3 }}>🔔</div>
          </div>
        </Card>

        {/* Daftar Setoran */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner />
          </div>
        ) : pendingList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p style={{ fontWeight: 600 }}>Tidak ada setoran pending</p>
            <p style={{ fontSize: '0.875rem' }}>Semua setoran sudah diverifikasi</p>
          </div>
        ) : (
          <div>
            {pendingList.map(item => (
              <SetoranItem
                key={item.id}
                item={item}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default RTVerifikasiPage;