import { useState } from 'react';
import kenclengService from '@/services/kenclengService';
import { toast } from 'react-hot-toast';

export const useKencleng = () => {
  const [loading, setLoading] = useState(false);

  const getKenclengById = async (id) => {
    setLoading(true);
    try {
      const data = await kenclengService.getKenclengById(id);
      return data;
    } catch (error) {
      toast.error('Gagal mengambil data kencleng');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getRiwayatSetoran = async (kenclengId, limit = 30) => {
    try {
      const data = await kenclengService.getRiwayatSetoran(kenclengId, limit);
      return data;
    } catch (error) {
      toast.error('Gagal mengambil riwayat setoran');
      return [];
    }
  };

  const inputSetoran = async (data) => {
    setLoading(true);
    try {
      const result = await kenclengService.inputSetoran(data);
      toast.success('Setoran berhasil dicatat');
      return result;
    } catch (error) {
      toast.error('Gagal mencatat setoran');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getLeaderboard = async (rtId, periode) => {
    try {
      const data = await kenclengService.getLeaderboard(rtId, periode);
      return data;
    } catch (error) {
      toast.error('Gagal mengambil leaderboard');
      return [];
    }
  };

  const getRtStats = async (rtId) => {
    try {
      const data = await kenclengService.getRtStats(rtId);
      return data;
    } catch (error) {
      toast.error('Gagal mengambil statistik RT');
      return {
        totalKencleng: 0,
        aktif: 0,
        totalSetoran: 0,
        targetBulanan: 0,
        realisasi: 0,
        setoranHariIni: []
      };
    }
  };

  const calculateStats = (riwayat) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentWeek = getWeekNumber(now);
    
    let total = 0;
    let bulanIni = 0;
    let mingguIni = 0;
    
    riwayat.forEach(item => {
      const jumlah = item.jumlah || 0;
      total += jumlah;
      
      const date = item.tanggal?.toDate();
      if (date) {
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          bulanIni += jumlah;
          
          if (getWeekNumber(date) === currentWeek) {
            mingguIni += jumlah;
          }
        }
      }
    });
    
    return { total, bulanIni, mingguIni };
  };

  // Helper function untuk mendapatkan nomor minggu
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  return {
    loading,
    getKenclengById,
    getRiwayatSetoran,
    inputSetoran,
    getLeaderboard,
    getRtStats,
    calculateStats
  };
};