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
    <header className="sticky top-0 z-50 w-full border-b border-[#3d5a80] bg-[#293241]/95 backdrop-blur supports-[backdrop-filter]:bg-[#293241]/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Back Button or Logo */}
        {showBackButton ? (
          <Button
            variant="ghost"
            className="text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80]"
            onClick={() => onNavigate("home")}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        ) : (
          <Link href="/" className="flex items-center gap-2" onClick={() => onNavigate("home")}>
            <Image
              src="/images/main-logo.jpg"
              alt="Camotes Online Store"
              width={48}
              height={48}
              className="rounded-full"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-[#e0fbfc]">Camotes Online Store</p>
              <p className="text-xs text-[#98c1d9]">Microfinance Inc.</p>
            </div>
          </Link>
        )}

        {/* Search Bar - Desktop */}
        <div className="relative hidden flex-1 max-w-md mx-8 md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98c1d9]" />
          <Input
            type="search"
            placeholder="Search e-loan, bugas, gadgets, sangla..."
            className="w-full pl-10 bg-[#3d5a80] border-[#98c1d9] text-[#e0fbfc] placeholder:text-[#98c1d9]/70"
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
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#3d5a80] border border-[#98c1d9] rounded-md shadow-lg overflow-hidden">
              {/* Suggestion Tags */}
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
              
              {/* Recent Searches */}
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {!showBackButton && (
            <>
              <Button
                variant="ghost"
                className="text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80]"
                onClick={() => onNavigate("services")}
              >
                Services
              </Button>
              <Button
                variant="ghost"
                className="text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80]"
                onClick={() => onNavigate("timeline")}
              >
                My Timeline
              </Button>
              <Button
                variant="ghost"
                className="text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80]"
                onClick={() => onNavigate("admin")}
              >
                Admin
              </Button>
            </>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80]"
              onClick={() => onNavigate("cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#ee6c4d] text-xs text-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#e0fbfc] hover:text-[#98c1d9] hover:bg-[#3d5a80]"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#3d5a80] border-[#98c1d9]">
                <DropdownMenuItem className="text-[#e0fbfc] focus:bg-[#293241] focus:text-[#e0fbfc]">
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[#e0fbfc] focus:bg-[#293241] focus:text-[#e0fbfc]">
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[#e0fbfc] focus:bg-[#293241] focus:text-[#e0fbfc]">
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-[#e0fbfc]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#3d5a80] bg-[#293241]">
          {/* Mobile Search */}
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98c1d9]" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-10 bg-[#3d5a80] border-[#98c1d9] text-[#e0fbfc]"
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
            {/* Mobile Quick Search Tags */}
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="secondary"
                  className="bg-[#3d5a80] text-[#e0fbfc] hover:bg-[#ee6c4d] hover:text-white cursor-pointer"
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
          <nav className="flex flex-col pb-4">
            {showBackButton ? (
              <button
                className="px-4 py-3 text-left text-[#e0fbfc] hover:bg-[#3d5a80] flex items-center gap-2"
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
                  className="px-4 py-3 text-left text-[#e0fbfc] hover:bg-[#3d5a80]"
                  onClick={() => {
                    onNavigate("services")
                    setMobileMenuOpen(false)
                  }}
                >
                  Services
                </button>
                <button
                  className="px-4 py-3 text-left text-[#e0fbfc] hover:bg-[#3d5a80]"
                  onClick={() => {
                    onNavigate("timeline")
                    setMobileMenuOpen(false)
                  }}
                >
                  My Timeline
                </button>
                <button
                  className="px-4 py-3 text-left text-[#e0fbfc] hover:bg-[#3d5a80]"
                  onClick={() => {
                    onNavigate("cart")
                    setMobileMenuOpen(false)
                  }}
                >
                  Cart ({cartCount})
                </button>
                <button
                  className="px-4 py-3 text-left text-[#e0fbfc] hover:bg-[#3d5a80]"
                  onClick={() => {
                    onNavigate("admin")
                    setMobileMenuOpen(false)
                  }}
                >
                  Admin
                </button>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Floating FB Button */}
      <a
        href="https://www.facebook.com/share/1BcP1N5D2S/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#1877f2] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#166fe5] transition-colors"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Message us on FB</span>
      </a>
    </header>
  )
}
