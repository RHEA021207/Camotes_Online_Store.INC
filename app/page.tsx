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
import { supabase } from "@/lib/supabaseClient"
import { CUSTOMER_TABLE } from "@/lib/constants"
import { AdminLogin } from "@/components/admin-login"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
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

type ActiveView = "home" | "services" | "e-loan" | "snacks" | "bugas" | "sangla" | "gadgets" | "appliances" | "timeline" | "admin" | "orders" | "account"

export default function Home() {
  const [activeView, setActiveView] = useState<ActiveView>("home")
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [stock, setStock] = useState<StockItem[]>(initialStock)
  const [sales, setSales] = useState<SaleItem[]>(initialSales)
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline)
  const [orders, setOrders] = useState<{
    id: string
    type: "purchase" | "loan"
    name: string
    amount: number
    dueDate: string
    status: "on_the_way" | "delivered" | "completed" | "pending"
    createdAt: string
  }[]>([])
  const [freeDeliveryEvent, setFreeDeliveryEvent] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState(false)
  const [visitorShieldMessage, setVisitorShieldMessage] = useState<string>("")
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

    const activeCustomer = sessionStorage.getItem("cos-customer-profile")
    if (activeCustomer) {
      const profile = JSON.parse(activeCustomer) as Customer
      setCurrentCustomer(profile)
      setIsCustomerAuthenticated(true)
    }

    const storedCart = window.localStorage.getItem("cos-cart-items")
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart))
      } catch (error) {
        console.warn("Failed to restore cart from storage", error)
      }
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem("cos-cart-items", JSON.stringify(cart))
  }, [cart])

  const servicesRef = useRef<HTMLDivElement>(null)

  const showVisitorShield = (message: string) => {
    setVisitorShieldMessage(message)
    window.setTimeout(() => setVisitorShieldMessage(""), 5000)
  }

  const messengerUsername = "YOUR_FB_PAGE_USERNAME"
  const messengerBaseUrl = `https://m.me/${messengerUsername}`
  const inquiryUrl = "https://www.facebook.com/share/1BcP1N5D2S/"

  const createMessengerLink = (message: string) => {
    const encodedMessage = encodeURIComponent(message)
    return `${messengerBaseUrl}?ref=${encodedMessage}`
  }

  const handleInquire = () => {
    window.open(inquiryUrl, "_blank")
  }

  const buildMessengerMessage = (serviceName: string, price: number, deliveryMode?: string) => {
    const customerName = currentCustomer?.name || "Customer"
    const deliveryText = deliveryMode ? ` with a delivery mode of ${deliveryMode}` : ""
    return `Hi! I am logged in as ${customerName} and I want to order/apply for ${serviceName} priced at ₱${price.toFixed(2)}${deliveryText}.`
  }

  const handleMessengerOrder = (serviceName: string, price: number, deliveryMode?: string) => {
    if (!isCustomerAuthenticated || !currentCustomer) {
      showVisitorShield("Please visit our physical store location to register your customer profile account.")
      return
    }

    if (currentCustomer.standing === "restricted") {
      showVisitorShield("Your account is restricted. Please see our staff for assistance.")
      return
    }

    const message = buildMessengerMessage(serviceName, price, deliveryMode)
    window.open(createMessengerLink(message), "_blank")
  }

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
        if (!isCustomerAuthenticated) {
          showVisitorShield("Authentication required. Please log in first, or visit our physical store location to register your account credentials.")
          return
        }
        setActiveView("timeline")
        break
      case "admin":
        setActiveView("admin")
        break
      case "cart":
        if (!isCustomerAuthenticated) {
          showVisitorShield("Authentication required. Please log in first, or visit our physical store location to register your account credentials.")
          return
        }
        setCartOpen(true)
        break
      case "orders":
        if (!isCustomerAuthenticated) {
          showVisitorShield("Authentication required. Please log in first, or visit our physical store location to register your account credentials.")
          return
        }
        setActiveView("orders")
        break
      case "account":
        if (!isCustomerAuthenticated) {
          showVisitorShield("Authentication required. Please log in first, or visit our physical store location to register your account credentials.")
          return
        }
        setActiveView("account")
        break
      default:
        setActiveView("home")
        window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBrowseServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const addToCart = (item: CartItem) => {
    if (!isCustomerAuthenticated || !currentCustomer) {
      showVisitorShield("Please visit our physical store location to register your customer profile account.")
      return
    }

    if (currentCustomer.standing === "restricted") {
      showVisitorShield("Your account is restricted. Please see our staff for assistance.")
      return
    }

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

  const handleInquireItem = (_id: string) => {
    window.open(inquiryUrl, "_blank")
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
    if (!isCustomerAuthenticated || !currentCustomer) {
      showVisitorShield("Authentication required. Please log in first, or visit our physical store location to register your account credentials.")
      return
    }
    if (currentCustomer.standing === "restricted") {
      showVisitorShield("Your account is restricted. Ordering is temporarily disabled. Please visit our physical store for assistance.")
      return
    }

    if (cart.length === 0) {
      showVisitorShield("Your cart is empty. Add an item first before proceeding.")
      return
    }

    const cartSummary = cart
      .map((item) => `${item.quantity}x ${item.name}`)
      .join(", ")
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity + (item.deliveryFee || 0), 0)
    const message = `Hi! I am logged in as ${currentCustomer.name} and I want to order ${cartSummary} priced at ₱${totalAmount.toFixed(2)}.`
    window.open(createMessengerLink(message), "_blank")
    setCartOpen(false)
  }

  const handleApplyLoan = (amount: number, frequency: string, total: number, customDueDate?: string) => {
    if (!isCustomerAuthenticated || !currentCustomer) {
      showVisitorShield("Authentication required. Please log in first, or visit our physical store location to register your customer profile account.")
      return
    }
    if (currentCustomer.standing === "restricted") {
      showVisitorShield("Your account is restricted. Ordering is temporarily disabled. Please visit our physical store for assistance.")
      return
    }

    const serviceLabel = `E-Loan P${amount.toLocaleString()} (${frequency})`
    const deliveryText = customDueDate ? ` with due date ${customDueDate}` : ""
    const message = buildMessengerMessage(serviceLabel, total, deliveryText)
    window.open(createMessengerLink(message), "_blank")
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
    if (!isCustomerAuthenticated || !currentCustomer) {
      showVisitorShield("Please visit our physical store location to register your customer profile account.")
      return
    }
    if (currentCustomer.standing === "restricted") {
      showVisitorShield("Your account is restricted. Please see our staff for assistance.")
      return
    }

    const paymentModeLabel = paymentOption === "now" ? "Paid Outright" : `${paymentFrequency} Installment Plan`
    const descriptivePlanText = `${selectedBrand} ${selectedModel} (${paymentModeLabel})`
    handleMessengerOrder(descriptivePlanText, processedInstallmentPlan.grandTotal)
    
    setSelectedBrand("")
    setSelectedModel("")
    setSelectedPrice(0)
    setPaymentOption("now")
  }

  const handleToggleFreeDelivery = (value: boolean) => {
    setFreeDeliveryEvent(value)
  }

  const handleUpdateTrustScore = (customerId: string, score: "new" | "good" | "excellent" | "not_good") => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, trustScore: score } : c))
    )
  }

  const handleAddCustomer = async (customer: Omit<Customer, "id">) => {
    const newCustomer: Customer = {
      ...customer,
      id: `COS-${String(customers.length + 101).padStart(3, "0")}`,
    }

    try {
      const { data, error } = await supabase
        .from(CUSTOMER_TABLE)
        .insert([
          {
            name: customer.name,
            phone: customer.phone,
            username: customer.username,
            password: customer.password,
            trust_score: customer.trustScore,
            standing: customer.standing,
            balance: customer.balance,
            last_payment: customer.lastPayment,
          },
        ])
        .select('id')
        .single()

      if (!error && data && data.id) {
        newCustomer.id = data.id.toString()
      }
    } catch (err) {
      console.error('Unable to persist new customer to Supabase', err)
    }

    setCustomers((prev) => [...prev, newCustomer])
  }

  const handleUpdateCustomerStanding = async (customerId: string, standing: "good" | "restricted") => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, standing } : c))
    )
    if (currentCustomer?.id === customerId) {
      setCurrentCustomer({ ...currentCustomer, standing })
    }

    try {
      await supabase
        .from(CUSTOMER_TABLE)
        .update({ standing })
        .eq('id', customerId)
    } catch (err) {
      console.error('Unable to update customer standing in Supabase', err)
    }
  }

  const handleUpdateCustomer = async (customerId: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...updates } : c))
    )
    if (currentCustomer?.id === customerId) {
      setCurrentCustomer({ ...currentCustomer, ...updates })
    }

    const payload: Record<string, any> = {}
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.phone !== undefined) payload.phone = updates.phone
    if (updates.username !== undefined) payload.username = updates.username
    if (updates.password !== undefined) payload.password = updates.password
    if (updates.trustScore !== undefined) payload.trust_score = updates.trustScore
    if (updates.standing !== undefined) payload.standing = updates.standing

    if (Object.keys(payload).length === 0) return

    try {
      await supabase
        .from(CUSTOMER_TABLE)
        .update(payload)
        .eq('id', customerId)
    } catch (err) {
      console.error('Unable to update customer record in Supabase', err)
    }
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
            <Card className="bg-[#3d5a80] border-[#98c1d9] border-opacity-20 shadow-xl">
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
                    <SelectTrigger className="bg-[#293241] border-[#98c1d9] border-opacity-30 text-[#e0fbfc]">
                      <SelectValue placeholder={category === "gadgets" ? "Choose brand..." : "Choose appliance type..."} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#293241] border-[#98c1d9] border-opacity-30 text-[#e0fbfc]">
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
                      <SelectTrigger className="bg-[#293241] border-[#98c1d9] border-opacity-30 text-[#e0fbfc]">
                        <SelectValue placeholder="Choose specific design structure..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#293241] border-[#98c1d9] border-opacity-30 text-[#e0fbfc]">
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
                  <div className="pt-4 border-t border-[#98c1d9] border-opacity-20 space-y-4 animate-in fade-in duration-300">
                    <div className="bg-[#293241] bg-opacity-50 p-3 rounded border border-[#98c1d9] border-opacity-10">
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
                          className={paymentOption === "now" ? "bg-[#ee6c4d] text-white font-bold" : "border-[#98c1d9] border-opacity-30 text-[#98c1d9] bg-[#293241]"}
                          onClick={() => setPaymentOption("now")}
                        >
                          Pay Now (0% Fee)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={paymentOption === "later" ? "default" : "outline"}
                          className={paymentOption === "later" ? "bg-[#ee6c4d] text-white font-bold" : "border-[#98c1d9] border-opacity-30 text-[#98c1d9] bg-[#293241]"}
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
                                className={paymentFrequency === freq ? "bg-[#ee6c4d] text-white font-bold" : "border-[#98c1d9] border-opacity-30 text-[#98c1d9] bg-[#293241]"}
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
                            className="bg-[#293241] border-[#98c1d9] border-opacity-30 text-[#e0fbfc]"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between bg-[#293241] bg-opacity-30 p-2 rounded border border-[#98c1d9] border-opacity-5">
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
                <Card className="bg-[#3d5a80] border-[#ee6c4d] border-opacity-40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="bg-gradient-to-r from-[#ee6c4d] to-[#ee6c4d] to-opacity-80 px-4 py-3">
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

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#98c1d9] border-opacity-20">
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
                      <div className="bg-[#293241] rounded border border-[#98c1d9] border-opacity-10 max-h-40 overflow-y-auto divide-y divide-[#98c1d9]/10">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button
                        className="w-full bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 font-bold text-white transition-all shadow-md"
                        onClick={() => {
                          addToCart({
                            id: `${category}-${selectedBrand}-${selectedModel}-${paymentOption}`,
                            name: `${selectedBrand} ${selectedModel}${paymentOption === "later" ? ` (${paymentFrequency} ${paymentMonths}mo plan)` : ""}`,
                            price: processedInstallmentPlan.grandTotal,
                            quantity: 1,
                          })
                        }}
                        disabled={!selectedBrand || !selectedModel}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-[#e0fbfc] border-[#98c1d9] hover:bg-[#3d5a80]"
                        onClick={handleInquire}
                      >
                        Inquire Right Away
                      </Button>
                    </div>
                    {!isCustomerAuthenticated && (
                      <p className="mt-2 text-xs text-yellow-300">Log in to add items to cart; you can still inquire immediately.</p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-[#3d5a80] bg-opacity-30 border-dashed border-[#98c1d9] border-opacity-30">
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
            onAddToCart={(item) => addToCart(item)}
            onInquire={handleInquire}
            onBack={() => setActiveView("home")}
            isFullPage
          />
        )
      case "snacks":
        return (
          <SnacksSection 
            onAddToCart={(item) => addToCart(item)}
            onInquire={handleInquire}
            onBack={() => setActiveView("home")}
            isFullPage
            isCustomerAuthenticated={isCustomerAuthenticated}
          />
        )
      case "bugas":
        return (
          <BugasSection
            freeDeliveryEvent={freeDeliveryEvent}
            onAddToCart={(item) => addToCart(item)}
            onInquire={handleInquire}
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
      case "orders":
        return (
          <section className="py-12 bg-[#293241] min-h-screen">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-[#e0fbfc] mb-6">My Orders</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#98c1d9] mb-4">On the Way</h3>
                  <div className="space-y-3">
                    {orders.filter(o => o.status === 'on_the_way').length === 0 ? (
                      <div className="p-6 bg-[#3d5a80] rounded text-[#98c1d9]">No active shipments</div>
                    ) : (
                      orders.filter(o => o.status === 'on_the_way').map(o => (
                        <div key={o.id} className="p-4 bg-[#1d2430] rounded border border-[#98c1d9] border-opacity-10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[#e0fbfc] font-medium">{o.name}</p>
                              <p className="text-xs text-[#98c1d9]">{o.createdAt}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[#ee6c4d] font-bold">P{o.amount.toFixed(2)}</p>
                              <p className="text-xs text-[#98c1d9]">{o.status}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-[#98c1d9] mb-4">Order History</h3>
                  <div className="space-y-3">
                    {orders.filter(o => o.status === 'delivered' || o.status === 'completed').length === 0 ? (
                      <div className="p-6 bg-[#3d5a80] rounded text-[#98c1d9]">No past orders</div>
                    ) : (
                      orders.filter(o => o.status === 'delivered' || o.status === 'completed').map(o => (
                        <div key={o.id} className="p-4 bg-[#1d2430] rounded border border-[#98c1d9] border-opacity-10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[#e0fbfc] font-medium">{o.name}</p>
                              <p className="text-xs text-[#98c1d9]">{o.createdAt}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[#ee6c4d] font-bold">P{o.amount.toFixed(2)}</p>
                              <p className="text-xs text-[#98c1d9]">{o.status}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      case "account":
        return (
          <section className="relative overflow-hidden bg-[#293241] py-24">
            <div className="absolute inset-0">
              <Image
                src="/images/hero-background.jpg"
                alt="Account dashboard background"
                fill
                className="object-cover object-center opacity-20"
                priority
              />
              <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
            </div>
            <div className="relative z-10 container mx-auto px-4">
              <div className="rounded-[2rem] border border-white/10 bg-[#1d2430]/75 backdrop-blur-xl p-8 shadow-2xl">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#98c1d9] mb-2">My Account</p>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white">Profile Summary & Visibility</h1>
                    <p className="mt-3 max-w-2xl text-sm text-[#c8d6df]">
                      A dedicated account dashboard for your profile metrics, payment status, and customer standing.
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 mt-10 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl bg-[#293241]/80 border border-[#98c1d9]/10 p-6">
                    <p className="text-sm text-[#98c1d9] uppercase tracking-[0.3em] mb-3">Account Status</p>
                    <p className="text-3xl font-bold text-white">{currentCustomer?.standing === "good" ? "Good Standing" : "Restricted"}</p>
                    <p className="mt-2 text-sm text-[#c8d6df]">Your current customer standing determines service access.</p>
                  </div>
                  <div className="rounded-3xl bg-[#293241]/80 border border-[#98c1d9]/10 p-6">
                    <p className="text-sm text-[#98c1d9] uppercase tracking-[0.3em] mb-3">Trust Score</p>
                    <p className="text-3xl font-bold text-white">{currentCustomer?.trustScore ?? "N/A"}</p>
                    <p className="mt-2 text-sm text-[#c8d6df]">A quick snapshot of your customer trust and reliability.</p>
                  </div>
                  <div className="rounded-3xl bg-[#293241]/80 border border-[#98c1d9]/10 p-6">
                    <p className="text-sm text-[#98c1d9] uppercase tracking-[0.3em] mb-3">Current Balance</p>
                    <p className="text-3xl font-bold text-white">P{currentCustomer?.balance.toFixed(2) ?? "0.00"}</p>
                    <p className="mt-2 text-sm text-[#c8d6df]">Outstanding balance as of your latest activity.</p>
                  </div>
                  <div className="rounded-3xl bg-[#293241]/80 border border-[#98c1d9]/10 p-6">
                    <p className="text-sm text-[#98c1d9] uppercase tracking-[0.3em] mb-3">Last Payment</p>
                    <p className="text-3xl font-bold text-white">{currentCustomer?.lastPayment ?? "N/A"}</p>
                    <p className="mt-2 text-sm text-[#c8d6df]">Most recent payment or account update timestamp.</p>
                  </div>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-3xl bg-[#293241]/80 border border-[#98c1d9]/10 p-6">
                    <h2 className="text-xl font-semibold text-[#e0fbfc]">Profile Details</h2>
                    <div className="mt-6 space-y-4 text-sm text-[#98c1d9]">
                      <div>
                        <p className="text-[#c8d6df]">Name</p>
                        <p className="font-semibold text-white">{currentCustomer?.name ?? "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[#c8d6df]">Customer ID</p>
                        <p className="font-semibold text-white">{currentCustomer?.id ?? "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[#c8d6df]">Standing</p>
                        <p className="font-semibold text-white">{currentCustomer?.standing === "good" ? "Good" : "Restricted"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-[#293241]/80 border border-[#98c1d9]/10 p-6">
                    <h2 className="text-xl font-semibold text-[#e0fbfc]">Account Visibility</h2>
                    <p className="mt-4 text-sm text-[#98c1d9]">
                      This view is intentionally focused on account metrics and profile data. Browse Services is available only from the landing hero or global navigation links.
                    </p>
                    <div className="mt-6 space-y-3 text-sm text-[#c8d6df]">
                      <div className="rounded-2xl bg-[#1e2530] p-4 border border-[#98c1d9]/10">
                        <p className="font-semibold text-white">Customer Balance</p>
                        <p className="text-[#98c1d9]">Review your current outstanding amounts and payments.</p>
                      </div>
                      <div className="rounded-2xl bg-[#1e2530] p-4 border border-[#98c1d9]/10">
                        <p className="font-semibold text-white">Service Access</p>
                        <p className="text-[#98c1d9]">Account standing is used to gate access to orders and timeline features.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
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
            onUpdateCustomerStanding={handleUpdateCustomerStanding}
            onUpdateCustomer={handleUpdateCustomer}
            onAddCustomer={handleAddCustomer}
            onUpdateStock={handleUpdateStock}
            onLogout={handleAdminLogout}
          />
        )
      default:
        return (
          <>
            <HeroSection onBrowseServices={handleBrowseServices} onFindAccount={() => setAuthModalOpen(true)} />
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
      {visitorShieldMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-w-lg w-full bg-[#1d2430] border border-[#98c1d9] border-opacity-20 rounded-lg p-6">
            <h3 className="text-lg font-bold text-[#e0fbfc] mb-2">Authentication required</h3>
            <p className="text-sm text-[#98c1d9] mb-4">Authentication required. Please log in first, or visit our physical store location to register your account credentials.</p>
            <div className="flex justify-end">
              <button className="bg-[#ee6c4d] text-white px-4 py-2 rounded" onClick={() => setVisitorShieldMessage("")}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {activeView === "home" ? (
        <>
          <HeroSection onBrowseServices={handleBrowseServices} onFindAccount={() => setAuthModalOpen(true)} />
          <div ref={servicesRef} className="bg-[#293241] py-24 border-t border-[#3d5a80] border-opacity-60">
            <div className="container mx-auto px-4">
              <ServicesGrid onSelectService={handleNavigate} />
            </div>
          </div>
        </>
      ) : (
        /* 3. Dedicated Isolated Sub-views */
        <div className="pt-20 min-h-[calc(100vh-80px)] bg-[#293241] animate-in fade-in duration-300">
          <div className="container mx-auto px-4 pb-16">
            
            {renderContent()}
          </div>
        </div>
      )}

      {/* Sidebar Shopping Drawer interface */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onContinueShopping={() => {
          setCartOpen(false)
          handleNavigate("services")
        }}
        items={cart}
        onInquireItem={handleInquireItem}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {/* Compliance Footer Unit */}
      <footer className="bg-[#293241] py-12">
        <div className="container mx-auto px-4 text-center space-y-2">
          {/* Main Headline Label */}
          <p className="text-[#e0fbfc] font-medium text-base tracking-wide">
            Camotes Online Store - Microfinance Inc.
          </p>
          
          {/* Secondary Verification Subtitle */}
          <p className="text-xs text-[#98c1d9] text-opacity-70 font-normal">
            DTI Registered | Business Permit | Since 2022
          </p>
          
          {/* Interactive Dynamic Location Node */}
          <div className="pt-1 flex items-center justify-center">
            <a
              href="https://maps.app.goo.gl/Uszepx1VXhfvWNkh7" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#98c1d9] text-opacity-70 hover:text-[#ee6c4d] transition-colors duration-200 group"
            >
              {/* MapPin / Navigation Marker Icon Component */}
              <MapPin className="h-3.5 w-3.5 text-[#98c1d9] text-opacity-70 group-hover:text-[#ee6c4d] transition-colors" />
              <span>Adela, Poro, Camotes, Cebu</span>
            </a>
          </div>
          
          {/* Direct Social Link Anchor */}
          <div className="pt-4">
            <a
              href="https://www.facebook.com/share/1BcP1N5D2S/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#ee6c4d] font-semibold hover:underline tracking-wide transition-all"
            >
              Follow us on Facebook
            </a>
          </div>
        </div>
      </footer>

      {/* Account Verification Gateway Overlay */}
      <AccountModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(customer: any) => {
          // Set active customer session and unlock customer features
          setCurrentCustomer(customer)
          setIsCustomerAuthenticated(true)
          try {
            sessionStorage.setItem('cos-customer-profile', JSON.stringify(customer))
          } catch (e) {
            console.warn('Unable to persist customer session to sessionStorage', e)
          }
          setAuthModalOpen(false)
        }}
      />
    </main>
  )
}