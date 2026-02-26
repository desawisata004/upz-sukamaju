import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Trophy, Award, Medal, TrendingUp } from 'lucide-react';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import { useKencleng } from '@/hooks/useKencleng';
import { formatRupiah } from '@/utils/formatter';

export default function LeaderboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [periode, setPeriode] = useState('bulan');
  const [rtInfo, setRtInfo] = useState(null);
  
  const { getLeaderboard } = useKencleng();

  useEffect(() => {
    loadLeaderboard();
  }, [periode]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Asumsikan RT ID dari user yang login
      const rtId = localStorage.getItem('rt_id') || 'RT01';
      const data = await getLeaderboard(rtId, periode);
      setLeaderboard(data);
      
      // Info RT
      setRtInfo({
        nama: 'RT 01 / RW 02',
        total: data.reduce((sum, item) => sum + item.total, 0),
        partisipasi: Math.round((data.length / 50) * 100) // Asumsi 50 rumah
      });
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch(index) {
      case 0: return <Trophy size={24} className="text-yellow-500" />;
      case 1: return <Award size={24} className="text-gray-400" />;
      case 2: return <Medal size={24} className="text-orange-500" />;
      default: return <span className="w-6 text-center font-bold">{index + 1}</span>;
    }
  };

  if (loading) {
    return <Loading fullScreen message="Memuat leaderboard..." />;
  }

  return (
    <>
      <Head>
        <title>Leaderboard - Kencleng Digital</title>
      </Head>

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white p-4 flex items-center gap-3 border-b">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold">Leaderboard Kencleng</h1>
        </div>

        {/* Info RT */}
        {rtInfo && (
          <div className="p-4">
            <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-green-100">RT {rtInfo.nama}</p>
                  <p className="text-2xl font-bold mt-1">{formatRupiah(rtInfo.total)}</p>
                  <p className="text-sm text-green-100 mt-1">Total Pengumpulan</p>
                </div>
                <div className="text-right">
                  <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                    <p className="text-sm">Partisipasi</p>
                    <p className="text-2xl font-bold">{rtInfo.partisipasi}%</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filter Periode */}
        <div className="px-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setPeriode('minggu')}
              className={`flex-1 py-2 rounded-lg text-sm ${
                periode === 'minggu' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white border'
              }`}
            >
              Minggu Ini
            </button>
            <button
              onClick={() => setPeriode('bulan')}
              className={`flex-1 py-2 rounded-lg text-sm ${
                periode === 'bulan' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white border'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setPeriode('tahun')}
              className={`flex-1 py-2 rounded-lg text-sm ${
                periode === 'tahun' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white border'
              }`}
            >
              Tahun Ini
            </button>
          </div>
        </div>

        {/* Daftar Leaderboard */}
        <div className="px-4 space-y-2">
          {leaderboard.map((item, index) => (
            <Card key={item.id_kencleng} className="hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 flex justify-center">
                  {getRankIcon(index)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{item.nama_kepala_keluarga || `Rumah ${index + 1}`}</p>
                  <p className="text-xs text-gray-500">{item.id_kencleng}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatRupiah(item.total, true)}</p>
                  <p className="text-xs text-gray-500">{item.count}x setoran</p>
                </div>
              </div>
            </Card>
          ))}

          {leaderboard.length === 0 && (
            <Card className="text-center py-8">
              <TrendingUp size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Belum ada data leaderboard</p>
              <p className="text-sm text-gray-400 mt-1">Ajak warga untuk mulai berinfak</p>
            </Card>
          )}
        </div>

        {/* Info Program */}
        <div className="p-4 mt-4">
          <Card className="bg-blue-50 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">🏆 Program Apresiasi</h3>
            <p className="text-sm text-blue-700">
              Top 3 setiap bulan akan mendapatkan apresiasi khusus dari UPZ Desa. Ayo tingkatkan infak rutin Anda!
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}