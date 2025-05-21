import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useStore, type GameType, type SkillLevel, type MatchType } from "@/store/use-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export function CreateMatchForm() {
  const router = useRouter()
  const {
    selectedGameType,
    selectedDate,
    selectedTimeSlot,
    skillLevel,
    matchType,
    isCompetitive,
    duration,
    timeSlots,
    setSelectedGameType,
    setSelectedDate,
    setSkillLevel,
    setMatchType,
    setIsCompetitive,
    setDuration,
    setSelectedTimeSlot,
    createMatch,
  } = useStore()

  const [date, setDate] = useState<Date | undefined>(selectedDate ? new Date(selectedDate) : undefined)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Update the selected date when the date changes
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      setSelectedDate(format(newDate, "yyyy-MM-dd"))
    } else {
      setSelectedDate(null)
    }
  }

  const handleCreateMatch = () => {
    setError(null)
    setSuccess(null)

    // Validate form
    if (!selectedGameType) {
      setError("Please select a game type")
      return
    }

    if (!selectedDate) {
      setError("Please select a date")
      return
    }

    if (!selectedTimeSlot) {
      setError("Please select a time slot")
      return
    }

    // Create the match
    const matchId = createMatch()

    if (matchId) {
      setSuccess("Match created successfully!")
      
      // Navigate to the match page
      setTimeout(() => {
        router.push(`/match/${matchId}`)
      }, 1500)
    } else {
      setError("Failed to create match. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {/* Game Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="gameType">Game Type</Label>
        <Select
          value={selectedGameType || ""}
          onValueChange={(value) => setSelectedGameType(value as GameType)}
        >
          <SelectTrigger id="gameType">
            <SelectValue placeholder="Select game type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pool">Pool (8-ball)</SelectItem>
            <SelectItem value="snooker">Snooker</SelectItem>
            <SelectItem value="ps5">PS5</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Selection */}
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              initialFocus
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Slot Selection */}
      <div className="space-y-2">
        <Label htmlFor="timeSlot">Time Slot</Label>
        <Select
          value={selectedTimeSlot?.id || ""}
          onValueChange={(value) => {
            const timeSlot = timeSlots.find((slot) => slot.id === value)
            setSelectedTimeSlot(timeSlot || null)
          }}
        >
          <SelectTrigger id="timeSlot">
            <SelectValue placeholder="Select time slot" />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((slot) => (
              <SelectItem key={slot.id} value={slot.id}>
                {slot.start} - {slot.end}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Skill Level */}
      <div className="space-y-2">
        <Label htmlFor="skillLevel">Skill Level</Label>
        <Select
          value={skillLevel}
          onValueChange={(value) => setSkillLevel(value as SkillLevel)}
        >
          <SelectTrigger id="skillLevel">
            <SelectValue placeholder="Select skill level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="competitive">Competitive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Game-specific options */}
      {selectedGameType === "pool" && (
        <>
          {/* Match Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="matchType">Match Type</Label>
            <Select value={matchType} onValueChange={(value) => setMatchType(value as MatchType)}>
              <SelectTrigger id="matchType">
                <SelectValue placeholder="Select match type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first-to-3">First to 3 wins</SelectItem>
                <SelectItem value="first-to-5">First to 5 wins</SelectItem>
                <SelectItem value="first-to-7">First to 7 wins</SelectItem>
                <SelectItem value="time-based">Time-based (no target)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Competitive Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="competitive-mode" className="text-base">
                Competitive Match
              </Label>
              <p className="text-sm text-gray-500">Enable for ranked matches and tournaments</p>
            </div>
            <Switch id="competitive-mode" checked={isCompetitive} onCheckedChange={setIsCompetitive} />
          </div>
        </>
      )}

      {/* Duration for PS5 and Snooker */}
      {(selectedGameType === "ps5" || selectedGameType === "snooker") && (
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Select
            value={duration.toString()}
            onValueChange={(value) => setDuration(parseInt(value))}
          >
            <SelectTrigger id="duration">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
              <SelectItem value="120">120 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Button 
        onClick={handleCreateMatch} 
        className="w-full bg-blue-900 hover:bg-blue-800"
        disabled={!!success}
      >
        Create Match
      </Button>
    </div>
  )
}
