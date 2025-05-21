"use client"

import { useState, useEffect } from "react"
import { useStore, type Station } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BombIcon as BilliardBall, Target, Gamepad2 } from "lucide-react"

interface TableSelectionProps {
  onTableSelect?: (tableId: string) => void
  selectedTableId?: string
  gameType?: "pool" | "all"
  date?: string
  timeSlotId?: string
}

export default function TableSelection({
  onTableSelect,
  selectedTableId,
  gameType = "pool",
  date,
  timeSlotId,
}: TableSelectionProps) {
  const { stations, getAvailableStations } = useStore()
  const [availableTables, setAvailableTables] = useState<Station[]>([])
  const [selectedTable, setSelectedTable] = useState<string | undefined>(selectedTableId)

  // Update available tables when date, timeSlot, or gameType changes
  useEffect(() => {
    // Filter stations to only show pool tables or all tables based on gameType
    const filtered = stations.filter((station) => {
      if (gameType === "all") return true
      return station.type === gameType
    })

    if (date && timeSlotId && gameType !== "all") {
      const available = getAvailableStations(gameType, date, timeSlotId)
      setAvailableTables(available)
    } else {
      setAvailableTables(filtered)
    }
  }, [date, timeSlotId, gameType, stations, getAvailableStations])

  // Handle table selection
  const handleTableSelect = (tableId: string) => {
    setSelectedTable(tableId)
    if (onTableSelect) {
      onTableSelect(tableId)
    }
  }

  // Get status badge color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "reserved":
        return "bg-amber-500"
      case "occupied":
        return "bg-red-500"
      case "maintenance":
        return "bg-gray-500"
      default:
        return "bg-green-500"
    }
  }

  // Get status badge text
  const getStatusText = (status?: string) => {
    switch (status) {
      case "available":
        return "Available"
      case "reserved":
        return "Reserved"
      case "occupied":
        return "Occupied"
      case "maintenance":
        return "Maintenance"
      default:
        return "Available"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BilliardBall className="h-5 w-5 mr-2" />
          Pool Table Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[300px] border rounded-md p-4 bg-gray-50">
          {/* Table layout visualization */}
          {stations.filter(station => gameType === "all" || station.type === gameType).map((table) => {
            const isAvailable = availableTables.some((t) => t.id === table.id)
            const isSelected = selectedTable === table.id

            return (
              <div
                key={table.id}
                className={`absolute p-2 rounded-md border-2 transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-100"
                    : isAvailable
                    ? "border-green-500 bg-white hover:bg-green-50 cursor-pointer"
                    : "border-gray-300 bg-gray-100 opacity-70"
                }`}
                style={{
                  left: `${table.coordinates?.x || 0}px`,
                  top: `${table.coordinates?.y || 0}px`,
                  width: table.size === "large" ? "120px" : "100px",
                  height: table.size === "large" ? "70px" : "50px",
                }}
                onClick={() => {
                  if (isAvailable || gameType === "all") {
                    handleTableSelect(table.id)
                  }
                }}
              >
                <div className="text-xs font-medium">{table.name}</div>
                <Badge className={`text-xs ${getStatusColor(table.status)}`}>
                  {getStatusText(table.status)}
                </Badge>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Badge className="bg-green-500">Available</Badge>
            <Badge className="bg-amber-500">Reserved</Badge>
            <Badge className="bg-red-500">Occupied</Badge>
            <Badge className="bg-gray-500">Maintenance</Badge>
          </div>

          {selectedTable && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedTable(undefined)
                if (onTableSelect) {
                  onTableSelect("")
                }
              }}
            >
              Clear Selection
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
