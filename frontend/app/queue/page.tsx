"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  Clock, 
  Trophy, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Bell,
  RefreshCw,
  Calendar,
  MapPin
} from "lucide-react"
import { EightBallIcon } from "@/components/icons/eight-ball-icon"

export default function QueuePage() {
  const { 
    currentUser, 
    getUserQueueEntries, 
    getQueuesByGameType,
    getQueueStatistics,
    removeFromQueue,
    getEstimatedWaitTimeForGameType,
    queueNotifications,
    markQueueNotificationAsRead,
    clearQueueNotifications
  } = useStore()

  const [selectedGameType, setSelectedGameType] = useState<"pool" | "snooker" | "ps5">("pool")
  const [refreshing, setRefreshing] = useState(false)

  // Get user's queue entries
  const userQueueEntries = currentUser ? getUserQueueEntries(currentUser.id) : []
  
  // Get all queue entries for selected game type
  const gameTypeQueues = getQueuesByGameType(selectedGameType)
  
  // Get queue statistics
  const queueStats = getQueueStatistics()

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true)
      setTimeout(() => setRefreshing(false), 1000)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleCancelQueue = (queueId: string) => {
    removeFromQueue(queueId)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "notified": return "bg-blue-100 text-blue-800 border-blue-300"
      case "processing": return "bg-green-100 text-green-800 border-green-300"
      case "completed": return "bg-gray-100 text-gray-800 border-gray-300"
      case "cancelled": return "bg-red-100 text-red-800 border-red-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting": return <Clock className="h-4 w-4" />
      case "notified": return <Bell className="h-4 w-4" />
      case "processing": return <CheckCircle className="h-4 w-4" />
      case "completed": return <CheckCircle className="h-4 w-4" />
      case "cancelled": return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case "pool": return <EightBallIcon className="h-5 w-5" />
      case "snooker": return <Trophy className="h-5 w-5" />
      case "ps5": return <Users className="h-5 w-5" />
      default: return <Users className="h-5 w-5" />
    }
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to view your queue status.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <p className="text-gray-600 mt-1">
            Track your position and manage your queue entries
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Notifications */}
      {queueNotifications.filter(n => !n.read).length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Bell className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You have {queueNotifications.filter(n => !n.read).length} unread queue notifications
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearQueueNotifications}
            >
              Clear All
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Queue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {queueStats.queuesByGameType.map((stat) => (
          <Card key={stat.gameType}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getGameIcon(stat.gameType)}
                  <span className="font-medium capitalize">{stat.gameType}</span>
                </div>
                <Badge variant="secondary">
                  {stat.count} waiting
                </Badge>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Est. wait: {getEstimatedWaitTimeForGameType(stat.gameType)} min
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={selectedGameType} onValueChange={(value) => setSelectedGameType(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pool" className="flex items-center gap-2">
            <EightBallIcon className="h-4 w-4" />
            Pool
          </TabsTrigger>
          <TabsTrigger value="snooker" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Snooker
          </TabsTrigger>
          <TabsTrigger value="ps5" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            PS5
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedGameType} className="space-y-6">
          {/* Your Queue Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Queue Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userQueueEntries.filter(q => q.gameType === selectedGameType).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>You're not currently in the {selectedGameType} queue</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/reservation'}>
                    Join Queue
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userQueueEntries
                    .filter(q => q.gameType === selectedGameType)
                    .map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(entry.status)}>
                              {getStatusIcon(entry.status)}
                              <span className="ml-1 capitalize">{entry.status}</span>
                            </Badge>
                            <span className="font-medium">Position #{entry.position}</span>
                          </div>
                          {entry.status === "waiting" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCancelQueue(entry.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Date:</span>
                            <div className="font-medium">{new Date(entry.date).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Players:</span>
                            <div className="font-medium">{entry.playerCount}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Wait Time:</span>
                            <div className="font-medium">{entry.estimatedWaitTime || 0} min</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Priority:</span>
                            <div className="font-medium capitalize">{entry.priority}</div>
                          </div>
                        </div>

                        {entry.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                            <span className="text-gray-500">Notes:</span> {entry.notes}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Queue Entries for Game Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getGameIcon(selectedGameType)}
                {selectedGameType.charAt(0).toUpperCase() + selectedGameType.slice(1)} Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gameTypeQueues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No one is currently in the {selectedGameType} queue</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {gameTypeQueues
                    .sort((a, b) => a.position - b.position)
                    .map((entry, index) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-lg font-bold text-gray-400">
                            #{entry.position}
                          </div>
                          <div>
                            <div className="font-medium">{entry.name}</div>
                            <div className="text-sm text-gray-500">
                              {entry.playerCount} player{entry.playerCount > 1 ? 's' : ''} • 
                              {entry.estimatedWaitTime || 0} min wait
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(entry.status)}>
                          {getStatusIcon(entry.status)}
                          <span className="ml-1 capitalize">{entry.status}</span>
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
