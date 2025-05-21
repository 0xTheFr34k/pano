"use client"

import { useState } from "react"
import { useStore } from "@/store/use-store"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export function QueueNotifications() {
  const { queueNotifications, getUnreadNotificationsCount, markQueueNotificationAsRead, clearQueueNotifications } = useStore()
  const [open, setOpen] = useState(false)
  
  const unreadCount = getUnreadNotificationsCount()
  
  const handleMarkAsRead = (id: string) => {
    markQueueNotificationAsRead(id)
  }
  
  const handleClearAll = () => {
    clearQueueNotifications()
    setOpen(false)
  }
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Notifications</h3>
          {queueNotifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              Clear all
            </Button>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {queueNotifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
          ) : (
            <div className="space-y-2">
              {queueNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-md text-sm ${
                    notification.read ? "bg-gray-100" : "bg-blue-50 border-l-2 border-blue-500"
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <p>{notification.message}</p>
                  {!notification.read && (
                    <div className="flex justify-end mt-2">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Mark as read
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
