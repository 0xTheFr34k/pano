"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store/use-store"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter()
  const { currentUser } = useStore()

  useEffect(() => {
    // If no user is logged in, redirect to login page
    if (!currentUser) {
      router.push("/register?redirect=" + encodeURIComponent(window.location.pathname))
    }
    // If admin is required and user is not admin, redirect to home
    else if (requireAdmin && !currentUser.isAdmin) {
      router.push("/")
    }
    // If user is not approved and not admin, redirect to home
    else if (!requireAdmin && currentUser.status !== "approved" && !currentUser.isAdmin) {
      // We don't redirect here, we'll show a message instead
    }
  }, [currentUser, requireAdmin, router])

  // If no user is logged in, show nothing (will redirect)
  if (!currentUser) {
    return null
  }

  // If admin is required and user is not admin, show nothing (will redirect)
  if (requireAdmin && !currentUser.isAdmin) {
    return null
  }

  // If user is not approved and not admin, show a message
  if (!requireAdmin && currentUser.status !== "approved" && !currentUser.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <Alert className="bg-amber-50 border-amber-200 mb-4">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Your account is pending approval. You will be able to access this feature once an administrator approves
              your account.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-8">
            <Button onClick={() => router.push("/")} className="bg-blue-900 hover:bg-blue-800">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Otherwise, render the children
  return <>{children}</>
}
