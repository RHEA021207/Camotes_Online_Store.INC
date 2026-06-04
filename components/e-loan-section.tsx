"use client"

import { useState, useEffect } from "react"
import { useServices } from "@/context/ServiceContext"
import { Calculator, AlertTriangle, CheckCircle, Lock, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { supabase } from "@/lib/supabaseClient"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ELoanSectionProps {
  trustScore: "new" | "good" | "excellent"
  onAddToCart: (item: { id: string; name: string; price: number; quantity: number }) => void
  onInquire: () => void
  onBack?: () => void
  isFullPage?: boolean
}

const paymentFrequencies = [
  { id: "senimana", label: "Senimana (Weekly)", weeks: 4 },
  { id: "kinsenas", label: "Kinsenas (15 days)", periods: 2 },
  { id: "binuwan", label: "Binuwan (Monthly)", months: 1 },
]

const loanAmounts = [
  { value: 1000, minTrust: "new" },
  { value: 2000, minTrust: "new" },
  { value: 3000, minTrust: "good" },
  { value: 5000, minTrust: "good" },
  { value: 7000, minTrust: "excellent" },
  { value: 10000, minTrust: "excellent" },
]

const interestRate = 0.02 // 2% interest rate

export function ELoanSection({ trustScore, onAddToCart, onInquire, onBack, isFullPage = false }: ELoanSectionProps) {
  const { penaltyFeePercentage } = useServices()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [selectedFrequency, setSelectedFrequency] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<number>(3)
  const [customTermType, setCustomTermType] = useState<"months" | "days">("months")
  const [customTermValue, setCustomTermValue] = useState<string>("")
  const [useCustomTerm, setUseCustomTerm] = useState(false)
  const [loanAmountsList, setLoanAmountsList] = useState(loanAmounts)
  const [loading, setLoading] = useState(true)

  // Fetch e-loan service details from Supabase
  useEffect(() => {
    const fetchELoanService = async () => {
      try {
        const { data, error } = await supabase
          .from('store_services')
          .select('*')
          .eq('category', 'e-loan')
          .single()

        if (error) {
          console.error('Error fetching e-loan service:', error)
        } else if (data) {
          // You can extend store_services table to include loan amounts
          // For now, we keep the default loanAmounts
          console.log('E-loan service fetched:', data)
        }
      } catch (err) {
        console.error('Supabase fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchELoanService()
  }, [])

  const canAccessAmount = (minTrust: string) => {
    if (minTrust === "new") return true
    if (minTrust === "good") return trustScore === "good" || trustScore === "excellent"
    if (minTrust === "excellent") return trustScore === "excellent"
    return false
  }

  // Get effective term in months
  const getEffectiveTerm = () => {
    if (useCustomTerm && customTermValue) {
      const value = parseInt(customTermValue)
      if (customTermType === "days") {
        return value / 30 // Convert days to months
      }
      return value
    }
    return selectedTerm
  }

  // Calculate total using Simple Interest Formula: Total = Principal × (1 + (rate × time))
  const calculateTotal = () => {
    if (!selectedAmount) return 0
    const time = getEffectiveTerm()
    return selectedAmount * (1 + interestRate * time)
  }

  const calculatePerPayment = () => {
    const total = calculateTotal()
    if (!selectedFrequency || !total) return 0
    
    const freq = paymentFrequencies.find(f => f.id === selectedFrequency)
    if (!freq) return 0

    const termInMonths = getEffectiveTerm()

    if (freq.id === "senimana") {
      return total / (termInMonths * 4) // 4 weeks per month
    } else if (freq.id === "kinsenas") {
      return total / (termInMonths * 2) // 2 periods per month
    } else {
      return total / termInMonths
    }
  }

  return (
    <section className={`py-12 bg-[#3d5a80]/30 ${isFullPage ? 'min-h-screen' : ''}`} id="e-loan">
      <div className="container mx-auto px-4">
        {isFullPage && onBack && (
          <Button
            variant="ghost"
            className="text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80] mb-6"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        )}

        <div className="flex items-center gap-3 justify-center mb-2">
          <Calculator className="h-8 w-8 text-[#98c1d9]" />
          <h2 className="text-3xl font-bold text-[#e0fbfc]">E-Loan Calculator</h2>
        </div>
        <p className="text-[#98c1d9] text-center mb-8">
          Quick cash loans with flexible payment options
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Loan Selection */}
          <Card className="bg-[#3d5a80] border-[#98c1d9]/30">
            <CardHeader>
              <CardTitle className="text-[#e0fbfc]">Select Loan Amount</CardTitle>
              <CardDescription className="text-[#98c1d9]">
                Your Trust Score: 
                <span className={`ml-2 font-bold ${
                  trustScore === "excellent" ? "text-green-400" :
                  trustScore === "good" ? "text-blue-400" : "text-yellow-400"
                }`}>
                  {trustScore.charAt(0).toUpperCase() + trustScore.slice(1)}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {loanAmountsList.map((loan) => {
                  const isAccessible = canAccessAmount(loan.minTrust)
                  return (
                    <button
                      key={loan.value}
                      disabled={!isAccessible}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedAmount === loan.value
                          ? "border-[#ee6c4d] bg-[#ee6c4d]/20"
                          : isAccessible
                          ? "border-[#98c1d9]/30 hover:border-[#98c1d9]"
                          : "border-[#98c1d9]/10 opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() => isAccessible && setSelectedAmount(loan.value)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#ee6c4d] font-bold text-lg">
                          P{loan.value.toLocaleString()}
                        </span>
                        {!isAccessible && <Lock className="h-4 w-4 text-[#98c1d9]/50" />}
                      </div>
                      {!isAccessible && (
                        <p className="text-xs text-[#98c1d9]/50 mt-1">
                          Requires {loan.minTrust} payer status
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="space-y-2">
                <Label className="text-[#e0fbfc]">Payment Frequency</Label>
                <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                  <SelectTrigger className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#3d5a80] border-[#98c1d9]">
                    {paymentFrequencies.map((freq) => (
                      <SelectItem 
                        key={freq.id} 
                        value={freq.id}
                        className="text-[#e0fbfc] focus:bg-[#293241] focus:text-[#e0fbfc]"
                      >
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Term Selection - 1 to 12 months */}
              <div className="space-y-2">
                <Label className="text-[#e0fbfc]">Term (Months)</Label>
                <Select 
                  value={useCustomTerm ? "custom" : selectedTerm.toString()} 
                  onValueChange={(v) => {
                    if (v === "custom") {
                      setUseCustomTerm(true)
                    } else {
                      setUseCustomTerm(false)
                      setSelectedTerm(parseInt(v))
                    }
                  }}
                >
                  <SelectTrigger className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#3d5a80] border-[#98c1d9] max-h-64">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((term) => (
                      <SelectItem 
                        key={term} 
                        value={term.toString()}
                        className="text-[#e0fbfc] focus:bg-[#293241] focus:text-[#e0fbfc]"
                      >
                        {term} {term === 1 ? "month" : "months"} {term === 12 && "(1 year)"}
                      </SelectItem>
                    ))}
                    <SelectItem 
                      value="custom"
                      className="text-[#ee6c4d] focus:bg-[#293241] focus:text-[#ee6c4d]"
                    >
                      Other (Custom)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Term Input */}
              {useCustomTerm && (
                <div className="space-y-3 p-4 bg-[#293241] rounded-lg">
                  <Label className="text-[#e0fbfc]">Custom Duration</Label>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      placeholder="Enter value"
                      value={customTermValue}
                      onChange={(e) => setCustomTermValue(e.target.value)}
                      className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] flex-1"
                      min={1}
                    />
                    <RadioGroup
                      value={customTermType}
                      onValueChange={(v) => setCustomTermType(v as "months" | "days")}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="months" id="months" className="border-[#98c1d9] text-[#ee6c4d]" />
                        <Label htmlFor="months" className="text-[#e0fbfc]">Months</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="days" id="days" className="border-[#98c1d9] text-[#ee6c4d]" />
                        <Label htmlFor="days" className="text-[#e0fbfc]">Days</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {customTermType === "days" && customTermValue && (
                    <p className="text-xs text-[#98c1d9]">
                      = {(parseInt(customTermValue) / 30).toFixed(2)} months
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loan Summary */}
          <Card className="bg-[#3d5a80] border-[#98c1d9]/30">
            <CardHeader>
              <CardTitle className="text-[#e0fbfc]">Loan Summary</CardTitle>
              <CardDescription className="text-[#98c1d9]">
                Interest Rate: 2% per month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedAmount && selectedFrequency ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#98c1d9]">Principal Amount</span>
                      <span className="text-[#ee6c4d] font-bold text-xl">
                        P{selectedAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#98c1d9]">
                        Interest ({getEffectiveTerm().toFixed(1)} months @ 2%)
                      </span>
                      <span className="text-[#e0fbfc]">
                        P{(calculateTotal() - selectedAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-[#98c1d9]/30 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#e0fbfc] font-bold">Total Amount</span>
                        <span className="text-[#ee6c4d] font-bold text-2xl">
                          P{calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-[#293241] p-3 rounded-lg">
                      <span className="text-[#98c1d9]">Per Payment</span>
                      <span className="text-[#e0fbfc] font-bold">
                        P{calculatePerPayment().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#293241] p-4 rounded-lg space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-[#98c1d9]">
                        A {penaltyFeePercentage}% penalty fee will be applied automatically if payment exceeds the due date.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      className="w-full bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white"
                      onClick={() => onAddToCart({
                        id: `e-loan-${selectedAmount}-${selectedFrequency}-${getEffectiveTerm()}`,
                        name: `E-Loan P${selectedAmount} (${selectedFrequency})`,
                        price: calculateTotal(),
                        quantity: 1,
                      })}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-[#e0fbfc] border-[#98c1d9] hover:bg-[#293241]"
                      onClick={onInquire}
                    >
                      Inquire Right Away
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-[#98c1d9]/50 mx-auto mb-4" />
                  <p className="text-[#98c1d9]">
                    Select an amount and payment frequency to see your loan summary
                  </p>
                </div>
              )}

              {/* Formula Display */}
              <div className="text-xs text-[#98c1d9]/70 text-center border-t border-[#98c1d9]/30 pt-4">
                <p>Formula: Total = Principal x (1 + (rate x time))</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Score Info */}
        {trustScore === "new" && (
          <div className="mt-8 max-w-2xl mx-auto">
            <Card className="bg-[#293241] border-[#98c1d9]/30">
              <CardContent className="flex items-center gap-4 py-4">
                <CheckCircle className="h-8 w-8 text-[#98c1d9] shrink-0" />
                <div>
                  <p className="text-[#e0fbfc] font-medium">Build Your Trust Score</p>
                  <p className="text-sm text-[#98c1d9]">
                    Pay on time to unlock higher loan amounts. Good payers get access to P3k-5k, excellent payers to P7k-10k!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}
