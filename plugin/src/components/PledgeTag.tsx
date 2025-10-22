/**
 * PledgeTag Component
 *
 * Displays the pledge status of a meme coin with visual indicators.
 * This component is injected next to each meme coin card on pump.fun.
 *
 * Features:
 * - Color-coded badge based on pledge status (green for pledged, orange for not pledged)
 * - Tooltip showing detailed information on hover
 * - Centralization risk percentage for non-pledged coins
 * - Smooth animations and transitions
 */

import React, { useState } from 'react';
import type { PledgeTagProps } from '@/types';

/**
 * PledgeTag component displays the pledge status badge
 */
export const PledgeTag: React.FC<PledgeTagProps> = ({ status, centralizationRisk }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  /**
   * Get badge styling based on pledge status
   */
  const getBadgeStyle = () => {
    switch (status) {
      case 'PLEDGED':
        return {
          bg: 'bg-pledged',
          text: 'text-white',
          label: '✓ 已保障',
          icon: '🛡️',
        };
      case 'NOT_PLEDGED':
        return {
          bg: 'bg-notPledged',
          text: 'text-white',
          label: '⚠ 高风险',
          icon: '⚠️',
        };
      case 'UNKNOWN':
        return {
          bg: 'bg-gray-400',
          text: 'text-white',
          label: '? 未知',
          icon: '❓',
        };
      case 'ERROR':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          label: '✗ 查询失败',
          icon: '✗',
        };
      default:
        return {
          bg: 'bg-gray-400',
          text: 'text-white',
          label: '...',
          icon: '⏳',
        };
    }
  };

  const style = getBadgeStyle();

  /**
   * Format centralization risk as percentage
   */
  const formatRisk = (risk?: number): string => {
    if (risk === undefined) return 'N/A';
    return `${Math.round(risk * 100)}%`;
  };

  return (
    <div
      className="pledge-tag-container relative inline-block pledge-fade-in"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Main Badge */}
      <div
        className={`
          ${style.bg} ${style.text}
          px-3 py-1.5 rounded-full
          text-xs font-semibold
          cursor-pointer
          transition-all duration-200
          hover:scale-105
          pledge-shadow
          flex items-center gap-1.5
          ${status === 'PLEDGED' ? 'pledge-pulse' : ''}
        `}
      >
        <span className="text-sm">{style.icon}</span>
        <span>{style.label}</span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="
            absolute top-full left-1/2 transform -translate-x-1/2 mt-2
            bg-gray-900 text-white
            px-4 py-3 rounded-lg
            text-sm
            z-50
            pledge-shadow-lg
            min-w-[200px]
            pledge-fade-in
          "
          style={{ whiteSpace: 'nowrap' }}
        >
          {/* Arrow */}
          <div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '6px solid #111827',
            }}
          />

          {/* Content */}
          <div className="space-y-2">
            <div className="font-bold text-base">{style.label}</div>

            {status === 'PLEDGED' && (
              <>
                <div className="text-gray-300 text-xs">
                  该项目已参与毕业誓言计划
                </div>
                <div className="text-pledged-light text-xs font-medium">
                  ✓ 承诺不会Rug Pull
                </div>
              </>
            )}

            {status === 'NOT_PLEDGED' && (
              <>
                <div className="text-gray-300 text-xs">
                  该项目未参与毕业誓言
                </div>
                {centralizationRisk !== undefined && (
                  <div className="text-notPledged-light text-xs font-medium">
                    中心化风险: {formatRisk(centralizationRisk)}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  建议谨慎投资
                </div>
              </>
            )}

            {status === 'UNKNOWN' && (
              <div className="text-gray-300 text-xs">
                无法获取该项目信息
              </div>
            )}

            {status === 'ERROR' && (
              <div className="text-gray-300 text-xs">
                查询服务暂时不可用
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PledgeTag;

