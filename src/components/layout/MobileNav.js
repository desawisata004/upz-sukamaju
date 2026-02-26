import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, QrCode, History, Trophy, User } from 'lucide-react';

const MobileNav = () => {
  const router = useRouter();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Beranda' },
    { path: '/scan', icon: QrCode, label: 'Scan' },
    { path: '/riwayat', icon: History, label: 'Riwayat' },
    { path: '/leaderboard', icon: Trophy, label: 'Peringkat' },
    { path: '/profil', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;