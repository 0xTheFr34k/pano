"use client"

import { useState } from "react"
import { useStore, type Reservation } from "@/store/use-store"
import { format } from "date-fns"
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Users,
  BombIcon as BilliardBall,
  Target,
  Gamepad2,
  Trophy,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Eye,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import ProtectedRoute from "@/components/protected-route"

export default function ProfilePage() {
  const { currentUser, getUserReservations, updateReservationStatus } = useStore()
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")

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

  // Get account status badge and icon
  const getAccountStatusBadge = () => {
    switch (currentUser.status) {
      case "approved":
        return (
          <div className="flex items-center">
            <ShieldCheck className="h-5 w-5 text-green-500 mr-1" />
            <Badge className="bg-green-500">Approved</Badge>
          </div>
        )
      case "pending":
        return (
          <div className="flex items-center">
            <ShieldAlert className="h-5 w-5 text-amber-500 mr-1" />
            <Badge className="bg-amber-500">Pending Approval</Badge>
          </div>
        )
      case "rejected":
        return (
          <div className="flex items-center">
            <ShieldX className="h-5 w-5 text-red-500 mr-1" />
            <Badge className="bg-red-500">Rejected</Badge>
          </div>
        )
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
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-blue-900">My Profile</h1>
          <p className="text-center text-gray-600 mb-8">Manage your account and view your reservation history</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Account Details</CardTitle>
                  {getAccountStatusBadge()}
                </div>
                <CardDescription>Your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Name */}
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} />
                    <AvatarFallback className="bg-blue-900 text-white text-2xl">
                      {currentUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">{currentUser.name}</h2>
                  {currentUser.isAdmin && <Badge className="mt-2 bg-blue-900">Administrator</Badge>}
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-blue-900 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-blue-900 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{currentUser.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Game Preferences */}
                <div className="space-y-3">
                  <h3 className="font-medium">Gaming Preferences</h3>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      {currentUser.gamePreference === "all" ? (
                        <Trophy className="h-4 w-4 text-blue-900" />
                      ) : (
                        getGameIcon(currentUser.gamePreference)
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Preferred Game</p>
                      <p>
                        {currentUser.gamePreference === "all"
                          ? "All Games"
                          : formatGameType(currentUser.gamePreference)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Trophy className="h-4 w-4 text-blue-900" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Skill Level</p>
                      <p className="capitalize">{currentUser.skillLevel}</p>
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-900 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p>{format(new Date(currentUser.createdAt), "MMMM d, yyyy")}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-900 hover:bg-blue-800">Edit Profile</Button>
              </CardFooter>
            </Card>

            {/* Reservations */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>My Reservations</CardTitle>
                <CardDescription>View and manage your bookings</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>

          {/* Account Status Alert */}
          {currentUser.status === "pending" && (
            <Alert className="mt-8 bg-amber-50 border-amber-200">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Your account is pending approval. Some features are limited until an administrator approves your
                account.
              </AlertDescription>
            </Alert>
          )}

          {currentUser.status === "rejected" && (
            <Alert className="mt-8 bg-red-50 border-red-200">
              <ShieldX className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Your account registration has been rejected. Please contact an administrator for more information.
              </AlertDescription>
            </Alert>
          )}
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
                      <Trophy className="h-5 w-5 text-blue-900" />
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
            {selectedReservation && selectedReservation.status === "confirmed" && (
              <Button
                variant="destructive"
                onClick={() => {
                  setDetailsDialogOpen(false)
                  handleCancelClick(selectedReservation)
                }}
              >
                Cancel Reservation
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Reservation
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
