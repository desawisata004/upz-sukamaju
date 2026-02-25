// src/pages/login.js
import React, { useState } from 'react';
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
  const { userData } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (userData) {
      const role = userData.role;
      if (role === ROLES.ADMIN) navigate(ROUTES.ADMIN_DASHBOARD);
      else if (role === ROLES.RT) navigate(ROUTES.RT_DASHBOARD);
      else navigate(ROUTES.HOME);
    }
  }, [userData, navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      setAlert({ type: 'error', message: 'Email dan password wajib diisi.' });
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      // Redirect will happen via useEffect above
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
          ? 'Email atau password salah.'
          : 'Gagal login: ' + err.message;
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
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
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -80,
          left: -40,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }}
      />

      {/* Card */}
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
        {/* Logo */}
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
              onFocus={(e) => { e.target.style.borderColor = 'var(--hijau)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--abu-200)'; }}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
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
              onFocus={(e) => { e.target.style.borderColor = 'var(--hijau)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--abu-200)'; }}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
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
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--abu-400)',
            marginTop: 24,
          }}
        >
          Belum punya akun? Hubungi pengurus RT.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
