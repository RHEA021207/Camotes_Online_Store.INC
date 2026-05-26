"use client"

import { useState, type DragEvent } from "react"
import { 
  Search, 
  Users, 
  AlertTriangle, 
  Package, 
  Receipt, 
  Plus, 
  Shield,
  TrendingUp,
  Calendar,
  Gift,
  Edit2,
  Check,
  X,
  LogOut,
  DollarSign,
  Truck,
  Trash2,
  Settings,
  Lock,
  History,
  CreditCard,
  Zap,
  Tag
} from "lucide-react"
import { useServices, type ProductItem } from "@/context/ServiceContext" // <-- Wire state sync engine
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"

export interface Customer {
  id: string
  name: string
  trustScore: "new" | "good" | "excellent" | "not_good"
  balance: number
  lastPayment: string
  phone?: string
  standing?: "good" | "restricted"
}

export interface StockItem {
  id: string
  name: string
  quantity: number
  category: string
  price?: number
  description?: string
  status?: "available" | "out_of_stock"
  deliveryFee?: number
}

export interface SaleItem {
  id: string
  customerId: string
  customerName: string
  item: string
  amount: number
  timestamp: string
}

interface AdminDashboardProps {
  customers: Customer[]
  stock: StockItem[]
  todaySales: SaleItem[]
  freeDeliveryEvent: boolean
  onToggleFreeDelivery: (value: boolean) => void
  onUpdateTrustScore: (customerId: string, score: "new" | "good" | "excellent" | "not_good") => void
  onUpdateCustomerStanding?: (customerId: string, standing: "good" | "restricted") => void
  onAddCustomer: (customer: Omit<Customer, "id">) => void
  onUpdateStock?: (stockId: string, updates: Partial<StockItem>) => void
  onLogout: () => void
}

export function AdminDashboard({
  customers,
  stock,
  todaySales,
  freeDeliveryEvent,
  onToggleFreeDelivery,
  onUpdateTrustScore,
  onUpdateCustomerStanding,
  onAddCustomer,
  onUpdateStock,
  onLogout,
}: AdminDashboardProps) {
  // Pull live state variables directly from Context Engine
  const { products, updateProduct, addProduct, deleteProduct, adminCredentials, updateAdminCredentials, penaltyFeePercentage, setPenaltyFeePercentage, adminLoginHistory, categoryConfigs, updateCategoryConfig, addCategoryConfig, creditTransactions, createCreditTransaction, updateCreditTransaction, deleteCreditTransaction } = useServices()

  const [searchQuery, setSearchQuery] = useState("")
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", trustScore: "new" as const, standing: "good" as const })
  const [editingStockId, setEditingStockId] = useState<string | null>(null)
  const [editingStockData, setEditingStockData] = useState<Partial<StockItem>>({})
  
  // Admin account settings state
  const [showAdminSettings, setShowAdminSettings] = useState(false)
  const [adminUsername, setAdminUsername] = useState(adminCredentials.username)
  const [adminPassword, setAdminPassword] = useState(adminCredentials.password)
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState(adminCredentials.password)
  const [adminSettingsError, setAdminSettingsError] = useState("")
  const [adminSettingsSuccess, setAdminSettingsSuccess] = useState(false)
  
  // Penalty fee state
  const [editingPenaltyFee, setEditingPenaltyFee] = useState(false)
  const [tempPenaltyFee, setTempPenaltyFee] = useState(penaltyFeePercentage)

  // Category management state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryConfigs[0]?.categoryKey || "e-loan")
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryData, setEditingCategoryData] = useState<any>(null)
  const [addingNewCategoryItem, setAddingNewCategoryItem] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemAmount, setNewItemAmount] = useState(0)

  // Credit tracking state
  const [showCreditForm, setShowCreditForm] = useState(false)
  const [creditFormData, setCreditFormData] = useState({
    customerId: "",
    customerName: "",
    categoryKey: "e-loan",
    categoryName: "E-Loan Distribution",
    amount: 0,
    dueDate: "",
    repaymentTimeline: "30 days"
  })

  // Form states for creating a whole new service / category card 
  const [showAddProductForm, setShowAddProductForm] = useState(false)
  const [newProdName, setNewProdName] = useState("")
  const [newProdDesc, setNewProdDesc] = useState("")
  const [newProdCat, setNewProdCat] = useState<"e-loan" | "bugas" | "snacks" | "gadgets" | "appliances" | "sangla">("snacks")
  const [newProdImageFile, setNewProdImageFile] = useState<File | null>(null)
  const [newProdImagePreview, setNewProdImagePreview] = useState<string>("")
  const [draggingNewImage, setDraggingNewImage] = useState(false)
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null)
  const [imageUploadError, setImageUploadError] = useState<string>("")

  // Track which metric stat box is clicked/filtered
  const [activeStatFilter, setActiveStatFilter] = useState<"all" | "customers" | "sales" | "low_stock" | "transactions">("all")

  // State for custom date receipt selection filters
  const [salesTimeframe, setSalesTimeframe] = useState<string>("day")
  const [customValue, setCustomValue] = useState<number>(1)
  const [customUnit, setCustomUnit] = useState<string>("days")
  const [receiptHeading, setReceiptHeading] = useState<string>("Daily Sales Receipt")
  
  const lowStockItems = stock.filter((item) => item.quantity < 3)
  
  // Handler for saving admin account settings
  const handleSaveAdminSettings = () => {
    setAdminSettingsError("")
    setAdminSettingsSuccess(false)

    if (!adminUsername.trim()) {
      setAdminSettingsError("Username cannot be empty")
      return
    }

    if (!adminPassword || adminPassword.length < 4) {
      setAdminSettingsError("Password must be at least 4 characters")
      return
    }

    if (adminPassword !== adminPasswordConfirm) {
      setAdminSettingsError("Passwords do not match")
      return
    }

    // Update the admin credentials
    updateAdminCredentials(adminUsername, adminPassword)
    setAdminSettingsSuccess(true)
    setTimeout(() => {
      setShowAdminSettings(false)
      setAdminSettingsSuccess(false)
    }, 2000)
  }

  // Handler for saving penalty fee
  const handleSavePenaltyFee = () => {
    setPenaltyFeePercentage(tempPenaltyFee)
    setEditingPenaltyFee(false)
  }

  // Category management handlers
  const handleEditCategory = (categoryKey: string) => {
    const category = categoryConfigs.find((c) => c.categoryKey === categoryKey)
    if (category) {
      setEditingCategoryId(categoryKey)
      setEditingCategoryData({ ...category })
    }
  }

  const handleSaveCategory = () => {
    if (editingCategoryData && selectedCategory) {
      updateCategoryConfig(selectedCategory, editingCategoryData)
      setEditingCategoryId(null)
      setEditingCategoryData(null)
    }
  }

  const handleAddCategoryItem = () => {
    if (editingCategoryData && newItemName.trim() && newItemAmount > 0) {
      const newItem = {
        id: crypto.randomUUID(),
        name: newItemName,
        amount: newItemAmount,
      }
      setEditingCategoryData({
        ...editingCategoryData,
        items: [...(editingCategoryData.items || []), newItem],
      })
      setNewItemName("")
      setNewItemAmount(0)
      setAddingNewCategoryItem(false)
    }
  }

  const handleRemoveCategoryItem = (itemId: string) => {
    if (editingCategoryData) {
      setEditingCategoryData({
        ...editingCategoryData,
        items: editingCategoryData.items.filter((item: any) => item.id !== itemId),
      })
    }
  }

  // Credit tracking handlers
  const handleCreateCredit = () => {
    if (creditFormData.customerId.trim() && creditFormData.customerName.trim() && creditFormData.amount > 0 && creditFormData.dueDate) {
      createCreditTransaction({
        customerId: creditFormData.customerId,
        customerName: creditFormData.customerName,
        categoryKey: creditFormData.categoryKey,
        categoryName: creditFormData.categoryName,
        amount: creditFormData.amount,
        dueDate: creditFormData.dueDate,
        repaymentTimeline: creditFormData.repaymentTimeline,
      })
      setCreditFormData({
        customerId: "",
        customerName: "",
        categoryKey: "e-loan",
        categoryName: "E-Loan Distribution",
        amount: 0,
        dueDate: "",
        repaymentTimeline: "30 days"
      })
      setShowCreditForm(false)
    }
  }

  const handleMarkCreditPaid = (transactionId: string) => {
    updateCreditTransaction(transactionId, { status: "paid", paidAt: new Date().toISOString() })
  }

  const currentCategory = categoryConfigs.find((c) => c.categoryKey === selectedCategory)
  
  // Apply filtering to customers based on query search
  const filteredCustomers = customers.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Date receipt calculation filtering logic
  const getFilteredSales = () => {
    const now = new Date();
    
    return todaySales.filter((sale) => {
      const saleDate = new Date(sale.timestamp);
      if (isNaN(saleDate.getTime())) return true;

      if (salesTimeframe === "month") {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      } else if (salesTimeframe === "year") {
        return saleDate.getFullYear() === now.getFullYear();
      } else if (salesTimeframe === "custom" || salesTimeframe === "custom_days" || salesTimeframe === "others_days") {
        const daysAgo = new Date();
        daysAgo.setDate(now.getDate() - customValue);
        daysAgo.setHours(0, 0, 0, 0); 
        return saleDate >= daysAgo;
      }
      return true;
    });
  };

  const activeSalesItems = getFilteredSales()
  const totalSalesToday = activeSalesItems.reduce((sum, sale) => sum + sale.amount, 0)

  const handleAddCustomer = () => {
    if (newCustomer.name.trim() && newCustomer.phone.trim()) {
      onAddCustomer({
        name: newCustomer.name,
        phone: newCustomer.phone,
        trustScore: newCustomer.trustScore,
        standing: newCustomer.standing,
        balance: 0,
        lastPayment: "N/A",
      })
      setNewCustomer({ name: "", phone: "", trustScore: "new", standing: "good" })
      setShowAddCustomer(false)
    }
  }

  const uploadProductImage = async (file: File) => {
    setImageUploadError("")
    const sanitizedFilename = `${crypto.randomUUID()}-${file.name.replace(/\s+/g, "-")}`
    const storagePath = `products/${sanitizedFilename}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError)
      setImageUploadError('Unable to upload image. Please try again.')
      return null
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath)

    return publicUrlData?.publicUrl || null
  }

  const updateProductImageRecord = async (product: ProductItem, imageUrl: string) => {
    if (!imageUrl) return

    const { data, error } = await supabase
      .from('store_services')
      .update({ image: imageUrl })
      .select('id')
      .eq('id', product.id)

    if (error) {
      console.error('Supabase image URL update failed:', error)
      return
    }

    if (!data || data.length === 0) {
      const { error: fallbackError } = await supabase
        .from('store_services')
        .update({ image: imageUrl })
        .match({ name: product.name, category: product.category })

      if (fallbackError) {
        console.error('Supabase image URL fallback update failed:', fallbackError)
      }
    }
  }

  const handleCreateNewProduct = async () => {
    if (!newProdName.trim() || !newProdDesc.trim()) return

    let imageUrl: string | null = null
    if (newProdImageFile) {
      imageUrl = await uploadProductImage(newProdImageFile)
    }

    try {
      const { data, error } = await supabase
        .from('store_services')
        .insert([
          {
            name: newProdName,
            description: newProdDesc,
            category: newProdCat,
            image: imageUrl || null,
            created_at: new Date().toISOString(),
          }
        ])
        .select('id')
        .single()

      if (error) {
        console.error('Error saving to Supabase:', error)
      }

      addProduct({
        id: data?.id?.toString(),
        name: newProdName,
        description: newProdDesc,
        category: newProdCat,
        image: imageUrl || undefined,
      })
    } catch (err) {
      console.error('Supabase insert error:', err)
      addProduct({
        name: newProdName,
        description: newProdDesc,
        category: newProdCat,
        image: imageUrl || undefined,
      })
    }

    setNewProdName("")
    setNewProdDesc("")
    setNewProdImageFile(null)
    setNewProdImagePreview("")
    setShowAddProductForm(false)
  }

  const handleNewProductFileChange = (file: File | null) => {
    if (!file) return
    setNewProdImageFile(file)
    setNewProdImagePreview(URL.createObjectURL(file))
  }

  const handleNewProductDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDraggingNewImage(false)
    const file = event.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleNewProductFileChange(file)
    }
  }

  const handleProductImageUpload = async (file: File, product: ProductItem) => {
    setUploadingProductId(product.id)
    const imageUrl = await uploadProductImage(file)

    if (imageUrl) {
      await updateProductImageRecord(product, imageUrl)
      updateProduct(product.id, { image: imageUrl })
    }

    setUploadingProductId(null)
  }

  const startEditingStock = (item: StockItem) => {
    setEditingStockId(item.id)
    setEditingStockData({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      description: item.description,
      status: item.status || "available",
      deliveryFee: item.deliveryFee || 0
    })
  }

  const saveStockEdit = () => {
    if (editingStockId && onUpdateStock) {
      onUpdateStock(editingStockId, editingStockData)
    }
    setEditingStockId(null)
    setEditingStockData({})
  }

  const cancelStockEdit = () => {
    setEditingStockId(null)
    setEditingStockData({})
  }

  const handleStatusChange = (customerId: string, newStatus: string) => {
    onUpdateTrustScore(customerId, newStatus as "new" | "good" | "excellent" | "not_good")
  }

  const handleStandingToggle = (customerId: string, standing: "good" | "restricted") => {
    if (onUpdateCustomerStanding) {
      onUpdateCustomerStanding(customerId, standing)
    }
  }

  return (
    <section className="py-12 bg-[#293241]" id="admin">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#98c1d9]" />
            <div>
              <h2 className="text-3xl font-bold text-[#e0fbfc]">Admin Dashboard</h2>
              <p className="text-[#98c1d9]">Manage customers, inventory, and storefront services</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-red-400 text-red-400 hover:bg-red-400/20"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="mb-8">
            <Card className="bg-red-500/10 border-red-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-400 flex items-center gap-2 font-bold text-xl">
                  <AlertTriangle className="h-6 w-6" />
                  LOW STOCK ALERT!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-bold border border-red-400"
                    >
                      {item.name}: {item.quantity} left
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Penalty Fee Info */}
        <Card className="bg-yellow-500/10 border-yellow-500/30 mb-8">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-medium">Penalty Fee Policy</p>
                <p className="text-sm text-[#98c1d9]">
                  A {penaltyFeePercentage}% penalty fee is automatically applied to overdue payments. 
                  Formula: Penalty = Outstanding Balance x {(penaltyFeePercentage / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card 
            onClick={() => setActiveStatFilter(activeStatFilter === "customers" ? "all" : "customers")}
            className={`cursor-pointer transition-all border ${activeStatFilter === "customers" ? "bg-[#ee6c4d] border-white" : "bg-[#3d5a80] border-[#98c1d9]/30 hover:border-[#98c1d9]"}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-400/20">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-[#98c1d9]">Total Customers</p>
                  <p className="text-2xl font-bold text-[#e0fbfc]">{customers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setActiveStatFilter(activeStatFilter === "sales" ? "all" : "sales")}
            className={`cursor-pointer transition-all border ${activeStatFilter === "sales" ? "bg-[#ee6c4d] border-white" : "bg-[#3d5a80] border-[#98c1d9]/30 hover:border-[#98c1d9]"}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-400/20">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-[#98c1d9]">{"Today's Sales"}</p>
                  <p className="text-2xl font-bold text-[#ee6c4d]">
                    P{totalSalesToday.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setActiveStatFilter(activeStatFilter === "low_stock" ? "all" : "low_stock")}
            className={`cursor-pointer transition-all border ${activeStatFilter === "low_stock" ? "bg-[#ee6c4d] border-white" : "bg-[#3d5a80] border-[#98c1d9]/30 hover:border-[#98c1d9]"}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-400/20">
                  <Package className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-[#98c1d9]">Low Stock Items</p>
                  <p className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-red-400' : 'text-[#e0fbfc]'}`}>
                    {lowStockItems.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setActiveStatFilter(activeStatFilter === "transactions" ? "all" : "transactions")}
            className={`cursor-pointer transition-all border ${activeStatFilter === "transactions" ? "bg-[#ee6c4d] border-white" : "bg-[#3d5a80] border-[#98c1d9]/30 hover:border-[#98c1d9]"}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-400/20">
                  <Receipt className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-[#98c1d9]">Transactions</p>
                  <p className="text-2xl font-bold text-[#e0fbfc]">{activeSalesItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Free Delivery Toggle */}
        <Card className="bg-[#3d5a80] border-[#98c1d9]/30 mb-8">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-[#e0fbfc] font-medium">Free Delivery Event</p>
                  <p className="text-sm text-[#98c1d9]">
                    Toggle to enable/disable free delivery for all orders
                  </p>
                </div>
              </div>
              <Switch
                checked={freeDeliveryEvent}
                onCheckedChange={onToggleFreeDelivery}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* ========================================================================= */}
        {/* LIVE STOREFRONT BROWSE SERVICES SYSTEM CONTROL BOARD                     */}
        {/* ========================================================================= */}
        <Card className="bg-[#3d5a80] border-[#98c1d9]/30 mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-[#e0fbfc] flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#ee6c4d]" />
                  Browse Services Content Editor
                </CardTitle>
                <CardDescription className="text-[#98c1d9]">
                  Manage service categories, items, amounts, and delivery fees
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowAddProductForm(!showAddProductForm)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add New Service
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Create New Dynamic Block Entry Form */}
            {showAddProductForm && (
              <div className="bg-[#293241] p-4 rounded-xl border border-emerald-500/30 space-y-3">
                <p className="text-sm font-bold text-emerald-400">Launch New Service Channel</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[#e0fbfc] text-xs">Product/Service Title</Label>
                    <Input 
                      placeholder="e.g., Special Premium Mango Float" 
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="bg-[#3d5a80] border-[#98c1d9]/20 text-white h-9 mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-[#e0fbfc] text-xs">Structural Category Grouping</Label>
                    <Select value={newProdCat} onValueChange={(v: any) => setNewProdCat(v)}>
                      <SelectTrigger className="bg-[#3d5a80] border-[#98c1d9]/20 text-white h-9 mt-1 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#293241] text-white">
                        <SelectItem value="snacks">Snacks / Food Products</SelectItem>
                        <SelectItem value="gadgets">Gadgets & Phones</SelectItem>
                        <SelectItem value="e-loan">E-Loan Distribution</SelectItem>
                        <SelectItem value="bugas">Bugas (Rice Supply)</SelectItem>
                        <SelectItem value="appliances">Appliances</SelectItem>
                        <SelectItem value="sangla">Sangla / Prenda Pawn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-[#e0fbfc] text-xs">Storefront Display Description text</Label>
                  <Textarea 
                    placeholder="Enter customer info, pricing layouts, tiers, installments..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="bg-[#3d5a80] border-[#98c1d9]/20 text-white mt-1 text-xs"
                    rows={2}
                  />
                </div>
                <div
                  className={`rounded-xl border-2 border-dashed p-4 text-center ${draggingNewImage ? 'border-emerald-400 bg-emerald-500/10' : 'border-[#98c1d9]/30 bg-[#1d2430]'}`}
                  onDragOver={(e) => { e.preventDefault(); setDraggingNewImage(true) }}
                  onDragLeave={() => setDraggingNewImage(false)}
                  onDrop={handleNewProductDrop}
                >
                  <input
                    id="new-product-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleNewProductFileChange(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="new-product-image" className="cursor-pointer text-sm text-[#e0fbfc]">
                    {newProdImagePreview ? 'Drop a new image here or click to replace' : 'Drag an image here or click to upload a product photo'}
                  </label>
                  {newProdImagePreview && (
                    <div className="mt-3 flex justify-center">
                      <img
                        src={newProdImagePreview}
                        alt="Preview"
                        className="h-28 rounded-xl object-cover border border-[#98c1d9]/20"
                      />
                    </div>
                  )}
                  {imageUploadError && <p className="mt-2 text-xs text-rose-400">{imageUploadError}</p>}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" className="text-slate-400" onClick={() => setShowAddProductForm(false)}>Cancel</Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreateNewProduct}>Deploy to App</Button>
                </div>
              </div>
            )}

            {/* Category Selection Tabs */}
            <div className="space-y-4">
              <p className="text-sm font-bold text-[#e0fbfc]">Select Category to Manage</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {categoryConfigs.map((cat) => (
                  <Button
                    key={cat.categoryKey}
                    onClick={() => {
                      setSelectedCategory(cat.categoryKey)
                      setEditingCategoryId(null)
                      setEditingCategoryData(null)
                    }}
                    className={`text-xs font-bold h-auto py-2 ${
                      selectedCategory === cat.categoryKey
                        ? "bg-[#ee6c4d] text-white"
                        : "bg-[#293241] text-[#98c1d9] hover:bg-[#3d5a80]"
                    }`}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {cat.categoryName.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Management Panel */}
            {currentCategory && (
              <div className="bg-[#293241] p-4 rounded-lg border border-[#98c1d9]/20 space-y-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-[#e0fbfc]">{currentCategory.categoryName}</h4>
                    <p className="text-xs text-[#98c1d9]">Manage amounts, items, and delivery fees</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white"
                    onClick={() => handleEditCategory(selectedCategory!)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit Settings
                  </Button>
                </div>

                {editingCategoryId === selectedCategory && editingCategoryData ? (
                  <div className="space-y-3 bg-[#1d2430] p-3 rounded border border-[#98c1d9]/30">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-[#98c1d9] text-xs">Min Amount (P)</Label>
                        <Input
                          type="number"
                          value={editingCategoryData.minAmount}
                          onChange={(e) => setEditingCategoryData({ ...editingCategoryData, minAmount: parseInt(e.target.value) || 0 })}
                          className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-[#98c1d9] text-xs">Max Amount (P)</Label>
                        <Input
                          type="number"
                          value={editingCategoryData.maxAmount}
                          onChange={(e) => setEditingCategoryData({ ...editingCategoryData, maxAmount: parseInt(e.target.value) || 0 })}
                          className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-[#98c1d9] text-xs">Delivery Fee (P)</Label>
                        <Input
                          type="number"
                          value={editingCategoryData.deliveryFee}
                          onChange={(e) => setEditingCategoryData({ ...editingCategoryData, deliveryFee: parseInt(e.target.value) || 0 })}
                          className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#e0fbfc]">Items in Category ({editingCategoryData.items?.length || 0})</p>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7"
                          onClick={() => setAddingNewCategoryItem(true)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Item
                        </Button>
                      </div>

                      {addingNewCategoryItem && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Item name"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] h-8 text-sm flex-1"
                          />
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={newItemAmount}
                            onChange={(e) => setNewItemAmount(parseInt(e.target.value) || 0)}
                            className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] h-8 text-sm w-24"
                          />
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 h-8" onClick={handleAddCategoryItem}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8" onClick={() => setAddingNewCategoryItem(false)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {editingCategoryData.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between bg-[#3d5a80] p-2 rounded text-xs text-[#e0fbfc]">
                            <span>{item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[#ee6c4d] font-bold">P{item.amount}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 text-red-400 hover:bg-red-400/20"
                                onClick={() => handleRemoveCategoryItem(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" className="text-slate-400" onClick={() => setEditingCategoryId(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={handleSaveCategory}>
                        <Check className="h-4 w-4 mr-1" /> Save Category
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-[#3d5a80] rounded">
                      <span className="text-[#98c1d9]">Amount Range:</span>
                      <span className="text-[#e0fbfc] font-bold">P{currentCategory.minAmount} - P{currentCategory.maxAmount}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-[#3d5a80] rounded">
                      <span className="text-[#98c1d9]">Delivery Fee:</span>
                      <span className="text-[#e0fbfc] font-bold">P{currentCategory.deliveryFee}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-[#3d5a80] rounded">
                      <span className="text-[#98c1d9]">Total Items:</span>
                      <span className="text-[#e0fbfc] font-bold">{currentCategory.items?.length || 0}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Editable Data Table for Landing Page Elements */}
            <div className="overflow-x-auto border border-[#98c1d9]/10 rounded-xl mt-4">
              <Table>
                <TableHeader className="bg-[#293241]">
                  <TableRow className="border-[#98c1d9]/20 hover:bg-transparent">
                    <TableHead className="text-[#e0fbfc] font-bold w-[20%]">Service Header</TableHead>
                    <TableHead className="text-[#e0fbfc] font-bold w-[12%]">Category</TableHead>
                    <TableHead className="text-[#e0fbfc] font-bold w-[42%]">Customer Info Text Description</TableHead>
                    <TableHead className="text-[#e0fbfc] font-bold w-[15%]">Image</TableHead>
                    <TableHead className="text-[#e0fbfc] font-bold text-right w-[11%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-[#1d2430]/40">
                  {products.map((prod) => (
                    <TableRow key={prod.id} className="border-[#98c1d9]/10 hover:bg-[#293241]/30">
                      <TableCell className="font-bold text-[#e0fbfc] text-xs">
                        <Input 
                          value={prod.name}
                          onChange={(e) => updateProduct(prod.id, { name: e.target.value })}
                          className="bg-transparent border-none focus-visible:ring-1 focus-visible:ring-[#ee6c4d] p-1 h-7 text-white font-bold"
                        />
                      </TableCell>
                      <TableCell className="text-xs capitalize text-sky-400 font-semibold">
                        {prod.category}
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={prod.description}
                          onChange={(e) => updateProduct(prod.id, { description: e.target.value })}
                          className="bg-transparent border-none focus-visible:ring-1 focus-visible:ring-[#ee6c4d] p-1 h-7 text-slate-300 text-xs w-full"
                        />
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-14 w-14 overflow-hidden rounded-lg border border-[#98c1d9]/20 bg-[#1d2430]">
                            {prod.image ? (
                              <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wide text-[#98c1d9]">
                                No Photo
                              </div>
                            )}
                          </div>
                          <label className="cursor-pointer rounded-md border border-[#98c1d9]/30 bg-[#293241] px-2 py-1 text-[10px] font-bold uppercase text-[#e0fbfc] hover:bg-[#3d5a80]">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  handleProductImageUpload(file, prod)
                                }
                              }}
                            />
                            {uploadingProductId === prod.id ? 'Uploading...' : 'Set Image'}
                          </label>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteProduct(prod.id)}
                          className="h-7 w-7 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        {/* ========================================================================= */}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Customer Management */}
          <Card className={`bg-[#3d5a80] border-[#98c1d9]/30 ${activeStatFilter !== "all" && activeStatFilter !== "customers" ? "ring-2 ring-amber-500" : ""}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#e0fbfc]">Customer Management</CardTitle>
                  <CardDescription className="text-[#98c1d9]">
                    Search by ID or name
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  className="bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white"
                  onClick={() => setShowAddCustomer(!showAddCustomer)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Customer Form */}
              {showAddCustomer && (
                <div className="bg-[#293241] p-4 rounded-lg space-y-3 mb-4">
                  <div className="space-y-2">
                    <Label className="text-[#e0fbfc]">Customer Name</Label>
                    <Input
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[#e0fbfc]">Phone Number</Label>
                      <Input
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                        placeholder="09123456789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#e0fbfc]">Account Standing</Label>
                      <Select
                        value={newCustomer.standing}
                        onValueChange={(v: "good" | "restricted") =>
                          setNewCustomer({ ...newCustomer, standing: v })
                        }
                      >
                        <SelectTrigger className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#293241] text-white">
                          <SelectItem value="good">Good Standing</SelectItem>
                          <SelectItem value="restricted">Restricted Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#e0fbfc]">Initial Trust Score</Label>
                    <Select
                      value={newCustomer.trustScore}
                      onValueChange={(v: "new" | "good" | "excellent" | "not_good") =>
                        setNewCustomer({ ...newCustomer, trustScore: v })
                      }
                    >
                      <SelectTrigger className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#3d5a80] border-[#98c1d9]">
                        <SelectItem value="new" className="text-[#e0fbfc]">New</SelectItem>
                        <SelectItem value="good" className="text-[#e0fbfc]">Good Payer</SelectItem>
                        <SelectItem value="excellent" className="text-[#e0fbfc]">Excellent</SelectItem>
                        <SelectItem value="not_good" className="text-red-400">Not Good</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleAddCustomer}
                  >
                    Add Customer
                  </Button>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98c1d9]" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]"
                />
              </div>

              {/* Customer List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 bg-[#293241] rounded-lg"
                  >
                    <div>
                      <p className="text-[#e0fbfc] font-medium">{customer.name}</p>
                      <p className="text-xs text-[#98c1d9]">{customer.id}</p>
                      {customer.phone && (
                        <p className="text-xs text-[#98c1d9]">{customer.phone}</p>
                      )}
                      {customer.balance > 0 && (
                        <p className="text-xs text-red-400">Balance: P{customer.balance.toFixed(2)}</p>
                      )}
                      {customer.standing === "restricted" && (
                        <p className="text-[11px] font-bold text-red-500 uppercase mt-0.5">🚫 Restricted Account</p>
                      )}
                    </div>
                    
                    {/* Right Side Status Editor Dropdown */}
                    <div className="flex items-center gap-2">
                      <Select 
                        value={customer.trustScore} 
                        onValueChange={(newStatus) => handleStatusChange(customer.id, newStatus)}
                      >
                        <SelectTrigger className="w-[130px] h-8 bg-[#3d5a80] border-[#98c1d9]/30 text-white text-xs font-bold uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#293241] text-white border-[#98c1d9]/20">
                          <SelectItem value="excellent" className="text-emerald-400 font-bold focus:bg-slate-700">EXCELLENT</SelectItem>
                          <SelectItem value="good" className="text-sky-400 font-bold focus:bg-slate-700">GOOD</SelectItem>
                          <SelectItem value="new" className="text-amber-400 font-bold focus:bg-slate-700">NEW</SelectItem>
                          <SelectItem value="not_good" className="text-rose-400 font-bold focus:bg-slate-700">NOT GOOD</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant={customer.standing === "restricted" ? "destructive" : "secondary"}
                        className="h-8 text-[10px] uppercase tracking-wider"
                        onClick={() => handleStandingToggle(customer.id, customer.standing === "restricted" ? "good" : "restricted")}
                      >
                        {customer.standing === "restricted" ? "Restore" : "Restrict"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Sales Receipt */}
          <Card className={`bg-[#3d5a80] border-[#98c1d9]/30 ${activeStatFilter !== "all" && activeStatFilter !== "sales" && activeStatFilter !== "transactions" ? "ring-2 ring-amber-500" : ""}`}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-[#e0fbfc] flex items-center gap-2 transition-all">
                    <Calendar className="h-5 w-5 text-[#ee6c4d]" />
                    {receiptHeading}
                  </CardTitle>
                  <CardDescription className="text-[#98c1d9]">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Select value={salesTimeframe} onValueChange={(value) => setSalesTimeframe(value)}>
                    <SelectTrigger className="w-[180px] bg-[#293241] text-white border-[#98c1d9]/30">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#293241] text-white">
                      <SelectItem value="day">Today</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="custom">Others...</SelectItem>
                    </SelectContent>
                  </Select>

                  {salesTimeframe === 'custom' && (
                    <div className="flex items-center gap-2 mt-2">
                      <input 
                        type="number" 
                        min="1" 
                        className="border rounded p-1 w-16 text-black"
                        value={customValue}
                        onChange={(e) => setCustomValue(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <select 
                        value={customUnit} 
                        onChange={(e) => setCustomUnit(e.target.value)}
                        className="border rounded p-1 text-black"
                      >
                        <option value="days">Days Ago</option>
                        <option value="months">Months Ago</option>
                        <option value="years">Years Ago</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeSalesItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#98c1d9]/30">
                        <TableHead className="text-[#98c1d9]">Customer</TableHead>
                        <TableHead className="text-[#98c1d9]">Item</TableHead>
                        <TableHead className="text-right text-[#98c1d9]">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeSalesItems.map((sale) => (
                        <TableRow key={sale.id} className="border-[#98c1d9]/30">
                          <TableCell className="text-[#e0fbfc]">{sale.customerName}</TableCell>
                          <TableCell className="text-[#98c1d9]">{sale.item}</TableCell>
                          <TableCell className="text-right text-[#ee6c4d] font-medium">
                            P{sale.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#98c1d9]/30">
                    <span className="text-[#e0fbfc] font-bold">Total</span>
                    <span className="text-[#ee6c4d] font-bold text-xl">
                      P{totalSalesToday.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-[#98c1d9]/50 mx-auto mb-4" />
                  <p className="text-[#98c1d9]">No sales recorded for this timeframe</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Inventory Overview with Live Editing */}
        <Card className={`bg-[#3d5a80] border-[#98c1d9]/30 mt-8 ${activeStatFilter !== "all" && activeStatFilter !== "low_stock" ? "ring-2 ring-amber-500" : ""}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#e0fbfc] flex items-center gap-2">
                <Package className="h-5 w-5" />
                Physical Product Inventory Overview
              </CardTitle>
              <p className="text-xs text-[#98c1d9]">Click edit icon to modify items</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stock
                .filter((item) => activeStatFilter === "low_stock" ? item.quantity < 3 : true)
                .map((item) => {
                  const isLowStock = item.quantity < 3
                  const isEditing = editingStockId === item.id

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg relative ${
                        isLowStock
                          ? "bg-red-500/20 border-2 border-red-500"
                          : "bg-[#293241] border border-[#98c1d9]/30"
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editingStockData.name || ""}
                            onChange={(e) => setEditingStockData({ ...editingStockData, name: e.target.value })}
                            className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] text-sm h-8"
                            placeholder="Name"
                          />
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={editingStockData.price || ""}
                              onChange={(e) => setEditingStockData({ ...editingStockData, price: parseFloat(e.target.value) })}
                              className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] text-sm h-8"
                              placeholder="Price"
                            />
                            <Input
                              type="number"
                              value={editingStockData.quantity ?? ""}
                              onChange={(e) => setEditingStockData({ ...editingStockData, quantity: parseInt(e.target.value) })}
                              className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] text-sm h-8 w-20"
                              placeholder="Qty"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Select
                              value={editingStockData.status || "available"}
                              onValueChange={(v: "available" | "out_of_stock") => setEditingStockData({ ...editingStockData, status: v })}
                            >
                              <SelectTrigger className="h-8 bg-[#3d5a80] text-white border-[#98c1d9]/30 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#293241] text-white">
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="out_of_stock">Sold out</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              disabled={freeDeliveryEvent}
                              value={freeDeliveryEvent ? 0 : (editingStockData.deliveryFee || "")}
                              onChange={(e) => setEditingStockData({ ...editingStockData, deliveryFee: parseFloat(e.target.value) })}
                              className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] text-sm h-8"
                              placeholder="Delivery fee"
                            />
                          </div>

                          <Input
                            value={editingStockData.description || ""}
                            onChange={(e) => setEditingStockData({ ...editingStockData, description: e.target.value })}
                            className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] text-sm h-8"
                            placeholder="Description"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-500 hover:bg-green-600 h-8"
                              onClick={saveStockEdit}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-red-400 text-red-400 hover:bg-red-400/20 h-8"
                              onClick={cancelStockEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            className="absolute top-2 right-2 text-[#98c1d9] hover:text-[#e0fbfc]"
                            onClick={() => startEditingStock(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <p className={`font-medium ${isLowStock ? "text-red-400" : "text-[#e0fbfc]"}`}>
                            {item.name}
                          </p>
                          <p className={`text-2xl font-bold ${isLowStock ? "text-red-400" : "text-[#98c1d9]"}`}>
                            {item.quantity} left
                          </p>
                          <p className="text-xs text-[#98c1d9]">{item.category}</p>
                          {item.price && (
                            <p className="text-sm text-[#ee6c4d] mt-1">P{item.price.toFixed(2)}</p>
                          )}

                          <div className="mt-2 space-y-1">
                            {freeDeliveryEvent ? (
                              <p className="text-xs text-orange-400 font-bold flex items-center gap-1 animate-pulse">
                                <Truck className="h-3 w-3" /> Free delivery
                              </p>
                            ) : (
                              <p className="text-xs text-slate-400">
                                Delivery: {item.deliveryFee && item.deliveryFee > 0 ? `P${item.deliveryFee.toFixed(2)}` : "None"}
                              </p>
                            )}
                            <p className={`text-xs font-bold ${item.quantity <= 0 || item.status === "out_of_stock" ? "text-red-400" : "text-green-400"}`}>
                              Status: {item.quantity <= 0 || item.status === "out_of_stock" ? "Sold Out" : "Available"}
                            </p>
                          </div>

                          {item.description && (
                            <p className="text-xs text-[#98c1d9]/70 mt-1">{item.description}</p>
                          )}
                          {isLowStock && (
                            <div className="mt-2 text-xs text-red-400 font-bold uppercase">
                              Restock needed!
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Customer Timeline Status Legend */}
        <Card className="bg-[#3d5a80] border-[#98c1d9]/30 mt-8">
          <CardHeader>
            <CardTitle className="text-[#e0fbfc]">Timeline Status Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-sm text-[#e0fbfc]">Unpaid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-sm text-[#e0fbfc]">Overdue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-sm text-[#e0fbfc]">Fully Paid</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Tracking / Utang Area */}
        <Card className="bg-[#3d5a80] border-[#98c1d9]/30 mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#ee6c4d]" />
                <div>
                  <CardTitle className="text-[#e0fbfc]">Credit Tracking (Utang Area)</CardTitle>
                  <CardDescription className="text-[#98c1d9]">
                    Manage customer credit, loans, and payment schedules
                  </CardDescription>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white"
                onClick={() => setShowCreditForm(!showCreditForm)}
              >
                <Plus className="h-4 w-4 mr-1" />
                {showCreditForm ? "Cancel" : "Create Credit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showCreditForm && (
              <div className="bg-[#293241] p-4 rounded-lg border border-[#ee6c4d]/30 space-y-3">
                <p className="text-sm font-bold text-[#ee6c4d]">Create New Credit Transaction</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[#e0fbfc] text-xs">Customer ID</Label>
                    <Input
                      value={creditFormData.customerId}
                      onChange={(e) => setCreditFormData({ ...creditFormData, customerId: e.target.value })}
                      className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] h-9 mt-1 text-sm"
                      placeholder="e.g., CUST-001"
                    />
                  </div>
                  <div>
                    <Label className="text-[#e0fbfc] text-xs">Customer Name</Label>
                    <Input
                      value={creditFormData.customerName}
                      onChange={(e) => setCreditFormData({ ...creditFormData, customerName: e.target.value })}
                      className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] h-9 mt-1 text-sm"
                      placeholder="Customer name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[#e0fbfc] text-xs">Service Category</Label>
                    <Select
                      value={creditFormData.categoryKey}
                      onValueChange={(value) => {
                        const cat = categoryConfigs.find((c) => c.categoryKey === value)
                        setCreditFormData({
                          ...creditFormData,
                          categoryKey: value,
                          categoryName: cat?.categoryName || value,
                        })
                      }}
                    >
                      <SelectTrigger className="bg-[#3d5a80] border-[#98c1d9]/30 text-white h-9 mt-1 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#293241] text-white">
                        {categoryConfigs.map((cat) => (
                          <SelectItem key={cat.categoryKey} value={cat.categoryKey}>
                            {cat.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#e0fbfc] text-xs">Credit Amount (P)</Label>
                    <Input
                      type="number"
                      value={creditFormData.amount}
                      onChange={(e) => setCreditFormData({ ...creditFormData, amount: parseInt(e.target.value) || 0 })}
                      className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] h-9 mt-1 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[#e0fbfc] text-xs">Due Date</Label>
                    <Input
                      type="date"
                      value={creditFormData.dueDate}
                      onChange={(e) => setCreditFormData({ ...creditFormData, dueDate: e.target.value })}
                      className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc] h-9 mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-[#e0fbfc] text-xs">Repayment Timeline</Label>
                    <Select value={creditFormData.repaymentTimeline} onValueChange={(v) => setCreditFormData({ ...creditFormData, repaymentTimeline: v })}>
                      <SelectTrigger className="bg-[#3d5a80] border-[#98c1d9]/30 text-white h-9 mt-1 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#293241] text-white">
                        <SelectItem value="7 days">7 Days (Weekly)</SelectItem>
                        <SelectItem value="14 days">14 Days (Bi-weekly)</SelectItem>
                        <SelectItem value="30 days">30 Days (Monthly)</SelectItem>
                        <SelectItem value="60 days">60 Days (2 Months)</SelectItem>
                        <SelectItem value="90 days">90 Days (3 Months)</SelectItem>
                        <SelectItem value="kinsenas">Kinsenas (5 months)</SelectItem>
                        <SelectItem value="binuwan">Binuwan (2 weeks)</SelectItem>
                        <SelectItem value="senimana">Senimana (1 week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400"
                    onClick={() => setShowCreditForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleCreateCredit}
                  >
                    <CreditCard className="h-4 w-4 mr-1" />
                    Create Credit Record
                  </Button>
                </div>
              </div>
            )}

            {/* Credit Transactions List */}
            {creditTransactions && creditTransactions.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-bold text-[#e0fbfc]">Active Credit Records</p>
                <div className="overflow-x-auto border border-[#98c1d9]/10 rounded-lg">
                  <Table>
                    <TableHeader className="bg-[#293241]">
                      <TableRow className="border-[#98c1d9]/20">
                        <TableHead className="text-[#98c1d9] text-xs">Customer</TableHead>
                        <TableHead className="text-[#98c1d9] text-xs">Category</TableHead>
                        <TableHead className="text-[#98c1d9] text-xs">Amount</TableHead>
                        <TableHead className="text-[#98c1d9] text-xs">Due Date</TableHead>
                        <TableHead className="text-[#98c1d9] text-xs">Timeline</TableHead>
                        <TableHead className="text-[#98c1d9] text-xs">Status</TableHead>
                        <TableHead className="text-[#98c1d9] text-xs text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-[#1d2430]/40">
                      {creditTransactions.map((credit) => {
                        const dueDate = new Date(credit.dueDate)
                        const now = new Date()
                        const isOverdue = dueDate < now && credit.status !== "paid"
                        
                        return (
                          <TableRow key={credit.id} className="border-[#98c1d9]/20 text-xs">
                            <TableCell className="text-[#e0fbfc] font-mono">{credit.customerName}</TableCell>
                            <TableCell className="text-[#98c1d9]">{credit.categoryName}</TableCell>
                            <TableCell className="text-[#ee6c4d] font-bold">P{credit.amount.toFixed(2)}</TableCell>
                            <TableCell className={isOverdue ? "text-red-400 font-bold" : "text-[#98c1d9]"}>
                              {dueDate.toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-[#98c1d9]">{credit.repaymentTimeline}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded text-xs font-bold ${
                                  credit.status === "paid"
                                    ? "bg-green-500/20 text-green-400"
                                    : isOverdue
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                                }`}
                              >
                                {credit.status === "paid" ? "✓ Paid" : isOverdue ? "! Overdue" : "Active"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              {credit.status !== "paid" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-green-400 hover:bg-green-400/20 text-xs"
                                  onClick={() => handleMarkCreditPaid(credit.id)}
                                >
                                  Mark Paid
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 text-red-400 hover:bg-red-400/20"
                                onClick={() => deleteCreditTransaction(credit.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-[#98c1d9]/50 mx-auto mb-4" />
                <p className="text-[#98c1d9]">No active credit records yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Account Settings */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <Card className="bg-[#3d5a80] border-[#98c1d9]/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#ee6c4d]" />
                  <div>
                    <CardTitle className="text-[#e0fbfc]">Admin Account Settings</CardTitle>
                    <CardDescription className="text-[#98c1d9]">
                      Manage admin credentials
                    </CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white"
                  onClick={() => {
                    setShowAdminSettings(!showAdminSettings)
                    setAdminSettingsError("")
                    setAdminSettingsSuccess(false)
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  {showAdminSettings ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAdminSettings ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#e0fbfc] font-medium">Admin Username</Label>
                    <Input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]"
                      placeholder="Enter new username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#e0fbfc] font-medium">New Password</Label>
                    <Input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#e0fbfc] font-medium">Confirm Password</Label>
                    <Input
                      type="password"
                      value={adminPasswordConfirm}
                      onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                      className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]"
                      placeholder="Confirm password"
                    />
                  </div>

                  {adminSettingsError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-lg">
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <Lock className="h-4 w-4 shrink-0" />
                        {adminSettingsError}
                      </p>
                    </div>
                  )}

                  {adminSettingsSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/40 rounded-lg">
                      <p className="text-green-400 text-sm flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0" />
                        Admin credentials updated successfully!
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleSaveAdminSettings}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 text-[#98c1d9]">
                  <div className="flex items-center justify-between p-3 bg-[#293241] rounded-lg">
                    <span className="font-medium">Current Username:</span>
                    <span className="text-[#e0fbfc] font-mono">{adminCredentials.username}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#293241] rounded-lg">
                    <span className="font-medium">Status:</span>
                    <span className="text-green-400 font-bold flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      Active
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Store Penalty Fee Policy Configuration */}
          <Card className="bg-[#3d5a80] border-[#98c1d9]/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#ee6c4d]" />
                  <div>
                    <CardTitle className="text-[#e0fbfc]">Store Penalty Fee Policy</CardTitle>
                    <CardDescription className="text-[#98c1d9]">
                      Configure dynamic penalty fee percentage
                    </CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white"
                  onClick={() => setEditingPenaltyFee(!editingPenaltyFee)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  {editingPenaltyFee ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingPenaltyFee ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#e0fbfc] font-medium">Penalty Fee Percentage (%)</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={tempPenaltyFee}
                        onChange={(e) => setTempPenaltyFee(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]"
                        placeholder="Enter penalty percentage"
                      />
                      <span className="text-[#e0fbfc] font-bold text-lg">%</span>
                    </div>
                    <p className="text-xs text-[#98c1d9]">
                      Penalty = Outstanding Balance × {(tempPenaltyFee / 100).toFixed(3)}
                    </p>
                  </div>

                  <div className="bg-[#293241] p-4 rounded-lg border border-[#ee6c4d]/30 space-y-2">
                    <p className="text-sm font-bold text-[#e0fbfc]">Penalty Calculation Example:</p>
                    <div className="text-xs text-[#98c1d9] space-y-1">
                      <p>If outstanding balance = P1,000</p>
                      <p className="text-[#ee6c4d] font-bold">
                        Penalty = P1,000 × {(tempPenaltyFee / 100).toFixed(3)} = P{(1000 * (tempPenaltyFee / 100)).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleSavePenaltyFee}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save Penalty Fee Policy
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[#293241] rounded-lg border border-[#98c1d9]/20">
                    <div>
                      <p className="text-sm text-[#98c1d9]">Current Penalty Rate</p>
                      <p className="text-3xl font-bold text-[#ee6c4d]">{penaltyFeePercentage}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#98c1d9] mb-2">Applied on overdue payments</p>
                      <div className="bg-[#ee6c4d]/20 text-[#ee6c4d] px-3 py-1 rounded text-sm font-bold">
                        Active Policy
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#293241] p-4 rounded-lg border border-[#98c1d9]/10 space-y-2">
                    <p className="text-sm font-bold text-[#e0fbfc]">Policy Details:</p>
                    <ul className="text-xs text-[#98c1d9] space-y-1">
                      <li>• Applied to all overdue customer payments</li>
                      <li>• Automatically calculated on outstanding balance</li>
                      <li>• Helps incentivize timely payment</li>
                      <li>• Formula: Outstanding Balance × {(penaltyFeePercentage / 100).toFixed(3)}</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Login History */}
        <Card className="bg-[#3d5a80] border-[#98c1d9]/30 mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#ee6c4d]" />
              <div>
                <CardTitle className="text-[#e0fbfc]">Admin Login History</CardTitle>
                <CardDescription className="text-[#98c1d9]">
                  Audit trail of admin access
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {adminLoginHistory && adminLoginHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#98c1d9]/30">
                      <TableHead className="text-[#98c1d9]">Username</TableHead>
                      <TableHead className="text-[#98c1d9]">Action</TableHead>
                      <TableHead className="text-[#98c1d9]">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminLoginHistory.slice().reverse().map((record) => (
                      <TableRow key={record.id} className="border-[#98c1d9]/30">
                        <TableCell className="text-[#e0fbfc] font-mono">{record.username}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              record.action === "login_success"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {record.action === "login_success" ? "✓ Success" : "✗ Failed"}
                          </span>
                        </TableCell>
                        <TableCell className="text-[#98c1d9] text-xs">
                          {new Date(record.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-[#98c1d9]/50 mx-auto mb-4" />
                <p className="text-[#98c1d9]">No admin login records yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}