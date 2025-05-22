"use client"

import { useState, useEffect } from "react"
import { useStore, type TimeSlot } from "@/store/use-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function PS5DynamicTimeSlotSelector() {
  const {
    selectedGameType,
    selectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    duration,
    getDynamicPS5TimeSlots,
    reservations,
    refreshTimeSlots
  } = useStore()

  const [dynamicTimeSlots, setDynamicTimeSlots] = useState<TimeSlot[]>([])
  const [refreshing, setRefreshing] = useState(false)

  // Function to manually refresh time slots
  const handleRefresh = () => {
    if (!selectedDate) return

    setRefreshing(true)

    // Refresh time slots for the selected date
    refreshTimeSlots(selectedDate)

    // Get updated time slots
    const updatedSlots = getDynamicPS5TimeSlots(selectedDate, duration)
    setDynamicTimeSlots(updatedSlots)

    // Reset refreshing state after a short delay
    setTimeout(() => {
      setRefreshing(false)
    }, 500)
  }

  // Fetch dynamic time slots when date, duration, or reservations change
  useEffect(() => {
    if (!selectedDate) {
      setDynamicTimeSlots([])
      return
    }

    // Get dynamic time slots based on the selected duration
    const slots = getDynamicPS5TimeSlots(selectedDate, duration)
    setDynamicTimeSlots(slots)

    // If we have slots but no selected time slot, select the first one
    if (slots.length > 0 && !selectedTimeSlot) {
      setSelectedTimeSlot(slots[0])
    }

    // If the currently selected time slot is no longer available, clear it
    if (selectedTimeSlot && !slots.some(slot => slot.id === selectedTimeSlot.id)) {
      setSelectedTimeSlot(slots.length > 0 ? slots[0] : null)
    }
  }, [selectedDate, duration, getDynamicPS5TimeSlots, selectedTimeSlot, setSelectedTimeSlot, reservations])

  // Additional effect to refresh time slots periodically
  useEffect(() => {
    // Set up interval for periodic refresh (every minute)
    const intervalId = setInterval(() => {
      if (selectedDate) {
        // Silently refresh time slots
        const refreshedSlots = getDynamicPS5TimeSlots(selectedDate, duration)
        setDynamicTimeSlots(refreshedSlots)

        // If the currently selected time slot is no longer available, update it
        if (selectedTimeSlot && !refreshedSlots.some(slot => slot.id === selectedTimeSlot.id)) {
          setSelectedTimeSlot(refreshedSlots.length > 0 ? refreshedSlots[0] : null)
        }
      }
    }, 60 * 1000) // Every minute

    return () => clearInterval(intervalId)
  }, [selectedDate, duration, getDynamicPS5TimeSlots, selectedTimeSlot, setSelectedTimeSlot])

  // We now always have a date selected by default, but keeping this as a fallback
  if (!selectedDate) {
    return <p className="text-gray-500 italic">Loading available time slots...</p>
  }

  if (!dynamicTimeSlots.length) {
    return (
      <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
        <p className="text-amber-800 mb-2">No available time slots for {duration} minute sessions.</p>
        <p className="text-amber-700 text-sm">
          Try selecting a different date or duration.
        </p>
      </div>
    )
  }

  // Calculate the next available time slot for today
  const getNextAvailableTimeInfo = () => {
    if (selectedDate !== new Date().toISOString().split('T')[0] || !dynamicTimeSlots.length) {
      return null
    }

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Format current time
    const formattedCurrentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`

    // Get the first available slot
    const firstAvailableSlot = dynamicTimeSlots[0]
    const formattedNextTime = firstAvailableSlot.start

    return { current: formattedCurrentTime, next: formattedNextTime }
  }

  const timeInfo = getNextAvailableTimeInfo()

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">Showing available {duration}-minute slots</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-7 px-2"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-xs">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
        <Badge variant="outline" className="bg-blue-50 self-start sm:self-auto">
          {dynamicTimeSlots.length} slots available
        </Badge>
      </div>

      {timeInfo && (
        <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-800 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
            <p><span className="font-medium">Current time:</span> {timeInfo.current}</p>
            <p><span className="font-medium">Next slot:</span> {timeInfo.next}</p>
          </div>
          <p className="text-xs mt-2 text-blue-600">
            Note: First slot starts exactly 2 minutes after current time ({timeInfo.current} + 2min), then increments by {duration} minutes
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
        {dynamicTimeSlots.map((slot) => (
          <Card
            key={slot.id}
            className={`cursor-pointer transition-all ${
              selectedTimeSlot?.id === slot.id
                ? "border-2 border-blue-900 bg-blue-50"
                : "border border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => setSelectedTimeSlot(slot)}
          >
            <CardContent className="p-3 flex items-center justify-center sm:justify-start">
              <Clock className="h-4 w-4 mr-2 text-blue-900 flex-shrink-0" />
              <span className="text-sm font-medium">
                {slot.start} - {slot.end}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
