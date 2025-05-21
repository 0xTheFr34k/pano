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
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}
