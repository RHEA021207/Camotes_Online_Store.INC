"use client"

import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServicesGrid } from "@/components/services-grid"
import { ELoanSection } from "@/components/e-loan-section"
import { SnacksSection } from "@/components/snacks-section"
import { BugasSection } from "@/components/bugas-section"
import { SanglaSection } from "@/components/sangla-section"
import { MyTimeline, TimelineItem } from "@/components/my-timeline"
import { CartSidebar, CartItem } from "@/components/cart-sidebar"
import { AdminDashboard, Customer, StockItem, SaleItem } from "@/components/admin-dashboard"
import { AdminLogin } from "@/components/admin-login"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, ShoppingCart, Calendar, Info, Layers, ArrowDown, Search } from "lucide-react"
import AccountModal from "@/components/account-modal"

// Java-Sourced Dataset Definitions (Updated with requested models & Speakers)
const GADGETS_DATABASE: Record<string, { model: string; price: number }[]> = {
  Vivo: [
    { model: "Y02s", price: 5999 },
    { model: "Y36", price: 12999 },
    { model: "V27", price: 24999 }
  ],
  Realme: [
    { model: "C55", price: 8999 },
    { model: "10", price: 11999 },
    { model: "11 Pro", price: 19999 }
  ],
  Infinix: [
    { model: "Hot 30i", price: 4599 },
    { model: "Note 30 5G", price: 9499 },
    { model: "Zero Ultra", price: 21000 }
  ],
  Redmi: [
    { model: "A2+", price: 3999 },
    { model: "Note 12", price: 8999 },
    { model: "Xiaomi 13 Pro", price: 48000 }
  ],
  Oppo: [
    { model: "A17", price: 7999 },
    { model: "Reno 10", price: 23999 }
  ],
  Tecno: [
    { model: "Spark 10 Pro", price: 7299 },
    { model: "Pova 5", price: 8499 }
  ],
  Nubia: [
    { model: "Neo 5G", price: 9999 },
    { model: "Red Magic 8 Pro", price: 42999 }
  ]
}

const APPLIANCES_DATABASE: Record<string, { model: string; price: number }[]> = {
  Refrigerators: [
    { model: "LG Single Door", price: 12400 },
    { model: "Samsung No-Frost", price: 18500 },
    { model: "Panasonic Inverter", price: 25000 }
  ],
  "Washing Machines": [
    { model: "Sharp 7.5kg Single Tub", price: 5400 },
    { model: "Panasonic Front Load", price: 22100 }
  ],
  TVs: [
    { model: "Skyworth 32\" Smart TV", price: 7800 },
    { model: "Samsung 43\" UHD Smart TV", price: 19900 },
    { model: "Sony 55\" Bravia 4K TV", price: 35000 }
  ],
  Speakers: [
    { model: "JBL Go 4 Portable Bluetooth Speaker", price: 2399 },
    { model: "Sony SRS-XE200 Wireless Speaker", price: 6499 },
    { model: "Ace Professional Active Stage Speaker", price: 11500 }
  ],
  Aircon: [
    { model: "Carrier 1.0HP Window", price: 15500 },
    { model: "Koppel 1.5HP Inverter", price: 28900 }
  ],
  Cabinet: [
    { model: "Orocan 4-Drawer", price: 2800 },
    { model: "Wooden Wardrobe", price: 5500 }
  ]
}

const initialCustomers: Customer[] = [
  { id: "COS-101", name: "Juan Dela Cruz", trustScore: "excellent", balance: 0, lastPayment: "2026-01-15" },
  { id: "COS-102", name: "Maria Santos", trustScore: "good", balance: 500, lastPayment: "2026-01-10" },
  { id: "COS-103", name: "Pedro Garcia", trustScore: "new", balance: 1000, lastPayment: "N/A" },
  { id: "COS-104", name: "Ana Reyes", trustScore: "good", balance: 0, lastPayment: "2026-01-12" },
  { id: "COS-105", name: "Jose Mendoza", trustScore: "new", balance: 2000, lastPayment: "N/A" },
]

const initialStock: StockItem[] = [
  { id: "bugas-25", name: "Bugas 25kl", quantity: 15, category: "Rice", price: 1499.75 },
  { id: "bugas-50", name: "Bugas 50kl", quantity: 8, category: "Rice", price: 2999.50 },
  { id: "bodbod", name: "Bodbod", quantity: 20, category: "Snacks", price: 10, description: "Traditional rice cake" },
  { id: "shakoy", name: "Shakoy", quantity: 25, category: "Snacks", price: 10, description: "Twisted donut" },
  { id: "ubi-turon", name: "Ubi Turon", quantity: 15, category: "Snacks", price: 10, description: "Purple yam spring roll" },
  { id: "mango-float", name: "Mango Float", quantity: 10, category: "Dessert", price: 89, description: "Creamy mango dessert" },
  { id: "cookies-cream", name: "Cookies & Cream", quantity: 8, category: "Dessert", price: 89, description: "Oreo dessert" },
  { id: "munchkins", name: "Munchkins", quantity: 12, category: "Dessert", price: 49, description: "Assorted toppings" },
]

const initialSales: SaleItem[] = [
  { id: "1", customerId: "COS-101", customerName: "Juan Dela Cruz", item: "E-Loan Payment", amount: 550, timestamp: "09:30 AM" },
  { id: "2", customerId: "COS-102", customerName: "Maria Santos", item: "Bugas 10kl", amount: 599.90, timestamp: "10:15 AM" },
  { id: "3", customerId: "COS-104", customerName: "Ana Reyes", item: "Mango Float", amount: 89, timestamp: "11:00 AM" },
]

const initialTimeline: TimelineItem[] = [
  { id: "1", type: "loan", name: "E-Loan 3k - Week 2", amount: 550, dueDate: "Jun 01, 2026", status: "unpaid" },
  { id: "2", type: "purchase", name: "Bugas 25kl", amount: 1499.75, dueDate: "Jun 05, 2026", status: "unpaid" },
  { id: "3", type: "loan", name: "E-Loan 2k - Week 1", amount: 275, dueDate: "May 10, 2026", status: "overdue", penalty: 5.50 },
  { id: "4", type: "purchase", name: "Mango Float x2", amount: 178, dueDate: "May 05, 2026", status: "paid" },
]

type ActiveView = "home" | "services" | "e-loan" | "snacks" | "bugas" | "sangla" | "gadgets" | "appliances" | "timeline" | "admin"

export default function Home() {
  const [activeView, setActiveView] = useState<ActiveView>("home")
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [stock, setStock] = useState<StockItem[]>(initialStock)
  const [sales, setSales] = useState<SaleItem[]>(initialSales)
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline)
  const [freeDeliveryEvent, setFreeDeliveryEvent] = useState(false)
  const [userTrustScore] = useState<"new" | "good" | "excellent">("good")
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false)

  // Hardware Model Database Pickers
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [selectedPrice, setSelectedPrice] = useState<number>(0)
  const [paymentOption, setPaymentOption] = useState<"now" | "later">("now")
  
  // Real-time Installment Calculation Properties
  const [paymentFrequency, setPaymentFrequency] = useState<"Weekly" | "15 Days" | "Monthly">("Weekly")
  const [paymentMonths, setPaymentMonths] = useState<number>(3)
  const [deliveryChargeEnabled, setDeliveryChargeEnabled] = useState<boolean>(true)

  useEffect(() => {
    const authStatus = sessionStorage.getItem("cos-admin-auth")
    if (authStatus === "true") {
      setIsAdminAuthenticated(true)
    }
  }, [])

  const servicesRef = useRef<HTMLDivElement>(null)

  const handleNavigate = (section: string) => {
    const normalizedSection = section.toLowerCase().replace(/\s+/g, "-").replace("/", "-")
    
    setSelectedBrand("")
    setSelectedModel("")
    setSelectedPrice(0)

    switch (normalizedSection) {
      case "home":
        setActiveView("home")
        window.scrollTo({ top: 0, behavior: "smooth" })
        break
      case "services":
        setActiveView("home")
        setTimeout(() => {
          servicesRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
        break
      case "e-loan":
        setActiveView("e-loan")
        break
      case "snacks":
      case "food":
        setActiveView("snacks")
        break
      case "bugas":
        setActiveView("bugas")
        break
      case "sangla":
      case "sangla-prinda":
        setActiveView("sangla")
        break
      case "gadgets":
        setActiveView("gadgets")
        break
      case "appliances":
        setActiveView("appliances")
        break
      case "timeline":
        setActiveView("timeline")
        break
      case "admin":
        setActiveView("admin")
        break
      case "cart":
        setCartOpen(true)
        break
      default:
        setActiveView("home")
        window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBrowseServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      }
      return [...prev, item]
    })
  }

  const handleUpdateCartQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
  }

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const handleAddToTimelineDirectly = (name: string, totalAmount: number, customDueDate: string, type: "purchase" | "loan" = "purchase") => {
    const newTimelineItem: TimelineItem = {
      id: `direct-${Date.now()}`,
      type: type,
      name: name,
      amount: totalAmount,
      dueDate: customDueDate,
      status: "unpaid",
    }
    setTimeline((prev) => [newTimelineItem, ...prev])
    setActiveView("timeline")
  }

  const handleCheckout = () => {
    const newTimelineItems: TimelineItem[] = cart.map((item, index) => ({
      id: `cart-${Date.now()}-${index}`,
      type: "purchase" as const,
      name: `${item.quantity}x ${item.name}`,
      amount: item.price * item.quantity + (item.deliveryFee || 0),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "unpaid" as const,
    }))
    setTimeline((prev) => [...newTimelineItems, ...prev])
    setCart([])
    setCartOpen(false)
    setActiveView("timeline")
  }

  const handleApplyLoan = (amount: number, frequency: string, total: number, customDueDate?: string) => {
    const newLoan: TimelineItem = {
      id: `loan-${Date.now()}`,
      type: "loan",
      name: `E-Loan P${amount.toLocaleString()} (${frequency})`,
      amount: total,
      dueDate: customDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "unpaid",
    }
    setTimeline((prev) => [newLoan, ...prev])
    setActiveView("timeline")
  }

  const handlePayItem = (id: string) => {
    setTimeline((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "paid" as const } : item))
    )
    
    const paidItem = timeline.find((i) => i.id === id)
    if (paidItem) {
      const newSale: SaleItem = {
        id: `sale-${Date.now()}`,
        customerId: "COS-102",
        customerName: "Current User",
        item: paidItem.name,
        amount: paidItem.amount,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }
      setSales((prev) => [...prev, newSale])
    }
  }

  const runInstallmentCalculationEngine = () => {
    const principal = selectedPrice
    if (principal <= 0) return { grandTotal: 0, amortization: 0, dateSchedules: [] }

    if (paymentOption === "now") {
      const finalGrandTotal = principal + (deliveryChargeEnabled ? 50 : 0)
      return {
        grandTotal: finalGrandTotal,
        amortization: finalGrandTotal,
        dateSchedules: ["Today (Outright Settlement)"]
      }
    }

    const interestRatePerMonth = 0.05
    const totalWithInterest = principal * (1 + (interestRatePerMonth * paymentMonths))
    const finalGrandTotal = totalWithInterest + (deliveryChargeEnabled ? 50 : 0)

    let divisionFactor = 1
    let daysStep = 7

    if (paymentFrequency === "Weekly") {
      divisionFactor = paymentMonths * 4
      daysStep = 7
    } else if (paymentFrequency === "15 Days") {
      divisionFactor = paymentMonths * 2
      daysStep = 15
    } else if (paymentFrequency === "Monthly") {
      divisionFactor = paymentMonths
      daysStep = 30
    }

    const pricePerInstallment = finalGrandTotal / divisionFactor
    const dates: string[] = []

    for (let i = 1; i <= divisionFactor; i++) {
      const futureTimestamp = Date.now() + (i * daysStep * 24 * 60 * 60 * 1000)
      dates.push(new Date(futureTimestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }))
    }

    return {
      grandTotal: finalGrandTotal,
      amortization: pricePerInstallment,
      dateSchedules: dates
    }
  }

  const processedInstallmentPlan = runInstallmentCalculationEngine()

  const handleProcessInstallmentCheckout = () => {
    if (!selectedModel || processedInstallmentPlan.grandTotal <= 0) return

    const targetDueDate = paymentOption === "now" ? "Today" : (processedInstallmentPlan.dateSchedules[0] || "Next Week")
    const paymentModeLabel = paymentOption === "now" ? "Paid Outright" : `${paymentFrequency} Installment Plan`
    const descriptivePlanText = `${selectedBrand} ${selectedModel} (${paymentModeLabel})`
    
    handleAddToTimelineDirectly(descriptivePlanText, processedInstallmentPlan.grandTotal, targetDueDate, "purchase")
    
    setSelectedBrand("")
    setSelectedModel("")
    setSelectedPrice(0)
    setPaymentOption("now")
  }

  const handleToggleFreeDelivery = (value: boolean) => {
    setFreeDeliveryEvent(value)
  }

  const handleUpdateTrustScore = (customerId: string, score: "new" | "good" | "excellent") => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, trustScore: score } : c))
    )
  }

  const handleAddCustomer = (customer: Omit<Customer, "id">) => {
    const newCustomer: Customer = {
      ...customer,
      id: `COS-${String(customers.length + 101).padStart(3, "0")}`,
    }
    setCustomers((prev) => [...prev, newCustomer])
  }

  const handleUpdateStock = (stockId: string, updates: Partial<StockItem>) => {
    setStock((prev) =>
      prev.map((item) => (item.id === stockId ? { ...item, ...updates } : item))
    )
  }

  const handleAdminLogin = (success: boolean) => {
    setIsAdminAuthenticated(success)
  }

  const handleAdminLogout = () => {
    sessionStorage.removeItem("cos-admin-auth")
    setIsAdminAuthenticated(false)
    setActiveView("home")
  }

  const showBackButton = activeView !== "home"

  const renderHardwareSelectionView = (category: "gadgets" | "appliances") => {
    const database = category === "gadgets" ? GADGETS_DATABASE : APPLIANCES_DATABASE
    const availableCategoriesOrBrands = Object.keys(database)

    return (
      <section className="min-h-screen py-12 bg-[#293241]">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            className="text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80] mb-6"
            onClick={() => {
              setSelectedBrand("")
              setSelectedModel("")
              setSelectedPrice(0)
              handleNavigate("home")
            }}
          >
            ← Back to Main Marketplace
          </Button>

          <h2 className="text-3xl font-bold text-[#e0fbfc] text-center mb-2 capitalize">
            {category === "gadgets" ? "Smartphones & Gadget Portal" : "Home Electronics & Appliances"}
          </h2>
          <p className="text-[#98c1d9] text-center mb-8 text-sm">
            Evaluate immediate microfinance computations, setup terms and project calendar timelines.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <Card className="bg-[#3d5a80] border-[#98c1d9]/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#e0fbfc] text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#ee6c4d]" />
                  {category === "gadgets" ? "Select Smartphone Brand" : "Select Appliance Category"}
                </CardTitle>
                <CardDescription className="text-[#98c1d9]">Pulls inventory entries directly from hardware logs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#e0fbfc]">Available Classes</Label>
                  <Select
                    value={selectedBrand}
                    onValueChange={(brand) => {
                      setSelectedBrand(brand)
                      setSelectedModel("")
                      setSelectedPrice(0)
                    }}
                  >
                    <SelectTrigger className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]">
                      <SelectValue placeholder={category === "gadgets" ? "Choose brand..." : "Choose appliance type..."} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]">
                      {availableCategoriesOrBrands.map((b) => (
                        <SelectItem key={b} value={b} className="hover:bg-[#3d5a80] focus:bg-[#3d5a80] text-[#e0fbfc]">{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBrand && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Label className="text-[#e0fbfc]">Select Target Variant Configuration</Label>
                    <Select
                      value={selectedModel}
                      onValueChange={(modelName) => {
                        setSelectedModel(modelName)
                        const matchedRecord = database[selectedBrand]?.find(m => m.model === modelName)
                        if (matchedRecord) setSelectedPrice(matchedRecord.price)
                      }}
                    >
                      <SelectTrigger className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]">
                        <SelectValue placeholder="Choose specific design structure..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]">
                        {database[selectedBrand]?.map((m) => (
                          <SelectItem key={m.model} value={m.model} className="hover:bg-[#3d5a80] focus:bg-[#3d5a80] text-[#e0fbfc]">
                            {m.model} (P{m.price.toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedPrice > 0 && (
                  <div className="pt-4 border-t border-[#98c1d9]/20 space-y-4 animate-in fade-in duration-300">
                    <div className="bg-[#293241]/50 p-3 rounded border border-[#98c1d9]/10">
                      <p className="text-xs text-[#98c1d9]">Database Catalog Base Price:</p>
                      <p className="text-2xl font-mono font-bold text-[#ee6c4d]">P{selectedPrice.toLocaleString()}.00</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#e0fbfc] font-medium">Settlement Terms Method</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={paymentOption === "now" ? "default" : "outline"}
                          className={paymentOption === "now" ? "bg-[#ee6c4d] text-white font-bold" : "border-[#98c1d9]/30 text-[#98c1d9] bg-[#293241]"}
                          onClick={() => setPaymentOption("now")}
                        >
                          Pay Now (0% Fee)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={paymentOption === "later" ? "default" : "outline"}
                          className={paymentOption === "later" ? "bg-[#ee6c4d] text-white font-bold" : "border-[#98c1d9]/30 text-[#98c1d9] bg-[#293241]"}
                          onClick={() => setPaymentOption("later")}
                        >
                          Pay Later (Micro)
                        </Button>
                      </div>
                    </div>

                    {paymentOption === "later" && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="space-y-3">
                          <Label className="text-[#e0fbfc] font-medium">Payment Plan Cycle</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {(["Weekly", "15 Days", "Monthly"] as const).map((freq) => (
                              <Button
                                key={freq}
                                type="button"
                                size="sm"
                                variant={paymentFrequency === freq ? "default" : "outline"}
                                className={paymentFrequency === freq ? "bg-[#ee6c4d] text-white font-bold" : "border-[#98c1d9]/30 text-[#98c1d9] bg-[#293241]"}
                                onClick={() => setPaymentFrequency(freq)}
                              >
                                {freq}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[#e0fbfc]">Duration Period Limit (Months)</Label>
                          <Input
                            type="number"
                            min={1}
                            max={12}
                            value={paymentMonths}
                            onChange={(e) => setPaymentMonths(Math.max(1, parseInt(e.target.value) || 1))}
                            className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between bg-[#293241]/30 p-2 rounded border border-[#98c1d9]/5">
                      <span className="text-xs text-[#98c1d9] flex items-center gap-1">
                        <Info className="h-3 w-3 text-cyan-400" /> Microfinance Logistics Charge (+P50)
                      </span>
                      <input
                        type="checkbox"
                        checked={deliveryChargeEnabled}
                        onChange={(e) => setDeliveryChargeEnabled(e.target.checked)}
                        className="accent-[#ee6c4d] h-4 w-4 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div>
              {selectedPrice > 0 ? (
                <Card className="bg-[#3d5a80] border-[#ee6c4d]/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="bg-gradient-to-r from-[#ee6c4d] to-[#ee6c4d]/80 px-4 py-3">
                    <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                      <Calendar className="h-4 w-4" /> Amortization Matrix Terminal
                    </h3>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs text-[#98c1d9]">Rate Installment Plan:</span>
                      <p className="text-3xl font-mono font-black text-[#e0fbfc]">
                        P{processedInstallmentPlan.amortization.toFixed(2)} 
                        <span className="text-xs font-normal text-[#98c1d9] ml-1">
                          {paymentOption === "now" ? "/ outright sum" : "/ installment term"}
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#98c1d9]/20">
                      <div>
                        <span className="text-[#98c1d9]">Interest Fee {paymentOption === "now" ? "(0%)" : "(5% per month)"}:</span>
                        <p className="text-[#e0fbfc] font-mono font-semibold">
                          P{paymentOption === "now" ? "0.00" : (selectedPrice * 0.05 * paymentMonths).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-[#98c1d9]">Calculated Ledger Total:</span>
                        <p className="text-[#ee6c4d] font-mono font-bold">P{processedInstallmentPlan.grandTotal.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs text-[#e0fbfc] font-bold uppercase tracking-wider flex items-center gap-1">
                        🗓️ Generated Calendar Invoices Loop:
                      </span>
                      <div className="bg-[#293241] rounded border border-[#98c1d9]/10 max-h-40 overflow-y-auto divide-y divide-[#98c1d9]/10">
                        {processedInstallmentPlan.dateSchedules.map((date, index) => (
                          <div key={index} className="p-2 flex items-center justify-between text-xs font-mono">
                            <span className="text-[#98c1d9]">
                              {paymentOption === "now" ? "Fulfillment Statement:" : `Due Cycle Invoice #${index + 1}:`}
                            </span>
                            <span className="text-[#e0fbfc] font-medium">{date}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-[#ee6c4d] hover:bg-[#ee6c4d]/90 font-bold text-white transition-all shadow-md mt-2"
                      onClick={handleProcessInstallmentCheckout}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Account Ledger Timeline
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-[#3d5a80]/30 border-dashed border-[#98c1d9]/30">
                  <CardContent className="py-12 text-center text-[#98c1d9] text-sm">
                    Select a dynamic trademark loop profile above to review active payment matrices.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderContent = () => {
    switch (activeView) {
      case "e-loan":
        return (
          <ELoanSection 
            trustScore={userTrustScore} 
            onApplyLoan={handleApplyLoan}
            onBack={() => setActiveView("home")}
            isFullPage
          />
        )
      case "snacks":
        return (
          <SnacksSection 
            onAddToCart={handleAddToCart} 
            onBack={() => setActiveView("home")}
            isFullPage
          />
        )
      case "bugas":
        return (
          <BugasSection
            freeDeliveryEvent={freeDeliveryEvent}
            onAddToCart={(item) =>
              handleAddToCart({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                deliveryFee: item.deliveryFee,
              })
            }
            onAddToTimelineDirectly={handleAddToTimelineDirectly}
            onBack={() => setActiveView("home")}
            isFullPage
          />
        )
      case "sangla":
        return (
          <SanglaSection 
            onBack={() => setActiveView("home")}
            isFullPage
          />
        )
      case "gadgets":
        return renderHardwareSelectionView("gadgets")
      case "appliances":
        return renderHardwareSelectionView("appliances")
      case "timeline":
        return (
          <MyTimeline 
            items={timeline} 
            onPayItem={handlePayItem}
            onBack={() => setActiveView("home")}
            isFullPage
          />
        )
      case "admin":
        if (!isAdminAuthenticated) {
          return <AdminLogin onLogin={handleAdminLogin} />
        }
        return (
          <AdminDashboard
            customers={customers}
            stock={stock}
            todaySales={sales}
            freeDeliveryEvent={freeDeliveryEvent}
            onToggleFreeDelivery={handleToggleFreeDelivery}
            onUpdateTrustScore={handleUpdateTrustScore}
            onAddCustomer={handleAddCustomer}
            onUpdateStock={handleUpdateStock}
            onLogout={handleAdminLogout}
          />
        )
      default:
        return (
          <>
            <HeroSection onBrowseServices={handleBrowseServices} />
            <div ref={servicesRef}>
              <ServicesGrid onSelectService={handleNavigate} />
            </div>
          </>
        )
    }
  }

  return (
    <main className="min-h-screen bg-[#293241]">
      <Header 
        onNavigate={handleNavigate} 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
        showBackButton={showBackButton}
        currentSection={activeView}
      />
      
      {activeView === "home" ? (
        <>
          {/* 1. Main Hero Landing Section (Full-screen 100vh) */}
          <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-[#1a202c]">
            {/* White Office/Interior Background Image Asset */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 transition-transform duration-1000"
              style={{ backgroundImage: `url('/for the background.jpg')` }} 
            />
            {/* Balanced Dark Aesthetic Overlay Mask for Strong Contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-[#293241]" />

            {/* Essential Badges Container */}
            <div className="absolute top-24 z-10 flex flex-col items-center gap-3 px-4 w-full max-w-3xl text-center select-none">
              
              {/* Prominent "Dali ra!" Core Badge */}
              <div className="relative group animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#ee6c4d] to-amber-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
                <span className="relative block bg-gradient-to-r from-[#ee6c4d] to-[#d65a31] text-white font-black text-xs sm:text-sm md:text-base px-6 py-2 rounded-full shadow-2xl border border-white/20 tracking-wide">
                  ✨ Dali ra! Valid ID ra ang kailangan. Kuha na sa imong kinahanglanon!
                </span>
              </div>

              {/* Minor Operational Badges */}
              <div className="flex flex-wrap gap-2 justify-center mt-1 animate-in fade-in duration-1000 delay-300">
                <span className="bg-white/10 text-[#e0fbfc] backdrop-blur-md font-bold text-[10px] sm:text-xs uppercase tracking-widest px-3 py-1 rounded-md border border-white/10 shadow-sm">
                  DTI Registered
                </span>
                <span className="bg-white/10 text-[#e0fbfc] backdrop-blur-md font-bold text-[10px] sm:text-xs uppercase tracking-widest px-3 py-1 rounded-md border border-white/10 shadow-sm">
                  Business Permit
                </span>
                <span className="bg-white/10 text-[#e0fbfc] backdrop-blur-md font-bold text-[10px] sm:text-xs uppercase tracking-widest px-3 py-1 rounded-md border border-white/10 shadow-sm">
                  Always Open
                </span>
              </div>
            </div>

            {/* Centered Main Character Headline Typography */}
            <div className="relative z-10 text-center px-4 max-w-4xl select-none mt-12">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)]">
                Hello! How can I help you?
              </h1>
              <p className="text-[#e0fbfc]/80 font-medium text-sm sm:text-base md:text-lg mt-4 max-w-xl mx-auto drop-shadow-md">
                Your neighborhood digital ledger. Buy now, pay over time. Track every peso (₱) with confidence.
              </p>

              {/* Interactive Dashboard Control Buttons */}
              <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
                <button
                  onClick={handleBrowseServices}
                  className="bg-[#ee6c4d] hover:bg-[#d65a31] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <Layers className="h-4 w-4" />
                  Browse Services
                </button>
                
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-[#293241]/90 hover:bg-[#3d5a80] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all transform hover:scale-105 border border-[#3d5a80] flex items-center gap-2"
                >
                  <Search className="h-4 w-4 text-[#98c1d9]" />
                  Find My Account
                </button>
              </div>
            </div>

            {/* Scroll Indicator Prompt */}
            <div 
              className="absolute bottom-10 z-10 flex flex-col items-center gap-2 cursor-pointer group"
              onClick={handleBrowseServices}
            >
              <span className="text-xs text-white/60 font-bold tracking-widest uppercase group-hover:text-white transition-colors duration-300">
                Explore Terminal
              </span>
              <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-[#ee6c4d]/50 group-hover:bg-white/10 transition-all duration-300">
                <ArrowDown className="h-5 w-5 text-[#ee6c4d] animate-bounce" />
              </div>
            </div>
          </section>

          {/* 2. Services Grid Layout (Pushed down entirely out of initial viewport frame) */}
          <div ref={servicesRef} className="bg-[#293241] py-24 border-t border-[#3d5a80]/60">
            <div className="container mx-auto px-4">
              <ServicesGrid onSelectService={handleNavigate} />
            </div>
          </div>
        </>
      ) : (
        /* 3. Dedicated Isolated Sub-views (Replaces inline page scrolling) */
        <div className="pt-20 min-h-[calc(100vh-80px)] bg-[#293241] animate-in fade-in duration-300">
          <div className="container mx-auto px-4 pb-16">
            
            {/* Prominent Back to Home Button on Dedicated View layouts */}
            <div className="mb-6">
              <button
                onClick={() => handleNavigate("home")}
                className="inline-flex items-center gap-2 bg-[#1e2530] text-[#e0fbfc] hover:text-white px-5 py-2.5 rounded-xl border border-[#3d5a80] hover:border-[#ee6c4d] transition-all font-bold text-sm shadow-md group"
              >
                <span className="transform group-hover:-translate-x-1 transition-transform">←</span> 
                Back to Home
              </button>
            </div>
            
            {renderContent()}
          </div>
        </div>
      )}

      {/* Sidebar Shopping Drawer interface */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {/* Compliance Footer Unit */}
      <footer className="bg-[#1e2530] border-t border-[#3d5a80]/40 py-12">
        <div className="container mx-auto px-4 text-center space-y-5">
          <p className="text-[#98c1d9] font-bold text-base tracking-wide">
            Camotes Online Store & Microfinance Inc.
          </p>
          <p className="text-xs text-[#98c1d9]/50 max-w-md mx-auto leading-relaxed">
            DTI Corporate Registry No. 491023-A | Local Regulatory Operational Compliance Protocol | Since 2022
          </p>
          
          {/* Footer Address Node linked directly to your requested URL */}
          <div className="pt-2">
            <a
              href="https://maps.app.goo.gl/282URg4zgBT9yvAR7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#293241]/80 px-5 py-2.5 rounded-full border border-[#98c1d9]/10 text-[#98c1d9] hover:text-white hover:border-[#ee6c4d]/50 transition-all shadow-md group"
            >
              <MapPin className="h-4 w-4 text-[#ee6c4d] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold tracking-wide">Adela, Poro, Camotes, Cebu</span>
            </a>
          </div>

          <div className="pt-2">
            <a
              href="https://www.facebook.com/share/1BcP1N5D2S/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[11px] bg-[#ee6c4d]/10 px-4 py-2 rounded border border-[#ee6c4d]/20 text-[#ee6c4d] font-bold hover:bg-[#ee6c4d] hover:text-white transition-all tracking-wider uppercase"
            >
             Follow Official Facebook Page
      </a>
    </div>
 </div>
    </footer>

    {/* Account Verification Gateway Overlay */}
    <AccountModal 
      isOpen={authModalOpen}
      onClose={() => setAuthModalOpen(false)}
      onLoginSuccess={(mobile: string, name: string) => {
        console.log("Customer Verified Ledger Context Loaded:", mobile, name)
      }}
    />
  </main>
 )
}