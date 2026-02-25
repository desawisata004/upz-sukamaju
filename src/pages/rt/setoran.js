// src/pages/rt/setoran.js — UPGRADED
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
  getSetoranRecentAll,
} from '../../services/kenclengService';
import { notifySetoranDiterima, notifySetoranDitolak } from '../../services/notificationService';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import { formatRupiah, formatTimeAgo } from '../../utils/formatter';
import { useAuth } from '../../hooks/useAuth';
import { SkeletonCard } from '../../components/common/Loading';

// ---- Sort options ----
const SORT_OPTIONS = [
  { id: 'terlama', label: 'Terlama' },
  { id: 'terbaru', label: 'Terbaru' },
  { id: 'terbesar', label: 'Nominal ↑' },
  { id: 'terkecil', label: 'Nominal ↓' },
];

const RTSetoranPage = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [kenclengList, setKenclengList] = useState([]);
  const [recentSetoran, setRecentSetoran] = useState([]);
  const [selectedKencleng, setSelectedKencleng] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [alasan, setAlasan] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('terlama');
  const [selectedPending, setSelectedPending] = useState(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('aktif'); // aktif | semua

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingData, allKencleng, recent] = await Promise.all([
        getPendingSetoran(),
        getKenclengWithStats(),
        getSetoranRecentAll(20),
      ]);
      setPending(pendingData);
      setKenclengList(allKencleng);
      setRecentSetoran(recent);
    } catch (error) {
      setAlert({ type: 'error', message: 'Gagal memuat data: ' + error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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
    } finally {
      setProcessing(false);
    }
  };

  // ---- Batch approve ----
  const handleBatchApprove = async () => {
    if (selectedPending.size === 0) return;
    setBatchProcessing(true);
    try {
      const toApprove = pending.filter(s => selectedPending.has(s.id));
      await approveSetoranBatch(toApprove);
      const totalNominal = toApprove.reduce((a, s) => a + (s.nominal || 0), 0);
      setAlert({ type: 'success', message: `✅ ${toApprove.length} setoran (${formatRupiah(totalNominal)}) berhasil diterima sekaligus!` });
      setSelectedPending(new Set());
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Batch approve gagal: ' + err.message });
    } finally {
      setBatchProcessing(false);
    }
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
    } finally {
      setProcessing(false);
    }
  };

  // ---- Scan ----
  const handleScanSuccess = async (data) => {
    try {
      const k = await getKenclengById(data.kenclengId);
      if (!k) { setAlert({ type: 'error', message: 'Kencleng tidak ditemukan.' }); return; }
      setSelectedKencleng(k); setActiveTab('manual');
    } catch (err) {
      setAlert({ type: 'error', message: 'Gagal memuat data kencleng.' });
    }
  };

  const handleSetoranSuccess = () => {
    setAlert({ type: 'success', message: '✅ Setoran berhasil dicatat! Menunggu konfirmasi.' });
    setSelectedKencleng(null); setActiveTab('pending'); loadData();
  };

  // ---- Sorted & filtered kencleng ----
  const filteredKencleng = useMemo(() => {
    let list = kenclengList;
    if (filterStatus === 'aktif') list = list.filter(k => k.status === 'aktif');
    if (searchTerm) list = list.filter(k => k.nama.toLowerCase().includes(searchTerm.toLowerCase()));
    return [...list].sort((a, b) => {
      if (sortBy === 'terbesar') return (b.saldo || 0) - (a.saldo || 0);
      if (sortBy === 'terkecil') return (a.saldo || 0) - (b.saldo || 0);
      if (sortBy === 'terbaru') return (b.jumlahSetoran || 0) - (a.jumlahSetoran || 0);
      return (a.jumlahSetoran || 0) - (b.jumlahSetoran || 0); // terlama = belum setor dulu
    });
  }, [kenclengList, searchTerm, sortBy, filterStatus]);

  // ---- Sorted pending ----
  const sortedPending = useMemo(() => {
    return [...pending].sort((a, b) => {
      if (sortBy === 'terbesar') return (b.nominal || 0) - (a.nominal || 0);
      if (sortBy === 'terkecil') return (a.nominal || 0) - (b.nominal || 0);
      if (sortBy === 'terbaru') {
        const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return tb - ta;
      }
      const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return ta - tb;
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
      <Header
        title="Setoran RT"
        showBack
        rightAction={
          <span style={{ background: 'var(--hijau-pale)', color: 'var(--hijau)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
            {userData?.nama || 'RT'}
          </span>
        }
      />

      <div className="page-content">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={4000} />}

        {/* Tab Nav */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedKencleng(null); setSearchTerm(''); }}
              style={{ flexShrink: 0, position: 'relative', padding: '9px 14px', background: activeTab === tab.id ? 'var(--hijau)' : '#fff', color: activeTab === tab.id ? '#fff' : 'var(--abu-500)', border: `1.5px solid ${activeTab === tab.id ? 'var(--hijau)' : 'var(--abu-200)'}`, borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : 'var(--danger)', color: '#fff', borderRadius: 'var(--radius-full)', fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ======= PENDING TAB ======= */}
        {activeTab === 'pending' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Summary banner */}
            {!loading && pending.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))', borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, color: '#fff' }}>
                <span style={{ fontSize: '1.5rem' }}>📬</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{pending.length} Setoran Menunggu</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Total: {formatRupiah(pending.reduce((a, s) => a + s.nominal, 0))}</div>
                </div>
              </div>
            )}

            {/* Sort & Batch toolbar */}
            {!loading && pending.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Select all */}
                <button
                  onClick={() => setSelectedPending(allSelected ? new Set() : new Set(pending.map(s => s.id)))}
                  style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${allSelected ? 'var(--hijau)' : 'var(--abu-200)'}`, background: allSelected ? 'var(--hijau-pale)' : '#fff', color: allSelected ? 'var(--hijau)' : 'var(--abu-500)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                >
                  {allSelected ? '✓ Batal pilih' : '☐ Pilih semua'}
                </button>

                {/* Sort */}
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--abu-200)', fontSize: '0.75rem', fontFamily: 'var(--font-body)', background: '#fff', color: 'var(--abu-700)' }}>
                  {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
            )}

            {/* Batch approve bar */}
            {selectedPending.size > 0 && (
              <div style={{ background: 'var(--hijau)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, animation: 'slideUp 0.2s ease' }}>
                <div style={{ color: '#fff' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{selectedPending.size} dipilih</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>{formatRupiah(totalSelectedNominal)}</div>
                </div>
                <button
                  onClick={handleBatchApprove}
                  disabled={batchProcessing}
                  style={{ background: '#fff', color: 'var(--hijau)', border: 'none', borderRadius: 'var(--radius-full)', padding: '8px 18px', fontWeight: 700, fontSize: '0.85rem', cursor: batchProcessing ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', opacity: batchProcessing ? 0.7 : 1 }}
                >
                  {batchProcessing ? '⏳ Memproses...' : `✓ Terima ${selectedPending.size} Sekaligus`}
                </button>
              </div>
            )}

            {/* Pending items */}
            {loading ? (
              [1,2,3].map(i => <SkeletonCard key={i} style={{ marginBottom: 10 }} />)
            ) : sortedPending.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <p style={{ fontWeight: 600 }}>Semua setoran sudah diproses!</p>
                <p style={{ fontSize: '0.875rem' }}>Tidak ada yang menunggu konfirmasi</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sortedPending.map(item => {
                  const isSelected = selectedPending.has(item.id);
                  return (
                    <div key={item.id}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', background: isSelected ? 'var(--hijau-pale)' : '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: `1.5px solid ${isSelected ? 'var(--hijau)' : 'transparent'}`, transition: 'all 0.2s' }}>
                      {/* Checkbox */}
                      <div
                        onClick={() => setSelectedPending(prev => { const s = new Set(prev); isSelected ? s.delete(item.id) : s.add(item.id); return s; })}
                        style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${isSelected ? 'var(--hijau)' : 'var(--abu-300)'}`, background: isSelected ? 'var(--hijau)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}
                      >
                        {isSelected && <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--hijau)' }}>{formatRupiah(item.nominal)}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--abu-400)', flexShrink: 0 }}>{item.createdAt ? formatTimeAgo(item.createdAt) : '-'}</span>
                        </div>

                        {/* Info kencleng */}
                        {(() => {
                          const k = kenclengList.find(k => k.id === item.kenclengId);
                          return k ? (
                            <div style={{ fontSize: '0.78rem', color: 'var(--abu-500)', marginBottom: 4 }}>
                              🪣 <strong>{k.nama}</strong> · Saldo: {formatRupiah(k.saldo || 0)}
                            </div>
                          ) : null;
                        })()}

                        {item.catatan && <p style={{ fontSize: '0.78rem', color: 'var(--abu-500)', marginBottom: 6, fontStyle: 'italic' }}>"{item.catatan}"</p>}

                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button onClick={() => handleApprove(item)} disabled={processing}
                            style={{ padding: '5px 14px', background: 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', opacity: processing ? 0.7 : 1 }}>
                            ✓ Terima
                          </button>
                          <button onClick={() => setRejectModal(item)}
                            style={{ padding: '5px 14px', background: 'transparent', color: 'var(--danger)', border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                            ✕ Tolak
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======= SCAN TAB ======= */}
        {activeTab === 'scan' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--abu-500)', marginBottom: 16, textAlign: 'center' }}>Arahkan kamera ke QR Code kencleng warga</p>
            <ScanQR onScanSuccess={handleScanSuccess} />
          </div>
        )}

        {/* ======= MANUAL TAB ======= */}
        {activeTab === 'manual' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {selectedKencleng ? (
              <InputSetoran kencleng={selectedKencleng} onSuccess={handleSetoranSuccess} onCancel={() => { setSelectedKencleng(null); setSearchTerm(''); }} />
            ) : (
              <>
                {/* Search & Filter bar */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <input
                    type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    placeholder="🔍 Cari nama kencleng..."
                    style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontFamily: 'var(--font-body)', background: '#fff' }}
                  />
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    style={{ padding: '10px 10px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--abu-200)', fontSize: '0.75rem', fontFamily: 'var(--font-body)', background: '#fff', color: 'var(--abu-700)', flexShrink: 0 }}>
                    {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </div>

                {/* Filter status */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                  {[{ id: 'aktif', label: '🟢 Aktif saja' }, { id: 'semua', label: '📋 Semua' }].map(f => (
                    <button key={f.id} onClick={() => setFilterStatus(f.id)}
                      style={{ padding: '5px 12px', borderRadius: 'var(--radius-full)', border: 'none', background: filterStatus === f.id ? 'var(--hijau)' : 'var(--abu-100)', color: filterStatus === f.id ? '#fff' : 'var(--abu-500)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                      {f.label}
                    </button>
                  ))}
                  <span style={{ fontSize: '0.75rem', color: 'var(--abu-400)', alignSelf: 'center', marginLeft: 4 }}>{filteredKencleng.length} kencleng</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: 32 }}>Loading...</div>
                  ) : filteredKencleng.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">🔍</div><p>Kencleng tidak ditemukan</p></div>
                  ) : (
                    filteredKencleng.map(k => {
                      const pct = Math.min(100, Math.round(((k.saldo||0) / (k.target||500000)) * 100));
                      return (
                        <button key={k.id} onClick={() => setSelectedKencleng(k)}
                          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#fff', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', transition: 'border-color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--hijau)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--abu-200)'}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, marginBottom: 2, fontSize: '0.9rem' }}>{k.nama}</div>
                            <div style={{ height: 4, background: 'var(--abu-100)', borderRadius: 2, overflow: 'hidden', marginBottom: 4, width: '80%' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? 'var(--kuning)' : 'var(--hijau)', borderRadius: 2 }} />
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--abu-400)' }}>
                              {formatRupiah(k.saldo || 0)} / {formatRupiah(k.target)} · {pct}%
                              {k.lastSetoran ? ` · ${formatTimeAgo(k.lastSetoran)}` : ' · Belum pernah setor'}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: k.status === 'aktif' ? 'var(--hijau)' : 'var(--abu-400)', fontWeight: 600, marginLeft: 10, flexShrink: 0 }}>
                            {k.status === 'aktif' ? '🟢' : '⭕'}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ======= RIWAYAT TAB ======= */}
        {activeTab === 'riwayat' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              30 Setoran Terakhir (Semua Status)
            </div>
            <RiwayatSetoran data={recentSetoran} loading={loading} />
          </div>
        )}

        {/* ======= REJECT MODAL ======= */}
        {rejectModal && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,22,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 500, animation: 'fadeIn 0.2s ease' }}
            onClick={e => { if (e.target === e.currentTarget) setRejectModal(null); }}
          >
            <div style={{ background: '#fff', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 480, animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
              <h3 style={{ marginBottom: 6 }}>Tolak Setoran</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--abu-500)', marginBottom: 16 }}>
                Setoran sebesar {formatRupiah(rejectModal.nominal)} akan ditolak.
              </p>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--abu-500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alasan Penolakan</label>

              {/* Alasan presets */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {['Nominal tidak sesuai', 'Bukti tidak jelas', 'Duplikat setoran'].map(a => (
                  <button key={a} onClick={() => setAlasan(a)}
                    style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${alasan === a ? 'var(--danger)' : 'var(--abu-200)'}`, background: alasan === a ? '#fdeaea' : '#fff', color: alasan === a ? 'var(--danger)' : 'var(--abu-500)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    {a}
                  </button>
                ))}
              </div>

              <input type="text" value={alasan} onChange={e => setAlasan(e.target.value)} placeholder="Atau masukkan alasan lain..."
                style={{ width: '100%', padding: '12px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)', fontSize: '1rem', marginBottom: 16, fontFamily: 'var(--font-body)' }} />

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setRejectModal(null)}
                  style={{ flex: 1, padding: '12px', background: 'var(--abu-100)', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer' }}>
                  Batal
                </button>
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
