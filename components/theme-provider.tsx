"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

// Define a unified structural blueprint for all items/products
export interface ProductItem {
  id: string
  name: string
  description: string
  priceText?: string
  category: "e-loan" | "bugas" | "snacks" | "gadgets" | "appliances" | "sangla"
}

interface ServiceContextType {
  products: ProductItem[]
  updateProduct: (id: string, updatedFields: Partial<ProductItem>) => void
  addProduct: (product: Omit<ProductItem, "id">) => void
  deleteProduct: (id: string) => void
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

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ProductItem[]>([])

  // Hydrate initial dataset state safely via local storage memory lookup
  useEffect(() => {
    const saved = localStorage.getItem("camotes_products")
    if (saved) {
      setProducts(JSON.parse(saved))
    } else {
      setProducts(initialMockProducts)
      localStorage.setItem("camotes_products", JSON.stringify(initialMockProducts))
    }
  }, [])

  const updateProduct = (id: string, updatedFields: Partial<ProductItem>) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
      localStorage.setItem("camotes_products", JSON.stringify(next))
      return next
    })
  }

  const addProduct = (newFields: Omit<ProductItem, "id">) => {
    setProducts((prev) => {
      const next = [...prev, { ...newFields, id: crypto.randomUUID() }]
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

  return (
    <ServiceContext.Provider value={{ products, updateProduct, addProduct, deleteProduct }}>
      {children}
    </ServiceContext.Provider>
  )
}

export function useServices() {
  const context = useContext(ServiceContext)
  if (!context) throw new Error("useServices must be executed within a ServiceProvider wrapper context.")
  return context
}