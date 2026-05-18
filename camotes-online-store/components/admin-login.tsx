"use client"

import { useState } from "react"
import { Lock, Eye, EyeOff, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AdminLoginProps {
  onLogin: (success: boolean) => void
}

// Demo admin credentials
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "cos2022"
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 500))

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      sessionStorage.setItem("cos-admin-auth", "true")
      onLogin(true)
    } else {
      setError("Invalid username or password")
      onLogin(false)
    }

    setIsLoading(false)
  }

  return (
    <section className="py-12 bg-[#293241] min-h-[60vh] flex items-center justify-center" id="admin-login">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto bg-[#3d5a80] border-[#98c1d9]/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-[#293241] w-fit">
              <Shield className="h-12 w-12 text-[#98c1d9]" />
            </div>
            <CardTitle className="text-[#e0fbfc] text-2xl">Admin Access Required</CardTitle>
            <CardDescription className="text-[#98c1d9]">
              Please enter your admin credentials to access the management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#e0fbfc]">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc] placeholder:text-[#98c1d9]/50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#e0fbfc]">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#293241] border-[#98c1d9]/30 text-[#e0fbfc] placeholder:text-[#98c1d9]/50 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98c1d9] hover:text-[#e0fbfc]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#ee6c4d] hover:bg-[#ee6c4d]/80 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Login to Admin"}
              </Button>

              <div className="text-center pt-4 border-t border-[#98c1d9]/30">
                <p className="text-xs text-[#98c1d9]/70">
                  Demo credentials: admin / cos2022
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
