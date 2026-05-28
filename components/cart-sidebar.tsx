"use client"

import Image from "next/image"
import { X, Trash2, ShoppingCart, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  deliveryFee?: number
}

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onCheckout: () => void
}

export function CartSidebar({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartSidebarProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFees = items.reduce((sum, item) => sum + (item.deliveryFee || 0), 0)
  const total = subtotal + deliveryFees

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#293241] border-l border-[#3d5a80] z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3d5a80]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#98c1d9]" />
            <h2 className="text-xl font-bold text-[#e0fbfc]">Your Cart</h2>
            <span className="bg-[#ee6c4d] text-white text-xs px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-[#98c1d9]/50 mx-auto mb-4" />
              <p className="text-[#98c1d9]">Your cart is empty</p>
              <Button
                variant="ghost"
                className="mt-4 text-[#ee6c4d] hover:text-[#ee6c4d]/80"
                onClick={onClose}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="bg-[#3d5a80] border-[#98c1d9]/30">
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {item.image && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-[#e0fbfc] font-medium truncate">{item.name}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-[#ee6c4d] font-bold">
                        P{(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.deliveryFee && item.deliveryFee > 0 && (
                        <p className="text-xs text-[#98c1d9]">
                          +P{item.deliveryFee} delivery
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#293241]"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-[#e0fbfc] text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#293241]"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="border-t border-[#3d5a80] p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[#98c1d9]">
                <span>Subtotal</span>
                <span>P{subtotal.toFixed(2)}</span>
              </div>
              {deliveryFees > 0 && (
                <div className="flex justify-between text-[#98c1d9]">
                  <span>Delivery Fees</span>
                  <span>P{deliveryFees.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#e0fbfc] font-bold text-lg pt-2 border-t border-[#3d5a80]">
                <span>Total</span>
                <span className="text-[#ee6c4d]">P{total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white"
              onClick={onCheckout}
            >
              Request Order via Messenger
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
