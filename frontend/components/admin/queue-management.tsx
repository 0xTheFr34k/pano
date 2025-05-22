"use client"

import { useState } from "react"
import { useStore, type QueueEntry, type GameType, type QueueStatus } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BombIcon as BilliardBall, Target, Gamepad2, UserPlus, Clock, Edit, Trash2, ArrowUp, ArrowDown, MoreHorizontal, Bell, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import TableSelection from "@/components/admin/table-selection"

export default function QueueManagement() {
  const {
    queues,
    timeSlots,
    getQueuesByGameType,
    addGuestToQueue,
    updateQueuePosition,
    updateQueuePriority,
    updateQueueEntry,
    notifyQueueEntry,
    markQueueEntryAsProcessing,
    completeQueueEntry,
    cancelQueueEntry,
    removeFromQueue,
    assignTableToQueueEntry,
    moveQueueEntryToReservation,
  } = useStore()

  const [activeGameTab, setActiveGameTab] = useState<string>("pool")
  const [statusFilter, setStatusFilter] = useState<QueueStatus | "all">("waiting")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedQueueId, setSelectedQueueId] = useState<string>("")
  const [selectedTableId, setSelectedTableId] = useState<string>("")

  // Form state for adding a guest
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [guestGameType, setGuestGameType] = useState<GameType>("pool")
  const [guestPlayerCount, setGuestPlayerCount] = useState(2)
  const [guestTimeSlotId, setGuestTimeSlotId] = useState("none")
  const [guestPriority, setGuestPriority] = useState<"normal" | "high" | "vip">("normal")
  const [guestNotes, setGuestNotes] = useState("")

  // Form state for editing a queue entry
  const [editNotes, setEditNotes] = useState("")
  const [editPriority, setEditPriority] = useState<"normal" | "high" | "vip">("normal")
  const [editPosition, setEditPosition] = useState(1)
  const [editEstimatedWaitTime, setEditEstimatedWaitTime] = useState(30)

  // Filter queues based on selected game type and status
  const filteredQueues = (): QueueEntry[] => {
    let result = activeGameTab === "all"
      ? queues
      : getQueuesByGameType(activeGameTab as GameType)

    if (statusFilter !== "all") {
      result = result.filter(q => q.status === statusFilter)
    }

    // Sort by priority (VIP first, then high, then normal) and then by position
    return result.sort((a, b) => {
      const priorityOrder = { vip: 0, high: 1, normal: 2 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]

      if (priorityDiff !== 0) return priorityDiff
      return a.position - b.position
    })
  }

  const handleAddGuest = () => {
    if (!guestName || !guestPhone || !guestGameType) {
      return
    }

    const today = new Date().toISOString().split("T")[0]
    const preferredTimeSlot = (guestTimeSlotId && guestTimeSlotId !== "none")
      ? timeSlots.find(slot => slot.id === guestTimeSlotId)
      : undefined

    const queueEntry = {
      name: guestName,
      email: guestEmail,
      phone: guestPhone,
      gameType: guestGameType,
      playerCount: guestPlayerCount,
      date: today,
      preferredTimeSlot,
      estimatedWaitTime: 30,
      priority: guestPriority,
      notes: guestNotes,
    }

    addGuestToQueue(queueEntry)

    // Reset form
    setGuestName("")
    setGuestEmail("")
    setGuestPhone("")
    setGuestGameType("pool")
    setGuestPlayerCount(2)
    setGuestTimeSlotId("none")
    setGuestPriority("normal")
    setGuestNotes("")

    setShowAddDialog(false)
  }

  const handleEditQueue = () => {
    if (!selectedQueueId) return

    updateQueueEntry(selectedQueueId, {
      notes: editNotes,
      priority: editPriority,
      estimatedWaitTime: editEstimatedWaitTime,
    })

    updateQueuePosition(selectedQueueId, editPosition)

    setShowEditDialog(false)
  }

  const handleAssignTable = () => {
    if (!selectedQueueId || !selectedTableId) return

    assignTableToQueueEntry(selectedQueueId, selectedTableId)
    setShowAssignDialog(false)
  }

  const handleMoveToReservation = () => {
    if (!selectedQueueId || !selectedTableId) return

    moveQueueEntryToReservation(selectedQueueId, selectedTableId)
    setShowAssignDialog(false)
  }

  const openEditDialog = (queue: QueueEntry) => {
    setSelectedQueueId(queue.id)
    setEditNotes(queue.notes || "")
    setEditPriority(queue.priority)
    setEditPosition(queue.position)
    setEditEstimatedWaitTime(queue.estimatedWaitTime || 30)
    setShowEditDialog(true)
  }

  const openAssignDialog = (queue: QueueEntry) => {
    setSelectedQueueId(queue.id)
    setSelectedTableId(queue.assignedStationId || "")
    setShowAssignDialog(true)
  }

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "vip":
        return <Badge className="bg-purple-500">VIP</Badge>
      case "high":
        return <Badge className="bg-blue-500">High</Badge>
      case "normal":
        return <Badge className="bg-green-500">Normal</Badge>
      default:
        return null
    }
  }

  // Get status badge
  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case "waiting":
        return <Badge className="bg-amber-500">Waiting</Badge>
      case "notified":
        return <Badge className="bg-blue-500">Notified</Badge>
      case "processing":
        return <Badge className="bg-green-500">Processing</Badge>
      case "completed":
        return <Badge className="bg-gray-500">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Queue Management</CardTitle>
            <CardDescription>Manage guests waiting for tables</CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Guest
          </Button>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as QueueStatus | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="notified">Notified</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeGameTab} onValueChange={setActiveGameTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="pool" className="flex items-center gap-1">
              <BilliardBall className="h-4 w-4" />
              <span>Pool</span>
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeGameTab}>
            <div className="space-y-4">
              {filteredQueues().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No queue entries found.</p>
                </div>
              ) : (
                filteredQueues().map((queue) => (
                  <Card key={queue.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{queue.name}</div>
                          <div className="text-sm text-gray-500">{queue.phone}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(queue.priority)}
                          {getStatusBadge(queue.status)}
                          <div className="text-sm font-medium">Position: {queue.position}</div>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {queue.estimatedWaitTime} min wait
                        </div>
                        <div>
                          {queue.playerCount} {queue.playerCount === 1 ? "player" : "players"}
                        </div>
                        {queue.notes && (
                          <div className="w-full mt-1 text-xs italic">
                            Note: {queue.notes}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex justify-end gap-2">
                        {queue.status === "waiting" && (
                          <Button size="sm" variant="outline" onClick={() => notifyQueueEntry(queue.id)}>
                            <Bell className="h-4 w-4 mr-1" />
                            Notify
                          </Button>
                        )}
                        {(queue.status === "waiting" || queue.status === "notified") && (
                          <Button size="sm" variant="outline" onClick={() => markQueueEntryAsProcessing(queue.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Process
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openAssignDialog(queue)}>
                          Assign Table
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openEditDialog(queue)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateQueuePosition(queue.id, Math.max(1, queue.position - 1))}>
                              <ArrowUp className="h-4 w-4 mr-2" />
                              Move Up
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateQueuePosition(queue.id, queue.position + 1)}>
                              <ArrowDown className="h-4 w-4 mr-2" />
                              Move Down
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => cancelQueueEntry(queue.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => removeFromQueue(queue.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Add Guest Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Guest to Queue</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gameType">Game Type</Label>
                <Select value={guestGameType} onValueChange={(value) => setGuestGameType(value as GameType)}>
                  <SelectTrigger id="gameType">
                    <SelectValue placeholder="Select game type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pool">Pool</SelectItem>
                    <SelectItem value="snooker">Snooker</SelectItem>
                    <SelectItem value="ps5">PS5</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeSlot">Preferred Time (Optional)</Label>
                <Select value={guestTimeSlotId} onValueChange={setGuestTimeSlotId}>
                  <SelectTrigger id="timeSlot">
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No preference</SelectItem>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.start} - {slot.end}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={guestPriority}
                  onValueChange={(value) => setGuestPriority(value as "normal" | "high" | "vip")}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGuest}>Add to Queue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Queue Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Queue Entry</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  min="1"
                  value={editPosition}
                  onChange={(e) => setEditPosition(parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={editPriority}
                  onValueChange={(value) => setEditPriority(value as "normal" | "high" | "vip")}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="waitTime">Estimated Wait Time (minutes)</Label>
              <Input
                id="waitTime"
                type="number"
                min="5"
                value={editEstimatedWaitTime}
                onChange={(e) => setEditEstimatedWaitTime(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Any special requests or notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditQueue}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Table Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Assign Table</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <TableSelection
              gameType="pool"
              onTableSelect={setSelectedTableId}
              selectedTableId={selectedTableId}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleAssignTable}>
              Assign Table
            </Button>
            <Button onClick={handleMoveToReservation}>
              Assign & Create Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
