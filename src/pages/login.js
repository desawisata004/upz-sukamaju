// src/pages/login.js — dengan tab Login & Daftar
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail, registerUser } from '../services/auth';
import { APP_NAME, RT_NAME, ROLES, ROUTES } from '../config/constants';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/common/Alert';

const InputField = ({ label, type = 'text', value, onChange, placeholder, required, hint }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', padding: '13px 16px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontFamily: 'var(--font-body)', background: '#fff', color: 'var(--hitam)', transition: 'border-color 0.2s' }}
      onFocus={e => e.target.style.borderColor = 'var(--hijau)'}
      onBlur={e => e.target.style.borderColor = 'var(--abu-200)'}
    />
    {hint && <p style={{ fontSize: '0.7rem', color: 'var(--abu-400)', marginTop: 4 }}>{hint}</p>}
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [tab, setTab] = useState('login'); // login | daftar

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Daftar state
  const [regNama, setRegNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNoHp, setRegNoHp] = useState('');
  const [regAlamat, setRegAlamat] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Redirect jika sudah login
  React.useEffect(() => {
    if (userData) {
      if (userData.role === ROLES.ADMIN) navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      else if (userData.role === ROLES.RT) navigate(ROUTES.RT_DASHBOARD, { replace: true });
      else navigate(ROUTES.HOME, { replace: true });
    }
  }, [userData, navigate]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password) { setAlert({ type: 'error', message: 'Email dan password harus diisi.' }); return; }
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      // redirect dihandle useEffect di atas via AuthProvider
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

// Update bagian role di register
const handleDaftar = async (e) => {
  // ... kode sebelumnya ...
  await registerUser({
    email: regEmail.trim(),
    password: regPassword,
    nama: regNama.trim(),
    noHp: regNoHp.trim(),
    alamat: regAlamat.trim(),
    role: 'warga', // Default warga
  });
  // ... kode selanjutnya ...
};

// Update redirect setelah login
React.useEffect(() => {
  if (userData) {
    if (userData.role === ROLES.ADMIN_DESA) navigate(ROUTES.ADMIN_DESA_DASHBOARD, { replace: true });
    else if (userData.role === ROLES.RT) navigate(ROUTES.RT_DASHBOARD, { replace: true });
    else navigate(ROUTES.WARGA_PORTAL, { replace: true });
  }
}, [userData, navigate]);

  return (
    <div className="app-layout" style={{ minHeight: '100vh', background: 'var(--coklat-pale)' }}>
      {/* Hero header */}
      <div style={{ background: 'linear-gradient(160deg, var(--hijau) 0%, var(--coklat) 100%)', padding: '40px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ fontSize: '3rem', marginBottom: 10 }}>🪣</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#fff', fontStyle: 'italic', marginBottom: 6 }}>{APP_NAME}</h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{RT_NAME}</p>
      </div>

      {/* Card form */}
      <div style={{ padding: '0 20px', marginTop: -24, paddingBottom: 40 }}>
        <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>

          {/* Tab switch */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--abu-100)' }}>
            {[{ id: 'login', label: 'Masuk' }, { id: 'daftar', label: 'Daftar' }].map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setAlert(null); }}
                style={{ flex: 1, padding: '16px', background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem', color: tab === t.id ? 'var(--hijau)' : 'var(--abu-400)', cursor: 'pointer', borderBottom: `2.5px solid ${tab === t.id ? 'var(--hijau)' : 'transparent'}`, transition: 'all 0.2s', marginBottom: -1 }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '24px 20px 28px' }}>
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={5000} />}

            {/* ===== TAB LOGIN ===== */}
            {tab === 'login' && (
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="email@contoh.com" required />

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Password <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      placeholder="Password Anda"
                      style={{ width: '100%', padding: '13px 48px 13px 16px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontFamily: 'var(--font-body)' }}
                    />
                    <button onClick={() => setShowPass(!showPass)} type="button"
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--abu-400)' }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button onClick={handleLogin} disabled={loading}
                  style={{ width: '100%', padding: '14px', background: loading ? 'var(--abu-200)' : 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                  {loading ? '⏳ Memproses...' : 'Masuk →'}
                </button>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.82rem', color: 'var(--abu-400)' }}>
                  Belum punya akun?{' '}
                  <button onClick={() => setTab('daftar')} style={{ background: 'none', border: 'none', color: 'var(--hijau)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                    Daftar sekarang
                  </button>
                </p>
              </div>
            )}

            {/* ===== TAB DAFTAR ===== */}
            {tab === 'daftar' && (
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                <InputField label="Nama Lengkap" value={regNama} onChange={setRegNama} placeholder="Nama sesuai KTP" required />
                <InputField label="Email" type="email" value={regEmail} onChange={setRegEmail} placeholder="email@contoh.com" required />
                <InputField label="No. HP" type="tel" value={regNoHp} onChange={setRegNoHp} placeholder="08xxxxxxxxxx" hint="Opsional" />
                <InputField label="Alamat" value={regAlamat} onChange={setRegAlamat} placeholder="Alamat lengkap" hint="Opsional" />

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Password <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegPass ? 'text' : 'password'}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      style={{ width: '100%', padding: '13px 48px 13px 16px', border: '1.5px solid var(--abu-200)', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontFamily: 'var(--font-body)' }}
                    />
                    <button onClick={() => setShowRegPass(!showRegPass)} type="button"
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--abu-400)' }}>
                      {showRegPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--abu-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Konfirmasi Password <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={regConfirm}
                    onChange={e => setRegConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleDaftar()}
                    placeholder="Ulangi password"
                    style={{ width: '100%', padding: '13px 16px', border: `1.5px solid ${regConfirm && regConfirm !== regPassword ? 'var(--danger)' : 'var(--abu-200)'}`, borderRadius: 'var(--radius-md)', fontSize: '1rem', fontFamily: 'var(--font-body)' }}
                  />
                  {regConfirm && regConfirm !== regPassword && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--danger)', marginTop: 4 }}>Password tidak cocok</p>
                  )}
                </div>

                <button onClick={handleDaftar} disabled={loading}
                  style={{ width: '100%', padding: '14px', background: loading ? 'var(--abu-200)' : 'var(--hijau)', color: '#fff', border: 'none', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                  {loading ? '⏳ Mendaftarkan...' : '✅ Daftar Sekarang'}
                </button>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.82rem', color: 'var(--abu-400)' }}>
                  Sudah punya akun?{' '}
                  <button onClick={() => setTab('login')} style={{ background: 'none', border: 'none', color: 'var(--hijau)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                    Masuk
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--abu-300)', marginTop: 20 }}>
          {APP_NAME} · {RT_NAME}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
