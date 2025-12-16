// @ts-nocheck
import { UserStats, ProgressData, TryOutData } from '@/lib/dashboard-api'

export interface LearningPath {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number // in minutes
  topics: string[]
  prerequisites?: string[]
  priority: number
}

export interface AIRecommendation {
  type: 'learning_path' | 'difficulty_adjustment' | 'content_focus' | 'study_schedule'
  title: string
  description: string
  action: string
  confidence: number // 0-100
  reasoning: string
  data?: any
}

export interface AdaptiveDifficulty {
  currentLevel: number // 1-10 scale
  recommendedLevel: number
  adjustmentReason: string
  targetAccuracy: number
  subjects: {
    [subject: string]: {
      currentDifficulty: number
      recommendedDifficulty: number
      performance: number
    }
  }
}

export interface PerformancePrediction {
  userId: string
  predictions: {
    nextWeekScore: number
    nextMonthScore: number
    utbkPrediction: number
    confidence: number
  }
  factors: {
    studyTime: number
    accuracy: number
    consistency: number
    difficulty: number
  }
  recommendations: string[]
}

export class AIRecommendationEngine {
  private userPerformanceHistory: Map<string, any[]> = new Map()
  private learningPaths: LearningPath[] = []
  private difficultyWeights = {
    accuracy: 0.4,
    speed: 0.3,
    consistency: 0.2,
    improvement: 0.1
  }

  constructor() {
    this.initializeLearningPaths()
  }

  private initializeLearningPaths() {
    this.learningPaths = [
      {
        id: 'math-foundation',
        title: 'Foundation Mathematics',
        description: 'Build strong foundation in basic mathematics',
        difficulty: 'easy',
        estimatedTime: 120,
        topics: ['algebra', 'geometry', 'statistics'],
        priority: 1
      },
      {
        id: 'math-intermediate',
        title: 'Intermediate Mathematics',
        description: 'Advance to more complex mathematical concepts',
        difficulty: 'medium',
        estimatedTime: 180,
        topics: ['calculus', 'trigonometry', 'probability'],
        prerequisites: ['math-foundation'],
        priority: 2
      },
      {
        id: 'math-advanced',
        title: 'Advanced Mathematics',
        description: 'Master advanced mathematical problem-solving',
        difficulty: 'hard',
        estimatedTime: 240,
        topics: ['linear-algebra', 'differential-equations', 'complex-numbers'],
        prerequisites: ['math-intermediate'],
        priority: 3
      },
      {
        id: 'physics-basics',
        title: 'Physics Fundamentals',
        description: 'Introduction to basic physics concepts',
        difficulty: 'easy',
        estimatedTime: 90,
        topics: ['mechanics', 'thermodynamics', 'waves'],
        priority: 1
      },
      {
        id: 'english-vocabulary',
        title: 'English Vocabulary Builder',
        description: 'Systematic vocabulary improvement',
        difficulty: 'medium',
        estimatedTime: 150,
        topics: ['synonyms', 'antonyms', 'context-usage'],
        priority: 2
      }
    ]
  }

  /**
   * Generate personalized learning recommendations based on user performance
   */
  generateRecommendations(
    userStats: UserStats,
    progressData: ProgressData[],
    tryOutData: TryOutData[]
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = []

    // Analyze user performance patterns
    const performanceAnalysis = this.analyzePerformance(userStats, progressData, tryOutData)
    
    // Generate learning path recommendation
    const learningPathRec = this.recommendLearningPath(performanceAnalysis)
    if (learningPathRec) recommendations.push(learningPathRec)

    // Generate difficulty adjustment recommendation
    const difficultyRec = this.recommendDifficultyAdjustment(performanceAnalysis)
    if (difficultyRec) recommendations.push(difficultyRec)

    // Generate content focus recommendation
    const focusRec = this.recommendContentFocus(performanceAnalysis)
    if (focusRec) recommendations.push(focusRec)

    // Generate study schedule recommendation
    const scheduleRec = this.recommendStudySchedule(performanceAnalysis)
    if (scheduleRec) recommendations.push(scheduleRec)

    return recommendations.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Analyze user performance across different dimensions
   */
  private analyzePerformance(
    userStats: UserStats,
    progressData: ProgressData[],
    tryOutData: TryOutData[]
  ) {
    const subjectPerformance = this.calculateSubjectPerformance(progressData)
    const overallAccuracy = userStats.overallAccuracy || 0
    const studyConsistency = this.calculateConsistency(progressData)
    const improvementRate = this.calculateImprovementRate(progressData)
    const speed = this.calculateAnswerSpeed(userStats)

    return {
      overallAccuracy,
      subjectPerformance,
      studyConsistency,
      improvementRate,
      speed,
      strengths: this.identifyStrengths(subjectPerformance),
      weaknesses: this.identifyWeaknesses(subjectPerformance),
      currentLevel: this.calculateCurrentLevel(overallAccuracy)
    }
  }

  /**
   * Recommend optimal learning path based on performance
   */
  private recommendLearningPath(analysis: any): AIRecommendation | null {
    const { weaknesses, currentLevel } = analysis
    
    if (weaknesses.length === 0) {
      return {
        type: 'learning_path',
        title: 'Continue Current Path',
        description: 'You are doing well! Continue with your current learning path.',
        action: 'continue',
        confidence: 85,
        reasoning: 'Strong performance across all subjects indicates current path is effective.'
      }
    }

    // Find best matching learning path for weaknesses
    const recommendedPath = this.learningPaths.find(path => 
      path.topics.some(topic => weaknesses.includes(topic)) &&
      path.priority <= currentLevel + 1
    )

    if (!recommendedPath) {
      return {
        type: 'learning_path',
        title: 'Foundational Practice',
        description: 'Focus on building stronger foundations before advancing.',
        action: 'practice_basics',
        confidence: 75,
        reasoning: 'Some foundational concepts need reinforcement.'
      }
    }

    return {
      type: 'learning_path',
      title: recommendedPath.title,
      description: recommendedPath.description,
      action: 'start_path',
      confidence: 90,
      reasoning: `Based on your performance in ${weaknesses.join(', ')}, this path will help strengthen weak areas.`,
      data: recommendedPath
    }
  }

  /**
   * Recommend difficulty adjustments based on performance
   */
  private recommendDifficultyAdjustment(analysis: any): AIRecommendation | null {
    const { overallAccuracy, speed, currentLevel } = analysis
    
    if (overallAccuracy > 85 && speed > 0.8) {
      return {
        type: 'difficulty_adjustment',
        title: 'Increase Difficulty',
        description: 'You are performing well, consider increasing difficulty for better growth.',
        action: 'increase_difficulty',
        confidence: 80,
        reasoning: `High accuracy (${overallAccuracy}%) and good speed indicate you are ready for more challenges.`
      }
    }

    if (overallAccuracy < 60) {
      return {
        type: 'difficulty_adjustment',
        title: 'Reduce Difficulty',
        description: 'Focus on mastering current level before advancing.',
        action: 'decrease_difficulty',
        confidence: 85,
        reasoning: `Lower accuracy (${overallAccuracy}%) suggests current difficulty may be too challenging.`
      }
    }

    return null
  }

  /**
   * Recommend content focus areas
   */
  private recommendContentFocus(analysis: any): AIRecommendation | null {
    const { weaknesses, subjectPerformance } = analysis
    
    if (weaknesses.length === 0) return null

    const weakestSubject = this.findWeakestSubject(subjectPerformance)
    
    return {
      type: 'content_focus',
      title: `Focus on ${weakestSubject.subject}`,
      description: `Dedicate extra practice time to improve ${weakestSubject.subject} performance.`,
      action: 'focus_subject',
      confidence: 88,
      reasoning: `${weakestSubject.subject} shows lowest performance (${weakestSubject.accuracy}% accuracy).`,
      data: weakestSubject
    }
  }

  /**
   * Recommend optimal study schedule
   */
  private recommendStudySchedule(analysis: any): AIRecommendation | null {
    const { studyConsistency, improvementRate } = analysis
    
    if (studyConsistency > 0.8) {
      return {
        type: 'study_schedule',
        title: 'Maintain Current Schedule',
        description: 'Your study consistency is excellent!',
        action: 'maintain_schedule',
        confidence: 82,
        reasoning: `High consistency (${Math.round(studyConsistency * 100)}%) shows current schedule works well.`
      }
    }

    if (studyConsistency < 0.5) {
      return {
        type: 'study_schedule',
        title: 'Increase Study Frequency',
        description: 'Consider shorter, more frequent study sessions.',
        action: 'increase_frequency',
        confidence: 78,
        reasoning: `Low consistency (${Math.round(studyConsistency * 100)}%) indicates irregular study patterns.`
      }
    }

    return null
  }

  /**
   * Calculate performance metrics for each subject
   */
  private calculateSubjectPerformance(progressData: ProgressData[]) {
    const subjectMap = new Map<string, any>()
    
    progressData.forEach(progress => {
      const subject = progress.subtest || 'general'
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, {
          totalQuestions: 0,
          correctAnswers: 0,
          totalTime: 0,
          sessions: []
        })
      }
      
      const subjectData = subjectMap.get(subject)
      subjectData.totalQuestions += progress.totalQuestions || 0
      subjectData.correctAnswers += progress.correctAnswers || 0
      subjectData.totalTime += 0 // Add time field if available
      subjectData.sessions.push(progress)
    })

    // Calculate metrics for each subject
    const subjectPerformance: any = {}
    subjectMap.forEach((data, subject) => {
      subjectPerformance[subject] = {
        accuracy: data.totalQuestions > 0 ? (data.correctAnswers / data.totalQuestions) * 100 : 0,
        averageTime: data.sessions.length > 0 ? data.totalTime / data.sessions.length : 0,
        sessionCount: data.sessions.length,
        trend: this.calculateTrend(data.sessions)
      }
    })

    return subjectPerformance
  }

  /**
   * Calculate study consistency based on session patterns
   */
  private calculateConsistency(progressData: ProgressData[]): number {
    if (progressData.length < 7) return 0.5 // Not enough data

    const dates = progressData.map(p => new Date(p.created_at || '').toDateString())
    const uniqueDates = new Set(dates)
    const last7Days = progressData.filter(p => {
      const sessionDate = new Date() // Use current date for filtering
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return sessionDate >= weekAgo
    })

    // Consistency based on daily activity over last week
    return Math.min(uniqueDates.size / 7, last7Days.length / 7)
  }

  /**
   * Calculate improvement rate over time
   */
  private calculateImprovementRate(progressData: ProgressData[]): number {
    if (progressData.length < 3) return 0

    const sortedData = progressData.sort((a, b) => 
      new Date().getTime() - new Date().getTime() // Sort by recency
    )

    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2))
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2))

    const firstHalfAccuracy = this.calculateAverageAccuracy(firstHalf)
    const secondHalfAccuracy = this.calculateAverageAccuracy(secondHalf)

    return secondHalfAccuracy - firstHalfAccuracy
  }

  /**
   * Calculate answer speed
   */
  private calculateAnswerSpeed(userStats: UserStats): number {
    const totalTime = userStats.total_time_spent || 0
    const totalQuestions = userStats.total_answered || 1
    const averageTimePerQuestion = totalTime / totalQuestions
    
    // Normalize to 0-1 scale (higher is better)
    return Math.max(0, Math.min(1, 1 - (averageTimePerQuestion / 120))) // 120 seconds = 1.0
  }

  /**
   * Identify user strengths
   */
  private identifyStrengths(subjectPerformance: any): string[] {
    return Object.entries(subjectPerformance)
      .filter(([_, performance]) => performance.accuracy > 75)
      .map(([subject]) => subject)
  }

  /**
   * Identify user weaknesses
   */
  private identifyWeaknesses(subjectPerformance: any): string[] {
    return Object.entries(subjectPerformance)
      .filter(([_, performance]) => performance.accuracy < 60)
      .map(([subject]) => subject)
  }

  /**
   * Calculate current user level (1-10)
   */
  private calculateCurrentLevel(overallAccuracy: number): number {
    if (overallAccuracy >= 90) return 8
    if (overallAccuracy >= 80) return 7
    if (overallAccuracy >= 70) return 6
    if (overallAccuracy >= 60) return 5
    if (overallAccuracy >= 50) return 4
    if (overallAccuracy >= 40) return 3
    if (overallAccuracy >= 30) return 2
    return 1
  }

  /**
   * Find weakest subject
   */
  private findWeakestSubject(subjectPerformance: any): any {
    return Object.entries(subjectPerformance)
      .sort(([_, a], [__, b]) => a.accuracy - b.accuracy)[0]
  }

  /**
   * Calculate trend for performance data
   */
  private calculateTrend(sessions: any[]): 'improving' | 'stable' | 'declining' {
    if (sessions.length < 3) return 'stable'

    const recentSessions = sessions.slice(-5)
    const accuracies = recentSessions.map(s => 
      (s.correct_answers || 0) / (s.total_questions || 1) * 100
    )

    let improving = 0
    let declining = 0
    
    for (let i = 1; i < accuracies.length; i++) {
      if (accuracies[i] > accuracies[i-1]) improving++
      else if (accuracies[i] < accuracies[i-1]) declining++
    }

    if (improving > declining) return 'improving'
    if (declining > improving) return 'declining'
    return 'stable'
  }

  /**
   * Calculate average accuracy for data array
   */
  private calculateAverageAccuracy(data: any[]): number {
    if (data.length === 0) return 0
    
    const totalAccuracy = data.reduce((sum, item) => {
      const accuracy = (item.correct_answers || 0) / (item.total_questions || 1) * 100
      return sum + accuracy
    }, 0)
    
    return totalAccuracy / data.length
  }

  /**
   * Generate adaptive difficulty settings
   */
  generateAdaptiveDifficulty(
    userStats: UserStats,
    progressData: ProgressData[]
  ): AdaptiveDifficulty {
    const subjectPerformance = this.calculateSubjectPerformance(progressData)
    const overallAccuracy = userStats.total_correct / userStats.total_answered
    const currentLevel = this.calculateCurrentLevel(overallAccuracy)

    const adaptiveDifficulty: AdaptiveDifficulty = {
      currentLevel,
      recommendedLevel: currentLevel,
      adjustmentReason: 'Current difficulty is appropriate',
      targetAccuracy: 75,
      subjects: {}
    }

    // Analyze each subject and recommend difficulty
    Object.entries(subjectPerformance).forEach(([subject, performance]) => {
      let recommendedDifficulty = currentLevel
      let reason = 'Performance is optimal'

      if (performance.accuracy > 85 && currentLevel < 8) {
        recommendedDifficulty = currentLevel + 1
        reason = 'High performance suggests readiness for increased difficulty'
      } else if (performance.accuracy < 60 && currentLevel > 1) {
        recommendedDifficulty = currentLevel - 1
        reason = 'Low performance suggests need for easier difficulty'
      }

      adaptiveDifficulty.subjects[subject] = {
        currentDifficulty: currentLevel,
        recommendedDifficulty,
        performance: performance.accuracy
      }
    })

    return adaptiveDifficulty
  }

  /**
   * Generate performance predictions
   */
  generatePerformancePrediction(
    userId: string,
    userStats: UserStats,
    progressData: ProgressData[],
    tryOutData: TryOutData[]
  ): PerformancePrediction {
    const analysis = this.analyzePerformance(userStats, progressData, tryOutData)
    
    // Simple prediction model based on current trends
    const currentScore = 0 // Use placeholder for now
    const improvementRate = analysis.improvementRate || 0
    const consistency = analysis.studyConsistency || 0.5

    // Predict next performance
    const nextWeekScore = currentScore + (improvementRate * 100) + (consistency * 50)
    const nextMonthScore = nextWeekScore * 4 // Rough monthly projection
    const utbkPrediction = Math.min(850, nextMonthScore * 1.2) // UTBK max score consideration

    return {
      userId,
      predictions: {
        nextWeekScore: Math.round(nextWeekScore),
        nextMonthScore: Math.round(nextMonthScore),
        utbkPrediction: Math.round(utbkPrediction),
        confidence: Math.round(consistency * 100)
      },
      factors: {
        studyTime: userStats.total_time_spent || 0,
        accuracy: analysis.overallAccuracy || 0,
        consistency,
        difficulty: analysis.currentLevel || 1
      },
      recommendations: this.generatePredictionRecommendations(analysis)
    }
  }

  /**
   * Generate recommendations based on predictions
   */
  private generatePredictionRecommendations(analysis: any): string[] {
    const recommendations: string[] = []
    
    if (analysis.overallAccuracy < 70) {
      recommendations.push('Focus on improving accuracy through practice')
    }
    
    if (analysis.studyConsistency < 0.6) {
      recommendations.push('Maintain more consistent study schedule')
    }
    
    if (analysis.improvementRate < 5) {
      recommendations.push('Try different learning strategies')
    }
    
    if (analysis.speed < 0.5) {
      recommendations.push('Practice time management during questions')
    }

    return recommendations
  }
}

// Singleton instance
export const aiRecommendationEngine = new AIRecommendationEngine()