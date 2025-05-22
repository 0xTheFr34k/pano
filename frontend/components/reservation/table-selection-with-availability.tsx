"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EightBallIcon } from "@/components/icons/eight-ball-icon"
import { MapPin, Users, Clock, Star, CheckCircle } from "lucide-react"

interface TableSelectionWithAvailabilityProps {
  gameType: "pool" | "snooker" | "ps5"
  date: string
  selectedTableId?: string | null
  onTableSelect?: (tableId: string | null) => void
  onTimeSlotChange?: (timeSlot: any) => void
}

export default function TableSelectionWithAvailability({ 
  gameType, 
  date, 
  selectedTableId,
  onTableSelect,
  onTimeSlotChange
}: TableSelectionWithAvailabilityProps) {
  const { stations, reservations, timeSlots } = useStore()
  const [tableAvailability, setTableAvailability] = useState<Record<string, any[]>>({})
  
  // Get all tables of the specified type
  const allTables = stations.filter(s => s.type === gameType)

  // Calculate availability for each table
  useEffect(() => {
    const availability: Record<string, any[]> = {}
    
    allTables.forEach(table => {
      const availableSlots = timeSlots.filter(slot => {
        // Check if this time slot is available for this specific table
        const hasReservation = reservations.some(reservation => 
          reservation.stationId === table.id &&
          reservation.date === date &&
          reservation.timeSlot.id === slot.id &&
          reservation.status === "confirmed"
        )
        return !hasReservation
      })
      availability[table.id] = availableSlots
    })
    
    setTableAvailability(availability)
  }, [allTables, date, reservations, timeSlots])

  const getTableFeatures = (tableId: string) => {
    // Mock table features - in a real app, this would come from the station data
    const features = {
      "pool-1": { location: "Main Floor", lighting: "Premium", condition: "Excellent", popular: true },
      "pool-2": { location: "Main Floor", lighting: "Standard", condition: "Good", popular: false },
      "pool-3": { location: "VIP Area", lighting: "Premium", condition: "Excellent", popular: true },
      "pool-4": { location: "Side Room", lighting: "Standard", condition: "Good", popular: false },
      "pool-5": { location: "Main Floor", lighting: "Premium", condition: "Very Good", popular: true },
      "pool-6": { location: "VIP Area", lighting: "Premium", condition: "Excellent", popular: false },
    }
    return features[tableId as keyof typeof features] || { 
      location: "Main Floor", 
      lighting: "Standard", 
      condition: "Good", 
      popular: false 
    }
  }

  const handleTableSelect = (tableId: string) => {
    const newSelection = selectedTableId === tableId ? null : tableId
    onTableSelect?.(newSelection)
  }

  const getAvailabilityStatus = (tableId: string) => {
    const availableSlots = tableAvailability[tableId] || []
    if (availableSlots.length === 0) return { status: "unavailable", text: "Fully Booked", color: "bg-red-100 text-red-800" }
    if (availableSlots.length <= 2) return { status: "limited", text: `${availableSlots.length} slots left`, color: "bg-orange-100 text-orange-800" }
    return { status: "available", text: `${availableSlots.length} slots available`, color: "bg-green-100 text-green-800" }
  }

  if (allTables.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tables available for this game type.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allTables.map((table) => {
          const features = getTableFeatures(table.id)
          const availability = getAvailabilityStatus(table.id)
          const isSelected = selectedTableId === table.id
          const isAvailable = availability.status !== "unavailable"

          return (
            <Card 
              key={table.id} 
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50" 
                  : isAvailable 
                    ? "hover:shadow-md border-gray-200" 
                    : "opacity-60 cursor-not-allowed"
              }`}
              onClick={() => isAvailable && handleTableSelect(table.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <EightBallIcon className="h-4 w-4" />
                    {table.name}
                    {isSelected && <CheckCircle className="h-4 w-4 text-blue-600" />}
                  </CardTitle>
                  {features.popular && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Availability Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Availability</span>
                  <Badge className={availability.color}>
                    {availability.text}
                  </Badge>
                </div>

                {/* Table Features */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{features.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lighting: {features.lighting}</span>
                    <span>Condition: {features.condition}</span>
                  </div>
                </div>

                {/* Available Time Slots Preview */}
                {isAvailable && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs font-medium">Available Times</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(tableAvailability[table.id] || []).slice(0, 4).map((slot) => (
                        <Badge key={slot.id} variant="outline" className="text-xs">
                          {slot.start}
                        </Badge>
                      ))}
                      {(tableAvailability[table.id] || []).length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{(tableAvailability[table.id] || []).length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Selection Button */}
                {isAvailable && (
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTableSelect(table.id)
                    }}
                  >
                    {isSelected ? "Selected" : "Select This Table"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selection Summary */}
      {selectedTableId && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {allTables.find(t => t.id === selectedTableId)?.name} Selected
            </span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            {(tableAvailability[selectedTableId] || []).length} time slots available for this table
          </p>
        </div>
      )}
    </div>
  )
}
