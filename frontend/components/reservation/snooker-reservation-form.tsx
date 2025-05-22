"use client"

import { useState } from "react"
import { useStore } from "@/store/use-store"
import { Button as CustomButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Clock, Users } from "lucide-react"
import PlayerCountFlow from "@/components/reservation/player-count-flow"
import TableSelectionWithAvailability from "@/components/reservation/table-selection-with-availability"
import TableSpecificTimeSlotSelector from "@/components/reservation/table-specific-time-slot-selector"

interface SnookerReservationFormProps {
  onConfirm: () => void
}

export default function SnookerReservationForm({ onConfirm }: SnookerReservationFormProps) {
  const {
    selectedDate,
    selectedTimeSlot,
    playerCount,
    name,
    email,
    phone,
    currentUser,
    setSelectedDate,
    setName,
    setEmail,
    setPhone,
    preferredTableId,
    setPreferredTableId,
    snookerMatchCount,
  } = useStore()

  const [date, setDate] = useState<Date | undefined>(selectedDate ? new Date(selectedDate) : undefined)
  const [showPlayerFlow, setShowPlayerFlow] = useState(true)
  const [shouldProceedToBooking, setShouldProceedToBooking] = useState(false)

  // Update the selected date when the date changes
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      setSelectedDate(newDate.toISOString().split("T")[0])
    } else {
      setSelectedDate(null)
    }
  }

  const isFormValid = () => {
    // Basic validation for date, table, time, and player count
    const basicValid = (
      selectedDate &&
      preferredTableId &&
      selectedTimeSlot &&
      playerCount > 0 &&
      snookerMatchCount > 0
    )

    // Contact info validation - only required if user is not logged in
    const contactValid = currentUser || (
      name.trim() !== "" &&
      email.trim() !== "" &&
      phone.trim() !== ""
    )

    return basicValid && contactValid
  }

  // Handle player flow completion
  const handlePlayerFlowComplete = (proceedToBooking: boolean) => {
    setShowPlayerFlow(false)
    setShouldProceedToBooking(proceedToBooking)

    if (!proceedToBooking) {
      // User should join queue - redirect to queue modal or page
      onConfirm() // This could be modified to handle queue joining
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-green-900 mb-2">Snooker Table Reservation</h3>
        <p className="text-sm text-gray-600">
          Book a snooker table for your match. Choose your match count, table, and desired time block.
        </p>
      </div>

      {/* Step 1: Player Count Flow */}
      {showPlayerFlow && (
        <PlayerCountFlow
          gameType="snooker"
          onFlowComplete={handlePlayerFlowComplete}
        />
      )}

      {/* Step 2-4: Booking Flow (only shown if proceeding to booking) */}
      {!showPlayerFlow && shouldProceedToBooking && (
        <div className="space-y-6">
          {/* Match Count Display */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-900">Match Configuration</h4>
                <p className="text-sm text-green-700 mt-1">
                  {snookerMatchCount} match{snookerMatchCount > 1 ? 'es' : ''} selected (~{snookerMatchCount * 30} minutes)
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-800">{snookerMatchCount}</div>
                <div className="text-xs text-green-600">matches</div>
              </div>
            </div>
          </div>
          {/* Date Selector */}
          <div className="space-y-2">
            <Label className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Select Date
            </Label>
            <div className="border rounded-md p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                disabled={{ before: new Date() }}
                className="mx-auto"
              />
            </div>
          </div>

          {/* Table Selection */}
          {selectedDate && (
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Choose Your Table</h4>
              <TableSelectionWithAvailability
                gameType="snooker"
                date={selectedDate}
                selectedTableId={preferredTableId}
                onTableSelect={setPreferredTableId}
              />
            </div>
          )}

          {/* Time Slot Selector - Now depends on selected table */}
          {selectedDate && preferredTableId && (
            <div className="space-y-2">
              <Label className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Available Time Slots for Selected Table
              </Label>
              <TableSpecificTimeSlotSelector
                tableId={preferredTableId}
                date={selectedDate}
              />
            </div>
          )}

          {/* Contact Information - Only show for non-logged-in users */}
      {!currentUser && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium">Your Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+212 XXXXXXXXX" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>
        </div>
      )}

          {/* Show user info summary if logged in */}
          {currentUser && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Your Information</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-gray-600 mt-1">{currentUser.email}</p>
                <p className="text-sm text-gray-600 mt-1">{currentUser.phone}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <CustomButton
              onClick={onConfirm}
              disabled={!isFormValid()}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold"
            >
              Confirm Snooker Reservation
            </CustomButton>
          </div>
        </div>
      )}
    </div>
  )
}
