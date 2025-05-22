"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/store/use-store"
import { Button } from "@/components/ui/button"
import { CustomButton } from "@/components/custom-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Slider } from "@/components/ui/slider"
import { format } from "date-fns"
import { Clock, CalendarIcon, Users } from "lucide-react"
import PS5DynamicTimeSlotSelector from "@/components/reservation/ps5-dynamic-time-slot-selector"
import SuccessConfirmation from "@/components/reservation/success-confirmation"

interface PS5ReservationFormProps {
  onConfirm: () => void
}

export default function PS5ReservationForm({ onConfirm }: PS5ReservationFormProps) {
  const {
    selectedDate,
    selectedTimeSlot,
    playerCount,
    name,
    email,
    phone,
    duration,
    currentUser,
    showSuccessModal,
    lastReservation,
    setSelectedDate,
    setPlayerCount,
    setName,
    setEmail,
    setPhone,
    setDuration,
    setShowSuccessModal,
    refreshTimeSlots
  } = useStore()

  // Always set today as the default date
  const today = new Date()
  const [date, setDate] = useState<Date>(selectedDate ? new Date(selectedDate) : today)

  // Set today as the default date when component mounts
  useEffect(() => {
    if (!selectedDate) {
      const todayString = today.toISOString().split('T')[0]
      setSelectedDate(todayString)
    }
  }, [selectedDate, setSelectedDate])

  // Refresh time slots when component mounts
  useEffect(() => {
    if (selectedDate) {
      // Refresh time slots for the selected date
      refreshTimeSlots(selectedDate)
    }
  }, [refreshTimeSlots, selectedDate])

  // Update the selected date when the date changes
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      const formattedDate = format(newDate, "yyyy-MM-dd")
      setSelectedDate(formattedDate)

      // Refresh time slots for the new date
      setTimeout(() => {
        refreshTimeSlots(formattedDate)
      }, 100)
    } else {
      setSelectedDate(null)
    }
  }

  const isFormValid = () => {
    // If user is logged in, we don't need to check name, email, and phone
    if (currentUser) {
      return (
        selectedDate &&
        selectedTimeSlot &&
        playerCount > 0
      )
    } else {
      return (
        selectedDate &&
        selectedTimeSlot &&
        playerCount > 0 &&
        name.trim() !== "" &&
        email.trim() !== "" &&
        phone.trim() !== ""
      )
    }
  }

  // Prepare reservation details for success modal
  const getReservationDetails = () => {
    if (!lastReservation) {
      // If no last reservation, use current form values
      return {
        gameType: 'ps5',
        date: selectedDate || '',
        timeSlot: selectedTimeSlot || { start: '', end: '' },
        duration: duration,
        playerCount: playerCount
      }
    }

    return {
      gameType: lastReservation.gameType,
      date: lastReservation.date,
      timeSlot: lastReservation.timeSlot,
      duration: lastReservation.duration || 0,
      playerCount: lastReservation.playerCount
    }
  }

  // Only cleanup on unmount - no conditional state updates
  useEffect(() => {
    return () => {
      // Reset modal state when component unmounts
      setShowSuccessModal(false)
    }
  }, [])

  // No logging in render to avoid performance issues

  return (
    <div className="space-y-6">
      {/* Success Confirmation Modal */}
      <SuccessConfirmation
        open={showSuccessModal}
        onOpenChange={(open) => {
          setShowSuccessModal(open);
          // If closing the modal, reset the form for a new booking
          if (!open) {
            // Reset form but keep today's date selected
            const today = new Date().toISOString().split('T')[0];
            const store = useStore.getState();

            // Reset the form but maintain PS5 as the game type and today as the date
            store.resetForm();
            store.setSelectedGameType('ps5');
            store.setSelectedDate(today);

            // Refresh time slots for today
            store.refreshTimeSlots(today);

            // Update local state
            setDate(new Date());
          }
        }}
        reservationDetails={getReservationDetails() || {
          gameType: 'ps5',
          date: selectedDate || '',
          timeSlot: selectedTimeSlot || { start: '', end: '' },
          duration: duration,
          playerCount: playerCount
        }}
      />

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">PS5 Gaming Session</h3>
        <p className="text-sm text-gray-600">
          Book a PS5 gaming session with your friends. Choose your preferred duration, date, and time.
        </p>
      </div>

      {/* Duration Selector */}
      <div className="space-y-2">
        <Label htmlFor="duration">Session Duration</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            type="button"
            variant={duration === 10 ? "default" : "outline"}
            onClick={() => setDuration(10)}
            className={`text-sm py-2 h-auto flex flex-col ${duration === 10 ? "bg-blue-900 hover:bg-blue-800" : ""}`}
          >
            <span className="font-medium">10 min</span>
            <span className="text-xs mt-1">Quick Play</span>
          </Button>
          <Button
            type="button"
            variant={duration === 30 ? "default" : "outline"}
            onClick={() => setDuration(30)}
            className={`text-sm py-2 h-auto flex flex-col ${duration === 30 ? "bg-blue-900 hover:bg-blue-800" : ""}`}
          >
            <span className="font-medium">30 min</span>
            <span className="text-xs mt-1">Standard</span>
          </Button>
          <Button
            type="button"
            variant={duration === 60 ? "default" : "outline"}
            onClick={() => setDuration(60)}
            className={`text-sm py-2 h-auto flex flex-col ${duration === 60 ? "bg-blue-900 hover:bg-blue-800" : ""}`}
          >
            <span className="font-medium">1 hour</span>
            <span className="text-xs mt-1">Extended</span>
          </Button>
          <Button
            type="button"
            variant={duration > 60 ? "default" : "outline"}
            onClick={() => setDuration(120)}
            className={`text-sm py-2 h-auto flex flex-col ${duration > 60 ? "bg-blue-900 hover:bg-blue-800" : ""}`}
          >
            <span className="font-medium">{duration > 60 ? `${duration / 60} hours` : "Custom"}</span>
            <span className="text-xs mt-1">Custom</span>
          </Button>
        </div>
        {duration > 60 && (
          <div className="mt-2">
            <Slider
              id="custom-duration"
              min={60}
              max={180}
              step={30}
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1h</span>
              <span>1.5h</span>
              <span>2h</span>
              <span>2.5h</span>
              <span>3h</span>
            </div>
          </div>
        )}
      </div>

      {/* Date Selector */}
      <div className="space-y-2 mt-6">
        <Label className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Select Date
        </Label>
        <div className="border rounded-md p-3 overflow-x-auto">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            disabled={{ before: new Date() }}
            className="mx-auto"
          />
        </div>
      </div>

      {/* Time Slot Selector */}
      <div className="space-y-2 mt-6">
        <Label className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Select Time Slot
        </Label>
        <PS5DynamicTimeSlotSelector />
      </div>

      {/* Player Count */}
      <div className="space-y-2 mt-6">
        <Label htmlFor="playerCount" className="flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Number of Players
        </Label>
        <div className="flex items-center space-x-2">
          <CustomButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPlayerCount(Math.max(1, playerCount - 1))}
            disabled={playerCount <= 1}
            className="font-semibold w-10 h-10"
          >
            -
          </CustomButton>
          <span className="w-8 text-center font-medium text-lg">{playerCount}</span>
          <CustomButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPlayerCount(Math.min(4, playerCount + 1))}
            disabled={playerCount >= 4}
            className="font-semibold w-10 h-10"
          >
            +
          </CustomButton>
          <span className="text-sm text-gray-500 ml-2">(Max 4 players)</span>
        </div>
      </div>

      {/* Contact Information - Only show for non-logged-in users */}
      {!currentUser && (
        <div className="space-y-4 pt-6 mt-6 border-t">
          <h3 className="font-medium text-lg">Your Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+212 XXXXXXXXX"
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="h-10"
            />
          </div>
        </div>
      )}

      {/* Show user info summary if logged in */}
      {currentUser && (
        <div className="space-y-4 pt-6 mt-6 border-t">
          <h3 className="font-medium text-lg">Your Information</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-sm text-gray-600 mt-1">{currentUser.email}</p>
            <p className="text-sm text-gray-600 mt-1">{currentUser.phone}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-6 mt-6">
        <CustomButton
          onClick={onConfirm}
          disabled={!isFormValid()}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 text-base"
        >
          Confirm Reservation
        </CustomButton>
      </div>
    </div>
  )
}
