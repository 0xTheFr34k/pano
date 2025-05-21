"use client"

import { useState } from "react"
import { useStore } from "@/store/use-store"
import { Button } from "@/components/ui/button"
import { CustomButton } from "@/components/custom-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Slider } from "@/components/ui/slider"
import { format } from "date-fns"
import { Clock, CalendarIcon, Users } from "lucide-react"
import TimeSlotSelector from "@/components/reservation/time-slot-selector"

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
    setSelectedDate,
    setPlayerCount,
    setName,
    setEmail,
    setPhone,
    setDuration,
  } = useStore()

  const [date, setDate] = useState<Date | undefined>(selectedDate ? new Date(selectedDate) : undefined)

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
    return (
      selectedDate &&
      selectedTimeSlot &&
      playerCount > 0 &&
      name.trim() !== "" &&
      email.trim() !== "" &&
      phone.trim() !== ""
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">PS5 Gaming Session</h3>
        <p className="text-sm text-gray-600">
          Book a PS5 gaming session with your friends. Choose your preferred duration, date, and time.
        </p>
      </div>

      {/* Duration Selector */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="duration">Duration</Label>
          <span className="text-sm font-medium">{duration} minutes</span>
        </div>
        <Slider
          id="duration"
          min={10}
          max={120}
          step={10}
          value={[duration]}
          onValueChange={(value) => setDuration(value[0])}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>10 min</span>
          <span>30 min</span>
          <span>60 min</span>
          <span>90 min</span>
          <span>120 min</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Time Slot Selector */}
        <div className="space-y-2">
          <Label className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Select Time Slot
          </Label>
          <TimeSlotSelector />
        </div>
      </div>

      {/* Player Count */}
      <div className="space-y-2">
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
            className="font-semibold"
          >
            -
          </CustomButton>
          <span className="w-8 text-center">{playerCount}</span>
          <CustomButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPlayerCount(Math.min(4, playerCount + 1))}
            disabled={playerCount >= 4}
            className="font-semibold"
          >
            +
          </CustomButton>
          <span className="text-sm text-gray-500 ml-2">(Max 4 players)</span>
        </div>
      </div>

      {/* Contact Information */}
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
  )
}
