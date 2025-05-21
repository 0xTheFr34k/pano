"use client"

import { useState } from "react"
import { useStore, type QueueEntry, type GameType, type QueueStatus } from "@/store/use-store"
import { QueueCard } from "@/components/queue/queue-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { BombIcon as BilliardBall, Target, Gamepad2, UserPlus, Clock } from "lucide-react"
import { format } from "date-fns"

interface QueueListProps {
  isAdmin?: boolean
}

export function QueueList({ isAdmin = false }: QueueListProps) {
  const { 
    queues, 
    getQueuesByGameType, 
    getQueuesByStatus,
    timeSlots,
    updateQueuePosition,
    addToQueue,
  } = useStore()
  
  const [activeGameTab, setActiveGameTab] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<QueueStatus | "all">("waiting")
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  // New guest form state
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [guestGameType, setGuestGameType] = useState<GameType>("pool")
  const [guestPlayerCount, setGuestPlayerCount] = useState(2)
  const [guestTimeSlotId, setGuestTimeSlotId] = useState("")
  const [guestPriority, setGuestPriority] = useState<"normal" | "high" | "vip">("normal")
  
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
  
  const handlePositionChange = (id: string, newPosition: number) => {
    updateQueuePosition(id, newPosition)
  }
  
  const handleAddGuest = () => {
    if (!guestName || !guestPhone || !guestGameType) {
      return
    }
    
    const today = new Date().toISOString().split("T")[0]
    const preferredTimeSlot = guestTimeSlotId 
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
    }
    
    addToQueue(queueEntry)
    
    // Reset form
    setGuestName("")
    setGuestEmail("")
    setGuestPhone("")
    setGuestGameType("pool")
    setGuestPlayerCount(2)
    setGuestTimeSlotId("")
    setGuestPriority("normal")
    
    setShowAddDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Queue Management</h2>
        
        {isAdmin && (
          <div className="flex items-center gap-2">
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
            
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Guest
            </Button>
          </div>
        )}
      </div>
      
      <Tabs value={activeGameTab} onValueChange={setActiveGameTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pool" className="flex items-center gap-1">
            <BilliardBall className="h-4 w-4" />
            <span>Pool</span>
          </TabsTrigger>
          <TabsTrigger value="snooker" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>Snooker</span>
          </TabsTrigger>
          <TabsTrigger value="ps5" className="flex items-center gap-1">
            <Gamepad2 className="h-4 w-4" />
            <span>PS5</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeGameTab}>
          <div className="space-y-4">
            {filteredQueues().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No queue entries found.</p>
              </div>
            ) : (
              filteredQueues().map((queue) => (
                <QueueCard 
                  key={queue.id} 
                  queue={queue} 
                  isAdmin={isAdmin}
                  onPositionChange={handlePositionChange}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add Guest Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Guest to Queue</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="guest-name">Guest Name</Label>
              <Input
                id="guest-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter guest name"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guest-email">Email (Optional)</Label>
                <Input
                  id="guest-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="guest@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guest-phone">Phone Number</Label>
                <Input
                  id="guest-phone"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+212 XXXXXXXXX"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guest-game-type">Game Type</Label>
                <Select value={guestGameType} onValueChange={(value) => setGuestGameType(value as GameType)}>
                  <SelectTrigger id="guest-game-type">
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
                <Label htmlFor="guest-player-count">Number of Players</Label>
                <Select 
                  value={guestPlayerCount.toString()} 
                  onValueChange={(value) => setGuestPlayerCount(parseInt(value))}
                >
                  <SelectTrigger id="guest-player-count">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guest-time-slot">Preferred Time (Optional)</Label>
                <Select value={guestTimeSlotId} onValueChange={setGuestTimeSlotId}>
                  <SelectTrigger id="guest-time-slot">
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No preference</SelectItem>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.start} - {slot.end}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guest-priority">Priority</Label>
                <Select 
                  value={guestPriority} 
                  onValueChange={(value) => setGuestPriority(value as "normal" | "high" | "vip")}
                >
                  <SelectTrigger id="guest-priority">
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGuest}>
              Add to Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
