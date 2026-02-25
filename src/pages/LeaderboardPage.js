// src/pages/LeaderboardPage.js
import React from 'react';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import Leaderboard from '../components/kencleng/Leaderboard';

const LeaderboardPage = () => (
  <div className="app-layout">
    <Header title="Peringkat Warga" subtitle="Siapa yang paling rajin menabung?" />
    <div className="page-content">
      <Leaderboard />
    </div>
    <MobileNav />
  </div>
);

export default LeaderboardPage;
