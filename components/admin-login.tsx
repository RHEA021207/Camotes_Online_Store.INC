"use client"

import { useState } from "react"
import { Lock, Eye, EyeOff, Shield } from "lucide-react"
import { useServices } from "@/context/ServiceContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AdminLoginProps {
  onLogin: (success: boolean) => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const { adminCredentials, logAdminLogin } = useServices()
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate standard secure authorization delay
    await new Promise(resolve => setTimeout(resolve, 400))

    if (username.trim() === adminCredentials.username && password === adminCredentials.password) {
      // Secure local storage token setup
      sessionStorage.setItem("cos-admin-auth", "true")
      // Log successful admin login to history
      logAdminLogin(username, "login_success")
      // Execute continuous dynamic interface callback pipe immediately 
      onLogin(true)
    } else {
      // Log failed admin login attempt to history
      logAdminLogin(username || "unknown", "login_failed")
      setError("Invalid administrative username or password")
      onLogin(false)
    }

    setIsLoading(false)
  }

  return (
    <section className="py-12 bg-[#293241] min-h-[85vh] flex items-center justify-center" id="admin-login">
      <div className="container mx-auto px-4 w-full">
        <Card className="max-w-md mx-auto bg-[#3d5a80] border-[#98c1d9]/30 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-[#293241] w-fit border border-[#98c1d9]/10">
              <Shield className="h-12 w-12 text-[#98c1d9]" />
            </div>
            <CardTitle className="text-[#e0fbfc] text-2xl tracking-tight">Admin Access Required</CardTitle>
            <CardDescription className="text-[#98c1d9] text-sm">
              Please enter your admin credentials to access the management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#e0fbfc] font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc] placeholder:text-[#98c1d9]/40 focus:border-[#ee6c4d] transition-colors"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#e0fbfc] font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc] placeholder:text-[#98c1d9]/40 pr-10 focus:border-[#ee6c4d] transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98c1d9] hover:text-[#e0fbfc] p-1 rounded focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4 shrink-0" />
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#ee6c4d] hover:bg-[#ee6c4d]/90 text-white font-bold transition-all mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating Session..." : "Login to Admin Portal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}