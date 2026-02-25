// src/pages/ScanPage.js
import React, { useState } from 'react';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import ScanQR from '../components/kencleng/ScanQR';
import InputSetoran from '../components/kencleng/InputSetoran';
import { getKenclengById } from '../services/kenclengService';
import Alert from '../components/common/Alert';
import { Spinner } from '../components/common/Loading';

const ScanPage = () => {
  const [step, setStep] = useState('scan'); // scan | input | success
  const [kencleng, setKencleng] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleScanSuccess = async (data) => {
    setLoading(true);
    try {
      const k = await getKenclengById(data.kenclengId);
      if (!k) {
        setAlert({ type: 'error', message: 'Kencleng tidak ditemukan.' });
        return;
      }
      setKencleng(k);
      setStep('input');
    } catch (err) {
      setAlert({ type: 'error', message: 'Gagal memuat data kencleng.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetoranSuccess = () => {
    setStep('success');
  };

  return (
    <div className="app-layout">
      <Header
        title={step === 'scan' ? 'Scan QR Kencleng' : step === 'input' ? 'Input Setoran' : 'Sukses!'}
        showBack={step !== 'scan'}
      />

      <div className="page-content">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner />
          </div>
        )}

        {!loading && step === 'scan' && (
          <>
            <p style={{ fontSize: '0.9rem', color: 'var(--abu-500)', marginBottom: 16, textAlign: 'center' }}>
              Arahkan kamera ke QR Code kencleng warga
            </p>
            <ScanQR onScanSuccess={handleScanSuccess} />
          </>
        )}

        {!loading && step === 'input' && kencleng && (
          <InputSetoran
            kencleng={kencleng}
            onSuccess={handleSetoranSuccess}
            onCancel={() => setStep('scan')}
          />
        )}

        {step === 'success' && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              animation: 'slideUp 0.4s ease',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                background: 'var(--hijau-pale)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                margin: '0 auto 20px',
              }}
            >
              ✅
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>
              Setoran Tercatat!
            </h2>
            <p style={{ color: 'var(--abu-500)', marginBottom: 32 }}>
              Setoran sedang menunggu konfirmasi dari pengurus RT.
            </p>
            <button
              onClick={() => setStep('scan')}
              style={{
                padding: '12px 28px',
                background: 'var(--hijau)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Scan Lagi
            </button>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default ScanPage;
