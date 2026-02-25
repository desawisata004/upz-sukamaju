import QRCode from 'qrcode';

export const generateQRData = (kenclengId, userId, nama) => {
  return JSON.stringify({ 
    kenclengId, 
    userId, 
    nama, 
    v: 1 
  });
};

export const generateQRCodeDataURL = async (data) => {
  try {
    const url = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1a6b3c',
        light: '#fafaf8',
      },
      errorCorrectionLevel: 'H',
    });
    return url;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return null;
  }
};

export const generateQRCodeCanvas = async (canvasRef, data) => {
  try {
    await QRCode.toCanvas(canvasRef, data, {
      width: 250,
      margin: 2,
      color: {
        dark: '#1a6b3c',
        light: '#fafaf8',
      },
    });
  } catch (err) {
    console.error('Error generating QR canvas:', err);
  }
};