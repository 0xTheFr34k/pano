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
export type PoolTableMode = "queue" | "match"
export type MatchCompletionMethod = "admin" | "player" | "system"
export type PS5Duration = 10 | 30 | 60 | 90 | 120

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
  coordinates?: { x: number; y: number } // For positioning on floor plan
  size?: "standard" | "large"
  status?: "available" | "reserved" | "occupied" | "maintenance"
  currentPlayers?: string[] // IDs of players currently using the station
  currentWinner?: string // ID of the current winner (for snooker)
  winStreak?: number // Current win streak (for snooker and pool)
  isFriendlyMatch?: boolean // Whether this is a friendly match (for snooker)
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
  // Win streak tracking
  snookerWinStreak: number
  snookerMaxWinStreak: number
  poolWinStreak: number
  poolMaxWinStreak: number
  achievements: {
    snookerStreak5: boolean
    snookerStreak10: boolean
    snookerStreak20: boolean
    poolStreak5: boolean
    poolStreak10: boolean
    poolStreak20: boolean
  }
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
  notes?: string
  assignedByAdmin?: boolean
  createdAt: string
  updatedAt?: string
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
  assignedStationId?: string // For when a specific table is assigned
  requiresAccount?: boolean // Whether the guest needs to create an account
  createdAt: string
  updatedAt: string
  // For snooker queue system
  isCurrentlyPlaying?: boolean
  isWinner?: boolean
  consecutiveWins?: number
  lastOpponentId?: string
  // For pool queue system
  preferredTableId?: string
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
  skillLevel: SkillLevel

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

  // Game station management state
  poolTableMode: PoolTableMode // Current mode for pool tables
  matchLogs: {
    id: string
    matchId: string
    stationId: string
    gameType: GameType
    completedAt: string
    completionMethod: MatchCompletionMethod
    matchDuration: number
    winnerId?: string
    loserId?: string
    isFriendlyMatch: boolean
  }[]

  // Mock data
  stations: Station[]
  timeSlots: TimeSlot[]
  reservations: Reservation[]
  users: User[]
  queues: QueueEntry[]

  // Queue state
  showQueueJoinModal: boolean
  queueNotifications: { id: string; message: string; read: boolean }[]

  // Reservation success state
  showSuccessModal: boolean
  lastReservation: Reservation | null

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
  resetForm: () => void
  createReservation: () => void



  // Actions - Game Station Management
  setPoolTableMode: (mode: PoolTableMode) => void
  getPoolTableMode: () => PoolTableMode
  markMatchAsComplete: (stationId: string, winnerId?: string, method?: MatchCompletionMethod) => void
  startFriendlyMatch: (stationId: string, playerIds: string[]) => void
  endFriendlyMatch: (stationId: string) => void
  updateWinStreak: (userId: string, gameType: GameType, isWin: boolean) => void
  getNextPlayerInQueue: (gameType: GameType) => QueueEntry | null
  pairPlayersForMatch: (gameType: GameType, stationId: string) => void
  handleNoShow: (reservationId: string) => void

  // Actions - Queue
  setShowQueueJoinModal: (show: boolean) => void
  setShowSuccessModal: (show: boolean) => void
  addToQueue: (entry: Omit<QueueEntry, "id" | "position" | "status" | "createdAt" | "updatedAt">) => string
  addGuestToQueue: (entry: Omit<QueueEntry, "id" | "position" | "status" | "createdAt" | "updatedAt" | "userId">) => string
  removeFromQueue: (id: string) => void
  updateQueueEntry: (id: string, updates: Partial<QueueEntry>) => void
  updateQueuePosition: (id: string, newPosition: number) => void
  updateQueuePriority: (id: string, priority: QueuePriority) => void
  notifyQueueEntry: (id: string) => void
  markQueueEntryAsProcessing: (id: string) => void
  completeQueueEntry: (id: string) => void
  cancelQueueEntry: (id: string) => void
  assignTableToQueueEntry: (queueId: string, stationId: string) => void
  moveQueueEntryToReservation: (queueId: string, stationId: string) => string
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
  assignTableToReservation: (reservationId: string, stationId: string) => void
  updateStationStatus: (stationId: string, status: Station["status"]) => void
  createAdminReservation: (reservation: Omit<Reservation, "id" | "createdAt">) => string

  // Getters
  getAvailableStations: (gameType: GameType, date: string, timeSlotId: string) => Station[]
  getReservationsForDate: (date: string) => Reservation[]
  getMaxMatches: (matchType: MatchType) => number
  getFilteredReservations: () => Reservation[]
  getUserReservations: (userId: string) => Reservation[]

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

  // Game Station Management Getters
  getCurrentPlayersOnStation: (stationId: string) => string[]
  getCurrentWinnerOnStation: (stationId: string) => string | undefined
  getWinStreakForStation: (stationId: string) => number
  getWinStreakForUser: (userId: string, gameType: GameType) => number
  getMaxWinStreakForUser: (userId: string, gameType: GameType) => number
  getUserAchievements: (userId: string) => User["achievements"]
  getMatchLogs: (stationId?: string, gameType?: GameType) => StoreState["matchLogs"]
  getEstimatedWaitTimeForGameType: (gameType: GameType) => number
  getNextQueuedPlayers: (gameType: GameType, count: number) => QueueEntry[]
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
      skillLevel: "casual",

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

      // Game station management state
      poolTableMode: "queue", // Default mode for pool tables
      matchLogs: [],

      // Mock data
      stations: [
        {
          id: "1",
          name: "Pool Table 1",
          type: "pool",
          available: true,
          status: "available",
          coordinates: { x: 10, y: 10 },
          size: "standard",
          currentPlayers: [],
          winStreak: 0
        },
        {
          id: "2",
          name: "Pool Table 2",
          type: "pool",
          available: true,
          status: "available",
          coordinates: { x: 10, y: 120 },
          size: "standard",
          currentPlayers: [],
          winStreak: 0
        },
        {
          id: "3",
          name: "Pool Table 3",
          type: "pool",
          available: true,
          status: "available",
          coordinates: { x: 150, y: 10 },
          size: "standard",
          currentPlayers: [],
          winStreak: 0
        },
        {
          id: "4",
          name: "Pool Table 4",
          type: "pool",
          available: true,
          status: "available",
          coordinates: { x: 150, y: 120 },
          size: "standard",
          currentPlayers: [],
          winStreak: 0
        },
        {
          id: "5",
          name: "Pool Table 5",
          type: "pool",
          available: true,
          status: "available",
          coordinates: { x: 290, y: 10 },
          size: "standard"
        },
        {
          id: "6",
          name: "Pool Table 6",
          type: "pool",
          available: true,
          status: "available",
          coordinates: { x: 290, y: 120 },
          size: "standard"
        },
        {
          id: "7",
          name: "Pool Table 7",
          type: "pool",
          available: true,
          status: "available",
          coordinates: { x: 430, y: 10 },
          size: "standard"
        },
        {
          id: "8",
          name: "Pool Table 8",
          type: "pool",
          available: true,
          status: "available",
          coordinates: { x: 430, y: 120 },
          size: "standard"
        },
        {
          id: "9",
          name: "Snooker Table",
          type: "snooker",
          available: true,
          status: "available",
          coordinates: { x: 10, y: 230 },
          size: "large",
          currentPlayers: [],
          currentWinner: undefined,
          winStreak: 0,
          isFriendlyMatch: false
        },
        {
          id: "10",
          name: "PS5 Console",
          type: "ps5",
          available: true,
          status: "available",
          coordinates: { x: 150, y: 230 },
          size: "standard",
          currentPlayers: []
        },
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
          snookerWinStreak: 0,
          snookerMaxWinStreak: 0,
          poolWinStreak: 0,
          poolMaxWinStreak: 0,
          achievements: {
            snookerStreak5: false,
            snookerStreak10: false,
            snookerStreak20: false,
            poolStreak5: false,
            poolStreak10: false,
            poolStreak20: false,
          },
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
          snookerWinStreak: 0,
          snookerMaxWinStreak: 0,
          poolWinStreak: 3,
          poolMaxWinStreak: 7,
          achievements: {
            snookerStreak5: false,
            snookerStreak10: false,
            snookerStreak20: false,
            poolStreak5: true,
            poolStreak10: false,
            poolStreak20: false,
          },
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
          snookerWinStreak: 2,
          snookerMaxWinStreak: 5,
          poolWinStreak: 0,
          poolMaxWinStreak: 2,
          achievements: {
            snookerStreak5: true,
            snookerStreak10: false,
            snookerStreak20: false,
            poolStreak5: false,
            poolStreak10: false,
            poolStreak20: false,
          },
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
          snookerWinStreak: 0,
          snookerMaxWinStreak: 0,
          poolWinStreak: 0,
          poolMaxWinStreak: 0,
          achievements: {
            snookerStreak5: false,
            snookerStreak10: false,
            snookerStreak20: false,
            poolStreak5: false,
            poolStreak10: false,
            poolStreak20: false,
          },
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
          snookerWinStreak: 0,
          snookerMaxWinStreak: 0,
          poolWinStreak: 0,
          poolMaxWinStreak: 0,
          achievements: {
            snookerStreak5: false,
            snookerStreak10: false,
            snookerStreak20: false,
            poolStreak5: false,
            poolStreak10: false,
            poolStreak20: false,
          },
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
          snookerWinStreak: 0,
          snookerMaxWinStreak: 0,
          poolWinStreak: 0,
          poolMaxWinStreak: 0,
          achievements: {
            snookerStreak5: false,
            snookerStreak10: false,
            snookerStreak20: false,
            poolStreak5: false,
            poolStreak10: false,
            poolStreak20: false,
          },
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
          avatar: "",
          gamePreference: "all",
          password: "",
          // Reset success modal state
          showSuccessModal: false,
          lastReservation: null
        }),

      createReservation: () => {
        console.log("🔵 createReservation function called")
        const state = get()

        if (!state.selectedGameType || !state.selectedDate || !state.selectedTimeSlot) {
          return
        }

        // Check if user is approved
        if (state.currentUser && state.currentUser.status !== "approved") {
          return false
        }

        // Find an available station of the selected type
        let availableStations = []

        // For PS5 with dynamic time slots, we handle availability differently
        if (state.selectedGameType === "ps5") {
          // For dynamic time slots, we've already checked availability in the selector
          // Just get any PS5 station
          availableStations = get().stations.filter(s => s.type === "ps5")
        } else {
          // For other game types, use the standard availability check
          availableStations = get().getAvailableStations(
            state.selectedGameType,
            state.selectedDate,
            state.selectedTimeSlot.id,
          )
        }

        // If no stations are available, show queue option
        if (availableStations.length === 0) {
          // Set flag to show queue join modal
          set({ showQueueJoinModal: true })
          return false
        }

        // Create the reservation
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

        // Add the reservation and set success modal state in a single operation
        set((state) => ({
          reservations: [...state.reservations, newReservation],
          lastReservation: newReservation,
          showSuccessModal: true,
          selectedTimeSlot: null
        }))

        // Refresh time slots for the date of the new reservation
        get().refreshTimeSlots(newReservation.date)

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

        // Don't reset the form immediately - we need to keep the lastReservation
        // We'll reset it after the success modal is closed

        return true
      },











      updateWinStreak: (userId, gameType, isWin) => {
        const user = get().users.find(u => u.id === userId)
        if (!user) return

        if (gameType === "snooker") {
          // Update snooker win streak
          const newStreak = isWin ? user.snookerWinStreak + 1 : 0
          const newMaxStreak = Math.max(user.snookerMaxWinStreak, newStreak)

          // Check for achievements
          const achievements = { ...user.achievements }
          if (newStreak >= 5) achievements.snookerStreak5 = true
          if (newStreak >= 10) achievements.snookerStreak10 = true
          if (newStreak >= 20) achievements.snookerStreak20 = true

          set((state) => ({
            users: state.users.map((u) =>
              u.id === userId ? {
                ...u,
                snookerWinStreak: newStreak,
                snookerMaxWinStreak: newMaxStreak,
                achievements
              } : u
            ),
          }))
        } else if (gameType === "pool") {
          // Update pool win streak
          const newStreak = isWin ? user.poolWinStreak + 1 : 0
          const newMaxStreak = Math.max(user.poolMaxWinStreak, newStreak)

          // Check for achievements
          const achievements = { ...user.achievements }
          if (newStreak >= 5) achievements.poolStreak5 = true
          if (newStreak >= 10) achievements.poolStreak10 = true
          if (newStreak >= 20) achievements.poolStreak20 = true

          set((state) => ({
            users: state.users.map((u) =>
              u.id === userId ? {
                ...u,
                poolWinStreak: newStreak,
                poolMaxWinStreak: newMaxStreak,
                achievements
              } : u
            ),
          }))
        }
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

      // Actions - Game Station Management
      setPoolTableMode: (mode) => {
        set({ poolTableMode: mode })

        // Add notification about mode change
        const modeText = mode === "queue" ? "Queue-Based (Auto-Pair)" : "Match-Based"
        get().addQueueNotification(`Pool tables mode changed to ${modeText} Mode`)
      },

      getPoolTableMode: () => {
        return get().poolTableMode
      },

      markMatchAsComplete: (stationId, winnerId, method = "admin") => {
        const station = get().stations.find(s => s.id === stationId)
        if (!station) return

        // Update station status and current players
        set((state) => ({
          stations: state.stations.map((s) =>
            s.id === stationId ? {
              ...s,
              status: "available",
              currentPlayers: [],
              currentWinner: winnerId,
              winStreak: winnerId ? (s.winStreak || 0) + 1 : 0,
              isFriendlyMatch: false
            } : s
          ),
        }))

        // If this is a snooker table, check if there are players in queue
        if (station.type === "snooker") {
          const nextPlayer = get().getNextPlayerInQueue("snooker")

          if (nextPlayer && winnerId) {
            // Pair the winner with the next player in queue
            get().pairPlayersForMatch("snooker", stationId)
          }
        }
      },

      startFriendlyMatch: (stationId, playerIds) => {
        const station = get().stations.find(s => s.id === stationId)
        if (!station || station.type !== "snooker") return

        // Update station for friendly match
        set((state) => ({
          stations: state.stations.map((s) =>
            s.id === stationId ? {
              ...s,
              status: "occupied",
              currentPlayers: playerIds,
              isFriendlyMatch: true
            } : s
          ),
        }))

        // Add notification
        get().addQueueNotification(`Friendly match started on ${station.name}`)
      },

      endFriendlyMatch: (stationId) => {
        const station = get().stations.find(s => s.id === stationId)
        if (!station || !station.isFriendlyMatch) return

        // Reset the station
        set((state) => ({
          stations: state.stations.map((s) =>
            s.id === stationId ? {
              ...s,
              status: "available",
              currentPlayers: [],
              isFriendlyMatch: false
            } : s
          ),
        }))

        // Add notification
        get().addQueueNotification(`Friendly match ended on ${station.name}`)

        // Check if there are players in queue
        const nextPlayer = get().getNextPlayerInQueue("snooker")
        if (nextPlayer) {
          // Start a new match with players from queue
          get().pairPlayersForMatch("snooker", stationId)
        }
      },

      getNextPlayerInQueue: (gameType) => {
        const queues = get().queues.filter(q =>
          q.gameType === gameType &&
          q.status === "waiting" &&
          !q.isCurrentlyPlaying
        )

        // Sort by priority and position
        const sortedQueues = [...queues].sort((a, b) => {
          const priorityOrder = { vip: 0, high: 1, normal: 2 }
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]

          if (priorityDiff !== 0) return priorityDiff
          return a.position - b.position
        })

        return sortedQueues.length > 0 ? sortedQueues[0] : null
      },

      handleNoShow: (reservationId) => {
        const reservation = get().reservations.find(r => r.id === reservationId)
        if (!reservation || reservation.status !== "confirmed") return

        // Mark reservation as no-show
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === reservationId ? {
              ...r,
              status: "no-show",
              updatedAt: new Date().toISOString()
            } : r
          ),
        }))

        // Make the station available
        set((state) => ({
          stations: state.stations.map((s) =>
            s.id === reservation.stationId ? {
              ...s,
              status: "available",
              currentPlayers: []
            } : s
          ),
        }))

        // Check if there are players in queue for this game type
        const nextPlayer = get().getNextPlayerInQueue(reservation.gameType)
        if (nextPlayer) {
          // Notify the next player
          set((state) => ({
            queues: state.queues.map((q) =>
              q.id === nextPlayer.id ? {
                ...q,
                status: "notified",
                notifiedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              } : q
            ),
          }))

          // Add notification
          get().addQueueNotification(`${reservation.name} didn't show up. ${nextPlayer.name} has been notified that a station is available.`)
        } else {
          // Add notification
          get().addQueueNotification(`${reservation.name} didn't show up. Station ${reservation.stationId} is now available.`)
        }
      },

      pairPlayersForMatch: (gameType, stationId) => {
        const station = get().stations.find(s => s.id === stationId)
        if (!station || station.status !== "available") return

        if (gameType === "snooker") {
          // For snooker, we need to check if there's a current winner
          const currentWinner = station.currentWinner
          const nextPlayer = get().getNextPlayerInQueue("snooker")

          if (!nextPlayer) return

          // If there's a current winner, pair them with the next player
          if (currentWinner) {
            const winnerUser = get().users.find(u => u.id === currentWinner)
            const playerIds = [currentWinner, nextPlayer.userId].filter(Boolean) as string[]

            // Update station
            set((state) => ({
              stations: state.stations.map((s) =>
                s.id === stationId ? {
                  ...s,
                  status: "occupied",
                  currentPlayers: playerIds
                } : s
              ),
            }))

            // Update queue entry
            set((state) => ({
              queues: state.queues.map((q) =>
                q.id === nextPlayer.id ? {
                  ...q,
                  status: "processing",
                  isCurrentlyPlaying: true,
                  assignedStationId: stationId,
                  updatedAt: new Date().toISOString()
                } : q
              ),
            }))



            // Add notification
            get().addQueueNotification(`Match started on ${station.name}: ${winnerUser?.name || "Current Winner"} vs ${nextPlayer.name}`)
          } else {
            // If there's no current winner, we need two players from the queue
            const nextPlayer2 = get().queues.find(q =>
              q.gameType === "snooker" &&
              q.status === "waiting" &&
              !q.isCurrentlyPlaying &&
              q.id !== nextPlayer.id
            )

            if (nextPlayer2) {
              const playerIds = [nextPlayer.userId, nextPlayer2.userId].filter(Boolean) as string[]

              // Update station
              set((state) => ({
                stations: state.stations.map((s) =>
                  s.id === stationId ? {
                    ...s,
                    status: "occupied",
                    currentPlayers: playerIds
                  } : s
                ),
              }))

              // Update queue entries
              set((state) => ({
                queues: state.queues.map((q) =>
                  q.id === nextPlayer.id || q.id === nextPlayer2.id ? {
                    ...q,
                    status: "processing",
                    isCurrentlyPlaying: true,
                    assignedStationId: stationId,
                    updatedAt: new Date().toISOString()
                  } : q
                ),
              }))



              // Add notification
              get().addQueueNotification(`Match started on ${station.name}: ${nextPlayer.name} vs ${nextPlayer2.name}`)
            } else {
              // Only one player in queue, start a friendly match if they want
              set((state) => ({
                queues: state.queues.map((q) =>
                  q.id === nextPlayer.id ? {
                    ...q,
                    status: "processing",
                    isCurrentlyPlaying: true,
                    assignedStationId: stationId,
                    updatedAt: new Date().toISOString()
                  } : q
                ),
              }))

              // Add notification
              get().addQueueNotification(`${nextPlayer.name} is waiting for an opponent on ${station.name}`)
            }
          }
        } else if (gameType === "pool") {
          // For pool tables in queue mode, we need to pair players
          if (get().poolTableMode === "queue") {
            const nextPlayer = get().getNextPlayerInQueue("pool")

            if (!nextPlayer) return

            // Check if there's a second player
            const nextPlayer2 = get().queues.find(q =>
              q.gameType === "pool" &&
              q.status === "waiting" &&
              !q.isCurrentlyPlaying &&
              q.id !== nextPlayer.id
            )

            if (nextPlayer2) {
              const playerIds = [nextPlayer.userId, nextPlayer2.userId].filter(Boolean) as string[]

              // Update station
              set((state) => ({
                stations: state.stations.map((s) =>
                  s.id === stationId ? {
                    ...s,
                    status: "occupied",
                    currentPlayers: playerIds
                  } : s
                ),
              }))

              // Update queue entries
              set((state) => ({
                queues: state.queues.map((q) =>
                  q.id === nextPlayer.id || q.id === nextPlayer2.id ? {
                    ...q,
                    status: "processing",
                    isCurrentlyPlaying: true,
                    assignedStationId: stationId,
                    updatedAt: new Date().toISOString()
                  } : q
                ),
              }))



              // Add notification
              get().addQueueNotification(`Match started on ${station.name}: ${nextPlayer.name} vs ${nextPlayer2.name}`)
            } else {
              // Only one player in queue, they'll have to wait
              set((state) => ({
                queues: state.queues.map((q) =>
                  q.id === nextPlayer.id ? {
                    ...q,
                    status: "processing",
                    assignedStationId: stationId,
                    updatedAt: new Date().toISOString()
                  } : q
                ),
              }))

              // Add notification
              get().addQueueNotification(`${nextPlayer.name} is waiting for an opponent on ${station.name}`)
            }
          }
        }
      },

      updateReservationStatus: (id, status) => {
        // Get the reservation before updating
        const reservation = get().reservations.find(r => r.id === id)
        if (!reservation) return

        // Update the reservation status
        set((state) => ({
          reservations: state.reservations.map((reservation) =>
            reservation.id === id ? {
              ...reservation,
              status,
              updatedAt: new Date().toISOString()
            } : reservation,
          ),
        }))

        // If the reservation was cancelled, refresh time slots for that date
        if (status === "cancelled" && reservation.date) {
          // Refresh time slots for the date of the cancelled reservation
          get().refreshTimeSlots(reservation.date)
        }
      },

      deleteReservation: (id) => {
        set((state) => ({
          reservations: state.reservations.filter((reservation) => reservation.id !== id),
        }))
      },

      assignTableToReservation: (reservationId, stationId) => {
        set((state) => ({
          reservations: state.reservations.map((reservation) =>
            reservation.id === reservationId ? {
              ...reservation,
              stationId,
              assignedByAdmin: true,
              updatedAt: new Date().toISOString()
            } : reservation,
          ),
        }))
      },

      updateStationStatus: (stationId, status) => {
        set((state) => ({
          stations: state.stations.map((station) =>
            station.id === stationId ? {
              ...station,
              status
            } : station,
          ),
        }))
      },

      createAdminReservation: (reservation) => {
        const id = Date.now().toString()

        const newReservation: Reservation = {
          ...reservation,
          id,
          assignedByAdmin: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          reservations: [...state.reservations, newReservation],
        }))

        return id
      },

      // Generate dynamic time slots for PS5 based on duration
      // Refresh all time slots for a specific date
      refreshTimeSlots: (date: string) => {
        if (!date) return

        // Force refresh of time slots for different durations
        get().getDynamicPS5TimeSlots(date, 10)
        get().getDynamicPS5TimeSlots(date, 30)
        get().getDynamicPS5TimeSlots(date, 60)
        get().getDynamicPS5TimeSlots(date, 120)

        // For pool and snooker, we don't need to refresh separately
        // as they use fixed time slots that are filtered based on reservations
      },

      getDynamicPS5TimeSlots: (date: string, duration: number = 10) => {
        const { timeSlots, reservations } = get()

        // Create a map of all PS5 stations
        const ps5Stations = get().stations.filter(s => s.type === "ps5")
        if (ps5Stations.length === 0) return []

        // For simplicity, we'll use the first PS5 station for availability checks
        const stationId = ps5Stations[0].id

        // Create dynamic time slots
        const dynamicSlots: TimeSlot[] = []

        // Get current time for today's slots
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const isToday = date === today

        // Calculate the buffer time (2 minutes after current time)
        let startTimeMinutes = 0

        if (isToday) {
          const currentHour = now.getHours()
          const currentMinute = now.getMinutes()
          startTimeMinutes = currentHour * 60 + currentMinute + 2 // 2-minute buffer
        } else {
          // For future dates, start at the beginning of the day
          startTimeMinutes = 0
        }

        // Get the business hours from the standard time slots
        let businessStartMinutes = 24 * 60 // Default to end of day
        let businessEndMinutes = 0 // Default to start of day

        timeSlots.forEach(slot => {
          const [startHour, startMinute] = slot.start.split(':').map(Number)
          const [endHour, endMinute] = slot.end.split(':').map(Number)

          const slotStartMinutes = startHour * 60 + startMinute
          const slotEndMinutes = endHour * 60 + endMinute

          businessStartMinutes = Math.min(businessStartMinutes, slotStartMinutes)
          businessEndMinutes = Math.max(businessEndMinutes, slotEndMinutes)
        })

        // If today, ensure we start after the current time + buffer
        if (isToday) {
          businessStartMinutes = Math.max(businessStartMinutes, startTimeMinutes)

          // If current time is after business hours, return empty array
          if (startTimeMinutes >= businessEndMinutes) {
            return []
          }
        }

        // Don't round - use the exact time + buffer
        let firstSlotStart = businessStartMinutes

        // Filter reservations for this date and station
        const stationReservations = reservations.filter(r =>
          r.gameType === "ps5" &&
          r.date === date &&
          r.status === "confirmed" &&
          r.stationId === stationId
        )

        // Generate slots based on the selected duration
        // We'll increment by the duration for all slot types
        for (let time = firstSlotStart; time < businessEndMinutes; time += duration) {
          const slotEndTime = time + duration

          // Skip if the slot ends after business hours
          if (slotEndTime > businessEndMinutes) {
            continue
          }

          const slotStartHour = Math.floor(time / 60)
          const slotStartMinute = time % 60

          const slotEndHour = Math.floor(slotEndTime / 60)
          const slotEndMinute = slotEndTime % 60

          const formattedStartHour = slotStartHour.toString().padStart(2, '0')
          const formattedStartMinute = slotStartMinute.toString().padStart(2, '0')
          const formattedEndHour = slotEndHour.toString().padStart(2, '0')
          const formattedEndMinute = slotEndMinute.toString().padStart(2, '0')

          const dynamicSlot: TimeSlot = {
            id: `dynamic-${time}-${slotEndTime}`,
            start: `${formattedStartHour}:${formattedStartMinute}`,
            end: `${formattedEndHour}:${formattedEndMinute}`
          }

          // Check if this slot is available (not overlapping with any reservation)
          const isSlotAvailable = !stationReservations.some(reservation => {
            // Get reservation start and end times
            const [resStartHour, resStartMinute] = reservation.timeSlot.start.split(':').map(Number)
            const resStartMinutes = resStartHour * 60 + resStartMinute

            // Calculate reservation end time based on duration
            const resEndMinutes = resStartMinutes + (reservation.duration || 60)

            // Check if there's an overlap
            return (time >= resStartMinutes && time < resEndMinutes) ||
                   (slotEndTime > resStartMinutes && slotEndTime <= resEndMinutes) ||
                   (time <= resStartMinutes && slotEndTime >= resEndMinutes)
          })

          if (isSlotAvailable) {
            dynamicSlots.push(dynamicSlot)
          }
        }

        return dynamicSlots
      },

      // Getters
      getAvailableStations: (gameType, date, timeSlotId) => {
        const { stations, reservations, timeSlots } = get()

        // Filter stations by game type
        const stationsByType = stations.filter((station) => station.type === gameType)

        // Get the selected time slot
        const selectedTimeSlot = timeSlots.find(ts => ts.id === timeSlotId)
        if (!selectedTimeSlot) return []

        // Check which stations are available for the selected date and time slot
        return stationsByType.filter((station) => {
          // For PS5, we need to check if the time slot overlaps with any existing reservation
          if (gameType === "ps5") {
            // Get the time slot index
            const timeSlotIndex = timeSlots.findIndex(ts => ts.id === timeSlotId)

            // Check if any reservation overlaps with this time slot
            const isReserved = reservations.some(reservation => {
              if (reservation.stationId !== station.id ||
                  reservation.date !== date ||
                  reservation.status !== "confirmed") {
                return false
              }

              // Get the reservation's time slot index
              const reservationTimeSlotIndex = timeSlots.findIndex(ts => ts.id === reservation.timeSlot.id)

              // For short durations (less than 1 hour), only block the exact time slot
              if (reservation.duration && reservation.duration < 60) {
                return timeSlotIndex === reservationTimeSlotIndex;
              }

              // For longer durations, calculate how many time slots this reservation spans
              // Assuming each time slot is 1 hour and duration is in minutes
              const slotsSpanned = Math.ceil((reservation.duration || 60) / 60)

              // Check if this time slot falls within the reservation's span
              return timeSlotIndex >= reservationTimeSlotIndex &&
                     timeSlotIndex < reservationTimeSlotIndex + slotsSpanned
            })

            return !isReserved
          } else {
            // For other game types, just check if the exact time slot is reserved
            const isReserved = reservations.some(
              (reservation) =>
                reservation.stationId === station.id &&
                reservation.date === date &&
                reservation.timeSlot.id === timeSlotId &&
                reservation.status === "confirmed",
            )

            return !isReserved
          }
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

      // Game Station Management Getters
      getCurrentPlayersOnStation: (stationId) => {
        const station = get().stations.find(s => s.id === stationId)
        return station?.currentPlayers || []
      },

      getCurrentWinnerOnStation: (stationId) => {
        const station = get().stations.find(s => s.id === stationId)
        return station?.currentWinner
      },

      getWinStreakForStation: (stationId) => {
        const station = get().stations.find(s => s.id === stationId)
        return station?.winStreak || 0
      },

      getWinStreakForUser: (userId, gameType) => {
        const user = get().users.find(u => u.id === userId)
        if (!user) return 0

        if (gameType === "snooker") {
          return user.snookerWinStreak
        } else if (gameType === "pool") {
          return user.poolWinStreak
        }

        return 0
      },

      getMaxWinStreakForUser: (userId, gameType) => {
        const user = get().users.find(u => u.id === userId)
        if (!user) return 0

        if (gameType === "snooker") {
          return user.snookerMaxWinStreak
        } else if (gameType === "pool") {
          return user.poolMaxWinStreak
        }

        return 0
      },

      getUserAchievements: (userId) => {
        const user = get().users.find(u => u.id === userId)
        if (!user) {
          return {
            snookerStreak5: false,
            snookerStreak10: false,
            snookerStreak20: false,
            poolStreak5: false,
            poolStreak10: false,
            poolStreak20: false,
          }
        }

        return user.achievements
      },

      getMatchLogs: (stationId, gameType) => {
        let logs = get().matchLogs

        if (stationId) {
          logs = logs.filter(log => log.stationId === stationId)
        }

        if (gameType) {
          logs = logs.filter(log => log.gameType === gameType)
        }

        return logs
      },

      getEstimatedWaitTimeForGameType: (gameType) => {
        const queues = get().queues.filter(q => q.gameType === gameType && q.status === "waiting")
        const stations = get().stations.filter(s => s.type === gameType)

        if (queues.length === 0) return 0

        // Calculate based on historical match duration
        const completedMatches = get().matches.filter(m =>
          m.gameType === gameType &&
          m.status === "completed" &&
          m.matchDuration
        )

        let avgMatchDuration = 30 // Default 30 minutes
        if (completedMatches.length > 0) {
          const totalDuration = completedMatches.reduce((sum, match) => sum + (match.matchDuration || 0), 0)
          avgMatchDuration = totalDuration / completedMatches.length
        }

        // Calculate available stations
        const availableStations = stations.filter(s => s.status === "available").length

        // If there are available stations, the wait time is 0 for the first players
        if (availableStations > 0 && gameType !== "snooker") {
          // For pool in queue mode, we need 2 players to start
          if (gameType === "pool" && get().poolTableMode === "queue") {
            return queues.length <= 1 ? 0 : Math.ceil(((queues.length - 2) / 2) * avgMatchDuration)
          }

          // For PS5, each player gets their own session
          return 0
        }

        // For snooker, calculate based on position in queue
        if (gameType === "snooker") {
          // Sort queues by position
          const sortedQueues = [...queues].sort((a, b) => a.position - b.position)

          // If there's a current match, add the remaining time
          const currentMatch = get().matches.find(m =>
            m.gameType === "snooker" &&
            m.status === "in_progress"
          )

          let remainingTime = 0
          if (currentMatch) {
            const startTime = new Date(currentMatch.createdAt)
            const now = new Date()
            const elapsedMinutes = Math.round((now.getTime() - startTime.getTime()) / (1000 * 60))
            remainingTime = Math.max(0, avgMatchDuration - elapsedMinutes)
          }

          // Calculate wait time based on position
          const position = sortedQueues.findIndex(q => q.id === queues[0].id)
          return remainingTime + (position * avgMatchDuration)
        }

        // For pool tables, calculate based on number of tables and players
        if (gameType === "pool") {
          const occupiedTables = stations.filter(s => s.status === "occupied").length
          const totalTables = stations.length

          // In queue mode, players are paired
          if (get().poolTableMode === "queue") {
            const pairs = Math.ceil(queues.length / 2)
            return Math.ceil((pairs / totalTables) * avgMatchDuration)
          }

          // In match mode, calculate based on position and available tables
          return Math.ceil((queues.length / totalTables) * avgMatchDuration)
        }

        // For PS5, calculate based on reservation duration
        if (gameType === "ps5") {
          const currentReservation = get().reservations.find(r =>
            r.gameType === "ps5" &&
            r.status === "confirmed" &&
            r.stationId === stations[0]?.id
          )

          if (currentReservation) {
            const startTime = new Date(currentReservation.date + "T" + currentReservation.timeSlot.start)
            const now = new Date()
            const elapsedMinutes = Math.round((now.getTime() - startTime.getTime()) / (1000 * 60))
            const remainingTime = Math.max(0, currentReservation.duration - elapsedMinutes)

            return remainingTime
          }

          return 0
        }

        return avgMatchDuration
      },

      getNextQueuedPlayers: (gameType, count) => {
        const queues = get().queues.filter(q =>
          q.gameType === gameType &&
          q.status === "waiting" &&
          !q.isCurrentlyPlaying
        )

        // Sort by priority and position
        const sortedQueues = [...queues].sort((a, b) => {
          const priorityOrder = { vip: 0, high: 1, normal: 2 }
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]

          if (priorityDiff !== 0) return priorityDiff
          return a.position - b.position
        })

        return sortedQueues.slice(0, count)
      },

      getReservationsForDate: (date) => {
        return get().reservations.filter(
          (reservation) => reservation.date === date && reservation.status === "confirmed",
        )
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



      // Queue Actions
      setShowQueueJoinModal: (show) => {
        set({ showQueueJoinModal: show })
      },

      setShowSuccessModal: (show) => {
        set({ showSuccessModal: show })
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

      addGuestToQueue: (entry) => {
        const id = Date.now().toString()
        const gameTypeQueues = get().queues.filter(q => q.gameType === entry.gameType && q.status === "waiting")
        const position = gameTypeQueues.length + 1

        const newEntry: QueueEntry = {
          ...entry,
          id,
          position,
          status: "waiting",
          requiresAccount: false, // Guest doesn't need an account
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          queues: [...state.queues, newEntry],
        }))

        // Add notification for the admin
        get().addQueueNotification(`Guest ${entry.name} has been added to the ${entry.gameType} queue at position ${position}.`)

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

      assignTableToQueueEntry: (queueId, stationId) => {
        const queueEntry = get().queues.find(q => q.id === queueId)
        if (!queueEntry || queueEntry.status === "completed" || queueEntry.status === "cancelled") return

        set((state) => ({
          queues: state.queues.map(q =>
            q.id === queueId
              ? {
                  ...q,
                  assignedStationId: stationId,
                  updatedAt: new Date().toISOString()
                }
              : q
          ),
        }))

        // Update station status
        get().updateStationStatus(stationId, "reserved")

        // Add notification
        get().addQueueNotification(`Table ${get().stations.find(s => s.id === stationId)?.name} has been assigned to ${queueEntry.name}.`)
      },

      moveQueueEntryToReservation: (queueId, stationId) => {
        const queueEntry = get().queues.find(q => q.id === queueId)
        if (!queueEntry || queueEntry.status === "completed" || queueEntry.status === "cancelled") return ""

        // Create a new reservation from the queue entry
        const reservationId = get().createAdminReservation({
          stationId,
          date: queueEntry.date,
          timeSlot: queueEntry.preferredTimeSlot || get().timeSlots[0], // Use preferred time slot or default to first available
          gameType: queueEntry.gameType,
          playerCount: queueEntry.playerCount,
          name: queueEntry.name,
          email: queueEntry.email,
          phone: queueEntry.phone,
          notes: queueEntry.notes,
          status: "confirmed",
        })

        // Mark the queue entry as completed
        get().completeQueueEntry(queueId)

        // Update station status
        get().updateStationStatus(stationId, "occupied")

        return reservationId
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
