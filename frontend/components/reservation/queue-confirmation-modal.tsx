"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/store/use-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Users, MapPin, Bell } from "lucide-react"
import { EightBallIcon } from "@/components/icons/eight-ball-icon"

interface QueueConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  queueEntry?: any
}

export default function QueueConfirmationModal({ 
  isOpen, 
  onClose, 
  queueEntry 
}: QueueConfirmationModalProps) {
  const { getEstimatedWaitTimeForGameType } = useStore()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      handleGoToQueue()
    }
  }, [isOpen, countdown])

  const handleGoToQueue = () => {
    onClose()
    window.location.href = '/queue'
  }

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case "pool": return <EightBallIcon className="h-8 w-8 text-blue-600" />
      case "snooker": return <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">S</div>
      case "ps5": return <Users className="h-8 w-8 text-purple-600" />
      default: return <Users className="h-8 w-8 text-gray-600" />
    }
  }

  if (!queueEntry) return null

  const estimatedWait = getEstimatedWaitTimeForGameType(queueEntry.gameType)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Successfully Added to Queue!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Queue Entry Summary */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              {getGameIcon(queueEntry.gameType)}
              <div>
                <h3 className="font-semibold text-green-900 capitalize">
                  {queueEntry.gameType} Queue
                </h3>
                <p className="text-sm text-green-700">
                  Position #{queueEntry.position || 1} in line
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600">Date:</span>
                <div className="font-medium">{new Date(queueEntry.date).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-green-600">Players:</span>
                <div className="font-medium">{queueEntry.playerCount}</div>
              </div>
              <div>
                <span className="text-green-600">Est. Wait:</span>
                <div className="font-medium">{estimatedWait} minutes</div>
              </div>
              <div>
                <span className="text-green-600">Priority:</span>
                <div className="font-medium capitalize">{queueEntry.priority}</div>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              What happens next:
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span>We'll pair you with another player when one becomes available</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span>You'll receive a notification when a table is ready</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span>Check your position anytime on the queue page</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span>You can cancel your queue entry if plans change</span>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Notifications</span>
            </div>
            <p className="text-sm text-blue-700">
              We'll send updates to <strong>{queueEntry.email}</strong> and 
              call <strong>{queueEntry.phone}</strong> when it's your turn.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleGoToQueue}
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              View Queue Status
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Continue Browsing
            </Button>
          </div>

          {/* Auto-redirect countdown */}
          <div className="text-center text-sm text-gray-500">
            Redirecting to queue page in {countdown} seconds...
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
