/**
 * Validasi ID Kencleng
 * @param {string} id - ID Kencleng
 * @returns {boolean} - Valid atau tidak
 */
export const validateKenclengId = (id) => {
  const pattern = /^[A-Z0-9-]{5,20}$/i;
  return pattern.test(id);
};

/**
 * Validasi nomor HP Indonesia
 * @param {string} phone - Nomor HP
 * @returns {boolean} - Valid atau tidak
 */
export const validatePhoneNumber = (phone) => {
  const pattern = /^(08|\+628)[0-9]{8,12}$/;
  return pattern.test(phone);
};

/**
 * Validasi email
 * @param {string} email - Alamat email
 * @returns {boolean} - Valid atau tidak
 */
export const validateEmail = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

/**
 * Validasi jumlah setoran
 * @param {number|string} amount - Jumlah setoran
 * @returns {boolean} - Valid atau tidak
 */
export const validateAmount = (amount) => {
  const num = Number(amount);
  return !isNaN(num) && num > 0 && num <= 10000000; // Maks 10jt
};

/**
 * Validasi tidak boleh kosong
 * @param {string} value - Nilai yang dicek
 * @returns {boolean} - Valid atau tidak
 */
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};