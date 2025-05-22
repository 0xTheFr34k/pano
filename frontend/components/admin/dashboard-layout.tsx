"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useStore } from "@/store/use-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  LayoutDashboard, 
  CalendarDays, 
  Clock, 
  UserCog, 
  UserPlus,
  BombIcon as BilliardBall,
  Target,
  Gamepad2,
  Settings
} from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { currentUser, getPendingUsers } = useStore()
  
  const pendingUsers = getPendingUsers()
  
  if (!currentUser?.isAdmin) {
    return null
  }
  
  const isActive = (path: string) => {
    return pathname === path
  }
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
            <div className="space-y-4">
              <Card className="p-4">
                <h2 className="text-xl font-bold mb-4">Dashboard</h2>
                <nav className="space-y-2">
                  <Button
                    variant={isActive("/dashboard") ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => router.push("/dashboard")}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  
                  <Button
                    variant={isActive("/dashboard/game-stations") ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => router.push("/dashboard/game-stations")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Game Stations
                  </Button>
                  
                  <Button
                    variant={isActive("/dashboard/tables") ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => router.push("/dashboard/tables")}
                  >
                    <BilliardBall className="h-4 w-4 mr-2" />
                    Table Management
                  </Button>
                  
                  <Button
                    variant={isActive("/dashboard/queue") ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => router.push("/dashboard/queue")}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Queue Management
                  </Button>
                </nav>
                
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Game Types</h3>
                  <div className="space-y-2">
                    <Link 
                      href="/dashboard/game-stations?tab=snooker"
                      className="flex items-center text-sm text-gray-600 hover:text-blue-600 py-1"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Snooker Table
                    </Link>
                    <Link 
                      href="/dashboard/game-stations?tab=pool"
                      className="flex items-center text-sm text-gray-600 hover:text-blue-600 py-1"
                    >
                      <BilliardBall className="h-4 w-4 mr-2" />
                      Pool Tables
                    </Link>
                    <Link 
                      href="/dashboard/game-stations?tab=ps5"
                      className="flex items-center text-sm text-gray-600 hover:text-blue-600 py-1"
                    >
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      PS5 Console
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
            
            <div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
