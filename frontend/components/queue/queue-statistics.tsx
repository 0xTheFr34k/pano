"use client"

import { useStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BombIcon as BilliardBall, Target, Gamepad2, Clock, Users } from "lucide-react"

export function QueueStatistics() {
  const { getQueueStatistics, getActiveQueueEntries } = useStore()
  
  const stats = getQueueStatistics()
  const activeQueues = getActiveQueueEntries()
  
  // Calculate total capacity
  const totalCapacity = activeQueues.reduce((sum, queue) => sum + queue.playerCount, 0)
  
  // Get game type icon
  const getGameIcon = (type: string) => {
    switch (type) {
      case "pool":
        return <BilliardBall className="h-5 w-5 text-blue-700" />
      case "snooker":
        return <Target className="h-5 w-5 text-blue-700" />
      case "ps5":
        return <Gamepad2 className="h-5 w-5 text-blue-700" />
      default:
        return null
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Waiting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalWaiting}</div>
            <p className="text-xs text-gray-500 mt-1">
              Entries in queue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Wait Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(stats.averageWaitTime)} min</div>
            <p className="text-xs text-gray-500 mt-1">
              <Clock className="h-3 w-3 inline mr-1" />
              Estimated average wait
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCapacity}</div>
            <p className="text-xs text-gray-500 mt-1">
              <Users className="h-3 w-3 inline mr-1" />
              Players waiting
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Queue Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.queuesByGameType.map((item) => {
              // Calculate percentage
              const percentage = stats.totalWaiting > 0 
                ? Math.round((item.count / stats.totalWaiting) * 100) 
                : 0
              
              return (
                <div key={item.gameType} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getGameIcon(item.gameType)}
                      <span className="ml-2 capitalize">{item.gameType}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
