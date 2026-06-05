"use client"

import { useState, useEffect, type DragEvent } from "react"
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
  Zap,
  Tag
} from "lucide-react"
import { useServices, type ProductItem, type CategoryConfig, type CategoryItem } from "@/context/ServiceContext" // <-- Wire state sync engine
import { supabase } from "@/lib/supabaseClient"
import { CUSTOMER_TABLE } from "@/lib/constants"
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
  username?: string
  password?: string
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
  onUpdateCustomer?: (customerId: string, updates: Partial<Customer>) => void
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
  onUpdateCustomer,
  onAddCustomer,
  onUpdateStock,
  onLogout,
}: AdminDashboardProps) {
  // Pull live state variables directly from Context Engine
  const { products, updateProduct, addProduct, deleteProduct, adminCredentials, updateAdminCredentials, penaltyFeePercentage, setPenaltyFeePercentage, adminLoginHistory, categoryConfigs, updateCategoryConfig, addCategoryConfig } = useServices()

  const [searchQuery, setSearchQuery] = useState("")
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState<{ name: string; phone: string; username: string; password: string; trustScore: "new" | "good" | "excellent" | "not_good"; standing: "good" | "restricted" }>({ name: "", phone: "", username: "", password: "", trustScore: "new", standing: "good" })
  const [customerEditModalOpen, setCustomerEditModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null)
  const [editingStockId, setEditingStockId] = useState<string | null>(null)
  const [editingStockData, setEditingStockData] = useState<Partial<StockItem>>({})
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [showAddProductForm, setShowAddProductForm] = useState(false)
  const [newProdName, setNewProdName] = useState("")
  const [newProdDesc, setNewProdDesc] = useState("")
  const [newProdCat, setNewProdCat] = useState<"e-loan" | "bugas" | "snacks" | "gadgets" | "appliances" | "sangla">("e-loan")
  const [newProdPrice, setNewProdPrice] = useState<number>(0)
  const [newProdDeliveryFee, setNewProdDeliveryFee] = useState<number>(0)
  const [newProdStockStatus, setNewProdStockStatus] = useState<"available" | "out_of_stock" | "sold_out">("available")
  const [newProdBrand, setNewProdBrand] = useState("")
  const [newProdImageFile, setNewProdImageFile] = useState<File | null>(null)
  const [newProdImagePreview, setNewProdImagePreview] = useState("")
  const [draggingNewImage, setDraggingNewImage] = useState(false)
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null)
  const [imageUploadError, setImageUploadError] = useState("")
  
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
  const [activeTab, setActiveTab] = useState<"overview"|"inventory"|"customers"|"policies">("overview")
  const [activeStatFilter, setActiveStatFilter] = useState("all")

  // Category management state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryConfigs[0]?.categoryKey || "e-loan")
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryData, setEditingCategoryData] = useState<Partial<CategoryConfig> | null>(null)
  const [addingNewCategoryItem, setAddingNewCategoryItem] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemAmount, setNewItemAmount] = useState(0)
  const [newItemDescription, setNewItemDescription] = useState("")

  // Form states for creating a whole new service / category card
const [showAddCategoryForm, setShowAddCategoryForm] = useState(false)
  const categoryLabels: Record<string, string> = {
    bugas: "Bugas",
    snacks: "Snacks",
    gadgets: "Gadgets",
    appliances: "Appliances",
    sangla: "Sangla",
  }
  const selectedCategoryProducts = products.filter((prod) => prod.category === (selectedCategory ?? "snacks"))
  const [salesTimeframe, setSalesTimeframe] = useState<'day'|'month'|'year'|'custom'|'custom_days'|'others_days'>('day')
  const [customValue, setCustomValue] = useState<number>(1)
  const [customUnit, setCustomUnit] = useState<'days'|'months'|'years'>('days')
  
  // Apply filtering to customers based on query search
  const safeCustomers = customers || []
 const filteredCustomers = safeCustomers.filter(
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
    if (!newCustomer.name.trim() || !newCustomer.username.trim() || !newCustomer.password.trim()) {
      setShowAddCustomer(true)
      return
    }

    onAddCustomer({
      name: newCustomer.name,
      phone: newCustomer.phone,
      username: newCustomer.username,
      password: newCustomer.password,
      trustScore: newCustomer.trustScore,
      standing: newCustomer.standing,
      balance: 0,
      lastPayment: "N/A",
    })

    // Persist to Supabase customers table
    ;(async () => {
      try {
        // Prevent duplicate username
        const { data: exists } = await supabase
          .from(CUSTOMER_TABLE)
          .select('id')
          .eq('username', newCustomer.username)
          .limit(1)
          .maybeSingle()

        if (exists && (exists as any).id) {
          console.warn('Customer with this username already exists in Supabase')
        } else {
          const payload = {
            name: newCustomer.name,
            phone: newCustomer.phone || null,
            username: newCustomer.username,
            password: newCustomer.password,
            trust_score: newCustomer.trustScore,
            standing: newCustomer.standing,
            balance: 0,
            last_payment: 'N/A',
            created_at: new Date().toISOString(),
          }

          const { error } = await supabase.from(CUSTOMER_TABLE).insert([payload])
          if (error) console.error('Failed to insert customer into Supabase:', error)
        }
      } catch (err) {
        console.error('Error persisting customer to Supabase', err)
      }
    })()
    setNewCustomer({ name: "", phone: "", username: "", password: "", trustScore: "new", standing: "good" })
    setShowAddCustomer(false)
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

    const productPayload = {
      name: newProdName,
      description: newProdDesc,
      category: newProdCat,
      image: imageUrl || null,
      price: newProdPrice || 0,
      delivery_fee: newProdDeliveryFee || 0,
      stock_status: newProdStockStatus,
      brand: newProdBrand || null,
      created_at: new Date().toISOString(),
    }

    if (editingProductId) {
      await supabase
        .from('store_services')
        .update({
          name: newProdName,
          description: newProdDesc,
          category: newProdCat,
          image: imageUrl || null,
          price: newProdPrice || 0,
          delivery_fee: newProdDeliveryFee || 0,
          stock_status: newProdStockStatus,
          brand: newProdBrand || null,
        })
        .eq('id', editingProductId)

      updateProduct(editingProductId, {
        name: newProdName,
        description: newProdDesc,
        category: newProdCat,
        image: imageUrl || undefined,
        price: newProdPrice,
        deliveryFee: newProdDeliveryFee,
        stockStatus: newProdStockStatus,
        brand: newProdBrand || undefined,
      })
    } else {
      try {
        const { data, error } = await supabase
          .from('store_services')
          .insert([productPayload])
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
          price: newProdPrice,
          deliveryFee: newProdDeliveryFee,
          stockStatus: newProdStockStatus,
          brand: newProdBrand || undefined,
        })
      } catch (err) {
        console.error('Supabase insert error:', err)
        addProduct({
          name: newProdName,
          description: newProdDesc,
          category: newProdCat,
          image: imageUrl || undefined,
          price: newProdPrice,
          deliveryFee: newProdDeliveryFee,
          stockStatus: newProdStockStatus,
          brand: newProdBrand || undefined,
        })
      }
    }

    setNewProdName("")
    setNewProdDesc("")
    setNewProdImageFile(null)
    setNewProdImagePreview("")
    setNewProdPrice(0)
    setNewProdDeliveryFee(0)
    setNewProdStockStatus("available")
    setNewProdBrand("")
    setEditingProductId(null)
    setShowAddProductForm(true)
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

  const handleEditProduct = (product: ProductItem) => {
    setEditingProductId(product.id)
    setShowAddProductForm(true)
    setNewProdName(product.name)
    setNewProdDesc(product.description || "")
    setNewProdCat(product.category as "e-loan" | "bugas" | "snacks" | "gadgets" | "appliances" | "sangla")
    setNewProdPrice(product.price || 0)
    setNewProdDeliveryFee(product.deliveryFee || 0)
    setNewProdStockStatus((product.stockStatus === "out_of_stock" ? "sold_out" : (product.stockStatus || "available")) as "available" | "out_of_stock" | "sold_out")
    setNewProdBrand(product.brand || "")
    setNewProdImagePreview(product.image || "")
    setNewProdImageFile(null)
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

  const startEditingCustomer = (customer: Customer) => {
    setEditingCustomer({ ...customer })
    setCustomerEditModalOpen(true)
  }

  const saveCustomerEdit = () => {
    if (editingCustomer?.id && onUpdateCustomer) {
      onUpdateCustomer(editingCustomer.id, {
        name: editingCustomer.name,
        phone: editingCustomer.phone,
        username: editingCustomer.username,
        password: editingCustomer.password,
        trustScore: editingCustomer.trustScore as Customer["trustScore"],
        standing: editingCustomer.standing as Customer["standing"],
      })
    }
    setCustomerEditModalOpen(false)
    setEditingCustomer(null)
  }

  const closeCustomerEdit = () => {
    setCustomerEditModalOpen(false)
    setEditingCustomer(null)
  }
 // Safely define low stock items array right before the layout returns
  const lowStockItems = (products || []).filter(
    (product) => product.stockStatus === "out_of_stock" || product.stockStatus === "sold_out"
  );

  // Generate the dynamic text heading for your sales receipts card based on the active timeframe filter
  let receiptHeading = "Sales Receipts Overview";
  if (salesTimeframe === "day") receiptHeading = "Today's Sales Receipts";
  else if (salesTimeframe === "month") receiptHeading = "This Month's Sales Receipts";
  else if (salesTimeframe === "year") receiptHeading = "This Year's Sales Receipts";
  else if (salesTimeframe === "custom" || salesTimeframe === "custom_days") {
    receiptHeading = `Sales Receipts (Past ${customValue} Days)`;
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
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button
                variant="ghost"
                className="text-[#e0fbfc] hover:text-[#98c1d9]"
                onClick={() => setShowAdminSettings(!showAdminSettings)}
              >
                <Settings className="h-5 w-5 mr-1" />
                Account
              </Button>

              {showAdminSettings && (
                <div className="absolute right-0 mt-2 w-[720px] bg-[#1d2430] border border-[#98c1d9]/20 rounded-lg p-4 z-40">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#e0fbfc]">Admin Credentials</h4>
                      <div className="space-y-2 mt-3">
                        <Label className="text-[#e0fbfc] font-medium">Admin Username</Label>
                        <Input
                          type="text"
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]"
                        />
                        <Label className="text-[#e0fbfc] font-medium">New Password</Label>
                        <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]" />
                        <Label className="text-[#e0fbfc] font-medium">Confirm Password</Label>
                        <Input type="password" value={adminPasswordConfirm} onChange={(e) => setAdminPasswordConfirm(e.target.value)} className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]" />
                        {adminSettingsError && <div className="p-2 bg-red-500/10 text-red-400 rounded">{adminSettingsError}</div>}
                        <div className="flex gap-2 mt-2">
                         <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white" onClick={() => {
  if (updateAdminCredentials) {
    updateAdminCredentials(adminUsername, adminPassword);
    setShowAdminSettings(false);
  }
}}><Check className="h-4 w-4 mr-1"/> Save</Button>
                          <Button variant="outline" className="flex-1" onClick={() => setShowAdminSettings(false)}>Close</Button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#e0fbfc]">Admin Login History</h4>
                      <div className="mt-3 max-h-56 overflow-y-auto border border-[#98c1d9]/10 rounded">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-[#98c1d9]">User</TableHead>
                              <TableHead className="text-[#98c1d9]">Action</TableHead>
                              <TableHead className="text-[#98c1d9]">When</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {adminLoginHistory.slice().reverse().map((r) => (
                              <TableRow key={r.id}>
                                <TableCell className="text-[#e0fbfc] font-mono">{r.username}</TableCell>
                                <TableCell className="text-[#98c1d9]">{r.action === 'login_success' ? 'Success' : 'Failed'}</TableCell>
                                <TableCell className="text-[#98c1d9] text-xs">{new Date(r.timestamp).toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
        </div>

        {/* Top stat row and controls are now inside Overview tab */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-3">
              <div className="bg-[#1d2430] p-3 rounded border border-[#98c1d9]/20">
                <div className="mt-3 flex flex-col gap-2">
                  <Button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'bg-[#ee6c4d] text-white' : 'bg-[#293241] text-[#98c1d9]'}>📊 Overview</Button>
                  <Button onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? 'bg-[#ee6c4d] text-white' : 'bg-[#293241] text-[#98c1d9]'}>📦 Product Inventory Editor</Button>
                  <Button onClick={() => setActiveTab('customers')} className={activeTab === 'customers' ? 'bg-[#ee6c4d] text-white' : 'bg-[#293241] text-[#98c1d9]'}>👥 Customer Management</Button>
                  <Button onClick={() => setActiveTab('policies')} className={activeTab === 'policies' ? 'bg-[#ee6c4d] text-white' : 'bg-[#293241] text-[#98c1d9]'}>⚙️ Store Policies</Button>
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-9">
            {/* Overview stats row */}
            {activeTab === 'overview' && (
              <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <p className="text-2xl font-bold text-[#e0fbfc]">{safeCustomers.length}</p>
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

              {/* Daily Sales Receipt (Overview) */}
              <div className="mt-6">
                <Card className={`bg-[#3d5a80] border-[#98c1d9]/30 mt-6`}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-[#e0fbfc] flex items-center gap-2">
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
                        <Select value={salesTimeframe} onValueChange={(value) => setSalesTimeframe(value as "day" | "month" | "year" | "custom" | "custom_days" | "others_days")}>
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
                              onChange={(e) => setCustomUnit(e.target.value as "days" | "months" | "years")}
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

                {/* Timeline Status Legend (Overview) */}
                <Card className="bg-[#3d5a80] border-[#98c1d9]/30 mt-6">
                  <CardHeader>
                    <CardTitle className="text-[#e0fbfc]">Timeline Status Legend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
              </>
            )}
            {/* render tabbed panels below */}
            {activeTab !== 'overview' && <div className="mt-6" />}

        {activeTab === 'policies' && (
          <>
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
          </>
        )}

        {/* ========================================================================= */}
        {/* UNIFIED SERVICES EDITOR                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
        <Card className="bg-[#3d5a80] border-[#98c1d9]/30 mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-[#e0fbfc] flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#ee6c4d]" />
                  Unified Inventory Editor
                </CardTitle>
                <CardDescription className="text-[#98c1d9]">
                  Edit service category headers, manage inventory items, and update product fields from one panel.
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowAddProductForm(!showAddProductForm)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> {showAddProductForm ? 'Hide' : 'Add New Product'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-4">
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
                          ? 'bg-[#ee6c4d] text-white'
                          : 'bg-[#293241] text-[#98c1d9] hover:bg-[#3d5a80]'
                      }`}
                    >
                      {categoryLabels[cat.categoryKey] || cat.categoryName}
                    </Button>
                  ))}
                </div>

                <div className="rounded-3xl border border-[#98c1d9]/20 bg-[#293241] p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#98c1d9]">Service Header</p>
                      <h3 className="text-2xl font-semibold text-[#e0fbfc]">{categoryLabels[selectedCategory ?? 'snacks'] || 'Category'} Services</h3>
                      <p className="mt-2 text-sm text-[#98c1d9]">
                        Update the current category display header, pricing rules, and description in one place.
                      </p>
                    </div>
                   <Button size="sm" className="bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white" onClick={() => { const activeConfig = categoryConfigs.find(c => c.categoryKey === selectedCategory); setEditingCategoryId(selectedCategory); setEditingCategoryData(activeConfig ? { ...activeConfig } : {}); }}>
                      <Edit2 className="h-4 w-4 mr-1" /> Edit Header
                    </Button>
                  </div>

                 {editingCategoryId === selectedCategory && editingCategoryData ?
 ( <div className="mt-5 space-y-6 rounded-2xl border border-[#98c1d9]/20 bg-[#1d2430] p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-[#98c1d9] text-xs">Service Name</Label>
                          <Input
                            value={editingCategoryData.categoryName || ''}
                            onChange={(e) => setEditingCategoryData({ ...editingCategoryData, categoryName: e.target.value })}
                            className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                          />
                        </div>
                        <div>
                          <Label className="text-[#98c1d9] text-xs">Min Amount</Label>
                          <Input
                            type="number"
                            value={editingCategoryData.minAmount}
                            onChange={(e) => setEditingCategoryData({ ...editingCategoryData, minAmount: parseInt(e.target.value) || 0 })}
                            className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                          />
                        </div>
                        <div>
                          <Label className="text-[#98c1d9] text-xs">Max Amount</Label>
                          <Input
                            type="number"
                            value={editingCategoryData.maxAmount}
                            onChange={(e) => setEditingCategoryData({ ...editingCategoryData, maxAmount: parseInt(e.target.value) || 0 })}
                            className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[#98c1d9] text-xs">Delivery Fee</Label>
                          <Input
                            type="number"
                            value={editingCategoryData.deliveryFee}
                            onChange={(e) => setEditingCategoryData({ ...editingCategoryData, deliveryFee: parseInt(e.target.value) || 0 })}
                            className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                          />
                        </div>
                        <div>
                          <Label className="text-[#98c1d9] text-xs">Service Description</Label>
                          <Textarea
                            value={editingCategoryData.description || ''}
                            onChange={(e) => setEditingCategoryData({ ...editingCategoryData, description: e.target.value })}
                            className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="rounded-3xl border border-[#98c1d9]/20 bg-[#293241] p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                          <div>
                            <p className="text-sm font-semibold text-[#e0fbfc]">Category Item Manager</p>
                            <p className="text-xs text-[#98c1d9]">Edit, delete, or add specific sub-products for this category.</p>
                          </div>
                          <Button size="sm" className="bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white" onClick={() => setAddingNewCategoryItem((prev) => !prev)}>
                            <Plus className="h-4 w-4 mr-1" /> {addingNewCategoryItem ? 'Hide New Item Form' : '＋ Add New Item'}
                          </Button>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow className="border-[#98c1d9]/30">
                              <TableHead className="text-[#98c1d9]">Item Name</TableHead>
                              <TableHead className="text-[#98c1d9]">Price</TableHead>
                              <TableHead className="text-[#98c1d9]">Description</TableHead>
                              <TableHead className="text-[#98c1d9] text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(editingCategoryData?.items || []).length > 0 ? (
                              (editingCategoryData?.items || []).map((item: any, index: number) => (
                                <TableRow key={item.id || item.name || index} className="border-t border-[#98c1d9]/10">
        <TableCell className="p-2">
          <Input 
            value={item.name || ''} 
            onChange={(e) => {
              setEditingCategoryData((prev: any) => {
                const updated = [...(prev.items || [])];
                updated[index] = { ...updated[index], name: e.target.value };
                return { ...prev, items: updated };
              });
            }} 
            className="bg-[#1d2430] border-[#98c1d9]/30 text-[#e0fbfc]" 
            placeholder="Item name" 
          />
        </TableCell>
        <TableCell className="p-2">
          <Input 
            type="number" 
            value={item.amount ?? ''} 
            onChange={(e) => {
              setEditingCategoryData((prev: any) => {
                const updated = [...(prev.items || [])];
                updated[index] = { ...updated[index], amount: parseInt(e.target.value) || 0 };
                return { ...prev, items: updated };
              });
            }} 
            className="bg-[#1d2430] border-[#98c1d9]/30 text-[#e0fbfc]" 
            placeholder="Price" 
          />
        </TableCell>
        <TableCell className="p-2">
          <Input 
            value={item.description || ''} 
            onChange={(e) => {
              setEditingCategoryData((prev: any) => {
                const updated = [...(prev.items || [])];
                updated[index] = { ...updated[index], description: e.target.value };
                return { ...prev, items: updated };
              });
            }} 
            className="bg-[#1d2430] border-[#98c1d9]/30 text-[#e0fbfc]" 
            placeholder="Unit or description" 
          />
        </TableCell>
        <TableCell className="p-2 text-right">
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-[#ee6c4d] hover:text-red-400" 
            onClick={() => {
              setEditingCategoryData((prev: any) => ({
                ...prev,
                items: (prev.items || []).filter((_: any, i: number) => i !== index)
              }));
            }} 
          />
        </TableCell>
      </TableRow>
    ))
  ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="py-6 text-center text-sm text-[#98c1d9]">
                                  No category items yet. Add a new item to expand this catalog.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>

                        {addingNewCategoryItem && (
                          <div className="mt-4 space-y-3">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                              <div>
                                <Label className="text-[#98c1d9] text-xs">New Item Name</Label>
                                <Input
                                  value={newItemName}
                                  onChange={(e) => setNewItemName(e.target.value)}
                                  className="bg-[#1d2430] border-[#98c1d9]/30 text-[#e0fbfc]"
                                  placeholder="e.g. Wash & Fold"
                                />
                              </div>
                              <div>
                                <Label className="text-[#98c1d9] text-xs">Price / Rate</Label>
                                <Input
                                  type="number"
                                  value={newItemAmount}
                                  onChange={(e) => setNewItemAmount(Number(e.target.value))}
                                  className="bg-[#1d2430] border-[#98c1d9]/30 text-[#e0fbfc]"
                                  placeholder="e.g. 150"
                                />
                              </div>
                              <div>
                                <Label className="text-[#98c1d9] text-xs">Unit / Description</Label>
                                <Input
                                  value={newItemDescription}
                                  onChange={(e) => setNewItemDescription(e.target.value)}
                                  className="bg-[#1d2430] border-[#98c1d9]/30 text-[#e0fbfc]"
                                  placeholder="e.g. per kg"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end">
                             <Button size="sm" className="bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white" onClick={() => {
  setEditingCategoryData((prev: any) => ({
    ...prev,
    items: [...(prev?.items || []), { name: "", amount: 0, description: "" }]
  }));
}}>
  <Plus className="h-4 w-4 mr-1" /> Add Item
</Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="text-slate-400" onClick={() => setEditingCategoryId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => {
                          if (selectedCategory && editingCategoryData) {
                            updateCategoryConfig(selectedCategory, editingCategoryData)
                            setEditingCategoryId(null)
                            setEditingCategoryData(null)
                          }
                        }}>
                          <Check className="h-4 w-4 mr-1" /> Save Changes
                        </Button>
                      </div>
      </div>
) : selectedCategory ? (
      <>
        {(() => {
          const activeConfig = categoryConfigs.find(c => c.categoryKey === selectedCategory);
          return (
            <div className="mt-5 grid gap-3 rounded-2xl border border-[#98c1d9]/20 bg-[#1d2430] p-4 text-[#e0fbfc]">
              <div className="flex items-center justify-between rounded-lg bg-[#293241] p-3">
                <span>Amount Range</span>
                <span className="font-semibold text-[#e0fbfc]">
                  P{activeConfig?.minAmount ?? 0} - P{activeConfig?.maxAmount ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#293241] p-3">
                <span>Delivery Fee</span>
                <span className="font-semibold text-[#e0fbfc]">P{activeConfig?.deliveryFee ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#293241] p-3">
                <span>Total Items</span>
                <span className="font-semibold text-[#e0fbfc]">{activeConfig?.items?.length || 0}</span>
              </div>
            </div>
          );
        })()}
        <div className="rounded-lg bg-[#212a35] p-3 text-[#98c1d9]">
          No service description is available for this category.
        </div>
      </>
                  ) : null}
                </div>

                {showAddProductForm && (
                  <div className="rounded-3xl border border-[#98c1d9]/20 bg-[#293241] p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-wider text-[#98c1d9]">{editingProductId ? 'Edit Product' : 'Add Product'}</p>
                        <h4 className="text-xl font-semibold text-[#e0fbfc]">{categoryLabels[newProdCat] || categoryLabels[selectedCategory ?? 'snacks']}</h4>
                      </div>
                      <Button size="sm" variant="outline" className="text-slate-200" onClick={() => setShowAddProductForm(false)}>
                        Close
                      </Button>
                    </div>
                    <div className="mt-5 space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[#98c1d9] text-xs">Name</Label>
                          <Input
                            value={newProdName}
                            onChange={(e) => setNewProdName(e.target.value)}
                            className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                            placeholder="Product title"
                          />
                        </div>
                        <div>
                          <Label className="text-[#98c1d9] text-xs">Category</Label>
                          <Select value={newProdCat} onValueChange={(v: any) => setNewProdCat(v)}>
                            <SelectTrigger className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]">
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
                      </div>
                      <div>
                        <Label className="text-[#98c1d9] text-xs">Description</Label>
                        <Textarea
                          value={newProdDesc}
                          onChange={(e) => setNewProdDesc(e.target.value)}
                          className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                          rows={3}
                          placeholder="Product description and customer-facing details"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-[#98c1d9] text-xs">Price</Label>
                          <Input
                            type="number"
                            value={newProdPrice}
                            onChange={(e) => setNewProdPrice(Number(e.target.value))}
                            className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                          />
                        </div>
                        <div>
                          <Label className="text-[#98c1d9] text-xs">Delivery Fee</Label>
                          <Input
                            type="number"
                            value={newProdDeliveryFee}
                            onChange={(e) => setNewProdDeliveryFee(Number(e.target.value))}
                            className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                          />
                        </div>
                        <div>
                          <Label className="text-[#98c1d9] text-xs">Stock Status</Label>
                          <Select value={newProdStockStatus} onValueChange={(v: any) => setNewProdStockStatus(v)}>
                            <SelectTrigger className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#293241] text-white">
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="low_stock">Low Stock</SelectItem>
                              <SelectItem value="sold_out">Sold Out</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {(newProdCat === 'gadgets' || newProdCat === 'appliances') && (
                        <div>
                          <Label className="text-[#98c1d9] text-xs">Brand</Label>
                          <Input
                            value={newProdBrand}
                            onChange={(e) => setNewProdBrand(e.target.value)}
                            className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                            placeholder="Brand name"
                          />
                        </div>
                      )}
                      <div className="rounded-3xl border border-dashed border-[#98c1d9]/20 bg-[#1d2430] p-4 text-center">
                        <label htmlFor="new-product-image" className="cursor-pointer text-sm text-[#e0fbfc]">
                          {newProdImagePreview ? 'Click to replace product image' : 'Upload or drag an image to attach a product photo'}
                        </label>
                        <input
                          id="new-product-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleNewProductFileChange(e.target.files?.[0] || null)}
                        />
                        {newProdImagePreview && (
                          <div className="mt-4 flex justify-center">
                            <img src={newProdImagePreview} alt="Product preview" className="h-28 rounded-xl object-cover border border-[#98c1d9]/20" />
                          </div>
                        )}
                        {imageUploadError && <p className="mt-2 text-xs text-rose-400">{imageUploadError}</p>}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="text-slate-300" onClick={() => {
                          setShowAddProductForm(false)
                          setEditingProductId(null)
                        }}>
                          Cancel
                        </Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreateNewProduct}>
                          {editingProductId ? 'Update Product' : 'Save Product'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </CardContent>
        </Card>
        )}
        {/* ========================================================================= */}

        {activeTab === 'customers' && (
          <Card className="bg-[#3d5a80] border-[#98c1d9]/30 mt-8">
            <CardHeader>
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#ee6c4d]" />
                    <div>
                      <CardTitle className="text-[#e0fbfc]">Customer Account Creator</CardTitle>
                      <CardDescription className="text-[#98c1d9]">
                        Create and manage customer login profiles from the admin portal.
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white"
                    onClick={() => setShowAddCustomer(!showAddCustomer)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {showAddCustomer ? "Hide Creator" : "Show Creator"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="bg-[#293241] rounded-lg p-4 border border-[#98c1d9]/20">
                    <p className="text-xs uppercase tracking-widest text-[#98c1d9]">Total Customers</p>
                    <p className="text-2xl font-bold text-[#e0fbfc]">{safeCustomers.length}</p>
                  </div>
                  <div className="bg-[#293241] rounded-lg p-4 border border-[#98c1d9]/20">
                    <p className="text-xs uppercase tracking-widest text-[#98c1d9]">Restricted Accounts</p>
                    <p className="text-2xl font-bold text-[#ee6c4d]">{safeCustomers.filter((c) => c.standing === "restricted").length}</p>
                  </div>
                  <div className="bg-[#293241] rounded-lg p-4 border border-[#98c1d9]/20">
                    <Label className="text-xs uppercase tracking-widest text-[#98c1d9] mb-2 block">Search by ID or name</Label>
                    <Input
                      placeholder="Search accounts by name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[#1f2b3a] border-[#98c1d9]/20 text-[#e0fbfc]"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {showAddCustomer && (
                <div className="bg-[#293241] p-4 rounded-lg border border-[#98c1d9]/20 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#e0fbfc]">Full Profile Name</Label>
                      <Input
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                        placeholder="John Dela Cruz"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#e0fbfc]">Mobile / Phone Number</Label>
                      <Input
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                        placeholder="0912 345 6789"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#e0fbfc]">Account Username</Label>
                      <Input
                        value={newCustomer.username}
                        onChange={(e) => setNewCustomer({ ...newCustomer, username: e.target.value })}
                        className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                        placeholder="customer.username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#e0fbfc]">Account Password</Label>
                      <Input
                        type="password"
                        value={newCustomer.password}
                        onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
                        className="bg-[#3d5a80] border-[#98c1d9]/30 text-[#e0fbfc]"
                        placeholder="password"
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleAddCustomer}
                  >
                    Add Customer Account
                  </Button>
                </div>
              )}

              <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredCustomers.length === 0 ? (
                  <div className="p-4 bg-[#1d2430] rounded-lg text-[#98c1d9]">No accounts match the search.</div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#293241] rounded-lg border border-[#98c1d9]/20"
                    >
                      <div>
                        <p className="text-[#e0fbfc] font-semibold">{customer.name}</p>
                        <p className="text-xs text-[#98c1d9]">{customer.id}</p>
                        <p className="text-xs text-[#98c1d9]">{customer.phone || "No phone set"}</p>
                        <p className="text-xs text-[#98c1d9]">{customer.username || "No username set"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-[#98c1d9] hover:text-[#ee6c4d]"
                          onClick={() => startEditingCustomer(customer)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={customer.standing === "good"}
                            onCheckedChange={(checked) => handleStandingToggle(customer.id, checked ? "good" : "restricted")}
                          />
                          <span className="text-sm text-[#e0fbfc]">
                            {customer.standing === "good" ? "Good Standing" : "Restricted Account"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {customerEditModalOpen && editingCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-[#1e2530] border border-[#3d5a80] rounded-3xl p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#e0fbfc]">Edit Customer Account</h3>
                  <p className="text-sm text-[#98c1d9]">Update name, contact, login details, or standing flags.</p>
                </div>
                <Button variant="ghost" size="icon" className="text-[#98c1d9] hover:text-white" onClick={closeCustomerEdit}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-[#e0fbfc]">Full Name</Label>
                  <Input
                    value={editingCustomer.name || ""}
                    onChange={(e) => setEditingCustomer((prev) => prev ? { ...prev, name: e.target.value } : prev)}
                    className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#e0fbfc]">Phone</Label>
                  <Input
                    value={editingCustomer.phone || ""}
                    onChange={(e) => setEditingCustomer((prev) => prev ? { ...prev, phone: e.target.value } : prev)}
                    className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#e0fbfc]">Username</Label>
                  <Input
                    value={editingCustomer.username || ""}
                    onChange={(e) => setEditingCustomer((prev) => prev ? { ...prev, username: e.target.value } : prev)}
                    className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#e0fbfc]">Password</Label>
                  <Input
                    type="password"
                    value={editingCustomer.password || ""}
                    onChange={(e) => setEditingCustomer((prev) => prev ? { ...prev, password: e.target.value } : prev)}
                    className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc]"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={editingCustomer.standing === "good"}
                    onCheckedChange={(checked) => setEditingCustomer((prev) => prev ? { ...prev, standing: checked ? "good" : "restricted" } : prev)}
                  />
                  <span className="text-sm text-[#e0fbfc]">{editingCustomer.standing === "good" ? "Good Standing" : "Restricted Account"}</span>
                </div>
                <div className="flex gap-3">
                  <Button onClick={closeCustomerEdit} variant="outline" className="text-[#e0fbfc] border-[#98c1d9] hover:bg-[#293241]">
                    Cancel
                  </Button>
                  <Button onClick={saveCustomerEdit} className="bg-[#ee6c4d] hover:bg-[#d65a31] text-white">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Store Penalty Fee Policy Configuration */}
        {activeTab === 'policies' && (
        <div className="grid lg:grid-cols-1 gap-8 mt-8">
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
                    onClick={() => {
                      setPenaltyFeePercentage(tempPenaltyFee)
                      setEditingPenaltyFee(false)
                    }}
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
      )}

      </main>
    </div>
  </div>
</section>
  )
}