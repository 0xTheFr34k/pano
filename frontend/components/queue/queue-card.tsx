"use client"

import { useState } from "react"
import { useStore, type QueueEntry, type QueuePriority } from "@/store/use-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BombIcon as BilliardBall, Target, Gamepad2, User, Clock, Calendar, AlertCircle, CheckCircle2, Bell, ArrowUp, Trash2, Edit, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface QueueCardProps {
  queue: QueueEntry
  isAdmin?: boolean
  onPositionChange?: (id: string, newPosition: number) => void
}

export function QueueCard({ queue, isAdmin = false, onPositionChange }: QueueCardProps) {
  const { 
    updateQueuePriority, 
    notifyQueueEntry, 
    markQueueEntryAsProcessing, 
    completeQueueEntry, 
    cancelQueueEntry,
    updateQueueEntry,
    removeFromQueue,
  } = useStore()

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [newPriority, setNewPriority] = useState<QueuePriority>(queue.priority)
  const [newPosition, setNewPosition] = useState<number>(queue.position)
  const [newNotes, setNewNotes] = useState<string>(queue.notes || "")
  const [newEstimatedWaitTime, setNewEstimatedWaitTime] = useState<number>(queue.estimatedWaitTime || 30)

  // Get game type icon
  const getGameIcon = () => {
    switch (queue.gameType) {
      case "pool":
        return <BilliardBall className="h-5 w-5 text-blue-700" />
      case "snooker":
        return <Target className="h-5 w-5 text-blue-700" />
      case "ps5":
        return <Gamepad2 className="h-5 w-5 text-blue-700" />
      default:
        return null
    }
  }

  // Get status badge
  const getStatusBadge = () => {
    switch (queue.status) {
      case "waiting":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Waiting
          </Badge>
        )
      case "notified":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Notified
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Processing
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Cancelled
          </Badge>
        )
      default:
        return null
    }
  }

  // Get priority badge
  const getPriorityBadge = () => {
    switch (queue.priority) {
      case "normal":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Normal
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <ArrowUp className="h-3 w-3 mr-1" />
            High
          </Badge>
        )
      case "vip":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            VIP
          </Badge>
        )
      default:
        return null
    }
  }

  const handleUpdateQueue = () => {
    // Update priority if changed
    if (newPriority !== queue.priority) {
      updateQueuePriority(queue.id, newPriority)
    }

    // Update position if changed and callback provided
    if (newPosition !== queue.position && onPositionChange) {
      onPositionChange(queue.id, newPosition)
    }

    // Update other fields
    updateQueueEntry(queue.id, {
      notes: newNotes,
      estimatedWaitTime: newEstimatedWaitTime,
    })

    setShowEditDialog(false)
  }

  const handleDeleteQueue = () => {
    removeFromQueue(queue.id)
    setShowDeleteDialog(false)
  }

  const isActive = queue.status === "waiting" || queue.status === "notified"

  return (
    <>
      <Card className="overflow-hidden">
        <div className={`border-l-4 ${
          queue.priority === "vip" 
            ? "border-purple-500" 
            : queue.priority === "high" 
              ? "border-orange-500" 
              : "border-blue-500"
        }`}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                  {getGameIcon()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{queue.name}</h3>
                    {getStatusBadge()}
                    {getPriorityBadge()}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Position: {queue.position}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{format(new Date(queue.date), "MMM d")}</span>
                    </div>
                    {queue.preferredTimeSlot && (
                      <>
                        <span>•</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{queue.preferredTimeSlot.start} - {queue.preferredTimeSlot.end}</span>
                        </div>
                      </>
                    )}
                    <span>•</span>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{queue.playerCount} {queue.playerCount === 1 ? "Player" : "Players"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {isAdmin && (
                <div className="flex items-center gap-2">
                  {isActive && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {queue.status === "waiting" && (
                          <DropdownMenuItem onClick={() => notifyQueueEntry(queue.id)}>
                            <Bell className="h-4 w-4 mr-2" />
                            Notify
                          </DropdownMenuItem>
                        )}
                        {(queue.status === "waiting" || queue.status === "notified") && (
                          <DropdownMenuItem onClick={() => markQueueEntryAsProcessing(queue.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Process
                          </DropdownMenuItem>
                        )}
                        {queue.status === "processing" && (
                          <DropdownMenuItem onClick={() => completeQueueEntry(queue.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Queue Entry</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={newPriority} onValueChange={(value) => setNewPriority(value as QueuePriority)}>
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
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                type="number"
                min={1}
                value={newPosition}
                onChange={(e) => setNewPosition(parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wait-time">Estimated Wait Time (minutes)</Label>
              <Input
                id="wait-time"
                type="number"
                min={0}
                value={newEstimatedWaitTime}
                onChange={(e) => setNewEstimatedWaitTime(parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Add notes about this queue entry"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateQueue}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove from Queue</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {queue.name} from the queue? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteQueue}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
