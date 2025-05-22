"use client"

import { useState } from "react"
import { useStore, type MatchType } from "@/store/use-store"
import { Button } from "@/components/ui/button"
import { CustomButton } from "@/components/custom-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon, Clock, Users, Trophy } from "lucide-react"
import TimeSlotSelector from "@/components/reservation/time-slot-selector"
import TableAvailabilityInfo from "@/components/reservation/table-availability-info"
import TablePreferenceSelector from "@/components/reservation/table-preference-selector"
import TableSelectionWithAvailability from "@/components/reservation/table-selection-with-availability"
import TableSpecificTimeSlotSelector from "@/components/reservation/table-specific-time-slot-selector"
import PlayerCountFlow from "@/components/reservation/player-count-flow"

interface PoolReservationFormProps {
  onConfirm: () => void
}

export default function PoolReservationForm({ onConfirm }: PoolReservationFormProps) {
  const {
    selectedDate,
    selectedTimeSlot,
    playerCount,
    name,
    email,
    phone,
    matchType,
    isCompetitive,
    currentUser,
    setSelectedDate,
    setPlayerCount,
    setName,
    setEmail,
    setPhone,
    setMatchType,
    setIsCompetitive,
    getMaxMatches,
    preferredTableId,
    setPreferredTableId,
  } = useStore()

  const [date, setDate] = useState<Date | undefined>(selectedDate ? new Date(selectedDate) : undefined)
  const [showPlayerFlow, setShowPlayerFlow] = useState(true)
  const [shouldProceedToBooking, setShouldProceedToBooking] = useState(false)

  // Update the selected date when the date changes
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      setSelectedDate(format(newDate, "yyyy-MM-dd"))
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
      playerCount > 0
    )

    // Contact info validation - only required if user is not logged in
    const contactValid = currentUser || (
      name.trim() !== "" &&
      email.trim() !== "" &&
      phone.trim() !== ""
    )

    return basicValid && contactValid
  }

  // Calculate max matches based on match type
  const maxMatches = getMaxMatches(matchType)

  // Handle player flow completion
  const handlePlayerFlowComplete = (proceedToBooking: boolean) => {
    setShowPlayerFlow(false)
    setShouldProceedToBooking(proceedToBooking)

    if (!proceedToBooking) {
      // User should join queue - redirect to queue modal or page
      // For now, we'll show a message or redirect
      onConfirm() // This could be modified to handle queue joining
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Pool Table Reservation (8-ball)</h3>
        <p className="text-sm text-gray-600">
          Book a pool table for your match. Choose your match type, table, and desired time block.
        </p>
      </div>

      {/* Step 1: Player Count Flow */}
      {showPlayerFlow && (
        <PlayerCountFlow
          gameType="pool"
          onFlowComplete={handlePlayerFlowComplete}
        />
      )}

      {/* Step 2-4: Booking Flow (only shown if proceeding to booking) */}
      {!showPlayerFlow && shouldProceedToBooking && (
        <div className="space-y-6">
          {/* Match Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="matchType">Match Type</Label>
        <Select value={matchType} onValueChange={(value) => setMatchType(value as MatchType)}>
          <SelectTrigger id="matchType">
            <SelectValue placeholder="Select match type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="first-to-3">First to 3 wins</SelectItem>
            <SelectItem value="first-to-5">First to 5 wins</SelectItem>
            <SelectItem value="first-to-7">First to 7 wins</SelectItem>
            <SelectItem value="first-to-10">First to 10 wins</SelectItem>
            <SelectItem value="first-to-15">First to 15 wins</SelectItem>
            <SelectItem value="time-based">Time-based (no target)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Max Matches Display */}
      {matchType !== "time-based" && (
        <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 text-amber-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-amber-800">Maximum Matches: {maxMatches}</p>
              <p className="text-xs text-amber-700">
                Based on your selection, you might need up to {maxMatches} matches to determine a winner.
              </p>
            </div>
          </div>
        </div>
      )}



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
            gameType="pool"
            date={selectedDate}
            selectedTableId={preferredTableId}
            onTableSelect={setPreferredTableId}
            onTimeSlotChange={(timeSlot) => {
              // Update the selected time slot when table selection changes
              // This will be handled by the new component
            }}
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

          {/* Player count is now handled in the PlayerCountFlow component */}

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
          <div className="bg-blue-50 p-4 rounded-lg">
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
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold"
        >
          Confirm Reservation
        </CustomButton>
      </div>
        </div>
      )}
    </div>
  )
}
