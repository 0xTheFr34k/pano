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
  BombIcon as BilliardBall,
  Target,
  Gamepad2,
  Users,
  CalendarDays,
  UserPlus,
  Clock,
  Settings,
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
        return <BilliardBall className="h-4 w-4" />
      case "snooker":
        return <Target className="h-4 w-4" />
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-blue-900">Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Reservations</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Pending</span>
              {pendingUsers.length > 0 && <Badge className="ml-1 bg-amber-500">{pendingUsers.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <div className="flex justify-center gap-4 mb-6">
            <Button variant="outline" onClick={() => router.push("/dashboard/tables")}>
              <BilliardBall className="h-4 w-4 mr-2" />
              Table Management
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/queue")}>
              <Clock className="h-4 w-4 mr-2" />
              Queue Management
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/game-stations")}>
              <Settings className="h-4 w-4 mr-2" />
              Game Stations
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Filter by Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Filter Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="gameType">Game Type</Label>
                    <Select
                      value={adminFilter.gameType}
                      onValueChange={(value) =>
                        setAdminFilter({ ...adminFilter, gameType: value as "all" | "pool" | "snooker" | "ps5" })
                      }
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

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={adminFilter.status}
                      onValueChange={(value) =>
                        setAdminFilter({ ...adminFilter, status: value as "all" | "confirmed" | "cancelled" | "no-show" | "completed" })
                      }
                    >
                      <SelectTrigger>
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
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Reservations ({filteredReservations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getGameIcon(reservation.gameType)}
                            <span className="capitalize">{reservation.gameType}</span>
                          </div>
                        </TableCell>
                        <TableCell>{reservation.name}</TableCell>
                        <TableCell>{reservation.date}</TableCell>
                        <TableCell>
                          {reservation.timeSlot.start} - {reservation.timeSlot.end}
                        </TableCell>
                        <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Select
                              value={reservation.status}
                              onValueChange={(value) => handleStatusChange(reservation.id, value)}
                            >
                              <SelectTrigger className="w-32">
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
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Game Preference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize">{user.gamePreference}</TableCell>
                        <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Game Preference</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell className="capitalize">{user.gamePreference}</TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => approveUser(user.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => rejectUser(user.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteReservation}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
