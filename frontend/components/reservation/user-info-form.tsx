"use client"

import { useStore } from "@/store/use-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UserInfoForm() {
  const { selectedGameType, playerCount, name, email, phone, setPlayerCount, setName, setEmail, setPhone } = useStore()

  // Maximum players based on game type
  const maxPlayers = selectedGameType === "ps5" ? 4 : 2

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-blue-900">Your Details</h2>
      <p className="text-gray-600 mb-6">Please provide your contact information to complete the reservation</p>

      <div className="space-y-4">
        {/* Player Count */}
        <div className="space-y-2">
          <Label htmlFor="playerCount">Number of Players</Label>
          <Select value={playerCount.toString()} onValueChange={(value) => setPlayerCount(Number.parseInt(value))}>
            <SelectTrigger id="playerCount">
              <SelectValue placeholder="Select number of players" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: maxPlayers }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "player" : "players"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  )
}
