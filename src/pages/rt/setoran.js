// src/pages/rt/setoran.js — UPGRADED v2 (dengan dropdown warga)
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import RiwayatSetoran from '../../components/kencleng/RiwayatSetoran';
import InputSetoran from '../../components/kencleng/InputSetoran';
import ScanQR from '../../components/kencleng/ScanQR';
import {
  getPendingSetoran,
  approveSetoran,
  approveSetoranBatch,
  rejectSetoran,
  getKenclengById,
  getKenclengWithStats,
  getKenclengByUser,
  getSetoranRecentAll,
} from '../../services/kenclengService';
import { getWargaUsers } from '../../services/userService';
import { notifySetoranDiterima, notifySetoranDitolak } from '../../services/notificationService';
import Alert from '../../components/common/Alert';
import { formatRupiah, formatTimeAgo } from '../../utils/formatter';
import { useAuth } from '../../hooks/useAuth';
import { SkeletonCard, Spinner } from '../../components/common/Loading';

const SORT_OPTIONS = [
  { id: 'terlama', label: 'Terlama dulu' },
  { id: 'terbaru', label: 'Terbaru dulu' },
  { id: 'terbesar', label: 'Nominal terbesar' },
  { id: 'terkecil', label: 'Nominal terkecil' },
];

const RTSetoranPage = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');

  // Data states
  const [pending, setPending] = useState([]);
  const [kenclengList, setKenclengList] = useState([]);
  const [wargaList, setWargaList] = useState([]);
  const [recentSetoran, setRecentSetoran] = useState([]);

  // Selection states (manual tab)
  const [selectedWarga, setSelectedWarga] = useState(null);
  const [wargaKencleng, setWargaKencleng] = useState([]);
  const [loadingWargaKencleng, setLoadingWargaKencleng] = useState(false);
  const [selectedKencleng, setSelectedKencleng] = useState(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [alasan, setAlasan] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchWarga, setSearchWarga] = useState('');
  const [showWargaDropdown, setShowWargaDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('terlama');
  const [selectedPending, setSelectedPending] = useState(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);

  // ---- Load semua data awal ----
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingData, allKencleng, warga, recent] = await Promise.all([
        getPendingSetoran(),
        getKenclengWithStats(),
        getWargaUsers(),
        getSetoranRecentAll(30),
      ]);
      setPending(pendingData);
      setKenclengList(allKencleng);
      setWargaList(warga);
      setRecentSetoran(recent);
    } catch (err) {
      setAlert({ type: 'error', message: 'Gagal memuat data: ' + err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ---- Saat warga dipilih, load kenclengnya ----
  const handleSelectWarga = useCallback(async (warga) => {
    setSelectedWarga(warga);
    setSelectedKencleng(null);
    setShowWargaDropdown(false);
    setSearchWarga(warga.nama || warga.email || '');
    setLoadingWargaKencleng(true);
    try {
      const list = await getKenclengByUser(warga.uid);
      setWargaKencleng(list);
    } catch (err) {
      setAlert({ type: 'error', message: 'Gagal memuat kencleng warga.' });
      setWargaKencleng([]);
    } finally {
      setLoadingWargaKencleng(false);
    }
  }, []);

  // ---- Filter warga untuk dropdown ----
  const filteredWarga = useMemo(() => {
    if (!searchWarga) return wargaList;
    const q = searchWarga.toLowerCase();
    return wargaList.filter(w =>
      (w.nama || '').toLowerCase().includes(q) ||
      (w.email || '').toLowerCase().includes(q)
    );
  }, [wargaList, searchWarga]);

  // ---- Approve single ----
  const handleApprove = async (setoran) => {
    setProcessing(true);
    try {
      await approveSetoran(setoran.id, setoran.kenclengId, setoran.nominal);
      try { await notifySetoranDiterima(setoran.userId, setoran.nominal); } catch (_) {}
      setAlert({ type: 'success', message: `✅ Setoran ${formatRupiah(setoran.nominal)} berhasil diterima.` });
      setSelectedPending(prev => { const s = new Set(prev); s.delete(setoran.id); return s; });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally { setProcessing(false); }
  };

  // ---- Batch approve ----
  const handleBatchApprove = async () => {
    if (selectedPending.size === 0) return;
    setBatchProcessing(true);
    try {
      const toApprove = pending.filter(s => selectedPending.has(s.id));
      await approveSetoranBatch(toApprove);
      const total = toApprove.reduce((a, s) => a + (s.nominal || 0), 0);
      setAlert({ type: 'success', message: `✅ ${toApprove.length} setoran (${formatRupiah(total)}) diterima sekaligus!` });
      setSelectedPending(new Set());
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Batch approve gagal: ' + err.message });
    } finally { setBatchProcessing(false); }
  };

  // ---- Reject ----
  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    setProcessing(true);
    try {
      await rejectSetoran(rejectModal.id, alasan);
      try { await notifySetoranDitolak(rejectModal.userId, rejectModal.nominal, alasan); } catch (_) {}
      setAlert({ type: 'warning', message: `❌ Setoran ${formatRupiah(rejectModal.nominal)} ditolak.` });
      setRejectModal(null); setAlasan('');
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally { setProcessing(false); }
  };

  // ---- Scan QR ----
  const handleScanSuccess = async (data) => {
    try {
      const k = await getKenclengById(data.kenclengId);
      if (!k) { setAlert({ type: 'error', message: 'Kencleng tidak ditemukan.' }); return; }
      setSelectedKencleng(k);
      setActiveTab('manual');
      // set warga juga
      const w = wargaList.find(w => w.uid === k.userId);
      if (w) { setSelectedWarga(w); setSearchWarga(w.nama || w.email || ''); }
    } catch (err) {
      setAlert({ type: 'error', message: 'Gagal memuat kencleng.' });
    }
  };

  const handleSetoranSuccess = () => {
    setAlert({ type: 'success', message: '✅ Setoran dicatat! Menunggu konfirmasi.' });
    setSelectedKencleng(null);
    setSelectedWarga(null);
    setSearchWarga('');
    setWargaKencleng([]);
    setActiveTab('pending');
    loadData();
  };

  // ---- Sorted pending ----
  const sortedPending = useMemo(() => {
    return [...pending].sort((a, b) => {
      if (sortBy === 'terbesar') return (b.nominal || 0) - (a.nominal || 0);
      if (sortBy === 'terkecil') return (a.nominal || 0) - (b.nominal || 0);
      const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return sortBy === 'terbaru' ? tb - ta : ta - tb;
    });
  }, [pending, sortBy]);

  const totalSelectedNominal = pending.filter(s => selectedPending.has(s.id)).reduce((a, s) => a + (s.nominal || 0), 0);
  const allSelected = pending.length > 0 && selectedPending.size === pending.length;

  const TABS = [
    { id: 'pending', label: '⏳ Pending', badge: pending.length },
    { id: 'scan', label: '📷 Scan QR' },
    { id: 'manual', label: '✏️ Manual' },
    { id: 'riwayat', label: '📋 Riwayat' },
  ];

  return (
    <div className="app-layout">
      <Header title="Setoran RT" showBack
        rightAction={<span style={{ background: 'var(--hijau-pale)', color: 'var(--hijau)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>{userData?.nama || 'RT'}</span>}
      />

      <div className="page-content">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={4000} />}

        {/* ---- Tab Nav ---- */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
          {TABS.map(tab => (
            <button key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== 'manual') { setSelectedKencleng(null); setSelectedWarga(null); setSearchWarga(''); setWargaKencleng([]); }
              }}
              style={{ flexShrink: 0, position: 'relative', padding: '9px 14px', background: activeTab === tab.id ? 'var(--hijau)' : '#fff', color: activeTab === tab.id ? '#fff' : 'var(--abu-500)', border: `1.5px solid ${activeTab === tab.id ? 'var(--hijau)' : 'var(--abu-200)'}`, borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : 'var(--danger)', color: '#fff', borderRadius: 'var(--radius-full)', fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ==============================
            TAB: PENDING
        ============================== */}
        {activeTab === 'pending' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {!loading && pending.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))', borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, color: '#fff' }}>
                <span style={{ fontSize: '1.5rem' }}>📬</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{pending.length} Setoran Menunggu</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Total: {formatRupiah(pending.reduce((a, s) => a + s.nominal, 0))}</div>
                </div>
              </div>
            )}

            {!loading && pending.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
                <button
                  onClick={() => setSelectedPending(allSelected ? new Set() : new Set(pending.map(s => s.id)))}
                  style={{ padding: '7px 12px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${allSelected ? 'var(--hijau)' : 'var(--abu-200)'}`, background: allSelected ? 'var(--hijau-pale)' : '#fff', color: allSelected ? 'var(--hijau)' : 'var(--abu-500)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0 }}
                >
                  {allSelected ? '✓ Batal' : '☐ Pilih Semua'}
                </button>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ flex: 1, padding: '7px 10px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--abu-200)', fontSize: '0.75rem', fontFamily: 'var(--font-body)', background: '#fff', color: 'var(--abu-700)' }}>
                  {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
            )}

            {selectedPending.size > 0 && (
              <div style={{ background: 'var(--hijau)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, animation: 'slideUp 0.2s ease' }}>
                <div style={{ color: '#fff' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{selectedPending.size} dipilih</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>{formatRupiah(totalSelectedNominal)}</div>
                </div>
                <button onClick={handleBatchApprove} disabled={batchProcessing}
                  style={{ background: '#fff', color: 'var(--hijau)', border: 'none', borderRadius: 'var(--radius-full)', padding: '8px 16px', fontWeight: 700, fontSize: '0.82rem', cursor: batchProcessing ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', opacity: batchProcessing ? 0.7 : 1 }}>
                  {batchProcessing ? '⏳...' : `✓ Terima ${selectedPending.size}`}
                </button>
              </div>
            )}

            {loading ? (
              [1,2,3].map(i => <SkeletonCard key={i} style={{ marginBottom: 10 }} />)
            ) : sortedPending.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <p style={{ fontWeight: 600 }}>Semua setoran sudah diproses!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sortedPending.map(item => {
                  const isSelected = selectedPending.has(item.id);
                  const k = kenclengList.find(k => k.id === item.kenclengId);
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', background: isSelected ? 'var(--hijau-pale)' : '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: `1.5px solid ${isSelected ? 'var(--hijau)' : 'transparent'}`, transition: 'all 0.2s' }}>
                      <div onClick={() => setSelectedPending(prev => { const s = new Set(prev); isSelected ? s.delete(item.id) : s.add(item.id); return s; })}
                        style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${isSelected ? 'var(--hijau)' : 'var(--abu-300)'}`, background: isSelected ? 'var(--hijau)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>
                        {isSelected && <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--hijau)' }}>{formatRupiah(item.nominal)}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>{item.createdAt ? formatTimeAgo(item.createdAt) : '-'}</span>
                        </div>
                        {k && <div style={{ fontSize: '0.78rem', color: 'var(--abu-500)', marginBottom: 4 }}>🪣 <strong>{k.nama}</strong> · Saldo: {formatRupiah(k.saldo || 0)}</div>}
                        {item.catatan && <p style={{ fontSize: '0.78rem', color: 'var(--abu-500)', fontStyle: 'italic', marginBottom: 6 }}>"{item.catatan}"</p>}
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          <button onClick={() => handleApprove(item)} disabled={processing}
                            style={{ padding: '5px 14px', background: 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>✓ Terima</button>
                          <button onClick={() => setRejectModal(item)}
                            style={{ padding: '5px 14px', background: 'transparent', color: 'var(--danger)', border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>✕ Tolak</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==============================
            TAB: SCAN
        ============================== */}
        {activeTab === 'scan' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--abu-500)', marginBottom: 16, textAlign: 'center' }}>Arahkan kamera ke QR Code kencleng warga</p>
            <ScanQR onScanSuccess={handleScanSuccess} />
          </div>
        )}

        {/* ==============================
            TAB: MANUAL — Pilih Warga → Pilih Kencleng → Input
        ============================== */}
        {activeTab === 'manual' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {selectedKencleng ? (
              // Step 3: Form input setoran
              <>
                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: '0.78rem', color: 'var(--abu-400)' }}>
                  <button onClick={() => { setSelectedKencleng(null); setSelectedWarga(null); setSearchWarga(''); setWargaKencleng([]); }}
                    style={{ background: 'none', border: 'none', color: 'var(--hijau)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, padding: 0 }}>
                    Pilih Warga
                  </button>
                  <span>›</span>
                  <button onClick={() => setSelectedKencleng(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--hijau)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, padding: 0 }}>
                    {selectedWarga?.nama || 'Warga'}
                  </button>
                  <span>›</span>
                  <span style={{ color: 'var(--abu-700)', fontWeight: 600 }}>{selectedKencleng.nama}</span>
                </div>
                <InputSetoran kencleng={selectedKencleng} onSuccess={handleSetoranSuccess} onCancel={() => setSelectedKencleng(null)} />
              </>
            ) : selectedWarga ? (
              // Step 2: Pilih kencleng milik warga ini
              <>
                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: '0.78rem', color: 'var(--abu-400)' }}>
                  <button onClick={() => { setSelectedWarga(null); setSearchWarga(''); setWargaKencleng([]); }}
                    style={{ background: 'none', border: 'none', color: 'var(--hijau)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, padding: 0 }}>
                    Pilih Warga
                  </button>
                  <span>›</span>
                  <span style={{ color: 'var(--abu-700)', fontWeight: 600 }}>{selectedWarga.nama || selectedWarga.email}</span>
                </div>

                {/* Info warga */}
                <div style={{ background: 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>👤</div>
                  <div style={{ color: '#fff' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedWarga.nama || '-'}</div>
                    <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>{selectedWarga.email}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  Pilih Kencleng
                </div>

                {loadingWargaKencleng ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
                ) : wargaKencleng.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🪣</div>
                    <p style={{ fontWeight: 600 }}>Belum ada kencleng</p>
                    <p style={{ fontSize: '0.875rem' }}>Warga ini belum memiliki kencleng aktif</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {wargaKencleng.map(k => {
                      const pct = Math.min(100, Math.round(((k.saldo||0) / (k.target||500000)) * 100));
                      const isFull = pct >= 100;
                      return (
                        <button key={k.id} onClick={() => setSelectedKencleng(k)}
                          style={{ width: '100%', padding: '16px', background: '#fff', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--hijau)'; e.currentTarget.style.background = 'var(--hijau-pale)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--abu-200)'; e.currentTarget.style.background = '#fff'; }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div>
                              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{k.nama}</span>
                              {isFull && <span style={{ marginLeft: 8, fontSize: '0.68rem', background: 'var(--kuning-pale)', color: 'var(--kuning)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>PENUH 🎉</span>}
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--hijau)', fontSize: '0.9rem' }}>{formatRupiah(k.saldo || 0)}</span>
                          </div>
                          <div style={{ height: 6, background: 'var(--abu-100)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: isFull ? 'var(--kuning)' : 'linear-gradient(90deg, var(--hijau), var(--hijau-muda))', borderRadius: 3 }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--abu-400)' }}>
                            <span>{pct}% dari {formatRupiah(k.target)}</span>
                            <span style={{ color: k.status === 'aktif' ? 'var(--hijau)' : 'var(--abu-400)', fontWeight: 600 }}>
                              {k.status === 'aktif' ? '🟢 Aktif' : '⭕ Nonaktif'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              // Step 1: Cari & pilih warga
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  Langkah 1 — Pilih Warga
                </div>

                {/* Search input dengan dropdown */}
                <div style={{ position: 'relative', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: `1.5px solid ${showWargaDropdown ? 'var(--hijau)' : 'var(--abu-200)'}`, borderRadius: showWargaDropdown ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)', padding: '12px 16px', gap: 10, transition: 'border-color 0.2s' }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔍</span>
                    <input
                      type="text"
                      value={searchWarga}
                      onChange={e => { setSearchWarga(e.target.value); setShowWargaDropdown(true); setSelectedWarga(null); }}
                      onFocus={() => setShowWargaDropdown(true)}
                      placeholder="Ketik nama atau email warga..."
                      style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', fontFamily: 'var(--font-body)', background: 'transparent', color: 'var(--hitam)', padding: 0 }}
                    />
                    {searchWarga && (
                      <button onClick={() => { setSearchWarga(''); setShowWargaDropdown(false); setSelectedWarga(null); }}
                        style={{ background: 'var(--abu-200)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', color: 'var(--abu-500)' }}>
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Dropdown list */}
                  {showWargaDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid var(--hijau)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', boxShadow: 'var(--shadow-md)', zIndex: 100, maxHeight: 280, overflowY: 'auto' }}>
                      {loading ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--abu-400)', fontSize: '0.85rem' }}>Memuat data...</div>
                      ) : filteredWarga.length === 0 ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--abu-400)', fontSize: '0.85rem' }}>Warga tidak ditemukan</div>
                      ) : (
                        filteredWarga.map(w => (
                          <button key={w.uid} onClick={() => handleSelectWarga(w)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', borderBottom: '1px solid var(--abu-100)', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--hijau-pale)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--hijau-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>👤</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--hitam)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.nama || '—'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--abu-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.email}</div>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--abu-300)', flexShrink: 0 }}>›</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Hint */}
                <p style={{ fontSize: '0.75rem', color: 'var(--abu-400)', marginTop: 8 }}>
                  {wargaList.length} warga terdaftar · Pilih warga untuk melihat daftar kenclengnya
                </p>

                {/* Atau: tampilkan semua warga langsung */}
                {!showWargaDropdown && !searchWarga && (
                  <>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--abu-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '20px 0 10px' }}>
                      Atau pilih dari daftar
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {loading ? [1,2,3].map(i => <SkeletonCard key={i} />) : wargaList.map(w => (
                        <button key={w.uid} onClick={() => handleSelectWarga(w)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--hijau)'; e.currentTarget.style.background = 'var(--hijau-pale)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--abu-200)'; e.currentTarget.style.background = '#fff'; }}
                        >
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--hijau-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>👤</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--hitam)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.nama || '—'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--abu-400)' }}>{w.email}</div>
                          </div>
                          <span style={{ color: 'var(--abu-300)', fontSize: '1rem' }}>›</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==============================
            TAB: RIWAYAT
        ============================== */}
        {activeTab === 'riwayat' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              30 Setoran Terakhir
            </div>
            <RiwayatSetoran data={recentSetoran} loading={loading} />
          </div>
        )}

        {/* ==============================
            REJECT MODAL
        ============================== */}
        {rejectModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,22,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 500, animation: 'fadeIn 0.2s ease' }}
            onClick={e => { if (e.target === e.currentTarget) setRejectModal(null); }}>
            <div style={{ background: '#fff', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 480, animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
              <h3 style={{ marginBottom: 6 }}>Tolak Setoran</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--abu-500)', marginBottom: 16 }}>Setoran sebesar {formatRupiah(rejectModal.nominal)} akan ditolak.</p>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--abu-500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alasan</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {['Nominal tidak sesuai', 'Bukti tidak jelas', 'Duplikat setoran'].map(a => (
                  <button key={a} onClick={() => setAlasan(a)}
                    style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${alasan === a ? 'var(--danger)' : 'var(--abu-200)'}`, background: alasan === a ? '#fdeaea' : '#fff', color: alasan === a ? 'var(--danger)' : 'var(--abu-500)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    {a}
                  </button>
                ))}
              </div>
              <input type="text" value={alasan} onChange={e => setAlasan(e.target.value)} placeholder="Atau tulis alasan lain..."
                style={{ width: '100%', padding: '12px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)', fontSize: '1rem', marginBottom: 16, fontFamily: 'var(--font-body)' }} />
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setRejectModal(null)} style={{ flex: 1, padding: '12px', background: 'var(--abu-100)', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
                <button onClick={handleRejectConfirm} disabled={processing || !alasan.trim()}
                  style={{ flex: 1, padding: '12px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: processing || !alasan.trim() ? 'not-allowed' : 'pointer', opacity: processing || !alasan.trim() ? 0.6 : 1 }}>
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
