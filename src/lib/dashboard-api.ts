import { supabase } from './supabase'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UserStats {
  currentStreak: number
  longestStreak: number
  totalDailyChallenges: number
  totalTryOutUTBK: number
  totalSquadBattles: number
  totalTryOuts: number
  totalQuestions: number
  overallAccuracy: number
  avgTimePerQuestion: number | null
}

export interface DailyChallengeData {
  date: string
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  directAnswers: number
  hintUsed: number
  solutionViewed: number
}

export interface TryOutUTBKData {
  id: string
  date: string
  totalScore: number
  accuracy: number
  subtestScores: SubtestScore[]
  directAnswers: number
  hintUsed: number
  solutionViewed: number
}

export interface SubtestScore {
  subtest: string
  score: number
  total: number
  accuracy: number
}

export interface SquadBattleData {
  id: string
  date: string
  rank: number
  score: number
  totalParticipants: number
  participants: Participant[]
  directAnswers: number
  hintUsed: number
  solutionViewed: number
}

export interface Participant {
  name: string
  score: number
  rank: number
}

export interface TryOutData {
  id: string
  date: string
  totalScore: number
  accuracy: number
  subtestScores: SubtestScore[]
  directAnswers: number
  hintUsed: number
  solutionViewed: number
}

// Internal minimal types for progress aggregation
type StudentProgress = {
  created_at: string
  is_correct: boolean
  hint_used?: boolean | null
  solution_viewed?: boolean | null
  assessment_type?: string | null
  assessment_id?: string | null
  question_id: string
  subtest_code?: string | null
}

export interface ProgressData {
  subtest: string
  accuracy: number
  totalQuestions: number
  correctAnswers: number
  topics: TopicProgress[]
}

export interface TopicProgress {
  name: string
  accuracy: number
  totalQuestions: number
  correctAnswers: number
  status: 'Kuat' | 'Cukup' | 'Lemah'
}

// ============================================================================
// DATA FETCHING WITH ERROR HANDLING
// ============================================================================

export async function fetchUserStats(userId: string): Promise<UserStats> {
  try {
    // Fetch all student progress (without join first to test)
    const { data: progressData, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', userId)

    if (error) {
      console.error('Error fetching user stats:', error)
      throw error
    }

    if (!progressData || progressData.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDailyChallenges: 0,
        totalTryOutUTBK: 0,
        totalSquadBattles: 0,
        totalTryOuts: 0,
        totalQuestions: 0,
        overallAccuracy: 0,
        avgTimePerQuestion: null
      }
    }

  // Calculate streaks - assessment_type is already in student_progress
  const dailyChallengeProgress = progressData.filter(
    p => p.assessment_type === 'daily_challenge'
  )
  
  const uniqueDates = new Set(
    dailyChallengeProgress.map(p => new Date(p.created_at).toISOString().split('T')[0])
  )
  
  const sortedDates = Array.from(uniqueDates).sort().reverse()
  
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  
  // Calculate current streak
  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i]
    const expectedDate = new Date()
    expectedDate.setDate(expectedDate.getDate() - i)
    const expectedDateStr = expectedDate.toISOString().split('T')[0]
    
    if (date === expectedDateStr) {
      currentStreak++
    } else {
      break
    }
  }
  
  // Calculate longest streak
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prevDate = new Date(sortedDates[i - 1])
      const currDate = new Date(sortedDates[i])
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  // Count assessment types
  const tryOutUTBKProgress = progressData.filter(
    p => p.assessment_type === 'tryout_utbk'
  )
  const squadProgress = progressData.filter(
    p => p.assessment_type === 'squad_battle'
  )
  const tryOutProgress = progressData.filter(
    p => p.assessment_type === 'try_out'
  )

  // Count unique sessions (group by date for daily challenge, by session for others)
  const uniqueTryOutUTBKDates = new Set(
    tryOutUTBKProgress.map(p => new Date(p.created_at).toISOString().split('T')[0])
  )
  const uniqueSquadDates = new Set(
    squadProgress.map(p => new Date(p.created_at).toISOString().split('T')[0])
  )
  const uniqueTryOutDates = new Set(
    tryOutProgress.map(p => new Date(p.created_at).toISOString().split('T')[0])
  )

  // Calculate overall stats
  const totalQuestions = progressData.length
  const totalCorrect = progressData.filter(p => p.is_correct).length
  const overallAccuracy = Math.round((totalCorrect / totalQuestions) * 100)
  
  // Calculate average time per question (if time_spent exists)
  const itemsWithTime = progressData.filter(p => p.time_spent != null)
  const avgTimePerQuestion = itemsWithTime.length > 0
    ? Math.round(itemsWithTime.reduce((sum, p) => sum + (p.time_spent || 0), 0) / itemsWithTime.length)
    : null

  return {
    currentStreak,
    longestStreak,
    totalDailyChallenges: uniqueDates.size,
    totalTryOutUTBK: uniqueTryOutUTBKDates.size,
    totalSquadBattles: uniqueSquadDates.size,
    totalTryOuts: uniqueTryOutDates.size,
    totalQuestions,
    overallAccuracy,
    avgTimePerQuestion
  }
  } catch (error) {
    console.error('Error in fetchUserStats:', error)
    throw error
  }
}

export async function fetchDailyChallengeData(userId: string): Promise<DailyChallengeData[]> {
  try {
    // First get all student progress
    const { data: progressData, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching daily challenge data:', error)
      throw error
    }

    if (!progressData || progressData.length === 0) {
      return []
    }

    // Filter for daily challenge only - assessment_type is in student_progress
    const dailyChallengeProgress = progressData.filter(
      p => p.assessment_type === 'daily_challenge'
    )

    if (dailyChallengeProgress.length === 0) {
      return []
    }

  // Group by date
  type StudentProgress = {
    created_at: string
    is_correct: boolean
    hint_used?: boolean | null
    solution_viewed?: boolean | null
    assessment_type?: string | null
    assessment_id?: string | null
    question_id: string
    subtest_code?: string | null
  }
  const dateMap = new Map<string, StudentProgress[]>()
  
  dailyChallengeProgress.forEach(p => {
    const date = new Date(p.created_at).toISOString().split('T')[0]
    if (!dateMap.has(date)) {
      dateMap.set(date, [])
    }
    dateMap.get(date)!.push(p)
  })

  // Calculate stats per date
  const result: DailyChallengeData[] = []
  
  dateMap.forEach((items, date) => {
    const totalQuestions = items.length
    const correctAnswers = items.filter(p => p.is_correct).length
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
    
    const hintUsedCount = items.filter(p => p.hint_used === true).length
    const solutionViewedCount = items.filter(p => p.solution_viewed === true).length
    const directAnswers = totalQuestions - hintUsedCount - solutionViewedCount
    
    result.push({
      date,
      totalQuestions,
      correctAnswers,
      accuracy,
      directAnswers,
      hintUsed: hintUsedCount,
      solutionViewed: solutionViewedCount
    })
  })

  return result.sort((a, b) => b.date.localeCompare(a.date))
  } catch (error) {
    console.error('Error in fetchDailyChallengeData:', error)
    throw error
  }
}

export async function fetchMiniTryOutData(userId: string): Promise<TryOutData[]> {
  try {
    // First get all student progress
    const { data: progressData, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching mini try out data:', error.message || error)
      throw new Error(`Failed to fetch mini try out data: ${error.message || 'Unknown error'}`)
    }

    if (!progressData || progressData.length === 0) {
      return []
    }

    // Filter for mini_tryout only - assessment_type is in student_progress
    const miniTryOutProgress = progressData.filter(
      p => p.assessment_type === 'mini_tryout'
    )

    if (miniTryOutProgress.length === 0) {
      return []
    }

    // Group by assessment_id (session)
    const sessionMap = new Map<string, StudentProgress[]>()
    
    miniTryOutProgress.forEach(p => {
      const sessionId = p.assessment_id || new Date(p.created_at).toISOString().split('T')[0]
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, [])
      }
      sessionMap.get(sessionId)!.push(p)
    })

    // Calculate stats per session
    const result: TryOutData[] = []
    
    sessionMap.forEach((items, sessionId) => {
      const totalQuestions = items.length
      const correctAnswers = items.filter(p => p.is_correct).length
      const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
      
      const hintUsedCount = items.filter(p => p.hint_used === true).length
      const solutionViewedCount = items.filter(p => p.solution_viewed === true).length
      const directAnswers = totalQuestions - hintUsedCount - solutionViewedCount
      
      // Calculate subtest scores
      const subtestMap = new Map<string, StudentProgress[]>()
      items.forEach(p => {
        const subtest = p.subtest_code || 'Unknown'
        if (!subtestMap.has(subtest)) {
          subtestMap.set(subtest, [])
        }
        subtestMap.get(subtest)!.push(p)
      })
      
      const subtestScores: SubtestScore[] = []
      subtestMap.forEach((subtestItems, subtest) => {
        const total = subtestItems.length
        const correct = subtestItems.filter(p => p.is_correct).length
        const subtestAccuracy = Math.round((correct / total) * 100)
        
        subtestScores.push({
          subtest,
          score: correct,
          total,
          accuracy: subtestAccuracy
        })
      })
      
      // Use first item's created_at as date
      const date = new Date(items[0].created_at).toISOString().split('T')[0]
      
      result.push({
        id: sessionId,
        date,
        totalScore: correctAnswers,
        accuracy,
        subtestScores,
        directAnswers,
        hintUsed: hintUsedCount,
        solutionViewed: solutionViewedCount
      })
    })

    return result.sort((a, b) => b.date.localeCompare(a.date))
  } catch (error) {
    console.error('Error in fetchMiniTryOutData:', error)
    throw error
  }
}

export async function fetchTryOutData(userId: string): Promise<TryOutData[]> {
  try {
    // First get all student progress
    const { data: progressData, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching try out data:', error)
      throw error
    }

    if (!progressData || progressData.length === 0) {
      return []
    }

    // Filter for try out only - assessment_type is in student_progress
    const tryOutProgress = progressData.filter(
      p => p.assessment_type === 'try_out'
    )

    if (tryOutProgress.length === 0) {
      return []
    }

    // Get subtests from question_bank
    // Note: question_bank uses 'subtest_utbk' column, not 'subtest_code'
    const questionIds = tryOutProgress.map(p => p.question_id).filter(Boolean)
    const { data: questionBankData } = await supabase
      .from('question_bank')
      .select('id, subtest_utbk')
      .in('id', questionIds)
    
    type QuestionMeta = { subtest_code?: string }
    const questionDataMap = new Map<string, QuestionMeta>()
    questionBankData?.forEach(q => {
      questionDataMap.set(q.id, { subtest_code: q.subtest_utbk })
    })

  // Group by date (assuming one try out per day)
  const dateMap = new Map<string, StudentProgress[]>()
  
  tryOutProgress.forEach(p => {
    const date = new Date(p.created_at).toISOString().split('T')[0]
    if (!dateMap.has(date)) {
      dateMap.set(date, [])
    }
    dateMap.get(date)!.push(p)
  })

  // Calculate stats per try out
  const result: TryOutData[] = []
  
  dateMap.forEach((items, date) => {
    const totalQuestions = items.length
    const correctAnswers = items.filter(p => p.is_correct).length
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
    
    const hintUsedCount = items.filter(p => p.hint_used === true).length
    const solutionViewedCount = items.filter(p => p.solution_viewed === true).length
    const directAnswers = totalQuestions - hintUsedCount - solutionViewedCount
    
    // Calculate subtest scores
    const subtestMap = new Map<string, StudentProgress[]>()
    items.forEach(p => {
      const subtest = questionDataMap.get(p.question_id)?.subtest_code || 'Unknown'
      if (!subtestMap.has(subtest)) {
        subtestMap.set(subtest, [])
      }
      subtestMap.get(subtest)!.push(p)
    })
    
    const subtestScores: SubtestScore[] = []
    subtestMap.forEach((subtestItems, subtest) => {
      const total = subtestItems.length
      const correct = subtestItems.filter(p => p.is_correct).length
      const subtestAccuracy = Math.round((correct / total) * 100)
      
      subtestScores.push({
        subtest,
        score: correct,
        total,
        accuracy: subtestAccuracy
      })
    })
    
    result.push({
      id: date,
      date,
      totalScore: correctAnswers,
      accuracy,
      subtestScores,
      directAnswers,
      hintUsed: hintUsedCount,
      solutionViewed: solutionViewedCount
    })
  })

  return result
  } catch (error) {
    console.error('Error in fetchTryOutData:', error)
    throw error
  }
}

export async function fetchTryOutUTBKData(userId: string): Promise<TryOutUTBKData[]> {
  try {
    // First get all student progress
    const { data: progressData, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching Try Out UTBK data:', error)
      throw error
    }

    if (!progressData || progressData.length === 0) {
      return []
    }

    // Filter for Try Out UTBK only - assessment_type is in student_progress
    const tryOutUTBKProgress = progressData.filter(
      p => p.assessment_type === 'tryout_utbk'
    )

    if (tryOutUTBKProgress.length === 0) {
      return []
    }

    // Get subtests from question_bank
    // Note: question_bank uses 'subtest_utbk' column, not 'subtest_code'
    const questionIds = tryOutUTBKProgress.map(p => p.question_id).filter(Boolean)
    const { data: questionBankData } = await supabase
      .from('question_bank')
      .select('id, subtest_utbk')
      .in('id', questionIds)
    
    type QuestionMeta = { subtest_code?: string }
    const questionDataMap = new Map<string, QuestionMeta>()
    questionBankData?.forEach(q => {
      questionDataMap.set(q.id, { subtest_code: q.subtest_utbk })
    })

  // Group by date (assuming one Try Out UTBK per day)
  const dateMap = new Map<string, StudentProgress[]>()
  
  tryOutUTBKProgress.forEach(p => {
    const date = new Date(p.created_at).toISOString().split('T')[0]
    if (!dateMap.has(date)) {
      dateMap.set(date, [])
    }
    dateMap.get(date)!.push(p)
  })

  // Calculate stats per Try Out UTBK
  const result: TryOutUTBKData[] = []
  
  dateMap.forEach((items, date) => {
    const totalQuestions = items.length
    const correctAnswers = items.filter(p => p.is_correct).length
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
    
    const hintUsedCount = items.filter(p => p.hint_used === true).length
    const solutionViewedCount = items.filter(p => p.solution_viewed === true).length
    const directAnswers = totalQuestions - hintUsedCount - solutionViewedCount
    
    // Calculate subtest scores
    const subtestMap = new Map<string, StudentProgress[]>()
    items.forEach(p => {
      const subtest = questionDataMap.get(p.question_id)?.subtest_code || 'Unknown'
      if (!subtestMap.has(subtest)) {
        subtestMap.set(subtest, [])
      }
      subtestMap.get(subtest)!.push(p)
    })
    
    const subtestScores: SubtestScore[] = []
    subtestMap.forEach((subtestItems, subtest) => {
      const total = subtestItems.length
      const correct = subtestItems.filter(p => p.is_correct).length
      const subtestAccuracy = Math.round((correct / total) * 100)
      
      subtestScores.push({
        subtest,
        score: correct,
        total,
        accuracy: subtestAccuracy
      })
    })
    
    result.push({
      id: date,
      date,
      totalScore: correctAnswers,
      accuracy,
      subtestScores,
      directAnswers,
      hintUsed: hintUsedCount,
      solutionViewed: solutionViewedCount
    })
  })

  return result
  } catch (error) {
    console.error('Error in fetchTryOutUTBKData:', error)
    throw error
  }
}

export async function fetchProgressBySubtest(userId: string): Promise<ProgressData[]> {
  try {
    const { data: progressData, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', userId)

    if (error) {
      console.error('Error fetching progress by subtest:', error)
      throw error
    }

    if (!progressData || progressData.length === 0) {
      return []
    }

    // Get question data with subtest and topic
    // Note: question_bank uses 'subtest_utbk' column, not 'subtest_code'
    const questionIds = progressData.map(p => p.question_id).filter(Boolean)
    const { data: questionBankData } = await supabase
      .from('question_bank')
      .select('id, subtest_utbk, topic_id')
      .in('id', questionIds)
    
    // Get topic names
    const topicIds = questionBankData?.map(q => q.topic_id).filter(Boolean) || []
    const { data: topicsData } = await supabase
      .from('topics')
      .select('id, name')
      .in('id', topicIds)
    
    const topicNameMap = new Map<string, string>()
    topicsData?.forEach(t => {
      topicNameMap.set(t.id, t.name)
    })
    
    type QuestionMeta = { subtest_code?: string; topic_name?: string }
    const questionDataMap = new Map<string, QuestionMeta>()
    questionBankData?.forEach(q => {
      questionDataMap.set(q.id, { 
        subtest_code: q.subtest_utbk, // Map subtest_utbk to subtest_code
        topic_name: topicNameMap.get(q.topic_id) || 'Unknown'
      })
    })

  // Group by subtest
  const subtestMap = new Map<string, StudentProgress[]>()
  
  progressData.forEach(p => {
    const subtest = questionDataMap.get(p.question_id)?.subtest_code || 'Unknown'
    if (!subtestMap.has(subtest)) {
      subtestMap.set(subtest, [])
    }
    subtestMap.get(subtest)!.push(p)
  })

  const result: ProgressData[] = []
  
  subtestMap.forEach((items, subtest) => {
    const totalQuestions = items.length
    const correctAnswers = items.filter(p => p.is_correct).length
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
    
    // Group by topic
    const topicMap = new Map<string, StudentProgress[]>()
    items.forEach(p => {
      const topicName = questionDataMap.get(p.question_id)?.topic_name || 'Unknown'
      if (!topicMap.has(topicName)) {
        topicMap.set(topicName, [])
      }
      topicMap.get(topicName)!.push(p)
    })
    
    const topics: TopicProgress[] = []
    topicMap.forEach((topicItems, topicName) => {
      const topicTotal = topicItems.length
      const topicCorrect = topicItems.filter(p => p.is_correct).length
      const topicAccuracy = Math.round((topicCorrect / topicTotal) * 100)
      
      let status: 'Kuat' | 'Cukup' | 'Lemah' = 'Lemah'
      if (topicAccuracy > 70) status = 'Kuat'
      else if (topicAccuracy >= 50) status = 'Cukup'
      
      topics.push({
        name: topicName,
        accuracy: topicAccuracy,
        totalQuestions: topicTotal,
        correctAnswers: topicCorrect,
        status
      })
    })
    
    result.push({
      subtest,
      accuracy,
      totalQuestions,
      correctAnswers,
      topics: topics.sort((a, b) => a.accuracy - b.accuracy) // Sort by accuracy (weakest first)
    })
  })

  return result.sort((a, b) => b.accuracy - a.accuracy) // Sort by accuracy (strongest first)
  } catch (error) {
    console.error('Error in fetchProgressBySubtest:', error)
    throw error
  }
}

// ============================================================================
// AGGREGATED DATA FETCHING (Load all dashboard data in parallel)
// ============================================================================

export interface DashboardData {
  userStats: UserStats
  dailyChallengeData: DailyChallengeData[]
  tryOutUTBKData: TryOutUTBKData[]
  progressData: ProgressData[]
}

export async function loadDashboardData(userId: string): Promise<DashboardData> {
  try {
    const [userStats, dailyChallengeData, tryOutUTBKData, progressData] = await Promise.all([
      fetchUserStats(userId),
      fetchDailyChallengeData(userId),
      fetchTryOutUTBKData(userId),
      fetchProgressBySubtest(userId)
    ])

    return {
      userStats,
      dailyChallengeData,
      tryOutUTBKData,
      progressData
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    throw error
  }
}

// ============================================================================
// RETRY LOGIC WRAPPER
// ============================================================================

export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn()
    } catch (error) {
      lastError = error as Error
      console.warn(`Attempt ${attempt} failed:`, error)
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
      }
    }
  }
  
  throw lastError || new Error('Failed after retries')
}
