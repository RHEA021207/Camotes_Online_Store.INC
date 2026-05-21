"use client"

import { useState } from "react"
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
  Truck
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  onAddCustomer,
  onUpdateStock,
  onLogout,
}: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: "", trustScore: "new" as const })
  const [editingStockId, setEditingStockId] = useState<string | null>(null)
  const [editingStockData, setEditingStockData] = useState<Partial<StockItem>>({})

  // Track which metric stat box is clicked/filtered
  const [activeStatFilter, setActiveStatFilter] = useState<"all" | "customers" | "sales" | "low_stock" | "transactions">("all")

  // State for custom date receipt selection filters
  const [salesTimeframe, setSalesTimeframe] = useState<string>("day")
  const [customValue, setCustomValue] = useState<number>(1)
  const [receiptHeading, setReceiptHeading] = useState<string>("Daily Sales Receipt")
  const lowStockItems = stock.filter((item) => item.quantity < 3)
  
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
      } else if (salesTimeframe === "custom_days" || salesTimeframe === "others_days") {
        const daysAgo = new Date();
        daysAgo.setDate(now.getDate() - customValue);
        daysAgo.setHours(0, 0, 0, 0); 
        return saleDate >= daysAgo;
      } else if (salesTimeframe === "custom_months" || salesTimeframe === "others_months") {
        const monthsAgo = new Date();
        monthsAgo.setMonth(now.getMonth() - customValue);
        return saleDate >= monthsAgo;
      } else if (salesTimeframe === "custom_years" || salesTimeframe === "others_years") {
        const yearsAgo = new Date();
        yearsAgo.setFullYear(now.getFullYear() - customValue);
        return saleDate >= yearsAgo;
      }
      return true;
    });
  };

  const activeSalesItems = getFilteredSales()
  const totalSalesToday = activeSalesItems.reduce((sum, sale) => sum + sale.amount, 0)
  const penaltyRate = 0.02 // 2% penalty fee

  const handleAddCustomer = () => {
    if (newCustomer.name.trim()) {
      onAddCustomer({
        name: newCustomer.name,
        trustScore: newCustomer.trustScore,
        balance: 0,
        lastPayment: "N/A",
      })
      setNewCustomer({ name: "", trustScore: "new" })
      setShowAddCustomer(false)
    }
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

  return (
    <section className="py-12 bg-[#293241]" id="admin">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#98c1d9]" />
            <div>
              <h2 className="text-3xl font-bold text-[#e0fbfc]">Admin Dashboard</h2>
              <p className="text-[#98c1d9]">Manage customers, inventory, and sales</p>
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
                  A {penaltyRate * 100}% penalty fee is automatically applied to overdue payments. 
                  Formula: Penalty = Outstanding Balance x 0.02
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Customer Management */}
          <Card className={`bg-[#3d5a80] border-[#98c1d9]/30 ${activeStatFilter !== "all" && activeStatFilter !== "customers" ? "ring-2 ring-amber-500" : ""}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#e0fbfc]">Customer Management</CardTitle>
                  <CardDescription className="text-[#98c1d9]">
                    Search by ID (e.g., COS-101) or name
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
                      {customer.balance > 0 && (
                        <p className="text-xs text-red-400">Balance: P{customer.balance.toFixed(2)}</p>
                      )}
                      {customer.trustScore === "not_good" && (
                        <p className="text-[11px] font-bold text-red-500 uppercase mt-0.5">🚫 Cannot apply for services</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-[#3d5a80] text-[#e0fbfc] uppercase">
                        {customer.trustScore.replace('_', ' ')}
                      </span>
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
                
                <div className="flex items-center gap-2">
                  {["custom_days", "custom_months", "custom_years"].includes(salesTimeframe) && (
                    <Input
                      type="number"
                      min={1}
                      value={customValue}
                      onChange={(e) => setCustomValue(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 h-8 text-center bg-[#293241] border-[#98c1d9]/30 text-white font-bold text-xs"
                    />
                  )}

                  <Select value={salesTimeframe} onValueChange={(v) => setSalesTimeframe(v)}>
                    <SelectTrigger className="w-44 h-8 text-xs bg-[#293241] border-[#98c1d9]/30 text-white">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#3d5a80] border-[#98c1d9] text-white">
                      <SelectItem value="day">Today</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <hr className="my-1 border-[#98c1d9]/20" />
                      <SelectItem value="custom_days">Others: Days Ago</SelectItem>
                      <SelectItem value="custom_months">Others: Months Ago</SelectItem>
                      <SelectItem value="custom_years">Others: Years Ago</SelectItem>
                    </SelectContent>
                  </Select>
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
                Inventory Overview
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
                <span className="text-sm text-[#e0fbfc]">In Cart</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400" />
                <span className="text-sm text-[#e0fbfc]">Overdue (+2% penalty)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-sm text-[#e0fbfc]">Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <span className="text-sm text-red-400 font-bold">Not Good</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}