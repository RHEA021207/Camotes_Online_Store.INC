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
import { MapPin } from "lucide-react"

// Sample data
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
  { id: "bodbod", name: "Bodbod", quantity: 2, category: "Snacks", price: 10, description: "Traditional rice cake" },
  { id: "shakoy", name: "Shakoy", quantity: 25, category: "Snacks", price: 10, description: "Twisted donut" },
  { id: "ubi-turon", name: "Ubi Turon", quantity: 1, category: "Snacks", price: 10, description: "Purple yam spring roll" },
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
  { id: "1", type: "loan", name: "E-Loan 3k - Week 2", amount: 550, dueDate: "Jan 20, 2026", status: "unpaid" },
  { id: "2", type: "purchase", name: "Bugas 25kl", amount: 1499.75, dueDate: "Jan 25, 2026", status: "unpaid" },
  { id: "3", type: "loan", name: "E-Loan 2k - Week 1", amount: 275, dueDate: "Jan 10, 2026", status: "overdue", penalty: 5.50 },
  { id: "4", type: "purchase", name: "Mango Float x2", amount: 178, dueDate: "Jan 05, 2026", status: "paid" },
]

type ActiveView = "home" | "services" | "e-loan" | "snacks" | "bugas" | "sangla" | "gadgets" | "appliances" | "timeline" | "admin"

export default function Home() {
  // State
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

  // Check admin auth on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem("cos-admin-auth")
    if (authStatus === "true") {
      setIsAdminAuthenticated(true)
    }
  }, [])

  // Refs for scrolling
  const servicesRef = useRef<HTMLDivElement>(null)

  // Navigation handler
  const handleNavigate = (section: string) => {
    const normalizedSection = section.toLowerCase().replace(/\s+/g, "-").replace("/", "-")
    
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

  // Scroll to services from hero
  const handleBrowseServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Cart handlers
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

  // Function to bridge dynamic items directly to Timeline (Java Logic #2)
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
    // Add to timeline as checkout purchases
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
      status: "unpaid" as const, // Changed to unpaid status to follow your transaction pipeline rules
    }))
    setTimeline((prev) => [...newTimelineItems, ...prev])
    setCart([])
    setCartOpen(false)
    setActiveView("timeline")
  }

  // Loan handler with computed calculations passed up
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

  // Timeline pay handler
  const handlePayItem = (id: string) => {
    setTimeline((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "paid" as const } : item))
    )
    
    // Add to sales log
    const paidItem = timeline.find((i) => i.id === id)
    if (paidItem) {
      const newSale: SaleItem = {
        id: `sale-${Date.now()}`,
        customerId: "COS-000",
        customerName: "Current User",
        item: paidItem.name,
        amount: paidItem.amount,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }
      setSales((prev) => [...prev, newSale])
    }
  }

  // Admin handlers
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

  // Determine if we should show back button
  const showBackButton = activeView !== "home"

  // Render content based on active view
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
            onAddToTimelineDirectly={handleAddToTimelineDirectly} // Passed down for processing calculation logs
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
        return (
          <section className="min-h-screen py-12 bg-[#3d5a80]/30">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-[#e0fbfc] text-center mb-4">Gadgets</h2>
              <p className="text-[#98c1d9] text-center mb-8">Coming soon! Contact us on Facebook for gadget inquiries.</p>
              <div className="text-center">
                <a
                  href="https://www.facebook.com/share/1BcP1N5D2S/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#1877f2] text-white px-6 py-3 rounded-lg hover:bg-[#166fe5] transition-colors"
                >
                  Message us on Facebook
                </a>
              </div>
            </div>
          </section>
        )
      case "appliances":
        return (
          <section className="min-h-screen py-12 bg-[#3d5a80]/30">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-[#e0fbfc] text-center mb-4">Appliances</h2>
              <p className="text-[#98c1d9] text-center mb-8">Coming soon! Contact us on Facebook for appliance inquiries.</p>
              <div className="text-center">
                <a
                  href="https://www.facebook.com/share/1BcP1N5D2S/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#1877f2] text-white px-6 py-3 rounded-lg hover:bg-[#166fe5] transition-colors"
                >
                  Message us on Facebook
                </a>
              </div>
            </div>
          </section>
        )
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
        cartCount={cart.length} 
        showBackButton={showBackButton}
        currentSection={activeView}
      />
      
      {renderContent()}

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {/* Footer */}
      <footer className="bg-[#293241] border-t border-[#3d5a80] py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#98c1d9] mb-2">
            Camotes Online Store - Microfinance Inc.
          </p>
          <p className="text-sm text-[#98c1d9]/70">
            DTI Registered | Business Permit | Since 2022
          </p>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-[#98c1d9] hover:text-[#e0fbfc] transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Adela, Poro, Camotes, Cebu</span>
          </a>
          <div className="mt-4">
            <a
              href="https://www.facebook.com/share/1BcP1N5D2S/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[#ee6c4d] hover:underline"
            >
              Follow us on Facebook
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}