"use client"

import { useState } from "react"
import { ShoppingBasket, Truck, Store, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BugasSectionProps {
  freeDeliveryEvent: boolean
  onAddToCart: (item: { 
    id: string
    name: string
    price: number
    quantity: number
    deliveryMode: string
    deliveryFee: number
    paymentMode: string
  }) => void
  onBack?: () => void
  isFullPage?: boolean
}

const pricePerKg = 59.99
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

const deliveryFeeBase = 50

export function BugasSection({ freeDeliveryEvent, onAddToCart, onBack, isFullPage = false }: BugasSectionProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<number | null>(null)
  const [deliveryMode, setDeliveryMode] = useState<string>("pickup")
  const [paymentMode, setPaymentMode] = useState<string>("cash")

  const calculateTotal = () => {
    if (!selectedQuantity) return 0
    return selectedQuantity * pricePerKg
  }

  const getDeliveryFee = () => {
    if (deliveryMode === "pickup" || freeDeliveryEvent) return 0
    // Dynamic fee based on quantity
    if (selectedQuantity && selectedQuantity >= 25) return deliveryFeeBase * 1.5
    return deliveryFeeBase
  }

  const handleAddToCart = () => {
    if (!selectedQuantity) return
    
    onAddToCart({
      id: `bugas-${selectedQuantity}kg`,
      name: `Bugas ${selectedQuantity}kl`,
      price: calculateTotal(),
      quantity: 1,
      deliveryMode,
      deliveryFee: getDeliveryFee(),
      paymentMode,
    })
  }

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
        <div className="flex items-center gap-3 justify-center mb-2">
          <ShoppingBasket className="h-8 w-8 text-yellow-400" />
          <h2 className="text-3xl font-bold text-[#e0fbfc]">Bugas (Rice)</h2>
        </div>
        <p className="text-[#98c1d9] text-center mb-2">
          Quality rice with flexible payment options
        </p>
        <p className="text-center mb-8">
          <span className="text-[#ee6c4d] font-bold text-2xl">P{pricePerKg}</span>
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
                      Deliver {freeDeliveryEvent ? "(Free!)" : `(+P${getDeliveryFee()})`}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Payment Mode */}
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

              {/* Summary */}
              {selectedQuantity && (
                <div className="bg-[#293241] p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-[#98c1d9]">
                    <span>Rice ({selectedQuantity}kl)</span>
                    <span>P{calculateTotal().toFixed(2)}</span>
                  </div>
                  {deliveryMode === "deliver" && (
                    <div className="flex justify-between text-[#98c1d9]">
                      <span>Delivery Fee</span>
                      <span className={freeDeliveryEvent ? "line-through" : ""}>
                        P{getDeliveryFee().toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#e0fbfc] font-bold border-t border-[#98c1d9]/30 pt-2">
                    <span>Total</span>
                    <span className="text-[#ee6c4d] text-xl">
                      P{(calculateTotal() + getDeliveryFee()).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white"
                disabled={!selectedQuantity}
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
