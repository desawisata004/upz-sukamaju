// src/pages/admin-desa/kelola-rt.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../../components/layout/Header';
import MobileNav from '../../components/layout/MobileNav';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Spinner } from '../../components/common/Loading';
import { getAllUsers, updateUser, deleteUser, getPengurusUsers } from '../../services/userService';
import { registerUser } from '../../services/auth';
import { formatTanggalShort, initials } from '../../utils/formatter';

const ROLE_CFG = {
  rt: { label: 'Ketua RT', color: '#2471a3', bg: '#eaf4fb', icon: '🏛️' },
  admin: { label: 'Admin Desa', color: '#7d3c98', bg: '#f5eef8', icon: '⚙️' },
};

const Field = ({ label, type = 'text', value, onChange, placeholder, required, disabled }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--abu-500)', marginBottom: 5, textTransform: 'uppercase' }}>
      {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '11px 14px',
        border: '1.5px solid var(--abu-200)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.9rem',
        background: disabled ? 'var(--abu-100)' : '#fff'
      }}
    />
  </div>
);

const RTModal = ({ mode, rt, onClose, onSuccess }) => {
  const isEdit = mode === 'edit';
  const [nama, setNama] = useState(rt?.nama || '');
  const [email, setEmail] = useState(rt?.email || '');
  const [noHp, setNoHp] = useState(rt?.noHp || '');
  const [alamat, setAlamat] = useState(rt?.alamat || '');
  const [role, setRole] = useState(rt?.role || 'rt');
  const [nomorRT, setNomorRT] = useState(rt?.nomorRT || '');
  const [rw, setRw] = useState(rt?.rw || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!nama.trim()) { setErr('Nama harus diisi.'); return; }
    if (!isEdit && !email.trim()) { setErr('Email harus diisi.'); return; }
    if (!isEdit && password.length < 6) { setErr('Password minimal 6 karakter.'); return; }
    if (!nomorRT.trim()) { setErr('Nomor RT harus diisi.'); return; }

    setLoading(true);
    setErr('');

    try {
      const userData = {
        nama: nama.trim(),
        noHp,
        alamat,
        role,
        nomorRT: nomorRT.trim(),
        rw: rw.trim(),
      };

      if (isEdit) {
        await updateUser(rt.uid, userData);
      } else {
        await registerUser({
          email: email.trim(),
          password,
          ...userData
        });
      }
      onSuccess(isEdit ? 'Data RT berhasil diperbarui.' : 'RT berhasil ditambahkan.');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(28,26,22,0.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 500,
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        padding: '24px 20px 40px', width: '100%', maxWidth: 480,
        animation: 'slideUp 0.3s ease', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ width: 40, height: 4, background: 'var(--abu-200)', borderRadius: 2, margin: '-8px auto 20px' }} />
        <h3 style={{ textAlign: 'center', marginBottom: 20 }}>
          {isEdit ? '✏️ Edit Pengurus RT' : '➕ Tambah Pengurus RT'}
        </h3>

        {err && (
          <div style={{
            background: '#fdeaea', border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-md)', padding: '10px 14px',
            fontSize: '0.82rem', color: 'var(--danger)', marginBottom: 14
          }}>
            ⚠️ {err}
          </div>
        )}

        <Field label="Nama Lengkap" value={nama} onChange={setNama} placeholder="Nama lengkap" required />
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="email@contoh.com" required={!isEdit} disabled={isEdit} />
        <Field label="No. HP" type="tel" value={noHp} onChange={setNoHp} placeholder="08xxxxxxxxxx" />
        <Field label="Alamat" value={alamat} onChange={setAlamat} placeholder="Alamat lengkap" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase' }}>
              RT <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              value={nomorRT}
              onChange={e => setNomorRT(e.target.value)}
              placeholder="01"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase' }}>
              RW
            </label>
            <input
              type="text"
              value={rw}
              onChange={e => setRw(e.target.value)}
              placeholder="02"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </div>

        {!isEdit && (
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 6 karakter" required />
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--abu-500)', textTransform: 'uppercase' }}>
            Role
          </label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)' }}
          >
            <option value="rt">🏛️ Ketua RT</option>
            <option value="admin">⚙️ Admin Desa</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{ flex: 1, padding: '12px', background: 'var(--abu-100)', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ flex: 2, padding: '12px', background: loading ? 'var(--abu-200)' : 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? '⏳ Menyimpan...' : (isEdit ? 'Simpan Perubahan' : '➕ Tambah')}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({ rt, onClose, onConfirm, loading }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(28,26,22,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: '20px'
  }}>
    <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '28px 24px', maxWidth: 360, textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
      <h3 style={{ marginBottom: 8 }}>Hapus Pengurus?</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--abu-500)', marginBottom: 4 }}>
        <strong>{rt?.nama}</strong> akan dihapus dari sistem.
      </p>
      <p style={{ fontSize: '0.78rem', color: 'var(--danger)', marginBottom: 24 }}>
        Tindakan ini permanen.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} disabled={loading} style={{ flex: 1, padding: '12px', background: 'var(--abu-100)', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}>
          Batal
        </button>
        <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: '12px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '...' : 'Hapus'}
        </button>
      </div>
    </div>
  </div>
);

const DetailSheet = ({ rt, onClose, onEdit, onDelete }) => {
  if (!rt) return null;
  const cfg = ROLE_CFG[rt.role] || ROLE_CFG.rt;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(28,26,22,0.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 500
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        padding: '24px 20px 44px', width: '100%', maxWidth: 480,
        animation: 'slideUp 0.3s ease', maxHeight: '85vh', overflowY: 'auto'
      }}>
        <div style={{ width: 40, height: 4, background: 'var(--abu-200)', borderRadius: 2, margin: '-8px auto 20px' }} />

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 10
          }}>
            {initials(rt.nama)}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{rt.nama}</div>
          <span style={{
            display: 'inline-block', marginTop: 4,
            padding: '3px 10px', background: cfg.bg, color: cfg.color,
            borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600
          }}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        {[
          { label: 'Email', value: rt.email },
          { label: 'No. HP', value: rt.noHp || '—' },
          { label: 'Alamat', value: rt.alamat || '—' },
          { label: 'RT/RW', value: `${rt.nomorRT || '-'}/${rt.rw || '-'}` },
          { label: 'Bergabung', value: rt.createdAt ? formatTanggalShort(rt.createdAt) : '—' },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--abu-100)', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--abu-500)' }}>{r.label}</span>
            <span style={{ fontWeight: 600, maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>{r.value}</span>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={() => { onClose(); onEdit(rt); }}
            style={{ flex: 1, padding: '11px', background: 'var(--hijau-pale)', color: 'var(--hijau)', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}>
            ✏️ Edit
          </button>
          <button onClick={() => { onClose(); onDelete(rt); }}
            style={{ flex: 1, padding: '11px', background: '#fdeaea', color: 'var(--danger)', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}>
            🗑️ Hapus
          </button>
          <button onClick={onClose}
            style={{ flex: 1, padding: '11px', background: 'var(--abu-100)', color: 'var(--abu-500)', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

const KelolaRTPage = () => {
  const [pengurus, setPengurus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('semua');
  const [modalMode, setModalMode] = useState(null);
  const [selectedRT, setSelectedRT] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [detailRT, setDetailRT] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPengurusUsers();
      setPengurus(data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Gagal memuat data: ' + error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget.uid);
      setAlert({ type: 'success', message: `✅ ${deleteTarget.nama} berhasil dihapus.` });
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalSuccess = (msg) => {
    setAlert({ type: 'success', message: `✅ ${msg}` });
    setModalMode(null);
    setSelectedRT(null);
    loadData();
  };

  const filtered = useMemo(() => {
    let list = pengurus;
    if (filterRole !== 'semua') {
      list = list.filter(u => u.role === filterRole);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        (u.nama || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.nomorRT || '').includes(q)
      );
    }
    return list;
  }, [pengurus, filterRole, search]);

  return (
    <div className="app-layout">
      <Header
        title="Kelola Pengurus RT"
        showBack
        rightAction={
          <button
            onClick={() => { setModalMode('tambah'); setSelectedRT(null); }}
            style={{ background: 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', padding: '8px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span>➕</span><span>Tambah</span>
          </button>
        }
      />

      <div className="page-content">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={4000} />}

        {/* Stats */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
            <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '12px', boxShadow: 'var(--shadow-sm)', borderTop: '3px solid #2471a3' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 3 }}>🏛️</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{pengurus.filter(u => u.role === 'rt').length}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--abu-400)' }}>Ketua RT</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '12px', boxShadow: 'var(--shadow-sm)', borderTop: '3px solid #7d3c98' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 3 }}>⚙️</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{pengurus.filter(u => u.role === 'admin').length}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--abu-400)' }}>Admin Desa</div>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Cari nama / email / RT..."
            style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-full)', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
          {[
            { id: 'semua', label: 'Semua' },
            { id: 'rt', label: '🏛️ Ketua RT' },
            { id: 'admin', label: '⚙️ Admin' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterRole(f.id)}
              style={{
                flexShrink: 0,
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: filterRole === f.id ? 'var(--hijau)' : 'var(--abu-100)',
                color: filterRole === f.id ? '#fff' : 'var(--abu-500)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
          <span style={{ fontSize: '0.72rem', color: 'var(--abu-400)', alignSelf: 'center', marginLeft: 4 }}>
            {filtered.length} pengurus
          </span>
        </div>

        {/* List */}
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 'var(--radius-md)', marginBottom: 10 }} />)
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏛️</div>
            <p style={{ fontWeight: 600 }}>Tidak ada pengurus ditemukan</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(u => {
              const cfg = ROLE_CFG[u.role] || ROLE_CFG.rt;
              return (
                <div
                  key={u.uid}
                  style={{
                    background: '#fff',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    borderLeft: `3px solid ${cfg.color}`
                  }}
                  onClick={() => setDetailRT(u)}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: `${cfg.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 700, color: cfg.color, flexShrink: 0
                  }}>
                    {initials(u.nama)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.nama || '—'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--abu-400)' }}>{u.email}</div>
                    {u.nomorRT && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--abu-400)' }}>
                        RT {u.nomorRT}{u.rw ? ` / RW ${u.rw}` : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedRT(u); setModalMode('edit'); }}
                        style={{ background: 'var(--hijau-pale)', color: 'var(--hijau)', border: 'none', borderRadius: 'var(--radius-full)', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteTarget(u); }}
                        style={{ background: '#fdeaea', color: 'var(--danger)', border: 'none', borderRadius: 'var(--radius-full)', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                      >
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
        <RTModal
          mode={modalMode}
          rt={modalMode === 'edit' ? selectedRT : null}
          onClose={() => { setModalMode(null); setSelectedRT(null); }}
          onSuccess={handleModalSuccess}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          rt={deleteTarget}
          loading={deleteLoading}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {detailRT && (
        <DetailSheet
          rt={detailRT}
          onClose={() => setDetailRT(null)}
          onEdit={rt => { setSelectedRT(rt); setModalMode('edit'); }}
          onDelete={rt => setDeleteTarget(rt)}
        />
      )}

      <MobileNav />
    </div>
  );
};

export default KelolaRTPage;