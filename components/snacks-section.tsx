"use client"

import Image from "next/image"
import { ShoppingCart, Plus, Minus, ArrowLeft, Save, Edit } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface SnacksSectionProps {
  onAddToCart: (item: { id: string; name: string; price: number; quantity: number; image: string }) => void
  onBack?: () => void
  isFullPage?: boolean
  isAdmin?: boolean // Added admin flag prop
}

const initialSnacks = [
  {
    id: "bodbod",
    name: "Bodbod",
    description: "Traditional sticky rice delicacy wrapped in banana leaves",
    price: 10,
    image: "/images/shakoy.jpg",
    category: "Traditional",
  },
  {
    id: "shakoy",
    name: "Shakoy",
    description: "Golden twisted Filipino donuts, crispy and sweet",
    price: 10,
    image: "/images/shakoy.jpg",
    category: "Traditional",
  },
  {
    id: "ubi-turon",
    name: "Ubi Turon",
    description: "Purple yam spring rolls with chocolate drizzle",
    price: 10,
    image: "/images/ubi-turon.jpg",
    category: "Traditional",
  },
  {
    id: "mango-float",
    name: "Mango Float",
    description: "Creamy layers of graham, cream, and fresh mango slices",
    price: 89,
    image: "/images/mango-float.jpg",
    category: "Dessert Tub",
    unit: "per tub",
  },
  {
    id: "cookies-cream",
    name: "Cookies and Cream",
    description: "Smooth cream base with crushed Oreo cookies",
    price: 89,
    image: "/images/cookies-and-cream.jpg",
    category: "Dessert Tub",
    unit: "per tub",
  },
  {
    id: "munchkins",
    name: "Munchkins",
    description: "Colorful assorted chocolate balls with various toppings",
    price: 49,
    image: "/images/munchkin.jpg",
    category: "Dessert Tub",
    unit: "per tub",
  },
]

export function SnacksSection({ onAddToCart, onBack, isFullPage = false, isAdmin = false }: SnacksSectionProps) {
  const [itemsList, setItemsList] = useState(initialSnacks)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [editingId, setEditingId] = useState<string | null>(null)

  const updateQuantity = (id: string, delta: number) => {
    setQuantities(prev => {
      const currentQty = prev[id] !== undefined ? prev[id] : 1
      const targetQty = currentQty + delta
      return { ...prev, [id]: Math.max(0, targetQty) }
    })
  }

  const handleInlineItemEdit = (id: string, field: string, val: string | number) => {
    setItemsList(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item))
  }

  const handleAddToCart = (snack: typeof initialSnacks[0]) => {
    const qty = quantities[snack.id] !== undefined ? quantities[snack.id] : 1
    if (qty <= 0) return

    onAddToCart({
      id: snack.id,
      name: snack.name,
      price: snack.price,
      quantity: qty,
      image: snack.image,
    })

    setQuantities(prev => ({ ...prev, [snack.id]: 1 }))
  }

  return (
    <section className={`py-12 bg-[#293241] ${isFullPage ? 'min-h-screen' : ''}`} id="snacks">
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
        
        <h2 className="text-3xl font-bold text-[#e0fbfc] text-center mb-2">
          Snacks & Desserts
        </h2>
        <p className="text-[#98c1d9] text-center mb-8">
          Homemade Filipino treats and sweet desserts {isAdmin && <span className="text-yellow-500 font-bold block mt-1 text-xs tracking-wider">🛡️ ADMIN PORTAL ACCESS VERIFIED</span>}
        </p>

        {/* Traditional Snacks Section */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-[#98c1d9] mb-4">Traditional Snacks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemsList.filter(s => s.category === "Traditional").map((snack) => {
              const currentItemQty = quantities[snack.id] !== undefined ? quantities[snack.id] : 1
              const isEditingThis = editingId === snack.id

              return (
                <Card key={snack.id} className="bg-[#3d5a80] border-[#98c1d9]/30 overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={snack.image}
                      alt={snack.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isAdmin && (
                      <Button
                        size="icon"
                        className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full"
                        onClick={() => setEditingId(isEditingThis ? null : snack.id)}
                      >
                        {isEditingThis ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    {isEditingThis ? (
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-[#98c1d9]">Snack Name</Label>
                          <Input value={snack.name} onChange={(e) => handleInlineItemEdit(snack.id, "name", e.target.value)} className="h-8 bg-[#293241] border-[#98c1d9]/20 text-[#e0fbfc]" />
                        </div>
                        <div>
                          <Label className="text-xs text-[#98c1d9]">Price (₱)</Label>
                          <Input type="number" value={snack.price} onChange={(e) => handleInlineItemEdit(snack.id, "price", parseInt(e.target.value) || 0)} className="h-8 bg-[#293241] border-[#98c1d9]/20 text-[#e0fbfc]" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-[#e0fbfc]">{snack.name}</h4>
                        <span className="text-[#ee6c4d] font-bold text-xl">P{snack.price}</span>
                      </div>
                    )}
                    
                    <p className="text-sm text-[#98c1d9] mb-4">{snack.description}</p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-[#293241] rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-transparent"
                          onClick={() => updateQuantity(snack.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-[#e0fbfc] font-medium">
                          {currentItemQty}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-transparent"
                          onClick={() => updateQuantity(snack.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        className="flex-1 bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white font-bold"
                        disabled={currentItemQty === 0}
                        onClick={() => handleAddToCart(snack)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add To Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Dessert Tubs Section */}
        <div>
          <h3 className="text-xl font-semibold text-[#98c1d9] mb-4">Dessert Tubs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemsList.filter(s => s.category === "Dessert Tub").map((snack) => {
              const currentItemQty = quantities[snack.id] !== undefined ? quantities[snack.id] : 1
              const isEditingThis = editingId === snack.id

              return (
                <Card key={snack.id} className="bg-[#3d5a80] border-[#98c1d9]/30 overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={snack.image}
                      alt={snack.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-12 bg-[#ee6c4d] text-white text-xs px-2 py-1 rounded font-bold">
                      {snack.unit || "per tub"}
                    </div>
                    {isAdmin && (
                      <Button
                        size="icon"
                        className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full"
                        onClick={() => setEditingId(isEditingThis ? null : snack.id)}
                      >
                        {isEditingThis ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    {isEditingThis ? (
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-[#98c1d9]">Snack Name</Label>
                          <Input value={snack.name} onChange={(e) => handleInlineItemEdit(snack.id, "name", e.target.value)} className="h-8 bg-[#293241] border-[#98c1d9]/20 text-[#e0fbfc]" />
                        </div>
                        <div>
                          <Label className="text-xs text-[#98c1d9]">Price (₱)</Label>
                          <Input type="number" value={snack.price} onChange={(e) => handleInlineItemEdit(snack.id, "price", parseInt(e.target.value) || 0)} className="h-8 bg-[#293241] border-[#98c1d9]/20 text-[#e0fbfc]" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-[#e0fbfc]">{snack.name}</h4>
                        <span className="text-[#ee6c4d] font-bold text-xl">P{snack.price}</span>
                      </div>
                    )}
                    
                    <p className="text-sm text-[#98c1d9] mb-4">{snack.description}</p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-[#293241] rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-transparent"
                          onClick={() => updateQuantity(snack.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-[#e0fbfc] font-medium">
                          {currentItemQty}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-transparent"
                          onClick={() => updateQuantity(snack.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        className="flex-1 bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white font-bold"
                        disabled={currentItemQty === 0}
                        onClick={() => handleAddToCart(snack)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add To Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}