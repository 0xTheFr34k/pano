"use client"

import { useState } from "react"
import { useStore, type MatchType } from "@/store/use-store"
import { Button } from "@/components/ui/button"
import { CustomButton } from "@/components/custom-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import { CalendarIcon, Clock, Users, Trophy } from "lucide-react"
import TimeSlotSelector from "@/components/reservation/time-slot-selector"

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
    setSelectedDate,
    setPlayerCount,
    setName,
    setEmail,
    setPhone,
    setMatchType,
    setIsCompetitive,
    getMaxMatches,
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

  // Calculate max matches based on match type
  const maxMatches = getMaxMatches(matchType)

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Pool Table Reservation (8-ball)</h3>
        <p className="text-sm text-gray-600">
          Book a pool table for your match. Choose your match type, table, and desired time block.
        </p>
      </div>

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

      {/* Competitive Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="competitive-mode" className="text-base">
            Competitive Match
          </Label>
          <p className="text-sm text-gray-500">Enable for ranked matches and tournaments</p>
        </div>
        <Switch id="competitive-mode" checked={isCompetitive} onCheckedChange={setIsCompetitive} />
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
            onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}
            disabled={playerCount <= 2}
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
          <span className="text-sm text-gray-500 ml-2">{playerCount === 2 ? "(1v1)" : "(2v2)"}</span>
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
