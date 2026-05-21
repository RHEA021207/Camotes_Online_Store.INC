"use client"

import Image from "next/image"
import { ChevronDown, MapPin } from "lucide-react"

interface HeroSectionProps {
  onBrowseServices: () => void
}

export function HeroSection({ onBrowseServices }: HeroSectionProps) {
  return (
    <section className="relative h-screen w-screen flex items-center justify-center overflow-hidden bg-[#1d2430]">
      {/* Background Image Wrapper */}
      <div className="absolute inset-0 z-0 select-none">
        <Image
          src="/images/hero-background.jpg"
          alt="Camotes Online Store Background"
          fill
          className="object-cover object-center pointer-events-none opacity-20" // Brings out the details smoothly without blinding
          priority
        />
        {/* Dark subtle overlay to unify text contrast across the image elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1d2430]/60 via-[#1d2430]/80 to-[#1d2430]" />
      </div>
      
      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/images/main-logo.jpg"
            alt="Camotes Online Store"
            width={140}
            height={140}
            className="rounded-full shadow-2xl border-4 border-[#3d5a80]/50"
          />
        </div>

        {/* Main Greeting */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-balance tracking-tight drop-shadow-md">
          Hello! How can I help you?
        </h1>

        {/* Subtitle / Description */}
        <p className="text-[#e0fbfc]/80 text-base md:text-lg max-w-xl mb-6 text-balance">
          Your neighborhood digital ledger. Buy now, pay over time. Track every peso (₱) with confidence.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={onBrowseServices}
            className="bg-[#ee6c4d] hover:bg-[#f07f65] text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95"
          >
            Browse Services
          </button>
          <button
            className="bg-[#3d5a80]/60 hover:bg-[#3d5a80]/90 text-white font-medium px-6 py-3 rounded-xl transition-all border border-[#98c1d9]/30 active:scale-95"
          >
            Find My Account
          </button>
        </div>

        {/* Location Badge */}
        <a
          href="https://maps.app.goo.gl/282URg4zgBT9yvAR7"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#293241]/80 text-white px-4 py-2 rounded-full hover:bg-[#293241] transition-colors border border-[#98c1d9]/10"
        >
          <MapPin className="h-4 w-4 text-[#ee6c4d]" />
          <span className="text-xs font-medium tracking-wide text-slate-200">Adela, Poro, Camotes, Cebu</span>
        </a>
      </div>

      {/* Scroll Down Indicator */}
      <button
        onClick={onBrowseServices}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 hover:text-[#98c1d9] transition-colors cursor-pointer group"
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