"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store/use-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Check,
  BombIcon as BilliardBall,
  Target,
  Gamepad2,
  Calendar,
  Clock,
  Users,
  User,
  Mail,
  Phone,
} from "lucide-react"
import { format } from "date-fns"

export default function ConfirmationScreen() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { selectedGameType, selectedDate, selectedTimeSlot, playerCount, name, email, phone, createReservation } =
    useStore()

  const handleConfirm = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      createReservation()
      setIsSubmitting(false)
      setIsSuccess(true)

      // Redirect to home after success
      setTimeout(() => {
        router.push("/")
      }, 3000)
    }, 1500)
  }

  // Get game type icon
  const getGameIcon = () => {
    switch (selectedGameType) {
      case "pool":
        return <BilliardBall className="h-5 w-5 text-blue-900" />
      case "snooker":
        return <Target className="h-5 w-5 text-blue-900" />
      case "ps5":
        return <Gamepad2 className="h-5 w-5 text-blue-900" />
      default:
        return null
    }
  }

  // Format game type for display
  const formatGameType = (type: string | null) => {
    if (!type) return ""
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-green-700">Reservation Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          Your booking has been successfully confirmed. A confirmation email has been sent to your email address.
        </p>
        <p className="text-sm text-gray-500">Redirecting to home page...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-blue-900">Confirm Your Reservation</h2>
      <p className="text-gray-600 mb-6">Please review your reservation details before confirming</p>

      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4 text-blue-900">Reservation Summary</h3>

          <div className="space-y-4">
            {/* Game Type */}
            <div className="flex items-center">
              {getGameIcon()}
              <span className="ml-2 text-gray-700 font-medium w-32">Game Type:</span>
              <span className="text-gray-900">{formatGameType(selectedGameType)}</span>
            </div>

            {/* Date */}
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-900" />
              <span className="ml-2 text-gray-700 font-medium w-32">Date:</span>
              <span className="text-gray-900">
                {selectedDate ? format(new Date(selectedDate), "EEEE, MMMM d, yyyy") : ""}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-900" />
              <span className="ml-2 text-gray-700 font-medium w-32">Time:</span>
              <span className="text-gray-900">
                {selectedTimeSlot ? `${selectedTimeSlot.start} - ${selectedTimeSlot.end}` : ""}
              </span>
            </div>

            {/* Players */}
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-900" />
              <span className="ml-2 text-gray-700 font-medium w-32">Players:</span>
              <span className="text-gray-900">{playerCount}</span>
            </div>

            <div className="border-t border-blue-200 my-4"></div>

            {/* Contact Information */}
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-900" />
              <span className="ml-2 text-gray-700 font-medium w-32">Name:</span>
              <span className="text-gray-900">{name}</span>
            </div>

            <div className="flex items-center">
              <Mail className="h-5 w-5 text-blue-900" />
              <span className="ml-2 text-gray-700 font-medium w-32">Email:</span>
              <span className="text-gray-900">{email}</span>
            </div>

            <div className="flex items-center">
              <Phone className="h-5 w-5 text-blue-900" />
              <span className="ml-2 text-gray-700 font-medium w-32">Phone:</span>
              <span className="text-gray-900">{phone}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="bg-blue-900 hover:bg-blue-800 px-8 py-6 text-lg"
        >
          {isSubmitting ? "Processing..." : "Confirm Reservation"}
        </Button>
      </div>
    </div>
  )
}
