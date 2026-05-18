"use client"

import { Clock, ShoppingCart, CreditCard, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export interface TimelineItem {
  id: string
  type: "loan" | "purchase"
  name: string
  amount: number
  dueDate: string
  status: "unpaid" | "in-cart" | "paid" | "overdue"
  penalty?: number
}

interface MyTimelineProps {
  items: TimelineItem[]
  onPayItem: (id: string) => void
  onBack?: () => void
  isFullPage?: boolean
}

const statusConfig = {
  unpaid: {
    label: "Unpaid",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    icon: Clock,
  },
  "in-cart": {
    label: "In Cart",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    icon: ShoppingCart,
  },
  paid: {
    label: "Paid",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    icon: CheckCircle,
  },
  overdue: {
    label: "Overdue",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    icon: AlertTriangle,
  },
}

export function MyTimeline({ items, onPayItem, onBack, isFullPage = false }: MyTimelineProps) {
  const unpaidItems = items.filter((i) => i.status === "unpaid" || i.status === "overdue")
  const inCartItems = items.filter((i) => i.status === "in-cart")
  const paidItems = items.filter((i) => i.status === "paid")

  const renderItem = (item: TimelineItem) => {
    const config = statusConfig[item.status]
    const StatusIcon = config.icon

    return (
      <div
        key={item.id}
        className={`p-4 rounded-lg border border-[#98c1d9]/30 ${config.bgColor}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${config.bgColor}`}>
              <StatusIcon className={`h-4 w-4 ${config.color}`} />
            </div>
            <div>
              <p className="text-[#e0fbfc] font-medium">{item.name}</p>
              <p className="text-sm text-[#98c1d9]">Due: {item.dueDate}</p>
              {item.penalty && item.penalty > 0 && (
                <p className="text-sm text-red-400">
                  +P{item.penalty.toFixed(2)} penalty (2%)
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[#ee6c4d] font-bold">
              P{(item.amount + (item.penalty || 0)).toFixed(2)}
            </p>
            <span className={`text-xs ${config.color}`}>{config.label}</span>
          </div>
        </div>
        {(item.status === "unpaid" || item.status === "overdue") && (
          <Button
            size="sm"
            className="w-full mt-3 bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white"
            onClick={() => onPayItem(item.id)}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Now
          </Button>
        )}
      </div>
    )
  }

  return (
    <section className={`py-12 bg-[#293241] ${isFullPage ? 'min-h-screen' : ''}`} id="timeline">
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
          My Timeline
        </h2>
        <p className="text-[#98c1d9] text-center mb-8">
          Track your payments, cart items, and payment status
        </p>

        <div className="max-w-3xl mx-auto">
          {/* Vertical Stepper Layout */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#98c1d9]/30" />

            {/* Unpaid Items */}
            <div className="relative mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center z-10 border-4 border-[#293241]">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#e0fbfc]">Unpaid Items</h3>
                  <p className="text-sm text-[#98c1d9]">
                    {unpaidItems.length} item{unpaidItems.length !== 1 ? "s" : ""} pending payment
                  </p>
                </div>
              </div>
              <div className="ml-16 space-y-3">
                {unpaidItems.length > 0 ? (
                  unpaidItems.map(renderItem)
                ) : (
                  <Card className="bg-[#3d5a80]/50 border-[#98c1d9]/20">
                    <CardContent className="py-6 text-center">
                      <p className="text-[#98c1d9]">No unpaid items</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* In Cart */}
            <div className="relative mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-400/20 flex items-center justify-center z-10 border-4 border-[#293241]">
                  <ShoppingCart className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#e0fbfc]">Added to Cart</h3>
                  <p className="text-sm text-[#98c1d9]">
                    {inCartItems.length} item{inCartItems.length !== 1 ? "s" : ""} in cart
                  </p>
                </div>
              </div>
              <div className="ml-16 space-y-3">
                {inCartItems.length > 0 ? (
                  inCartItems.map(renderItem)
                ) : (
                  <Card className="bg-[#3d5a80]/50 border-[#98c1d9]/20">
                    <CardContent className="py-6 text-center">
                      <p className="text-[#98c1d9]">Cart is empty</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Payment Status / Paid */}
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-400/20 flex items-center justify-center z-10 border-4 border-[#293241]">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#e0fbfc]">Payment Status</h3>
                  <p className="text-sm text-[#98c1d9]">
                    {paidItems.length} item{paidItems.length !== 1 ? "s" : ""} completed
                  </p>
                </div>
              </div>
              <div className="ml-16 space-y-3">
                {paidItems.length > 0 ? (
                  paidItems.slice(0, 5).map(renderItem)
                ) : (
                  <Card className="bg-[#3d5a80]/50 border-[#98c1d9]/20">
                    <CardContent className="py-6 text-center">
                      <p className="text-[#98c1d9]">No payment history yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
