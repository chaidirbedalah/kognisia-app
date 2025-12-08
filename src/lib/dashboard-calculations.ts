import { DailyChallengeData, MarathonData, TryOutData, ProgressData } from './dashboard-api'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface LayerBreakdown {
  directPercentage: number
  hintPercentage: number
  solutionPercentage: number
  directCount: number
  hintCount: number
  solutionCount: number
  total: number
}

export interface WeeklyComparison {
  thisWeek: {
    totalQuestions: number
    accuracy: number
  }
  lastWeek: {
    totalQuestions: number
    accuracy: number
  }
  improvement: number
  improvementPercentage: number
}

export interface StrongestWeakest {
  strongest: {
    subtest: string
    accuracy: number
    totalQuestions: number
  }
  weakest: {
    subtest: string
    accuracy: number
    totalQuestions: number
  }
}

export interface TrendDataPoint {
  date: string
  accuracy: number
  totalQuestions: number
  correctAnswers: number
}

export interface AssessmentTypeBreakdown {
  dailyChallenge: {
    total: number
    accuracy: number
    layerBreakdown: LayerBreakdown
  }
  marathon: {
    total: number
    accuracy: number
    layerBreakdown: LayerBreakdown
  }
  squadBattle: {
    total: number
    accuracy: number
  }
  tryOut: {
    total: number
    accuracy: number
    layerBreakdown: LayerBreakdown
  }
}

// ============================================================================
// LAYER BREAKDOWN CALCULATIONS
// ============================================================================

export function calculate3LayerBreakdown(
  directAnswers: number,
  hintUsed: number,
  solutionViewed: number
): LayerBreakdown {
  const total = directAnswers + hintUsed + solutionViewed
  
  if (total === 0) {
    return {
      directPercentage: 0,
      hintPercentage: 0,
      solutionPercentage: 0,
      directCount: 0,
      hintCount: 0,
      solutionCount: 0,
      total: 0
    }
  }
  
  return {
    directPercentage: Math.round((directAnswers / total) * 100),
    hintPercentage: Math.round((hintUsed / total) * 100),
    solutionPercentage: Math.round((solutionViewed / total) * 100),
    directCount: directAnswers,
    hintCount: hintUsed,
    solutionCount: solutionViewed,
    total
  }
}

// ============================================================================
// TREND CALCULATIONS
// ============================================================================

export function calculateAccuracyTrend(data: DailyChallengeData[]): TrendDataPoint[] {
  return data
    .map(d => ({
      date: d.date,
      accuracy: d.accuracy,
      totalQuestions: d.totalQuestions,
      correctAnswers: d.correctAnswers
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function calculateOverallTrend(
  dailyData: DailyChallengeData[],
  marathonData: MarathonData[]
): TrendDataPoint[] {
  const allData: TrendDataPoint[] = []
  
  // Add daily challenge data
  dailyData.forEach(d => {
    allData.push({
      date: d.date,
      accuracy: d.accuracy,
      totalQuestions: d.totalQuestions,
      correctAnswers: d.correctAnswers
    })
  })
  
  // Add marathon data
  marathonData.forEach(m => {
    allData.push({
      date: m.date,
      accuracy: m.accuracy,
      totalQuestions: m.subtestScores.reduce((sum, s) => sum + s.total, 0),
      correctAnswers: m.totalScore
    })
  })
  
  // Group by date and average if multiple assessments on same day
  const dateMap = new Map<string, TrendDataPoint[]>()
  allData.forEach(d => {
    if (!dateMap.has(d.date)) {
      dateMap.set(d.date, [])
    }
    dateMap.get(d.date)!.push(d)
  })
  
  const result: TrendDataPoint[] = []
  dateMap.forEach((items, date) => {
    const totalQuestions = items.reduce((sum, i) => sum + i.totalQuestions, 0)
    const correctAnswers = items.reduce((sum, i) => sum + i.correctAnswers, 0)
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    
    result.push({
      date,
      accuracy,
      totalQuestions,
      correctAnswers
    })
  })
  
  return result.sort((a, b) => a.date.localeCompare(b.date))
}

// ============================================================================
// STRONGEST/WEAKEST CALCULATIONS
// ============================================================================

export function findStrongestWeakest(progressData: ProgressData[]): StrongestWeakest | null {
  if (progressData.length === 0) {
    return null
  }
  
  // Filter out subtests with very few questions (< 5) for more accurate assessment
  const validData = progressData.filter(p => p.totalQuestions >= 5)
  
  if (validData.length === 0) {
    // Fallback to all data if no subtest has >= 5 questions
    const sorted = [...progressData].sort((a, b) => b.accuracy - a.accuracy)
    return {
      strongest: {
        subtest: sorted[0].subtest,
        accuracy: sorted[0].accuracy,
        totalQuestions: sorted[0].totalQuestions
      },
      weakest: {
        subtest: sorted[sorted.length - 1].subtest,
        accuracy: sorted[sorted.length - 1].accuracy,
        totalQuestions: sorted[sorted.length - 1].totalQuestions
      }
    }
  }
  
  const sorted = [...validData].sort((a, b) => b.accuracy - a.accuracy)
  
  return {
    strongest: {
      subtest: sorted[0].subtest,
      accuracy: sorted[0].accuracy,
      totalQuestions: sorted[0].totalQuestions
    },
    weakest: {
      subtest: sorted[sorted.length - 1].subtest,
      accuracy: sorted[sorted.length - 1].accuracy,
      totalQuestions: sorted[sorted.length - 1].totalQuestions
    }
  }
}

// ============================================================================
// WEEKLY COMPARISON CALCULATIONS
// ============================================================================

export function compareWeeklyProgress(dailyChallengeData: DailyChallengeData[]): WeeklyComparison {
  const today = new Date()
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(today.getDate() - 7)
  const twoWeeksAgo = new Date(today)
  twoWeeksAgo.setDate(today.getDate() - 14)
  
  const thisWeekData = dailyChallengeData.filter(d => {
    const date = new Date(d.date)
    return date >= oneWeekAgo && date <= today
  })
  
  const lastWeekData = dailyChallengeData.filter(d => {
    const date = new Date(d.date)
    return date >= twoWeeksAgo && date < oneWeekAgo
  })
  
  const thisWeekTotal = thisWeekData.reduce((sum, d) => sum + d.totalQuestions, 0)
  const thisWeekCorrect = thisWeekData.reduce((sum, d) => sum + d.correctAnswers, 0)
  const thisWeekAccuracy = thisWeekTotal > 0 ? Math.round((thisWeekCorrect / thisWeekTotal) * 100) : 0
  
  const lastWeekTotal = lastWeekData.reduce((sum, d) => sum + d.totalQuestions, 0)
  const lastWeekCorrect = lastWeekData.reduce((sum, d) => sum + d.correctAnswers, 0)
  const lastWeekAccuracy = lastWeekTotal > 0 ? Math.round((lastWeekCorrect / lastWeekTotal) * 100) : 0
  
  const improvement = thisWeekAccuracy - lastWeekAccuracy
  const improvementPercentage = lastWeekAccuracy > 0 
    ? Math.round((improvement / lastWeekAccuracy) * 100)
    : 0
  
  return {
    thisWeek: {
      totalQuestions: thisWeekTotal,
      accuracy: thisWeekAccuracy
    },
    lastWeek: {
      totalQuestions: lastWeekTotal,
      accuracy: lastWeekAccuracy
    },
    improvement,
    improvementPercentage
  }
}

// ============================================================================
// ASSESSMENT TYPE BREAKDOWN
// ============================================================================

export function groupByAssessmentType(
  dailyData: DailyChallengeData[],
  marathonData: MarathonData[],
  tryOutData: TryOutData[]
): AssessmentTypeBreakdown {
  // Daily Challenge stats
  const dcTotal = dailyData.length
  const dcTotalQuestions = dailyData.reduce((sum, d) => sum + d.totalQuestions, 0)
  const dcCorrect = dailyData.reduce((sum, d) => sum + d.correctAnswers, 0)
  const dcAccuracy = dcTotalQuestions > 0 ? Math.round((dcCorrect / dcTotalQuestions) * 100) : 0
  
  const dcDirect = dailyData.reduce((sum, d) => sum + d.directAnswers, 0)
  const dcHint = dailyData.reduce((sum, d) => sum + d.hintUsed, 0)
  const dcSolution = dailyData.reduce((sum, d) => sum + d.solutionViewed, 0)
  
  // Marathon stats
  const marathonTotal = marathonData.length
  const marathonTotalQuestions = marathonData.reduce((sum, m) => 
    sum + m.subtestScores.reduce((s, sub) => s + sub.total, 0), 0)
  const marathonCorrect = marathonData.reduce((sum, m) => sum + m.totalScore, 0)
  const marathonAccuracy = marathonTotalQuestions > 0 
    ? Math.round((marathonCorrect / marathonTotalQuestions) * 100) 
    : 0
  
  const marathonDirect = marathonData.reduce((sum, m) => sum + m.directAnswers, 0)
  const marathonHint = marathonData.reduce((sum, m) => sum + m.hintUsed, 0)
  const marathonSolution = marathonData.reduce((sum, m) => sum + m.solutionViewed, 0)
  
  // Try Out stats
  const tryOutTotal = tryOutData.length
  const tryOutTotalQuestions = tryOutData.reduce((sum, t) => 
    sum + t.subtestScores.reduce((s, sub) => s + sub.total, 0), 0)
  const tryOutCorrect = tryOutData.reduce((sum, t) => sum + t.totalScore, 0)
  const tryOutAccuracy = tryOutTotalQuestions > 0 
    ? Math.round((tryOutCorrect / tryOutTotalQuestions) * 100) 
    : 0
  
  const tryOutDirect = tryOutData.reduce((sum, t) => sum + t.directAnswers, 0)
  const tryOutHint = tryOutData.reduce((sum, t) => sum + t.hintUsed, 0)
  const tryOutSolution = tryOutData.reduce((sum, t) => sum + t.solutionViewed, 0)
  
  return {
    dailyChallenge: {
      total: dcTotal,
      accuracy: dcAccuracy,
      layerBreakdown: calculate3LayerBreakdown(dcDirect, dcHint, dcSolution)
    },
    marathon: {
      total: marathonTotal,
      accuracy: marathonAccuracy,
      layerBreakdown: calculate3LayerBreakdown(marathonDirect, marathonHint, marathonSolution)
    },
    squadBattle: {
      total: 0,
      accuracy: 0
    },
    tryOut: {
      total: tryOutTotal,
      accuracy: tryOutAccuracy,
      layerBreakdown: calculate3LayerBreakdown(tryOutDirect, tryOutHint, tryOutSolution)
    }
  }
}

// ============================================================================
// TIME CALCULATIONS
// ============================================================================

export function calculateAverageTimePerQuestion(totalTime: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0
  return Math.round(totalTime / totalQuestions)
}

export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (remainingSeconds === 0) {
    return `${minutes}m`
  }
  
  return `${minutes}m ${remainingSeconds}s`
}

export function formatTimeDetailed(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  
  return `${remainingSeconds}s`
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

export function groupByDate<T extends { date: string }>(data: T[]): Map<string, T[]> {
  const dateMap = new Map<string, T[]>()
  
  data.forEach(item => {
    if (!dateMap.has(item.date)) {
      dateMap.set(item.date, [])
    }
    dateMap.get(item.date)!.push(item)
  })
  
  return dateMap
}

export function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days)
  
  return { start, end }
}

export function formatDateReadable(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric',
    month: 'short'
  })
}

// ============================================================================
// PERFORMANCE STATUS
// ============================================================================

export type PerformanceStatus = 'excellent' | 'good' | 'fair' | 'needs-improvement'

export function getPerformanceStatus(accuracy: number): PerformanceStatus {
  if (accuracy >= 80) return 'excellent'
  if (accuracy >= 70) return 'good'
  if (accuracy >= 50) return 'fair'
  return 'needs-improvement'
}

export function getPerformanceColor(accuracy: number): string {
  const status = getPerformanceStatus(accuracy)
  
  switch (status) {
    case 'excellent':
      return 'text-green-600 bg-green-50'
    case 'good':
      return 'text-blue-600 bg-blue-50'
    case 'fair':
      return 'text-yellow-600 bg-yellow-50'
    case 'needs-improvement':
      return 'text-red-600 bg-red-50'
  }
}

export function getPerformanceMessage(accuracy: number): string {
  const status = getPerformanceStatus(accuracy)
  
  switch (status) {
    case 'excellent':
      return 'Luar biasa! Pertahankan! 🎉'
    case 'good':
      return 'Bagus! Terus tingkatkan! 💪'
    case 'fair':
      return 'Cukup baik, ayo semangat! 📚'
    case 'needs-improvement':
      return 'Yuk perbaiki dengan latihan! 🚀'
  }
}
