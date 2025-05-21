"use client"

import { useState } from "react"
import { useStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { BombIcon as BilliardBall, Target, Gamepad2, Clock, User } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { OperationalHours } from "@/components/operational-hours"

export default function AvailabilityPage() {
  const { stations, timeSlots, getReservationsForDate } = useStore()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState<string>("all")
  const formattedDate = format(selectedDate, "yyyy-MM-dd")
  const reservations = getReservationsForDate(formattedDate)

  // Group reservations by time slot
  const reservationsByTimeSlot = timeSlots.map((timeSlot) => {
    const reservationsForTimeSlot = reservations.filter((reservation) => reservation.timeSlot.id === timeSlot.id)

    return {
      timeSlot,
      reservations: reservationsForTimeSlot,
    }
  })

  // Get game type icon
  const getGameIcon = (type: string) => {
    switch (type) {
      case "pool":
        return <BilliardBall className="h-5 w-5" />
      case "snooker":
        return <Target className="h-5 w-5" />
      case "ps5":
        return <Gamepad2 className="h-5 w-5" />
      default:
        return null
    }
  }

  // Get station availability for a time slot
  const getStationAvailability = (stationId: string, timeSlotId: string) => {
    return !reservations.some(
      (reservation) => reservation.stationId === stationId && reservation.timeSlot.id === timeSlotId,
    )
  }

  // Filter stations based on active tab
  const filteredStations = stations.filter((station) => {
    if (activeTab === "all") return true
    return station.type === activeTab
  })

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-blue-900">Station Availability</h1>
          <p className="text-center text-gray-600 mb-8">Check the current availability of our gaming stations</p>
          <div className="max-w-md mx-auto mb-8">
            <OperationalHours />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="border rounded-md p-3"
                />
              </CardContent>
            </Card>

            {/* Availability Overview */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-blue-900">
                    Availability for {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </CardTitle>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="pool">Pool</TabsTrigger>
                      <TabsTrigger value="snooker">Snooker</TabsTrigger>
                      <TabsTrigger value="ps5">PS5</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reservationsByTimeSlot.map(({ timeSlot, reservations }) => (
                    <div key={timeSlot.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center mb-3">
                        <Clock className="h-5 w-5 text-blue-900 mr-2" />
                        <h3 className="font-medium">
                          {timeSlot.start} - {timeSlot.end}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {filteredStations.map((station) => {
                          const isAvailable = getStationAvailability(station.id, timeSlot.id)
                          const reservation = reservations.find((r) => r.stationId === station.id)

                          return (
                            <Card
                              key={station.id}
                              className={`border ${
                                isAvailable ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                              }`}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center mb-1">
                                  {getGameIcon(station.type)}
                                  <span className="ml-1 text-sm font-medium">{station.name}</span>
                                </div>

                                <Badge className={`text-xs ${isAvailable ? "bg-green-500" : "bg-red-500"}`}>
                                  {isAvailable ? "Available" : "Booked"}
                                </Badge>

                                {!isAvailable && reservation && (
                                  <div className="mt-2 text-xs flex items-center text-gray-600">
                                    <User className="h-3 w-3 mr-1" />
                                    <span>{reservation.playerCount} player(s)</span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
