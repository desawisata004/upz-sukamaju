import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../../services/kenclengService';
import { formatRupiah, formatProgress, initials } from '../../utils/formatter';
import { Spinner } from '../common/Loading';

const medals = ['🥇', '🥈', '🥉'];

const LeaderboardItem = ({ item, rank }) => {
  const progress = formatProgress(item.saldo, item.target);
  const isTop3 = rank < 3;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        background: isTop3 ? 'linear-gradient(135deg, #fff 0%, var(--kuning-pale) 100%)' : '#fff',
        borderRadius: 'var(--radius-md)',
        boxShadow: isTop3 ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        border: isTop3 ? `1px solid var(--kuning)22` : '1px solid transparent',
        animation: 'fadeIn 0.3s ease',
        animationDelay: `${rank * 0.05}s`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isTop3 ? '1.4rem' : '0.9rem',
          fontWeight: 700,
          color: 'var(--abu-500)',
          flexShrink: 0,
        }}
      >
        {isTop3 ? medals[rank] : rank + 1}
      </div>

      <div
        style={{
          width: 40,
          height: 40,
          background: isTop3
            ? 'linear-gradient(135deg, var(--hijau), var(--hijau-muda))'
            : 'var(--abu-100)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: isTop3 ? '#fff' : 'var(--abu-500)',
          flexShrink: 0,
        }}
      >
        {initials(item.nama)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.9rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.nama}
          </span>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--hijau)',
              flexShrink: 0,
            }}
          >
            {formatRupiah(item.saldo)}
          </span>
        </div>

        <div
          style={{
            height: 6,
            background: 'var(--abu-100)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: progress >= 100
                ? 'var(--kuning)'
                : 'linear-gradient(90deg, var(--hijau), var(--hijau-muda))',
              borderRadius: 3,
              transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 3,
            fontSize: '0.7rem',
            color: 'var(--abu-400)',
          }}
        >
          <span>Target: {formatRupiah(item.target)}</span>
          <span style={{ fontWeight: 600, color: progress >= 100 ? 'var(--kuning)' : 'var(--abu-400)' }}>
            {progress}%
            {progress >= 100 && ' 🎉'}
          </span>
        </div>
      </div>
    </div>
  );
};

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spinner />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🏆</div>
        <p style={{ fontWeight: 600, color: 'var(--abu-700)' }}>Belum ada data leaderboard</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((item, idx) => (
        <LeaderboardItem key={item.id} item={item} rank={idx} />
      ))}
    </div>
  );
};

export default Leaderboard;