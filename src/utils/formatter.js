export const formatRupiah = (amount) => {
  if (!amount && amount !== 0) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const isValidDate = (date) => {
  if (!date) return false;
  
  try {
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  } catch {
    return false;
  }
};

const safeFormatDate = (timestamp, formatter) => {
  if (!timestamp) return '-';
  
  try {
    let date;
    if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return '-';
    }
    
    if (isNaN(date.getTime())) return '-';
    return formatter.format(date);
  } catch {
    return '-';
  }
};

export const formatTanggal = (timestamp) => {
  const formatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return safeFormatDate(timestamp, formatter);
};

export const formatTanggalShort = (timestamp) => {
  const formatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return safeFormatDate(timestamp, formatter);
};

export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '-';
  
  try {
    let date;
    if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) return '-';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return formatTanggalShort(timestamp);
  } catch {
    return '-';
  }
};

export const formatProgress = (saldo, target) => {
  if (!target || target === 0) return 0;
  const progress = (saldo / target) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
};

export const initials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};
