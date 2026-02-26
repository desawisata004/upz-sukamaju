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
      fontSize: '0.75rem', 
      fontWeight: 600, 
      color: error ? 'var(--danger)' : 'var(--abu-600)', 
      marginBottom: 4,
      letterSpacing: '0.3px'
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
        padding: '12px 14px', 
        border: `1.5px solid ${error ? 'var(--danger)' : 'var(--abu-200)'}`, 
        borderRadius: '12px', 
        fontSize: '0.95rem', 
        fontFamily: 'var(--font-body)', 
        background: '#fff', 
        color: 'var(--hitam)', 
        transition: 'all 0.2s',
        outline: 'none',
        boxShadow: error ? '0 0 0 3px rgba(192, 57, 43, 0.1)' : 'none'
      }}
      onFocus={e => {
        e.target.style.borderColor = error ? 'var(--danger)' : 'var(--hijau)';
        e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(192, 57, 43, 0.1)' : 'rgba(26, 107, 60, 0.1)'}`;
      }}
      onBlur={e => {
        e.target.style.borderColor = error ? 'var(--danger)' : 'var(--abu-200)';
        e.target.style.boxShadow = 'none';
      }}
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
    
    if (regForm.noHp) {
      const cleanNoHp = regForm.noHp.replace(/\D/g, '');
      if (cleanNoHp.length < 10 || cleanNoHp.length > 13) {
        newErrors.noHp = 'Nomor HP harus 10-13 angka';
      }
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
      
      setAlert({ type: 'success', message: '✅ Akun berhasil dibuat! Silakan login.' });
      
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, var(--coklat-pale) 0%, #fff 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Hero Header */}
      <div style={{ 
        background: 'linear-gradient(145deg, var(--hijau) 0%, #2d5a3c 100%)', 
        padding: '48px 24px 64px', 
        textAlign: 'center', 
        position: 'relative', 
        overflow: 'hidden',
        borderBottomLeftRadius: '30px',
        borderBottomRightRadius: '30px',
      }}>
        {/* Decorative circles */}
        <div style={{ 
          position: 'absolute', 
          top: -30, 
          right: -30, 
          width: 160, 
          height: 160, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.05)',
          zIndex: 1
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: -50, 
          left: -20, 
          width: 140, 
          height: 140, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.03)',
          zIndex: 1
        }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: 12,
            filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.2))'
          }}>
            🪣
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '2.2rem', 
            color: '#fff', 
            fontStyle: 'italic', 
            marginBottom: 8,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {APP_NAME}
          </h1>
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 500
          }}>
            {RT_NAME}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div style={{ 
        padding: '0 20px', 
        marginTop: -32, 
        paddingBottom: 40,
        flex: 1,
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: '28px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.06)', 
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.5)'
        }}>
          {/* Tab Navigation */}
          <div style={{ 
            display: 'flex', 
            padding: '8px 8px 0 8px',
            background: 'var(--abu-50)',
            borderBottom: '1px solid var(--abu-100)'
          }}>
            <button 
              onClick={() => { setTab('login'); setAlert(null); }}
              style={{ 
                flex: 1, 
                padding: '14px 16px', 
                background: 'none', 
                border: 'none', 
                fontFamily: 'var(--font-body)', 
                fontWeight: 600, 
                fontSize: '0.95rem', 
                color: tab === 'login' ? 'var(--hijau)' : 'var(--abu-400)', 
                cursor: 'pointer', 
                borderBottom: `3px solid ${tab === 'login' ? 'var(--hijau)' : 'transparent'}`, 
                transition: 'all 0.2s',
                marginBottom: -1,
                borderRadius: '12px 12px 0 0'
              }}
            >
              Masuk
            </button>
            <button 
              onClick={() => { setTab('daftar'); setAlert(null); }}
              style={{ 
                flex: 1, 
                padding: '14px 16px', 
                background: 'none', 
                border: 'none', 
                fontFamily: 'var(--font-body)', 
                fontWeight: 600, 
                fontSize: '0.95rem', 
                color: tab === 'daftar' ? 'var(--hijau)' : 'var(--abu-400)', 
                cursor: 'pointer', 
                borderBottom: `3px solid ${tab === 'daftar' ? 'var(--hijau)' : 'transparent'}`, 
                transition: 'all 0.2s',
                marginBottom: -1,
                borderRadius: '12px 12px 0 0'
              }}
            >
              Daftar
            </button>
          </div>

          <div style={{ padding: '28px 24px 32px' }}>
            {alert && (
              <div style={{ marginBottom: 20 }}>
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} autoClose={5000} />
              </div>
            )}

            {/* LOGIN TAB */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} style={{ animation: 'fadeIn 0.3s ease' }}>
                <InputField 
                  label="Email" 
                  type="email" 
                  value={email} 
                  onChange={setEmail} 
                  placeholder="contoh@email.com" 
                  required 
                  error={errors.email}
                />

                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    color: errors.password ? 'var(--danger)' : 'var(--abu-600)', 
                    marginBottom: 4,
                    letterSpacing: '0.3px'
                  }}>
                    Password <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ 
                        width: '100%', 
                        padding: '12px 48px 12px 14px', 
                        border: `1.5px solid ${errors.password ? 'var(--danger)' : 'var(--abu-200)'}`, 
                        borderRadius: '12px', 
                        fontSize: '0.95rem', 
                        fontFamily: 'var(--font-body)',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxShadow: errors.password ? '0 0 0 3px rgba(192, 57, 43, 0.1)' : 'none'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = errors.password ? 'var(--danger)' : 'var(--hijau)';
                        e.target.style.boxShadow = `0 0 0 3px ${errors.password ? 'rgba(192, 57, 43, 0.1)' : 'rgba(26, 107, 60, 0.1)'}`;
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = errors.password ? 'var(--danger)' : 'var(--abu-200)';
                        e.target.style.boxShadow = 'none';
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
                        fontSize: '1.1rem', 
                        color: 'var(--abu-400)',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--abu-100)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: 6 }}>{errors.password}</p>
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
                    borderRadius: '16px', 
                    fontFamily: 'var(--font-body)', 
                    fontWeight: 700, 
                    fontSize: '1rem', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: loading ? 'none' : '0 8px 16px rgba(26, 107, 60, 0.2)',
                    transform: loading ? 'none' : 'translateY(0)',
                    marginTop: 8
                  }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? <Spinner size={20} color="#fff" /> : 'Masuk →'}
                </button>

                <p style={{ 
                  textAlign: 'center', 
                  marginTop: 20, 
                  fontSize: '0.85rem', 
                  color: 'var(--abu-400)',
                  borderTop: '1px solid var(--abu-100)',
                  paddingTop: 20
                }}>
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
                      fontSize: '0.85rem',
                      textDecoration: 'underline',
                      padding: '4px 8px'
                    }}
                  >
                    Daftar sekarang
                  </button>
                </p>
              </form>
            )}

            {/* REGISTER TAB */}
            {tab === 'daftar' && (
              <form onSubmit={handleRegister} style={{ animation: 'fadeIn 0.3s ease' }}>
                <InputField 
                  label="Nama Lengkap" 
                  value={regForm.nama} 
                  onChange={(v) => updateRegForm('nama', v)} 
                  placeholder="Masukkan nama lengkap" 
                  required 
                  error={regErrors.nama}
                />
                
                <InputField 
                  label="Email" 
                  type="email" 
                  value={regForm.email} 
                  onChange={(v) => updateRegForm('email', v)} 
                  placeholder="contoh@email.com" 
                  required 
                  error={regErrors.email}
                />
                
                <InputField 
                  label="No. HP" 
                  type="tel" 
                  value={regForm.noHp} 
                  onChange={(v) => updateRegForm('noHp', v)} 
                  placeholder="081234567890" 
                  hint="Opsional, 10-13 angka"
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
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    color: regErrors.password ? 'var(--danger)' : 'var(--abu-600)', 
                    marginBottom: 4,
                    letterSpacing: '0.3px'
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
                        padding: '12px 48px 12px 14px', 
                        border: `1.5px solid ${regErrors.password ? 'var(--danger)' : 'var(--abu-200)'}`, 
                        borderRadius: '12px', 
                        fontSize: '0.95rem', 
                        fontFamily: 'var(--font-body)',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxShadow: regErrors.password ? '0 0 0 3px rgba(192, 57, 43, 0.1)' : 'none'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = regErrors.password ? 'var(--danger)' : 'var(--hijau)';
                        e.target.style.boxShadow = `0 0 0 3px ${regErrors.password ? 'rgba(192, 57, 43, 0.1)' : 'rgba(26, 107, 60, 0.1)'}`;
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
                        fontSize: '1.1rem', 
                        color: 'var(--abu-400)',
                        padding: '8px',
                        borderRadius: '8px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--abu-100)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {showRegPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {regErrors.password && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: 6 }}>{regErrors.password}</p>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    color: regErrors.confirmPassword ? 'var(--danger)' : 'var(--abu-600)', 
                    marginBottom: 4,
                    letterSpacing: '0.3px'
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
                        padding: '12px 48px 12px 14px', 
                        border: `1.5px solid ${regErrors.confirmPassword ? 'var(--danger)' : 'var(--abu-200)'}`, 
                        borderRadius: '12px', 
                        fontSize: '0.95rem', 
                        fontFamily: 'var(--font-body)',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxShadow: regErrors.confirmPassword ? '0 0 0 3px rgba(192, 57, 43, 0.1)' : 'none'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = regErrors.confirmPassword ? 'var(--danger)' : 'var(--hijau)';
                        e.target.style.boxShadow = `0 0 0 3px ${regErrors.confirmPassword ? 'rgba(192, 57, 43, 0.1)' : 'rgba(26, 107, 60, 0.1)'}`;
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
                        fontSize: '1.1rem', 
                        color: 'var(--abu-400)',
                        padding: '8px',
                        borderRadius: '8px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--abu-100)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {showRegConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {regErrors.confirmPassword && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: 6 }}>{regErrors.confirmPassword}</p>
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
                    borderRadius: '16px', 
                    fontFamily: 'var(--font-body)', 
                    fontWeight: 700, 
                    fontSize: '1rem', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: loading ? 'none' : '0 8px 16px rgba(26, 107, 60, 0.2)',
                    transform: loading ? 'none' : 'translateY(0)',
                    marginTop: 8
                  }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? <Spinner size={20} color="#fff" /> : '✅ Daftar Sekarang'}
                </button>

                <p style={{ 
                  textAlign: 'center', 
                  marginTop: 20, 
                  fontSize: '0.85rem', 
                  color: 'var(--abu-400)',
                  borderTop: '1px solid var(--abu-100)',
                  paddingTop: 20
                }}>
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
                      fontSize: '0.85rem',
                      textDecoration: 'underline',
                      padding: '4px 8px'
                    }}
                  >
                    Masuk
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        <p style={{ 
          textAlign: 'center', 
          fontSize: '0.7rem', 
          color: 'var(--abu-300)', 
          marginTop: 20,
          fontWeight: 500
        }}>
          {APP_NAME} · {RT_NAME}
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;