"use client"

import { useStore, type TimeSlot } from "@/store/use-store"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"

export default function TimeSlotSelector() {
  const { selectedGameType, selectedDate, selectedTimeSlot, timeSlots, setSelectedTimeSlot, getAvailableStations } =
    useStore()

  // Function to check if a time slot is available
  const isTimeSlotAvailable = (timeSlot: TimeSlot) => {
    if (!selectedDate || !selectedGameType) return false

    const availableStations = getAvailableStations(selectedGameType, selectedDate, timeSlot.id)

    return availableStations.length > 0
  }

  if (!selectedDate) {
    return <p className="text-gray-500 italic">Please select a date first</p>
  }

  // Check if any time slots are available
  const anyAvailableSlots = timeSlots.some(slot => isTimeSlotAvailable(slot))

  if (!anyAvailableSlots) {
    return (
      <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
        <p className="text-amber-800 mb-2">All time slots are currently booked for this date.</p>
        <p className="text-amber-700 text-sm">
          You can join our waiting queue when you submit the reservation, and we'll notify you when a slot becomes available.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
      {timeSlots.map((slot) => {
        const isAvailable = isTimeSlotAvailable(slot)
        return (
          <Card
            key={slot.id}
            className={`cursor-pointer transition-all ${
              selectedTimeSlot?.id === slot.id
                ? "border-2 border-blue-900 bg-blue-50"
                : isAvailable
                  ? "border border-gray-200 hover:border-blue-300"
                  : "border border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
            }`}
            onClick={() => {
              if (isAvailable) {
                setSelectedTimeSlot(slot)
              }
            }}
          >
            <CardContent className="p-3 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-900" />
              <span>
                {slot.start} - {slot.end}
              </span>
              {!isAvailable && <span className="ml-auto text-xs text-red-500">Booked</span>}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
