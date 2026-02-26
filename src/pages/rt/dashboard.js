import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  ArrowLeft, 
  Users, 
  Wallet, 
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import { useKencleng } from '@/hooks/useKencleng';
import { formatRupiah } from '@/utils/formatter';

export default function RtDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalKencleng: 0,
    aktif: 0,
    totalSetoran: 0,
    targetBulanan: 5000000,
    realisasi: 0,
    setoranHariIni: []
  });

  const { getRtStats } = useKencleng();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await getRtStats('RT01');
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Memuat dashboard RT..." />;
  }

  return (
    <>
      <Head>
        <title>Dashboard RT - Kencleng Digital</title>
      </Head>

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white p-4 flex items-center gap-3 border-b">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Dashboard RT 01</h1>
            <p className="text-sm text-gray-500">RW 02, Dusun Karangsari</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kencleng</p>
                  <p className="text-2xl font-bold">{stats.aktif}/{stats.totalKencleng}</p>
                  <p className="text-xs text-gray-500">Aktif</p>
                </div>
              </div>
            </Card>

            <Card className="bg-green-50">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Wallet size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Setoran</p>
                  <p className="text-2xl font-bold">{formatRupiah(stats.totalSetoran, true)}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Target Progress */}
          <Card>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Target Bulanan</h3>
              <span className="text-sm text-gray-600">
                {formatRupiah(stats.realisasi)} / {formatRupiah(stats.targetBulanan)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-600 h-4 rounded-full"
                style={{ width: `${(stats.realisasi / stats.targetBulanan) * 100}%` }}
              />
            </div>
            <p className="text-right text-sm mt-2 text-gray-600">
              {Math.round((stats.realisasi / stats.targetBulanan) * 100)}% tercapai
            </p>
          </Card>

          {/* Setoran Hari Ini */}
          <Card>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Setoran Hari Ini</h3>
              <Button
                variant="primary"
                size="small"
                onClick={() => router.push('/rt/setoran')}
              >
                Input Baru
              </Button>
            </div>

            {stats.setoranHariIni.length > 0 ? (
              <div className="space-y-3">
                {stats.setoranHariIni.map((setoran, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{setoran.nama}</p>
                      <p className="text-sm text-gray-500">{setoran.id_kencleng}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        +{formatRupiah(setoran.jumlah, true)}
                      </p>
                      <p className="text-xs text-gray-500">{setoran.waktu}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">Belum ada setoran hari ini</p>
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/rt/setoran')}
              className="py-4"
            >
              Input Setoran
            </Button>
            <Button
              variant="outline"
              onClick={() => {}}
              className="py-4"
            >
              Laporan
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}