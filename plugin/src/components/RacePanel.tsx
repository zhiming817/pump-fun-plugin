/**
 * RacePanel Component
 * 
 * 显示 5-10 个 meme 币的"毕业跑马图"
 * 实时展示各个币的毕业进度，最快的会有炫酷的闪烁效果
 */

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface MemeRaceData {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string;
  progress: number; // 0-100
  marketCap: string;
  holders: number;
  graduationTarget: string;
}

interface RacePanelProps {
  websiteUrl: string;
}
 
export const RacePanel: React.FC<RacePanelProps> = ({ websiteUrl }) => {
  const [raceData, setRaceData] = useState<MemeRaceData[]>([]);
  const [hoveredMeme, setHoveredMeme] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const totalTracks = 3; // 总共3个赛道

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
      },
    ];
    setRaceData(mockData);

    // 模拟实时进度更新
    const interval = setInterval(() => {
      setRaceData((prev) =>
        prev.map((meme) => ({
          ...meme,
          progress: Math.min(100, meme.progress + Math.random() * 0.5),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 找出进度最快的
  const fastestProgress = Math.max(...raceData.map((m) => m.progress));

  return (
    <div className="race-panel-container">
      {/* 标题区域 */}
      <div className="race-header">
        <div className="race-title-wrapper">
          <span className="race-icon">🏁</span>
          <div>
            <h2 className="race-title">Graduation Race Live</h2>
            <p className="race-subtitle">Track #{currentTrack + 1} • Watch meme coins racing to graduation</p>
          </div>
        </div>
      </div>

      {/* 跑道区域 */}
      <div className="race-tracks">
        {raceData.map((meme, index) => (
          <MemeRaceTrack
            key={meme.id}
            meme={meme}
            index={index}
            isFastest={meme.progress === fastestProgress}
            isHovered={hoveredMeme === meme.id}
            onHover={() => setHoveredMeme(meme.id)}
            onLeave={() => setHoveredMeme(null)}
            websiteUrl={websiteUrl}
          />
        ))}
      </div>

      {/* 底部切换按钮和说明 */}
      <div className="race-footer">
        <div className="race-track-switcher">
          {Array.from({ length: totalTracks }).map((_, index) => (
            <button
              key={index}
              className={`track-dot ${currentTrack === index ? 'active' : ''}`}
              onClick={() => setCurrentTrack(index)}
              aria-label={`Switch to track ${index + 1}`}
            >
              <span className="dot-inner" />
            </button>
          ))}
        </div>
        <span className="race-footer-text">
          🎯 First to reach 100% graduates to Raydium
        </span>
      </div>
    </div>
  );
};

// 单个跑道组件
interface MemeRaceTrackProps {
  meme: MemeRaceData;
  index: number;
  isFastest: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  websiteUrl: string;
}

const MemeRaceTrack: React.FC<MemeRaceTrackProps> = ({
  meme,
  index,
  isFastest,
  isHovered,
  onHover,
  onLeave,
  websiteUrl,
}) => {
  // 计算当前在哪个格子
  const currentSegment = Math.floor((meme.progress / 100) * 5);
  const isNearGraduation = meme.progress >= 95;
  
  // 用于获取头像元素的位置
  const avatarRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // 当鼠标悬浮时，计算 tooltip 的位置
  useEffect(() => {
    if (isHovered && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 12,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isHovered]);

  return (
    <div
      className={`race-track ${isFastest ? 'fastest' : ''} ${
        isNearGraduation ? 'near-graduation' : ''
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* 左侧：代币名字固定 */}
      <div className="race-meme-name">
        <div className="race-name-text">{meme.name}</div>
        <div className="race-symbol-text">${meme.symbol}</div>
      </div>

      {/* 右侧：进度条容器 */}
      <div className="race-progress-container">
        {/* 5格进度条 */}
        <div className="race-progress-bar">
          {[0, 1, 2, 3, 4].map((segmentIndex) => {
            let segmentClass = 'segment-gray'; // 未完成
            
            if (segmentIndex < currentSegment) {
              segmentClass = 'segment-green'; // 已完成
            } else if (segmentIndex === currentSegment) {
              segmentClass = 'segment-orange'; // 进行中
            }

            return (
              <div key={segmentIndex} className={`race-segment ${segmentClass}`}>
                <div className="segment-inner" />
              </div>
            );
          })}
        </div>
        
        {/* 头像跟随进度移动 */}
        <div 
          className="race-avatar-moving"
          style={{ left: `${meme.progress}%` }}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
          ref={avatarRef}
        >
          <div 
            className={`race-avatar-wrapper ${isHovered ? 'hovered' : ''}`}
            onClick={() => window.open(websiteUrl, '_blank', 'noopener,noreferrer')}
            style={{ cursor: 'pointer' }}
          >
            <img src={meme.imageUrl} alt={meme.name} className="race-avatar" />
            <div className="race-rank">#{index + 1}</div>
            {/* 进度百分比显示在头像旁边 */}
            <div className="race-progress-text">{meme.progress.toFixed(1)}%</div>
          </div>
        </div>
        
        {/* Hover Tooltip - 使用 Portal 渲染到 body */}
        {isHovered && ReactDOM.createPortal(
          <div 
            className="race-tooltip-portal"
            style={{
              position: 'fixed',
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: 'translateX(-50%)',
              zIndex: 2147483647,
            }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
          >
            <div className="race-tooltip-header">
              <strong>{meme.name}</strong>
              <span className="race-tooltip-symbol">${meme.symbol}</span>
            </div>
            <div className="race-tooltip-stats">
              <div className="race-stat">
                <span className="race-stat-label">Market Cap:</span>
                <span className="race-stat-value">{meme.marketCap}</span>
              </div>
              <div className="race-stat">
                <span className="race-stat-label">Holders:</span>
                <span className="race-stat-value">{meme.holders.toLocaleString()}</span>
              </div>
              <div className="race-stat">
                <span className="race-stat-label">Target:</span>
                <span className="race-stat-value">{meme.graduationTarget}</span>
              </div>
            </div>
            <button
              className="race-bet-button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(websiteUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              🎯 Bet on Antidump
            </button>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default RacePanel;

