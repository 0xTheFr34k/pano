import { Bell } from "lucide-react"
import { MatchCard } from "@/components/match/match-card"
import { type Match } from "@/store/use-store"

interface MatchListProps {
  matches: Match[]
  currentUserId?: string
  emptyMessage?: string
}

export function MatchList({ matches, currentUserId, emptyMessage }: MatchListProps) {
  // Check if the current user is in a match
  const isUserInMatch = (match: Match) => {
    if (!currentUserId) return false
    return match.players.includes(currentUserId)
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bell className="h-10 w-10 mx-auto mb-2 text-gray-400" />
        <p>{emptyMessage || "No matches available at the moment."}</p>
        <p className="text-sm mt-2">Create a match to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <MatchCard 
          key={match.id} 
          match={match} 
          isUserInMatch={isUserInMatch(match)} 
        />
      ))}
    </div>
  )
}
