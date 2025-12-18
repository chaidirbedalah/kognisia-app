// Simplified ML Utilities for Kognisia AI/ML Enhancement
// Using basic statistical methods instead of external libraries

// Types for ML data
export interface UserPerformanceData {
  userId: string
  subtest: string
  accuracy: number
  timeSpent: number
  difficulty: number
  attempts: number
  timestamp: number
}

export interface PredictionFeatures {
  avgAccuracy: number
  avgTimeSpent: number
  consistencyScore: number
  improvementRate: number
  difficultyPreference: number
  recentPerformance: number[]
  avgAttempts?: number
}

export interface PerformancePrediction {
  predictedAccuracy: number
  confidence: number
  recommendedDifficulty: number
  riskFactors: string[]
  improvementSuggestions: string[]
}

export interface CollaborativeFilteringData {
  userId: string
  itemId: string
  rating: number
  timestamp: number
}

export interface RecommendationResult {
  itemId: string
  score: number
  confidence: number
  reason: string
}

// Basic statistical functions
function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0
  const avg = mean(values)
  const squareDiffs = values.map(val => Math.pow(val - avg, 2))
  const avgSquareDiff = mean(squareDiffs)
  return Math.sqrt(avgSquareDiff)
}

// Performance Prediction Engine
export class PerformancePredictor {
  private historicalData: UserPerformanceData[] = []

  // Train models with historical data
  train(data: UserPerformanceData[]): void {
    this.historicalData = data
  }

  // Predict performance for next attempt
  predict(userId: string, subtest: string, difficulty: number): PerformancePrediction {
    const userHistory = this.historicalData.filter(d => d.userId === userId && d.subtest === subtest)
    
    if (userHistory.length < 3) {
      // Not enough data for ML prediction
      return this.getBaselinePrediction(difficulty, userHistory)
    }

    const features = this.extractFeatures(userId, subtest)
    
    try {
      // Simple linear regression based prediction
      const predictedAccuracy = this.calculatePredictedAccuracy(features, difficulty)
      const confidence = this.calculateConfidence(userHistory.length)
      const recommendedDifficulty = this.calculateOptimalDifficulty(predictedAccuracy, difficulty)

      return {
        predictedAccuracy,
        confidence,
        recommendedDifficulty,
        riskFactors: this.identifyRiskFactors(features, predictedAccuracy),
        improvementSuggestions: this.generateSuggestions(features, predictedAccuracy)
      }
    } catch (error) {
      console.warn('Prediction failed:', error)
      return this.getBaselinePrediction(difficulty, userHistory)
    }
  }

  private extractFeatures(userId: string, subtest: string): PredictionFeatures {
    const userSubtestData = this.historicalData.filter(d => d.userId === userId && d.subtest === subtest)
    const userAllData = this.historicalData.filter(d => d.userId === userId)

    const accuracies = userSubtestData.map(d => d.accuracy)
    const times = userSubtestData.map(d => d.timeSpent)
    const difficulties = userSubtestData.map(d => d.difficulty)
    const attempts = userSubtestData.map(d => d.attempts)

    return {
      avgAccuracy: mean(accuracies),
      avgTimeSpent: mean(times),
      consistencyScore: this.calculateConsistencyScore(userId),
      improvementRate: this.calculateImprovementRate(accuracies),
      difficultyPreference: mean(difficulties),
      recentPerformance: accuracies.slice(-5),
      avgAttempts: mean(attempts)
    }
  }

  private calculatePredictedAccuracy(features: PredictionFeatures, difficulty: number): number {
    // Simple weighted prediction based on multiple factors
    const baseAccuracy = features.avgAccuracy
    const difficultyImpact = (3 - difficulty) * 5 // Higher difficulty = lower accuracy
    const consistencyBonus = features.consistencyScore * 10
    const improvementBonus = features.improvementRate * 20

    let predicted = baseAccuracy + difficultyImpact + consistencyBonus + improvementBonus
    
    // Apply some randomness to simulate real ML uncertainty
    predicted += (Math.random() - 0.5) * 10
    
    return Math.max(0, Math.min(100, predicted))
  }

  private calculateConsistencyScore(userId: string): number {
    const userData = this.historicalData.filter(d => d.userId === userId)
    const accuracies = userData.map(d => d.accuracy)
    
    if (accuracies.length < 2) return 0.5
    
    const stdDev = standardDeviation(accuracies)
    // Lower standard deviation = higher consistency
    return Math.max(0, 1 - (stdDev / 100))
  }

  private calculateImprovementRate(accuracies: number[]): number {
    if (accuracies.length < 2) return 0
    
    const recent = accuracies.slice(-3)
    const earlier = accuracies.slice(0, -3)
    
    if (earlier.length === 0) return 0
    
    const recentAvg = mean(recent)
    const earlierAvg = mean(earlier)
    
    return (recentAvg - earlierAvg) / earlierAvg
  }

  private calculateConfidence(dataPoints: number): number {
    // More data points = higher confidence
    return Math.min(0.95, dataPoints / 20)
  }

  private calculateOptimalDifficulty(currentAccuracy: number, currentDifficulty: number): number {
    if (currentAccuracy > 85) {
      return Math.min(5, currentDifficulty + 0.5)
    } else if (currentAccuracy < 60) {
      return Math.max(1, currentDifficulty - 0.5)
    }
    return currentDifficulty
  }

  private identifyRiskFactors(features: PredictionFeatures, predictedAccuracy: number): string[] {
    const risks: string[] = []
    
    if (features.consistencyScore < 0.3) {
      risks.push('Inconsistent performance pattern')
    }
    
    if (features.avgTimeSpent > 120) {
      risks.push('Slow response time detected')
    }
    
    if (predictedAccuracy < 50) {
      risks.push('High risk of low performance')
    }
    
    if (features.improvementRate < -0.2) {
      risks.push('Declining performance trend')
    }
    
    return risks
  }

  private generateSuggestions(features: PredictionFeatures, predictedAccuracy: number): string[] {
    const suggestions: string[] = []
    
    if (features.consistencyScore < 0.4) {
      suggestions.push('Focus on consistent practice routine')
    }
    
    if (features.avgTimeSpent > 90) {
      suggestions.push('Practice time management techniques')
    }
    
    if (predictedAccuracy < 70) {
      suggestions.push('Review fundamental concepts')
      suggestions.push('Try easier difficulty first')
    }
    
    if (features.improvementRate > 0.2) {
      suggestions.push('Great progress! Consider increasing difficulty')
    }
    
    return suggestions
  }

  private getBaselinePrediction(difficulty: number, userHistory: UserPerformanceData[]): PerformancePrediction {
    const avgAccuracy = userHistory.length > 0 
      ? mean(userHistory.map(d => d.accuracy))
      : 70 // Baseline assumption

    return {
      predictedAccuracy: avgAccuracy,
      confidence: 0.3, // Low confidence with limited data
      recommendedDifficulty: difficulty,
      riskFactors: [],
      improvementSuggestions: ['Complete more assessments for better predictions']
    }
  }
}

// Collaborative Filtering Engine
export class CollaborativeFilter {
  private userItemMatrix: Map<string, Map<string, number>> = new Map()
  private itemUsers: Map<string, Set<string>> = new Map()

  // Add rating data
  addRating(userId: string, itemId: string, rating: number): void {
    if (!this.userItemMatrix.has(userId)) {
      this.userItemMatrix.set(userId, new Map())
    }
    this.userItemMatrix.get(userId)!.set(itemId, rating)

    if (!this.itemUsers.has(itemId)) {
      this.itemUsers.set(itemId, new Set())
    }
    this.itemUsers.get(itemId)!.add(userId)
  }

  // Get recommendations for user
  getRecommendations(userId: string, count: number = 5): RecommendationResult[] {
    const userRatings = this.userItemMatrix.get(userId) || new Map()
    const recommendations: RecommendationResult[] = []

    // Find similar users
    const similarUsers = this.findSimilarUsers(userId)
    
    // Get items rated by similar users but not by target user
    const candidateItems = new Set<string>()
    
    for (const similarUser of similarUsers) {
      const similarUserRatings = this.userItemMatrix.get(similarUser.userId) || new Map()
      
      for (const [itemId, rating] of similarUserRatings) {
        if (!userRatings.has(itemId) && rating >= 3) {
          candidateItems.add(itemId)
        }
      }
    }

    // Score candidate items
    for (const itemId of candidateItems) {
      const score = this.calculateItemScore(userId, itemId, similarUsers)
      recommendations.push({
        itemId,
        score,
        confidence: this.calculateConfidence(itemId, similarUsers.length),
        reason: this.generateReason(itemId, similarUsers)
      })
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
  }

  private findSimilarUsers(userId: string, limit: number = 10): Array<{userId: string, similarity: number}> {
    const userRatings = this.userItemMatrix.get(userId) || new Map()
    const similarities: Array<{userId: string, similarity: number}> = []

    for (const [otherUserId, otherRatings] of this.userItemMatrix) {
      if (otherUserId === userId) continue

      const similarity = this.calculateCosineSimilarity(userRatings, otherRatings)
      if (similarity > 0.1) { // Minimum similarity threshold
        similarities.push({ userId: otherUserId, similarity })
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
  }

  private calculateCosineSimilarity(ratings1: Map<string, number>, ratings2: Map<string, number>): number {
    const commonItems: string[] = []
    
    for (const itemId of ratings1.keys()) {
      if (ratings2.has(itemId)) {
        commonItems.push(itemId)
      }
    }

    if (commonItems.length === 0) return 0

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (const itemId of commonItems) {
      dotProduct += ratings1.get(itemId)! * ratings2.get(itemId)!
    }

    for (const rating of ratings1.values()) {
      norm1 += rating * rating
    }

    for (const rating of ratings2.values()) {
      norm2 += rating * rating
    }

    norm1 = Math.sqrt(norm1)
    norm2 = Math.sqrt(norm2)

    if (norm1 === 0 || norm2 === 0) return 0

    return dotProduct / (norm1 * norm2)
  }

  private calculateItemScore(userId: string, itemId: string, similarUsers: Array<{userId: string, similarity: number}>): number {
    let score = 0
    let totalSimilarity = 0

    for (const { userId: similarUserId, similarity } of similarUsers) {
      const similarUserRatings = this.userItemMatrix.get(similarUserId) || new Map()
      const rating = similarUserRatings.get(itemId)

      if (rating !== undefined) {
        score += similarity * rating
        totalSimilarity += similarity
      }
    }

    return totalSimilarity > 0 ? score / totalSimilarity : 0
  }

  private calculateConfidence(itemId: string, similarUsersCount: number): number {
    const ratingCount = this.itemUsers.get(itemId)?.size || 0
    return Math.min(0.9, (ratingCount + similarUsersCount) / 20)
  }

  private generateReason(itemId: string, similarUsers: Array<{userId: string, similarity: number}>): string {
    const topSimilarUsers = similarUsers.slice(0, 3)
    const userNames = topSimilarUsers.map(u => u.userId.split('@')[0]).join(', ')
    return `Users with similar preferences (${userNames}) liked this`
  }
}

// Adaptive Learning Engine
export class AdaptiveLearningEngine {
  private performancePredictor: PerformancePredictor
  private collaborativeFilter: CollaborativeFilter
  private learningPath: Map<string, string[]> = new Map()

  constructor() {
    this.performancePredictor = new PerformancePredictor()
    this.collaborativeFilter = new CollaborativeFilter()
  }

  // Initialize with user data
  async initialize(userId: string): Promise<void> {
    try {
      // Fetch user performance data
      const response = await fetch(`/api/analytics/user-performance/${userId}`)
      const data = await response.json()

      // Train ML models
      this.performancePredictor.train(data.performanceHistory)
      
      // Initialize collaborative filtering
      data.ratings?.forEach((rating: CollaborativeFilteringData) => {
        this.collaborativeFilter.addRating(rating.userId, rating.itemId, rating.rating)
      })

      // Generate learning path
      this.generateLearningPath(userId, data.performanceHistory)
    } catch (error) {
      console.error('Failed to initialize adaptive learning:', error)
    }
  }

  // Get personalized recommendations
  async getRecommendations(userId: string): Promise<{
    difficultyAdjustments: Record<string, number>
    contentRecommendations: RecommendationResult[]
    learningPath: string[]
    insights: string[]
  }> {
    const userPerformance = await this.getUserPerformance(userId)
    const recommendations = {
      difficultyAdjustments: {} as Record<string, number>,
      contentRecommendations: this.collaborativeFilter.getRecommendations(userId),
      learningPath: this.learningPath.get(userId) || [],
      insights: this.generateInsights(userPerformance)
    }

    // Generate difficulty adjustments for each subtest
    for (const subtest of this.getSubtests()) {
      const prediction = this.performancePredictor.predict(userId, subtest, 3) // Default difficulty
      recommendations.difficultyAdjustments[subtest] = prediction.recommendedDifficulty
    }

    return recommendations
  }

  private async getUserPerformance(userId: string): Promise<UserPerformanceData[]> {
    try {
      const response = await fetch(`/api/analytics/user-performance/${userId}`)
      const data = await response.json()
      return data.performanceHistory || []
    } catch (error) {
      return []
    }
  }

  private generateLearningPath(userId: string, performanceData: UserPerformanceData[]): void {
    // Analyze weak areas and create structured learning path
    const subtestPerformance = new Map<string, UserPerformanceData[]>()
    
    for (const data of performanceData) {
      if (!subtestPerformance.has(data.subtest)) {
        subtestPerformance.set(data.subtest, [])
      }
      subtestPerformance.get(data.subtest)!.push(data)
    }

    // Sort subtests by performance (weakest first)
    const sortedSubtests = Array.from(subtestPerformance.entries())
      .sort((a, b) => {
        const avgA = mean(a[1].map(d => d.accuracy))
        const avgB = mean(b[1].map(d => d.accuracy))
        return avgA - avgB
      })
      .map(entry => entry[0])

    this.learningPath.set(userId, sortedSubtests)
  }

  private generateInsights(performanceData: UserPerformanceData[]): string[] {
    const insights: string[] = []
    
    if (performanceData.length === 0) {
      return ['Start practicing to get personalized insights']
    }

    const accuracies = performanceData.map(d => d.accuracy)
    const avgAccuracy = mean(accuracies)
    const consistency = 1 - (standardDeviation(accuracies) / 100)

    if (avgAccuracy > 80) {
      insights.push('Excellent performance! Consider advanced challenges')
    } else if (avgAccuracy > 60) {
      insights.push('Good progress! Focus on consistency')
    } else {
      insights.push('Keep practicing! Review fundamentals')
    }

    if (consistency > 0.8) {
      insights.push('Very consistent performance pattern')
    } else if (consistency < 0.5) {
      insights.push('Try to establish a regular practice routine')
    }

    return insights
  }

  private getSubtests(): string[] {
    return [
      'Penalaran Umum',
      'Pengetahuan Kuantitatif', 
      'Kemampuan Memahami Bacaan & Menulis',
      'Pengetahuan & Pemahaman Umum'
    ]
  }
}

// Export singleton instance
export const adaptiveLearningEngine = new AdaptiveLearningEngine()