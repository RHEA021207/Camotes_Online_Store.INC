"use client"

import { useState, useEffect } from "react"
import { ShoppingBasket, Truck, Store, ArrowLeft, Edit2, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabaseClient"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BugasSectionProps {
  freeDeliveryEvent: boolean
  isAdmin?: boolean // Added admin flag prop
  onAddToCart: (item: { 
    id: string
    name: string
    price: number
    quantity: number
    deliveryMode: string
    deliveryFee: number
    paymentMode: string
  }) => void
  onAddToTimelineDirectly: (
    name: string, 
    totalAmount: number, 
    customDueDate: string, 
    type: "purchase" | "loan"
  ) => void
  onBack?: () => void
  isFullPage?: boolean
}

const quantities = [
  { kg: 5, label: "5 kl" },
  { kg: 10, label: "10 kl" },
  { kg: 25, label: "25 kl" },
  { kg: 50, label: "50 kl" },
]

const paymentModes = [
  { id: "cash", label: "Cash" },
  { id: "senimana", label: "Senimana (Weekly)" },
  { id: "kinsenas", label: "Kinsenas (15 days)" },
  { id: "binuwan", label: "Binuwan (Monthly)" },
]

export function BugasSection({ 
  freeDeliveryEvent, 
  isAdmin = false,
  onAddToCart, 
  onAddToTimelineDirectly, 
  onBack, 
  isFullPage = false 
}: BugasSectionProps) {
  // Admin-editable state metrics
  const [pricePerKg, setPricePerKg] = useState<number>(59.99)
  const [deliveryFeeBase, setDeliveryFeeBase] = useState<number>(50)
  const [monthlyInterestRate, setMonthlyInterestRate] = useState<number>(0.05) // 5%
  const [bugasDescription, setBugasDescription] = useState<string>("")
  
  const [selectedQuantity, setSelectedQuantity] = useState<number | null>(null)
  const [deliveryMode, setDeliveryMode] = useState<string>("pickup")
  const [paymentMode, setPaymentMode] = useState<string>("cash")
  const [isEditingAdmin, setIsEditingAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  // Fetch bugas service details from Supabase
  useEffect(() => {
    const fetchBugasService = async () => {
      try {
        const { data, error } = await supabase
          .from('store_services')
          .select('*')
          .eq('category', 'bugas')
          .single()

        if (error) {
          console.error('Error fetching bugas service:', error)
        } else if (data) {
          // Use service description and details if available
          if (data.description) {
            setBugasDescription(data.description)
          }
          // Could also update prices from Supabase if you add those fields
        }
      } catch (err) {
        console.error('Supabase fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBugasService()
  }, [])

  const calculateBasePrincipal = () => {
    if (!selectedQuantity) return 0
    return selectedQuantity * pricePerKg
  }

  const getDeliveryFee = () => {
    if (deliveryMode === "pickup" || freeDeliveryEvent) return 0
    if (selectedQuantity && selectedQuantity >= 25) return deliveryFeeBase * 1.5
    return deliveryFeeBase
  }

  const getCalculatedTerms = () => {
    const principal = calculateBasePrincipal()
    const deliveryFee = getDeliveryFee()
    
    let monthsDuration = 1
    let totalPaymentsCount = 1
    let labelText = "Single Payment"

    if (paymentMode === "senimana") {
      monthsDuration = 1
      totalPaymentsCount = 4
      labelText = "4 Weekly Payments"
    } else if (paymentMode === "kinsenas") {
      monthsDuration = 1
      totalPaymentsCount = 2
      labelText = "2 Payments (Every 15 Days)"
    } else if (paymentMode === "binuwan") {
      monthsDuration = 1
      totalPaymentsCount = 1
      labelText = "1 Monthly Term"
    }

    const interestFee = paymentMode !== "cash" ? (principal * monthlyInterestRate * monthsDuration) : 0
    const grandTotalAmount = principal + interestFee + deliveryFee
    const installmentPerInstallmentAmount = grandTotalAmount / totalPaymentsCount

    return {
      grandTotalAmount,
      installmentPerInstallmentAmount,
      totalPaymentsCount,
      labelText,
      interestFee
    }
  }

  const getCalculatedDueDate = () => {
    const targetDate = new Date()
    
    if (paymentMode === "cash") {
      targetDate.setDate(targetDate.getDate() + 1)
    } else if (paymentMode === "senimana") {
      targetDate.setDate(targetDate.getDate() + 7)
    } else if (paymentMode === "kinsenas") {
      targetDate.setDate(targetDate.getDate() + 15)
    } else if (paymentMode === "binuwan") {
      targetDate.setMonth(targetDate.getMonth() + 1)
    }

    return targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleActionExecution = () => {
    if (!selectedQuantity) return
    
    const terms = getCalculatedTerms()
    const finalDueDate = getCalculatedDueDate()

    if (paymentMode === "cash") {
      onAddToCart({
        id: `bugas-${selectedQuantity}kg`,
        name: `Bugas ${selectedQuantity}kl`,
        price: calculateBasePrincipal(),
        quantity: 1,
        deliveryMode,
        deliveryFee: getDeliveryFee(),
        paymentMode,
      })
    } else {
      const paymentPlanName = paymentModes.find(m => m.id === paymentMode)?.label || "Installment"
      onAddToTimelineDirectly(
        `🌾 Bugas ${selectedQuantity}kl Plan (${paymentPlanName})`,
        terms.grandTotalAmount,
        finalDueDate,
        "purchase"
      )
    }
  }

  const activeTerms = getCalculatedTerms()

  return (
    <section className={`py-12 bg-[#3d5a80]/30 ${isFullPage ? 'min-h-screen' : ''}`} id="bugas">
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

        {/* Admin Console Header Section */}
        {isAdmin && (
          <div className="max-w-2xl mx-auto mb-6 bg-[#1e2530] border border-yellow-500/40 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-1">
                🛡️ Admin Management Dashboard Active
              </span>
              <Button 
                size="sm"
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                onClick={() => setIsEditingAdmin(!isEditingAdmin)}
              >
                {isEditingAdmin ? <Check className="h-4 w-4 mr-1" /> : <Edit2 className="h-3.5 w-3.5 mr-1" />}
                {isEditingAdmin ? "Lock Rates" : "Modify Store Variables"}
              </Button>
            </div>
            {isEditingAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <Label className="text-xs text-[#98c1d9]">Price per kg (₱)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={pricePerKg} 
                    onChange={(e) => setPricePerKg(parseFloat(e.target.value) || 0)}
                    className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]"
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#98c1d9]">Base Delivery Fee (₱)</Label>
                  <Input 
                    type="number" 
                    value={deliveryFeeBase} 
                    onChange={(e) => setDeliveryFeeBase(parseInt(e.target.value) || 0)}
                    className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]"
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#98c1d9]">Monthly Interest (Decimal Form)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={monthlyInterestRate} 
                    onChange={(e) => setMonthlyInterestRate(parseFloat(e.target.value) || 0)}
                    className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 justify-center mb-2">
          <ShoppingBasket className="h-8 w-8 text-yellow-400" />
          <h2 className="text-3xl font-bold text-[#e0fbfc]">Bugas (Rice)</h2>
        </div>
        <p className="text-[#98c1d9] text-center mb-2">
          Quality rice with flexible payment options
        </p>
        <p className="text-center mb-8">
          <span className="text-[#ee6c4d] font-bold text-2xl">P{pricePerKg.toFixed(2)}</span>
          <span className="text-[#98c1d9]">/kg</span>
        </p>

        {freeDeliveryEvent && (
          <div className="max-w-md mx-auto mb-6 bg-green-500/20 border border-green-500 text-green-400 px-4 py-2 rounded-lg text-center">
            Free Delivery Event Active!
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#3d5a80] border-[#98c1d9]/30">
            <CardHeader>
              <CardTitle className="text-[#e0fbfc]">Order Rice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quantity Selection */}
              <div className="space-y-3">
                <Label className="text-[#e0fbfc]">Select Quantity</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {quantities.map((q) => (
                    <button
                      key={q.kg}
                      type="button"
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedQuantity === q.kg
                          ? "border-[#ee6c4d] bg-[#ee6c4d]/20"
                          : "border-[#98c1d9]/30 hover:border-[#98c1d9]"
                      }`}
                      onClick={() => setSelectedQuantity(q.kg)}
                    >
                      <span className="text-[#e0fbfc] font-bold">{q.label}</span>
                      <p className="text-sm text-[#ee6c4d]">
                        P{(q.kg * pricePerKg).toFixed(2)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Mode */}
              <div className="space-y-3">
                <Label className="text-[#e0fbfc]">Delivery Mode</Label>
                <RadioGroup value={deliveryMode} onValueChange={setDeliveryMode} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pickup" id="pickup" className="border-[#98c1d9] text-[#98c1d9]" />
                    <Label htmlFor="pickup" className="text-[#e0fbfc] flex items-center gap-2 cursor-pointer">
                      <Store className="h-4 w-4" />
                      Pickup (Free)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deliver" id="deliver" className="border-[#98c1d9] text-[#98c1d9]" />
                    <Label htmlFor="deliver" className="text-[#e0fbfc] flex items-center gap-2 cursor-pointer">
                      <Truck className="h-4 w-4" />
                      Deliver {freeDeliveryEvent ? "(Free!)" : `(+P${getDeliveryFee().toFixed(2)})`}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-3">
                <Label className="text-[#e0fbfc]">Payment Mode</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#3d5a80] border-[#98c1d9]">
                    {paymentModes.map((mode) => (
                      <SelectItem 
                        key={mode.id} 
                        value={mode.id}
                        className="text-[#e0fbfc] focus:bg-[#293241] focus:text-[#e0fbfc]"
                      >
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Summary Display */}
              {selectedQuantity && (
                <div className="bg-[#293241] p-4 rounded-lg space-y-2 border border-[#98c1d9]/10">
                  <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest text-center mb-1">
                    Microfinance Statement Summary
                  </p>
                  <div className="flex justify-between text-[#98c1d9] text-sm">
                    <span>Rice Base Price:</span>
                    <span>P{calculateBasePrincipal().toFixed(2)}</span>
                  </div>
                  {paymentMode !== "cash" && (
                    <div className="flex justify-between text-amber-400 text-sm">
                      <span>Interest Charge Loop ({(monthlyInterestRate * 100)}% flat):</span>
                      <span>+P{activeTerms.interestFee.toFixed(2)}</span>
                    </div>
                  )}
                  {deliveryMode === "deliver" && (
                    <div className="flex justify-between text-[#98c1d9] text-sm">
                      <span>Logistics Delivery Charge:</span>
                      <span className={freeDeliveryEvent ? "line-through text-green-400" : ""}>
                        P{getDeliveryFee().toFixed(2)}
                      </span>
                    </div>
                  )}
                  <hr className="border-[#98c1d9]/20 my-2" />
                  <div className="flex justify-between text-[#e0fbfc] font-bold text-sm">
                    <span>Account Schedule Terms:</span>
                    <span className="text-[#98c1d9]">{activeTerms.labelText}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold text-sm">
                    <span>Initial Payment Schedule Due:</span>
                    <span>{getCalculatedDueDate()}</span>
                  </div>
                  <div className="flex justify-between text-[#e0fbfc] font-bold border-t border-[#98c1d9]/30 pt-2 mt-1">
                    <span>Grand Total To Pay:</span>
                    <span className="text-[#ee6c4d] text-xl">
                      P{activeTerms.grandTotalAmount.toFixed(2)}
                    </span>
                  </div>
                  {paymentMode !== "cash" && (
                    <div className="bg-[#ee6c4d]/10 border border-[#ee6c4d]/30 rounded p-2 mt-2 flex justify-between items-center text-xs">
                      <span className="text-[#e0fbfc] font-medium">Installment Collection:</span>
                      <span className="text-[#ee6c4d] font-bold text-sm">P{activeTerms.installmentPerInstallmentAmount.toFixed(2)} / term</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                className={`w-full text-white font-bold transition-all ${
                  paymentMode === "cash" 
                    ? "bg-[#ee6c4d] hover:bg-[#ee6c4d]/80" 
                    : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                }`}
                disabled={!selectedQuantity}
                onClick={handleActionExecution}
              >
                {paymentMode === "cash" ? "Add to Cart" : "Apply for Installment Plan"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}