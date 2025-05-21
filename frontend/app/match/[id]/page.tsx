"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useStore, type Match, type GameType } from "@/store/use-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { BombIcon as BilliardBall, Target, Gamepad2, User, Clock, Trophy, Calendar, AlertCircle, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import ProtectedRoute from "@/components/protected-route"

export default function MatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getMatchById, currentUser, joinMatch, leaveMatch } = useStore()
  const [match, setMatch] = useState<Match | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [joinSuccess, setJoinSuccess] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  // Get match ID from URL params
  const matchId = params.id as string

  // Fetch match data
  useEffect(() => {
    if (matchId) {
      const matchData = getMatchById(matchId)
      setMatch(matchData)
      setLoading(false)
      
      if (!matchData) {
        setError("Match not found")
      }
    }
  }, [matchId, getMatchById])

  // Handle join match
  const handleJoinMatch = () => {
    if (!match || !currentUser) return
    
    setJoinError(null)
    
    // Check if match is full
    if (match.playerCount >= match.maxPlayers) {
      setJoinError("This match is already full")
      return
    }
    
    // Check if match is open
    if (match.status !== "open") {
      setJoinError("This match is no longer open for joining")
      return
    }
    
    // Check if user is already in the match
    if (match.players.includes(currentUser.id)) {
      setJoinError("You are already part of this match")
      return
    }
    
    // Join the match
    const success = joinMatch(matchId)
    
    if (success) {
      setJoinSuccess(true)
      // Refresh match data
      setMatch(getMatchById(matchId))
    } else {
      setJoinError("Failed to join the match. Please try again.")
    }
  }

  // Handle leave match
  const handleLeaveMatch = () => {
    if (!match || !currentUser) return
    
    leaveMatch(matchId, currentUser.id)
    
    // Refresh match data
    const updatedMatch = getMatchById(matchId)
    setMatch(updatedMatch)
    
    // If match was cancelled (creator left), go back to find-match page
    if (updatedMatch?.status === "cancelled") {
      router.push("/find-match")
    }
  }

  // Get game type icon
  const getGameIcon = (type: GameType) => {
    switch (type) {
      case "pool":
        return <BilliardBall className="h-6 w-6 text-blue-700" />
      case "snooker":
        return <Target className="h-6 w-6 text-blue-700" />
      case "ps5":
        return <Gamepad2 className="h-6 w-6 text-blue-700" />
      default:
        return null
    }
  }

  // Format match type for display
  const formatMatchType = (type: string | undefined) => {
    if (!type) return ""
    
    switch (type) {
      case "first-to-3":
        return "First to 3 wins"
      case "first-to-5":
        return "First to 5 wins"
      case "first-to-7":
        return "First to 7 wins"
      case "time-based":
        return "Time-based (no target)"
      default:
        return type
    }
  }

  // Get skill level badge
  const getSkillLevelBadge = (level: string) => {
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

  // Check if current user is in the match
  const isUserInMatch = () => {
    if (!match || !currentUser) return false
    return match.players.includes(currentUser.id)
  }

  // Check if current user is the creator of the match
  const isCreator = () => {
    if (!match || !currentUser) return false
    return match.creatorId === currentUser.id
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p>Loading match details...</p>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <Alert className="bg-red-50 border-red-200 mb-4">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              {error || "Match not found"}
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/find-match")}>Back to Find Match</Button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">Match Details</h1>
            <Button variant="outline" onClick={() => router.push("/find-match")}>
              Back to Find Match
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Match Details Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                      {getGameIcon(match.gameType)}
                      <span className="capitalize">{match.gameType} Match</span>
                    </CardTitle>
                    <CardDescription>Created by {match.creatorName}</CardDescription>
                  </div>
                  {getStatusBadge(match.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-700" />
                      <div>
                        <p className="font-medium">Date</p>
                        <p className="text-gray-600">{format(new Date(match.date), "MMMM d, yyyy")}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-700" />
                      <div>
                        <p className="font-medium">Time</p>
                        <p className="text-gray-600">{match.timeSlot.start} - {match.timeSlot.end}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-blue-700" />
                      <div>
                        <p className="font-medium">Skill Level</p>
                        <div className="mt-1">{getSkillLevelBadge(match.skillLevel)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-700" />
                      <div>
                        <p className="font-medium">Players</p>
                        <p className="text-gray-600">{match.playerCount} / {match.maxPlayers}</p>
                      </div>
                    </div>
                    
                    {match.gameType === "pool" && (
                      <>
                        <div>
                          <p className="font-medium">Match Type</p>
                          <p className="text-gray-600">{formatMatchType(match.matchType)}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium">Competitive</p>
                          <p className="text-gray-600">{match.isCompetitive ? "Yes" : "No"}</p>
                        </div>
                      </>
                    )}
                    
                    {(match.gameType === "ps5" || match.gameType === "snooker") && (
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-gray-600">{match.duration} minutes</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                {isUserInMatch() ? (
                  <Button variant="destructive" onClick={handleLeaveMatch}>
                    {isCreator() ? "Cancel Match" : "Leave Match"}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setJoinDialogOpen(true)}
                    disabled={match.status !== "open" || match.playerCount >= match.maxPlayers}
                    className="bg-blue-900 hover:bg-blue-800"
                  >
                    Join Match
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Join Match Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Match</DialogTitle>
            <DialogDescription>
              Are you sure you want to join this {match.gameType} match?
            </DialogDescription>
          </DialogHeader>
          
          {joinError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">{joinError}</AlertDescription>
            </Alert>
          )}
          
          {joinSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                You have successfully joined the match!
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinDialogOpen(false)}>
              {joinSuccess ? "Close" : "Cancel"}
            </Button>
            {!joinSuccess && (
              <Button onClick={handleJoinMatch} className="bg-blue-900 hover:bg-blue-800">
                Join Match
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
