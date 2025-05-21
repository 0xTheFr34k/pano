"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore, type GameType, type Reservation, type StoreState, type User } from "@/store/use-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import {
  BombIcon as BilliardBall,
  Target,
  Gamepad2,
  Trash2,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  UserCog,
  CalendarDays,
  UserPlus,
  Clock,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { QueueList } from "@/components/queue/queue-list"
import { QueueStatistics } from "@/components/queue/queue-statistics"

export default function AdminPage() {
  const router = useRouter()
  const {
    currentUser,
    adminFilter,
    setAdminFilter,
    updateReservationStatus,
    deleteReservation,
    getFilteredReservations,
    users,
    stations,
    waitingPlayers,
    getPendingUsers,
    approveUser,
    rejectUser,
  } = useStore()

  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    adminFilter.date ? new Date(adminFilter.date) : new Date(),
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [reservationToUpdate, setReservationToUpdate] = useState<{ id: string; status: Reservation["status"] } | null>(
    null,
  )
  const [userActionDialogOpen, setUserActionDialogOpen] = useState(false)
  const [userToAction, setUserToAction] = useState<{ id: string; action: "approve" | "reject" } | null>(null)

  // Redirect if not admin
  useEffect(() => {
    if (!currentUser?.isAdmin) {
      router.push("/")
    }
  }, [currentUser, router])

  // Update date filter when calendar selection changes
  useEffect(() => {
    if (selectedDate) {
      setAdminFilter({ date: format(selectedDate, "yyyy-MM-dd") })
    }
  }, [selectedDate, setAdminFilter])

  const filteredReservations = getFilteredReservations()
  const pendingUsers = getPendingUsers()

  // Count reservations by status
  const todayReservations = useStore
    .getState()
    .reservations.filter((r) => r.date === new Date().toISOString().split("T")[0])
  const confirmedCount = todayReservations.filter((r) => r.status === "confirmed").length
  const completedCount = todayReservations.filter((r) => r.status === "completed").length
  const cancelledCount = todayReservations.filter((r) => r.status === "cancelled").length
  const noShowCount = todayReservations.filter((r) => r.status === "no-show").length

  // Count stations in use
  const stationsInUse = stations.filter((station) => {
    return todayReservations.some((r) => r.stationId === station.id && r.status === "confirmed")
  }).length

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    setReservationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (reservationToDelete) {
      deleteReservation(reservationToDelete)
      setReservationToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  // Handle status update
  const handleStatusClick = (id: string, status: Reservation["status"]) => {
    setReservationToUpdate({ id, status })
    setStatusDialogOpen(true)
  }

  const confirmStatusUpdate = () => {
    if (reservationToUpdate) {
      updateReservationStatus(reservationToUpdate.id, reservationToUpdate.status)
      setReservationToUpdate(null)
      setStatusDialogOpen(false)
    }
  }

  // Handle user approval/rejection
  const handleUserAction = (id: string, action: "approve" | "reject") => {
    setUserToAction({ id, action })
    setUserActionDialogOpen(true)
  }

  const confirmUserAction = () => {
    if (userToAction) {
      if (userToAction.action === "approve") {
        approveUser(userToAction.id)
      } else {
        rejectUser(userToAction.id)
      }
      setUserToAction(null)
      setUserActionDialogOpen(false)
    }
  }

  // Get game type icon
  const getGameIcon = (type: GameType) => {
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

  // Get user status badge
  const getUserStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return null
    }
  }

  if (!currentUser?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-blue-900">Admin Dashboard</h1>
        <p className="text-center text-gray-600 mb-8">Manage reservations, users, and club operations</p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-8">
            <TabsList className="grid grid-cols-5 w-full max-w-md mx-auto mb-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="reservations" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>Reservations</span>
              </TabsTrigger>
              <TabsTrigger value="queues" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Queues</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                <span>Members</span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Pending</span>
                {pendingUsers.length > 0 && <Badge className="ml-1 bg-amber-500">{pendingUsers.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push("/admin/tables")}>
                <BilliardBall className="h-4 w-4 mr-2" />
                Table Management
              </Button>
              <Button variant="outline" onClick={() => router.push("/admin/queue")}>
                <Clock className="h-4 w-4 mr-2" />
                Queue Management
              </Button>
            </div>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Today's Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{confirmedCount}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {completedCount} completed, {cancelledCount} cancelled, {noShowCount} no-shows
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Stations In Use</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stationsInUse} / {stations.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((stationsInUse / stations.length) * 100)}% occupancy rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Waiting Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{waitingPlayers.length}</div>
                  <p className="text-xs text-gray-500 mt-1">Players looking for matches</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Pending Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{pendingUsers.length}</div>
                  <p className="text-xs text-gray-500 mt-1">Accounts awaiting approval</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Reservations</CardTitle>
                  <CardDescription>Quick overview of today's bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {todayReservations.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No reservations for today</p>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {todayReservations.map((reservation) => (
                        <Card key={reservation.id} className="overflow-hidden">
                          <div
                            className={`border-l-4 ${
                              reservation.status === "confirmed"
                                ? "border-green-500"
                                : reservation.status === "completed"
                                  ? "border-blue-500"
                                  : reservation.status === "cancelled"
                                    ? "border-amber-500"
                                    : "border-red-500"
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center">
                                    {getGameIcon(reservation.gameType)}
                                    <span className="ml-2 font-medium">{reservation.name}</span>
                                    {getStatusBadge(reservation.status)}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    {reservation.timeSlot.start} - {reservation.timeSlot.end} •{" "}
                                    {reservation.playerCount} players
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusClick(reservation.id, "completed")}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusClick(reservation.id, "no-show")}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Account Requests</CardTitle>
                  <CardDescription>New members awaiting approval</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No pending account requests</p>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {pendingUsers.map((user) => (
                        <Card key={user.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                    {user.avatar ? (
                                      <img
                                        src={user.avatar || "/placeholder.svg"}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full"
                                      />
                                    ) : (
                                      <span className="text-blue-900 font-bold">{user.name.charAt(0)}</span>
                                    )}
                                  </div>
                                  <span className="font-medium">{user.name}</span>
                                  <Badge className="ml-2 bg-amber-500">Pending</Badge>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {user.email} • {user.phone}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Preferred game: {user.gamePreference === "all" ? "All Games" : user.gamePreference} •
                                  Skill level: {user.skillLevel}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handleUserAction(user.id, "approve")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleUserAction(user.id, "reject")}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Queue Management Tab */}
          <TabsContent value="queues">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <QueueStatistics />
              </div>
              <div className="md:col-span-3">
                <QueueList isAdmin={true} />
              </div>
            </div>
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Game Type</Label>
                    <Select
                      value={adminFilter.gameType}
                      onValueChange={(value) => setAdminFilter({ gameType: value as GameType | "all" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select game type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Games</SelectItem>
                        <SelectItem value="pool">Pool</SelectItem>
                        <SelectItem value="snooker">Snooker</SelectItem>
                        <SelectItem value="ps5">PS5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <div className="border rounded-md p-3">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="mx-auto" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={adminFilter.status}
                      onValueChange={(value) =>
                        setAdminFilter({ status: value as StoreState["adminFilter"]["status"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no-show">No-Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setAdminFilter({
                        gameType: "all",
                        date: new Date().toISOString().split("T")[0],
                        status: "all",
                      })
                      setSelectedDate(new Date())
                    }}
                  >
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Reservations</CardTitle>
                  <CardDescription>
                    {adminFilter.date ? `Date: ${format(new Date(adminFilter.date), "MMMM d, yyyy")}` : "All dates"}
                    {adminFilter.gameType !== "all" ? ` • Game: ${adminFilter.gameType}` : ""}
                    {adminFilter.status !== "all" ? ` • Status: ${adminFilter.status}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredReservations.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No reservations match your filters</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Game</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredReservations.map((reservation) => (
                            <TableRow key={reservation.id}>
                              <TableCell className="font-medium">{reservation.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {getGameIcon(reservation.gameType)}
                                  <span className="ml-2 capitalize">{reservation.gameType}</span>
                                </div>
                              </TableCell>
                              <TableCell>{format(new Date(reservation.date), "MMM d, yyyy")}</TableCell>
                              <TableCell>
                                {reservation.timeSlot.start} - {reservation.timeSlot.end}
                              </TableCell>
                              <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusClick(reservation.id, "completed")}
                                    disabled={reservation.status === "completed"}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusClick(reservation.id, "no-show")}
                                    disabled={reservation.status === "no-show"}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteClick(reservation.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Club Members</CardTitle>
                <CardDescription>Manage registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Preferred Game</TableHead>
                        <TableHead>Skill Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                {user.avatar ? (
                                  <img
                                    src={user.avatar || "/placeholder.svg"}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full"
                                  />
                                ) : (
                                  <span className="text-blue-900 font-bold">{user.name.charAt(0)}</span>
                                )}
                              </div>
                              {user.name}
                              {user.isAdmin && <Badge className="ml-2 bg-blue-900">Admin</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>
                            {user.gamePreference === "all" ? (
                              "All Games"
                            ) : (
                              <div className="flex items-center">
                                {getGameIcon(user.gamePreference as GameType)}
                                <span className="ml-2 capitalize">{user.gamePreference}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="capitalize">{user.skillLevel}</TableCell>
                          <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                          <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Accounts Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Account Requests</CardTitle>
                <CardDescription>Review and approve new member registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No pending account requests</p>
                    <p className="text-sm text-gray-400 mt-2">All member requests have been processed</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Preferred Game</TableHead>
                          <TableHead>Skill Level</TableHead>
                          <TableHead>Requested On</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                  {user.avatar ? (
                                    <img
                                      src={user.avatar || "/placeholder.svg"}
                                      alt={user.name}
                                      className="w-8 h-8 rounded-full"
                                    />
                                  ) : (
                                    <span className="text-blue-900 font-bold">{user.name.charAt(0)}</span>
                                  )}
                                </div>
                                {user.name}
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell>
                              {user.gamePreference === "all" ? (
                                "All Games"
                              ) : (
                                <div className="flex items-center">
                                  {getGameIcon(user.gamePreference as GameType)}
                                  <span className="ml-2 capitalize">{user.gamePreference}</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="capitalize">{user.skillLevel}</TableCell>
                            <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handleUserAction(user.id, "approve")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleUserAction(user.id, "reject")}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this reservation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Reservation Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this reservation as{" "}
              {reservationToUpdate?.status === "completed" ? "completed" : "no-show"}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStatusUpdate}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Action Dialog */}
      <Dialog open={userActionDialogOpen} onOpenChange={setUserActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{userToAction?.action === "approve" ? "Approve Account" : "Reject Account"}</DialogTitle>
            <DialogDescription>
              {userToAction?.action === "approve"
                ? "Are you sure you want to approve this account? The user will be able to make reservations and join matches."
                : "Are you sure you want to reject this account? The user will not be able to log in."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmUserAction}
              variant={userToAction?.action === "approve" ? "default" : "destructive"}
            >
              {userToAction?.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
