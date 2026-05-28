"use client"

import { useState } from "react"
import { X, LogIn, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { CUSTOMER_TABLE } from "@/lib/constants"

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (customer: any) => void
}

export default function AccountModal({ isOpen, onClose, onLoginSuccess }: AccountModalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username.trim() || !password) {
      setError("Please enter username and password.")
      return
    }

    try {
      const { data, error: qryErr } = await supabase
        .from(CUSTOMER_TABLE)
        .select('*')
        .eq('username', username.trim())
        .eq('password', password)
        .limit(1)
        .maybeSingle()

      if (qryErr) {
        console.error('Supabase customer lookup error', qryErr)
        setError('Database Error Details: ' + JSON.stringify(qryErr))
        return
      }

      if (!data) {
        setError('No matching account found. Please contact store staff to create your account.')
        return
      }

      // Success: return the customer record and clear any error state
      setError("")
      onLoginSuccess(data)
      onClose()
    } catch (err) {
      console.error(err)
      setError('Unexpected error while checking credentials.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#1e2530] border border-[#3d5a80] rounded-2xl p-6 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#98c1d9] hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#ee6c4d]/10 border border-[#ee6c4d]/30 flex items-center justify-center text-[#ee6c4d]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black tracking-tight">Access Personal Ledger</h2>
          <p className="text-xs text-[#98c1d9]/70 max-w-xs mx-auto">Enter the Username and Password provided by store admin to unlock your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold p-2.5 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#98c1d9] uppercase tracking-wider">Username</label>
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#293241] border border-[#3d5a80] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#98c1d9]/30 focus:outline-none focus:border-[#ee6c4d] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#98c1d9] uppercase tracking-wider">Password</label>
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#293241] border border-[#3d5a80] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#98c1d9]/30 focus:outline-none focus:border-[#ee6c4d] transition-colors"
            />
          </div>

          <button type="submit" className="w-full bg-[#ee6c4d] hover:bg-[#d65a31] text-white font-bold py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 mt-2 text-sm">
            <LogIn className="h-4 w-4" />
            Access Personal Ledger
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#3d5a80]/30 text-center text-xs text-[#98c1d9]">
          Accounts are created by store admin only. Contact staff to create an account.
        </div>
      </div>
    </div>
  )
}