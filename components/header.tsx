"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Menu, X, ShoppingCart, User, MessageCircle, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const searchSuggestions = ["e-loan", "Bugas", "gadgets", "sangla"]

interface HeaderProps {
  onNavigate: (section: string) => void
  cartCount: number
  showBackButton?: boolean
  currentSection?: string
}

export function Header({ onNavigate, cartCount, showBackButton = false, currentSection }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("cos-recent-searches")
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  const addToRecentSearches = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
    setRecentSearches(updated)
    sessionStorage.setItem("cos-recent-searches", JSON.stringify(updated))
  }

  const handleSearch = (term: string) => {
    if (term.trim()) {
      addToRecentSearches(term)
      setSearchQuery("")
      setShowSuggestions(false)
      onNavigate(term.toLowerCase())
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#3d5a80] bg-[#293241]/95 backdrop-blur supports-[backdrop-filter]:bg-[#293241]/80">
        {/* Container: Spacing and padding automatically shrink on tight mobiles to prevent crowding */}
        <div className="container mx-auto flex min-h-16 items-center justify-between gap-x-2 px-2 sm:px-4 py-2 md:py-0">
          
          {/* Back Button or Logo Wrapper */}
          <div className="flex items-center flex-shrink-0">
            {showBackButton ? (
              <Button
                variant="ghost"
                className="text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80] text-sm px-2 sm:px-3"
                onClick={() => onNavigate("home")}
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span className="hidden xs:inline">Back</span>
              </Button>
            ) : (
              <Link href="/" className="flex items-center gap-1.5 sm:gap-2 select-none" onClick={() => onNavigate("home")}>
                <Image
                  src="/images/main-logo.jpg"
                  alt="Camotes Online Store"
                  width={34}
                  height={34}
                  className="rounded-full border border-[#98c1d9]/30 object-cover"
                />
                <div className="hidden xs:block">
                  <p className="text-xs font-black text-[#e0fbfc] tracking-wide whitespace-nowrap">Camotes Online Store</p>
                  <p className="text-[10px] text-[#98c1d9]/80 font-medium">Microfinance Inc.</p>
                </div>
              </Link>
            )}
          </div>

          {/* Search Bar - Centers on Desktop */}
          <div className="relative hidden flex-1 max-w-xs lg:max-w-md mx-2 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98c1d9]" />
            <Input
              type="search"
              placeholder="Search e-loan, bugas, gadgets, sangla..."
              className="w-full pl-10 bg-[#3d5a80] border-[#98c1d9] text-[#e0fbfc] placeholder:text-[#98c1d9]/70 h-9 text-xs"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchQuery)
                }
              }}
            />
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#3d5a80] border border-[#98c1d9] rounded-md shadow-lg overflow-hidden z-50">
                <div className="p-3 border-b border-[#98c1d9]/30">
                  <p className="text-xs text-[#98c1d9] mb-2">Quick Search</p>
                  <div className="flex flex-wrap gap-2">
                    {searchSuggestions.map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="secondary"
                        className="bg-[#293241] text-[#e0fbfc] hover:bg-[#ee6c4d] hover:text-white cursor-pointer transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {recentSearches.length > 0 && (
                  <div className="p-3">
                    <p className="text-xs text-[#98c1d9] mb-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Recent Searches
                    </p>
                    <div className="space-y-1">
                      {recentSearches.map((term, index) => (
                        <button
                          key={index}
                          className="w-full px-3 py-1.5 text-left text-sm text-[#e0fbfc] hover:bg-[#293241] rounded transition-colors flex items-center gap-2"
                          onClick={() => handleSuggestionClick(term)}
                        >
                          <Clock className="h-3 w-3 text-[#98c1d9]" />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Navigation Actions block - flex-shrink-0 keeps icons locked inside view */}
          <div className="flex items-center gap-1 sm:gap-3 ml-auto md:ml-0 flex-shrink-0">
            <nav className="hidden md:flex items-center gap-2">
              {!showBackButton && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80] font-bold text-xs"
                    onClick={() => onNavigate("timeline")}
                  >
                    My Timeline
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80] font-bold text-xs"
                    onClick={() => onNavigate("admin")}
                  >
                    Admin
                  </Button>
                </>
              )}
            </nav>
            
            {/* Action Group Container - flex-shrink-0 guarantees it won't squash away */}
            <div className="flex items-center gap-1 sm:gap-2 border-l border-[#3d5a80] pl-1.5 sm:pl-4 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80] h-9 w-9 flex-shrink-0"
                onClick={() => onNavigate("cart")}
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#ee6c4d] text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80] h-9 w-9 flex-shrink-0"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#3d5a80] border-[#98c1d9] w-40 mt-1">
                  <DropdownMenuItem onClick={() => onNavigate("account")} className="text-[#e0fbfc] font-medium text-xs focus:bg-[#293241] focus:text-[#e0fbfc] cursor-pointer">
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate("orders")} className="text-[#e0fbfc] font-medium text-xs focus:bg-[#293241] focus:text-[#e0fbfc] cursor-pointer">
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate("settings")} className="text-[#e0fbfc] font-medium text-xs focus:bg-[#293241] focus:text-[#e0fbfc] cursor-pointer">
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Trigger Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[#e0fbfc] h-9 w-9 hover:bg-[#3d5a80] flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Panel Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#3d5a80] bg-[#293241] animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98c1d9]" />
                <Input
                  type="search"
                  placeholder="Search items..."
                  className="w-full pl-10 bg-[#3d5a80] border-[#98c1d9] text-[#e0fbfc] h-9 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(searchQuery)
                      setMobileMenuOpen(false)
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {searchSuggestions.map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="secondary"
                    className="bg-[#3d5a80] text-[#e0fbfc] hover:bg-[#ee6c4d] hover:text-white cursor-pointer transition-colors text-[11px]"
                    onClick={() => {
                      handleSuggestionClick(suggestion)
                      setMobileMenuOpen(false)
                    }}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
            <nav className="flex flex-col border-t border-[#3d5a80]/40">
              {showBackButton ? (
                <button
                  className="px-5 py-3 text-left text-sm font-semibold text-[#e0fbfc] hover:bg-[#3d5a80] flex items-center gap-2 transition-colors"
                  onClick={() => {
                    onNavigate("home")
                    setMobileMenuOpen(false)
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </button>
              ) : (
                <>
                  <button
                    className="px-5 py-3 text-left text-sm font-semibold text-[#e0fbfc] hover:bg-[#3d5a80] transition-colors border-b border-[#3d5a80]/20"
                    onClick={() => {
                      onNavigate("timeline")
                      setMobileMenuOpen(false)
                    }}
                  >
                    My Timeline
                  </button>
                  <button
                    className="px-5 py-3 text-left text-sm font-semibold text-[#e0fbfc] hover:bg-[#3d5a80] transition-colors border-b border-[#3d5a80]/20"
                    onClick={() => {
                      onNavigate("cart")
                      setMobileMenuOpen(false)
                    }}
                  >
                    Cart ({cartCount})
                  </button>
                  <button
                    className="px-5 py-3 text-left text-sm font-semibold text-[#e0fbfc] hover:bg-[#3d5a80] transition-colors"
                    onClick={() => {
                      onNavigate("admin")
                      setMobileMenuOpen(false)
                    }}
                  >
                    Admin Dashboard
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Floating FB Action button - Completely isolated layout position */}
      <a
        href="https://www.facebook.com/share/1BcP1N5D2S/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#1877f2] text-white px-4 py-3 rounded-full shadow-xl hover:bg-[#166fe5] transition-all duration-200 hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide">Message us on FB</span>
      </a>
    </>
  )
}