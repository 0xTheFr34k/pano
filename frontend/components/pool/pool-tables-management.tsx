"use client"

import { useState, useEffect } from "react"
import { useStore, type Station, type QueueEntry, type User, type PoolTableMode } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Users, Clock, Trophy, Crown, Award, Shuffle } from "lucide-react"
import { EightBallIcon } from "@/components/icons/eight-ball-icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PoolTablesManagement() {
  const {
    stations,
    queues,
    users,
    markMatchAsComplete,
    getWinStreakForStation,
    getWinStreakForUser,
    getMaxWinStreakForUser,
    getUserAchievements,
    getCurrentPlayersOnStation,
    getNextQueuedPlayers,
    getEstimatedWaitTimeForGameType,
    poolTableMode,
    setPoolTableMode,
    pairPlayersForMatch
  } = useStore()

  const [poolStations, setPoolStations] = useState<Station[]>([])
  const [queuedPlayers, setQueuedPlayers] = useState<QueueEntry[]>([])
  const [showAchievements, setShowAchievements] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)

  // Find the pool stations
  useEffect(() => {
    const poolTables = stations.filter(s => s.type === "pool")
    if (poolTables.length > 0) {
      setPoolStations(poolTables)
    }
  }, [stations])

  // Get queued players
  useEffect(() => {
    const nextPlayers = getNextQueuedPlayers("pool", 10)
    setQueuedPlayers(nextPlayers)
  }, [queues, getNextQueuedPlayers])

  // Get user by ID
  const getUserById = (userId?: string) => {
    if (!userId) return null
    return users.find(u => u.id === userId) || null
  }

  // Handle match completion
  const handleCompleteMatch = (stationId: string, winnerId?: string) => {
    markMatchAsComplete(stationId, winnerId, "admin")
  }

  // Show user achievements
  const handleShowAchievements = (user: User) => {
    setSelectedUser(user)
    setShowAchievements(true)
  }

  // Get current players for a station
  const getCurrentPlayers = (stationId: string) => {
    return getCurrentPlayersOnStation(stationId)
      .map(id => getUserById(id))
      .filter(Boolean) as User[]
  }

  // Get win streak for a table
  const getTableWinStreak = (stationId: string) => {
    return getWinStreakForStation(stationId)
  }

  // Get current match for a station
  const getCurrentMatch = (stationId: string) => {
    // Since matches are removed, we'll check if station has current players
    const station = stations.find(s => s.id === stationId)
    return station?.currentPlayers && station.currentPlayers.length > 0 ? {
      id: `match-${stationId}`,
      stationId,
      players: station.currentPlayers,
      status: "in_progress" as const
    } : null
  }

  // Get estimated wait time
  const getWaitTime = () => {
    return getEstimatedWaitTimeForGameType("pool")
  }

  // Handle mode change
  const handleModeChange = (mode: PoolTableMode) => {
    setPoolTableMode(mode)
  }

  // Handle assigning players to a table
  const handleAssignPlayers = (stationId: string) => {
    pairPlayersForMatch("pool", stationId)
  }

  // Handle station selection for player assignment
  const handleStationSelect = (station: Station) => {
    setSelectedStation(station)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <EightBallIcon className="h-5 w-5" />
                <span>Pool Tables Management</span>
              </CardTitle>
              <CardDescription>
                Manage pool tables in queue or match mode
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Mode:</span>
              <Select value={poolTableMode} onValueChange={(value) => handleModeChange(value as PoolTableMode)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="queue">Queue-Based (Auto-Pair)</SelectItem>
                  <SelectItem value="match">Match-Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {poolStations.map((station) => {
              const currentPlayers = getCurrentPlayers(station.id)
              const currentMatch = getCurrentMatch(station.id)
              const winStreak = getTableWinStreak(station.id)

              return (
                <Card key={station.id} className="overflow-hidden">
                  <CardHeader className="bg-slate-50 py-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">{station.name}</CardTitle>
                      <Badge variant={
                        station.status === "available" ? "secondary" :
                        station.status === "occupied" ? "default" :
                        "outline"
                      } className={
                        station.status === "available" ? "bg-green-500 text-white" :
                        station.status === "occupied" ? "bg-red-500 text-white" :
                        ""
                      }>
                        {station.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {station.status === "occupied" && currentPlayers.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {currentPlayers.map((player) => (
                            <div key={player.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                              <Avatar>
                                <AvatarImage src={player.avatar} />
                                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{player.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span>{player.skillLevel}</span>
                                  {getWinStreakForUser(player.id, "pool") > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      <Trophy className="h-3 w-3 mr-1" />
                                      {getWinStreakForUser(player.id, "pool")} wins
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

                        {currentMatch && (
                          <div className="bg-blue-50 p-3 rounded-lg text-sm">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-medium">Match Type:</span> Standard
                              </div>
                              {winStreak > 0 && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  {winStreak} streak
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-center gap-3">
                          {currentPlayers.map((player) => (
                            <Button
                              key={player.id}
                              onClick={() => handleCompleteMatch(station.id, player.id)}
                              className="bg-blue-900 hover:bg-blue-800"
                            >
                              {player.name} Won
                            </Button>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => handleCompleteMatch(station.id)}
                          >
                            Draw / Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <EightBallIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="font-medium">Table Available</p>
                        <p className="text-sm text-gray-500 mt-1">Ready for new players</p>

                        {poolTableMode === "queue" && queuedPlayers.length > 0 && (
                          <Button
                            className="mt-4"
                            onClick={() => handleAssignPlayers(station.id)}
                          >
                            <Shuffle className="h-4 w-4 mr-2" />
                            Auto-Assign Players
                          </Button>
                        )}

                        {poolTableMode === "match" && (
                          <Button
                            className="mt-4"
                            onClick={() => handleStationSelect(station)}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Select Players
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Waiting Queue</span>
          </CardTitle>
          <CardDescription>
            Players waiting for pool tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-500">Waiting Players</p>
                <p className="text-2xl font-bold">{queuedPlayers.length}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-500">Estimated Wait</p>
                <p className="text-2xl font-bold">{getWaitTime()} min</p>
              </div>
            </div>

            <div>
              <Badge variant={poolTableMode === "queue" ? "default" : "outline"} className="ml-2">
                {poolTableMode === "queue" ? "Queue Mode" : "Match Mode"}
              </Badge>
            </div>
          </div>

          <ScrollArea className="h-[300px] pr-4">
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
                          {user && getWinStreakForUser(user.id, "pool") > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Trophy className="h-3 w-3 mr-1" />
                              {getWinStreakForUser(user.id, "pool")} wins
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
                  <p className="text-2xl font-bold">{getWinStreakForUser(selectedUser.id, "pool")}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-gray-500">Max Streak</p>
                  <p className="text-2xl font-bold">{getMaxWinStreakForUser(selectedUser.id, "pool")}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-3">Badges</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className={`p-3 rounded-lg border text-center ${getUserAchievements(selectedUser.id).poolStreak5 ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200 opacity-50"}`}>
                    <Trophy className={`h-6 w-6 mx-auto mb-1 ${getUserAchievements(selectedUser.id).poolStreak5 ? "text-amber-500" : "text-gray-400"}`} />
                    <p className="text-sm font-medium">5 Streak</p>
                  </div>
                  <div className={`p-3 rounded-lg border text-center ${getUserAchievements(selectedUser.id).poolStreak10 ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200 opacity-50"}`}>
                    <Trophy className={`h-6 w-6 mx-auto mb-1 ${getUserAchievements(selectedUser.id).poolStreak10 ? "text-amber-500" : "text-gray-400"}`} />
                    <p className="text-sm font-medium">10 Streak</p>
                  </div>
                  <div className={`p-3 rounded-lg border text-center ${getUserAchievements(selectedUser.id).poolStreak20 ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200 opacity-50"}`}>
                    <Crown className={`h-6 w-6 mx-auto mb-1 ${getUserAchievements(selectedUser.id).poolStreak20 ? "text-amber-500" : "text-gray-400"}`} />
                    <p className="text-sm font-medium">20 Streak</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Player Selection Dialog */}
      <Dialog open={!!selectedStation} onOpenChange={(open) => !open && setSelectedStation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Players for {selectedStation?.name}</DialogTitle>
          </DialogHeader>

          {selectedStation && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Select players from the queue to assign to this table
              </p>

              <ScrollArea className="h-[300px] pr-4">
                {queuedPlayers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No players in queue</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {queuedPlayers.map((player) => {
                      const user = player.userId ? getUserById(player.userId) : null

                      return (
                        <div key={player.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{player.priority !== "normal" && (
                                <Badge variant={player.priority === "vip" ? "default" : "secondary"} className="text-xs">
                                  {player.priority.toUpperCase()}
                                </Badge>
                              )}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                          >
                            Select
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedStation(null)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  handleAssignPlayers(selectedStation.id)
                  setSelectedStation(null)
                }}>
                  Assign to Table
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
