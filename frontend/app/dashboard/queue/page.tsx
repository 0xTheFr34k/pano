"use client"

import { useRouter } from "next/navigation"
import { useStore } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import QueueManagement from "@/components/admin/queue-management"
import ProtectedRoute from "@/components/protected-route"

export default function DashboardQueuePage() {
  const router = useRouter()
  const { getQueueStatistics } = useStore()

  const stats = getQueueStatistics()

  return (
    <ProtectedRoute requireAdmin>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Waiting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWaiting}</div>
              <p className="text-xs text-muted-foreground">Guests in queue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.averageWaitTime)} min</div>
              <p className="text-xs text-muted-foreground">Estimated wait time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pool Tables Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.queuesByGameType.find(q => q.gameType === "pool")?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">Guests waiting for pool tables</p>
            </CardContent>
          </Card>
        </div>

        <QueueManagement />
      </div>
    </ProtectedRoute>
  )
}
