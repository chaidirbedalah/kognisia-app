// Gamification Service - Advanced Achievement & Challenge System
// Handles all gamification logic and API calls

import {
  AchievementSystem,
  UserAchievements,
  AchievementProgress,
  DynamicChallenge,
  SeasonalEvent,
  LeaderboardSystem,
  GlobalLeaderboard,
  SubjectLeaderboard,
  TournamentMode,
  AchievementNotification,
  ChallengeUpdate,
  AchievementBase,
  Badge,
  Title,
  CosmeticItem
} from './types'

class GamificationService {
  private baseUrl = '/api/gamification'
  private achievementsCache = new Map<string, AchievementBase[]>()
  private leaderboardCache = new Map<string, any>()

  // Achievement System
  async getAchievementSystem(): Promise<AchievementSystem> {
    const response = await fetch(`${this.baseUrl}/achievements/system`)
    const data = await response.json()
    return data.data
  }

  async getUserAchievements(userId: string): Promise<UserAchievements> {
    const response = await fetch(`${this.baseUrl}/achievements/user/${userId}`)
    const data = await response.json()
    return data.data
  }

  async getAvailableAchievements(
    category?: string, 
    tier?: string
  ): Promise<AchievementBase[]> {
    const cacheKey = `achievements_${category}_${tier}`
    
    if (this.achievementsCache.has(cacheKey)) {
      return this.achievementsCache.get(cacheKey)!
    }

    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (tier) params.append('tier', tier)

    const response = await fetch(`${this.baseUrl}/achievements/available?${params}`)
    const data = await response.json()
    
    this.achievementsCache.set(cacheKey, data.data)
    return data.data
  }

  async updateAchievementProgress(
    userId: string,
    achievementId: string,
    progress: number
  ): Promise<{ success: boolean; unlocked?: boolean; levelUp?: boolean }> {
    const response = await fetch(`${this.baseUrl}/achievements/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        achievementId,
        progress
      })
    })
    
    const data = await response.json()
    
    // Clear cache
    this.achievementsCache.clear()
    
    return data.data
  }

  async checkAchievements(userId: string, activity: any): Promise<AchievementNotification[]> {
    const response = await fetch(`${this.baseUrl}/achievements/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        activity
      })
    })
    
    const data = await response.json()
    return data.data || []
  }

  // Dynamic Challenges
  async getActiveChallenges(
    type?: 'individual' | 'squad' | 'community'
  ): Promise<DynamicChallenge[]> {
    const params = new URLSearchParams()
    if (type) params.append('type', type)

    const response = await fetch(`${this.baseUrl}/challenges/active?${params}`)
    const data = await response.json()
    return data.data
  }

  async joinChallenge(userId: string, challengeId: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${this.baseUrl}/challenges/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        challengeId
      })
    })
    
    const data = await response.json()
    return data
  }

  async updateChallengeProgress(
    userId: string,
    challengeId: string,
    progress: any
  ): Promise<{ success: boolean; completed?: boolean; rank?: number }> {
    const response = await fetch(`${this.baseUrl}/challenges/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        challengeId,
        progress
      })
    })
    
    const data = await response.json()
    return data.data
  }

  async generateDynamicChallenge(
    userId: string,
    preferences: any
  ): Promise<DynamicChallenge> {
    const response = await fetch(`${this.baseUrl}/challenges/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        preferences
      })
    })
    
    const data = await response.json()
    return data.data
  }

  // Seasonal Events
  async getCurrentSeasonalEvent(): Promise<SeasonalEvent | null> {
    const response = await fetch(`${this.baseUrl}/events/current`)
    const data = await response.json()
    return data.data
  }

  async getSeasonalEvents(
    year?: number,
    includeInactive: boolean = false
  ): Promise<SeasonalEvent[]> {
    const params = new URLSearchParams()
    if (year) params.append('year', year.toString())
    if (includeInactive) params.append('includeInactive', 'true')

    const response = await fetch(`${this.baseUrl}/events?${params}`)
    const data = await response.json()
    return data.data
  }

  async participateInEvent(
    userId: string,
    eventId: string,
    challengeId?: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${this.baseUrl}/events/participate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        eventId,
        challengeId
      })
    })
    
    const data = await response.json()
    return data
  }

  // Leaderboard System
  async getLeaderboardSystem(): Promise<LeaderboardSystem> {
    const response = await fetch(`${this.baseUrl}/leaderboard/system`)
    const data = await response.json()
    return data.data
  }

  async getGlobalLeaderboard(
    period: 'all_time' | 'yearly' | 'monthly' | 'weekly' = 'all_time',
    limit: number = 100
  ): Promise<GlobalLeaderboard> {
    const cacheKey = `leaderboard_global_${period}_${limit}`
    
    if (this.leaderboardCache.has(cacheKey)) {
      return this.leaderboardCache.get(cacheKey)
    }

    const response = await fetch(
      `${this.baseUrl}/leaderboard/global?period=${period}&limit=${limit}`
    )
    const data = await response.json()
    
    this.leaderboardCache.set(cacheKey, data.data)
    return data.data
  }

  async getSubjectLeaderboard(
    subject: string,
    period: 'all_time' | 'yearly' | 'monthly' | 'weekly' = 'all_time',
    limit: number = 50
  ): Promise<SubjectLeaderboard> {
    const cacheKey = `leaderboard_subject_${subject}_${period}_${limit}`
    
    if (this.leaderboardCache.has(cacheKey)) {
      return this.leaderboardCache.get(cacheKey)
    }

    const response = await fetch(
      `${this.baseUrl}/leaderboard/subject/${subject}?period=${period}&limit=${limit}`
    )
    const data = await response.json()
    
    this.leaderboardCache.set(cacheKey, data.data)
    return data.data
  }

  async getImprovementLeaderboard(
    metric: 'accuracy_improvement' | 'speed_improvement' | 'consistency' = 'accuracy_improvement',
    period: 'monthly' | 'quarterly' = 'monthly',
    limit: number = 50
  ): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/leaderboard/improvement?metric=${metric}&period=${period}&limit=${limit}`
    )
    const data = await response.json()
    return data.data
  }

  async getUserRankings(userId: string): Promise<{
    global: { rank: number; score: number }
    subjects: { subject: string; rank: number; score: number }[]
    improvement: { metric: string; rank: number; improvement: number }[]
  }> {
    const response = await fetch(`${this.baseUrl}/leaderboard/user/${userId}`)
    const data = await response.json()
    return data.data
  }

  // Tournament System
  async getActiveTournaments(): Promise<TournamentMode[]> {
    const response = await fetch(`${this.baseUrl}/tournaments/active`)
    const data = await response.json()
    return data.data
  }

  async joinTournament(
    userId: string,
    tournamentId: string
  ): Promise<{ success: boolean; message?: string; bracket?: any }> {
    const response = await fetch(`${this.baseUrl}/tournaments/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        tournamentId
      })
    })
    
    const data = await response.json()
    return data
  }

  async getTournamentBracket(tournamentId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/tournaments/${tournamentId}/bracket`)
    const data = await response.json()
    return data.data
  }

  // Rewards & Cosmetics
  async getUserCosmetics(userId: string): Promise<{
    owned: CosmeticItem[]
    equipped: CosmeticItem[]
    available: CosmeticItem[]
  }> {
    const response = await fetch(`${this.baseUrl}/cosmetics/user/${userId}`)
    const data = await response.json()
    return data.data
  }

  async purchaseCosmetic(
    userId: string,
    cosmeticId: string,
    currency: 'points' | 'premium' = 'points'
  ): Promise<{ success: boolean; message?: string; newBalance?: number }> {
    const response = await fetch(`${this.baseUrl}/cosmetics/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        cosmeticId,
        currency
      })
    })
    
    const data = await response.json()
    return data.data
  }

  async equipCosmetic(
    userId: string,
    cosmeticId: string,
    slot: 'avatar' | 'profile_frame' | 'background' | 'effect' | 'companion'
  ): Promise<{ success: boolean; equipped?: CosmeticItem }> {
    const response = await fetch(`${this.baseUrl}/cosmetics/equip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        cosmeticId,
        slot
      })
    })
    
    const data = await response.json()
    return data.data
  }

  async getUserTitles(userId: string): Promise<Title[]> {
    const response = await fetch(`${this.baseUrl}/titles/user/${userId}`)
    const data = await response.json()
    return data.data
  }

  async equipTitle(userId: string, titleId: string): Promise<{ success: boolean; title?: Title }> {
    const response = await fetch(`${this.baseUrl}/titles/equip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        titleId
      })
    })
    
    const data = await response.json()
    return data.data
  }

  // Real-time Updates
  subscribeToAchievementUpdates(
    userId: string,
    callback: (notification: AchievementNotification) => void
  ): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/achievements/subscribe/${userId}`)
    
    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data)
        callback(notification)
      } catch (error) {
        console.error('Error parsing achievement update:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Achievement stream error:', error)
    }

    // Return unsubscribe function
    return () => {
      eventSource.close()
    }
  }

  subscribeToChallengeUpdates(
    userId: string,
    callback: (update: ChallengeUpdate) => void
  ): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/challenges/subscribe/${userId}`)
    
    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data)
        callback(update)
      } catch (error) {
        console.error('Error parsing challenge update:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Challenge stream error:', error)
    }

    return () => {
      eventSource.close()
    }
  }

  subscribeToLeaderboardUpdates(
    leaderboardType: string,
    callback: (leaderboard: any) => void
  ): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/leaderboard/subscribe/${leaderboardType}`)
    
    eventSource.onmessage = (event) => {
      try {
        const leaderboard = JSON.parse(event.data)
        callback(leaderboard)
      } catch (error) {
        console.error('Error parsing leaderboard update:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Leaderboard stream error:', error)
    }

    return () => {
      eventSource.close()
    }
  }

  // Utility Methods
  calculateTierProgress(currentPoints: number, tier: string): {
    currentTier: number
    nextTier: number
    progressPercentage: number
    pointsToNext: number
  } {
    const tierRequirements = {
      bronze: { min: 0, max: 1000 },
      silver: { min: 1000, max: 5000 },
      gold: { min: 5000, max: 15000 },
      platinum: { min: 15000, max: 50000 },
      diamond: { min: 50000, max: Infinity }
    }

    const currentTierData = tierRequirements[tier as keyof typeof tierRequirements]
    const tiers = Object.keys(tierRequirements)
    const currentTierIndex = tiers.indexOf(tier)
    
    let currentTier = currentTierIndex
    let nextTier = Math.min(currentTierIndex + 1, tiers.length - 1)
    let progressPercentage = 0
    let pointsToNext = 0

    if (currentPoints >= currentTierData.max && currentTier < tiers.length - 1) {
      // User is in next tier
      currentTier++
      nextTier = Math.min(currentTier + 1, tiers.length - 1)
    }

    if (currentTier < tiers.length - 1) {
      const nextTierData = tierRequirements[tiers[nextTier] as keyof typeof tierRequirements]
      const tierRange = currentTierData.max - currentTierData.min
      const progressInTier = currentPoints - currentTierData.min
      progressPercentage = (progressInTier / tierRange) * 100
      pointsToNext = nextTierData.max - currentPoints
    }

    return {
      currentTier,
      nextTier,
      progressPercentage,
      pointsToNext
    }
  }

  calculateAchievementRarity(achievement: AchievementBase): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
    // Rarity based on points and tier
    const tierPoints = {
      bronze: 100,
      silver: 250,
      gold: 500,
      platinum: 1000,
      diamond: 2000
    }

    const points = achievement.points + tierPoints[achievement.tier]
    
    if (points >= 2000) return 'legendary'
    if (points >= 1000) return 'epic'
    if (points >= 500) return 'rare'
    if (points >= 250) return 'uncommon'
    return 'common'
  }

  // Cache Management
  clearCache(): void {
    this.achievementsCache.clear()
    this.leaderboardCache.clear()
  }

  // Error Handling
  private async handleApiError(response: Response): Promise<never> {
    const error = await response.json()
    throw new GamificationError(error.code || 'GAME_ERROR', error.message || 'A gamification error occurred')
  }
}

// Custom Error Class
class GamificationError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'GamificationError'
  }
}

// Singleton Instance
export const gamificationService = new GamificationService()
export default gamificationService