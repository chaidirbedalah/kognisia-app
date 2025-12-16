// Integration Service - Analytics & Gamification Data Bridge
// Connects analytics insights with gamification achievements and vice versa

import {
  StudentAnalytics,
  SchoolMetrics,
  LearningPattern,
  SubjectMetrics
} from '@/lib/analytics/types'

import {
  UserAchievements,
  AchievementProgress,
  AchievementBase,
  GlobalLeaderboard,
  SubjectLeaderboard,
  TournamentMode,
  DynamicChallenge,
  SeasonalEvent
} from '@/lib/gamification/types'

import {
  IntegratedUserProfile,
  AchievementAnalytics,
  GamificationAnalytics,
  LearningGamificationCorrelation,
  UnifiedDashboardData
} from './types'

class IntegrationService {
  private baseUrl = '/api/integration'
  private cache = new Map<string, any>()

  // User Profile Integration
  async getIntegratedUserProfile(userId: string): Promise<IntegratedUserProfile> {
    const cacheKey = `profile_${userId}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const response = await fetch(`${this.baseUrl}/profile/${userId}`)
    const data = await response.json()
    
    this.cache.set(cacheKey, data.data)
    return data.data
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<IntegratedUserProfile>
  ): Promise<IntegratedUserProfile> {
    const response = await fetch(`${this.baseUrl}/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    
    const data = await response.json()
    
    // Clear cache
    this.cache.delete(`profile_${userId}`)
    
    return data.data
  }

  // Achievement Analytics Integration
  async getAchievementAnalytics(
    achievementId?: string,
    category?: string
  ): Promise<AchievementAnalytics[]> {
    const params = new URLSearchParams()
    if (achievementId) params.append('achievementId', achievementId)
    if (category) params.append('category', category)

    const response = await fetch(`${this.baseUrl}/achievements/analytics?${params}`)
    const data = await response.json()
    return data.data
  }

  async calculateAchievementImpact(
    achievementId: string,
    userId: string
  ): Promise<{
    learningImpact: number
    engagementImpact: number
    socialImpact: number
    overallScore: number
  }> {
    const response = await fetch(`${this.baseUrl}/achievements/${achievementId}/impact/${userId}`)
    const data = await response.json()
    return data.data
  }

  // Learning-Gamification Correlation
  async getLearningGamificationCorrelation(
    userId: string,
    timeframe: '7d' | '30d' | '90d' | '365d' = '30d'
  ): Promise<LearningGamificationCorrelation> {
    const response = await fetch(
      `${this.baseUrl}/correlation/${userId}?timeframe=${timeframe}`
    )
    const data = await response.json()
    return data.data
  }

  async generateCorrelationInsights(
    userId: string,
    dataTypes: string[]
  ): Promise<{
    insights: string[]
    correlations: Record<string, number>
    recommendations: string[]
  }> {
    const response = await fetch(`${this.baseUrl}/correlation/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        dataTypes
      })
    })
    
    const data = await response.json()
    return data.data
  }

  // Unified Dashboard Data
  async getUnifiedDashboardData(
    userId: string,
    schoolId?: string
  ): Promise<UnifiedDashboardData> {
    const response = await fetch(
      `${this.baseUrl}/dashboard/${userId}?schoolId=${schoolId || ''}`
    )
    const data = await response.json()
    return data.data
  }

  // Real-time Integration Updates
  subscribeToIntegratedUpdates(
    userId: string,
    callback: (update: {
      type: 'achievement' | 'leaderboard' | 'analytics' | 'correlation'
      data: any
      timestamp: Date
    }) => void
  ): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/subscribe/${userId}`)
    
    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data)
        callback(update)
      } catch (error) {
        console.error('Error parsing integrated update:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Integration stream error:', error)
    }

    return () => {
      eventSource.close()
    }
  }

  // Advanced Analytics Integration
  async generateGamificationBasedLearningInsights(
    userId: string
  ): Promise<{
    personalizedRecommendations: string[]
    difficultyAdjustments: {
      subject: string
      currentLevel: number
      recommendedLevel: number
      reason: string
    }[]
    engagementOptimization: {
      currentDrivers: string[]
      suggestedActivities: string[]
      expectedImprovement: number
    }
  }> {
    const response = await fetch(
      `${this.baseUrl}/insights/gamification-learning/${userId}`
    )
    const data = await response.json()
    return data.data
  }

  async generateAnalyticsBasedGamificationInsights(
    userId: string
  ): Promise<{
    achievementPredictions: {
      nextAchievement: string
      estimatedTime: number
      confidence: number
      requiredActions: string[]
    }[]
    challengeRecommendations: {
      type: string
      difficulty: string
      estimatedCompletion: number
      rewards: string[]
    }[]
    tournamentSuggestions: {
      type: string
      skillLevel: string
      expectedPerformance: number
      benefits: string[]
    }[]
  }> {
    const response = await fetch(
      `${this.baseUrl}/insights/analytics-gamification/${userId}`
    )
    const data = await response.json()
    return data.data
  }

  // Cross-System Data Synchronization
  async syncAchievementWithAnalytics(
    achievementId: string,
    analyticsData: any
  ): Promise<{ success: boolean; updatedFields: string[] }> {
    const response = await fetch(`${this.baseUrl}/sync/achievement-analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        achievementId,
        analyticsData
      })
    })
    
    const data = await response.json()
    return data.data
  }

  async syncLeaderboardWithAnalytics(
    leaderboardId: string,
    analyticsData: any
  ): Promise<{ success: boolean; updatedRanks: string[] }> {
    const response = await fetch(`${this.baseUrl}/sync/leaderboard-analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leaderboardId,
        analyticsData
      })
    })
    
    const data = await response.json()
    return data.data
  }

  // Utility Methods
  calculateEngagementScore(
    achievements: UserAchievements,
    analytics: StudentAnalytics
  ): number {
    const achievementScore = achievements.totalPoints / 1000 // Normalize to 0-1
    const analyticsScore = analytics.engagement.dailyActiveMinutes / 120 // Normalize to 0-1
    const streakScore = Math.min(achievements.statistics.completionPercentage / 100, 1)
    
    return (achievementScore * 0.4) + (analyticsScore * 0.4) + (streakScore * 0.2)
  }

  predictNextAchievement(
    achievements: UserAchievements,
    analytics: StudentAnalytics
  ): {
    achievement: string
    probability: number
    estimatedTime: number
    requiredActions: string[]
  } {
    // Complex prediction algorithm based on current progress and learning patterns
    const inProgress = achievements.inProgressAchievements
    const learningVelocity = analytics.learningVelocity
    
    if (inProgress.length > 0) {
      const nextProgress = inProgress[0]
      const completionRate = nextProgress.currentProgress / nextProgress.requiredProgress
      
      return {
        achievement: nextProgress.achievementId,
        probability: completionRate * 0.8,
        estimatedTime: (nextProgress.requiredProgress - nextProgress.currentProgress) / learningVelocity.current,
        requiredActions: [
          'Continue current learning path',
          'Maintain daily streak',
          'Focus on weak areas'
        ]
      }
    }
    
    // Predict next logical achievement based on patterns
    return {
      achievement: 'next_logical_achievement',
      probability: 0.6,
      estimatedTime: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      requiredActions: [
        'Complete 5 more assessments',
        'Achieve 80% accuracy',
        'Maintain 3-day streak'
      ]
    }
  }

  // Cache Management
  clearCache(): void {
    this.cache.clear()
  }

  // Error Handling
  private async handleApiError(response: Response): Promise<never> {
    const error = await response.json()
    throw new IntegrationError(error.code || 'INTEGRATION_ERROR', error.message || 'An integration error occurred')
  }
}

// Custom Error Class
class IntegrationError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'IntegrationError'
  }
}

// Singleton Instance
export const integrationService = new IntegrationService()
export default integrationService