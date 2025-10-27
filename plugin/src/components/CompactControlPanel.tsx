/**
 * CompactControlPanel Component
 * 
 * 右侧紧凑的控制面板，包含主按钮和其他功能按钮
 */

import React from 'react';

interface CompactControlPanelProps {
  websiteUrl: string;
}

export const CompactControlPanel: React.FC<CompactControlPanelProps> = ({ websiteUrl }) => {
  const handleMainClick = () => {
    window.open(websiteUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePlaceholderClick = (buttonName: string) => {
    console.log(`${buttonName} clicked - Feature coming soon!`);
  };

  return (
    <div className="compact-control-panel">
      {/* 主按钮 - 跳转到网站 */}
      <button className="control-btn control-btn-primary" onClick={handleMainClick}>
        <span className="btn-icon">🛡️</span>
        <span className="btn-text">
          <div className="btn-title">Oath Tracker</div>
          <div className="btn-subtitle">View All →</div>
        </span>
      </button>

      {/* 占位按钮 1 */}
      <button
        className="control-btn control-btn-secondary"
        onClick={() => handlePlaceholderClick('Analytics')}
        title="Coming Soon"
      >
        <span className="btn-icon">📊</span>
        <span className="btn-text-small">Analytics</span>
      </button>

      {/* 占位按钮 2 */}
      <button
        className="control-btn control-btn-secondary"
        onClick={() => handlePlaceholderClick('Alerts')}
        title="Coming Soon"
      >
        <span className="btn-icon">🔔</span>
        <span className="btn-text-small">Alerts</span>
      </button>

      {/* 占位按钮 3 */}
      <button
        className="control-btn control-btn-secondary"
        onClick={() => handlePlaceholderClick('Settings')}
        title="Coming Soon"
      >
        <span className="btn-icon">⚙️</span>
        <span className="btn-text-small">Settings</span>
      </button>
    </div>
  );
};

export default CompactControlPanel;

