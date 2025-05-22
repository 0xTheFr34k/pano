"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore, type Station } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock } from "lucide-react"
import TableSelection from "@/components/admin/table-selection"
import ProtectedRoute from "@/components/protected-route"

export default function DashboardTablesPage() {
  const router = useRouter()
  const {
    stations,
    timeSlots,
    createAdminReservation,
    updateStationStatus,
    getReservationsForDate,
  } = useStore()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>("")
  const [selectedTableId, setSelectedTableId] = useState<string>("")
  const [showCreateReservationDialog, setShowCreateReservationDialog] = useState(false)

  // Form state for creating a reservation
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [guestPlayerCount, setGuestPlayerCount] = useState(2)
  const [guestNotes, setGuestNotes] = useState("")

  // Get formatted date
  const formattedDate = format(selectedDate, "yyyy-MM-dd")

  // Get reservations for the selected date
  const dateReservations = getReservationsForDate(formattedDate)

  // Get pool tables
  const poolTables = stations.filter(station => station.type === "pool")

  // Get table reservations for the selected date and time slot
  const getTableReservation = (tableId: string) => {
    if (!selectedTimeSlotId) return null

    return dateReservations.find(
      reservation =>
        reservation.stationId === tableId &&
        reservation.timeSlot.id === selectedTimeSlotId &&
        reservation.status === "confirmed"
    )
  }

  const handleCreateReservation = () => {
    if (!selectedTableId || !selectedTimeSlotId || !guestName || !guestPhone) {
      return
    }

    const selectedTimeSlot = timeSlots.find(slot => slot.id === selectedTimeSlotId)
    if (!selectedTimeSlot) return

    createAdminReservation({
      stationId: selectedTableId,
      date: formattedDate,
      timeSlot: selectedTimeSlot,
      gameType: "pool",
      playerCount: guestPlayerCount,
      name: guestName,
      email: guestEmail,
      phone: guestPhone,
      notes: guestNotes,
      status: "confirmed",
    })

    // Reset form
    setGuestName("")
    setGuestEmail("")
    setGuestPhone("")
    setGuestPlayerCount(2)
    setGuestNotes("")

    setShowCreateReservationDialog(false)
  }

  const handleTableStatusChange = (tableId: string, status: Station["status"]) => {
    updateStationStatus(tableId, status)
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Table Management</h1>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Date and Time Selection */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
              <CardDescription>Choose a date and time to manage tables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Date
                  </Label>
                  <div className="border rounded-md p-3">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => setSelectedDate(date || new Date())}
                      className="mx-auto"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Time Slot
                  </Label>
                  <Select value={selectedTimeSlotId} onValueChange={setSelectedTimeSlotId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {slot.start} - {slot.end}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  disabled={!selectedTimeSlotId || !selectedTableId}
                  onClick={() => setShowCreateReservationDialog(true)}
                >
                  Create Reservation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Table Selection */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pool Tables</CardTitle>
              <CardDescription>
                {formattedDate} {selectedTimeSlotId ? `• ${timeSlots.find(slot => slot.id === selectedTimeSlotId)?.start} - ${timeSlots.find(slot => slot.id === selectedTimeSlotId)?.end}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableSelection
                gameType="pool"
                date={formattedDate}
                timeSlotId={selectedTimeSlotId}
                onTableSelect={setSelectedTableId}
                selectedTableId={selectedTableId}
              />
            </CardContent>
          </Card>

          {/* Table Status Management */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Table Status Management</CardTitle>
              <CardDescription>Update the status of each table</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {poolTables.map((table) => {
                  const reservation = getTableReservation(table.id)

                  return (
                    <Card key={table.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">{table.name}</h3>
                          <Badge className={`
                            ${table.status === "available" ? "bg-green-500" : ""}
                            ${table.status === "reserved" ? "bg-amber-500" : ""}
                            ${table.status === "occupied" ? "bg-red-500" : ""}
                            ${table.status === "maintenance" ? "bg-gray-500" : ""}
                          `}>
                            {table.status || "Available"}
                          </Badge>
                        </div>

                        {reservation && (
                          <div className="text-sm text-gray-600 mb-3">
                            <div>Reserved by: {reservation.name}</div>
                            <div>Players: {reservation.playerCount}</div>
                            {reservation.notes && <div className="italic text-xs mt-1">{reservation.notes}</div>}
                          </div>
                        )}

                        <div className="flex gap-2 mt-2">
                          <Select
                            value={table.status || "available"}
                            onValueChange={(value) => handleTableStatusChange(table.id, value as Station["status"])}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Set status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="reserved">Reserved</SelectItem>
                              <SelectItem value="occupied">Occupied</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Reservation Dialog */}
        <Dialog open={showCreateReservationDialog} onOpenChange={setShowCreateReservationDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Reservation</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Guest Name</Label>
                  <Input
                    id="name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter guest name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+212 XXXXXXXXX"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="guest@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="playerCount">Number of Players</Label>
                <Select
                  value={guestPlayerCount.toString()}
                  onValueChange={(value) => setGuestPlayerCount(parseInt(value))}
                >
                  <SelectTrigger id="playerCount">
                    <SelectValue placeholder="Select player count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Player</SelectItem>
                    <SelectItem value="2">2 Players</SelectItem>
                    <SelectItem value="3">3 Players</SelectItem>
                    <SelectItem value="4">4 Players</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={guestNotes}
                  onChange={(e) => setGuestNotes(e.target.value)}
                  placeholder="Any special requests or notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateReservationDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReservation}>Create Reservation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}