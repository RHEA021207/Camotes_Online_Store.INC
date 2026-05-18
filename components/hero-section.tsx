"use client"

import Image from "next/image"
import { ChevronDown, MapPin } from "lucide-react"

interface HeroSectionProps {
  onBrowseServices: () => void
}

export function HeroSection({ onBrowseServices }: HeroSectionProps) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - White Office/Interior */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-background.jpg"
          alt="Camotes Online Store Background"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-white/20" />
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
            className="rounded-full shadow-2xl border-4 border-white"
          />
        </div>

        {/* Main Greeting - Centered */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#293241] mb-6 text-balance drop-shadow-lg">
          Hello! How can I help you?
        </h1>

        {/* Location Badge */}
        <a
          href="https://maps.app.goo.gl/282URg4zgBT9yvAR7"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#293241]/80 text-white px-4 py-2 rounded-full mb-8 hover:bg-[#293241] transition-colors"
        >
          <MapPin className="h-4 w-4" />
          <span className="text-sm">Adela, Poro, Camotes, Cebu</span>
        </a>
      </div>

      {/* Scroll Down Indicator - Fixed at Bottom */}
      <button
        onClick={onBrowseServices}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#293241] hover:text-[#3d5a80] transition-colors cursor-pointer group"
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
