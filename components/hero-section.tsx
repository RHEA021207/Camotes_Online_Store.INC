"use client"

import Image from "next/image"
import { ChevronDown, MapPin } from "lucide-react"

interface HeroSectionProps {
  onBrowseServices: () => void
}

export function HeroSection({ onBrowseServices }: HeroSectionProps) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#293241]">
     {/* Background Image Wrapper */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-background.jpg"
          alt="Camotes Online Store Background"
          fill
          className="object-cover object-center pointer-events-none"
          priority
        />
        {/* Dark Overlay Mask: Force opacity so the white background doesn't blind the user */}
        <div className="absolute inset-0 bg-[#293241]/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#293241]/40 via-[#293241]/80 to-[#293241]" />
      </div>
      
      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
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

        {/* Main Greeting - Switched text color to white to stand out against the dark overlay */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-balance drop-shadow-lg">
          Hello! How can I help you?
        </h1>

        {/* Location Badge */}
        <a
          href="https://maps.app.goo.gl/282URg4zgBT9yvAR7"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#3d5a80]/80 text-white px-4 py-2 rounded-full mb-8 hover:bg-[#3d5a80] transition-colors border border-[#98c1d9]/20"
        >
          <MapPin className="h-4 w-4" />
          <span className="text-sm">Adela, Poro, Camotes, Cebu</span>
        </a>
      </div>

      {/* Scroll Down Indicator - Switched text color to white / slate color */}
      <button
        onClick={onBrowseServices}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-300 hover:text-[#98c1d9] transition-colors cursor-pointer group"
        aria-label="Scroll to services"
      >
        <span className="text-sm font-medium opacity-80 group-hover:opacity-100">
          Browse Services
        </span>
        <ChevronDown className="h-8 w-8 animate-bounce" />
      </button>
    </section>
  )
}