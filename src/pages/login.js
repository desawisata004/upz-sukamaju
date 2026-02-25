// src/pages/login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { ROLES, ROUTES, APP_NAME, RT_NAME } from '../config/constants';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();
  const { userData, error: authError } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (userData) {
      console.log('User sudah login, redirect ke dashboard');
      const role = userData.role;
      if (role === ROLES.ADMIN) navigate(ROUTES.ADMIN_DASHBOARD);
      else if (role === ROLES.RT) navigate(ROUTES.RT_DASHBOARD);
      else navigate(ROUTES.HOME);
    }
  }, [userData, navigate]);

  useEffect(() => {
    if (authError) {
      setAlert({ type: 'error', message: authError });
    }
  }, [authError]);

  const handleLogin = async () => {
    // Validasi input
    if (!email || !password) {
      setAlert({ type: 'error', message: 'Email dan password wajib diisi.' });
      return;
    }

    setLoading(true);
    setAlert(null);
    
    try {
      console.log('Mencoba login dengan:', email);
      await loginWithEmail(email, password);
      // Redirect akan terjadi via useEffect
    } catch (err) {
      console.error('Login error di komponen:', err);
      setAlert({ 
        type: 'error', 
        message: err.message || 'Gagal login. Periksa koneksi Anda.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Untuk testing - akun sementara
  const fillDemoAccount = () => {
    setEmail('admin@rt05.com');
    setPassword('password123');
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    border: '1.5px solid var(--abu-200)',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    background: '#fff',
    color: 'var(--hitam)',
    transition: 'border-color var(--transition)',
    fontFamily: 'var(--font-body)',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, var(--hijau) 0%, var(--coklat) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 32px',
          boxShadow: '0 24px 64px rgba(28,26,22,0.3)',
          animation: 'slideUp 0.4s cubic-bezier(0.4,0,0.2,1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              background: 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))',
              borderRadius: 'var(--radius-lg)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              marginBottom: 16,
              boxShadow: '0 8px 24px rgba(26,107,60,0.3)',
            }}
          >
            🪣
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              color: 'var(--hitam)',
              marginBottom: 4,
            }}
          >
            {APP_NAME}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--abu-500)' }}>{RT_NAME}</p>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--abu-500)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--abu-500)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <Button
            fullWidth
            size="lg"
            onClick={handleLogin}
            loading={loading}
            style={{ marginTop: 8, borderRadius: 'var(--radius-md)' }}
          >
            Masuk
          </Button>

          {/* Tombol demo - hapus setelah testing */}
          <button
            onClick={fillDemoAccount}
            style={{
              marginTop: 8,
              padding: '8px',
              background: 'none',
              border: '1px dashed var(--abu-300)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--abu-500)',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            🔧 Isi Demo Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;