/**
 * Format angka ke format Rupiah
 * @param {number} number - Angka yang akan diformat
 * @param {boolean} simple - Format sederhana tanpa desimal
 * @returns {string} - String format Rupiah
 */
export const formatRupiah = (number, simple = false) => {
  if (number === null || number === undefined) return 'Rp 0';
  
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: simple ? 0 : 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(number);
};

/**
 * Format tanggal ke format Indonesia
 * @param {Timestamp|Date} timestamp - Firebase Timestamp atau Date object
 * @returns {string} - String tanggal format Indonesia
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Format tanggal dan waktu
 * @param {Timestamp|Date} timestamp - Firebase Timestamp atau Date object
 * @returns {string} - String tanggal dan waktu
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return '-';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format angka dengan pemisah ribuan
 * @param {number} number - Angka yang akan diformat
 * @returns {string} - String dengan pemisah ribuan
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('id-ID').format(number || 0);
};

/**
 * Truncate teks dengan panjang maksimal
 * @param {string} text - Teks yang akan dipotong
 * @param {number} length - Panjang maksimal
 * @returns {string} - Teks yang sudah dipotong
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Format persentase
 * @param {number} value - Nilai
 * @param {number} total - Total
 * @returns {string} - String persentase
 */
export const formatPercentage = (value, total) => {
  if (!total) return '0%';
  const percentage = (value / total) * 100;
  return Math.round(percentage) + '%';
};