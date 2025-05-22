"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useStore } from "@/store/use-store"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogIn, LogOut, ShieldCheck, LayoutDashboard, AlertCircle, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { currentUser, logout } = useStore()
  const [mounted, setMounted] = useState(false)

  // Fix hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  if (!mounted) {
    return null
  }

  const isAdmin = currentUser?.isAdmin
  const isPending = currentUser?.status === "pending"
  const isRejected = currentUser?.status === "rejected"
  const isApproved = currentUser?.status === "approved"
  const isAuthenticated = !!currentUser && (isApproved || isAdmin)

  // Function to handle protected links - only returns the link if user is authenticated
  const getProtectedLink = (path: string, label: string) => {
    if (isAuthenticated) {
      return (
        <Link
          href={path}
          className={`text-white hover:text-amber-400 transition-colors ${pathname === path ? "text-amber-400" : ""}`}
        >
          {label}
        </Link>
      )
    }
    // Return null if user is not authenticated
    return null;
  }

  // Function to handle protected mobile links - only returns the link if user is authenticated
  const getProtectedMobileLink = (path: string, label: string) => {
    if (isAuthenticated) {
      return (
        <Link
          href={path}
          className={`text-white hover:text-amber-400 transition-colors py-2 ${pathname === path ? "text-amber-400" : ""}`}
          onClick={() => setIsMenuOpen(false)}
        >
          {label}
        </Link>
      )
    }
    // Return null if user is not authenticated
    return null;
  }

  return (
    <>
      <header className="bg-blue-950 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold text-2xl flex items-center">
              <span className="text-amber-400">Panorama</span>
            </Link>

            {/* Mobile menu button */}
            <button className="md:hidden" onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`text-white hover:text-amber-400 transition-colors ${pathname === "/" ? "text-amber-400" : ""}`}
              >
                Home
              </Link>
              {/* Only show these links if user is authenticated */}
              {isAuthenticated && (
                <>
                  {getProtectedLink("/reserve", "Book a Game")}
                  {getProtectedLink("/my-reservations", "My Reservations")}
                </>
              )}

              {isAdmin && (
                <Link
                  href="/dashboard"
                  className={`text-white hover:text-amber-400 transition-colors ${pathname === "/dashboard" ? "text-amber-400" : ""}`}
                >
                  Dashboard
                </Link>
              )}

              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} />
                        <AvatarFallback className="bg-amber-500">{currentUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {isPending && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500"></span>
                      )}
                      {isRejected && <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                      {isPending && <p className="text-xs text-amber-500 mt-1">Account pending approval</p>}
                      {isRejected && <p className="text-xs text-red-500 mt-1">Account rejected</p>}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-reservations" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>My Reservations</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="bg-amber-500 hover:bg-amber-600 ml-2 text-white font-semibold">
                  <Link href="/register">
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Register / Login</span>
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-blue-950 pb-4">
            <nav className="flex flex-col space-y-4 px-4">
              <Link
                href="/"
                className={`text-white hover:text-amber-400 transition-colors py-2 ${pathname === "/" ? "text-amber-400" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {/* Only show these links if user is authenticated */}
              {isAuthenticated && (
                <>
                  {getProtectedMobileLink("/reserve", "Book a Game")}
                  {getProtectedMobileLink("/my-reservations", "My Reservations")}
                </>
              )}

              {isAdmin && (
                <Link
                  href="/dashboard"
                  className={`text-white hover:text-amber-400 transition-colors py-2 ${pathname === "/dashboard" ? "text-amber-400" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}

              {currentUser ? (
                <>
                  <div className="flex items-center py-2">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} />
                      <AvatarFallback className="bg-amber-500">{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{currentUser.name}</p>
                      <p className="text-xs text-gray-400">{currentUser.email}</p>
                      {isPending && <p className="text-xs text-amber-400">Account pending approval</p>}
                      {isRejected && <p className="text-xs text-red-400">Account rejected</p>}
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="text-white hover:text-amber-400 transition-colors py-2 flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-amber-400 transition-colors py-2 flex items-center w-full text-left"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </>
              ) : (
                <Button
                  asChild
                  className="bg-amber-500 hover:bg-amber-600 w-full text-white font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/register" className="flex items-center justify-center">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>Register / Login</span>
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Pending Account Alert */}
      {isPending && (
        <Alert className="rounded-none bg-amber-50 border-amber-200 border-t border-b-0 border-l-0 border-r-0">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Your account is pending approval. Some features are limited until an administrator approves your account.
          </AlertDescription>
        </Alert>
      )}

      {/* Rejected Account Alert */}
      {isRejected && (
        <Alert className="rounded-none bg-red-50 border-red-200 border-t border-b-0 border-l-0 border-r-0">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Your account registration has been rejected. Please contact an administrator for more information.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
