"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore, type TimeSlot } from "@/store/use-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"

export default function JoinQueueModal() {
  const router = useRouter()
  const {
    showQueueJoinModal,
    setShowQueueJoinModal,
    selectedGameType,
    selectedDate,
    selectedTimeSlot,
    playerCount,
    name,
    email,
    phone,
    currentUser,
    timeSlots,
    addToQueue,
  } = useStore()

  const [preferredTimeSlot, setPreferredTimeSlot] = useState<TimeSlot | null>(selectedTimeSlot)
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number>(30)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoinQueue = () => {
    if (!selectedGameType || !selectedDate) {
      setError("Missing required information. Please try again.")
      return
    }

    setError(null)

    const queueEntry = {
      name: currentUser?.name || name,
      email: currentUser?.email || email,
      phone: currentUser?.phone || phone,
      userId: currentUser?.id,
      gameType: selectedGameType,
      playerCount,
      date: selectedDate,
      preferredTimeSlot,
      estimatedWaitTime,
      priority: "normal" as const,
    }

    const queueId = addToQueue(queueEntry)

    if (queueId) {
      setSuccess(true)

      // Redirect to home after success
      setTimeout(() => {
        setShowQueueJoinModal(false)
        setSuccess(false)
        router.push("/")
      }, 2000)
    } else {
      setError("Failed to join queue. Please try again.")
    }
  }

  const handleClose = () => {
    setShowQueueJoinModal(false)
    setSuccess(false)
    setError(null)
  }

  return (
    <Dialog open={showQueueJoinModal} onOpenChange={setShowQueueJoinModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Join Waiting Queue</DialogTitle>
          <DialogDescription>
            All {selectedGameType} tables are currently booked for your selected time. Join our waiting queue and we'll notify you when a table becomes available.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              You have been added to the queue! We'll notify you when a table becomes available.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="queue-date">Date</Label>
            <Input
              id="queue-date"
              value={selectedDate ? format(new Date(selectedDate), "MMMM d, yyyy") : ""}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="queue-game-type">Game Type</Label>
            <Input
              id="queue-game-type"
              value={selectedGameType ? selectedGameType.charAt(0).toUpperCase() + selectedGameType.slice(1) : ""}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred-time">Preferred Time Slot (Optional)</Label>
            <Select
              value={preferredTimeSlot?.id || "none"}
              onValueChange={(value) => {
                if (value === "none") {
                  setPreferredTimeSlot(null)
                } else {
                  const timeSlot = timeSlots.find((slot) => slot.id === value)
                  setPreferredTimeSlot(timeSlot || null)
                }
              }}
            >
              <SelectTrigger id="preferred-time">
                <SelectValue placeholder="Select preferred time" />
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
            <p className="text-xs text-gray-500">
              If you have a preferred time slot, we'll try to accommodate it when a table becomes available.
            </p>
          </div>

          {!currentUser && (
            <>
              <div className="space-y-2">
                <Label htmlFor="queue-name">Your Name</Label>
                <Input
                  id="queue-name"
                  value={name}
                  onChange={(e) => useStore.setState({ name: e.target.value })}
                  placeholder="Enter your name"
                  disabled={success}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="queue-email">Email Address</Label>
                  <Input
                    id="queue-email"
                    type="email"
                    value={email}
                    onChange={(e) => useStore.setState({ email: e.target.value })}
                    placeholder="your.email@example.com"
                    disabled={success}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="queue-phone">Phone Number</Label>
                  <Input
                    id="queue-phone"
                    value={phone}
                    onChange={(e) => useStore.setState({ phone: e.target.value })}
                    placeholder="+212 XXXXXXXXX"
                    disabled={success}
                  />
                </div>
              </div>
            </>
          )}

          {currentUser && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Your Information</h3>
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-sm text-gray-600">{currentUser.email}</p>
              <p className="text-sm text-gray-600">{currentUser.phone}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={success}>
            Cancel
          </Button>
          <Button onClick={handleJoinQueue} disabled={success} className="bg-blue-900 hover:bg-blue-800">
            Join Queue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
