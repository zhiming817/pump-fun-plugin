/**
 * MainBanner Component
 *
 * A prominent banner displayed on pump.fun to promote the oath tracking website.
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
    <div className="oath-banner-container w-full oath-fade-in">
      {/* Banner Container */}
      <div
        className="
          bg-gradient-to-r from-oathed to-oathed-dark
          text-white
          px-6 py-4
          rounded-lg
          oath-shadow-lg
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
            <h3 className="text-lg font-bold">Graduation Oath Program</h3>
            <p className="text-sm text-oathed-light">
              Discover safe Meme projects and avoid Rug Pull risks
            </p>
          </div>
        </div>

        {/* Right Side: CTA Button */}
        <button
          onClick={handleClick}
          className="
            bg-white text-oathed-dark
            px-6 py-3
            rounded-lg
            font-bold text-sm
            hover:bg-oathed-light hover:text-oathed-dark
            transition-all duration-200
            hover:scale-105
            oath-shadow
            whitespace-nowrap
            cursor-pointer
          "
          aria-label="Visit oath tracker website"
        >
          View All Oathed Projects →
        </button>
      </div>

      {/* Optional: Subtle info text */}
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500">
          Powered by Oath Tracker | Protecting Your Investment Safety
        </p>
      </div>
    </div>
  );
};

export default MainBanner;

