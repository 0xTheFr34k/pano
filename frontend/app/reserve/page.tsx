"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useStore, type GameType } from "@/store/use-store"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import PS5ReservationForm from "@/components/reservation/ps5-reservation-form"
import PoolReservationForm from "@/components/reservation/pool-reservation-form"
import SnookerReservationForm from "@/components/reservation/snooker-reservation-form"
import ConfirmationModal from "@/components/reservation/confirmation-modal"
import { BombIcon as BilliardBall, Target, Gamepad2 } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import JoinQueueModal from "@/components/queue/join-queue-modal"

export default function ReservePage() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get("type") as GameType | null
  const [activeTab, setActiveTab] = useState<string>(typeParam || "ps5")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const { setSelectedGameType } = useStore()

  useEffect(() => {
    // Set the game type in the store when tab changes
    setSelectedGameType(activeTab as GameType)
  }, [activeTab, setSelectedGameType])

  // Set initial tab based on URL parameter
  useEffect(() => {
    if (typeParam && ["ps5", "pool", "snooker"].includes(typeParam)) {
      setActiveTab(typeParam)
    }
  }, [typeParam])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSelectedGameType(value as GameType)
  }

  const handleConfirmReservation = () => {
    setShowConfirmation(true)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-blue-900">Book Your Game</h1>
          <p className="text-center text-gray-600 mb-8">Select your preferred game type and make a reservation</p>

          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="ps5" className="flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4" />
                    <span>PS5</span>
                  </TabsTrigger>
                  <TabsTrigger value="pool" className="flex items-center gap-2">
                    <BilliardBall className="h-4 w-4" />
                    <span>Pool (8-ball)</span>
                  </TabsTrigger>
                  <TabsTrigger value="snooker" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>Snooker</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ps5">
                  <PS5ReservationForm onConfirm={handleConfirmReservation} />
                </TabsContent>

                <TabsContent value="pool">
                  <PoolReservationForm onConfirm={handleConfirmReservation} />
                </TabsContent>

                <TabsContent value="snooker">
                  <SnookerReservationForm onConfirm={handleConfirmReservation} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Confirmation Modal */}
          <ConfirmationModal
            open={showConfirmation}
            onOpenChange={setShowConfirmation}
          />

          {/* Queue Join Modal */}
          <JoinQueueModal />
        </div>
      </div>
    </ProtectedRoute>
  )
}
