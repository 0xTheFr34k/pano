"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useStore, type GamePreference, type SkillLevel } from "@/store/use-store"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CustomButton } from "@/components/custom-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BombIcon as BilliardBall,
  Target,
  Gamepad2,
  User,
  Mail,
  Phone,
  Lock,
  ImageIcon,
  CheckCircle,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/"

  const [activeTab, setActiveTab] = useState<string>("register")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const {
    name,
    email,
    phone,
    avatar,
    gamePreference,
    skillLevel,
    password,
    currentUser,
    setName,
    setEmail,
    setPhone,
    setAvatar,
    setGamePreference,
    setSkillLevel,
    setPassword,
    register,
    login,
  } = useStore()

  // If user is already logged in, redirect to the appropriate page
  useEffect(() => {
    if (currentUser) {
      if (currentUser.isAdmin) {
        // Redirect admin users to the admin dashboard
        router.push("/admin")
      } else {
        // If the user was trying to access a specific protected feature, redirect them there
        // Otherwise, redirect regular users to the find-match page
        if (redirectPath !== "/" && redirectPath !== "/register") {
          router.push(redirectPath)
        } else {
          router.push("/find-match")
        }
      }
    }
  }, [currentUser, redirectPath, router])

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError("")
    setRegistrationSuccess(false)

    if (!name || !email || !phone || !password) {
      setRegisterError("Please fill in all required fields")
      return
    }

    const success = register()

    if (success) {
      setRegistrationSuccess(true)
      // Don't redirect, show success message instead
    } else {
      setRegisterError("Registration failed. Email may already be in use.")
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter both email and password")
      return
    }

    const success = login(loginEmail, loginPassword)

    if (success) {
      // Check if the logged-in user is an admin
      const loggedInUser = useStore.getState().currentUser

      if (loggedInUser?.isAdmin) {
        // Redirect admin users to the admin dashboard
        router.push("/admin")
      } else {
        // If the user was trying to access a specific protected feature, redirect them there
        // Otherwise, redirect regular users to the find-match page
        if (redirectPath !== "/" && redirectPath !== "/register") {
          router.push(redirectPath)
        } else {
          router.push("/find-match")
        }
      }
    } else {
      setLoginError("Invalid email or password. Note: Your account may be pending approval.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-blue-900">Join Panorama Gaming Club</h1>
        <p className="text-center text-gray-600 mb-8">Register for an account or login to access member benefits</p>

        {redirectPath !== "/" && (
          <Alert className="max-w-md mx-auto mb-4 bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              Please log in or register to access this feature.
            </AlertDescription>
          </Alert>
        )}

        <Card className="max-w-md mx-auto">
          <Tabs defaultValue="register" value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="register">Register</TabsTrigger>
                <TabsTrigger value="login">Login</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="register">
                {registrationSuccess ? (
                  <Alert className="bg-green-50 border-green-200 mb-4">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Registration Successful</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Your account request has been sent. You will be notified after approval by an administrator.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleRegister}>
                    <div className="space-y-4">
                      {/* Personal Information */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+212 XXXXXXXXX"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center">
                          <Lock className="h-4 w-4 mr-2" />
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a password"
                          required
                        />
                      </div>

                      {/* Avatar URL */}
                      <div className="space-y-2">
                        <Label htmlFor="avatar" className="flex items-center">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Avatar URL (Optional)
                        </Label>
                        <Input
                          id="avatar"
                          value={avatar}
                          onChange={(e) => setAvatar(e.target.value)}
                          placeholder="https://example.com/your-avatar.jpg"
                        />
                      </div>

                      {/* Game Preferences */}
                      <div className="space-y-2">
                        <Label htmlFor="gamePreference">Preferred Game</Label>
                        <Select
                          value={gamePreference}
                          onValueChange={(value) => setGamePreference(value as GamePreference)}
                        >
                          <SelectTrigger id="gamePreference">
                            <SelectValue placeholder="Select your preferred game" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="flex items-center">
                              All Games
                            </SelectItem>
                            <SelectItem value="pool" className="flex items-center">
                              <BilliardBall className="h-4 w-4 mr-2 inline" />
                              Pool (8-ball)
                            </SelectItem>
                            <SelectItem value="snooker" className="flex items-center">
                              <Target className="h-4 w-4 mr-2 inline" />
                              Snooker
                            </SelectItem>
                            <SelectItem value="ps5" className="flex items-center">
                              <Gamepad2 className="h-4 w-4 mr-2 inline" />
                              PS5
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="skillLevel">Skill Level</Label>
                        <Select value={skillLevel} onValueChange={(value) => setSkillLevel(value as SkillLevel)}>
                          <SelectTrigger id="skillLevel">
                            <SelectValue placeholder="Select your skill level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="competitive">Competitive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {registerError && <div className="text-red-500 text-sm">{registerError}</div>}

                      <CustomButton type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold">
                        Create Account
                      </CustomButton>
                    </div>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Address
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Password
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    {loginError && <div className="text-red-500 text-sm">{loginError}</div>}

                    <CustomButton type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                      Login
                    </CustomButton>
                  </div>
                </form>
              </TabsContent>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-gray-500 text-center">
                {activeTab === "register" ? (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="text-blue-900 hover:underline"
                    >
                      Login here
                    </button>
                  </p>
                ) : (
                  <p>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("register")}
                      className="text-blue-900 hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                )}
              </div>

              <div className="text-xs text-gray-500 text-center">
                <p>For demo purposes, you can login with:</p>
                <p>Email: admin@panorama.com</p>
                <p>Password: any password will work</p>
              </div>
            </CardFooter>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
