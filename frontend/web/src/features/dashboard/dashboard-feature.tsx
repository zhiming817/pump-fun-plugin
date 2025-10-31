import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Shield, TrendingUp, Zap, Target, Trophy, Flame } from 'lucide-react'
import { Link } from 'react-router'
import { useEffect, useState } from 'react'

export default function DashboardFeature() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/backgroundHome.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="fixed inset-0 z-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className={`text-center max-w-5xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <Flame className="w-24 h-24 text-orange-500 animate-bounce" />
                <div className="absolute inset-0 animate-pulse">
                  <Flame className="w-24 h-24 text-yellow-400 opacity-50" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400 text-transparent bg-clip-text drop-shadow-2xl">
              ANTIDUMP
            </h1>
            
            <p className="text-2xl md:text-4xl font-bold mb-8 text-white drop-shadow-lg">
              Welcome to the Main Event
            </p>
            
            <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto drop-shadow-md">
              The Formula 1 circuit for crypto tokens. Where the highest-stakes competition meets the most spectacular victories.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/oath/create">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-2xl transform hover:scale-105 transition-all">
                  Launch Your Token
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/oath">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/90 hover:bg-white shadow-xl transform hover:scale-105 transition-all">
                  Browse Projects
                </Button>
              </Link>
            </div>

            {/* Video Section */}
            <div className="max-w-4xl mx-auto">
              <Card className="overflow-hidden shadow-2xl bg-white/95 backdrop-blur border-4 border-orange-500">
                <CardContent className="p-2">
                  <video 
                    className="w-full rounded-lg"
                    controls
                    poster="/logo.png"
                  >
                    <source src="/HomepageVideo.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* The Opportunity Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-white/95 backdrop-blur shadow-2xl border-4 border-yellow-400 transform hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <Target className="w-12 h-12 text-yellow-600" />
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900">The Opportunity</h2>
                </div>
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                  Pump.fun created a beautiful, chaotic, free market. We love that freedom.
                </p>
                <p className="text-xl md:text-2xl text-gray-700 mt-4 leading-relaxed">
                  But with <span className="font-bold text-red-600">thousands of tokens daily</span>, good projects are lost in the noise. 
                  The opportunity is buried.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* The Solution Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 shadow-2xl border-4 border-orange-500 transform hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <Shield className="w-12 h-12 text-orange-600" />
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
              </CardContent>
            </Card>
          </div>
        </section>

        {/* The Engine Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 shadow-2xl border-4 border-yellow-500 transform hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <Zap className="w-12 h-12 text-yellow-600 animate-pulse" />
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
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Game Theory Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 shadow-2xl border-4 border-red-500 transform hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <TrendingUp className="w-12 h-12 text-red-600" />
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
              </CardContent>
            </Card>
          </div>
        </section>

        {/* The Vision Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-purple-900 to-red-900 shadow-2xl border-4 border-yellow-400 transform hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6 justify-center">
                  <Trophy className="w-16 h-16 text-yellow-400 animate-pulse" />
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
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <Flame className="w-32 h-32 text-orange-500 animate-bounce" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-white drop-shadow-2xl">
              Ready to Enter the Arena?
            </h2>
            <p className="text-2xl md:text-3xl mb-12 text-white/90 drop-shadow-lg">
              Join the most exclusive token launch platform on Solana
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/oath/create">
                <Button size="lg" className="text-xl px-12 py-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-2xl transform hover:scale-110 transition-all">
                  Launch Now
                  <Flame className="ml-3 w-6 h-6" />
                </Button>
              </Link>
              <Link to="/oath">
                <Button size="lg" variant="outline" className="text-xl px-12 py-8 bg-white/95 hover:bg-white shadow-2xl transform hover:scale-110 transition-all">
                  Explore Projects
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
