"use client"

import { useState } from "react"
import { useStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { EightBallIcon } from "@/components/icons/eight-ball-icon"
import { MapPin, Users, Zap, Star } from "lucide-react"

interface TablePreferenceSelectorProps {
  gameType: "pool" | "snooker" | "ps5"
  date: string
  timeSlotId: string
  onTableSelect?: (tableId: string | null) => void
  selectedTableId?: string | null
}

export default function TablePreferenceSelector({ 
  gameType, 
  date, 
  timeSlotId, 
  onTableSelect,
  selectedTableId 
}: TablePreferenceSelectorProps) {
  const { getAvailableStations } = useStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const availableStations = getAvailableStations(gameType, date, timeSlotId)

  if (availableStations.length <= 1) {
    return null // Don't show selector if only one or no tables available
  }

  const getTableFeatures = (stationId: string) => {
    // Mock table features - in a real app, this would come from the station data
    const features = {
      "pool-1": { location: "Main Floor", lighting: "Premium", condition: "Excellent", popular: true },
      "pool-2": { location: "Main Floor", lighting: "Standard", condition: "Good", popular: false },
      "pool-3": { location: "VIP Area", lighting: "Premium", condition: "Excellent", popular: true },
      "pool-4": { location: "Side Room", lighting: "Standard", condition: "Good", popular: false },
      "pool-5": { location: "Main Floor", lighting: "Premium", condition: "Very Good", popular: true },
      "pool-6": { location: "VIP Area", lighting: "Premium", condition: "Excellent", popular: false },
    }
    return features[stationId as keyof typeof features] || { 
      location: "Main Floor", 
      lighting: "Standard", 
      condition: "Good", 
      popular: false 
    }
  }

  const handleTableSelection = (tableId: string) => {
    const newSelection = selectedTableId === tableId ? null : tableId
    onTableSelect?.(newSelection)
  }

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <EightBallIcon className="h-4 w-4" />
            Table Preference (Optional)
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showAdvanced ? "Simple View" : "Advanced"}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          {selectedTableId ? "Specific table selected" : "Auto-assign best available table"}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {!showAdvanced ? (
          // Simple View
          <div className="space-y-2">
            <Button
              variant={selectedTableId ? "outline" : "default"}
              size="sm"
              onClick={() => onTableSelect?.(null)}
              className="w-full justify-start"
            >
              <Zap className="h-4 w-4 mr-2" />
              Auto-assign best table (Recommended)
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              {availableStations.slice(0, 4).map((station) => {
                const features = getTableFeatures(station.id)
                return (
                  <Button
                    key={station.id}
                    variant={selectedTableId === station.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTableSelection(station.id)}
                    className="justify-start text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">{station.name}</div>
                        {features.popular && (
                          <div className="text-xs text-orange-600">Popular</div>
                        )}
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        ) : (
          // Advanced View
          <RadioGroup 
            value={selectedTableId || "auto"} 
            onValueChange={(value) => onTableSelect?.(value === "auto" ? null : value)}
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="auto" id="auto" />
              <Label htmlFor="auto" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Auto-assign (Recommended)</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  We'll pick the best available table based on your preferences
                </p>
              </Label>
            </div>

            {availableStations.map((station) => {
              const features = getTableFeatures(station.id)
              return (
                <div key={station.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value={station.id} id={station.id} />
                  <Label htmlFor={station.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">{station.name}</span>
                        {features.popular && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {features.location}
                      </div>
                      <div>Lighting: {features.lighting}</div>
                      <div>Condition: {features.condition}</div>
                    </div>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        )}

        {availableStations.length > 4 && !showAdvanced && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(true)}
            className="w-full text-blue-600 hover:text-blue-800"
          >
            View all {availableStations.length} available tables
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
