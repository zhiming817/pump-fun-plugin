import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../layout/Navbar.jsx';
import Footer from '../layout/Footer.jsx';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div 
        className="fixed inset-0 z-0 animate-[pan_60s_linear_infinite]"
        style={{
          backgroundImage: 'url(/backgroundHome.png)',
          backgroundSize: '120%',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
          <div className={`text-center max-w-5xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="AntiDump Logo" 
                  className="w-48 h-48 md:w-64 md:h-64 animate-bounce drop-shadow-2xl"
                />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-orange-300 via-yellow-300 to-red-300 text-transparent bg-clip-text drop-shadow-[0_4px_20px_rgba(255,165,0,0.8)]">
              ANTIDUMP
            </h1>
            
            <p className="text-2xl md:text-4xl font-bold mb-8 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
              Welcome to the Main Event
            </p>
            
            <p className="text-xl md:text-2xl mb-12 text-white max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] [text-shadow:_1px_1px_3px_rgb(0_0_0_/_90%)] leading-relaxed">
              The Formula 1 circuit for crypto tokens. Where the highest-stakes competition meets the most spectacular victories.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/oaths/create">
                <button className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2">
                  Launch Your Token
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </Link>
              <Link to="/projects">
                <button className="px-8 py-4 text-lg font-bold bg-white/90 hover:bg-white text-gray-900 rounded-lg shadow-xl transform hover:scale-105 transition-all border-2 border-white">
                  Browse Projects
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* The Opportunity Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border-4 border-yellow-400 p-8 md:p-12 transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <svg className="w-12 h-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">The Opportunity</h2>
              </div>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                Pump.fun created a beautiful, chaotic, free market. We love that freedom.
              </p>
              <p className="text-xl md:text-2xl text-gray-700 mt-4 leading-relaxed">
                But with <span className="font-bold text-red-600">thousands of tokens daily</span>, good projects are lost in the noise. 
                The opportunity is buried.
              </p>
            </div>
          </div>
        </section>

        {/* The Solution Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-2xl border-4 border-orange-500 p-8 md:p-12 transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <svg className="w-12 h-12 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-600 to-red-600 text-transparent bg-clip-text">
                  The Premium Arena
                </h2>
              </div>
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed mb-6">
                We don't restrict the chaos, we build a <span className="font-bold text-orange-600">premium arena</span> on top of it.
              </p>
              <div className="bg-white/80 rounded-lg p-6 mb-6 border-2 border-orange-300">
                <p className="text-2xl font-bold text-orange-700 mb-2">
                  30 SOL Credibility Bond
                </p>
                <p className="text-lg text-gray-700">
                  Developers voluntarily post a bond to enter, signaling skin-in-the-game.
                </p>
              </div>
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed">
                For users, this creates a <span className="font-bold text-red-600">curated, high-stakes game</span>. 
                The same free market, just filtered for conviction.
              </p>
            </div>
          </div>
        </section>

        {/* The Engine Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-2xl border-4 border-yellow-500 p-8 md:p-12 transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <svg className="w-12 h-12 text-yellow-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 text-transparent bg-clip-text">
                  The Matthew Effect
                </h2>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 italic">
                "To those who have, more will be given."
              </p>
              <div className="space-y-6">
                <div className="bg-white/80 rounded-lg p-6 border-l-4 border-yellow-500">
                  <p className="text-xl text-gray-800">
                    <span className="font-bold text-yellow-700">First:</span> The losers' bonds are used to market-buy the winner.
                  </p>
                </div>
                <div className="bg-white/80 rounded-lg p-6 border-l-4 border-orange-500">
                  <p className="text-xl text-gray-800">
                    <span className="font-bold text-orange-700">Second:</span> Our Betting Layer unleashes a massive <span className="font-bold">"Victory Pump"</span> from the betting pool onto that same winner.
                  </p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="text-2xl font-black text-red-600">
                  This is a guaranteed, on-chain spectacle of success.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Game Theory Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-2xl border-4 border-red-500 p-8 md:p-12 transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-600 to-orange-600 text-transparent bg-clip-text">
                  Interlocking Game Theory
                </h2>
              </div>
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed mb-8">
                Our true moat is <span className="font-bold text-red-600">interlocking game theory</span>. 
                We've engineered an ecosystem where self-interest creates unstoppable upward pressure.
              </p>
              
              <div className="space-y-6">
                <div className="bg-white/90 rounded-lg p-6 border-2 border-red-300">
                  <h3 className="text-2xl font-bold text-red-700 mb-3">The Bettor's Dilemma</h3>
                  <p className="text-lg text-gray-700">
                    A bettor's capital is locked. If their chosen project dips, their only rational move is to become its champion—buying the dip and rallying the community to protect their bet.
                  </p>
                </div>

                <div className="bg-white/90 rounded-lg p-6 border-2 border-orange-300">
                  <h3 className="text-2xl font-bold text-orange-700 mb-3">The Automatic Counter-Force</h3>
                  <p className="text-lg text-gray-700 mb-4">
                    As a token nears graduation, fearful holders might panic-sell. But our system creates automatic defense:
                  </p>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">🎯</span>
                      <span>The locked-in bettors buy to defend their position</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">🤖</span>
                      <span>New arbitrage bots see a discounted token about to win, so they buy</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">💪</span>
                      <span>A strong developer, seeing this coordinated support, is incentivized to make the final push</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg p-6 text-center">
                  <p className="text-2xl md:text-3xl font-black text-white">
                    Panic-selling is met with coordinated buying.
                    <br />
                    This is why our projects pump. 🚀
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Vision Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900 to-red-900 rounded-2xl shadow-2xl border-4 border-yellow-400 p-8 md:p-12 transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-4 mb-6 justify-center">
                <svg className="w-16 h-16 text-yellow-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <h2 className="text-4xl md:text-5xl font-black text-yellow-400">
                  The F1 Circuit
                </h2>
              </div>
              <div className="text-center space-y-6">
                <p className="text-2xl md:text-3xl text-white leading-relaxed">
                  Pump.fun is the chaotic open road.
                </p>
                <p className="text-2xl md:text-3xl text-white leading-relaxed font-bold">
                  We built the Formula 1 circuit on top of it.
                </p>
                <p className="text-xl md:text-2xl text-yellow-200 leading-relaxed">
                  An arena for the highest-stakes competition and the most spectacular victories.
                </p>
                <div className="py-8">
                  <p className="text-3xl md:text-4xl font-black text-white mb-2">
                    We didn't replace the casino.
                  </p>
                  <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text">
                    We built the VIP room.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <img 
                src="/logo.png" 
                alt="AntiDump Logo" 
                className="w-32 h-32 md:w-40 md:h-40 animate-bounce drop-shadow-2xl"
              />
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] [text-shadow:_3px_3px_6px_rgb(0_0_0_/_90%)]">
              Ready to Enter the Arena?
            </h2>
            <p className="text-2xl md:text-3xl mb-12 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] [text-shadow:_2px_2px_4px_rgb(0_0_0_/_90%)]">
              Join the most exclusive token launch platform on Solana
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/oaths/create">
                <button className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg shadow-2xl transform hover:scale-110 transition-all flex items-center gap-3">
                  Launch Now
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C10.5 2 9.5 3.5 9.5 5C9.5 6.5 10.5 8 12 8C13.5 8 14.5 6.5 14.5 5C14.5 3.5 13.5 2 12 2Z" />
                  </svg>
                </button>
              </Link>
              <Link to="/projects">
                <button className="px-12 py-6 text-xl font-bold bg-white/95 hover:bg-white text-gray-900 rounded-lg shadow-2xl transform hover:scale-110 transition-all border-2 border-white flex items-center gap-3">
                  Explore Projects
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
