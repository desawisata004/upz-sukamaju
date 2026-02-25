// src/pages/rt/setoran.js
import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import RiwayatSetoran from '../../components/kencleng/RiwayatSetoran';
import InputSetoran from '../../components/kencleng/InputSetoran';
import ScanQR from '../../components/kencleng/ScanQR';
import { 
  getPendingSetoran, 
  approveSetoran, 
  rejectSetoran,
  getKenclengById,
  getAllKencleng 
} from '../../services/kenclengService';
import { notifySetoranDiterima, notifySetoranDitolak } from '../../services/notificationService';
import Alert from '../../components/common/Alert';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { formatRupiah } from '../../utils/formatter';
import { useAuth } from '../../hooks/useAuth';

const RTSetoranPage = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('pending'); // pending | scan | manual
  const [pending, setPending] = useState([]);
  const [kenclengList, setKenclengList] = useState([]);
  const [selectedKencleng, setSelectedKencleng] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [alasan, setAlasan] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingData, allKencleng] = await Promise.all([
        getPendingSetoran(),
        getAllKencleng()
      ]);
      setPending(pendingData);
      setKenclengList(allKencleng);
    } catch (error) {
      setAlert({ type: 'error', message: 'Gagal memuat data: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (setoran) => {
    setProcessing(true);
    try {
      await approveSetoran(setoran.id, setoran.kenclengId, setoran.nominal);
      await notifySetoranDiterima(setoran.userId, setoran.nominal);
      setAlert({ 
        type: 'success', 
        message: `✅ Setoran ${formatRupiah(setoran.nominal)} berhasil diterima.` 
      });
      loadData();
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
      setAlert({ 
        type: 'warning', 
        message: `❌ Setoran ${formatRupiah(rejectModal.nominal)} ditolak.` 
      });
      setRejectModal(null);
      setAlasan('');
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleScanSuccess = async (data) => {
    try {
      const k = await getKenclengById(data.kenclengId);
      if (!k) {
        setAlert({ type: 'error', message: 'Kencleng tidak ditemukan.' });
        return;
      }
      setSelectedKencleng(k);
      setActiveTab('manual');
    } catch (err) {
      setAlert({ type: 'error', message: 'Gagal memuat data kencleng.' });
    }
  };

  const handleManualSelect = (kencleng) => {
    setSelectedKencleng(kencleng);
  };

  const handleSetoranSuccess = () => {
    setAlert({ 
      type: 'success', 
      message: '✅ Setoran berhasil dicatat! Menunggu konfirmasi.' 
    });
    setSelectedKencleng(null);
    setActiveTab('pending');
    loadData();
  };

  // Filter kencleng untuk pencarian
  const filteredKencleng = kenclengList.filter(k => 
    k.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Header 
        title="Setoran RT" 
        showBack 
        rightAction={
          <span
            style={{
              background: 'var(--hijau-pale)',
              color: 'var(--hijau)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {userData?.nama || 'RT'}
          </span>
        }
      />

      <div className="page-content">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose={3000}
          />
        )}

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          marginBottom: 20,
          borderBottom: '1px solid var(--abu-200)',
          paddingBottom: 8
        }}>
          {[
            { id: 'pending', label: '⏳ Pending', icon: '⏳' },
            { id: 'scan', label: '📷 Scan QR', icon: '📷' },
            { id: 'manual', label: '✏️ Input Manual', icon: '✏️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedKencleng(null);
                setSearchTerm('');
              }}
              style={{
                flex: 1,
                padding: '10px',
                background: activeTab === tab.id ? 'var(--hijau)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--abu-500)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all var(--transition)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'pending' && (
          <>
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
          </>
        )}

        {activeTab === 'scan' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--abu-500)', marginBottom: 16, textAlign: 'center' }}>
              Arahkan kamera ke QR Code kencleng warga
            </p>
            <ScanQR onScanSuccess={handleScanSuccess} />
          </div>
        )}

        {activeTab === 'manual' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {selectedKencleng ? (
              <InputSetoran
                kencleng={selectedKencleng}
                onSuccess={handleSetoranSuccess}
                onCancel={() => {
                  setSelectedKencleng(null);
                  setSearchTerm('');
                }}
              />
            ) : (
              <>
                <h3 style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 600, 
                  marginBottom: 12,
                  color: 'var(--abu-700)'
                }}>
                  Pilih Kencleng:
                </h3>

                {/* Search input */}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Cari nama kencleng..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid var(--abu-200)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.9rem',
                    marginBottom: 16,
                    fontFamily: 'var(--font-body)',
                  }}
                />

                {/* Kencleng list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: 32 }}>Loading...</div>
                  ) : (
                    filteredKencleng.map(k => (
                      <button
                        key={k.id}
                        onClick={() => handleManualSelect(k)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 16px',
                          background: '#fff',
                          border: '1.5px solid var(--abu-200)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'all var(--transition)',
                          fontFamily: 'var(--font-body)',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--hijau)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--abu-200)'; }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 2 }}>{k.nama}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--abu-400)' }}>
                            Saldo: {formatRupiah(k.saldo || 0)}
                          </div>
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem',
                          color: k.status === 'aktif' ? 'var(--hijau)' : 'var(--abu-400)',
                          fontWeight: 600
                        }}>
                          {k.status === 'aktif' ? '🟢 Aktif' : '⭕ Nonaktif'}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

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

              <label style={{ 
                display: 'block', 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: 'var(--abu-500)', 
                marginBottom: 8, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em' 
              }}>
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
                  disabled={processing || !alasan.trim()}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--danger)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    cursor: processing || !alasan.trim() ? 'not-allowed' : 'pointer',
                    opacity: processing || !alasan.trim() ? 0.6 : 1,
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