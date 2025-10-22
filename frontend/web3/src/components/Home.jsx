import React, { useState } from 'react';
import Navbar from '../layout/Navbar.jsx';
import Footer from '../layout/Footer.jsx';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 0,
      component: <HeroSlide />
    },
    {
      id: 1,
      component: <MarketGapSlide />
    },
    {
      id: 2,
      component: <HowItWorksSlide />
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />
      
      {/* Carousel Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Slides */}
        <div 
          className="h-full flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-full h-full">
              {slide.component}
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 z-10">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center transition-colors"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-8 bg-emerald-500' 
                    : 'w-2 bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center transition-colors"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Slide 1: Hero
function HeroSlide() {
  return (
    <div className="h-full flex items-center justify-center px-4">
      <div className="text-center max-w-4xl">
        {/* Logo Icon */}
        <div className="mb-8 flex justify-center">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-8 rounded-3xl shadow-2xl">
            <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-7xl font-bold text-white mb-6">
          AntiDump
        </h1>

        {/* Subtitle */}
        <h2 className="text-3xl text-gray-300 mb-8">
          From Information to Protection
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          The first protocol that structurally prevents rug pulls through creator commitment mechanisms
        </p>
      </div>
    </div>
  );
}

// Slide 2: Market Gap
function MarketGapSlide() {
  return (
    <div className="h-full flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full">
        <div className="mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">The Market Gap</h2>
          <p className="text-xl text-gray-400">
            Existing solutions tell you about risk. We eliminate it.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* GMGN.ai Card */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">GMGN.ai</h3>
                <p className="text-sm text-gray-400">On-chain Intelligence Platform</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Tracks smart money wallets and provides alpha signals. Shows you what to hunt.
            </p>
            <div className="flex items-start gap-2 text-sm text-red-400">
              <span>✗</span>
              <span>Read-only information • Cannot prevent rug pulls</span>
            </div>
          </div>

          {/* Photon / BullX Card */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Photon / BullX</h3>
                <p className="text-sm text-gray-400">High-Speed Trading Bots</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Snipe tokens at launch with maximum speed. Helps you react faster.
            </p>
            <div className="flex items-start gap-2 text-sm text-red-400">
              <span>✗</span>
              <span>Speed-focused • Reactive, not preventive</span>
            </div>
          </div>
        </div>

        {/* AntiDump Advantage */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 border border-emerald-500/30 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">Ø</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">AntiDump Advantage</h3>
              <p className="text-gray-300">
                We don't just identify risk—we architect safety into the protocol itself
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                <span>✓</span>
                <span>Structural Safety</span>
              </div>
              <p className="text-sm text-gray-400">
                Built-in creator commitment mechanisms
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                <span>✓</span>
                <span>Capital Protection</span>
              </div>
              <p className="text-sm text-gray-400">
                Failed stakes redirect to graduated tokens
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                <span>✓</span>
                <span>Trust by Design</span>
              </div>
              <p className="text-sm text-gray-400">
                Creators prove commitment before launch
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Slide 3: How It Works
function HowItWorksSlide() {
  return (
    <div className="h-full flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full">
        <div className="mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-xl text-gray-400">
            A simple, enforceable commitment protocol
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Step 1 */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="text-xl font-bold text-white">Creator Oath</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  Token creators stake SOL and commit to a graduation timeline (e.g., 3 hours to reach $80K market cap on pump.fun bonding curve)
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <h3 className="text-xl font-bold text-white">Success Path</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  If the token graduates within the timeframe, the creator's stake is returned. Trust is established through demonstrated commitment.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-xl font-bold text-white">Failure Protection</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  If graduation fails, staked SOL is forfeited and used to purchase already-graduated tokens, protecting community capital.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-white">4</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-bold text-white">Revenue Model</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  Protocol captures a portion of forfeited stakes as fees. Remaining funds reward top holders of graduated tokens, creating aligned incentives.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Economic Flywheel */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-3">The Economic Flywheel</h3>
          <p className="text-gray-300">
            Serious creators prove commitment through stakes. Failed projects fund successful ones. Top holders are rewarded. 
            The protocol captures sustainable revenue. Everyone wins except rug pullers.
          </p>
        </div>
      </div>
    </div>
  );
}
