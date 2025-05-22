"use client"

import { useStore } from "@/store/use-store"
import { Badge } from "@/components/ui/badge"
import { EightBallIcon } from "@/components/icons/eight-ball-icon"
import { SnookerIcon } from "@/components/icons/snooker-icon"
import { Gamepad2, Users, Clock } from "lucide-react"

interface TableAvailabilityInfoProps {
  gameType: "pool" | "snooker" | "ps5"
  date: string
  timeSlotId: string
}

export default function TableAvailabilityInfo({ gameType, date, timeSlotId }: TableAvailabilityInfoProps) {
  const { getAvailableStations, stations, shouldShowQueueOption, getEstimatedWaitTimeForGameType } = useStore()
  
  const availableStations = getAvailableStations(gameType, date, timeSlotId)
  const allStationsOfType = stations.filter(s => s.type === gameType)
  const showQueueOption = shouldShowQueueOption(gameType, date, timeSlotId)
  const estimatedWaitTime = getEstimatedWaitTimeForGameType(gameType)

  const getGameIcon = () => {
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

  const getGameDisplayName = () => {
    switch (gameType) {
      case "pool":
        return "Pool Tables"
      case "snooker":
        return "Snooker Tables"
      case "ps5":
        return "PS5 Stations"
      default:
        return "Tables"
    }
  }

  if (availableStations.length === 0 && !showQueueOption) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No availability information available</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Available Tables */}
      {availableStations.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getGameIcon()}
            <span className="font-medium">
              {availableStations.length} of {allStationsOfType.length} {getGameDisplayName()} Available
            </span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Instant Booking
          </Badge>
        </div>
      )}

      {/* Table Details */}
      {availableStations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableStations.slice(0, 6).map((station) => (
            <div key={station.id} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">{station.name}</span>
            </div>
          ))}
          {availableStations.length > 6 && (
            <div className="text-sm text-gray-500">
              +{availableStations.length - 6} more
            </div>
          )}
        </div>
      )}

      {/* Queue Information */}
      {showQueueOption && (
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800">All Tables Occupied</span>
            </div>
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              Queue Available
            </Badge>
          </div>
          
          {estimatedWaitTime > 0 && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Estimated wait time: {estimatedWaitTime} minutes</span>
            </div>
          )}
          
          <p className="text-sm text-gray-600 mt-2">
            You'll be automatically assigned to the next available table.
          </p>
        </div>
      )}

      {/* Smart Assignment Note */}
      {availableStations.length > 1 && (
        <div className="text-xs text-gray-500 border-t pt-2">
          💡 We'll automatically assign you the best available table based on your preferences and current activity.
        </div>
      )}
    </div>
  )
}
