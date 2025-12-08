import { supabase } from './supabase'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UserStats {
  currentStreak: number
  longestStreak: number
  totalDailyChallenges: number
  totalMarathons: number
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

export interface MarathonData {
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
        totalMarathons: 0,
        totalSquadBattles: 0,
        totalTryOuts: 0,
        totalQuestions: 0,
        overallAccuracy: 0,
        avgTimePerQuestion: null
      }
    }

  // Get all question IDs to fetch their assessment types
  const questionIds = progressData.map(p => p.question_id).filter(Boolean)
  
  // Fetch question bank data separately
  const { data: questionBankData } = await supabase
    .from('question_bank')
    .select('id, assessment_type')
    .in('id', questionIds)
  
  // Create a map of question_id to assessment_type
  const questionTypeMap = new Map<string, string>()
  questionBankData?.forEach(q => {
    questionTypeMap.set(q.id, q.assessment_type)
  })
  
  // Add assessment_type to progress data
  const enrichedProgressData = progressData.map(p => ({
    ...p,
    assessment_type: questionTypeMap.get(p.question_id) || 'unknown'
  }))
  
  // Calculate streaks
  const dailyChallengeProgress = enrichedProgressData.filter(
    p => p.assessment_type === 'daily_challenge'
  )
  
  const uniqueDates = new Set(
    dailyChallengeProgress.map(p => new Date(p.created_at).toISOString().split('T')[0])
  )
  
  const sortedDates = Array.from(uniqueDates).sort().reverse()
  
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  
  const today = new Date().toISOString().split('T')[0]
  
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
  const marathonProgress = enrichedProgressData.filter(
    p => p.assessment_type === 'marathon'
  )
  const squadProgress = enrichedProgressData.filter(
    p => p.assessment_type === 'squad_battle'
  )
  const tryOutProgress = enrichedProgressData.filter(
    p => p.assessment_type === 'try_out'
  )

  // Count unique sessions (group by date for daily challenge, by session for others)
  const uniqueMarathonDates = new Set(
    marathonProgress.map(p => new Date(p.created_at).toISOString().split('T')[0])
  )
  const uniqueSquadDates = new Set(
    squadProgress.map(p => new Date(p.created_at).toISOString().split('T')[0])
  )
  const uniqueTryOutDates = new Set(
    tryOutProgress.map(p => new Date(p.created_at).toISOString().split('T')[0])
  )

  // Calculate overall stats
  const totalQuestions = enrichedProgressData.length
  const totalCorrect = enrichedProgressData.filter(p => p.is_correct).length
  const overallAccuracy = Math.round((totalCorrect / totalQuestions) * 100)
  
  // Calculate average time per question (if time_spent exists)
  const itemsWithTime = enrichedProgressData.filter(p => p.time_spent != null)
  const avgTimePerQuestion = itemsWithTime.length > 0
    ? Math.round(itemsWithTime.reduce((sum, p) => sum + (p.time_spent || 0), 0) / itemsWithTime.length)
    : null

  return {
    currentStreak,
    longestStreak,
    totalDailyChallenges: uniqueDates.size,
    totalMarathons: uniqueMarathonDates.size,
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

    // Get question types
    const questionIds = progressData.map(p => p.question_id).filter(Boolean)
    const { data: questionBankData } = await supabase
      .from('question_bank')
      .select('id, assessment_type')
      .in('id', questionIds)
    
    const questionTypeMap = new Map<string, string>()
    questionBankData?.forEach(q => {
      questionTypeMap.set(q.id, q.assessment_type)
    })

    // Filter for daily challenge only
    const dailyChallengeProgress = progressData.filter(
      p => questionTypeMap.get(p.question_id) === 'daily_challenge'
    )

    if (dailyChallengeProgress.length === 0) {
      return []
    }

  // Group by date
  const dateMap = new Map<string, any[]>()
  
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
    
    const directAnswers = items.filter(p => p.layer_accessed === 1).length
    const hintUsed = items.filter(p => p.layer_accessed === 2).length
    const solutionViewed = items.filter(p => p.layer_accessed === 3).length
    
    result.push({
      date,
      totalQuestions,
      correctAnswers,
      accuracy,
      directAnswers,
      hintUsed,
      solutionViewed
    })
  })

  return result.sort((a, b) => b.date.localeCompare(a.date))
  } catch (error) {
    console.error('Error in fetchDailyChallengeData:', error)
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

    // Get question types and subtests
    const questionIds = progressData.map(p => p.question_id).filter(Boolean)
    const { data: questionBankData } = await supabase
      .from('question_bank')
      .select('id, assessment_type, subtest')
      .in('id', questionIds)
    
    const questionDataMap = new Map<string, any>()
    questionBankData?.forEach(q => {
      questionDataMap.set(q.id, { assessment_type: q.assessment_type, subtest: q.subtest })
    })

    // Filter for try out only
    const tryOutProgress = progressData.filter(
      p => questionDataMap.get(p.question_id)?.assessment_type === 'try_out'
    )

    if (tryOutProgress.length === 0) {
      return []
    }

  // Group by date (assuming one try out per day)
  const dateMap = new Map<string, any[]>()
  
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
    
    const directAnswers = items.filter(p => p.layer_accessed === 1).length
    const hintUsed = items.filter(p => p.layer_accessed === 2).length
    const solutionViewed = items.filter(p => p.layer_accessed === 3).length
    
    // Calculate subtest scores
    const subtestMap = new Map<string, any[]>()
    items.forEach(p => {
      const subtest = questionDataMap.get(p.question_id)?.subtest || 'Unknown'
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
      hintUsed,
      solutionViewed
    })
  })

  return result
  } catch (error) {
    console.error('Error in fetchTryOutData:', error)
    throw error
  }
}

export async function fetchMarathonData(userId: string): Promise<MarathonData[]> {
  try {
    // First get all student progress
    const { data: progressData, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching marathon data:', error)
      throw error
    }

    if (!progressData || progressData.length === 0) {
      return []
    }

    // Get question types and subtests
    const questionIds = progressData.map(p => p.question_id).filter(Boolean)
    const { data: questionBankData } = await supabase
      .from('question_bank')
      .select('id, assessment_type, subtest')
      .in('id', questionIds)
    
    const questionDataMap = new Map<string, any>()
    questionBankData?.forEach(q => {
      questionDataMap.set(q.id, { assessment_type: q.assessment_type, subtest: q.subtest })
    })

    // Filter for marathon only
    const marathonProgress = progressData.filter(
      p => questionDataMap.get(p.question_id)?.assessment_type === 'marathon'
    )

    if (marathonProgress.length === 0) {
      return []
    }

  // Group by date (assuming one marathon per day)
  const dateMap = new Map<string, any[]>()
  
  marathonProgress.forEach(p => {
    const date = new Date(p.created_at).toISOString().split('T')[0]
    if (!dateMap.has(date)) {
      dateMap.set(date, [])
    }
    dateMap.get(date)!.push(p)
  })

  // Calculate stats per marathon
  const result: MarathonData[] = []
  
  dateMap.forEach((items, date) => {
    const totalQuestions = items.length
    const correctAnswers = items.filter(p => p.is_correct).length
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
    
    const directAnswers = items.filter(p => p.layer_accessed === 1).length
    const hintUsed = items.filter(p => p.layer_accessed === 2).length
    const solutionViewed = items.filter(p => p.layer_accessed === 3).length
    
    // Calculate subtest scores
    const subtestMap = new Map<string, any[]>()
    items.forEach(p => {
      const subtest = questionDataMap.get(p.question_id)?.subtest || 'Unknown'
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
      hintUsed,
      solutionViewed
    })
  })

  return result
  } catch (error) {
    console.error('Error in fetchMarathonData:', error)
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
    const questionIds = progressData.map(p => p.question_id).filter(Boolean)
    const { data: questionBankData } = await supabase
      .from('question_bank')
      .select('id, subtest, topic_id')
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
    
    const questionDataMap = new Map<string, any>()
    questionBankData?.forEach(q => {
      questionDataMap.set(q.id, { 
        subtest: q.subtest, 
        topic_name: topicNameMap.get(q.topic_id) || 'Unknown'
      })
    })

  // Group by subtest
  const subtestMap = new Map<string, any[]>()
  
  progressData.forEach(p => {
    const subtest = questionDataMap.get(p.question_id)?.subtest || 'Unknown'
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
    const topicMap = new Map<string, any[]>()
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
  marathonData: MarathonData[]
  progressData: ProgressData[]
}

export async function loadDashboardData(userId: string): Promise<DashboardData> {
  try {
    const [userStats, dailyChallengeData, marathonData, progressData] = await Promise.all([
      fetchUserStats(userId),
      fetchDailyChallengeData(userId),
      fetchMarathonData(userId),
      fetchProgressBySubtest(userId)
    ])

    return {
      userStats,
      dailyChallengeData,
      marathonData,
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
