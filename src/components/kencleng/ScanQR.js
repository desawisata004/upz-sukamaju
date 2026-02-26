import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { validateQRData } from '../../utils/validator';
import Button from '../common/Button';
import Alert from '../common/Alert';

const ScanQR = ({ onScanSuccess, onCancel }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const html5QrCodeRef = useRef(null);

  const startScanner = async () => {
    setError('');
    setScanning(true);

    try {
      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1
        },
        (decodedText) => {
          const data = validateQRData(decodedText);
          if (data) {
            stopScanner();
            onScanSuccess(data);
          } else {
            setError('QR Code tidak valid. Pastikan QR dari Kencleng Digital.');
          }
        },
        () => {}
      );
    } catch (err) {
      setScanning(false);
      if (err.toString().includes('permission')) {
        setPermissionDenied(true);
        setError('Akses kamera ditolak. Izinkan akses kamera di pengaturan browser.');
      } else {
        setError('Gagal memulai kamera: ' + err.toString());
      }
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (e) {}
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { 
      if (html5QrCodeRef.current) {
        stopScanner();
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          background: 'var(--hitam)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          aspectRatio: '1',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 280,
        }}
      >
        {!scanning && (
          <div style={{ textAlign: 'center', color: 'var(--abu-300)', padding: 24 }}>
            <div style={{ fontSize: '4rem', marginBottom: 12, opacity: 0.5 }}>📷</div>
            <p style={{ fontSize: '0.9rem' }}>Tekan tombol di bawah untuk mulai scan QR</p>
          </div>
        )}

        <div
          id="qr-reader"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
          }}
        />

        {scanning && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: 220,
                height: 220,
                border: '2px solid var(--hijau)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 0 0 4000px rgba(0,0,0,0.4)',
                position: 'relative',
              }}
            >
              {['topLeft','topRight','bottomLeft','bottomRight'].map((pos) => (
                <span
                  key={pos}
                  style={{
                    position: 'absolute',
                    width: 20,
                    height: 20,
                    borderColor: 'var(--hijau-muda)',
                    borderStyle: 'solid',
                    borderWidth: 0,
                    ...(pos === 'topLeft' ? { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3 } : {}),
                    ...(pos === 'topRight' ? { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3 } : {}),
                    ...(pos === 'bottomLeft' ? { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3 } : {}),
                    ...(pos === 'bottomRight' ? { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3 } : {}),
                  }}
                />
              ))}

              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'var(--hijau)',
                  animation: 'scanLine 1.5s ease-in-out infinite',
                  boxShadow: '0 0 8px var(--hijau)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {permissionDenied && (
        <Alert
          type="warning"
          message="Coba refresh halaman dan izinkan akses kamera, atau masukkan data secara manual."
        />
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        {!scanning ? (
          <Button fullWidth onClick={startScanner} icon="📷">
            Mulai Scan QR
          </Button>
        ) : (
          <Button fullWidth variant="ghost" onClick={stopScanner}>
            Hentikan Scan
          </Button>
        )}
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} style={{ flexShrink: 0 }}>
            Batal
          </Button>
        )}
      </div>

      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 2px); }
        }
      `}</style>
    </div>
  );
};

export default ScanQR;