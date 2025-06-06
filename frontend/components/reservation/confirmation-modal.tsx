"use client"

import { useRouter } from "next/navigation"
import { useStore } from "@/store/use-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Check,
  Target,
  Gamepad2,
  Calendar,
  Clock,
  Users,
  User,
  Mail,
  Phone,
} from "lucide-react"
import { SnookerIcon } from "@/components/icons/snooker-icon"
import { EightBallIcon } from "@/components/icons/eight-ball-icon"
import { format } from "date-fns"

interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ConfirmationModal({ open, onOpenChange }: ConfirmationModalProps) {
  const router = useRouter()
  const {
    selectedGameType,
    selectedDate,
    selectedTimeSlot,
    playerCount,
    name,
    email,
    phone,
    duration,
    matchType,
    isCompetitive,
    createReservation,
  } = useStore()

  const handleConfirm = () => {
    // Create the reservation
    createReservation()

    // Close this confirmation modal
    onOpenChange(false)
  }

  // Get game type icon
  const getGameIcon = () => {
    switch (selectedGameType) {
      case "pool":
        return <EightBallIcon className="h-5 w-5 text-blue-900" />
      case "snooker":
        return <SnookerIcon className="h-5 w-5 text-blue-900" />
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

  // Format match type for display
  const formatMatchType = (type: string) => {
    switch (type) {
      case "first-to-3":
        return "First to 3 wins"
      case "first-to-5":
        return "First to 5 wins"
      case "first-to-7":
        return "First to 7 wins"
      case "first-to-10":
        return "First to 10 wins"
      case "first-to-15":
        return "First to 15 wins"
      case "time-based":
        return "Time-based (no target)"
      default:
        return type
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Your Reservation</DialogTitle>
          <DialogDescription>Please review your booking details before confirming.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
              {selectedTimeSlot ?
                (selectedGameType === "ps5") ?
                  // For PS5, always calculate the end time based on duration
                  (() => {
                    const [startHour, startMinute] = selectedTimeSlot.start.split(":").map(Number);
                    // Use the selected date or today's date
                    const startDate = selectedDate ? new Date(selectedDate) : new Date();
                    startDate.setHours(startHour, startMinute, 0);

                    const endDate = new Date(startDate);
                    endDate.setMinutes(endDate.getMinutes() + duration);

                    const endHour = endDate.getHours().toString().padStart(2, "0");
                    const endMinute = endDate.getMinutes().toString().padStart(2, "0");

                    return `${selectedTimeSlot.start} - ${endHour}:${endMinute}`;
                  })()
                : `${selectedTimeSlot.start} - ${selectedTimeSlot.end}`
              : ""}
            </span>
          </div>

          {/* Game-specific details */}
          {selectedGameType === "ps5" && (
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-900" />
              <span className="ml-2 text-gray-700 font-medium w-32">Duration:</span>
              <span className="text-gray-900">{duration} minutes</span>
            </div>
          )}

          {selectedGameType === "snooker" && (
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-900" />
              <span className="ml-2 text-gray-700 font-medium w-32">Duration:</span>
              <span className="text-gray-900">{duration} minutes</span>
            </div>
          )}

          {selectedGameType === "pool" && (
            <>
              <div className="flex items-center">
                <Target className="h-5 w-5 text-blue-900" />
                <span className="ml-2 text-gray-700 font-medium w-32">Match Type:</span>
                <span className="text-gray-900">{formatMatchType(matchType)}</span>
              </div>
              {isCompetitive && (
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="ml-2 text-gray-700 font-medium w-32">Competitive:</span>
                  <span className="text-gray-900">Yes</span>
                </div>
              )}
            </>
          )}

          {/* Players */}
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-900" />
            <span className="ml-2 text-gray-700 font-medium w-32">Players:</span>
            <span className="text-gray-900">{playerCount}</span>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-blue-900 hover:bg-blue-800">
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
