import React, { useState, useEffect } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Modal from '../common/Modal';

const ScanQR = ({ onScanSuccess, onClose }) => {
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
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      });

      scanner.render(onScanDetected, onScanError);

      return () => {
        scanner.clear();
      };
    }
  }, [scanning]);

  const onScanDetected = (decodedText) => {
    onScanSuccess(decodedText);
  };

  const onScanError = (error) => {
    console.warn('Scan error:', error);
  };

  const handleManualSubmit = () => {
    if (manualId.trim()) {
      onScanSuccess(manualId.trim());
    } else {
      setError('Masukkan ID Kencleng');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Scan QR Kencleng">
      {scanning ? (
        <div className="space-y-4">
          <div id="qr-reader" className="w-full" />
          
          <p className="text-center text-sm text-gray-500">
            Arahkan kamera ke QR Code kencleng Anda
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setScanning(false)}
              className="flex-1"
              icon={<Upload size={20} />}
            >
              Input Manual
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
              icon={<Camera size={20} />}
            >
              Ganti Kamera
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
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

          {error && <Alert type="error" message={error} />}

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
              <Camera size={20} />
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ScanQR;