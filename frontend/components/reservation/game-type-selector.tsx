"use client"

import type React from "react"

import { useStore, type GameType } from "@/store/use-store"
import { Card, CardContent } from "@/components/ui/card"
import { BombIcon as BilliardBall, Target, Gamepad2 } from "lucide-react"

export default function GameTypeSelector() {
  const { selectedGameType, setSelectedGameType } = useStore()

  const gameTypes: { type: GameType; title: string; description: string; icon: React.ReactNode }[] = [
    {
      type: "pool",
      title: "Pool Table",
      description: "Classic 8-ball pool on our professional tables",
      icon: <BilliardBall className="h-10 w-10" />,
    },
    {
      type: "snooker",
      title: "Snooker Table",
      description: "Full-size snooker tables for the traditional experience",
      icon: <Target className="h-10 w-10" />,
    },
    {
      type: "ps5",
      title: "PS5 Console",
      description: "Next-gen gaming with the latest titles",
      icon: <Gamepad2 className="h-10 w-10" />,
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-blue-900">Select Your Game</h2>
      <p className="text-gray-600 mb-6">Choose the type of gaming experience you'd like to enjoy at Panorama</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gameTypes.map((game) => (
          <Card
            key={game.type}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedGameType === game.type ? "border-2 border-blue-900 bg-blue-50" : "border border-gray-200"
            }`}
            onClick={() => setSelectedGameType(game.type)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div
                className={`mb-4 text-blue-900 ${selectedGameType === game.type ? "text-blue-900" : "text-gray-500"}`}
              >
                {game.icon}
              </div>
              <h3 className="text-lg font-medium mb-2">{game.title}</h3>
              <p className="text-gray-600 text-sm">{game.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
