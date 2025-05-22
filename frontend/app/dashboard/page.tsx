"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Gamepad2,
  Users,
  CalendarDays,
  UserPlus,
  Clock,
  Settings,
} from "lucide-react"
import { SnookerIcon } from "@/components/icons/snooker-icon"
import { EightBallIcon } from "@/components/icons/eight-ball-icon"
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
import { QueueStatistics } from "@/components/queue/queue-statistics"

export default function DashboardPage() {
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
    getPendingUsers,
    approveUser,
    rejectUser,
    queues,
    getQueuesByGameType,
    removeFromQueue,
    updateQueueEntry,
    notifyQueueEntry,
  } = useStore()

  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    adminFilter.date ? new Date(adminFilter.date) : new Date(),
  )
  const [selectedReservation, setSelectedReservation] = useState<{id: string} | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) {
      router.push("/")
    }
  }, [currentUser, router])

  if (!currentUser?.isAdmin) {
    return null
  }

  const filteredReservations = getFilteredReservations()
  const pendingUsers = getPendingUsers()

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setAdminFilter({
        ...adminFilter,
        date: date.toISOString().split("T")[0],
      })
    }
  }

  const handleStatusChange = (reservationId: string, newStatus: string) => {
    updateReservationStatus(reservationId, newStatus as "confirmed" | "cancelled" | "no-show" | "completed")
  }

  const handleDeleteReservation = () => {
    if (selectedReservation) {
      deleteReservation(selectedReservation.id)
      setSelectedReservation(null)
      setShowDeleteDialog(false)
    }
  }

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case "pool":
        return <EightBallIcon className="h-4 w-4" />
      case "snooker":
        return <SnookerIcon className="h-4 w-4" />
      case "ps5":
        return <Gamepad2 className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      case "no-show":
        return <Badge className="bg-orange-500">No Show</Badge>
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getQueueStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "notified":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "processing":
        return "bg-green-100 text-green-800 border-green-300"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-blue-900">Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <CalendarDays className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <CalendarDays className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Reservations</span>
              <span className="sm:hidden">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Clock className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Queue</span>
              <span className="sm:hidden">Queue</span>
              {queues.filter(q => q.status === "waiting").length > 0 && (
                <Badge className="ml-1 bg-orange-500 text-white text-xs">
                  {queues.filter(q => q.status === "waiting").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <UserPlus className="h-3 w-3 md:h-4 md:w-4" />
              <span>Pending</span>
              {pendingUsers.length > 0 && <Badge className="ml-1 bg-amber-500 text-white text-xs">{pendingUsers.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/tables")}
              className="w-full sm:w-auto text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              <EightBallIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Table Management</span>
              <span className="sm:hidden">Tables</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/queue")}
              className="w-full sm:w-auto text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              <Clock className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Queue Management</span>
              <span className="sm:hidden">Queue</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/game-stations")}
              className="w-full sm:w-auto text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Game Stations</span>
              <span className="sm:hidden">Games</span>
            </Button>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredReservations.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.filter(u => u.status === "approved").length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingUsers.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Game Stations</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stations.length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Queue Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <QueueStatistics />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredReservations.slice(0, 5).map((reservation) => (
                      <div key={reservation.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getGameIcon(reservation.gameType)}
                          <span className="text-sm">{reservation.name}</span>
                        </div>
                        {getStatusBadge(reservation.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reservations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Filter by Date</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Filter Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gameType" className="text-sm font-medium">Game Type</Label>
                      <Select
                        value={adminFilter.gameType}
                        onValueChange={(value) =>
                          setAdminFilter({ ...adminFilter, gameType: value as "all" | "pool" | "snooker" | "ps5" })
                        }
                      >
                        <SelectTrigger className="text-gray-700">
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

                    <div>
                      <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                      <Select
                        value={adminFilter.status}
                        onValueChange={(value) =>
                          setAdminFilter({ ...adminFilter, status: value as "all" | "confirmed" | "cancelled" | "no-show" | "completed" })
                        }
                      >
                        <SelectTrigger className="text-gray-700">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no-show">No Show</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Reservations ({filteredReservations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Game</TableHead>
                        <TableHead className="min-w-[120px]">Player</TableHead>
                        <TableHead className="min-w-[100px] hidden sm:table-cell">Date</TableHead>
                        <TableHead className="min-w-[100px] hidden md:table-cell">Time</TableHead>
                        <TableHead className="min-w-[80px]">Status</TableHead>
                        <TableHead className="min-w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getGameIcon(reservation.gameType)}
                              <span className="capitalize text-sm">{reservation.gameType}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{reservation.name}</TableCell>
                          <TableCell className="text-sm hidden sm:table-cell">{reservation.date}</TableCell>
                          <TableCell className="text-sm hidden md:table-cell">
                            {reservation.timeSlot.start} - {reservation.timeSlot.end}
                          </TableCell>
                          <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Select
                                value={reservation.status}
                                onValueChange={(value) => handleStatusChange(reservation.id, value)}
                              >
                                <SelectTrigger className="w-full sm:w-32 text-gray-700">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                  <SelectItem value="no-show">No Show</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedReservation(reservation)
                                  setShowDeleteDialog(true)
                                }}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Queue Entries ({queues.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Game</TableHead>
                        <TableHead className="min-w-[120px]">Player</TableHead>
                        <TableHead className="min-w-[80px]">Position</TableHead>
                        <TableHead className="min-w-[100px] hidden sm:table-cell">Date</TableHead>
                        <TableHead className="min-w-[100px] hidden md:table-cell">Wait Time</TableHead>
                        <TableHead className="min-w-[80px]">Status</TableHead>
                        <TableHead className="min-w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queues.map((queueEntry) => (
                        <TableRow key={queueEntry.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getGameIcon(queueEntry.gameType)}
                              <span className="capitalize text-sm">{queueEntry.gameType}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{queueEntry.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">#{queueEntry.position}</Badge>
                          </TableCell>
                          <TableCell className="text-sm hidden sm:table-cell">{queueEntry.date}</TableCell>
                          <TableCell className="text-sm hidden md:table-cell">
                            {queueEntry.estimatedWaitTime || 0} min
                          </TableCell>
                          <TableCell>
                            <Badge className={getQueueStatusColor(queueEntry.status)}>
                              {queueEntry.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col sm:flex-row gap-2">
                              {queueEntry.status === "waiting" && (
                                <Button
                                  size="sm"
                                  onClick={() => notifyQueueEntry(queueEntry.id)}
                                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  Notify
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeFromQueue(queueEntry.id)}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                              >
                                Remove
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Name</TableHead>
                        <TableHead className="min-w-[150px] hidden sm:table-cell">Email</TableHead>
                        <TableHead className="min-w-[100px] hidden md:table-cell">Game Preference</TableHead>
                        <TableHead className="min-w-[80px]">Status</TableHead>
                        <TableHead className="min-w-[100px] hidden lg:table-cell">Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="text-sm">{user.name}</TableCell>
                          <TableCell className="text-sm hidden sm:table-cell">{user.email}</TableCell>
                          <TableCell className="text-sm capitalize hidden md:table-cell">{user.gamePreference}</TableCell>
                          <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                          <TableCell className="text-sm hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending User Approvals ({pendingUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending user approvals</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[120px]">Name</TableHead>
                          <TableHead className="min-w-[150px] hidden sm:table-cell">Email</TableHead>
                          <TableHead className="min-w-[100px] hidden md:table-cell">Game Preference</TableHead>
                          <TableHead className="min-w-[100px] hidden lg:table-cell">Requested</TableHead>
                          <TableHead className="min-w-[180px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="text-sm">{user.name}</TableCell>
                            <TableCell className="text-sm hidden sm:table-cell">{user.email}</TableCell>
                            <TableCell className="text-sm capitalize hidden md:table-cell">{user.gamePreference}</TableCell>
                            <TableCell className="text-sm hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => approveUser(user.id)}
                                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => rejectUser(user.id)}
                                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                                >
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

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Reservation</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this reservation? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="w-full sm:w-auto text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteReservation}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
