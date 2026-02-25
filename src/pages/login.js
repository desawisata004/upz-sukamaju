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
  const { userData } = useAuth();

  useEffect(() => {
    if (userData) {
      if (userData.role === ROLES.ADMIN) navigate(ROUTES.ADMIN_DASHBOARD);
      else if (userData.role === ROLES.RT) navigate(ROUTES.RT_DASHBOARD);
      else navigate(ROUTES.HOME);
    }
  }, [userData, navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      setAlert({ type: 'error', message: 'Email dan password wajib diisi' });
      return;
    }

    setLoading(true);
    setAlert(null);
    
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, var(--hijau) 0%, var(--coklat) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 5vw, 24px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(24px, 6vw, 40px) clamp(20px, 5vw, 32px)',
          boxShadow: '0 24px 64px rgba(28,26,22,0.3)',
          animation: 'slideUp 0.4s ease',
        }}
      >
        <div className="text-center mb-3">
          <div
            style={{
              width: 'clamp(60px, 15vw, 72px)',
              height: 'clamp(60px, 15vw, 72px)',
              background: 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))',
              borderRadius: 'var(--radius-lg)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(1.8rem, 6vw, 2.2rem)',
              marginBottom: 'clamp(12px, 3vw, 16px)',
              boxShadow: '0 8px 24px rgba(26,107,60,0.3)',
            }}
          >
            🪣
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 6vw, 1.8rem)',
            color: 'var(--hitam)',
            marginBottom: 4,
          }}>
            {APP_NAME}
          </h1>
          <p className="text-sm text-muted">{RT_NAME}</p>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="flex flex-col gap-2">
          <div>
            <label className="text-xs text-muted mb-1" style={{ textTransform: 'uppercase' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div>
            <label className="text-xs text-muted mb-1" style={{ textTransform: 'uppercase' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <Button
            fullWidth
            size="lg"
            onClick={handleLogin}
            loading={loading}
            style={{ marginTop: 8 }}
          >
            Masuk
          </Button>
        </div>

        <p className="text-xs text-center text-muted mt-3">
          Belum punya akun? Hubungi pengurus RT
        </p>
      </div>
    </div>
  );
};

export default LoginPage;