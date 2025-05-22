"use client"

import { useState, useEffect } from "react"
import { useStore, type QueueEntry, type User } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Clock, Trophy, Crown, Award } from "lucide-react"
import { SnookerIcon } from "@/components/icons/snooker-icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function SnookerQueueSystem() {
  const {
    stations,
    queues,
    users,
    markMatchAsComplete,
    startFriendlyMatch,
    endFriendlyMatch,
    getWinStreakForStation,
    getWinStreakForUser,
    getMaxWinStreakForUser,
    getUserAchievements,
    getCurrentPlayersOnStation,
    getCurrentWinnerOnStation,
    getNextQueuedPlayers,
    getEstimatedWaitTimeForGameType
  } = useStore()

  const [snookerStation, setSnookerStation] = useState<any>(null)
  const [currentMatch, setCurrentMatch] = useState<any>(null)
  const [queuedPlayers, setQueuedPlayers] = useState<QueueEntry[]>([])
  const [showAchievements, setShowAchievements] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Find the snooker station
  useEffect(() => {
    const station = stations.find(s => s.type === "snooker")
    if (station) {
      setSnookerStation(station)
    }
  }, [stations])

  // Get current match on the snooker table
  useEffect(() => {
    if (!snookerStation) return

    // Check if station has current players to determine if there's a match
    const match = snookerStation.currentPlayers && snookerStation.currentPlayers.length > 0 ? {
      id: `match-${snookerStation.id}`,
      stationId: snookerStation.id,
      players: snookerStation.currentPlayers,
      status: "in_progress" as const
    } : null

    setCurrentMatch(match)
  }, [snookerStation])

  // Get queued players
  useEffect(() => {
    const nextPlayers = getNextQueuedPlayers("snooker", 5)
    setQueuedPlayers(nextPlayers)
  }, [queues, getNextQueuedPlayers])

  // Get user by ID
  const getUserById = (userId?: string) => {
    if (!userId) return null
    return users.find(u => u.id === userId) || null
  }

  // Handle match completion
  const handleCompleteMatch = (winnerId?: string) => {
    if (!snookerStation) return
    markMatchAsComplete(snookerStation.id, winnerId, "admin")
  }

  // Handle starting a friendly match
  const handleStartFriendlyMatch = () => {
    if (!snookerStation) return

    // Use the first two users for a friendly match
    const playerIds = users
      .filter(u => u.status === "approved")
      .slice(0, 2)
      .map(u => u.id)

    if (playerIds.length < 2) return

    startFriendlyMatch(snookerStation.id, playerIds)
  }

  // Handle ending a friendly match
  const handleEndFriendlyMatch = () => {
    if (!snookerStation) return
    endFriendlyMatch(snookerStation.id)
  }

  // Show user achievements
  const handleShowAchievements = (user: User) => {
    setSelectedUser(user)
    setShowAchievements(true)
  }

  // Get current players
  const getCurrentPlayers = () => {
    if (!snookerStation) return []
    return getCurrentPlayersOnStation(snookerStation.id)
      .map(id => getUserById(id))
      .filter(Boolean) as User[]
  }

  // Get current winner
  const getCurrentWinner = () => {
    if (!snookerStation) return null
    const winnerId = getCurrentWinnerOnStation(snookerStation.id)
    return winnerId ? getUserById(winnerId) : null
  }

  // Get win streak for the table
  const getTableWinStreak = () => {
    if (!snookerStation) return 0
    return getWinStreakForStation(snookerStation.id)
  }

  // Get estimated wait time
  const getWaitTime = () => {
    return getEstimatedWaitTimeForGameType("snooker")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SnookerIcon className="h-5 w-5" />
            <span>Snooker Table Status</span>
          </CardTitle>
          <CardDescription>
            Current match and table status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {snookerStation && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{snookerStation.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={
                      snookerStation.status === "available" ? "secondary" :
                      snookerStation.status === "occupied" ? "default" :
                      "outline"
                    } className={
                      snookerStation.status === "available" ? "bg-green-500 text-white" :
                      snookerStation.status === "occupied" ? "bg-red-500 text-white" :
                      ""
                    }>
                      {snookerStation.status}
                    </Badge>

                    {snookerStation.isFriendlyMatch && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Friendly Match
                      </Badge>
                    )}

                    {getTableWinStreak() > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <Trophy className="h-3 w-3 mr-1" />
                        {getTableWinStreak()} streak
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {snookerStation.status === "available" && queuedPlayers.length === 0 && (
                    <Button onClick={handleStartFriendlyMatch}>
                      Start Friendly Match
                    </Button>
                  )}

                  {snookerStation.isFriendlyMatch && (
                    <Button variant="destructive" onClick={handleEndFriendlyMatch}>
                      End Friendly Match
                    </Button>
                  )}
                </div>
              </div>

              {snookerStation.status === "occupied" && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Current Players</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {getCurrentPlayers().map((player) => (
                      <div key={player.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <Avatar>
                          <AvatarImage src={player.avatar} />
                          <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{player.name}</p>
                            {getCurrentWinner()?.id === player.id && (
                              <Crown className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{player.skillLevel}</span>
                            {getWinStreakForUser(player.id, "snooker") > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Trophy className="h-3 w-3 mr-1" />
                                {getWinStreakForUser(player.id, "snooker")} wins
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto"
                          onClick={() => handleShowAchievements(player)}
                        >
                          <Award className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-center gap-3">
                    {getCurrentPlayers().map((player) => (
                      <Button
                        key={player.id}
                        onClick={() => handleCompleteMatch(player.id)}
                        className="bg-blue-900 hover:bg-blue-800"
                      >
                        {player.name} Won
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => handleCompleteMatch()}
                    >
                      Draw / Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-medium mb-3">Queue Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-gray-500">Waiting Players</p>
                    <p className="text-2xl font-bold">{queuedPlayers.length}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-gray-500">Estimated Wait</p>
                    <p className="text-2xl font-bold">{getWaitTime()} min</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Waiting Queue</span>
          </CardTitle>
          <CardDescription>
            Next players in line
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {queuedPlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No players in queue</p>
                <p className="text-sm mt-1">The queue is currently empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queuedPlayers.map((player, index) => {
                  const user = player.userId ? getUserById(player.userId) : null

                  return (
                    <div key={player.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{player.priority !== "normal" && (
                            <Badge variant={player.priority === "vip" ? "default" : "secondary"} className="text-xs">
                              {player.priority.toUpperCase()}
                            </Badge>
                          )}</span>
                          {user && getWinStreakForUser(user.id, "snooker") > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Trophy className="h-3 w-3 mr-1" />
                              {getWinStreakForUser(user.id, "snooker")} wins
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-sm font-medium">
                          {player.estimatedWaitTime || getWaitTime()} min
                        </p>
                        <p className="text-xs text-gray-500">wait time</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Achievements Dialog */}
      <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Player Achievements</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.skillLevel} player</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-gray-500">Current Streak</p>
                  <p className="text-2xl font-bold">{getWinStreakForUser(selectedUser.id, "snooker")}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-gray-500">Max Streak</p>
                  <p className="text-2xl font-bold">{getMaxWinStreakForUser(selectedUser.id, "snooker")}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-3">Badges</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className={`p-3 rounded-lg border text-center ${getUserAchievements(selectedUser.id).snookerStreak5 ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200 opacity-50"}`}>
                    <Trophy className={`h-6 w-6 mx-auto mb-1 ${getUserAchievements(selectedUser.id).snookerStreak5 ? "text-amber-500" : "text-gray-400"}`} />
                    <p className="text-sm font-medium">5 Streak</p>
                  </div>
                  <div className={`p-3 rounded-lg border text-center ${getUserAchievements(selectedUser.id).snookerStreak10 ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200 opacity-50"}`}>
                    <Trophy className={`h-6 w-6 mx-auto mb-1 ${getUserAchievements(selectedUser.id).snookerStreak10 ? "text-amber-500" : "text-gray-400"}`} />
                    <p className="text-sm font-medium">10 Streak</p>
                  </div>
                  <div className={`p-3 rounded-lg border text-center ${getUserAchievements(selectedUser.id).snookerStreak20 ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200 opacity-50"}`}>
                    <Crown className={`h-6 w-6 mx-auto mb-1 ${getUserAchievements(selectedUser.id).snookerStreak20 ? "text-amber-500" : "text-gray-400"}`} />
                    <p className="text-sm font-medium">20 Streak</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
