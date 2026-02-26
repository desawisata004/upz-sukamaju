// src/pages/ProfilPage.js — dengan fitur edit profil
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { useAuth } from '../hooks/useAuth';
import { logout, updateUserProfile } from '../services/auth';
import { initials, formatTanggalShort } from '../utils/formatter';
import { ROUTES, ROLES } from '../config/constants';

const InfoRow = ({ label, value }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--abu-100)' }}>
    <span style={{ fontSize:'0.85rem', color:'var(--abu-500)' }}>{label}</span>
    <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--hitam)', maxWidth:'60%', textAlign:'right', wordBreak:'break-word' }}>{value || '—'}</span>
  </div>
);

const ProfilPage = () => {
  const { user, userData, setUserData } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [alert, setAlert] = useState(null);

  // Form edit
  const [nama, setNama] = useState(userData?.nama || '');
  const [noHp, setNoHp] = useState(userData?.noHp || '');
  const [alamat, setAlamat] = useState(userData?.alamat || '');
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const handleEditOpen = () => {
    setNama(userData?.nama || '');
    setNoHp(userData?.noHp || '');
    setAlamat(userData?.alamat || '');
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!nama.trim()) { setAlert({ type: 'error', message: 'Nama tidak boleh kosong.' }); return; }
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { nama: nama.trim(), noHp, alamat });
      setUserData(prev => ({ ...prev, nama: nama.trim(), noHp, alamat }));
      setAlert({ type: 'success', message: '✅ Profil berhasil diperbarui!' });
      setEditMode(false);
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally { setSaving(false); }
  };

  const roleLabel = {
    [ROLES.WARGA]: '👥 Warga',
    [ROLES.RT]: '🏛️ Pengurus RT',
    [ROLES.ADMIN]: '⚙️ Admin',
  };

  return (
    <div className="app-layout">
      <Header title="Profil Saya"
        rightAction={
          !editMode ? (
            <button onClick={handleEditOpen}
              style={{ background:'var(--hijau-pale)', color:'var(--hijau)', padding:'6px 14px', borderRadius:'var(--radius-full)', fontSize:'0.78rem', fontWeight:700, border:'none', cursor:'pointer', fontFamily:'var(--font-body)' }}>
              ✏️ Edit
            </button>
          ) : null
        }
      />
      <div className="page-content">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={3000} />}

        {/* Avatar */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ width:80, height:80, background:'linear-gradient(135deg, var(--hijau), var(--hijau-muda))', borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', fontWeight:700, color:'#fff', marginBottom:12, boxShadow:'0 8px 24px rgba(26,107,60,0.25)' }}>
            {initials(userData?.nama)}
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:'var(--hitam)' }}>{userData?.nama || 'User'}</h2>
          <span style={{ display:'inline-block', marginTop:6, padding:'4px 12px', background:'var(--hijau-pale)', color:'var(--hijau)', borderRadius:'var(--radius-full)', fontSize:'0.8rem', fontWeight:600 }}>
            {roleLabel[userData?.role] || 'Warga'}
          </span>
        </div>

        {/* Edit Form */}
        {editMode ? (
          <Card style={{ marginBottom:16 }}>
            <h3 style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--abu-500)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:16 }}>Edit Profil</h3>

            {[
              { label:'Nama Lengkap', value:nama, onChange:setNama, placeholder:'Nama Anda', required:true },
              { label:'No. HP', value:noHp, onChange:setNoHp, placeholder:'08xxxxxxxxxx' },
              { label:'Alamat', value:alamat, onChange:setAlamat, placeholder:'Alamat lengkap' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:'var(--abu-500)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  {f.label} {f.required && <span style={{ color:'var(--danger)' }}>*</span>}
                </label>
                <input type="text" value={f.value} onChange={e=>f.onChange(e.target.value)} placeholder={f.placeholder}
                  style={{ width:'100%', padding:'12px 14px', border:'1.5px solid var(--abu-200)', borderRadius:'var(--radius-md)', fontSize:'0.95rem', fontFamily:'var(--font-body)' }} />
              </div>
            ))}

            <div style={{ display:'flex', gap:10, marginTop:4 }}>
              <button onClick={() => setEditMode(false)} style={{ flex:1, padding:'12px', background:'var(--abu-100)', border:'none', borderRadius:'var(--radius-full)', fontFamily:'var(--font-body)', fontWeight:600, cursor:'pointer' }}>Batal</button>
              <button onClick={handleSave} disabled={saving} style={{ flex:2, padding:'12px', background:saving?'var(--abu-200)':'var(--hijau)', color:'#fff', border:'none', borderRadius:'var(--radius-full)', fontFamily:'var(--font-body)', fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
                {saving ? '⏳ Menyimpan...' : '✅ Simpan'}
              </button>
            </div>
          </Card>
        ) : (
          <Card style={{ marginBottom:16 }}>
            <h3 style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--abu-500)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Informasi Akun</h3>
            <InfoRow label="Nama Lengkap" value={userData?.nama} />
            <InfoRow label="Email" value={userData?.email} />
            <InfoRow label="No. HP" value={userData?.noHp} />
            <InfoRow label="Alamat" value={userData?.alamat} />
            <InfoRow label="Bergabung" value={userData?.createdAt ? formatTanggalShort(userData.createdAt) : '—'} />
          </Card>
        )}

        {/* Menu Pengurus */}
        {userData?.role && userData.role !== ROLES.WARGA && (
          <Card style={{ marginBottom:16 }}>
            <h3 style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--abu-500)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>Menu Pengurus</h3>
            {[
              ...(userData?.role === ROLES.ADMIN ? [{ icon:'📊', label:'Admin Dashboard', path: ROUTES.ADMIN_DASHBOARD }] : []),
              { icon:'💰', label:'Konfirmasi Setoran', path: ROUTES.RT_SETORAN },
              { icon:'💸', label:'Manajemen Penarikan', path: ROUTES.RT_PENARIKAN },
              ...(userData?.role === ROLES.ADMIN ? [{ icon:'👥', label:'Kelola Warga', path:'/admin/kelola-warga' }] : []),
            ].map(item => (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--abu-100)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', textAlign:'left' }}>
                <span style={{ fontSize:'1.1rem' }}>{item.icon}</span>
                <span style={{ flex:1, fontSize:'0.9rem', fontWeight:500 }}>{item.label}</span>
                <span style={{ color:'var(--abu-300)' }}>→</span>
              </button>
            ))}
          </Card>
        )}

        <Button variant="ghost" fullWidth onClick={handleLogout} loading={loggingOut}
          style={{ borderColor:'var(--danger)', color:'var(--danger)' }} icon="🚪">
          Keluar
        </Button>
      </div>
      <MobileNav />
    </div>
  );
};

export default ProfilPage;
