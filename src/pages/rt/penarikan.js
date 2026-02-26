// src/pages/rt/penarikan.js — Manajemen Penarikan (RT & Admin)
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Alert from '../../components/common/Alert';
import { SkeletonCard, Spinner } from '../../components/common/Loading';
import {
  getPendingPenarikan,
  getAllPenarikan,
  approvePenarikan,
  rejectPenarikan,
  getPenarikanStats,
  getKenclengWithStats,
  getKenclengByUser,
  createPenarikan,
} from '../../services/kenclengService';
import { getWargaUsers } from '../../services/userService';
import {
  notifyPenarikanDisetujui,
  notifyPenarikanDitolak,
  notifyPenarikanDiajukan,
} from '../../services/notificationService';
import { formatRupiah, formatTimeAgo, formatTanggal } from '../../utils/formatter';
import { useAuth } from '../../hooks/useAuth';

// ───────────────────────────────
// Status config
// ───────────────────────────────
const STATUS_CFG = {
  pending:   { label: 'Menunggu', color: '#e8a020', bg: '#fef8ec', icon: '⏳' },
  disetujui: { label: 'Disetujui', color: '#1a6b3c', bg: '#e8f5ee', icon: '✅' },
  ditolak:   { label: 'Ditolak',  color: '#c0392b', bg: '#fdeaea', icon: '❌' },
  selesai:   { label: 'Selesai',  color: '#2471a3', bg: '#eaf4fb', icon: '🏦' },
};

const ALASAN_PRESETS = ['Saldo tidak mencukupi', 'Dokumen tidak lengkap', 'Belum memenuhi syarat', 'Masa penguncian belum selesai'];

// ───────────────────────────────
// Sub-components
// ───────────────────────────────
const StatBadge = ({ icon, label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '12px 10px', boxShadow: 'var(--shadow-sm)', textAlign: 'center', borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--hitam)', fontFamily: 'var(--font-display)' }}>{value}</div>
    <div style={{ fontSize: '0.68rem', color: 'var(--abu-400)', marginTop: 2 }}>{label}</div>
  </div>
);

const PenarikanItem = ({ item, kenclengMap, onApprove, onReject }) => {
  const cfg = STATUS_CFG[item.status] || STATUS_CFG.pending;
  const kencleng = kenclengMap?.[item.kenclengId];
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '14px 16px', boxShadow: 'var(--shadow-sm)', borderLeft: `3px solid ${cfg.color}`, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#c0392b' }}>- {formatRupiah(item.nominal)}</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      {kencleng && (
        <div style={{ fontSize: '0.78rem', color: 'var(--abu-600)', marginBottom: 4 }}>
          🪣 <strong>{kencleng.nama}</strong>
          <span style={{ color: 'var(--abu-400)' }}> · Saldo: {formatRupiah(kencleng.saldo || 0)}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', color: 'var(--abu-400)', marginBottom: 4, flexWrap: 'wrap' }}>
        <span>📋 {item.jenis === 'penuh' ? 'Penarikan penuh' : 'Penarikan sebagian'}</span>
        <span>🕐 {item.createdAt ? formatTimeAgo(item.createdAt) : '-'}</span>
      </div>

      {item.catatan ? (
        <p style={{ fontSize: '0.78rem', color: 'var(--abu-500)', fontStyle: 'italic', marginBottom: 6 }}>"{item.catatan}"</p>
      ) : null}

      {item.status === 'ditolak' && item.alasanDitolak && (
        <div style={{ fontSize: '0.72rem', color: '#c0392b', background: '#fdeaea', padding: '6px 10px', borderRadius: 'var(--radius-sm)', marginBottom: 6 }}>
          Alasan: {item.alasanDitolak}
        </div>
      )}

      {item.status === 'disetujui' && (
        <div style={{ fontSize: '0.72rem', color: '#1a6b3c', background: '#e8f5ee', padding: '6px 10px', borderRadius: 'var(--radius-sm)', marginBottom: 6 }}>
          ✅ Disetujui · {item.approvedAt ? formatTanggal(item.approvedAt) : ''}
        </div>
      )}

      {item.status === 'pending' && onApprove && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button onClick={() => onApprove(item)}
            style={{ flex: 1, padding: '8px', background: 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            ✓ Setujui
          </button>
          <button onClick={() => onReject(item)}
            style={{ flex: 1, padding: '8px', background: 'transparent', color: '#c0392b', border: '1.5px solid #c0392b', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            ✕ Tolak
          </button>
        </div>
      )}
    </div>
  );
};

// ───────────────────────────────
// Form Ajukan Penarikan (RT input untuk warga)
// ───────────────────────────────
const FormAjukanPenarikan = ({ wargaList, onSuccess, onCancel, currentUser }) => {
  const [step, setStep] = useState(1); // 1=pilih warga, 2=pilih kencleng, 3=isi form
  const [selectedWarga, setSelectedWarga] = useState(null);
  const [searchWarga, setSearchWarga] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [wargaKencleng, setWargaKencleng] = useState([]);
  const [loadingKencleng, setLoadingKencleng] = useState(false);
  const [selectedKencleng, setSelectedKencleng] = useState(null);
  const [nominal, setNominal] = useState('');
  const [jenis, setJenis] = useState('sebagian');
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const filteredWarga = useMemo(() => {
    if (!searchWarga) return wargaList;
    const q = searchWarga.toLowerCase();
    return wargaList.filter(w => (w.nama||'').toLowerCase().includes(q) || (w.email||'').toLowerCase().includes(q));
  }, [wargaList, searchWarga]);

  const handleSelectWarga = async (w) => {
    setSelectedWarga(w);
    setSearchWarga(w.nama || w.email || '');
    setShowDropdown(false);
    setLoadingKencleng(true);
    setStep(2);
    try {
      const list = await getKenclengByUser(w.uid);
      setWargaKencleng(list.filter(k => k.status === 'aktif'));
    } finally { setLoadingKencleng(false); }
  };

  const handleSelectKencleng = (k) => {
    setSelectedKencleng(k);
    setStep(3);
    if (jenis === 'penuh') setNominal(String(k.saldo || 0));
  };

  const handleJenisChange = (val) => {
    setJenis(val);
    if (val === 'penuh' && selectedKencleng) setNominal(String(selectedKencleng.saldo || 0));
    else if (val === 'sebagian') setNominal('');
  };

  const handleSubmit = async () => {
    const num = parseInt(nominal.replace(/[^0-9]/g, '') || '0', 10);
    if (!num || num <= 0) { setErr('Nominal harus diisi.'); return; }
    if (num > (selectedKencleng?.saldo || 0)) { setErr(`Melebihi saldo. Maksimal: ${formatRupiah(selectedKencleng?.saldo || 0)}`); return; }
    setLoading(true); setErr('');
    try {
      await createPenarikan({
        kenclengId: selectedKencleng.id,
        userId: selectedKencleng.userId,
        nominal: num,
        jenis,
        catatan: catatan.trim(),
        requestBy: currentUser?.uid || 'rt',
      });
      onSuccess();
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const NOMINAL_PRESETS_TARIK = [50000, 100000, 200000, 500000];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: '0.75rem', color: 'var(--abu-400)', flexWrap: 'wrap' }}>
        <span onClick={() => { setStep(1); setSelectedWarga(null); setSearchWarga(''); setSelectedKencleng(null); }}
          style={{ color: step > 1 ? 'var(--hijau)' : 'var(--abu-500)', cursor: step > 1 ? 'pointer' : 'default', fontWeight: 600 }}>
          Pilih Warga
        </span>
        <span>›</span>
        <span onClick={() => { if (step > 2) { setStep(2); setSelectedKencleng(null); } }}
          style={{ color: step > 2 ? 'var(--hijau)' : step === 2 ? 'var(--abu-700)' : 'var(--abu-300)', cursor: step > 2 ? 'pointer' : 'default', fontWeight: step === 2 ? 700 : 600 }}>
          {selectedWarga ? (selectedWarga.nama || selectedWarga.email) : 'Pilih Kencleng'}
        </span>
        {step === 3 && <><span>›</span><span style={{ color: 'var(--abu-700)', fontWeight: 700 }}>{selectedKencleng?.nama}</span></>}
      </div>

      {/* Step 1: Pilih warga */}
      {step === 1 && (
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Pilih Warga
          </div>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: `1.5px solid ${showDropdown ? 'var(--hijau)' : 'var(--abu-200)'}`, borderRadius: showDropdown ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)', padding: '12px 16px', gap: 10 }}>
              <span>🔍</span>
              <input type="text" value={searchWarga} onChange={e => { setSearchWarga(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Ketik nama atau email warga..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', fontFamily: 'var(--font-body)', background: 'transparent', padding: 0 }} />
              {searchWarga && <button onClick={() => { setSearchWarga(''); setShowDropdown(false); }} style={{ background: 'var(--abu-200)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '0.7rem', color: 'var(--abu-500)' }}>✕</button>}
            </div>
            {showDropdown && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid var(--hijau)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', boxShadow: 'var(--shadow-md)', zIndex: 100, maxHeight: 260, overflowY: 'auto' }}>
                {filteredWarga.length === 0 ? (
                  <div style={{ padding: 16, textAlign: 'center', color: 'var(--abu-400)', fontSize: '0.85rem' }}>Warga tidak ditemukan</div>
                ) : filteredWarga.map(w => (
                  <button key={w.uid} onClick={() => handleSelectWarga(w)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--abu-100)', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hijau-pale)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--hijau-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>👤</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.nama || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--abu-400)' }}>{w.email}</div>
                    </div>
                    <span style={{ color: 'var(--abu-300)' }}>›</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Daftar warga langsung */}
          {!showDropdown && !searchWarga && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {wargaList.map(w => (
                <button key={w.uid} onClick={() => handleSelectWarga(w)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--hijau)'; e.currentTarget.style.background = 'var(--hijau-pale)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--abu-200)'; e.currentTarget.style.background = '#fff'; }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--hijau-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>👤</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.nama || '—'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--abu-400)' }}>{w.email}</div>
                  </div>
                  <span style={{ color: 'var(--abu-300)', fontSize: '1rem' }}>›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Pilih kencleng */}
      {step === 2 && (
        <div>
          {/* Info warga */}
          <div style={{ background: 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>👤</div>
            <div style={{ color: '#fff' }}>
              <div style={{ fontWeight: 700 }}>{selectedWarga?.nama || '—'}</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>{selectedWarga?.email}</div>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Pilih Kencleng
          </div>

          {loadingKencleng ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
          ) : wargaKencleng.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🪣</div><p style={{ fontWeight: 600 }}>Tidak ada kencleng aktif</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {wargaKencleng.map(k => {
                const pct = Math.min(100, Math.round(((k.saldo||0) / (k.target||500000)) * 100));
                const isFull = pct >= 100;
                return (
                  <button key={k.id} onClick={() => handleSelectKencleng(k)}
                    style={{ width: '100%', padding: '16px', background: '#fff', border: `1.5px solid ${(k.saldo||0) === 0 ? 'var(--abu-200)' : 'var(--abu-200)'}`, borderRadius: 'var(--radius-md)', cursor: (k.saldo||0) === 0 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', opacity: (k.saldo||0) === 0 ? 0.55 : 1, transition: 'all 0.2s' }}
                    disabled={(k.saldo||0) === 0}
                    onMouseEnter={e => { if ((k.saldo||0) > 0) { e.currentTarget.style.borderColor = '#c0392b'; e.currentTarget.style.background = '#fff5f5'; }}}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--abu-200)'; e.currentTarget.style.background = '#fff'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{k.nama}</span>
                        {isFull && <span style={{ marginLeft: 6, fontSize: '0.68rem', background: 'var(--kuning-pale)', color: 'var(--kuning)', padding: '1px 7px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>PENUH</span>}
                      </div>
                      <span style={{ fontWeight: 700, color: (k.saldo||0) === 0 ? 'var(--abu-300)' : '#c0392b', fontSize: '0.95rem' }}>
                        {(k.saldo||0) === 0 ? 'Saldo 0' : formatRupiah(k.saldo)}
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'var(--abu-100)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: isFull ? 'var(--kuning)' : 'var(--hijau)', borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>{pct}% dari {formatRupiah(k.target)}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Isi form penarikan */}
      {step === 3 && selectedKencleng && (
        <div>
          {/* Info kencleng */}
          <div style={{ background: 'linear-gradient(135deg, #c0392b, #e74c3c)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', marginBottom: 16, color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: 2 }}>🪣 {selectedKencleng.nama}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, marginBottom: 2 }}>{formatRupiah(selectedKencleng.saldo || 0)}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Saldo tersedia untuk ditarik</div>
          </div>

          {/* Jenis penarikan */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Jenis Penarikan</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ id: 'sebagian', label: '💰 Sebagian', sub: 'Nominal tertentu' }, { id: 'penuh', label: '🏦 Penuh', sub: 'Seluruh saldo' }].map(j => (
                <button key={j.id} onClick={() => handleJenisChange(j.id)}
                  style={{ flex: 1, padding: '12px 8px', background: jenis === j.id ? '#fdeaea' : '#fff', border: `1.5px solid ${jenis === j.id ? '#c0392b' : 'var(--abu-200)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'center', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: jenis === j.id ? '#c0392b' : 'var(--abu-700)', marginBottom: 2 }}>{j.label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--abu-400)' }}>{j.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Nominal */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Nominal</div>
            <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: nominal ? '#c0392b' : 'var(--abu-300)', textAlign: 'center', padding: '10px 0 6px' }}>
              {nominal ? formatRupiah(parseInt(nominal.replace(/[^0-9]/g,'') || '0', 10)) : 'Rp 0'}
            </div>
            <input type="number" value={nominal} onChange={e => setNominal(e.target.value)}
              disabled={jenis === 'penuh'}
              placeholder="Masukkan nominal..."
              style={{ width: '100%', padding: '12px 16px', border: `1.5px solid ${err ? '#c0392b' : 'var(--abu-200)'}`, borderRadius: 'var(--radius-md)', fontSize: '1rem', fontFamily: 'var(--font-body)', background: jenis === 'penuh' ? 'var(--abu-100)' : '#fff', marginBottom: 10 }} />
            {jenis === 'sebagian' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {NOMINAL_PRESETS_TARIK.filter(p => p <= (selectedKencleng.saldo || 0)).map(p => (
                  <button key={p} onClick={() => setNominal(String(p))}
                    style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${parseInt(nominal) === p ? '#c0392b' : 'var(--abu-200)'}`, background: parseInt(nominal) === p ? '#fdeaea' : '#fff', color: parseInt(nominal) === p ? '#c0392b' : 'var(--abu-700)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    {formatRupiah(p)}
                  </button>
                ))}
                <button onClick={() => setNominal(String(selectedKencleng.saldo || 0))}
                  style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${parseInt(nominal) === selectedKencleng.saldo ? '#c0392b' : 'var(--abu-200)'}`, background: parseInt(nominal) === selectedKencleng.saldo ? '#fdeaea' : '#fff', color: parseInt(nominal) === selectedKencleng.saldo ? '#c0392b' : 'var(--abu-700)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                  Maks
                </button>
              </div>
            )}
            {err && <p style={{ fontSize: '0.78rem', color: '#c0392b', marginTop: 6 }}>⚠️ {err}</p>}
          </div>

          {/* Catatan */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Catatan (opsional)</div>
            <input type="text" value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Keperluan penarikan..."
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontFamily: 'var(--font-body)' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setStep(2); setSelectedKencleng(null); setNominal(''); setErr(''); }}
              style={{ flex: 1, padding: '13px', background: 'var(--abu-100)', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
              Batal
            </button>
            <button onClick={handleSubmit} disabled={loading || !nominal}
              style={{ flex: 2, padding: '13px', background: loading || !nominal ? 'var(--abu-200)' : '#c0392b', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontWeight: 700, cursor: loading || !nominal ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}>
              {loading ? '⏳ Memproses...' : '💸 Ajukan Penarikan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ───────────────────────────────
// Main Page
// ───────────────────────────────
const RTPerarikanPage = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingList, setPendingList] = useState([]);
  const [allList, setAllList] = useState([]);
  const [stats, setStats] = useState(null);
  const [kenclengList, setKenclengList] = useState([]);
  const [wargaList, setWargaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [alasan, setAlasan] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('semua');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pending, all, st, kl, warga] = await Promise.all([
        getPendingPenarikan(),
        getAllPenarikan(50),
        getPenarikanStats(),
        getKenclengWithStats(),
        getWargaUsers(),
      ]);
      setPendingList(pending);
      setAllList(all);
      setStats(st);
      setKenclengList(kl);
      setWargaList(warga);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Map kencleng by id untuk lookup cepat
  const kenclengMap = useMemo(() => {
    const m = {};
    kenclengList.forEach(k => { m[k.id] = k; });
    return m;
  }, [kenclengList]);

  const handleApprove = async (item) => {
    setProcessing(true);
    try {
      await approvePenarikan(item.id, item.kenclengId, item.nominal);
      try { await notifyPenarikanDisetujui(item.userId, item.nominal); } catch(_) {}
      setAlert({ type: 'success', message: `✅ Penarikan ${formatRupiah(item.nominal)} disetujui. Saldo sudah dikurangi.` });
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally { setProcessing(false); }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    setProcessing(true);
    try {
      await rejectPenarikan(rejectModal.id, alasan);
      try { await notifyPenarikanDitolak(rejectModal.userId, rejectModal.nominal, alasan); } catch(_) {}
      setAlert({ type: 'warning', message: `❌ Penarikan ${formatRupiah(rejectModal.nominal)} ditolak.` });
      setRejectModal(null); setAlasan('');
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally { setProcessing(false); }
  };

  const handleAjukanSuccess = () => {
    setAlert({ type: 'success', message: '✅ Pengajuan penarikan berhasil dicatat!' });
    setActiveTab('pending');
    loadData();
  };

  // Filter riwayat
  const filteredAll = useMemo(() => {
    if (filterStatus === 'semua') return allList;
    return allList.filter(p => p.status === filterStatus);
  }, [allList, filterStatus]);

  const TABS = [
    { id: 'pending', label: '⏳ Pending', badge: pendingList.length },
    { id: 'ajukan', label: '+ Ajukan' },
    { id: 'riwayat', label: '📋 Riwayat' },
  ];

  return (
    <div className="app-layout">
      <Header title="Penarikan Kencleng" showBack
        rightAction={
          <button onClick={loadData} style={{ background: 'var(--hijau-pale)', color: 'var(--hijau)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            🔄
          </button>
        }
      />

      <div className="page-content">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={4000} />}

        {/* Stats */}
        {stats && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
            <StatBadge icon="⏳" label="Menunggu" value={stats.pending} color="#e8a020" />
            <StatBadge icon="✅" label="Disetujui" value={stats.disetujui} color="#1a6b3c" />
            <StatBadge icon="💸" label="Dicairkan" value={formatRupiah(stats.totalDicairkan)} color="#c0392b" />
          </div>
        )}

        {/* Tab Nav */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, padding: '9px 6px', background: activeTab === tab.id ? tab.id === 'ajukan' ? '#c0392b' : 'var(--hijau)' : '#fff', color: activeTab === tab.id ? '#fff' : 'var(--abu-500)', border: `1.5px solid ${activeTab === tab.id ? (tab.id === 'ajukan' ? '#c0392b' : 'var(--hijau)') : 'var(--abu-200)'}`, borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              {tab.label}
              {tab.badge > 0 && <span style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : '#c0392b', color: '#fff', borderRadius: 'var(--radius-full)', fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>{tab.badge}</span>}
            </button>
          ))}
        </div>

        {/* ======= PENDING ======= */}
        {activeTab === 'pending' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {!loading && pendingList.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, #c0392b, #e74c3c)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, color: '#fff' }}>
                <span style={{ fontSize: '1.5rem' }}>💸</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{pendingList.length} Penarikan Menunggu</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Total: {formatRupiah(pendingList.reduce((a, p) => a + (p.nominal || 0), 0))}</div>
                </div>
              </div>
            )}

            {loading ? [1,2,3].map(i => <SkeletonCard key={i} style={{ marginBottom: 10 }} />) :
              pendingList.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">✅</div><p style={{ fontWeight: 600 }}>Tidak ada penarikan pending</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pendingList.map(item => (
                    <PenarikanItem key={item.id} item={item} kenclengMap={kenclengMap} onApprove={handleApprove} onReject={p => { setRejectModal(p); setAlasan(''); }} />
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* ======= AJUKAN ======= */}
        {activeTab === 'ajukan' && (
          <FormAjukanPenarikan
            wargaList={wargaList}
            onSuccess={handleAjukanSuccess}
            onCancel={() => setActiveTab('pending')}
            currentUser={userData}
          />
        )}

        {/* ======= RIWAYAT ======= */}
        {activeTab === 'riwayat' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
              {[{ id: 'semua', label: 'Semua' }, { id: 'pending', label: '⏳ Pending' }, { id: 'disetujui', label: '✅ Disetujui' }, { id: 'ditolak', label: '❌ Ditolak' }].map(f => (
                <button key={f.id} onClick={() => setFilterStatus(f.id)}
                  style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 'var(--radius-full)', border: 'none', background: filterStatus === f.id ? 'var(--hijau)' : 'var(--abu-100)', color: filterStatus === f.id ? '#fff' : 'var(--abu-500)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? [1,2,3].map(i => <SkeletonCard key={i} style={{ marginBottom: 10 }} />) :
              filteredAll.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📋</div><p style={{ fontWeight: 600 }}>Belum ada riwayat penarikan</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredAll.map(item => (
                    <PenarikanItem key={item.id} item={item} kenclengMap={kenclengMap} />
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* ======= REJECT MODAL ======= */}
        {rejectModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,26,22,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 500, animation: 'fadeIn 0.2s ease' }}
            onClick={e => { if (e.target === e.currentTarget) setRejectModal(null); }}>
            <div style={{ background: '#fff', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 480, animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
              <h3 style={{ marginBottom: 6 }}>Tolak Penarikan</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--abu-500)', marginBottom: 14 }}>
                Penarikan sebesar <strong>{formatRupiah(rejectModal?.nominal)}</strong> akan ditolak.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {ALASAN_PRESETS.map(a => (
                  <button key={a} onClick={() => setAlasan(a)}
                    style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${alasan === a ? '#c0392b' : 'var(--abu-200)'}`, background: alasan === a ? '#fdeaea' : '#fff', color: alasan === a ? '#c0392b' : 'var(--abu-500)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    {a}
                  </button>
                ))}
              </div>

              <input type="text" value={alasan} onChange={e => setAlasan(e.target.value)} placeholder="Atau tulis alasan lain..."
                style={{ width: '100%', padding: '12px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)', fontSize: '1rem', marginBottom: 16, fontFamily: 'var(--font-body)' }} />

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setRejectModal(null)} style={{ flex: 1, padding: '12px', background: 'var(--abu-100)', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
                <button onClick={handleRejectConfirm} disabled={processing || !alasan.trim()}
                  style={{ flex: 1, padding: '12px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: processing || !alasan.trim() ? 'not-allowed' : 'pointer', opacity: processing || !alasan.trim() ? 0.6 : 1 }}>
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

export default RTPerarikanPage;
