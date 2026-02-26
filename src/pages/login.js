import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail, registerUser } from '../services/auth';
import { APP_NAME, RT_NAME, ROLES, ROUTES } from '../config/constants';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/common/Alert';
import { Spinner } from '../components/common/Loading';

const InputField = ({ label, type = 'text', value, onChange, placeholder, required, hint, error }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ 
      display: 'block', 
      fontSize: '0.78rem', 
      fontWeight: 700, 
      color: error ? 'var(--danger)' : 'var(--abu-500)', 
      marginBottom: 6, 
      textTransform: 'uppercase', 
      letterSpacing: '0.05em' 
    }}>
      {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ 
        width: '100%', 
        padding: '13px 16px', 
        border: `1.5px solid ${error ? 'var(--danger)' : 'var(--abu-200)'}`, 
        borderRadius: 'var(--radius-md)', 
        fontSize: '1rem', 
        fontFamily: 'var(--font-body)', 
        background: '#fff', 
        color: 'var(--hitam)', 
        transition: 'border-color 0.2s' 
      }}
      onFocus={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--hijau)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--abu-200)'}
    />
    {hint && <p style={{ fontSize: '0.7rem', color: 'var(--abu-400)', marginTop: 4 }}>{hint}</p>}
    {error && <p style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: 4 }}>{error}</p>}
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  // Register state
  const [regForm, setRegForm] = useState({
    nama: '',
    email: '',
    noHp: '',
    alamat: '',
    password: '',
    confirmPassword: ''
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regErrors, setRegErrors] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    if (userData) {
      if (userData.role === ROLES.ADMIN_DESA || userData.role === ROLES.ADMIN) {
        navigate(ROUTES.ADMIN_DESA_DASHBOARD, { replace: true });
      } else if (userData.role === ROLES.RT) {
        navigate(ROUTES.RT_DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.WARGA_PORTAL, { replace: true });
      }
    }
  }, [userData, navigate]);

  const validateLogin = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email harus diisi';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email tidak valid';
    if (!password) newErrors.password = 'Password harus diisi';
    else if (password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!validateLogin()) return;
    
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const validateRegister = () => {
    const newErrors = {};
    
    if (!regForm.nama.trim()) newErrors.nama = 'Nama harus diisi';
    else if (regForm.nama.trim().length < 3) newErrors.nama = 'Nama minimal 3 karakter';
    
    if (!regForm.email.trim()) newErrors.email = 'Email harus diisi';
    else if (!/\S+@\S+\.\S+/.test(regForm.email)) newErrors.email = 'Email tidak valid';
    
    if (regForm.noHp && !/^[0-9]{10,13}$/.test(regForm.noHp.replace(/\D/g, ''))) {
      newErrors.noHp = 'Nomor HP tidak valid (10-13 angka)';
    }
    
    if (!regForm.password) newErrors.password = 'Password harus diisi';
    else if (regForm.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    
    if (regForm.password !== regForm.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }
    
    setRegErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!validateRegister()) return;
    
    setLoading(true);
    try {
      await registerUser({
        email: regForm.email.trim(),
        password: regForm.password,
        nama: regForm.nama.trim(),
        noHp: regForm.noHp.trim(),
        alamat: regForm.alamat.trim(),
        role: 'warga',
      });
      
      setAlert({ type: 'success', message: '✅ Akun berhasil dibuat! Mengalihkan...' });
      
      // Reset form
      setRegForm({
        nama: '',
        email: '',
        noHp: '',
        alamat: '',
        password: '',
        confirmPassword: ''
      });
      
      // Pindah ke tab login setelah 2 detik
      setTimeout(() => {
        setTab('login');
      }, 2000);
      
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const updateRegForm = (field, value) => {
    setRegForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (regErrors[field]) {
      setRegErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="app-layout" style={{ minHeight: '100vh', background: 'var(--coklat-pale)' }}>
      {/* Hero Header */}
      <div style={{ 
        background: 'linear-gradient(160deg, var(--hijau) 0%, var(--coklat) 100%)', 
        padding: '40px 24px 60px', 
        textAlign: 'center', 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          position: 'absolute', 
          top: -30, 
          right: -30, 
          width: 120, 
          height: 120, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.06)' 
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: -40, 
          left: -20, 
          width: 100, 
          height: 100, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.04)' 
        }} />
        
        <div style={{ fontSize: '3rem', marginBottom: 10 }}>🪣</div>
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '1.8rem', 
          color: '#fff', 
          fontStyle: 'italic', 
          marginBottom: 6 
        }}>
          {APP_NAME}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{RT_NAME}</p>
      </div>

      {/* Form Card */}
      <div style={{ padding: '0 20px', marginTop: -24, paddingBottom: 40 }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: 'var(--radius-xl)', 
          boxShadow: 'var(--shadow-lg)', 
          overflow: 'hidden' 
        }}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--abu-100)' }}>
            <button 
              onClick={() => { setTab('login'); setAlert(null); }}
              style={{ 
                flex: 1, 
                padding: '16px', 
                background: 'none', 
                border: 'none', 
                fontFamily: 'var(--font-body)', 
                fontWeight: 700, 
                fontSize: '0.95rem', 
                color: tab === 'login' ? 'var(--hijau)' : 'var(--abu-400)', 
                cursor: 'pointer', 
                borderBottom: `2.5px solid ${tab === 'login' ? 'var(--hijau)' : 'transparent'}`, 
                transition: 'all 0.2s', 
                marginBottom: -1 
              }}
            >
              Masuk
            </button>
            <button 
              onClick={() => { setTab('daftar'); setAlert(null); }}
              style={{ 
                flex: 1, 
                padding: '16px', 
                background: 'none', 
                border: 'none', 
                fontFamily: 'var(--font-body)', 
                fontWeight: 700, 
                fontSize: '0.95rem', 
                color: tab === 'daftar' ? 'var(--hijau)' : 'var(--abu-400)', 
                cursor: 'pointer', 
                borderBottom: `2.5px solid ${tab === 'daftar' ? 'var(--hijau)' : 'transparent'}`, 
                transition: 'all 0.2s', 
                marginBottom: -1 
              }}
            >
              Daftar
            </button>
          </div>

          <div style={{ padding: '24px 20px 28px' }}>
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={5000} />}

            {/* LOGIN TAB */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} style={{ animation: 'fadeIn 0.25s ease' }}>
                <InputField 
                  label="Email" 
                  type="email" 
                  value={email} 
                  onChange={setEmail} 
                  placeholder="email@contoh.com" 
                  required 
                  error={errors.email}
                />

                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.78rem', 
                    fontWeight: 700, 
                    color: errors.password ? 'var(--danger)' : 'var(--abu-500)', 
                    marginBottom: 6, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>
                    Password <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Password Anda"
                      style={{ 
                        width: '100%', 
                        padding: '13px 48px 13px 16px', 
                        border: `1.5px solid ${errors.password ? 'var(--danger)' : 'var(--abu-200)'}`, 
                        borderRadius: 'var(--radius-md)', 
                        fontSize: '1rem', 
                        fontFamily: 'var(--font-body)' 
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)} 
                      style={{ 
                        position: 'absolute', 
                        right: 14, 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '1rem', 
                        color: 'var(--abu-400)',
                        padding: '4px'
                      }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: 4 }}>{errors.password}</p>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    background: loading ? 'var(--abu-200)' : 'var(--hijau)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 'var(--radius-full)', 
                    fontFamily: 'var(--font-body)', 
                    fontWeight: 700, 
                    fontSize: '1rem', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? <Spinner size={20} color="#fff" /> : 'Masuk →'}
                </button>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.82rem', color: 'var(--abu-400)' }}>
                  Belum punya akun?{' '}
                  <button 
                    type="button"
                    onClick={() => setTab('daftar')} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--hijau)', 
                      fontWeight: 700, 
                      cursor: 'pointer', 
                      fontFamily: 'var(--font-body)', 
                      fontSize: '0.82rem',
                      textDecoration: 'underline'
                    }}
                  >
                    Daftar sekarang
                  </button>
                </p>
              </form>
            )}

            {/* REGISTER TAB */}
            {tab === 'daftar' && (
              <form onSubmit={handleRegister} style={{ animation: 'fadeIn 0.25s ease' }}>
                <InputField 
                  label="Nama Lengkap" 
                  value={regForm.nama} 
                  onChange={(v) => updateRegForm('nama', v)} 
                  placeholder="Nama sesuai KTP" 
                  required 
                  error={regErrors.nama}
                />
                
                <InputField 
                  label="Email" 
                  type="email" 
                  value={regForm.email} 
                  onChange={(v) => updateRegForm('email', v)} 
                  placeholder="email@contoh.com" 
                  required 
                  error={regErrors.email}
                />
                
                <InputField 
                  label="No. HP" 
                  type="tel" 
                  value={regForm.noHp} 
                  onChange={(v) => updateRegForm('noHp', v)} 
                  placeholder="081234567890" 
                  hint="Opsional, minimal 10 angka"
                  error={regErrors.noHp}
                />
                
                <InputField 
                  label="Alamat" 
                  value={regForm.alamat} 
                  onChange={(v) => updateRegForm('alamat', v)} 
                  placeholder="Alamat lengkap" 
                  hint="Opsional"
                />

                <div style={{ marginBottom: 16 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.78rem', 
                    fontWeight: 700, 
                    color: regErrors.password ? 'var(--danger)' : 'var(--abu-500)', 
                    marginBottom: 6, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>
                    Password <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regForm.password}
                      onChange={e => updateRegForm('password', e.target.value)}
                      placeholder="Minimal 6 karakter"
                      style={{ 
                        width: '100%', 
                        padding: '13px 48px 13px 16px', 
                        border: `1.5px solid ${regErrors.password ? 'var(--danger)' : 'var(--abu-200)'}`, 
                        borderRadius: 'var(--radius-md)', 
                        fontSize: '1rem', 
                        fontFamily: 'var(--font-body)' 
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)} 
                      style={{ 
                        position: 'absolute', 
                        right: 14, 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '1rem', 
                        color: 'var(--abu-400)',
                        padding: '4px'
                      }}
                    >
                      {showRegPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {regErrors.password && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: 4 }}>{regErrors.password}</p>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.78rem', 
                    fontWeight: 700, 
                    color: regErrors.confirmPassword ? 'var(--danger)' : 'var(--abu-500)', 
                    marginBottom: 6, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em' 
                  }}>
                    Konfirmasi Password <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegConfirm ? 'text' : 'password'}
                      value={regForm.confirmPassword}
                      onChange={e => updateRegForm('confirmPassword', e.target.value)}
                      placeholder="Ulangi password"
                      style={{ 
                        width: '100%', 
                        padding: '13px 48px 13px 16px', 
                        border: `1.5px solid ${regErrors.confirmPassword ? 'var(--danger)' : 'var(--abu-200)'}`, 
                        borderRadius: 'var(--radius-md)', 
                        fontSize: '1rem', 
                        fontFamily: 'var(--font-body)' 
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowRegConfirm(!showRegConfirm)} 
                      style={{ 
                        position: 'absolute', 
                        right: 14, 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '1rem', 
                        color: 'var(--abu-400)',
                        padding: '4px'
                      }}
                    >
                      {showRegConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {regErrors.confirmPassword && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: 4 }}>{regErrors.confirmPassword}</p>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    background: loading ? 'var(--abu-200)' : 'var(--hijau)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 'var(--radius-full)', 
                    fontFamily: 'var(--font-body)', 
                    fontWeight: 700, 
                    fontSize: '1rem', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? <Spinner size={20} color="#fff" /> : '✅ Daftar Sekarang'}
                </button>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.82rem', color: 'var(--abu-400)' }}>
                  Sudah punya akun?{' '}
                  <button 
                    type="button"
                    onClick={() => setTab('login')} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--hijau)', 
                      fontWeight: 700, 
                      cursor: 'pointer', 
                      fontFamily: 'var(--font-body)', 
                      fontSize: '0.82rem',
                      textDecoration: 'underline'
                    }}
                  >
                    Masuk
                  </button>
                </p>
              </form>
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