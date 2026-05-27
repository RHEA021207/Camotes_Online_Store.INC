"use client"

import { Clock, ShoppingCart, CreditCard, CheckCircle, AlertTriangle, ArrowLeft, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useServices } from "@/context/ServiceContext"

export interface TimelineItem {
  id: string
  type: "loan" | "purchase"
  name: string
  amount: number
  dueDate: string
  status: "unpaid" | "in-cart" | "pending_review" | "paid" | "overdue"
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
    label: "Unpaid Balance",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    icon: Clock,
  },
  "in-cart": {
    label: "In Cart Pending",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    icon: ShoppingCart,
  },
  pending_review: {
    label: "Pending Admin Review",
    color: "text-violet-300",
    bgColor: "bg-violet-400/10",
    icon: Shield,
  },
  paid: {
    label: "Cleared & Paid",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    icon: CheckCircle,
  },
  overdue: {
    label: "Overdue (Arrears)",
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
    icon: AlertTriangle,
  },
}

export function MyTimeline({ items = [], onPayItem, onBack, isFullPage = false }: MyTimelineProps) {
  // Defensive normalization to prevent runtime application breakdown crashes
  const safeItems = Array.isArray(items) ? items : []
  const { penaltyFeePercentage } = useServices()

  const unpaidItems = safeItems.filter((i) => i.status === "unpaid" || i.status === "overdue")
  const inCartItems = safeItems.filter((i) => i.status === "in-cart")
  const paidItems = safeItems.filter((i) => i.status === "paid")

  const renderItem = (item: TimelineItem) => {
    const config = statusConfig[item.status] || statusConfig.unpaid
    const StatusIcon = config.icon

    return (
      <div
        key={item.id}
        className={`p-4 rounded-lg border border-[#98c1d9]/20 transition-all ${config.bgColor} hover:border-[#98c1d9]/40`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${config.bgColor} border border-[#98c1d9]/10`}>
              <StatusIcon className={`h-4 w-4 ${config.color}`} />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[#e0fbfc] font-semibold text-base leading-tight">{item.name}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  item.type === "loan" 
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                }`}>
                  {item.type === "loan" ? "💸 Loan Term" : "📦 Purchase Plan"}
                </span>
              </div>
              
              <p className="text-xs text-[#98c1d9]">Collection Deadline: <span className="text-[#e0fbfc] font-medium">{item.dueDate}</span></p>
              
              {item.penalty && item.penalty > 0 && (
                <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1 bg-rose-500/10 px-2 py-0.5 rounded w-fit border border-rose-500/20">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  +P{item.penalty.toFixed(2)} Compounded Penalty Added ({penaltyFeePercentage}%)
                </p>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[#ee6c4d] font-bold text-lg leading-tight">
              P{(item.amount + (item.penalty || 0)).toFixed(2)}
            </p>
            <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>{config.label}</span>
          </div>
        </div>
        
        <div className="mt-3 grid gap-2">
          <Button
            size="sm"
            className="w-full bg-[#1d2430] hover:bg-[#1f2e43] text-[#e0fbfc] border border-[#98c1d9]/20"
            onClick={() => window.open("https://www.facebook.com/share/1BcP1N5D2S/", "_blank")}
          >
            Inquire on Facebook
          </Button>
          {(item.status === "unpaid" || item.status === "overdue" || item.status === "pending_review") && (
            <Button
              size="sm"
              className="w-full bg-[#ee6c4d] hover:bg-[#ee6c4d]/90 text-white font-bold transition-all border-b-2 border-[#ee6c4d]/40 active:translate-y-[1px]"
              onClick={() => onPayItem(item.id)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Process Electronic Payment
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className={`py-12 bg-[#293241] ${isFullPage ? 'min-h-screen' : ''}`} id="timeline">
      <div className="container mx-auto px-4">
        {isFullPage && onBack && (
          <Button
            variant="ghost"
            className="text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80] mb-6 transition-colors"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        )}
        <h2 className="text-3xl font-bold text-[#e0fbfc] text-center mb-2 tracking-tight">
          My Microfinance Ledger Timeline
        </h2>
        <p className="text-[#98c1d9] text-center mb-8 max-w-md mx-auto text-sm">
          Monitor running ledger account balances, upcoming payment term conditions, and paid transaction receipts.
        </p>

        <div className="max-w-3xl mx-auto">
          {/* Vertical Stepper Process Column Frame */}
          <div className="relative">
            {/* Structural Center Line */}
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-500 via-blue-500 to-green-500 opacity-30" />

            {/* Unpaid Processing Block Section */}
            <div className="relative mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center z-10 border-4 border-[#293241] shadow-md">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#e0fbfc]">Active Outstanding Balances</h3>
                  <p className="text-xs text-[#98c1d9]">
                    {unpaidItems.length} active collection account{unpaidItems.length !== 1 ? "s" : ""} pending settlement
                  </p>
                </div>
              </div>
              <div className="ml-14 sm:ml-16 space-y-3">
                {unpaidItems.length > 0 ? (
                  unpaidItems.map(renderItem)
                ) : (
                  <Card className="bg-[#3d5a80]/30 border-[#98c1d9]/10">
                    <CardContent className="py-6 text-center">
                      <p className="text-sm text-[#98c1d9]">All loan schedules and collection ledger balances are clear!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Shopping Cart Checking Node Section */}
            <div className="relative mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-400/20 flex items-center justify-center z-10 border-4 border-[#293241] shadow-md">
                  <ShoppingCart className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#e0fbfc]">Pending Checkout Cart</h3>
                  <p className="text-xs text-[#98c1d9]">
                    {inCartItems.length} transaction request{inCartItems.length !== 1 ? "s" : ""} saved in cart
                  </p>
                </div>
              </div>
              <div className="ml-14 sm:ml-16 space-y-3">
                {inCartItems.length > 0 ? (
                  inCartItems.map(renderItem)
                ) : (
                  <Card className="bg-[#3d5a80]/30 border-[#98c1d9]/10">
                    <CardContent className="py-6 text-center">
                      <p className="text-sm text-[#98c1d9]">No transaction items staged in shopping cart allocation pipelines.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Archive Ledger History Node Section */}
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-400/20 flex items-center justify-center z-10 border-4 border-[#293241] shadow-md">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#e0fbfc]">Cleared Ledger History</h3>
                  <p className="text-xs text-[#98c1d9]">
                    Showing last {Math.min(5, paidItems.length)} fully processed settlements
                  </p>
                </div>
              </div>
              <div className="ml-14 sm:ml-16 space-y-3">
                {paidItems.length > 0 ? (
                  paidItems.slice(0, 5).map(renderItem)
                ) : (
                  <Card className="bg-[#3d5a80]/30 border-[#98c1d9]/10">
                    <CardContent className="py-6 text-center">
                      <p className="text-sm text-[#98c1d9]">No verified settlement account receipts logged onto this device yet.</p>
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