"use client"

import { useState, useEffect } from "react"
import { useStore, type Reservation } from "@/store/use-store"
import { format } from "date-fns"
import {
  Calendar,
  Clock,
  Users,
  BombIcon as BilliardBall,
  Target,
  Gamepad2,
  Eye,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ProtectedRoute from "@/components/protected-route"
import { useRouter } from "next/navigation"

export default function MyReservationsPage() {
  const { 
    currentUser, 
    getUserReservations, 
    updateReservationStatus,
    reservations,
    getDynamicPS5TimeSlots
  } = useStore()
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  // Effect to refresh reservations periodically
  useEffect(() => {
    // Initial refresh
    refreshAvailability()

    // Set up interval for periodic refresh (every 2 minutes)
    const intervalId = setInterval(() => {
      refreshAvailability()
    }, 2 * 60 * 1000)

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [])

  if (!currentUser) {
    return null
  }

  // Get all user reservations
  const allReservations = getUserReservations(currentUser.id)

  // Filter reservations based on active tab
  const today = new Date().toISOString().split("T")[0]
  const upcomingReservations = allReservations.filter(
    (r) => (r.date > today || (r.date === today && isTimeSlotUpcoming(r.timeSlot.start))) && r.status === "confirmed",
  )
  const pastReservations = allReservations.filter(
    (r) => r.date < today || (r.date === today && !isTimeSlotUpcoming(r.timeSlot.start)) || r.status !== "confirmed",
  )

  // Check if a time slot is upcoming
  function isTimeSlotUpcoming(timeStart: string): boolean {
    const [hours, minutes] = timeStart.split(":").map(Number)
    const now = new Date()
    return now.getHours() < hours || (now.getHours() === hours && now.getMinutes() < minutes)
  }

  // Refresh availability by forcing a re-fetch of time slots
  function refreshAvailability() {
    setRefreshing(true)
    
    // Force refresh of time slots for today
    if (currentUser) {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0]
      
      // Refresh time slots for different durations
      getDynamicPS5TimeSlots(today, 10)
      getDynamicPS5TimeSlots(today, 30)
      getDynamicPS5TimeSlots(today, 60)
      
      // Set a timeout to reset the refreshing state
      setTimeout(() => {
        setRefreshing(false)
      }, 1000)
    }
  }

  // Get game type icon
  const getGameIcon = (type: string) => {
    switch (type) {
      case "pool":
        return <BilliardBall className="h-5 w-5 text-blue-900" />
      case "snooker":
        return <Target className="h-5 w-5 text-blue-900" />
      case "ps5":
        return <Gamepad2 className="h-5 w-5 text-blue-900" />
      default:
        return null
    }
  }

  // Get status badge
  const getStatusBadge = (status: Reservation["status"]) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-amber-500">Cancelled</Badge>
      case "no-show":
        return <Badge className="bg-red-500">No-Show</Badge>
      default:
        return null
    }
  }

  // Handle view details
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setDetailsDialogOpen(true)
  }

  // Handle cancel reservation
  const handleCancelClick = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setCancelDialogOpen(true)
  }

  const confirmCancel = () => {
    if (selectedReservation) {
      updateReservationStatus(selectedReservation.id, "cancelled")
      setCancelDialogOpen(false)
      
      // Refresh availability after cancellation
      refreshAvailability()
    }
  }

  // Format game type for display
  const formatGameType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  // Format match type for display
  const formatMatchType = (type: string) => {
    switch (type) {
      case "first-to-3":
        return "First to 3 wins"
      case "first-to-5":
        return "First to 5 wins"
      case "first-to-7":
        return "First to 7 wins"
      case "time-based":
        return "Time-based (no target)"
      default:
        return type
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900">My Reservations</h1>
              <p className="text-gray-600 mt-1">View and manage your bookings</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={refreshAvailability}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                className="bg-blue-900 hover:bg-blue-800"
                onClick={() => router.push('/reserve')}
              >
                New Reservation
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="upcoming" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Upcoming</span>
                    {upcomingReservations.length > 0 && (
                      <Badge className="ml-1 bg-blue-900">{upcomingReservations.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="past" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Past</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                  {upcomingReservations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p>You don't have any upcoming reservations</p>
                      <Button asChild className="mt-4 bg-blue-900 hover:bg-blue-800">
                        <a href="/reserve">Book a Game</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingReservations.map((reservation) => (
                        <Card key={reservation.id} className="overflow-hidden">
                          <div className="border-l-4 border-green-500">
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                  <div className="flex items-center">
                                    {getGameIcon(reservation.gameType)}
                                    <span className="ml-2 font-medium capitalize">{reservation.gameType}</span>
                                    {getStatusBadge(reservation.status)}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    {format(new Date(reservation.date), "EEEE, MMMM d, yyyy")} •{" "}
                                    {reservation.timeSlot.start} - {reservation.timeSlot.end}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    <Users className="h-4 w-4 inline mr-1" />
                                    {reservation.playerCount} player(s)
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewDetails(reservation)}
                                    className="text-blue-900 border-blue-200 hover:bg-blue-50"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Details
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCancelClick(reservation)}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="past">
                  {pastReservations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p>You don't have any past reservations</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastReservations.map((reservation) => (
                        <Card key={reservation.id} className="overflow-hidden">
                          <div
                            className={`border-l-4 ${
                              reservation.status === "completed"
                                ? "border-blue-500"
                                : reservation.status === "cancelled"
                                  ? "border-amber-500"
                                  : "border-red-500"
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                  <div className="flex items-center">
                                    {getGameIcon(reservation.gameType)}
                                    <span className="ml-2 font-medium capitalize">{reservation.gameType}</span>
                                    {getStatusBadge(reservation.status)}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    {format(new Date(reservation.date), "EEEE, MMMM d, yyyy")} •{" "}
                                    {reservation.timeSlot.start} - {reservation.timeSlot.end}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    <Users className="h-4 w-4 inline mr-1" />
                                    {reservation.playerCount} player(s)
                                  </div>
                                </div>
                                <div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewDetails(reservation)}
                                    className="text-blue-900 border-blue-200 hover:bg-blue-50"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Details
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Reservation Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
            <DialogDescription>
              {selectedReservation &&
                `${format(new Date(selectedReservation.date), "MMMM d, yyyy")} • ${selectedReservation.timeSlot.start} - ${
                  selectedReservation.timeSlot.end
                }`}
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="flex items-center">
                {getGameIcon(selectedReservation.gameType)}
                <span className="ml-2 text-gray-700 font-medium w-32">Game Type:</span>
                <span className="text-gray-900 capitalize">{selectedReservation.gameType}</span>
              </div>

              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-900" />
                <span className="ml-2 text-gray-700 font-medium w-32">Players:</span>
                <span className="text-gray-900">{selectedReservation.playerCount}</span>
              </div>

              {/* Game-specific details */}
              {selectedReservation.gameType === "ps5" && (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-900" />
                  <span className="ml-2 text-gray-700 font-medium w-32">Duration:</span>
                  <span className="text-gray-900">{selectedReservation.duration} minutes</span>
                </div>
              )}

              {selectedReservation.gameType === "snooker" && (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-900" />
                  <span className="ml-2 text-gray-700 font-medium w-32">Duration:</span>
                  <span className="text-gray-900">{selectedReservation.duration} minutes</span>
                </div>
              )}

              {selectedReservation.gameType === "pool" && (
                <>
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-blue-900" />
                    <span className="ml-2 text-gray-700 font-medium w-32">Match Type:</span>
                    <span className="text-gray-900">
                      {selectedReservation.matchType && formatMatchType(selectedReservation.matchType)}
                    </span>
                  </div>
                  {selectedReservation.isCompetitive && (
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-900" />
                      <span className="ml-2 text-gray-700 font-medium w-32">Competitive:</span>
                      <span className="text-gray-900">Yes</span>
                    </div>
                  )}
                </>
              )}

              <div className="border-t border-gray-200 my-4"></div>

              <div className="flex items-center">
                <span className="text-gray-700 font-medium w-32">Status:</span>
                {getStatusBadge(selectedReservation.status)}
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-900" />
                <span className="ml-2 text-gray-700 font-medium w-32">Booked On:</span>
                <span className="text-gray-900">{format(new Date(selectedReservation.createdAt), "MMMM d, yyyy")}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Reservation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  {getGameIcon(selectedReservation.gameType)}
                  <span className="ml-2 font-medium capitalize">{selectedReservation.gameType}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {format(new Date(selectedReservation.date), "EEEE, MMMM d, yyyy")} •{" "}
                  {selectedReservation.timeSlot.start} - {selectedReservation.timeSlot.end}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Reservation
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Cancel Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
