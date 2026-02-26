# 🪣 Kencleng Digital

Aplikasi tabungan warga RT berbasis QR Code. Warga bisa melihat saldo kencleng mereka, pengurus RT bisa mencatat setoran via scan QR, dan admin bisa mengelola semua kencleng.

---

## ✨ Fitur Utama

| Fitur | Warga | Pengurus RT | Admin |
|-------|-------|-------------|-------|
| Lihat saldo kencleng | ✅ | ✅ | ✅ |
| Scan QR & input setoran | ✅ (diri sendiri) | ✅ (semua warga) | ✅ |
| Konfirmasi setoran | ❌ | ✅ | ✅ |
| Leaderboard | ✅ | ✅ | ✅ |
| Kelola kencleng | ❌ | ❌ | ✅ |
| Generate QR Code | ❌ | ❌ | ✅ |
| Dashboard analitik | ❌ | ✅ | ✅ |

---

## 🚀 Cara Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Setup Firebase

1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Aktifkan **Authentication** (Email/Password)
3. Aktifkan **Firestore Database**
4. Copy konfigurasi ke `.env.local`

```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

### 3. Setup Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['rt', 'admin'];
    }
    match /kencleng/{doc} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.userId
        || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['rt', 'admin'];
    }
    match /setoran/{doc} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['rt', 'admin'];
    }
    match /notifications/{doc} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Buat akun admin pertama

Daftarkan akun lewat Firebase Auth Console, lalu tambahkan dokumen user di Firestore:

```json
{
  "uid": "<user_uid>",
  "nama": "Admin RT",
  "email": "admin@rt.com",
  "role": "admin"
}
```

### 5. Jalankan

```bash
npm start
```

---

## 🏗️ Struktur File

```
src/
├── components/
│   ├── common/         # Button, Card, Alert, Loading
│   ├── kencleng/       # ScanQR, InputSetoran, RiwayatSetoran, Leaderboard
│   └── layout/         # Header, Footer, MobileNav
├── pages/
│   ├── index.js        # Home warga
│   ├── login.js        # Login
│   ├── ScanPage.js     # Halaman scan QR
│   ├── RiwayatPage.js  # Riwayat setoran
│   ├── LeaderboardPage.js
│   ├── ProfilPage.js
│   ├── rt/             # Dashboard & setoran RT
│   └── admin/          # Dashboard & kelola kencleng
├── services/
│   ├── firebase.js     # Firebase init
│   ├── auth.js         # Auth functions
│   ├── kenclengService.js  # CRUD kencleng & setoran
│   └── notificationService.js
├── hooks/
│   ├── useAuth.js      # Auth context & hook
│   ├── useKencleng.js  # Kencleng data hook
│   └── useRealtime.js  # Realtime listeners
├── utils/
│   ├── formatter.js    # Rupiah, tanggal, dll
│   ├── validator.js    # Form validation
│   └── qrGenerator.js  # QR code generator
└── config/
    └── constants.js    # App constants & routes
```

---

## 🚢 Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Pastikan menambahkan environment variables di Vercel dashboard.

---

## 🎨 Design System

- **Font display**: Instrument Serif (judul elegan)
- **Font body**: Plus Jakarta Sans (bersih & readable)
- **Hijau**: `#1a6b3c` — warna utama (kepercayaan, alam)
- **Kuning**: `#e8a020` — aksen pencapaian
- **Coklat**: `#5c3d1e` — bumi, lokal

---

## 📱 PWA Support

App ini mendukung instalasi sebagai Progressive Web App di Android/iOS.

---

Made with ❤️ untuk warga RT Indonesia
