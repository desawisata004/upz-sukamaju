import React from 'react';
import { useRouter } from 'next/router';
import { Menu, ArrowLeft, Bell } from 'lucide-react';

const Header = ({ title, showBack = false, showMenu = false }) => {
  const router = useRouter();

  return (
    <header className="bg-white border-b sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={() => router.back()} className="touch-target">
              <ArrowLeft size={24} />
            </button>
          )}
          {showMenu && (
            <button className="touch-target">
              <Menu size={24} />
            </button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        
        <button className="touch-target relative">
          <Bell size={24} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
};

export default Header;