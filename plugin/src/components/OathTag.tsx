/**
 * OathTag Component
 *
 * Displays the oath status of a meme coin with visual indicators.
 * This component is injected next to each meme coin card on pump.fun.
 *
 * Features:
 * - Color-coded badge based on oath status (green for oathed, orange for not oathed)
 * - Tooltip showing detailed information on hover
 * - Centralization risk percentage for non-oathed coins
 * - Smooth animations and transitions
 */

import React, { useState } from 'react';
import type { OathTagProps } from '@/types';

/**
 * OathTag component displays the oath status badge
 */
export const OathTag: React.FC<OathTagProps> = ({ status, centralizationRisk }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  /**
   * Get badge styling based on oath status
   */
  const getBadgeStyle = () => {
    switch (status) {
      case 'OATHED':
        return {
          bg: 'bg-oathed',
          text: 'text-white',
          label: '✓ Oathed',
          icon: '🛡️',
        };
      case 'NOT_OATHED':
        return {
          bg: 'bg-notOathed',
          text: 'text-white',
          label: '⚠ High Risk',
          icon: '⚠️',
        };
      case 'UNKNOWN':
        return {
          bg: 'bg-gray-400',
          text: 'text-white',
          label: '? Unknown',
          icon: '❓',
        };
      case 'ERROR':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          label: '✗ Error',
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
      className="oath-tag-container relative inline-block oath-fade-in"
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
          oath-shadow
          flex items-center gap-1.5
          ${status === 'OATHED' ? 'oath-pulse' : ''}
        `}
      >
        <span className="text-sm">{style.icon}</span>
        <span>{style.label}</span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="
            absolute top-full left-0 mt-2
            bg-gray-900 text-white
            px-4 py-3 rounded-lg
            text-sm
            z-[100000]
            oath-shadow-lg
            min-w-[220px]
            max-w-[300px]
            oath-fade-in
          "
          style={{ whiteSpace: 'normal' }}
        >
          {/* Arrow */}
          <div
            className="absolute bottom-full left-4"
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

            {status === 'OATHED' && (
              <>
                <div className="text-gray-300 text-xs">
                  This project has joined the Graduation Oath Program
                </div>
                <div className="text-oathed-light text-xs font-medium">
                  ✓ Committed to No Rug Pull
                </div>
              </>
            )}

            {status === 'NOT_OATHED' && (
              <>
                <div className="text-gray-300 text-xs">
                  This project has not joined the oath program
                </div>
                {centralizationRisk !== undefined && (
                  <div className="text-notOathed-light text-xs font-medium">
                    Centralization Risk: {formatRisk(centralizationRisk)}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  Invest with caution
                </div>
              </>
            )}

            {status === 'UNKNOWN' && (
              <div className="text-gray-300 text-xs">
                Unable to retrieve project information
              </div>
            )}

            {status === 'ERROR' && (
              <div className="text-gray-300 text-xs">
                Query service temporarily unavailable
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OathTag;

