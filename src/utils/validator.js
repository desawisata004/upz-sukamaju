// src/utils/validator.js

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateNominal = (nominal) => {
  const num = Number(nominal);
  if (isNaN(num) || num <= 0) return { valid: false, message: 'Nominal harus lebih dari 0' };
  if (num < 1000) return { valid: false, message: 'Nominal minimal Rp 1.000' };
  if (num > 10000000) return { valid: false, message: 'Nominal maksimal Rp 10.000.000' };
  return { valid: true };
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password minimal 6 karakter' };
  }
  return { valid: true };
};

export const validateNama = (nama) => {
  if (!nama || nama.trim().length < 2) {
    return { valid: false, message: 'Nama minimal 2 karakter' };
  }
  return { valid: true };
};

export const validateQRData = (data) => {
  try {
    const parsed = JSON.parse(data);
    if (!parsed.kenclengId || !parsed.userId) return null;
    return parsed;
  } catch {
    return null;
  }
};