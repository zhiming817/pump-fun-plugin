"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import chaosVisualization from "@/public/images/chaos-visualization.gif"
import interlockingGears from "@/public/images/interlocking-gears.png"
import f1Circuit from "@/public/images/f1-circuit.png"
import matthewEffect from "@/public/images/matthew-effect.png"
import matthewEffectLeft from "@/public/images/matthew-effect-left.png"
import vipArena from "@/public/images/vip-arena.png"

const slides = [
  {
    id: 0,
    title: "ANTIDUMP",
    subtitle: "The Premium Arena for Meme Coins",
    content: "Welcome to the Main Event",
    type: "title",
    timing: "0:00 - 0:20",
  },
  {
    id: 1,
    title: "The Opportunity",
    subtitle: "Pump.fun created a beautiful, chaotic, free market",
    quote: "We love that freedom. But with thousands of tokens daily, good projects are lost in the noise.",
    highlight: "The opportunity is buried.",
    type: "opportunity",
    timing: "0:00 - 0:20",
    imageNeeded: "chaos-visualization.png",
    imageDescription:
      "A chaotic visualization showing thousands of tokens flooding the market - use abstract particles, noise, or a crowded token grid to represent overwhelming chaos",
  },
  {
    id: 2,
    title: "The Premium Arena",
    subtitle: "We don't restrict the chaos, we build a premium arena on top of it",
    points: [
      "Developers voluntarily post a 30 SOL Credibility Bond",
      "Signals skin-in-the-game",
      "Creates a curated, high-stakes game",
      "The same free market, just filtered for conviction",
    ],
    type: "solution",
    timing: "0:20 - 0:50",
    imageNeeded: "vip-arena.png",
    imageDescription:
      "A premium VIP arena concept - think velvet ropes, spotlights, or a golden stage elevated above chaos. Contrast luxury vs chaos",
  },
  {
    id: 3,
    title: "The Matthew Effect",
    subtitle: '"To those who have, more will be given"',
    mechanism: [
      { label: "Graduation Derby", desc: "High-stakes competition inside the arena" },
      { label: "Losers' Bonds", desc: "Market-buy the winner" },
      { label: "Victory Pump", desc: "Betting pool unleashes massive pump" },
      { label: "Result", desc: "Guaranteed, on-chain spectacle of success" },
    ],
    type: "engine",
    timing: "0:50 - 1:30",
    imageNeeded: "matthew-effect.png",
    imageDescription:
      "Visual representation of wealth concentration - a pyramid or funnel showing resources flowing upward to the winner, or a snowball effect diagram",
  },
  {
    id: 4,
    title: "Interlocking Game Theory",
    subtitle: "Our true moat: self-interest creates unstoppable upward pressure",
    gameTheory: [
      {
        title: "The Bettor's Dilemma",
        desc: "Capital is locked. If their project dips, their only rational move is to become its champion—buying the dip and rallying the community.",
      },
      {
        title: "The Public Stress-Test",
        desc: "As a token nears graduation, panic-selling is met with automatic counter-force:",
      },
      {
        title: "Coordinated Defense",
        points: [
          "Locked-in bettors buy to defend their position",
          "Arbitrage bots see discounted token about to win",
          "Strong developers make the final push",
        ],
      },
    ],
    conclusion: "We've engineered a system where panic-selling is met with coordinated buying.",
    type: "gametheory",
    timing: "1:30 - 2:15",
    imageNeeded: "interlocking-gears.png",
    imageDescription:
      "Interlocking gears or forces diagram showing how different actors (bettors, devs, bots) create coordinated upward pressure. Think mechanical precision meets game theory",
  },
  {
    id: 5,
    title: "The F1 Circuit",
    subtitle: "Pump.fun is the chaotic open road. We built the Formula 1 circuit on top of it.",
    vision: [
      "An arena for the highest-stakes competition",
      "The most spectacular victories",
      "We didn't replace the casino",
      "We built the VIP room",
    ],
    cta: "Welcome to the main event.",
    type: "vision",
    timing: "2:15 - 2:45",
    imageNeeded: "f1-circuit.png",
    imageDescription:
      "Split-screen comparison: chaotic open road vs pristine F1 racing circuit. Show the contrast between unstructured chaos and premium, organized competition",
  },
]

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        nextSlide()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        prevSlide()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentSlide])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height
        setMousePosition({ x, y })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const slide = slides[currentSlide]

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#1a0b2e]">
      {/* Animated Background Pattern */}
      <div
        className="absolute inset-0 opacity-10 animate-slow-pan"
        style={{
          backgroundImage:
            "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/background4.png-vLfvhRr3C6MkAb7GXN0RJy9OKq9gag.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-orange-500/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 md:px-16">
        <div
          className="transition-all duration-700 ease-out"
          style={{
            transform: `translateX(${mousePosition.x * 10}px) translateY(${mousePosition.y * 10}px)`,
          }}
        >
          {slide.type === "title" && (
            <div className="flex flex-col items-center gap-8 text-center">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo3.png-wOhu5Agmfnlw5ymIGiYojpEZ5Mlf7t.jpeg"
                alt="Antidump Logo"
                className="h-64 w-64 object-contain animate-pulse-slow hover:scale-110 transition-transform duration-500"
              />
              <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 animate-gradient">
                {slide.title}
              </h1>
              <p className="text-4xl font-semibold text-orange-400">{slide.subtitle}</p>
              <p className="text-2xl text-gray-300 italic">{slide.content}</p>
            </div>
          )}

          {slide.type === "opportunity" && (
            <div className="max-w-6xl w-full">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="mb-8 flex items-center gap-4">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo3.png-wOhu5Agmfnlw5ymIGiYojpEZ5Mlf7t.jpeg"
                      alt="Logo"
                      className="h-16 w-16 object-contain"
                    />
                    <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                      {slide.title}
                    </h2>
                  </div>
                  <p className="text-3xl text-orange-300 mb-6 leading-relaxed">{slide.subtitle}</p>
                  <p className="text-2xl text-gray-300 mb-8 leading-relaxed">{slide.quote}</p>
                  <p className="text-4xl font-bold text-red-400 animate-pulse-slow">{slide.highlight}</p>
                </div>
                <div className="relative h-96 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border-2 border-orange-500/30 flex items-center justify-center backdrop-blur-sm hover:border-orange-500/60 transition-all duration-300">
                  {/* <div className="text-center p-8">
                    <p className="text-gray-400 text-lg mb-4">📸 Image Needed:</p>
                    <p className="text-orange-300 font-semibold mb-2">{slide.imageNeeded}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{slide.imageDescription}</p>
                    <p className="text-gray-500 text-xs mt-4">Place in: /public/images/{slide.imageNeeded}</p>
                  </div> */}
                  <img src={chaosVisualization.src} alt="Chaos Visualization" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          )}

          {slide.type === "solution" && (
            <div className="max-w-6xl w-full">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative h-96 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border-2 border-orange-500/30 flex items-center justify-center backdrop-blur-sm hover:border-orange-500/60 transition-all duration-300 order-2 md:order-1">
                  {/* <div className="text-center p-8">
                    <p className="text-gray-400 text-lg mb-4">📸 Image Needed:</p>
                    <p className="text-orange-300 font-semibold mb-2">{slide.imageNeeded}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{slide.imageDescription}</p>
                    <p className="text-gray-500 text-xs mt-4">Place in: /public/images/{slide.imageNeeded}</p>
                  </div> */}
                  <img src={vipArena.src} alt="VIP Arena" className="w-full h-full object-contain" />
                </div>
                <div className="order-1 md:order-2">
                  <div className="mb-8 flex items-center gap-4">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo3.png-wOhu5Agmfnlw5ymIGiYojpEZ5Mlf7t.jpeg"
                      alt="Logo"
                      className="h-16 w-16 object-contain"
                    />
                    <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                      {slide.title}
                    </h2>
                  </div>
                  <p className="text-2xl text-orange-300 mb-8 leading-relaxed">{slide.subtitle}</p>
                  <div className="space-y-4">
                    {slide.points?.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 text-xl text-gray-200 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-orange-500/20 hover:border-orange-500/50 hover:bg-white/10 transition-all duration-300 hover:translate-x-2"
                      >
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-sm">
                          {index + 1}
                        </span>
                        <p className="leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {slide.type === "engine" && (
            <div className="max-w-6xl w-full">
              <div className="mb-12 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo3.png-wOhu5Agmfnlw5ymIGiYojpEZ5Mlf7t.jpeg"
                    alt="Logo"
                    className="h-16 w-16 object-contain"
                  />
                  <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                    {slide.title}
                  </h2>
                </div>
                <p className="text-3xl text-orange-300 italic">{slide.subtitle}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {slide.mechanism?.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-xl p-6 border-2 border-orange-500/30 hover:border-orange-500/60 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold">
                        {index + 1}
                      </span>
                      <h3 className="text-2xl font-bold text-orange-400">{item.label}</h3>
                    </div>
                    <p className="text-xl text-gray-300 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="relative h-64 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border-2 border-orange-500/30 flex items-center justify-center backdrop-blur-sm hover:border-orange-500/60 transition-all duration-300">
                {/* <div className="text-center p-8">
                  <p className="text-gray-400 text-lg mb-4">📸 Image Needed:</p>
                  <p className="text-orange-300 font-semibold mb-2">{slide.imageNeeded}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{slide.imageDescription}</p>
                  <p className="text-gray-500 text-xs mt-4">Place in: /public/images/{slide.imageNeeded}</p>
                </div> */}

                <img src={matthewEffectLeft.src} alt="Matthew Effect" className="w-full h-full object-contain" />
                <img src={matthewEffect.src} alt="Matthew Effect" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {slide.type === "gametheory" && (
            <div className="max-w-6xl w-full">
              <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo3.png-wOhu5Agmfnlw5ymIGiYojpEZ5Mlf7t.jpeg"
                    alt="Logo"
                    className="h-16 w-16 object-contain"
                  />
                  <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                    {slide.title}
                  </h2>
                </div>
                <p className="text-2xl text-orange-300">{slide.subtitle}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  {slide.gameTheory?.slice(0, 2).map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-xl p-6 border-2 border-orange-500/30 hover:border-orange-500/60 transition-all duration-300"
                    >
                      <h3 className="text-2xl font-bold text-orange-400 mb-3">{item.title}</h3>
                      <p className="text-lg text-gray-300 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl p-6 border-2 border-green-500/30">
                    <h3 className="text-2xl font-bold text-green-400 mb-3">{slide.gameTheory?.[2].title}</h3>
                    <ul className="space-y-2">
                      {slide.gameTheory?.[2].points?.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 text-lg text-gray-300">
                          <span className="text-green-400 mt-1">→</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="relative h-full min-h-[300px] bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border-2 border-orange-500/30 flex items-center justify-center backdrop-blur-sm hover:border-orange-500/60 transition-all duration-300">
                    {/* <div className="text-center p-8">
                      <p className="text-gray-400 text-lg mb-4">📸 Image Needed:</p>
                      <p className="text-orange-300 font-semibold mb-2">{slide.imageNeeded}</p>
                      <p className="text-gray-300 text-sm leading-relaxed">{slide.imageDescription}</p>
                      <p className="text-gray-500 text-xs mt-4">Place in: /public/images/{slide.imageNeeded}</p>
                    </div> */}
                    <img src={interlockingGears.src} alt="Interlocking Gears" className="w-full h-full object-contain" />
                  </div>
                  <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-6 border-2 border-red-500/50">
                    <p className="text-xl font-bold text-red-300 text-center leading-relaxed">{slide.conclusion}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {slide.type === "vision" && (
            <div className="max-w-6xl w-full">
              <div className="mb-12 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo3.png-wOhu5Agmfnlw5ymIGiYojpEZ5Mlf7t.jpeg"
                    alt="Logo"
                    className="h-20 w-20 object-contain animate-pulse-slow"
                  />
                  <h2 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                    {slide.title}
                  </h2>
                </div>
                <p className="text-2xl text-orange-300 leading-relaxed max-w-4xl mx-auto">{slide.subtitle}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="relative h-80 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border-2 border-orange-500/30 flex items-center justify-center backdrop-blur-sm hover:border-orange-500/60 transition-all duration-300">
                  {/* <div className="text-center p-8">
                    <p className="text-gray-400 text-lg mb-4">📸 Image Needed:</p>
                    <p className="text-orange-300 font-semibold mb-2">{slide.imageNeeded}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{slide.imageDescription}</p>
                    <p className="text-gray-500 text-xs mt-4">Place in: /public/images/{slide.imageNeeded}</p>
                  </div>  */}
                  <img src={f1Circuit.src} alt="F1 Circuit" className="w-full h-full object-contain" />
                </div>

                <div className="space-y-4">
                  {slide.vision?.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-lg p-4 border border-orange-500/30 hover:border-orange-500/60 hover:translate-x-2 transition-all duration-300"
                    >
                      <p className="text-xl text-gray-200 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 animate-pulse-slow">
                  <p className="text-4xl font-bold text-white mb-2">ANTIDUMP</p>
                  <p className="text-2xl text-white/90">{slide.cta}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-between px-8">
        <Button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          variant="ghost"
          size="lg"
          className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 disabled:opacity-30 transition-all hover:scale-110"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 rounded-full transition-all hover:scale-110 ${
                index === currentSlide
                  ? "w-12 bg-gradient-to-r from-orange-500 to-red-500"
                  : "w-3 bg-gray-600 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>

        <Button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          variant="ghost"
          size="lg"
          className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 disabled:opacity-30 transition-all hover:scale-110"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

      {/* Slide Counter & Timing */}
      <div className="absolute top-8 right-8 z-20 text-right">
        <div className="text-orange-400 text-xl font-semibold">
          {currentSlide + 1} / {slides.length}
        </div>
        <div className="text-gray-400 text-sm mt-1">{slide.timing}</div>
      </div>

      {/* Instructions */}
      <div className="absolute top-8 left-8 z-20 text-gray-400 text-sm">Use arrow keys or click to navigate</div>
    </div>
  )
}
