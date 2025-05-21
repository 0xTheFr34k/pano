"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Define types
export type GameType = "pool" | "snooker" | "ps5"
export type SkillLevel = "beginner" | "casual" | "competitive"
export type MatchType = "first-to-3" | "first-to-5" | "first-to-7" | "time-based"
export type GamePreference = GameType | "all"
export type UserStatus = "pending" | "approved" | "rejected"
export type MatchStatus = "open" | "in_progress" | "completed" | "cancelled"
export type QueueStatus = "waiting" | "notified" | "processing" | "completed" | "cancelled"
export type QueuePriority = "normal" | "high" | "vip"

export type TimeSlot = {
  id: string
  start: string
  end: string
}

export type Station = {
  id: string
  name: string
  type: GameType
  available: boolean
}

export type User = {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  gamePreference: GamePreference
  skillLevel: SkillLevel
  isAdmin: boolean
  status: UserStatus
  createdAt: string
}

export type Reservation = {
  id: string
  userId?: string
  stationId: string
  date: string
  timeSlot: TimeSlot
  gameType: GameType
  playerCount: number
  name: string
  email: string
  phone: string
  duration?: number // For PS5 and snooker
  matchType?: MatchType // For pool
  isCompetitive?: boolean // For pool
  status: "confirmed" | "cancelled" | "no-show" | "completed"
  createdAt: string
}

export type Match = {
  id: string
  creatorId: string
  creatorName: string
  gameType: GameType
  skillLevel: SkillLevel
  date: string
  timeSlot: TimeSlot
  stationId: string
  playerCount: number
  maxPlayers: number
  players: string[] // Array of user IDs who have joined
  matchType?: MatchType // For pool
  isCompetitive?: boolean // For pool
  duration?: number // For PS5 and snooker
  status: MatchStatus
  createdAt: string
}

export type QueueEntry = {
  id: string
  userId?: string
  name: string
  email: string
  phone: string
  gameType: GameType
  playerCount: number
  date: string
  preferredTimeSlot?: TimeSlot
  estimatedWaitTime?: number // in minutes
  position: number
  priority: QueuePriority
  status: QueueStatus
  notes?: string
  notifiedAt?: string
  createdAt: string
  updatedAt: string
}

export type WaitingPlayer = {
  id: string
  userId?: string
  name: string
  gameType: GameType
  skillLevel: SkillLevel
  timeRange: "now" | "30min" | "60min" | "today"
  matchId?: string // Reference to a match if the player has joined one
  createdAt: string
}

// Define store state type
interface StoreState {
  // Current reservation form state
  selectedGameType: GameType | null
  selectedDate: string | null
  selectedTimeSlot: TimeSlot | null
  playerCount: number
  name: string
  email: string
  phone: string
  duration: number // For PS5 and snooker (in minutes)
  matchType: MatchType // For pool
  isCompetitive: boolean // For pool
  skillLevel: SkillLevel // For waiting players
  timeRange: "now" | "30min" | "60min" | "today" // For waiting players
  isWaitingForPlayer: boolean // For find match

  // Registration form state
  avatar: string
  gamePreference: GamePreference
  password: string

  // Auth state
  currentUser: User | null

  // Admin state
  adminFilter: {
    gameType: GameType | "all"
    date: string | null
    status: "all" | "confirmed" | "cancelled" | "no-show" | "completed"
  }

  // Mock data
  stations: Station[]
  timeSlots: TimeSlot[]
  reservations: Reservation[]
  waitingPlayers: WaitingPlayer[]
  users: User[]
  matches: Match[]
  queues: QueueEntry[]

  // Queue state
  showQueueJoinModal: boolean
  queueNotifications: { id: string; message: string; read: boolean }[]

  // Actions - Reservation
  setSelectedGameType: (gameType: GameType | null) => void
  setSelectedDate: (date: string | null) => void
  setSelectedTimeSlot: (timeSlot: TimeSlot | null) => void
  setPlayerCount: (count: number) => void
  setName: (name: string) => void
  setEmail: (email: string) => void
  setPhone: (phone: string) => void
  setDuration: (duration: number) => void
  setMatchType: (matchType: MatchType) => void
  setIsCompetitive: (isCompetitive: boolean) => void
  setSkillLevel: (skillLevel: SkillLevel) => void
  setTimeRange: (timeRange: "now" | "30min" | "60min" | "today") => void
  setIsWaitingForPlayer: (isWaiting: boolean) => void
  resetForm: () => void
  createReservation: () => void

  // Actions - Waiting Players
  addWaitingPlayer: () => void
  removeWaitingPlayer: (id: string) => void

  // Actions - Matches
  createMatch: () => string | null
  joinMatch: (matchId: string) => boolean
  leaveMatch: (matchId: string, userId: string) => void
  getMatchById: (matchId: string) => Match | undefined
  getMatchesByGameType: (gameType: GameType | null) => Match[]
  updateMatchStatus: (matchId: string, status: MatchStatus) => void

  // Actions - Queue
  setShowQueueJoinModal: (show: boolean) => void
  addToQueue: (entry: Omit<QueueEntry, "id" | "position" | "status" | "createdAt" | "updatedAt">) => string
  removeFromQueue: (id: string) => void
  updateQueueEntry: (id: string, updates: Partial<QueueEntry>) => void
  updateQueuePosition: (id: string, newPosition: number) => void
  updateQueuePriority: (id: string, priority: QueuePriority) => void
  notifyQueueEntry: (id: string) => void
  markQueueEntryAsProcessing: (id: string) => void
  completeQueueEntry: (id: string) => void
  cancelQueueEntry: (id: string) => void
  addQueueNotification: (message: string) => void
  markQueueNotificationAsRead: (id: string) => void
  clearQueueNotifications: () => void

  // Actions - Registration & Auth
  setAvatar: (avatar: string) => void
  setGamePreference: (preference: GamePreference) => void
  setPassword: (password: string) => void
  register: () => boolean
  login: (email: string, password: string) => boolean
  logout: () => void

  // Actions - User Management
  approveUser: (userId: string) => void
  rejectUser: (userId: string) => void
  getPendingUsers: () => User[]

  // Actions - Admin
  setAdminFilter: (filter: Partial<StoreState["adminFilter"]>) => void
  updateReservationStatus: (id: string, status: Reservation["status"]) => void
  deleteReservation: (id: string) => void

  // Getters
  getAvailableStations: (gameType: GameType, date: string, timeSlotId: string) => Station[]
  getReservationsForDate: (date: string) => Reservation[]
  getWaitingPlayersByGameType: (gameType: GameType | null) => WaitingPlayer[]
  getMaxMatches: (matchType: MatchType) => number
  getFilteredReservations: () => Reservation[]
  getUserReservations: (userId: string) => Reservation[]
  getOpenMatches: () => Match[]
  getMatchesByUser: (userId: string) => Match[]

  // Queue Getters
  getQueuesByGameType: (gameType: GameType | null) => QueueEntry[]
  getQueuesByDate: (date: string) => QueueEntry[]
  getQueuesByStatus: (status: QueueStatus | null) => QueueEntry[]
  getQueueEntryById: (id: string) => QueueEntry | undefined
  getUserQueueEntries: (userId: string) => QueueEntry[]
  getActiveQueueEntries: () => QueueEntry[]
  getQueueStatistics: () => {
    totalWaiting: number
    averageWaitTime: number
    queuesByGameType: { gameType: GameType; count: number }[]
  }
  getUnreadNotificationsCount: () => number
  shouldShowQueueOption: (gameType: GameType, date: string, timeSlotId: string) => boolean
}

// Create the store
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial form state
      selectedGameType: null,
      selectedDate: null,
      selectedTimeSlot: null,
      playerCount: 2,
      name: "",
      email: "",
      phone: "",
      duration: 30, // Default 30 minutes for PS5
      matchType: "first-to-3", // Default for pool
      isCompetitive: false, // Default for pool
      skillLevel: "casual", // Default for waiting players
      timeRange: "now", // Default for waiting players
      isWaitingForPlayer: false, // Default for find match

      // Registration form state
      avatar: "",
      gamePreference: "all",
      password: "",

      // Auth state
      currentUser: null,

      // Admin state
      adminFilter: {
        gameType: "all",
        date: new Date().toISOString().split("T")[0],
        status: "all",
      },

      // Mock data
      stations: [
        { id: "1", name: "Pool Table 1", type: "pool", available: true },
        { id: "2", name: "Pool Table 2", type: "pool", available: true },
        { id: "3", name: "Pool Table 3", type: "pool", available: true },
        { id: "4", name: "Pool Table 4", type: "pool", available: true },
        { id: "5", name: "Snooker Table", type: "snooker", available: true },
        { id: "6", name: "PS5 Console", type: "ps5", available: true },
      ],

      timeSlots: [
        { id: "1", start: "14:00", end: "15:00" },
        { id: "2", start: "15:00", end: "16:00" },
        { id: "3", start: "16:00", end: "17:00" },
        { id: "4", start: "17:00", end: "18:00" },
        { id: "5", start: "18:00", end: "19:00" },
        { id: "6", start: "19:00", end: "20:00" },
        { id: "7", start: "20:00", end: "21:00" },
        { id: "8", start: "21:00", end: "22:00" },
        { id: "9", start: "22:00", end: "23:00" },
        { id: "10", start: "23:00", end: "00:00" },
      ],

      users: [
        {
          id: "1",
          name: "Admin User",
          email: "admin@panorama.com",
          phone: "+212612345678",
          gamePreference: "all",
          skillLevel: "competitive",
          isAdmin: true,
          status: "approved",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Mohammed Ali",
          email: "mohammed@example.com",
          phone: "+212612345678",
          avatar: "/placeholder.svg?height=100&width=100",
          gamePreference: "pool",
          skillLevel: "competitive",
          isAdmin: false,
          status: "approved",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Fatima Zahra",
          email: "fatima@example.com",
          phone: "+212698765432",
          gamePreference: "snooker",
          skillLevel: "beginner",
          isAdmin: false,
          status: "approved",
          createdAt: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Youssef Amrani",
          email: "youssef@example.com",
          phone: "+212633445566",
          avatar: "/placeholder.svg?height=100&width=100",
          gamePreference: "ps5",
          skillLevel: "casual",
          isAdmin: false,
          status: "approved",
          createdAt: new Date().toISOString(),
        },
        {
          id: "5",
          name: "Amal Benali",
          email: "amal@example.com",
          phone: "+212677889900",
          gamePreference: "pool",
          skillLevel: "beginner",
          isAdmin: false,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
        {
          id: "6",
          name: "Karim Tazi",
          email: "karim@example.com",
          phone: "+212611223344",
          gamePreference: "ps5",
          skillLevel: "competitive",
          isAdmin: false,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      ],

      reservations: [
        // Some sample reservations
        {
          id: "1",
          userId: "2",
          stationId: "1",
          date: new Date().toISOString().split("T")[0],
          timeSlot: { id: "3", start: "12:00", end: "13:00" },
          gameType: "pool",
          playerCount: 2,
          name: "Mohammed Ali",
          email: "mohammed@example.com",
          phone: "+212612345678",
          matchType: "first-to-3",
          isCompetitive: true,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          userId: "3",
          stationId: "5",
          date: new Date().toISOString().split("T")[0],
          timeSlot: { id: "7", start: "16:00", end: "17:00" },
          gameType: "snooker",
          playerCount: 2,
          name: "Fatima Zahra",
          email: "fatima@example.com",
          phone: "+212698765432",
          duration: 60,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          userId: "4",
          stationId: "6",
          date: new Date().toISOString().split("T")[0],
          timeSlot: { id: "10", start: "19:00", end: "20:00" },
          gameType: "ps5",
          playerCount: 4,
          name: "Youssef Amrani",
          email: "youssef@example.com",
          phone: "+212633445566",
          duration: 60,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
        {
          id: "4",
          stationId: "2",
          date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
          timeSlot: { id: "5", start: "14:00", end: "15:00" },
          gameType: "pool",
          playerCount: 2,
          name: "Hassan Benjelloun",
          email: "hassan@example.com",
          phone: "+212611223344",
          matchType: "first-to-5",
          isCompetitive: false,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
        {
          id: "5",
          stationId: "7",
          date: new Date(Date.now() - 86400000).toISOString().split("T")[0], // Yesterday
          timeSlot: { id: "8", start: "17:00", end: "18:00" },
          gameType: "ps5",
          playerCount: 2,
          name: "Leila Benkirane",
          email: "leila@example.com",
          phone: "+212655667788",
          duration: 90,
          status: "completed",
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        },
      ],

      waitingPlayers: [
        {
          id: "1",
          userId: "2",
          name: "Mohammed Ali",
          gameType: "pool",
          skillLevel: "competitive",
          timeRange: "now",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          userId: "3",
          name: "Fatima Zahra",
          gameType: "snooker",
          skillLevel: "beginner",
          timeRange: "30min",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          userId: "4",
          name: "Youssef Amrani",
          gameType: "ps5",
          skillLevel: "casual",
          timeRange: "60min",
          createdAt: new Date().toISOString(),
        },
      ],

      matches: [
        {
          id: "1",
          creatorId: "2",
          creatorName: "Mohammed Ali",
          gameType: "pool",
          skillLevel: "competitive",
          date: new Date().toISOString().split("T")[0],
          timeSlot: { id: "4", start: "13:00", end: "14:00" },
          stationId: "1",
          playerCount: 1,
          maxPlayers: 2,
          players: ["2"],
          matchType: "first-to-5",
          isCompetitive: true,
          status: "open",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          creatorId: "3",
          creatorName: "Fatima Zahra",
          gameType: "snooker",
          skillLevel: "beginner",
          date: new Date().toISOString().split("T")[0],
          timeSlot: { id: "8", start: "17:00", end: "18:00" },
          stationId: "5",
          playerCount: 1,
          maxPlayers: 2,
          players: ["3"],
          duration: 60,
          status: "open",
          createdAt: new Date().toISOString(),
        },
      ],

      queues: [
        {
          id: "1",
          userId: "4",
          name: "Youssef Amrani",
          email: "youssef@example.com",
          phone: "+212633445566",
          gameType: "pool",
          playerCount: 2,
          date: new Date().toISOString().split("T")[0],
          preferredTimeSlot: { id: "5", start: "14:00", end: "15:00" },
          estimatedWaitTime: 45,
          position: 1,
          priority: "normal",
          status: "waiting",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Ahmed Khalid",
          email: "ahmed@example.com",
          phone: "+212611223344",
          gameType: "snooker",
          playerCount: 1,
          date: new Date().toISOString().split("T")[0],
          estimatedWaitTime: 30,
          position: 1,
          priority: "normal",
          status: "waiting",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Layla Mansour",
          email: "layla@example.com",
          phone: "+212655667788",
          gameType: "ps5",
          playerCount: 4,
          date: new Date().toISOString().split("T")[0],
          preferredTimeSlot: { id: "9", start: "18:00", end: "19:00" },
          estimatedWaitTime: 60,
          position: 1,
          priority: "high",
          status: "notified",
          notifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],

      showQueueJoinModal: false,
      queueNotifications: [
        {
          id: "1",
          message: "Your turn in the pool table queue is approaching. Please check in at the reception.",
          read: false,
        },
      ],

      // Actions - Reservation
      setSelectedGameType: (gameType) => set({ selectedGameType: gameType }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedTimeSlot: (timeSlot) => set({ selectedTimeSlot: timeSlot }),
      setPlayerCount: (count) => set({ playerCount: count }),
      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
      setPhone: (phone) => set({ phone }),
      setDuration: (duration) => set({ duration }),
      setMatchType: (matchType) => set({ matchType }),
      setIsCompetitive: (isCompetitive) => set({ isCompetitive }),
      setSkillLevel: (skillLevel) => set({ skillLevel }),
      setTimeRange: (timeRange) => set({ timeRange }),
      setIsWaitingForPlayer: (isWaiting) => set({ isWaitingForPlayer: isWaiting }),

      resetForm: () =>
        set({
          selectedGameType: null,
          selectedDate: null,
          selectedTimeSlot: null,
          playerCount: 2,
          name: "",
          email: "",
          phone: "",
          duration: 30,
          matchType: "first-to-3",
          isCompetitive: false,
          skillLevel: "casual",
          timeRange: "now",
          avatar: "",
          gamePreference: "all",
          password: "",
        }),

      createReservation: () => {
        const state = get()

        if (!state.selectedGameType || !state.selectedDate || !state.selectedTimeSlot) {
          return
        }

        // Check if user is approved
        if (state.currentUser && state.currentUser.status !== "approved") {
          return false
        }

        // Find an available station of the selected type
        const availableStations = get().getAvailableStations(
          state.selectedGameType,
          state.selectedDate,
          state.selectedTimeSlot.id,
        )

        // If no stations are available, show queue option
        if (availableStations.length === 0) {
          // Set flag to show queue join modal
          set({ showQueueJoinModal: true })
          return false
        }

        const newReservation: Reservation = {
          id: Date.now().toString(),
          userId: state.currentUser?.id,
          stationId: availableStations[0].id,
          date: state.selectedDate,
          timeSlot: state.selectedTimeSlot,
          gameType: state.selectedGameType,
          playerCount: state.playerCount,
          name: state.currentUser?.name || state.name,
          email: state.currentUser?.email || state.email,
          phone: state.currentUser?.phone || state.phone,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        }

        // Add game-specific properties
        if (state.selectedGameType === "ps5" || state.selectedGameType === "snooker") {
          newReservation.duration = state.duration
        }

        if (state.selectedGameType === "pool") {
          newReservation.matchType = state.matchType
          newReservation.isCompetitive = state.isCompetitive
        }

        set((state) => ({
          reservations: [...state.reservations, newReservation],
        }))

        // Check if this reservation fulfills a queue entry
        const queueEntries = get().queues.filter(
          q => q.gameType === state.selectedGameType &&
               q.date === state.selectedDate &&
               (q.status === "waiting" || q.status === "notified" || q.status === "processing")
        )

        // If there's a queue entry being processed, mark it as completed
        if (queueEntries.length > 0 && queueEntries[0].status === "processing") {
          get().completeQueueEntry(queueEntries[0].id)
        }

        // Reset form after successful reservation
        get().resetForm()

        return true
      },

      // Actions - Waiting Players
      addWaitingPlayer: () => {
        const state = get()

        if (!state.selectedGameType || !state.name) {
          return false
        }

        // Check if user is approved
        if (state.currentUser && state.currentUser.status !== "approved") {
          return false
        }

        const newWaitingPlayer: WaitingPlayer = {
          id: Date.now().toString(),
          userId: state.currentUser?.id,
          name: state.currentUser?.name || state.name,
          gameType: state.selectedGameType,
          skillLevel: state.skillLevel,
          timeRange: state.timeRange,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          waitingPlayers: [...state.waitingPlayers, newWaitingPlayer],
          isWaitingForPlayer: true,
        }))

        return true
      },

      removeWaitingPlayer: (id) => {
        set((state) => ({
          waitingPlayers: state.waitingPlayers.filter((player) => player.id !== id),
          isWaitingForPlayer: false,
        }))
      },

      // Actions - Matches
      createMatch: () => {
        const state = get()

        if (!state.selectedGameType || !state.selectedDate || !state.selectedTimeSlot || !state.currentUser) {
          return null
        }

        // Check if user is approved
        if (state.currentUser.status !== "approved") {
          return null
        }

        // Find an available station of the selected type
        const availableStations = get().getAvailableStations(
          state.selectedGameType,
          state.selectedDate,
          state.selectedTimeSlot.id,
        )

        if (availableStations.length === 0) {
          return null
        }

        // Determine max players based on game type
        let maxPlayers = 2 // Default for most games
        if (state.selectedGameType === "ps5") {
          maxPlayers = 4 // PS5 can have up to 4 players
        }

        const newMatch: Match = {
          id: Date.now().toString(),
          creatorId: state.currentUser.id,
          creatorName: state.currentUser.name,
          gameType: state.selectedGameType,
          skillLevel: state.skillLevel,
          date: state.selectedDate,
          timeSlot: state.selectedTimeSlot,
          stationId: availableStations[0].id,
          playerCount: 1, // Creator is the first player
          maxPlayers: maxPlayers,
          players: [state.currentUser.id],
          status: "open",
          createdAt: new Date().toISOString(),
        }

        // Add game-specific properties
        if (state.selectedGameType === "ps5" || state.selectedGameType === "snooker") {
          newMatch.duration = state.duration
        }

        if (state.selectedGameType === "pool") {
          newMatch.matchType = state.matchType
          newMatch.isCompetitive = state.isCompetitive
        }

        set((state) => ({
          matches: [...state.matches, newMatch],
        }))

        return newMatch.id
      },

      joinMatch: (matchId) => {
        const state = get()
        const match = state.matches.find((m) => m.id === matchId)

        if (!match || !state.currentUser) {
          return false
        }

        // Check if user is approved
        if (state.currentUser.status !== "approved") {
          return false
        }

        // Check if match is open
        if (match.status !== "open") {
          return false
        }

        // Check if match is full
        if (match.playerCount >= match.maxPlayers) {
          return false
        }

        // Check if user is already in the match
        if (match.players.includes(state.currentUser.id)) {
          return false
        }

        // Update the match
        set((state) => ({
          matches: state.matches.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  playerCount: m.playerCount + 1,
                  players: [...m.players, state.currentUser!.id],
                  status: m.playerCount + 1 >= m.maxPlayers ? "in_progress" : "open"
                }
              : m
          ),
        }))

        // Update the waiting player if they were waiting
        const waitingPlayer = state.waitingPlayers.find((player) => player.userId === state.currentUser?.id)
        if (waitingPlayer) {
          set((state) => ({
            waitingPlayers: state.waitingPlayers.map((player) =>
              player.id === waitingPlayer.id ? { ...player, matchId: matchId } : player
            ),
          }))
        }

        return true
      },

      leaveMatch: (matchId, userId) => {
        const match = get().matches.find((m) => m.id === matchId)

        if (!match) {
          return
        }

        // Check if user is in the match
        if (!match.players.includes(userId)) {
          return
        }

        // If the creator leaves, cancel the match
        if (match.creatorId === userId) {
          set((state) => ({
            matches: state.matches.map((m) =>
              m.id === matchId ? { ...m, status: "cancelled" } : m
            ),
          }))
          return
        }

        // Otherwise, just remove the player
        set((state) => ({
          matches: state.matches.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  playerCount: m.playerCount - 1,
                  players: m.players.filter((id) => id !== userId),
                  status: "open" // Reset to open if it was in progress
                }
              : m
          ),
        }))

        // Update the waiting player if they were in a match
        const waitingPlayer = get().waitingPlayers.find((player) => player.userId === userId)
        if (waitingPlayer && waitingPlayer.matchId === matchId) {
          set((state) => ({
            waitingPlayers: state.waitingPlayers.map((player) =>
              player.id === waitingPlayer.id ? { ...player, matchId: undefined } : player
            ),
          }))
        }
      },

      getMatchById: (matchId) => {
        return get().matches.find((match) => match.id === matchId)
      },

      getMatchesByGameType: (gameType) => {
        if (!gameType) {
          return get().matches.filter((match) => match.status === "open")
        }
        return get().matches.filter((match) => match.gameType === gameType && match.status === "open")
      },

      updateMatchStatus: (matchId, status) => {
        set((state) => ({
          matches: state.matches.map((match) =>
            match.id === matchId ? { ...match, status } : match
          ),
        }))
      },

      // Actions - Registration & Auth
      setAvatar: (avatar) => set({ avatar }),
      setGamePreference: (preference) => set({ gamePreference: preference }),
      setPassword: (password) => set({ password }),

      register: () => {
        const state = get()

        if (!state.name || !state.email || !state.phone || !state.password) {
          return false
        }

        // Check if email already exists
        const emailExists = state.users.some((user) => user.email === state.email)
        if (emailExists) {
          return false
        }

        const newUser: User = {
          id: Date.now().toString(),
          name: state.name,
          email: state.email,
          phone: state.phone,
          avatar: state.avatar || undefined,
          gamePreference: state.gamePreference,
          skillLevel: state.skillLevel,
          isAdmin: false,
          status: "pending", // Set status to pending by default
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          users: [...state.users, newUser],
        }))

        // Reset form after successful registration
        get().resetForm()

        return true
      },

      login: (email, password) => {
        const state = get()

        // In a real app, we would hash passwords and compare hashes
        // For this mock, we'll just check if the user exists with the given email
        const user = state.users.find((user) => user.email === email)

        if (user) {
          // Only allow login for approved users and admins
          if (user.status === "approved" || user.isAdmin) {
            set({ currentUser: user })
            return true
          }
        }

        return false
      },

      logout: () => {
        set({ currentUser: null })
      },

      // Actions - User Management
      approveUser: (userId) => {
        set((state) => ({
          users: state.users.map((user) => (user.id === userId ? { ...user, status: "approved" } : user)),
        }))
      },

      rejectUser: (userId) => {
        set((state) => ({
          users: state.users.map((user) => (user.id === userId ? { ...user, status: "rejected" } : user)),
        }))
      },

      getPendingUsers: () => {
        return get().users.filter((user) => user.status === "pending")
      },

      // Actions - Admin
      setAdminFilter: (filter) => {
        set((state) => ({
          adminFilter: {
            ...state.adminFilter,
            ...filter,
          },
        }))
      },

      updateReservationStatus: (id, status) => {
        set((state) => ({
          reservations: state.reservations.map((reservation) =>
            reservation.id === id ? { ...reservation, status } : reservation,
          ),
        }))
      },

      deleteReservation: (id) => {
        set((state) => ({
          reservations: state.reservations.filter((reservation) => reservation.id !== id),
        }))
      },

      // Getters
      getAvailableStations: (gameType, date, timeSlotId) => {
        const { stations, reservations } = get()

        // Filter stations by game type
        const stationsByType = stations.filter((station) => station.type === gameType)

        // Check which stations are available for the selected date and time slot
        return stationsByType.filter((station) => {
          const isReserved = reservations.some(
            (reservation) =>
              reservation.stationId === station.id &&
              reservation.date === date &&
              reservation.timeSlot.id === timeSlotId &&
              reservation.status === "confirmed",
          )

          return !isReserved
        })
      },

      // Queue Getters
      getQueuesByGameType: (gameType) => {
        if (!gameType) {
          return get().queues
        }
        return get().queues.filter((queue) => queue.gameType === gameType)
      },

      getQueuesByDate: (date) => {
        return get().queues.filter((queue) => queue.date === date)
      },

      getQueuesByStatus: (status) => {
        if (!status) {
          return get().queues
        }
        return get().queues.filter((queue) => queue.status === status)
      },

      getQueueEntryById: (id) => {
        return get().queues.find((queue) => queue.id === id)
      },

      getUserQueueEntries: (userId) => {
        return get().queues.filter((queue) => queue.userId === userId)
      },

      getActiveQueueEntries: () => {
        return get().queues.filter((queue) =>
          queue.status === "waiting" || queue.status === "notified" || queue.status === "processing"
        )
      },

      getQueueStatistics: () => {
        const activeQueues = get().getActiveQueueEntries()

        // Calculate total waiting
        const totalWaiting = activeQueues.length

        // Calculate average wait time
        const waitTimes = activeQueues
          .filter(q => q.estimatedWaitTime !== undefined)
          .map(q => q.estimatedWaitTime as number)

        const averageWaitTime = waitTimes.length > 0
          ? waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length
          : 0

        // Count by game type
        const queuesByGameType = [
          { gameType: "pool" as GameType, count: activeQueues.filter(q => q.gameType === "pool").length },
          { gameType: "snooker" as GameType, count: activeQueues.filter(q => q.gameType === "snooker").length },
          { gameType: "ps5" as GameType, count: activeQueues.filter(q => q.gameType === "ps5").length },
        ]

        return {
          totalWaiting,
          averageWaitTime,
          queuesByGameType,
        }
      },

      getUnreadNotificationsCount: () => {
        return get().queueNotifications.filter(n => !n.read).length
      },

      shouldShowQueueOption: (gameType, date, timeSlotId) => {
        // Check if there are any available stations for this time slot
        const availableStations = get().getAvailableStations(gameType, date, timeSlotId)

        // If no stations are available, show queue option
        return availableStations.length === 0
      },

      getReservationsForDate: (date) => {
        return get().reservations.filter(
          (reservation) => reservation.date === date && reservation.status === "confirmed",
        )
      },

      getWaitingPlayersByGameType: (gameType) => {
        if (!gameType) {
          return get().waitingPlayers
        }
        return get().waitingPlayers.filter((player) => player.gameType === gameType)
      },

      getMaxMatches: (matchType) => {
        switch (matchType) {
          case "first-to-3":
            return 5 // (3*2)-1
          case "first-to-5":
            return 9 // (5*2)-1
          case "first-to-7":
            return 13 // (7*2)-1
          default:
            return 0
        }
      },

      getFilteredReservations: () => {
        const { reservations, adminFilter } = get()

        return reservations.filter((reservation) => {
          // Filter by game type
          if (adminFilter.gameType !== "all" && reservation.gameType !== adminFilter.gameType) {
            return false
          }

          // Filter by date
          if (adminFilter.date && reservation.date !== adminFilter.date) {
            return false
          }

          // Filter by status
          if (adminFilter.status !== "all" && reservation.status !== adminFilter.status) {
            return false
          }

          return true
        })
      },

      getUserReservations: (userId) => {
        return get().reservations.filter((reservation) => reservation.userId === userId)
      },

      getOpenMatches: () => {
        return get().matches.filter((match) => match.status === "open")
      },

      getMatchesByUser: (userId) => {
        return get().matches.filter((match) => match.players.includes(userId))
      },

      // Queue Actions
      setShowQueueJoinModal: (show) => {
        set({ showQueueJoinModal: show })
      },

      addToQueue: (entry) => {
        const id = Date.now().toString()
        const gameTypeQueues = get().queues.filter(q => q.gameType === entry.gameType && q.status === "waiting")
        const position = gameTypeQueues.length + 1

        const newEntry: QueueEntry = {
          ...entry,
          id,
          position,
          status: "waiting",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          queues: [...state.queues, newEntry],
        }))

        // Add notification for the user
        get().addQueueNotification(`You have been added to the ${entry.gameType} queue at position ${position}.`)

        return id
      },

      removeFromQueue: (id) => {
        const queueEntry = get().queues.find(q => q.id === id)
        if (!queueEntry) return

        // Remove the entry
        set((state) => ({
          queues: state.queues.filter(q => q.id !== id),
        }))

        // Reorder positions for remaining entries of the same game type
        const gameTypeQueues = get().queues.filter(
          q => q.gameType === queueEntry.gameType && q.status === "waiting" && q.position > queueEntry.position
        )

        gameTypeQueues.forEach(entry => {
          get().updateQueuePosition(entry.id, entry.position - 1)
        })
      },

      updateQueueEntry: (id, updates) => {
        set((state) => ({
          queues: state.queues.map(q =>
            q.id === id
              ? {
                  ...q,
                  ...updates,
                  updatedAt: new Date().toISOString()
                }
              : q
          ),
        }))
      },

      updateQueuePosition: (id, newPosition) => {
        const queueEntry = get().queues.find(q => q.id === id)
        if (!queueEntry) return

        set((state) => ({
          queues: state.queues.map(q =>
            q.id === id
              ? {
                  ...q,
                  position: newPosition,
                  updatedAt: new Date().toISOString()
                }
              : q
          ),
        }))
      },

      updateQueuePriority: (id, priority) => {
        const queueEntry = get().queues.find(q => q.id === id)
        if (!queueEntry) return

        set((state) => ({
          queues: state.queues.map(q =>
            q.id === id
              ? {
                  ...q,
                  priority,
                  updatedAt: new Date().toISOString()
                }
              : q
          ),
        }))

        // If priority is high or VIP, we might want to adjust position
        if (priority === "high" || priority === "vip") {
          const gameTypeQueues = get().queues.filter(
            q => q.gameType === queueEntry.gameType && q.status === "waiting"
          )

          // Sort by priority (VIP first, then high, then normal)
          const sortedQueues = gameTypeQueues.sort((a, b) => {
            const priorityOrder = { vip: 0, high: 1, normal: 2 }
            return priorityOrder[a.priority] - priorityOrder[b.priority]
          })

          // Reassign positions
          sortedQueues.forEach((q, index) => {
            get().updateQueuePosition(q.id, index + 1)
          })
        }
      },

      notifyQueueEntry: (id) => {
        const queueEntry = get().queues.find(q => q.id === id)
        if (!queueEntry || queueEntry.status !== "waiting") return

        set((state) => ({
          queues: state.queues.map(q =>
            q.id === id
              ? {
                  ...q,
                  status: "notified",
                  notifiedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              : q
          ),
        }))

        // Add notification
        get().addQueueNotification(
          `Your turn for ${queueEntry.gameType} is approaching. Please check in at the reception.`
        )
      },

      markQueueEntryAsProcessing: (id) => {
        const queueEntry = get().queues.find(q => q.id === id)
        if (!queueEntry || (queueEntry.status !== "waiting" && queueEntry.status !== "notified")) return

        set((state) => ({
          queues: state.queues.map(q =>
            q.id === id
              ? {
                  ...q,
                  status: "processing",
                  updatedAt: new Date().toISOString()
                }
              : q
          ),
        }))
      },

      completeQueueEntry: (id) => {
        const queueEntry = get().queues.find(q => q.id === id)
        if (!queueEntry || queueEntry.status === "completed" || queueEntry.status === "cancelled") return

        set((state) => ({
          queues: state.queues.map(q =>
            q.id === id
              ? {
                  ...q,
                  status: "completed",
                  updatedAt: new Date().toISOString()
                }
              : q
          ),
        }))

        // Reorder positions for remaining entries of the same game type
        const gameTypeQueues = get().queues.filter(
          q => q.gameType === queueEntry.gameType && q.status === "waiting" && q.position > queueEntry.position
        )

        gameTypeQueues.forEach(entry => {
          get().updateQueuePosition(entry.id, entry.position - 1)
        })
      },

      cancelQueueEntry: (id) => {
        const queueEntry = get().queues.find(q => q.id === id)
        if (!queueEntry || queueEntry.status === "completed" || queueEntry.status === "cancelled") return

        set((state) => ({
          queues: state.queues.map(q =>
            q.id === id
              ? {
                  ...q,
                  status: "cancelled",
                  updatedAt: new Date().toISOString()
                }
              : q
          ),
        }))

        // Reorder positions for remaining entries of the same game type
        const gameTypeQueues = get().queues.filter(
          q => q.gameType === queueEntry.gameType && q.status === "waiting" && q.position > queueEntry.position
        )

        gameTypeQueues.forEach(entry => {
          get().updateQueuePosition(entry.id, entry.position - 1)
        })
      },

      addQueueNotification: (message) => {
        const id = Date.now().toString()

        set((state) => ({
          queueNotifications: [
            ...state.queueNotifications,
            {
              id,
              message,
              read: false,
            },
          ],
        }))
      },

      markQueueNotificationAsRead: (id) => {
        set((state) => ({
          queueNotifications: state.queueNotifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }))
      },

      clearQueueNotifications: () => {
        set({ queueNotifications: [] })
      },
    }),
    {
      name: "panorama-storage",
    },
  ),
)
