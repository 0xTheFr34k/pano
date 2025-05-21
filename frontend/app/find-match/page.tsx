
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore, type GameType, type SkillLevel, type WaitingPlayer, type Match } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { BombIcon as BilliardBall, Target, Gamepad2, Bell, User, Clock, Trophy, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MatchList } from "@/components/match/match-list"
import { CreateMatchForm } from "@/components/match/create-match-form"
import ProtectedRoute from "@/components/protected-route"

// Helper components for better organization
const GameTypeIcon = ({ type }: { type: GameType }) => {
  switch (type) {
    case "pool":
      return <BilliardBall className="h-5 w-5" />
    case "snooker":
      return <Target className="h-5 w-5" />
    case "ps5":
      return <Gamepad2 className="h-5 w-5" />
    default:
      return null
  }
}

const SkillLevelBadge = ({ level }: { level: SkillLevel }) => {
  switch (level) {
    case "beginner":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Beginner
        </Badge>
      )
    case "casual":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Casual
        </Badge>
      )
    case "competitive":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Trophy className="h-3 w-3 mr-1" /> Competitive
        </Badge>
      )
    default:
      return null
  }
}

const formatTimeRange = (range: string) => {
  switch (range) {
    case "now":
      return "Right now"
    case "30min":
      return "Next 30 minutes"
    case "60min":
      return "Next hour"
    case "today":
      return "Anytime today"
    default:
      return range
  }
}

const GameTypeTabs = ({
  activeTab,
  onTabChange
}: {
  activeTab: string,
  onTabChange: (value: string) => void
}) => (
  <TabsList className="grid grid-cols-4 mb-6">
    <TabsTrigger value="all">All</TabsTrigger>
    <TabsTrigger value="pool" className="flex items-center gap-1">
      <BilliardBall className="h-4 w-4" />
      <span>Pool</span>
    </TabsTrigger>
    <TabsTrigger value="snooker" className="flex items-center gap-1">
      <Target className="h-4 w-4" />
      <span>Snooker</span>
    </TabsTrigger>
    <TabsTrigger value="ps5" className="flex items-center gap-1">
      <Gamepad2 className="h-4 w-4" />
      <span>PS5</span>
    </TabsTrigger>
  </TabsList>
)

const WaitingPlayerCard = ({
  player,
  onJoinMatch
}: {
  player: WaitingPlayer,
  onJoinMatch: (player: WaitingPlayer) => void
}) => (
  <Card key={player.id} className="overflow-hidden">
    <div className="border-l-4 border-blue-500">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <User className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-medium">{player.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <div className="flex items-center">
                  <GameTypeIcon type={player.gameType} />
                  <span className="ml-1 capitalize">{player.gameType}</span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{formatTimeRange(player.timeRange)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SkillLevelBadge level={player.skillLevel} />
            <Button
              onClick={() => onJoinMatch(player)}
              className={player.matchId ? "bg-green-700 hover:bg-green-600" : "bg-blue-900 hover:bg-blue-800"}
            >
              {player.matchId ? "View Match" : "Join Match"}
            </Button>
          </div>
        </div>
      </CardContent>
    </div>
  </Card>
)

export default function FindMatchPage() {
  const router = useRouter()
  const {
    selectedGameType,
    currentUser,
    skillLevel,
    timeRange,
    isWaitingForPlayer,
    waitingPlayers,
    setSelectedGameType,
    setSkillLevel,
    setTimeRange,
    setIsWaitingForPlayer,
    addWaitingPlayer,
    removeWaitingPlayer,
    getWaitingPlayersByGameType,
    getMatchesByGameType,
    getOpenMatches
  } = useStore()

  // Separate tab states for matches and waiting players
  const [matchesTabValue, setMatchesTabValue] = useState<string>("all")
  const [playersTabValue, setPlayersTabValue] = useState<string>("all")

  // State for filtered data
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<WaitingPlayer[]>([])

  // Update filtered matches when tab changes
  useEffect(() => {
    if (matchesTabValue === "all") {
      setFilteredMatches(getOpenMatches())
    } else {
      setFilteredMatches(getMatchesByGameType(matchesTabValue as GameType))
    }
  }, [matchesTabValue, getOpenMatches, getMatchesByGameType, waitingPlayers])

  // Update filtered players when tab changes
  useEffect(() => {
    setFilteredPlayers(getWaitingPlayersByGameType(playersTabValue === "all" ? null : (playersTabValue as GameType)))
  }, [playersTabValue, getWaitingPlayersByGameType, waitingPlayers])

  const handleMatchesTabChange = (value: string) => {
    setMatchesTabValue(value)
  }

  const handlePlayersTabChange = (value: string) => {
    setPlayersTabValue(value)

    // Only update the form's game type when changing the players tab
    if (value === "all") {
      setSelectedGameType(null)
    } else {
      setSelectedGameType(value as GameType)
    }
  }

  const handleToggleWaiting = () => {
    if (isWaitingForPlayer) {
      // Find the current user's waiting player entry and remove it
      const currentPlayer = waitingPlayers.find((player) => player.userId === currentUser?.id)
      if (currentPlayer) {
        removeWaitingPlayer(currentPlayer.id)
      }
    } else {
      // Add the user to waiting players
      if (selectedGameType) {
        const success = addWaitingPlayer()
        if (success) {
          // Force refresh of filtered players
          setFilteredPlayers(getWaitingPlayersByGameType(playersTabValue === "all" ? null : (playersTabValue as GameType)))
        }
      }
    }
  }

  const handleJoinMatch = (player: WaitingPlayer) => {
    if (player.matchId) {
      // If player is already in a match, navigate to that match
      router.push(`/match/${player.matchId}`)
    } else {
      // Pre-fill the reservation form with the game type
      setSelectedGameType(player.gameType)

      // Navigate to the reservation page
      router.push(`/reserve?type=${player.gameType}`)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-blue-900">Find a Match</h1>
          <p className="text-center text-gray-600 mb-8">
            Looking for an opponent? Join a match or let others know you're waiting to play.
          </p>

          {/* Create Match Button */}
          <div className="flex justify-end mb-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-900 hover:bg-blue-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Match
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create a New Match</DialogTitle>
                </DialogHeader>
                <CreateMatchForm />
              </DialogContent>
            </Dialog>
          </div>

          {/* Matches Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-blue-900">Open Matches</CardTitle>
              <CardDescription>Join an existing match or create your own</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={matchesTabValue} onValueChange={handleMatchesTabChange} className="w-full">
                <GameTypeTabs activeTab={matchesTabValue} onTabChange={handleMatchesTabChange} />
                <TabsContent value={matchesTabValue}>
                  <MatchList
                    matches={filteredMatches}
                    currentUserId={currentUser?.id}
                    emptyMessage="No open matches available at the moment."
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Waiting Status Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-blue-900">I'm Waiting for a Player</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* User Name Display */}
                  <div className="flex items-center p-3 bg-blue-50 rounded-md">
                    <User className="h-5 w-5 text-blue-700 mr-2" />
                    <span className="font-medium">{currentUser?.name}</span>
                  </div>

                  {/* Game Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="gameType">Game Type</Label>
                    <Select
                      value={selectedGameType || ""}
                      onValueChange={(value) => setSelectedGameType(value as GameType)}
                      disabled={isWaitingForPlayer}
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

                  {/* Skill Level */}
                  <div className="space-y-2">
                    <Label htmlFor="skillLevel">Skill Level</Label>
                    <Select
                      value={skillLevel}
                      onValueChange={(value) => setSkillLevel(value as SkillLevel)}
                      disabled={isWaitingForPlayer}
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

                  {/* Time Range */}
                  <div className="space-y-2">
                    <Label htmlFor="timeRange">Time Range</Label>
                    <Select
                      value={timeRange}
                      onValueChange={(value) => setTimeRange(value as "now" | "30min" | "60min" | "today")}
                      disabled={isWaitingForPlayer}
                    >
                      <SelectTrigger id="timeRange">
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">Right now</SelectItem>
                        <SelectItem value="30min">Next 30 minutes</SelectItem>
                        <SelectItem value="60min">Next hour</SelectItem>
                        <SelectItem value="today">Anytime today</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Waiting Toggle */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="waiting-toggle" className="text-base">
                        {isWaitingForPlayer ? "Currently Waiting" : "Start Waiting"}
                      </Label>
                      <p className="text-sm text-gray-500">
                        {isWaitingForPlayer
                          ? "Others can see you're looking for a match"
                          : "Let others know you're looking for a match"}
                      </p>
                    </div>
                    <Switch
                      id="waiting-toggle"
                      checked={isWaitingForPlayer}
                      onCheckedChange={handleToggleWaiting}
                      disabled={!selectedGameType}
                    />
                  </div>

                  {isWaitingForPlayer && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center">
                      <Bell className="h-5 w-5 text-amber-500 mr-2 animate-pulse" />
                      <p className="text-sm text-amber-800">
                        You're currently visible to other players looking for a match.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Waiting Players List */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-blue-900">Players Waiting for a Match</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={playersTabValue} onValueChange={handlePlayersTabChange} className="w-full">
                  <GameTypeTabs activeTab={playersTabValue} onTabChange={handlePlayersTabChange} />
                  <TabsContent value={playersTabValue}>
                    {filteredPlayers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                        <p>No players waiting for a match at the moment.</p>
                        <p className="text-sm mt-2">Toggle "I'm Waiting for a Player" to be the first!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredPlayers.map((player) => (
                          <WaitingPlayerCard
                            key={player.id}
                            player={player}
                            onJoinMatch={handleJoinMatch}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
