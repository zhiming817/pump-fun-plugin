/**
 * CompactRaceBar Component
 * 
 * 滚动时在顶部显示的紧凑型赛马横条
 * 只显示一个进度条，所有头像按进度排列
 */

import React, { useState, useEffect } from 'react';

interface MemeRaceData {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string;
  progress: number; // 0-100
  marketCap: string;
  holders: number;
  graduationTarget: string;
  priceChange?: number; // 价格变化百分比，用于判断是否闪烁
}

interface CompactRaceBarProps {
  websiteUrl: string;
}

export const CompactRaceBar: React.FC<CompactRaceBarProps> = ({ websiteUrl }) => {
  const [raceData, setRaceData] = useState<MemeRaceData[]>([]);
  const [hoveredMeme, setHoveredMeme] = useState<string | null>(null);
  const [flashingMemes, setFlashingMemes] = useState<Set<string>>(new Set());

  // Mock data - 实际应该从 API 获取
  useEffect(() => {
    const mockData: MemeRaceData[] = [
      {
        id: '1',
        name: 'Doge Supreme',
        symbol: 'DOGES',
        imageUrl: 'https://images.pump.fun/coin-image/j89isyuZqaQo2zrs68f5hzcmAn1VPffssZ5TZjjpump?variant=600x600&ipfs=bafybeie7al6n43wuytmukmfx3j6yvzr7i4ad3ftfb7j3txrap2jdz6d52i&src=https%3A%2F%2Fipfs.io%2Fipfs%2Fbafybeie7al6n43wuytmukmfx3j6yvzr7i4ad3ftfb7j3txrap2jdz6d52i',
        progress: 97,
        marketCap: '$1.2M',
        holders: 5420,
        graduationTarget: '$1.5M',
        priceChange: 0,
      },
      {
        id: '2',
        name: 'Pepe Moon',
        symbol: 'PEPEM',
        imageUrl: 'https://images.pump.fun/coin-image/6mkvaWGEW3Zi6AQNJBSgqwqjCi72muANsqNJNHohpump?variant=600x600&ipfs=bafybeifg7m75ui4mcslbvrj7kiwqms7qdkkkfugnq5ihsmpmbuyfnkgvz4&src=https%3A%2F%2Fpump.mypinata.cloud%2Fipfs%2Fbafybeifg7m75ui4mcslbvrj7kiwqms7qdkkkfugnq5ihsmpmbuyfnkgvz4',
        progress: 89,
        marketCap: '$890K',
        holders: 3210,
        graduationTarget: '$1.0M',
        priceChange: 0,
      },
      {
        id: '3',
        name: 'Shiba Rocket',
        symbol: 'SHIBAR',
        imageUrl: 'https://images.pump.fun/coin-image/8DjL975fphqz5nNCzw1b9MQHofe8yCT6RibUeEnLpump?variant=600x600&ipfs=QmeSzchzEPqCU1jwTnsipwcBAeH7S4bmVvFGfF65iA1BY1&src=https%3A%2F%2Fpump.mypinata.cloud%2Fipfs%2FQmeSzchzEPqCU1jwTnsipwcBAeH7S4bmVvFGfF65iA1BY1',
        progress: 76,
        marketCap: '$760K',
        holders: 2890,
        graduationTarget: '$1.0M',
        priceChange: 0,
      },
      {
        id: '4',
        name: 'Cat Coin',
        symbol: 'CATC',
        imageUrl: 'https://images.pump.fun/coin-image/9K3jvHHWFDqw8nfj8kCq1yokWAVMUDdb5Hui6mbfCdev?variant=600x600&ipfs=QmVD83k28cGa62F3Wo3TZfBzC3cCdqCXRJWNYCTDhgohB6&src=https%3A%2F%2Fpump.mypinata.cloud%2Fipfs%2FQmVD83k28cGa62F3Wo3TZfBzC3cCdqCXRJWNYCTDhgohB6',
        progress: 64,
        marketCap: '$640K',
        holders: 1950,
        graduationTarget: '$1.0M',
        priceChange: 0,
      },
      {
        id: '5',
        name: 'Moon Boy',
        symbol: 'MOONB',
        imageUrl: 'https://images.pump.fun/coin-image/G1Hkmn8Gz3H65faZjTEi19znuGqTkkvEwwNcVW7Cpump?variant=600x600&ipfs=bafybeifwevygn5mmnng2tursto3rdgmftdgriejtr4fh7jxzdbwqatlfhi&src=https%3A%2F%2Fpump.mypinata.cloud%2Fipfs%2Fbafybeifwevygn5mmnng2tursto3rdgmftdgriejtr4fh7jxzdbwqatlfhi',
        progress: 52,
        marketCap: '$520K',
        holders: 1450,
        graduationTarget: '$1.0M',
        priceChange: 0,
      },
    ];
    setRaceData(mockData);

    // 模拟实时进度更新和价格变化检测
    const interval = setInterval(() => {
      setRaceData((prev) =>
        prev.map((meme) => {
          const oldProgress = meme.progress;
          const progressChange = Math.random() * 2 - 0.5; // -0.5 to +1.5
          const newProgress = Math.min(100, Math.max(0, oldProgress + progressChange));
          const priceChange = ((newProgress - oldProgress) / oldProgress) * 100;

          // 如果价格变化超过阈值，触发闪烁
          if (Math.abs(priceChange) > 1) {
            setFlashingMemes((prev) => new Set(prev).add(meme.id));
            setTimeout(() => {
              setFlashingMemes((prev) => {
                const newSet = new Set(prev);
                newSet.delete(meme.id);
                return newSet;
              });
            }, 2000);
          }

          return {
            ...meme,
            progress: newProgress,
            priceChange,
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 找出进度最快的
  const fastestProgress = Math.max(...raceData.map((m) => m.progress));

  return (
    <div className="compact-race-bar">
      <div className="compact-race-header">
        <span className="compact-race-icon">🏁</span>
        <span className="compact-race-title">Race Live</span>
      </div>

      <div className="compact-progress-container">
        {/* 单一进度条 */}
        <div className="compact-progress-track">
          {/* 所有头像按进度排列 */}
          {raceData.map((meme, index) => (
            <div
              key={meme.id}
              className={`compact-avatar-pos ${
                flashingMemes.has(meme.id) ? 'flashing' : ''
              } ${meme.progress === fastestProgress ? 'fastest' : ''}`}
              style={{ left: `${meme.progress}%` }}
              onMouseEnter={() => setHoveredMeme(meme.id)}
              onMouseLeave={() => setHoveredMeme(null)}
            >
              <img src={meme.imageUrl} alt={meme.name} className="compact-avatar" />
              <div className="compact-rank">#{index + 1}</div>

              {/* Hover Tooltip */}
              {hoveredMeme === meme.id && (
                <div className="compact-tooltip">
                  <div className="compact-tooltip-header">
                    <strong>{meme.name}</strong>
                    <span className="compact-tooltip-symbol">${meme.symbol}</span>
                  </div>
                  <div className="compact-tooltip-progress">{meme.progress.toFixed(1)}%</div>
                  <div className="compact-tooltip-stats">
                    <div className="compact-stat">
                      <span className="compact-stat-label">Market Cap:</span>
                      <span className="compact-stat-value">{meme.marketCap}</span>
                    </div>
                    <div className="compact-stat">
                      <span className="compact-stat-label">Holders:</span>
                      <span className="compact-stat-value">{meme.holders.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    className="compact-view-button"
                    onClick={() => window.open(websiteUrl, '_blank')}
                  >
                    View Details
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 进度条底色 */}
        <div className="compact-progress-bg">
          <div
            className="compact-progress-fill"
            style={{ width: `${fastestProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CompactRaceBar;

