import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Wallet, 
  TrendingUp, 
  Calendar, 
  Award,
  ChevronRight,
  QrCode,
  History,
  Users
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import ScanQR from '@/components/kencleng/ScanQR';
import { useKencleng } from '@/hooks/useKencleng';
import { formatRupiah, formatDate } from '@/utils/formatter';

export default function Home() {
  const router = useRouter();
  const [showScan, setShowScan] = useState(false);
  const [kenclengId, setKenclengId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kenclengData, setKenclengData] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    bulanIni: 0,
    mingguIni: 0
  });
  
  const { getKenclengById, getRiwayatSetoran, calculateStats } = useKencleng();

  useEffect(() => {
    const savedId = localStorage.getItem('kencleng_id');
    if (savedId) {
      setKenclengId(savedId);
      loadKenclengData(savedId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadKenclengData = async (id) => {
    setLoading(true);
    try {
      const data = await getKenclengById(id);
      setKenclengData(data);
      
      const history = await getRiwayatSetoran(id, 10);
      setRiwayat(history);
      
      const calculatedStats = calculateStats(history);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = (id) => {
    setKenclengId(id);
    localStorage.setItem('kencleng_id', id);
    setShowScan(false);
    loadKenclengData(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('kencleng_id');
    setKenclengId(null);
    setKenclengData(null);
  };

  if (loading) {
    return <Loading fullScreen message="Memuat data kencleng..." />;
  }

  return (
    <>
      <Head>
        <title>Kencleng Digital - {process.env.NEXT_PUBLIC_DESA_NAME}</title>
      </Head>

      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Kencleng Digital</h1>
              <p className="text-green-100 mt-1">{process.env.NEXT_PUBLIC_DESA_NAME}</p>
            </div>
            {kenclengId && (
              <button 
                onClick={handleLogout}
                className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm"
              >
                Ganti
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {!kenclengId ? (
            <Card className="text-center py-8">
              <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet size={48} className="text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Selamat Datang
              </h2>
              <p className="text-gray-600 mb-6">
                Scan QR Code kencleng Anda untuk melihat riwayat setoran dan berpartisipasi dalam program infak desa
              </p>
              <Button
                variant="primary"
                size="large"
                onClick={() => setShowScan(true)}
                className="w-full"
                icon={<QrCode size={20} />}
              >
                Scan QR Kencleng
              </Button>
            </Card>
          ) : (
            <>
              {/* Info Kencleng */}
              <Card className="border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">ID Kencleng</p>
                    <p className="font-mono font-bold text-lg">{kenclengId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Atas Nama</p>
                    <p className="font-semibold">{kenclengData?.nama_kepala_keluarga || '-'}</p>
                  </div>
                </div>
              </Card>

              {/* Statistik Cards */}
              <div className="grid grid-cols-3 gap-2">
                <Card className="text-center p-3">
                  <Wallet size={20} className="mx-auto text-green-600 mb-1" />
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-sm">{formatRupiah(stats.total, true)}</p>
                </Card>
                <Card className="text-center p-3">
                  <Calendar size={20} className="mx-auto text-blue-600 mb-1" />
                  <p className="text-xs text-gray-500">Bulan Ini</p>
                  <p className="font-bold text-sm">{formatRupiah(stats.bulanIni, true)}</p>
                </Card>
                <Card className="text-center p-3">
                  <TrendingUp size={20} className="mx-auto text-purple-600 mb-1" />
                  <p className="text-xs text-gray-500">Minggu Ini</p>
                  <p className="font-bold text-sm">{formatRupiah(stats.mingguIni, true)}</p>
                </Card>
              </div>

              {/* Progress Bar Target */}
              <Card>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Target Bulanan</h3>
                  <span className="text-sm text-gray-600">
                    {formatRupiah(stats.bulanIni)} / {formatRupiah(100000)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-green-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${Math.min((stats.bulanIni / 100000) * 100, 100)}%` }}
                  >
                    {stats.bulanIni >= 100000 && (
                      <span className="text-xs text-white font-bold">✓</span>
                    )}
                  </div>
                </div>
                <p className="text-right text-xs mt-2 text-gray-500">
                  {stats.bulanIni >= 100000 ? 'Target tercapai! 🎉' : `${Math.round((stats.bulanIni / 100000) * 100)}% terkumpul`}
                </p>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/scan')}
                  className="py-4"
                  icon={<QrCode size={20} />}
                >
                  Scan QR
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/riwayat')}
                  className="py-4"
                  icon={<History size={20} />}
                >
                  Riwayat
                </Button>
              </div>

              {/* Riwayat Setoran Terbaru */}
              <Card>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Riwayat Terbaru</h3>
                  <button 
                    onClick={() => router.push('/riwayat')}
                    className="text-green-600 text-sm flex items-center"
                  >
                    Lihat Semua
                    <ChevronRight size={16} />
                  </button>
                </div>

                {riwayat.length > 0 ? (
                  <div className="space-y-3">
                    {riwayat.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Wallet size={16} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{formatDate(item.tanggal)}</p>
                            <p className="text-xs text-gray-500">{item.catatan || 'Setoran rutin'}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-green-600">
                          +{formatRupiah(item.jumlah, true)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">Belum ada setoran</p>
                    <p className="text-sm text-gray-400 mt-1">Mulai infak dengan mengisi kencleng Anda</p>
                  </div>
                )}
              </Card>

              {/* Info Program */}
              <Card className="bg-green-50 border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="bg-green-600 p-2 rounded-full">
                    <Award size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">Program 5 Ciamis</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Infak Anda akan disalurkan untuk: Peduli, Cerdas, Sehat, Sejahtera, dan Agamis
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Modal Scan QR */}
        {showScan && (
          <ScanQR
            onScanSuccess={handleScanSuccess}
            onClose={() => setShowScan(false)}
          />
        )}
      </div>
    </>
  );
}