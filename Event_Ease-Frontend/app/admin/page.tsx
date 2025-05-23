"use client"

import { useState } from "react"
import Link from "next/link"
import { EyeIcon, EyeOffIcon, Loader2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import AuthRouteGuard from "@/components/guards/auth-route-guard"

export default function AdminLoginPage() {
  const { login, loading, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error when user starts typing
    if (error) {
      clearError()
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Always pass "admin" as the role
      await login(formData.email, formData.password, "admin")
      // Redirect is handled in the AuthContext after successful login
    } catch (error) {
      // Error handling is done in the AuthContext
      console.error("Admin login submission error:", error)
    }
  }

  return (
    <AuthRouteGuard>
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight">Admin Access</h1>
            </div>
            <p className="text-sm text-muted-foreground">Sign in to your admin account</p>
          </div>

          {/* Show error message if there is one */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-center">Administrator Login</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="admin@example.com"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))
                      }
                      disabled={loading}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Return to main login
            </Link>
          </div>
        </div>
      </div>
    </AuthRouteGuard>
  )
} 