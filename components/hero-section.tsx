"use client"

import Image from "next/image"
import { ChevronDown, MapPin } from "lucide-react"

interface HeroSectionProps {
  onBrowseServices: () => void
}

export function HeroSection({ onBrowseServices }: HeroSectionProps) {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#293241]">
      {/* Background Wrapper */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/images/hero-background.jpg"
          alt="Camotes Online Store Background"
          fill
          className="object-cover object-center opacity-15 mix-blend-lighten"
          priority
        />
        {/* Soft radial vignette to ensure text stays clear */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#293241]/50 via-[#293241]/20 to-[#293241]" />
      </div>
      
      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
        {/* Logo */}
        <div className="mb-6">
          <Image
            src="/images/main-logo.jpg"
            alt="Camotes Online Store"
            width={130}
            height={130}
            className="rounded-full shadow-2xl border-4 border-[#3d5a80]/50"
          />
        </div>

        {/* Main Greeting */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
          Hello! How can I help you?
        </h1>

        {/* Subtitle */}
        <p className="text-[#e0fbfc]/90 text-base md:text-lg max-w-xl mb-8 drop-shadow-sm">
          Your neighborhood digital ledger. Buy now, pay over time. Track every peso (₱) with confidence.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={onBrowseServices}
            className="bg-[#ee6c4d] hover:bg-[#f07f65] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95"
          >
            Browse Services
          </button>
          <button
            className="bg-[#3d5a80]/50 hover:bg-[#3d5a80]/80 text-white font-semibold px-6 py-3 rounded-xl transition-all border border-[#98c1d9]/20 active:scale-95"
          >
            Find My Account
          </button>
        </div>

        {/* Location Badge */}
        <a
          href="https://maps.app.goo.gl/282URg4zgBT9yvAR7"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#3d5a80]/40 text-white px-4 py-1.5 rounded-full hover:bg-[#3d5a80]/60 transition-colors border border-[#98c1d9]/10"
        >
          <MapPin className="h-3.5 w-3.5 text-[#ee6c4d]" />
          <span className="text-xs font-medium text-slate-200">Adela, Poro, Camotes, Cebu</span>
        </a>
      </div>

      {/* Scroll Down Indicator */}
      <button
        onClick={onBrowseServices}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-400 hover:text-[#98c1d9] transition-colors cursor-pointer group"
        aria-label="Scroll to services"
      >
        <span className="text-xs uppercase tracking-widest font-semibold opacity-70 group-hover:opacity-100">
          Browse Services
        </span>
        <ChevronDown className="h-5 w-5 animate-bounce text-[#ee6c4d]" />
      </button>
    </section>
  )
}