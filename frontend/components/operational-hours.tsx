import { Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function OperationalHours() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4 flex items-center">
        <Clock className="h-5 w-5 text-blue-900 mr-3" />
        <div>
          <p className="font-medium text-blue-900">Opening Hours</p>
          <p className="text-gray-700">Open daily from 14:30 PM to 00:00 AM</p>
        </div>
      </CardContent>
    </Card>
  )
}
