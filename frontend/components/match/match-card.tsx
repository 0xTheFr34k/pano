import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BombIcon as BilliardBall, Target, Gamepad2, User, Clock, Trophy, Calendar } from "lucide-react"
import { format } from "date-fns"
import { type Match, type GameType, type SkillLevel } from "@/store/use-store"

interface MatchCardProps {
  match: Match
  isUserInMatch: boolean
}

export function MatchCard({ match, isUserInMatch }: MatchCardProps) {
  const router = useRouter()

  // Get game type icon
  const getGameIcon = (type: GameType) => {
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

  // Get skill level badge
  const getSkillLevelBadge = (level: SkillLevel) => {
    switch (level) {
      case "beginner":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Trophy className="h-3 w-3 mr-1" />
            Beginner
          </Badge>
        )
      case "casual":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Trophy className="h-3 w-3 mr-1" />
            Casual
          </Badge>
        )
      case "competitive":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Trophy className="h-3 w-3 mr-1" />
            Competitive
          </Badge>
        )
      default:
        return null
    }
  }

  // Get match status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Open
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Cancelled
          </Badge>
        )
      default:
        return null
    }
  }

  const handleViewMatch = () => {
    router.push(`/match/${match.id}`)
  }

  return (
    <Card className="overflow-hidden">
      <div className={`border-l-4 ${match.status === "open" ? "border-green-500" : "border-blue-500"}`}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                {getGameIcon(match.gameType)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium capitalize">{match.gameType} Match</h3>
                  {getStatusBadge(match.status)}
                </div>
                <p className="text-sm text-gray-600 mt-1">Created by {match.creatorName}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{format(new Date(match.date), "MMM d")}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{match.timeSlot.start} - {match.timeSlot.end}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{match.playerCount}/{match.maxPlayers} Players</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getSkillLevelBadge(match.skillLevel)}
              <Button
                onClick={handleViewMatch}
                className={isUserInMatch ? "bg-green-700 hover:bg-green-600" : "bg-blue-900 hover:bg-blue-800"}
              >
                {isUserInMatch ? "View My Match" : "Join Match"}
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
