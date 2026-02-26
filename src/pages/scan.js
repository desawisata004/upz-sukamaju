import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, QrCode, Camera } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

export default function ScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(true);
  const [manualId, setManualId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });

      scanner.render(onScanSuccess, onScanError);

      return () => {
        scanner.clear();
      };
    }
  }, [scanning]);

  const onScanSuccess = (decodedText) => {
    // Simpan ID kencleng dan kembali ke beranda
    localStorage.setItem('kencleng_id', decodedText);
    router.push('/');
  };

  const onScanError = (error) => {
    console.warn(error);
  };

  const handleManualSubmit = () => {
    if (manualId.trim()) {
      localStorage.setItem('kencleng_id', manualId.trim());
      router.push('/');
    } else {
      setError('Masukkan ID Kencleng');
    }
  };

  return (
    <>
      <Head>
        <title>Scan QR Kencleng</title>
      </Head>

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white p-4 flex items-center gap-3 border-b">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold">Scan QR Kencleng</h1>
        </div>

        <div className="p-4">
          <Card>
            {scanning ? (
              <div>
                <div id="qr-reader" className="w-full" />
                <p className="text-center text-sm text-gray-500 mt-4">
                  Arahkan kamera ke QR Code kencleng Anda
                </p>
                <Button
                  variant="outline"
                  onClick={() => setScanning(false)}
                  className="w-full mt-4"
                >
                  Input Manual
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <Camera size={48} className="mx-auto text-gray-400 mb-2" />
                  <h3 className="font-medium">Input Manual</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ID Kencleng
                  </label>
                  <input
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder="Contoh: KCLG-01-001"
                    className="w-full px-4 py-3 border rounded-lg text-lg"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={handleManualSubmit}
                    className="flex-1"
                  >
                    Lanjutkan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setScanning(true);
                      setError('');
                    }}
                  >
                    <QrCode size={20} />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}