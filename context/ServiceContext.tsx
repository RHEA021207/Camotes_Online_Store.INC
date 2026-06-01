"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

// Define a unified structural blueprint for all items/products
export interface ProductItem {
  id: string
  name: string
  description: string
  price?: number
  deliveryFee?: number
  stockStatus?: "available" | "low_stock" | "sold_out" | "out_of_stock"
  brand?: string
  priceText?: string
  category: "e-loan" | "bugas" | "snacks" | "gadgets" | "appliances" | "sangla" | string
  image?: string
}

export interface CategoryConfig {
  id: string
  categoryName: string
  categoryKey: string
  minAmount: number
  maxAmount: number
  deliveryFee: number
  description?: string
  items: CategoryItem[]
  createdAt: string
}

export interface CategoryItem {
  id: string
  name: string
  amount?: number
  description?: string
}

export interface CreditTransaction {
  id: string
  customerId: string
  customerName: string
  categoryKey: string
  categoryName: string
  amount: number
  dueDate: string
  repaymentTimeline: string // e.g., "30 days", "60 days", "kinsenas", "binuwan", "senimana"
  status: "active" | "paid" | "overdue"
  createdAt: string
  paidAt?: string
}

export interface AdminLoginRecord {
  id: string
  username: string
  timestamp: string
  action: "login_success" | "login_failed"
}

export interface AdminCredentials {
  username: string
  password: string
}

interface ServiceContextType {
  products: ProductItem[]
  updateProduct: (id: string, updatedFields: Partial<ProductItem>) => void
  addProduct: (product: Omit<ProductItem, "id"> & { id?: string }) => void
  deleteProduct: (id: string) => void
  adminLoginHistory: AdminLoginRecord[]
  logAdminLogin: (username: string, action: "login_success" | "login_failed") => void
  adminCredentials: AdminCredentials
  updateAdminCredentials: (newUsername: string, newPassword: string) => void
  penaltyFeePercentage: number
  setPenaltyFeePercentage: (percentage: number) => void
  categoryConfigs: CategoryConfig[]
  updateCategoryConfig: (categoryKey: string, config: Partial<CategoryConfig>) => void
  addCategoryConfig: (config: Omit<CategoryConfig, "id" | "createdAt">) => void
  creditTransactions: CreditTransaction[]
  createCreditTransaction: (transaction: Omit<CreditTransaction, "id" | "createdAt" | "status">) => void
  updateCreditTransaction: (id: string, updates: Partial<CreditTransaction>) => void
  deleteCreditTransaction: (id: string) => void
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined)

// Mock fallback list representing your current static grid layout items
const initialMockProducts: ProductItem[] = [
  { id: "1", name: "E-Loan", description: "Quick cash loans from 1k-10k. Kinsenas, Binuwan, or Senimana payment modes.", category: "e-loan" },
  { id: "2", name: "Bugas (Rice)", description: "Quality rice at P59.99/kg. Available in 5kl, 10kl, 25kl, and 50kl installments.", category: "bugas" },
  { id: "3", name: "Snacks", description: "Bodbod, Shakoy, Ubi Turon, Mango Float, Cookies & Cream, and Munchkins.", category: "snacks" },
  { id: "4", name: "Gadgets", description: "Vivo, Realme, Infinix, Redmi, Oppo, Tecno, Nubia. Pay Now or Pay Later options.", category: "gadgets" },
  { id: "5", name: "Appliances", description: "Refrigerators, Washing Machines, TVs, and Speakers with flexible payments.", category: "appliances" },
  { id: "6", name: "Sangla/Prenda", description: "Pawn your Appliances, Gadgets, Motorcycles, or Cars for instant cash.", category: "sangla" },
]

// Initial category configurations with amounts and delivery fees
const initialCategoryConfigs: CategoryConfig[] = [
  {
    id: "cat-1",
    categoryName: "E-Loan Distribution",
    categoryKey: "e-loan",
    minAmount: 1000,
    maxAmount: 10000,
    deliveryFee: 0,
    items: [
      { id: "item-1", name: "1k Loan", amount: 1000 },
      { id: "item-2", name: "3k Loan", amount: 3000 },
      { id: "item-3", name: "5k Loan", amount: 5000 },
      { id: "item-4", name: "10k Loan", amount: 10000 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-2",
    categoryName: "Bugas (Rice Supply)",
    categoryKey: "bugas",
    minAmount: 50,
    maxAmount: 500,
    deliveryFee: 25,
    items: [
      { id: "item-5", name: "5kg Rice", amount: 299 },
      { id: "item-6", name: "10kg Rice", amount: 599 },
      { id: "item-7", name: "25kg Rice", amount: 1500 },
      { id: "item-8", name: "50kg Rice", amount: 2999 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-3",
    categoryName: "Snacks / Food Products",
    categoryKey: "snacks",
    minAmount: 50,
    maxAmount: 300,
    deliveryFee: 15,
    items: [
      { id: "item-9", name: "Bodbod", amount: 50 },
      { id: "item-10", name: "Shakoy", amount: 60 },
      { id: "item-11", name: "Mango Float", amount: 80 },
      { id: "item-12", name: "Cookies & Cream", amount: 100 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-4",
    categoryName: "Gadgets & Phones",
    categoryKey: "gadgets",
    minAmount: 5000,
    maxAmount: 50000,
    deliveryFee: 50,
    items: [
      { id: "item-13", name: "Realme Smartphone", amount: 8000 },
      { id: "item-14", name: "Infinix Smartphone", amount: 6000 },
      { id: "item-15", name: "Redmi Smartphone", amount: 12000 },
      { id: "item-16", name: "Vivo Smartphone", amount: 15000 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-5",
    categoryName: "Appliances",
    categoryKey: "appliances",
    minAmount: 5000,
    maxAmount: 50000,
    deliveryFee: 100,
    items: [
      { id: "item-17", name: "Refrigerator", amount: 25000 },
      { id: "item-18", name: "Washing Machine", amount: 15000 },
      { id: "item-19", name: "TV 32-inch", amount: 12000 },
      { id: "item-20", name: "Speaker System", amount: 8000 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-6",
    categoryName: "Sangla / Prenda Pawn",
    categoryKey: "sangla",
    minAmount: 1000,
    maxAmount: 100000,
    deliveryFee: 0,
    items: [
      { id: "item-21", name: "Pawn Jewelry", amount: 5000 },
      { id: "item-22", name: "Pawn Gadgets", amount: 8000 },
      { id: "item-23", name: "Pawn Motorcycle", amount: 30000 },
      { id: "item-24", name: "Pawn Vehicle", amount: 50000 },
    ],
    createdAt: new Date().toISOString(),
  },
]

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [adminLoginHistory, setAdminLoginHistory] = useState<AdminLoginRecord[]>([])
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>({
    username: "admin",
    password: "cos2022"
  })
  const [penaltyFeePercentage, setPenaltyFeePercent] = useState<number>(2)
  const [categoryConfigs, setCategoryConfigs] = useState<CategoryConfig[]>([])
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([])

  // Hydrate initial dataset state safely via local storage memory lookup
  useEffect(() => {
    const saved = localStorage.getItem("camotes_products")
    if (saved) {
      setProducts(JSON.parse(saved))
    } else {
      setProducts(initialMockProducts)
      localStorage.setItem("camotes_products", JSON.stringify(initialMockProducts))
    }

    // Load admin credentials from localStorage
    const savedAdminCreds = localStorage.getItem("camotes_admin_credentials")
    if (savedAdminCreds) {
      setAdminCredentials(JSON.parse(savedAdminCreds))
    }

    // Load admin login history from localStorage
    const savedLoginHistory = localStorage.getItem("camotes_admin_login_history")
    if (savedLoginHistory) {
      setAdminLoginHistory(JSON.parse(savedLoginHistory))
    }

    // Load penalty fee percentage from localStorage
    const savedPenaltyFee = localStorage.getItem("camotes_penalty_fee")
    if (savedPenaltyFee) {
      setPenaltyFeePercent(parseFloat(savedPenaltyFee))
    }

    // Load category configs from localStorage
    const savedCategoryConfigs = localStorage.getItem("camotes_category_configs")
    if (savedCategoryConfigs) {
      setCategoryConfigs(JSON.parse(savedCategoryConfigs))
    } else {
      setCategoryConfigs(initialCategoryConfigs)
      localStorage.setItem("camotes_category_configs", JSON.stringify(initialCategoryConfigs))
    }

    // Load credit transactions from localStorage
    const savedCreditTransactions = localStorage.getItem("camotes_credit_transactions")
    if (savedCreditTransactions) {
      setCreditTransactions(JSON.parse(savedCreditTransactions))
    }
  }, [])

  const updateProduct = (id: string, updatedFields: Partial<ProductItem>) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
      localStorage.setItem("camotes_products", JSON.stringify(next))
      return next
    })
  }

  const addProduct = (newFields: Omit<ProductItem, "id"> & { id?: string }) => {
    setProducts((prev) => {
      const next = [...prev, { ...newFields, id: newFields.id ?? crypto.randomUUID() }]
      localStorage.setItem("camotes_products", JSON.stringify(next))
      return next
    })
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id)
      localStorage.setItem("camotes_products", JSON.stringify(next))
      return next
    })
  }

  const logAdminLogin = (username: string, action: "login_success" | "login_failed") => {
    const newRecord: AdminLoginRecord = {
      id: crypto.randomUUID(),
      username,
      timestamp: new Date().toISOString(),
      action
    }
    setAdminLoginHistory((prev) => {
      const next = [...prev, newRecord]
      localStorage.setItem("camotes_admin_login_history", JSON.stringify(next))
      return next
    })
  }

  const updateAdminCredentials = (newUsername: string, newPassword: string) => {
    const updated = { username: newUsername, password: newPassword }
    setAdminCredentials(updated)
    localStorage.setItem("camotes_admin_credentials", JSON.stringify(updated))
  }

  const setPenaltyFeePercentage = (percentage: number) => {
    const validPercentage = Math.max(0, Math.min(100, percentage))
    setPenaltyFeePercent(validPercentage)
    localStorage.setItem("camotes_penalty_fee", validPercentage.toString())
  }

  const updateCategoryConfig = (categoryKey: string, config: Partial<CategoryConfig>) => {
    setCategoryConfigs((prev) => {
      const next = prev.map((cat) =>
        cat.categoryKey === categoryKey ? { ...cat, ...config } : cat
      )
      localStorage.setItem("camotes_category_configs", JSON.stringify(next))
      return next
    })
  }

  const addCategoryConfig = (config: Omit<CategoryConfig, "id" | "createdAt">) => {
    setCategoryConfigs((prev) => {
      const next = [
        ...prev,
        {
          ...config,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem("camotes_category_configs", JSON.stringify(next))
      return next
    })
  }

  const createCreditTransaction = (transaction: Omit<CreditTransaction, "id" | "createdAt" | "status">) => {
    setCreditTransactions((prev) => {
      const next = [
        ...prev,
        {
          ...transaction,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          status: "active" as const,
        },
      ]
      localStorage.setItem("camotes_credit_transactions", JSON.stringify(next))
      return next
    })
  }

  const updateCreditTransaction = (id: string, updates: Partial<CreditTransaction>) => {
    setCreditTransactions((prev) => {
      const next = prev.map((trans) => (trans.id === id ? { ...trans, ...updates } : trans))
      localStorage.setItem("camotes_credit_transactions", JSON.stringify(next))
      return next
    })
  }

  const deleteCreditTransaction = (id: string) => {
    setCreditTransactions((prev) => {
      const next = prev.filter((trans) => trans.id !== id)
      localStorage.setItem("camotes_credit_transactions", JSON.stringify(next))
      return next
    })
  }

  return (
    <ServiceContext.Provider value={{ 
      products, 
      updateProduct, 
      addProduct, 
      deleteProduct,
      adminLoginHistory,
      logAdminLogin,
      adminCredentials,
      updateAdminCredentials,
      penaltyFeePercentage,
      setPenaltyFeePercentage,
      categoryConfigs,
      updateCategoryConfig,
      addCategoryConfig,
      creditTransactions,
      createCreditTransaction,
      updateCreditTransaction,
      deleteCreditTransaction
    }}>
      {children}
    </ServiceContext.Provider>
  )
}

export function useServices() {
  const context = useContext(ServiceContext)
  if (!context) throw new Error("useServices must be executed within a ServiceProvider wrapper context.")
  return context
}