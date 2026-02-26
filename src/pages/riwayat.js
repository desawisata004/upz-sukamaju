import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Calendar, Filter, Download } from 'lucide-react';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import { useKencleng } from '@/hooks/useKencleng';
import { formatRupiah, formatDateTime } from '@/utils/formatter';

export default function RiwayatPage() {
  const router = useRouter();
  const [kenclengId, setKenclengId] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('semua');
  const [stats, setStats] = useState({ total: 0, count: 0 });
  
  const { getRiwayatSetoran, calculateStats } = useKencleng();

  useEffect(() => {
    const savedId = localStorage.getItem('kencleng_id');
    if (!savedId) {
      router.push('/');
      return;
    }
    setKenclengId(savedId);
    loadRiwayat(savedId);
  }, []);

  const loadRiwayat = async (id) => {
    setLoading(true);
    try {
      const data = await getRiwayatSetoran(id, 100);
      
      // Filter berdasarkan periode
      let filteredData = data;
      const now = new Date();
      
      if (filter === 'bulan') {
        filteredData = data.filter(item => {
          const date = item.tanggal?.toDate();
          return date && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
      } else if (filter === 'tahun') {
        filteredData = data.filter(item => {
          const date = item.tanggal?.toDate();
          return date && date.getFullYear() === now.getFullYear();
        });
      }
      
      setRiwayat(filteredData);
      
      const calculated = calculateStats(filteredData);
      setStats({
        total: calculated.total,
        count: filteredData.length
      });
    } catch (error) {
      console.error('Error loading riwayat:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (kenclengId) {
      loadRiwayat(kenclengId);
    }
  }, [filter]);

  const handleExport = () => {
    const dataStr = JSON.stringify(riwayat, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `riwayat_kencleng_${kenclengId}_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return <Loading fullScreen message="Memuat riwayat..." />;
  }

  return (
    <>
      <Head>
        <title>Riwayat Setoran - Kencleng Digital</title>
      </Head>

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}>
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-semibold">Riwayat Setoran</h1>
          </div>
          <button onClick={handleExport} className="p-2">
            <Download size={20} />
          </button>
        </div>

        {/* Stats Summary */}
        <div className="p-4">
          <Card className="bg-green-50">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Setoran</p>
                <p className="text-2xl font-bold text-green-700">{formatRupiah(stats.total)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Jumlah Transaksi</p>
                <p className="text-2xl font-bold text-green-700">{stats.count}x</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter */}
        <div className="px-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('semua')}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === 'semua' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white border'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('bulan')}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === 'bulan' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white border'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setFilter('tahun')}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === 'tahun' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white border'
              }`}
            >
              Tahun Ini
            </button>
          </div>
        </div>

        {/* Daftar Riwayat */}
        <div className="px-4 space-y-3">
          {riwayat.length > 0 ? (
            riwayat.map((item, index) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Calendar size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{formatDateTime(item.tanggal)}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.catatan || 'Setoran rutin'}
                        </p>
                      </div>
                      <p className="font-bold text-green-600">
                        +{formatRupiah(item.jumlah, true)}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {item.metode_setor || 'Tunai'}
                      </span>
                      {item.status === 'verified' && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                          ✓ Terverifikasi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="text-center py-8">
              <p className="text-gray-500">Belum ada riwayat setoran</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}