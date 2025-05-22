"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BombIcon as BilliardBall, Target, Gamepad2 } from "lucide-react"
import SnookerQueueSystem from "@/components/snooker/snooker-queue-system"
import PoolTablesManagement from "@/components/pool/pool-tables-management"
import PS5CalendarView from "@/components/ps5/ps5-calendar-view"
import DashboardLayout from "@/components/admin/dashboard-layout"

export default function GameStationsPage() {
  const [activeTab, setActiveTab] = useState<string>("snooker")

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-2">Game Stations Management</h1>
        <p className="text-gray-600 mb-6">
          Manage all game stations, queues, and reservations
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 w-full max-w-md">
            <TabsTrigger value="snooker" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Snooker</span>
            </TabsTrigger>
            <TabsTrigger value="pool" className="flex items-center gap-2">
              <BilliardBall className="h-4 w-4" />
              <span>Pool Tables</span>
            </TabsTrigger>
            <TabsTrigger value="ps5" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span>PS5</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="snooker">
            <Card>
              <CardHeader>
                <CardTitle>Snooker Table Management</CardTitle>
                <CardDescription>
                  Manage the snooker table queue, matches, and player statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SnookerQueueSystem />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pool">
            <Card>
              <CardHeader>
                <CardTitle>Pool Tables Management</CardTitle>
                <CardDescription>
                  Manage pool tables in queue-based or match-based mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PoolTablesManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ps5">
            <Card>
              <CardHeader>
                <CardTitle>PS5 Console Management</CardTitle>
                <CardDescription>
                  Manage PS5 reservations and time slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PS5CalendarView />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
