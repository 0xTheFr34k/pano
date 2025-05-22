"use client"

import { useState } from "react"
import { useStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Users, Clock, Trophy, AlertCircle, CheckCircle } from "lucide-react"
import QueueConfirmationModal from "@/components/reservation/queue-confirmation-modal"

interface PlayerCountFlowProps {
  gameType: "pool" | "snooker" | "ps5"
  onFlowComplete?: (shouldProceedToBooking: boolean) => void
}

export default function PlayerCountFlow({ gameType, onFlowComplete }: PlayerCountFlowProps) {
  const {
    playerCount,
    setPlayerCount,
    snookerMatchCount,
    setSnookerMatchCount,
    setShouldJoinQueue,
    currentUser,
    name,
    email,
    phone,
    selectedDate,
    addToQueue,
    addGuestToQueue
  } = useStore()

  const [showMatchCountSelector, setShowMatchCountSelector] = useState(false)
  const [showQueueConfirmation, setShowQueueConfirmation] = useState(false)
  const [queueEntry, setQueueEntry] = useState<any>(null)

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count)

    if (gameType === "pool") {
      if (count === 1) {
        // Single player for pool - join queue
        setShouldJoinQueue(true)
        handleJoinQueue()
      } else {
        // Multiple players for pool - proceed to booking
        setShouldJoinQueue(false)
        onFlowComplete?.(true) // Proceed to booking
      }
    } else if (gameType === "snooker") {
      if (count === 1) {
        // Single player for snooker - join queue
        setShouldJoinQueue(true)
        handleJoinQueue()
      } else {
        // Multiple players for snooker - show match count selector
        setShouldJoinQueue(false)
        setShowMatchCountSelector(true)
      }
    } else {
      // PS5 - always proceed to booking regardless of player count
      setShouldJoinQueue(false)
      onFlowComplete?.(true)
    }
  }

  const handleJoinQueue = () => {
    const newQueueEntry = {
      gameType,
      playerCount: 1,
      date: selectedDate || new Date().toISOString().split("T")[0],
      name: currentUser?.name || name || "Guest Player",
      email: currentUser?.email || email || "",
      phone: currentUser?.phone || phone || "",
      priority: "normal" as const,
      notes: `Single player looking for ${gameType} match`,
      userId: currentUser?.id,
      requiresAccount: !currentUser
    }

    let queueId: string
    if (currentUser) {
      queueId = addToQueue(newQueueEntry)
    } else {
      queueId = addGuestToQueue(newQueueEntry)
    }

    // Set the queue entry with the generated ID for the modal
    setQueueEntry({ ...newQueueEntry, id: queueId })
    setShowQueueConfirmation(true)
  }

  const handleMatchCountSelection = () => {
    setShowMatchCountSelector(false)
    onFlowComplete?.(true) // Proceed to booking
  }

  const getPlayerCountOptions = () => {
    switch (gameType) {
      case "pool":
        return [
          { value: 1, label: "1 Player", description: "Join queue to be paired with another player" },
          { value: 2, label: "2 Players", description: "Book a table for your match" }
        ]
      case "snooker":
        return [
          { value: 1, label: "1 Player", description: "Join queue to be paired with another player" },
          { value: 2, label: "2 Players", description: "Book a table for your match" }
        ]
      case "ps5":
        return [
          { value: 1, label: "1 Player", description: "Solo gaming session" },
          { value: 2, label: "2 Players", description: "Co-op or versus gaming" },
          { value: 3, label: "3 Players", description: "Group gaming session" },
          { value: 4, label: "4 Players", description: "Full party gaming" }
        ]
      default:
        return []
    }
  }

  const playerOptions = getPlayerCountOptions()

  if (showMatchCountSelector && gameType === "snooker") {
    return (
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            How Many Matches?
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose how many matches you want to play in your session
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="match-count">Number of Matches</Label>
            <Select
              value={snookerMatchCount.toString()}
              onValueChange={(value) => setSnookerMatchCount(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of matches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Match (~30 minutes)</SelectItem>
                <SelectItem value="2">2 Matches (~60 minutes)</SelectItem>
                <SelectItem value="3">3 Matches (~90 minutes)</SelectItem>
                <SelectItem value="5">5 Matches (~2.5 hours)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Estimated Duration</span>
            </div>
            <p className="text-sm text-blue-700">
              {snookerMatchCount} match{snookerMatchCount > 1 ? 'es' : ''} = ~{snookerMatchCount * 30} minutes
            </p>
          </div>

          <Button onClick={handleMatchCountSelection} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Continue to Table Selection
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Number of Players
        </CardTitle>
        <p className="text-sm text-gray-600">
          How many players will be participating?
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {playerOptions.map((option) => {
            const isSelected = playerCount === option.value
            const isQueueOption = option.value === 1 && (gameType === "pool" || gameType === "snooker")

            return (
              <div
                key={option.value}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-25"
                }`}
                onClick={() => handlePlayerCountChange(option.value)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                    </div>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </div>

                  {isQueueOption && (
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      Queue
                    </Badge>
                  )}

                  {isSelected && !isQueueOption && (
                    <Badge className="bg-blue-600">
                      Book Table
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Information based on selection */}
        {playerCount === 1 && (gameType === "pool" || gameType === "snooker") && (
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900 mb-1">Queue System</h4>
                <p className="text-sm text-orange-800 mb-2">
                  Since you're playing alone, you'll be added to the queue and paired with another player when available.
                </p>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• You'll be notified when a match is ready</li>
                  <li>• Estimated wait time will be provided</li>
                  <li>• Fair pairing based on skill level</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {playerCount > 1 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Table Booking</h4>
                <p className="text-sm text-green-800">
                  Perfect! You can proceed to select your preferred table and time slot.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Continue button for non-queue scenarios */}
        {playerCount > 1 && (
          <Button
            onClick={() => onFlowComplete?.(true)}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Continue to {gameType === "snooker" && playerCount > 1 ? "Match Setup" : "Table Selection"}
          </Button>
        )}

        {/* Queue button for single player scenarios */}
        {playerCount === 1 && (gameType === "pool" || gameType === "snooker") && (
          <div className="space-y-3">
            <Button
              onClick={handleJoinQueue}
              variant="outline"
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Users className="h-4 w-4 mr-2" />
              Join {gameType.charAt(0).toUpperCase() + gameType.slice(1)} Queue
            </Button>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>What happens next:</strong>
              </p>
              <ul className="text-sm text-orange-700 mt-1 space-y-1">
                <li>• You'll be added to the queue</li>
                <li>• We'll pair you with another player</li>
                <li>• You'll be notified when a table is ready</li>
                <li>• You can track your position on the queue page</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Queue Confirmation Modal */}
    <QueueConfirmationModal
      isOpen={showQueueConfirmation}
      onClose={() => setShowQueueConfirmation(false)}
      queueEntry={queueEntry}
    />
  </>
  )
}
