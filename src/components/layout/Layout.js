import React from 'react';
import { useRouter } from 'next/router';
import MobileNav from './MobileNav';
import Header from './Header';

const Layout = ({ children }) => {
  const router = useRouter();
  const hideNav = router.pathname === '/login';
  
  const getTitle = () => {
    if (router.pathname === '/') return 'Beranda';
    if (router.pathname === '/scan') return 'Scan QR';
    if (router.pathname === '/riwayat') return 'Riwayat';
    if (router.pathname === '/leaderboard') return 'Peringkat';
    if (router.pathname === '/profil') return 'Profil';
    if (router.pathname.includes('/rt/')) return 'Dashboard RT';
    return 'Kencleng Digital';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNav && <Header title={getTitle()} showBack={router.pathname !== '/'} />}
      <main className={!hideNav ? 'pb-20' : ''}>
        {children}
      </main>
      {!hideNav && <MobileNav />}
    </div>
  );
};

export default Layout;