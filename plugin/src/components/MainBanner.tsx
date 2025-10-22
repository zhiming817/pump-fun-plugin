/**
 * MainBanner Component
 *
 * A prominent banner displayed on pump.fun to promote the pledge tracking website.
 * This component serves as a call-to-action to drive traffic to the official website.
 *
 * Features:
 * - Eye-catching gradient design
 * - Clear call-to-action button
 * - Responsive and non-intrusive positioning
 * - Smooth entrance animation
 */

import React from 'react';
import type { MainBannerProps } from '@/types';

/**
 * MainBanner component for website promotion
 */
export const MainBanner: React.FC<MainBannerProps> = ({ websiteUrl }) => {
  /**
   * Handle button click to open official website
   */
  const handleClick = () => {
    window.open(websiteUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="pledge-banner-container w-full pledge-fade-in">
      {/* Banner Container */}
      <div
        className="
          bg-gradient-to-r from-pledged to-pledged-dark
          text-white
          px-6 py-4
          rounded-lg
          pledge-shadow-lg
          flex items-center justify-between
          gap-4
          hover:scale-[1.02]
          transition-transform duration-300
        "
      >
        {/* Left Side: Icon and Text */}
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="text-4xl">🛡️</div>

          {/* Text Content */}
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold">毕业誓言计划</h3>
            <p className="text-sm text-pledged-light">
              发现安全的Meme项目，避免Rug Pull风险
            </p>
          </div>
        </div>

        {/* Right Side: CTA Button */}
        <button
          onClick={handleClick}
          className="
            bg-white text-pledged-dark
            px-6 py-3
            rounded-lg
            font-bold text-sm
            hover:bg-pledged-light hover:text-pledged-dark
            transition-all duration-200
            hover:scale-105
            pledge-shadow
            whitespace-nowrap
            cursor-pointer
          "
          aria-label="Visit pledge tracker website"
        >
          查看所有誓言项目 →
        </button>
      </div>

      {/* Optional: Subtle info text */}
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500">
          由 Pledge Tracker 提供支持 | 保护您的投资安全
        </p>
      </div>
    </div>
  );
};

export default MainBanner;

