import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Phone, 
  QrCode,
  LogOut,
  Settings,
  HelpCircle,
  Info
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export default function ProfilPage() {
  const router = useRouter();
  const [kenclengId, setKenclengId] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const savedId = localStorage.getItem('kencleng_id');
    if (savedId) {
      setKenclengId(savedId);
      // Load user data dari localStorage atau API
      setUserData({
        nama: localStorage.getItem('nama_kepala_keluarga') || 'Ahmad Syarifudin',
        alamat: 'RT 01 / RW 02, Dusun Karangsari',
        no_hp: '081234567890',
        sejak: 'Januari 2026'
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kencleng_id');
    localStorage.removeItem('nama_kepala_keluarga');
    router.push('/');
  };

  const menuItems = [
    {
      icon: <User size={20} />,
      label: 'Data Diri',
      onClick: () => {},
      badge: 'Lengkap'
    },
    {
      icon: <QrCode size={20} />,
      label: 'QR Code Kencleng',
      onClick: () => {},
    },
    {
      icon: <Settings size={20} />,
      label: 'Pengaturan',
      onClick: () => {},
    },
    {
      icon: <HelpCircle size={20} />,
      label: 'Bantuan',
      onClick: () => {},
    },
    {
      icon: <Info size={20} />,
      label: 'Tentang Aplikasi',
      onClick: () => {},
      badge: 'v1.0.0'
    }
  ];

  return (
    <>
      <Head>
        <title>Profil - Kencleng Digital</title>
      </Head>

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white p-4 flex items-center gap-3 border-b">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold">Profil</h1>
        </div>

        {kenclengId ? (
          <>
            {/* Header Profil */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
              <div className="flex items-center gap-4">
                <div className="bg-white p-4 rounded-full">
                  <User size={32} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{userData?.nama}</h2>
                  <p className="text-green-100 mt-1">ID: {kenclengId}</p>
                </div>
              </div>
            </div>

            {/* Info Kontak */}
            <div className="p-4 space-y-3">
              <Card>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Alamat</p>
                      <p className="font-medium">{userData?.alamat}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">No. HP</p>
                      <p className="font-medium">{userData?.no_hp}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Menu */}
              <Card>
                <div className="divide-y">
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className="w-full py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Tombol Logout */}
              <Button
                variant="danger"
                onClick={handleLogout}
                className="w-full"
                icon={<LogOut size={20} />}
              >
                Keluar / Ganti Kencleng
              </Button>
            </div>
          </>
        ) : (
          <div className="p-4">
            <Card className="text-center py-8">
              <User size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Belum Terhubung</h2>
              <p className="text-gray-600 mb-6">
                Scan QR Code kencleng Anda untuk melihat profil
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/scan')}
                className="w-full"
              >
                Scan QR Kencleng
              </Button>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}