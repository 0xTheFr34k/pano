"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/store/use-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, CheckCircle, Users } from "lucide-react"

interface TableSpecificTimeSlotSelectorProps {
  tableId: string
  date: string
}

export default function TableSpecificTimeSlotSelector({ 
  tableId, 
  date 
}: TableSpecificTimeSlotSelectorProps) {
  const { 
    timeSlots, 
    reservations, 
    selectedTimeSlot, 
    setSelectedTimeSlot,
    stations 
  } = useStore()
  
  const [availableSlots, setAvailableSlots] = useState<any[]>([])

  // Get the selected table info
  const selectedTable = stations.find(s => s.id === tableId)

  // Calculate available time slots for the specific table
  useEffect(() => {
    const available = timeSlots.filter(slot => {
      // Check if this time slot is available for this specific table
      const hasReservation = reservations.some(reservation => 
        reservation.stationId === tableId &&
        reservation.date === date &&
        reservation.timeSlot.id === slot.id &&
        reservation.status === "confirmed"
      )
      return !hasReservation
    })
    
    setAvailableSlots(available)
  }, [tableId, date, timeSlots, reservations])

  // Get reservations for this table on this date to show occupancy info
  const getSlotInfo = (slotId: string) => {
    const reservation = reservations.find(r => 
      r.stationId === tableId &&
      r.date === date &&
      r.timeSlot.id === slotId &&
      r.status === "confirmed"
    )
    
    if (reservation) {
      return {
        status: "occupied",
        info: `Reserved by ${reservation.name}`,
        playerCount: reservation.playerCount
      }
    }
    
    return {
      status: "available",
      info: "Available",
      playerCount: 0
    }
  }

  const handleTimeSlotSelect = (slot: any) => {
    if (selectedTimeSlot?.id === slot.id) {
      setSelectedTimeSlot(null) // Deselect if clicking the same slot
    } else {
      setSelectedTimeSlot(slot)
    }
  }

  if (!selectedTable) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Table not found</p>
      </div>
    )
  }

  if (availableSlots.length === 0) {
    return (
      <Card className="border-orange-200">
        <CardContent className="p-6 text-center">
          <Clock className="h-8 w-8 mx-auto mb-3 text-orange-500" />
          <h3 className="font-medium text-orange-900 mb-2">
            {selectedTable.name} is Fully Booked
          </h3>
          <p className="text-sm text-orange-700 mb-4">
            All time slots for this table are reserved on {new Date(date).toLocaleDateString()}
          </p>
          <div className="space-y-2">
            <p className="text-xs text-gray-600">You can:</p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Choose Different Table
              </Button>
              <Button variant="outline" size="sm">
                Join Queue for This Table
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table Info Header */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-900">
            Available Times for {selectedTable.name}
          </span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          {availableSlots.length} time slots available on {new Date(date).toLocaleDateString()}
        </p>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {availableSlots.map((slot) => {
          const isSelected = selectedTimeSlot?.id === slot.id
          const slotInfo = getSlotInfo(slot.id)
          
          return (
            <Button
              key={slot.id}
              variant={isSelected ? "default" : "outline"}
              className={`h-auto p-3 flex flex-col items-center gap-2 ${
                isSelected 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "hover:bg-blue-50 hover:border-blue-300"
              }`}
              onClick={() => handleTimeSlotSelect(slot)}
            >
              <div className="flex items-center gap-2">
                {isSelected && <CheckCircle className="h-4 w-4" />}
                <span className="font-medium">{slot.start}</span>
              </div>
              <span className="text-xs opacity-75">to {slot.end}</span>
              
              {isSelected && (
                <Badge variant="secondary" className="text-xs mt-1">
                  Selected
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      {/* All Time Slots Overview (for context) */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Full Day Schedule for {selectedTable.name}
        </h4>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {timeSlots.map((slot) => {
            const slotInfo = getSlotInfo(slot.id)
            const isAvailable = slotInfo.status === "available"
            const isSelected = selectedTimeSlot?.id === slot.id
            
            return (
              <div
                key={slot.id}
                className={`p-2 rounded text-center text-xs border ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : isAvailable
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="font-medium">{slot.start}</div>
                {!isAvailable && slotInfo.playerCount > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Users className="h-3 w-3" />
                    <span>{slotInfo.playerCount}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedTimeSlot && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">
              Time Slot Selected: {selectedTimeSlot.start} - {selectedTimeSlot.end}
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {selectedTable.name} is reserved for your match
          </p>
        </div>
      )}
    </div>
  )
}
