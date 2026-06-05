"use client"

import Image from "next/image"
import { ChevronDown, MapPin } from "lucide-react"

interface HeroSectionProps {
  onBrowseServices: () => void
  onFindAccount?: () => void
}

export function HeroSection({ onBrowseServices, onFindAccount }: HeroSectionProps) {
  return (
    <section className="relative w-full h-[85vh] min-h-[85vh] overflow-hidden bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center">
      
      {/* ========================================================================= */}
      {/* BACKGROUND IMAGE ENGINE (FIXED VIZIBILITY) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none w-full h-full bg-cover bg-center bg-no-repeat">
        <Image
          src="/images/hero-background.jpg"
          alt="Camotes Online Store Background"
          fill
          className="object-cover object-center opacity-25 brightness-75 contrast-125"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#293241]/70 via-transparent to-[#111827]/90" />
      </div>
      {/* ========================================================================= */}

      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full max-w-6xl mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
            Hello! How can we help you today?
          </h1>
          <p className="text-lg md:text-xl text-[#98c1d9] max-w-2xl mx-auto">
            Your neighborhood digital ledger. Buy now, pay over time. Track every peso (₱) with confidence.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button
            onClick={onBrowseServices}
            className="bg-[#ee6c4d] hover:bg-[#f07f65] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95"
          >
            Browse Services
          </button>
          <button
            className="bg-[#3d5a80] bg-opacity-60 hover:bg-[#3d5a80] bg-opacity-90 text-white font-semibold px-6 py-3 rounded-xl transition-all border border-[#98c1d9] border-opacity-20 active:scale-95"
            onClick={onFindAccount}
          >
            Find My Account
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none" />

      <div
        onClick={() => {
          const servicesSection = document.getElementById('services') || document.getElementById('available-services') || document.querySelector('.services-grid')
          if (servicesSection) {
            servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer group select-none flex flex-col items-center gap-2"
      >
        <span className="text-sm font-medium tracking-wider text-[#98c1d9] group-hover:text-white uppercase transition-colors">
          Browse Services
        </span>
        <ChevronDown className="h-6 w-6 text-[#ee6c4d] animate-bounce group-hover:scale-110 transition-transform" />
      </div>
    </section>
  )
}