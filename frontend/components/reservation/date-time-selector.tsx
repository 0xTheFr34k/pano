"use client"

import { useState, useEffect } from "react"
import { useStore, type TimeSlot } from "@/store/use-store"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { Clock } from "lucide-react"

export default function DateTimeSelector() {
  const {
    selectedGameType,
    selectedDate,
    selectedTimeSlot,
    timeSlots,
    setSelectedDate,
    setSelectedTimeSlot,
    getAvailableStations,
  } = useStore()

  const [date, setDate] = useState<Date | undefined>(selectedDate ? new Date(selectedDate) : undefined)

  // Update the selected date when the date changes
  useEffect(() => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd")
      setSelectedDate(formattedDate)

      // Clear time slot when date changes
      if (selectedDate !== formattedDate) {
        setSelectedTimeSlot(null)
      }
    }
  }, [date, selectedDate, setSelectedDate, setSelectedTimeSlot])

  // Function to check if a time slot is available
  const isTimeSlotAvailable = (timeSlot: TimeSlot) => {
    if (!selectedDate || !selectedGameType) return false

    const availableStations = getAvailableStations(selectedGameType, selectedDate, timeSlot.id)

    return availableStations.length > 0
  }

  // Function to check if a time slot is in the future
  const isTimeSlotInFuture = (timeSlot: TimeSlot) => {
    if (!selectedDate) return false

    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // If selected date is in the future, all time slots are valid
    if (selectedDate > today) return true

    // If selected date is today, only show time slots that are in the future
    if (selectedDate === today) {
      const [hour, minute] = timeSlot.start.split(':').map(Number)
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      // Compare hours and minutes
      if (hour > currentHour) return true
      if (hour === currentHour && minute > currentMinute) return true

      return false
    }

    // If selected date is in the past, no time slots are valid
    return false
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-blue-900">Choose Date & Time</h2>
      <p className="text-gray-600 mb-6">Select your preferred date and time slot for your {selectedGameType} session</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div>
          <h3 className="text-lg font-medium mb-3">Select Date</h3>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={{ before: new Date() }}
            className="border rounded-md p-3"
          />
        </div>

        {/* Time Slots */}
        <div>
          <h3 className="text-lg font-medium mb-3">Select Time Slot</h3>
          {!selectedDate ? (
            <p className="text-gray-500 italic">Please select a date first</p>
          ) : (() => {
            // Filter time slots to only show those in the future for today
            const filteredTimeSlots = timeSlots.filter(slot => isTimeSlotInFuture(slot))

            // Check if any time slots are available
            const availableSlots = filteredTimeSlots.filter(slot => isTimeSlotAvailable(slot))

            if (filteredTimeSlots.length === 0) {
              return (
                <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
                  <p className="text-amber-800 mb-2">No more time slots available for today.</p>
                  <p className="text-amber-700 text-sm">
                    Please select a future date to see available time slots.
                  </p>
                </div>
              )
            }

            if (availableSlots.length === 0) {
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
                {filteredTimeSlots.map((slot) => {
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
          })()}
        </div>
      </div>
    </div>
  )
}
