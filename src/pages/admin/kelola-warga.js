// src/pages/admin/kelola-warga.js — Manajemen Warga oleh Admin
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Alert from '../../components/common/Alert';
import { SkeletonCard, Spinner } from '../../components/common/Loading';
import { getAllUsers, updateUser, deleteUser } from '../../services/userService';
import { registerUser } from '../../services/auth';
import { getKenclengByUser } from '../../services/kenclengService';
import { formatRupiah, formatTanggalShort, initials } from '../../utils/formatter';
import { ROLES } from '../../config/constants';

const ROLE_CFG = {
  warga:  { label: 'Warga',       color: '#1a6b3c', bg: '#e8f5ee',  icon: '👥' },
  rt:     { label: 'Pengurus RT', color: '#2471a3', bg: '#eaf4fb',  icon: '🏛️' },
  admin:  { label: 'Admin',       color: '#7d3c98', bg: '#f5eef8',  icon: '⚙️' },
};

// ─── Input Field ───
const Field = ({ label, type='text', value, onChange, placeholder, required, hint, disabled }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--abu-500)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.05em' }}>
      {label} {required && <span style={{ color:'var(--danger)' }}>*</span>}
    </label>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
      style={{ width:'100%', padding:'11px 14px', border:'1.5px solid var(--abu-200)', borderRadius:'var(--radius-md)', fontSize:'0.9rem', fontFamily:'var(--font-body)', background: disabled ? 'var(--abu-100)' : '#fff', color:'var(--hitam)' }}
    />
    {hint && <p style={{ fontSize:'0.68rem', color:'var(--abu-400)', marginTop:3 }}>{hint}</p>}
  </div>
);

// ─── Modal Tambah / Edit Warga ───
const WargaModal = ({ mode, warga, onClose, onSuccess }) => {
  const isEdit = mode === 'edit';
  const [nama, setNama] = useState(warga?.nama || '');
  const [email, setEmail] = useState(warga?.email || '');
  const [noHp, setNoHp] = useState(warga?.noHp || '');
  const [alamat, setAlamat] = useState(warga?.alamat || '');
  const [role, setRole] = useState(warga?.role || 'warga');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!nama.trim()) { setErr('Nama harus diisi.'); return; }
    if (!isEdit && !email.trim()) { setErr('Email harus diisi.'); return; }
    if (!isEdit && password.length < 6) { setErr('Password minimal 6 karakter.'); return; }
    setLoading(true); setErr('');
    try {
      if (isEdit) {
        await updateUser(warga.uid, { nama: nama.trim(), noHp, alamat, role });
      } else {
        await registerUser({ email: email.trim(), password, nama: nama.trim(), noHp, alamat, role });
      }
      onSuccess(isEdit ? 'Data warga diperbarui.' : 'Warga berhasil ditambahkan.');
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(28,26,22,0.55)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:500, animation:'fadeIn 0.2s ease' }}
      onClick={e => { if (e.target===e.currentTarget && !loading) onClose(); }}>
      <div style={{ background:'#fff', borderRadius:'var(--radius-xl) var(--radius-xl) 0 0', padding:'24px 20px 40px', width:'100%', maxWidth:480, animation:'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ width:40, height:4, background:'var(--abu-200)', borderRadius:2, margin:'-8px auto 20px' }} />
        <h3 style={{ textAlign:'center', marginBottom:20 }}>{isEdit ? '✏️ Edit Warga' : '➕ Tambah Warga'}</h3>

        {err && <div style={{ background:'#fdeaea', border:'1px solid var(--danger)', borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:'0.82rem', color:'var(--danger)', marginBottom:14 }}>⚠️ {err}</div>}

        <Field label="Nama Lengkap" value={nama} onChange={setNama} placeholder="Nama sesuai KTP" required />
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="email@contoh.com" required={!isEdit} disabled={isEdit} hint={isEdit ? 'Email tidak bisa diubah' : ''} />
        <Field label="No. HP" type="tel" value={noHp} onChange={setNoHp} placeholder="08xxxxxxxxxx" hint="Opsional" />
        <Field label="Alamat" value={alamat} onChange={setAlamat} placeholder="Alamat lengkap" hint="Opsional" />

        {!isEdit && (
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 6 karakter" required hint="Password awal untuk warga" />
        )}

        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--abu-500)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.05em' }}>
            Role
          </label>
          <select value={role} onChange={e=>setRole(e.target.value)}
            style={{ width:'100%', padding:'11px 14px', border:'1.5px solid var(--abu-200)', borderRadius:'var(--radius-md)', fontSize:'0.9rem', fontFamily:'var(--font-body)', background:'#fff' }}>
            <option value="warga">👥 Warga</option>
            <option value="rt">🏛️ Pengurus RT</option>
            <option value="admin">⚙️ Admin</option>
          </select>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:8 }}>
          <button onClick={onClose} disabled={loading} style={{ flex:1, padding:'12px', background:'var(--abu-100)', border:'none', borderRadius:'var(--radius-full)', fontFamily:'var(--font-body)', fontWeight:600, cursor:'pointer' }}>Batal</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex:2, padding:'12px', background:loading?'var(--abu-200)':'var(--hijau)', color:'#fff', border:'none', borderRadius:'var(--radius-full)', fontFamily:'var(--font-body)', fontWeight:700, cursor:loading?'not-allowed':'pointer' }}>
            {loading ? '⏳ Menyimpan...' : (isEdit ? 'Simpan Perubahan' : '➕ Tambah Warga')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Konfirmasi Hapus ───
const DeleteModal = ({ warga, onClose, onConfirm, loading }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(28,26,22,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500, padding:'20px', animation:'fadeIn 0.2s ease' }}>
    <div style={{ background:'#fff', borderRadius:'var(--radius-xl)', padding:'28px 24px', width:'100%', maxWidth:360, animation:'slideUp 0.3s ease', textAlign:'center' }}>
      <div style={{ fontSize:'2.5rem', marginBottom:12 }}>⚠️</div>
      <h3 style={{ marginBottom:8 }}>Hapus Warga?</h3>
      <p style={{ fontSize:'0.875rem', color:'var(--abu-500)', marginBottom:4 }}>
        <strong>{warga?.nama}</strong> akan dihapus dari sistem.
      </p>
      <p style={{ fontSize:'0.78rem', color:'var(--danger)', marginBottom:24 }}>
        Data akun Firestore akan dihapus. Kencleng & riwayat setoran tetap tersimpan.
      </p>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onClose} disabled={loading} style={{ flex:1, padding:'12px', background:'var(--abu-100)', border:'none', borderRadius:'var(--radius-full)', fontFamily:'var(--font-body)', fontWeight:600, cursor:'pointer' }}>Batal</button>
        <button onClick={onConfirm} disabled={loading} style={{ flex:1, padding:'12px', background:'var(--danger)', color:'#fff', border:'none', borderRadius:'var(--radius-full)', fontFamily:'var(--font-body)', fontWeight:700, cursor:loading?'not-allowed':'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? '...' : 'Hapus'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Detail Warga Sheet ───
const WargaDetailSheet = ({ warga, onClose, onEdit, onDelete }) => {
  const [kencleng, setKencleng] = useState([]);
  const [loadingK, setLoadingK] = useState(true);
  const roleCfg = ROLE_CFG[warga?.role] || ROLE_CFG.warga;

  useEffect(() => {
    if (!warga) return;
    setLoadingK(true);
    getKenclengByUser(warga.uid)
      .then(setKencleng)
      .finally(() => setLoadingK(false));
  }, [warga]);

  if (!warga) return null;
  const totalSaldo = kencleng.reduce((a, k) => a + (k.saldo||0), 0);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(28,26,22,0.55)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:500, animation:'fadeIn 0.2s ease' }}
      onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:'#fff', borderRadius:'var(--radius-xl) var(--radius-xl) 0 0', padding:'24px 20px 44px', width:'100%', maxWidth:480, animation:'slideUp 0.3s ease', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ width:40, height:4, background:'var(--abu-200)', borderRadius:2, margin:'-8px auto 20px' }} />

        {/* Avatar & info */}
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg, var(--hijau), var(--hijau-muda))', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:700, color:'#fff', marginBottom:10 }}>
            {initials(warga.nama)}
          </div>
          <div style={{ fontWeight:700, fontSize:'1.1rem', color:'var(--hitam)' }}>{warga.nama}</div>
          <span style={{ display:'inline-block', marginTop:4, padding:'3px 10px', background:roleCfg.bg, color:roleCfg.color, borderRadius:'var(--radius-full)', fontSize:'0.75rem', fontWeight:600 }}>
            {roleCfg.icon} {roleCfg.label}
          </span>
        </div>

        {/* Info rows */}
        {[
          { label: 'Email', value: warga.email },
          { label: 'No. HP', value: warga.noHp || '—' },
          { label: 'Alamat', value: warga.alamat || '—' },
          { label: 'Bergabung', value: warga.createdAt ? formatTanggalShort(warga.createdAt) : '—' },
        ].map(r => (
          <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--abu-100)', fontSize:'0.85rem' }}>
            <span style={{ color:'var(--abu-500)' }}>{r.label}</span>
            <span style={{ fontWeight:600, color:'var(--hitam)', maxWidth:'60%', textAlign:'right', wordBreak:'break-word' }}>{r.value}</span>
          </div>
        ))}

        {/* Kencleng summary */}
        <div style={{ marginTop:16, marginBottom:16 }}>
          <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--abu-400)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>Kencleng ({kencleng.length})</div>
          {loadingK ? <div style={{ display:'flex', justifyContent:'center', padding:16 }}><Spinner /></div> : kencleng.length === 0 ? (
            <p style={{ fontSize:'0.82rem', color:'var(--abu-400)', textAlign:'center', padding:'12px 0' }}>Belum ada kencleng</p>
          ) : (
            <>
              <div style={{ background:'var(--hijau-pale)', borderRadius:'var(--radius-md)', padding:'10px 14px', marginBottom:10, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:'0.8rem', color:'var(--abu-500)' }}>Total saldo</span>
                <span style={{ fontWeight:800, color:'var(--hijau)', fontSize:'0.9rem' }}>{formatRupiah(totalSaldo)}</span>
              </div>
              {kencleng.map(k => {
                const pct = Math.min(100, Math.round(((k.saldo||0)/(k.target||500000))*100));
                return (
                  <div key={k.id} style={{ background:'var(--abu-100)', borderRadius:'var(--radius-sm)', padding:'8px 12px', marginBottom:6 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:'0.82rem', fontWeight:600 }}>{k.nama}</span>
                      <span style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--hijau)' }}>{formatRupiah(k.saldo||0)}</span>
                    </div>
                    <div style={{ height:4, background:'var(--abu-200)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background: pct>=100?'var(--kuning)':'var(--hijau)', borderRadius:2 }} />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => { onClose(); onEdit(warga); }}
            style={{ flex:1, padding:'11px', background:'var(--hijau-pale)', color:'var(--hijau)', border:'none', borderRadius:'var(--radius-full)', fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.85rem', cursor:'pointer' }}>
            ✏️ Edit
          </button>
          <button onClick={() => { onClose(); onDelete(warga); }}
            style={{ flex:1, padding:'11px', background:'#fdeaea', color:'var(--danger)', border:'none', borderRadius:'var(--radius-full)', fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.85rem', cursor:'pointer' }}>
            🗑️ Hapus
          </button>
          <button onClick={onClose}
            style={{ flex:1, padding:'11px', background:'var(--abu-100)', color:'var(--abu-500)', border:'none', borderRadius:'var(--radius-full)', fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.85rem', cursor:'pointer' }}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───
const KelolaWargaPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('semua');

  const [modalMode, setModalMode] = useState(null); // 'tambah' | 'edit'
  const [selectedWarga, setSelectedWarga] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [detailWarga, setDetailWarga] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try { setUsers(await getAllUsers()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget.uid);
      setAlert({ type: 'success', message: `✅ Warga ${deleteTarget.nama} berhasil dihapus.` });
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally { setDeleteLoading(false); }
  };

  const handleModalSuccess = (msg) => {
    setAlert({ type: 'success', message: `✅ ${msg}` });
    setModalMode(null);
    setSelectedWarga(null);
    loadData();
  };

  const filtered = useMemo(() => {
    let list = users;
    if (filterRole !== 'semua') list = list.filter(u => u.role === filterRole);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u => (u.nama||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q));
    }
    return list;
  }, [users, filterRole, search]);

  const countByRole = useMemo(() => {
    const c = { warga: 0, rt: 0, admin: 0 };
    users.forEach(u => { if (c[u.role] !== undefined) c[u.role]++; });
    return c;
  }, [users]);

  return (
    <div className="app-layout">
      <Header title="Kelola Warga" showBack
        rightAction={
          <button onClick={() => { setModalMode('tambah'); setSelectedWarga(null); }}
            style={{ background:'var(--hijau)', color:'#fff', border:'none', borderRadius:'var(--radius-full)', padding:'8px 14px', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
            <span>➕</span><span>Tambah</span>
          </button>
        }
      />

      <div className="page-content">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={4000} />}

        {/* Stats */}
        {!loading && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
            {Object.entries(ROLE_CFG).map(([role, cfg]) => (
              <div key={role} style={{ background:'#fff', borderRadius:'var(--radius-md)', padding:'12px 8px', boxShadow:'var(--shadow-sm)', textAlign:'center', borderTop:`3px solid ${cfg.color}` }}>
                <div style={{ fontSize:'1.2rem', marginBottom:3 }}>{cfg.icon}</div>
                <div style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--hitam)' }}>{countByRole[role]}</div>
                <div style={{ fontSize:'0.65rem', color:'var(--abu-400)', marginTop:1 }}>{cfg.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search + filter */}
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍 Cari nama / email..."
            style={{ flex:1, padding:'10px 14px', border:'1.5px solid var(--abu-200)', borderRadius:'var(--radius-full)', fontSize:'0.875rem', fontFamily:'var(--font-body)', background:'#fff' }} />
        </div>
        <div style={{ display:'flex', gap:6, marginBottom:16, overflowX:'auto', paddingBottom:2 }}>
          {[{ id:'semua', label:'Semua' }, { id:'warga', label:'👥 Warga' }, { id:'rt', label:'🏛️ RT' }, { id:'admin', label:'⚙️ Admin' }].map(f => (
            <button key={f.id} onClick={() => setFilterRole(f.id)}
              style={{ flexShrink:0, padding:'5px 12px', borderRadius:'var(--radius-full)', border:'none', background: filterRole===f.id ? 'var(--hijau)' : 'var(--abu-100)', color: filterRole===f.id ? '#fff' : 'var(--abu-500)', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)' }}>
              {f.label}
            </button>
          ))}
          <span style={{ fontSize:'0.72rem', color:'var(--abu-400)', alignSelf:'center', marginLeft:4, flexShrink:0 }}>{filtered.length} pengguna</span>
        </div>

        {/* List warga */}
        {loading ? (
          [1,2,3,4].map(i => <SkeletonCard key={i} style={{ marginBottom:10 }} />)
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">👤</div><p style={{ fontWeight:600 }}>Tidak ada pengguna ditemukan</p></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.map(u => {
              const cfg = ROLE_CFG[u.role] || ROLE_CFG.warga;
              return (
                <div key={u.uid}
                  style={{ background:'#fff', borderRadius:'var(--radius-md)', padding:'14px 16px', boxShadow:'var(--shadow-sm)', display:'flex', alignItems:'center', gap:12, cursor:'pointer', transition:'all 0.15s', borderLeft:`3px solid ${cfg.color}` }}
                  onClick={() => setDetailWarga(u)}
                  onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow-md)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow='var(--shadow-sm)'}
                >
                  <div style={{ width:42, height:42, borderRadius:'50%', background:`${cfg.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', fontWeight:700, color:cfg.color, flexShrink:0 }}>
                    {initials(u.nama)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:'0.9rem', color:'var(--hitam)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.nama || '—'}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--abu-400)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.email}</div>
                    {u.noHp && <div style={{ fontSize:'0.7rem', color:'var(--abu-400)' }}>📞 {u.noHp}</div>}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                    <span style={{ fontSize:'0.68rem', fontWeight:600, color:cfg.color, background:cfg.bg, padding:'2px 8px', borderRadius:'var(--radius-full)', whiteSpace:'nowrap' }}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={e => { e.stopPropagation(); setSelectedWarga(u); setModalMode('edit'); }}
                        style={{ background:'var(--hijau-pale)', color:'var(--hijau)', border:'none', borderRadius:'var(--radius-full)', padding:'4px 10px', fontSize:'0.7rem', fontWeight:600, cursor:'pointer' }}>
                        ✏️
                      </button>
                      <button onClick={e => { e.stopPropagation(); setDeleteTarget(u); }}
                        style={{ background:'#fdeaea', color:'var(--danger)', border:'none', borderRadius:'var(--radius-full)', padding:'4px 10px', fontSize:'0.7rem', fontWeight:600, cursor:'pointer' }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {(modalMode === 'tambah' || modalMode === 'edit') && (
        <WargaModal
          mode={modalMode}
          warga={modalMode === 'edit' ? selectedWarga : null}
          onClose={() => { setModalMode(null); setSelectedWarga(null); }}
          onSuccess={handleModalSuccess}
        />
      )}

      {deleteTarget && (
        <DeleteModal warga={deleteTarget} loading={deleteLoading} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}

      {detailWarga && (
        <WargaDetailSheet
          warga={detailWarga}
          onClose={() => setDetailWarga(null)}
          onEdit={w => { setSelectedWarga(w); setModalMode('edit'); }}
          onDelete={w => setDeleteTarget(w)}
        />
      )}

      <MobileNav />
    </div>
  );
};

export default KelolaWargaPage;
