"use client"

import { useState, useEffect } from "react"
import { useStore, type Reservation } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format, addDays, isSameDay } from "date-fns"
import { Gamepad2, Clock, Users, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PS5CalendarView() {
  const {
    reservations,
    timeSlots,
    stations,
    handleNoShow,
    getEstimatedWaitTimeForGameType
  } = useStore()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [ps5Reservations, setPS5Reservations] = useState<Reservation[]>([])
  const [ps5Station, setPS5Station] = useState<any>(null)

  // Find the PS5 station
  useEffect(() => {
    const station = stations.find(s => s.type === "ps5")
    if (station) {
      setPS5Station(station)
    }
  }, [stations])

  // Filter reservations for the selected date
  useEffect(() => {
    if (!selectedDate) return

    const dateString = format(selectedDate, "yyyy-MM-dd")
    const filtered = reservations.filter(r =>
      r.gameType === "ps5" &&
      r.date === dateString
    )

    // Sort by start time
    const sorted = [...filtered].sort((a, b) => {
      // Parse the start times
      const [aHour, aMinute] = a.timeSlot.start.split(':').map(Number)
      const [bHour, bMinute] = b.timeSlot.start.split(':').map(Number)

      // Convert to minutes for comparison
      const aMinutes = aHour * 60 + aMinute
      const bMinutes = bHour * 60 + bMinute

      return aMinutes - bMinutes
    })

    setPS5Reservations(sorted)
  }, [selectedDate, reservations])

  // Check if a time slot has a reservation
  const hasReservation = (timeSlotId: string) => {
    // Get the time slot index
    const timeSlotIndex = timeSlots.findIndex(t => t.id === timeSlotId);

    // Check if any reservation overlaps with this time slot
    return ps5Reservations.some(r => {
      if (r.status !== "confirmed") return false;

      // Get the reservation's time slot index
      const reservationTimeSlotIndex = timeSlots.findIndex(t => t.id === r.timeSlot.id);

      // For short durations (less than 1 hour), only block the exact time slot
      if (r.duration && r.duration < 60) {
        return timeSlotIndex === reservationTimeSlotIndex;
      }

      // For longer durations, calculate how many time slots this reservation spans
      // Assuming each time slot is 1 hour and duration is in minutes
      const slotsSpanned = Math.ceil((r.duration || 60) / 60);

      // Check if this time slot falls within the reservation's span
      return timeSlotIndex >= reservationTimeSlotIndex &&
             timeSlotIndex < reservationTimeSlotIndex + slotsSpanned;
    });
  }

  // Get reservation for a time slot
  const getReservation = (timeSlotId: string) => {
    // Get the time slot index
    const timeSlotIndex = timeSlots.findIndex(t => t.id === timeSlotId);

    // Find a reservation that overlaps with this time slot
    return ps5Reservations.find(r => {
      if (r.status !== "confirmed") return false;

      // Get the reservation's time slot index
      const reservationTimeSlotIndex = timeSlots.findIndex(t => t.id === r.timeSlot.id);

      // For short durations (less than 1 hour), only check the exact time slot
      if (r.duration && r.duration < 60) {
        return timeSlotIndex === reservationTimeSlotIndex;
      }

      // For longer durations, calculate how many time slots this reservation spans
      const slotsSpanned = Math.ceil((r.duration || 60) / 60);

      // Check if this time slot falls within the reservation's span
      return timeSlotIndex >= reservationTimeSlotIndex &&
             timeSlotIndex < reservationTimeSlotIndex + slotsSpanned;
    });
  }

  // Check if a reservation is currently active
  const isCurrentlyActive = (reservation: Reservation) => {
    const now = new Date()
    const today = format(now, "yyyy-MM-dd")

    if (reservation.date !== today) return false

    const startTime = reservation.timeSlot.start.split(":")
    const startHour = parseInt(startTime[0])
    const startMinute = parseInt(startTime[1])

    const startDate = new Date()
    startDate.setHours(startHour, startMinute, 0)

    // For PS5 with short durations, calculate the actual end time
    let endDate: Date
    if (reservation.gameType === "ps5" && reservation.duration && reservation.duration < 60) {
      endDate = new Date(startDate)
      endDate.setMinutes(endDate.getMinutes() + reservation.duration)
    } else {
      const endTime = reservation.timeSlot.end.split(":")
      const endHour = parseInt(endTime[0])
      const endMinute = parseInt(endTime[1])

      endDate = new Date()
      endDate.setHours(endHour, endMinute, 0)
    }

    return now >= startDate && now <= endDate
  }

  // Check if a reservation is a no-show (15+ minutes late)
  const isNoShow = (reservation: Reservation) => {
    const now = new Date()
    const today = format(now, "yyyy-MM-dd")

    if (reservation.date !== today) return false

    const startTime = reservation.timeSlot.start.split(":")
    const startHour = parseInt(startTime[0])
    const startMinute = parseInt(startTime[1])

    const startDate = new Date()
    startDate.setHours(startHour, startMinute, 0)

    // Add 15 minutes to start time
    const noShowTime = new Date(startDate)
    noShowTime.setMinutes(noShowTime.getMinutes() + 15)

    // Calculate end time based on duration
    const endDate = new Date(startDate)
    endDate.setMinutes(endDate.getMinutes() + (reservation.duration || 60))

    return now >= noShowTime && now <= endDate
  }

  // Handle marking a reservation as a no-show
  const handleMarkAsNoShow = (reservationId: string) => {
    handleNoShow(reservationId)
  }

  // Get estimated wait time
  const getWaitTime = () => {
    return getEstimatedWaitTimeForGameType("ps5")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            <span>Select Date</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="mx-auto"
            disabled={{ before: new Date() }}
          />

          <div className="mt-4 space-y-2">
            <h3 className="font-medium">PS5 Status</h3>
            <div className="flex items-center gap-2">
              <Badge variant={ps5Station?.status === "available" ? "success" : "secondary"}>
                {ps5Station?.status || "Loading..."}
              </Badge>
              {ps5Station?.status === "occupied" && (
                <span className="text-sm text-gray-500">
                  Currently in use
                </span>
              )}
            </div>

            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Estimated wait time: <span className="font-medium">{getWaitTime()} minutes</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            <span>PS5 Schedule for {format(selectedDate, "MMMM d, yyyy")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {/* Group reservations by hour for better organization */}
              {(() => {
                // Create hour-based groups
                const hourGroups: Record<string, Reservation[]> = {}

                ps5Reservations.forEach(reservation => {
                  const hour = reservation.timeSlot.start.split(':')[0]
                  if (!hourGroups[hour]) {
                    hourGroups[hour] = []
                  }
                  hourGroups[hour].push(reservation)
                })

                // Sort hours
                const sortedHours = Object.keys(hourGroups).sort()

                // If no reservations, show empty state
                if (sortedHours.length === 0) {
                  return (
                    <div className="p-6 border rounded-lg text-center bg-gray-50">
                      <p className="text-gray-500">No PS5 reservations for this date.</p>
                    </div>
                  )
                }

                // Render hour groups
                return sortedHours.map(hour => {
                  const hourReservations = hourGroups[hour]

                  return (
                    <div key={hour} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 font-medium">
                        {hour}:00 - {(parseInt(hour) + 1).toString().padStart(2, '0')}:00
                      </div>

                      <div className="divide-y">
                        {hourReservations.map(reservation => {
                          const isActive = isCurrentlyActive(reservation)
                          const isNoShowReservation = isNoShow(reservation)

                          // Calculate end time based on duration
                          const [startHour, startMinute] = reservation.timeSlot.start.split(':').map(Number)
                          const startMinutes = startHour * 60 + startMinute
                          const endMinutes = startMinutes + (reservation.duration || 60)
                          const endHour = Math.floor(endMinutes / 60)
                          const endMinute = endMinutes % 60
                          const formattedEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`

                          return (
                            <div key={reservation.id} className={`p-4 ${isActive ? "bg-blue-50" : ""}`}>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">
                                    {reservation.timeSlot.start} - {formattedEndTime}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Badge variant={
                                    isActive ? "default" :
                                    isNoShowReservation ? "destructive" :
                                    "outline"
                                  }>
                                    {isActive ? "Active" :
                                     isNoShowReservation ? "No-show?" :
                                     "Reserved"}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {reservation.duration} min
                                  </Badge>
                                </div>
                              </div>

                              <div className="mt-2">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{reservation.name}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                      <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span>{reservation.playerCount} players</span>
                                      </div>
                                    </div>
                                  </div>

                                  {isNoShowReservation && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleMarkAsNoShow(reservation.id)}
                                    >
                                      Mark as No-show
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
