"use client"

import { useState } from "react"
import { X, UserPlus, LogIn, ShieldCheck } from "lucide-react"

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (phoneNumber: string, fullName: string) => void
}

export default function AccountModal({ isOpen, onClose, onLoginSuccess }: AccountModalProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic Validation Rules
    if (!phoneNumber) {
      setError("Please enter your Phone Number.")
      return
    }

    if (isRegistering && !fullName) {
      setError("Please fill in your Full Name.")
      return
    }

    // Temporary Success Callback (Will connect to database triggers later)
    const activeName = isRegistering ? fullName : "Valued Customer"
    onLoginSuccess(phoneNumber, activeName)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#1e2530] border border-[#3d5a80] rounded-2xl p-6 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Absolute Close Control */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-[#98c1d9] hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Branding Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#ee6c4d]/10 border border-[#ee6c4d]/30 flex items-center justify-center text-[#ee6c4d]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black tracking-tight">
            {isRegistering ? "Register Customer Profile" : "Find Your Account Ledger"}
          </h2>
          <p className="text-xs text-[#98c1d9]/70 max-w-xs mx-auto">
            {isRegistering 
              ? "Create a digital file to track your installments and processing requirements." 
              : "Enter your registered phone number to load your microfinance timeline."}
          </p>
        </div>

        {/* Input Interactive Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold p-2.5 rounded-lg text-center">
              {error}
            </div>
          )}

          {isRegistering && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#98c1d9] uppercase tracking-wider">Full Name (As shown on Valid ID)</label>
              <input
                type="text"
                placeholder="Juan Dela Cruz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#293241] border border-[#3d5a80] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#98c1d9]/30 focus:outline-none focus:border-[#ee6c4d] transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#98c1d9] uppercase tracking-wider">Phone / Mobile Number</label>
            <input
              type="tel"
              placeholder="09123456789"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-[#293241] border border-[#3d5a80] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#98c1d9]/30 focus:outline-none focus:border-[#ee6c4d] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#ee6c4d] hover:bg-[#d65a31] text-white font-bold py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 mt-2 text-sm"
          >
            {isRegistering ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {isRegistering ? "Create Profile Account" : "Access Personal Ledger"}
          </button>
        </form>

        {/* View Alternate Switch Link */}
        <div className="mt-6 pt-4 border-t border-[#3d5a80]/30 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering)
              setError("")
            }}
            className="text-xs text-[#98c1d9] hover:text-[#ee6c4d] transition-colors font-medium"
          >
            {isRegistering 
              ? "Already have an account setup? Access Ledger" 
              : "New Customer? Click here to register account parameters"}
          </button>
        </div>

      </div>
    </div>
  )
}