"use client"

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
import { CheckCircle2, Calendar, Clock, Users } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface SuccessConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservationDetails: {
    gameType: string
    date: string
    timeSlot: { start: string; end: string }
    duration: number
    playerCount: number
  }
}

export default function SuccessConfirmation({
  open,
  onOpenChange,
  reservationDetails
}: SuccessConfirmationProps) {
  const router = useRouter()

  const handleViewMyReservations = () => {
    router.push("/my-reservations")
    onOpenChange(false)
  }

  const handleBookAnother = () => {
    // Close the modal and stay on the current page
    onOpenChange(false)
  }

  // No useEffect hooks to avoid infinite loops

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle2 className="h-14 w-14 text-green-500" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">Booking Confirmed!</DialogTitle>
          <DialogDescription className="text-center mt-2 text-base">
            Your reservation has been successfully booked.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            {/* Date */}
            <div className="flex items-start sm:items-center">
              <Calendar className="h-5 w-5 text-blue-900 mr-3 mt-0.5 sm:mt-0 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Date</p>
                <p className="font-medium text-sm sm:text-base">
                  {reservationDetails.date ? format(new Date(reservationDetails.date), "EEEE, MMMM d, yyyy") : "Today"}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start sm:items-center">
              <Clock className="h-5 w-5 text-blue-900 mr-3 mt-0.5 sm:mt-0 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Time</p>
                <p className="font-medium text-sm sm:text-base">
                  {reservationDetails.timeSlot.start} - {reservationDetails.timeSlot.end}
                  {reservationDetails.duration && (
                    <span className="text-sm text-gray-500 ml-2">({reservationDetails.duration} minutes)</span>
                  )}
                </p>
              </div>
            </div>

            {/* Players */}
            <div className="flex items-start sm:items-center">
              <Users className="h-5 w-5 text-blue-900 mr-3 mt-0.5 sm:mt-0 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Players</p>
                <p className="font-medium text-sm sm:text-base">{reservationDetails.playerCount}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-center text-gray-500 px-2">
            A confirmation has been sent to your email. Please arrive 5 minutes before your scheduled time.
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            variant="outline"
            onClick={handleBookAnother}
            className="w-full sm:w-auto py-2 h-auto"
          >
            Book Another
          </Button>
          <Button
            onClick={handleViewMyReservations}
            className="bg-blue-900 hover:bg-blue-800 w-full sm:w-auto py-2 h-auto"
          >
            View My Reservations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
