import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface RemedialTier {
  tier: 1 | 2 | 3
  name: string
  description: string
  target_accuracy: number
  question_types: ('regular' | 'hots')[]
  difficulty_level: 'easy' | 'medium' | 'hard'
  session_length: number
  prerequisites: {
    min_accuracy?: number
    previous_tier?: number
    min_questions?: number
  }
  progression_criteria: {
    accuracy_threshold: number
    consistency_requirement: number
    min_questions_completed: number
  }
}

interface RemedialSession {
  id: string
  tier: number
  title: string
  description: string
  questions: any[]
  total_questions: number
  estimated_duration_minutes: number
  target_subtest: string
  current_accuracy: number
  target_accuracy: number
  next_tier_requirements: string[]
}

const REMEDIAL_TIERS: RemedialTier[] = [
  {
    tier: 1,
    name: 'Foundation Building',
    description: 'Focus on basic concepts and step-by-step problem solving',
    target_accuracy: 60,
    question_types: ['regular'],
    difficulty_level: 'easy',
    session_length: 12,
    prerequisites: {
      min_questions: 5
    },
    progression_criteria: {
      accuracy_threshold: 60,
      consistency_requirement: 3,
      min_questions_completed: 10
    }
  },
  {
    tier: 2,
    name: 'Concept Reinforcement',
    description: 'Strengthen understanding with mixed difficulty problems',
    target_accuracy: 70,
    question_types: ['regular', 'hots'],
    difficulty_level: 'medium',
    session_length: 15,
    prerequisites: {
      previous_tier: 1,
      min_accuracy: 60,
      min_questions: 10
    },
    progression_criteria: {
      accuracy_threshold: 70,
      consistency_requirement: 3,
      min_questions_completed: 12
    }
  },
  {
    tier: 3,
    name: 'Advanced Mastery',
    description: 'Challenge with complex problems and HOTS questions',
    target_accuracy: 80,
    question_types: ['hots'],
    difficulty_level: 'hard',
    session_length: 18,
    prerequisites: {
      previous_tier: 2,
      min_accuracy: 70,
      min_questions: 15
    },
    progression_criteria: {
      accuracy_threshold: 80,
      consistency_requirement: 3,
      min_questions_completed: 15
    }
  }
]

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { targetSubtest, tier: requestedTier } = body

    if (!targetSubtest) {
      return NextResponse.json(
        { error: 'Target subtest required' },
        { status: 400 }
      )
    }

    // Analyze current performance and determine appropriate tier
    const currentPerformance = await analyzeCurrentPerformance(supabase, user.id, targetSubtest)
    const recommendedTier = await determineRecommendedTier(supabase, user.id, targetSubtest, currentPerformance, requestedTier)

    // Generate remedial session
    const session = await generateRemedialSession(supabase, user.id, targetSubtest, recommendedTier, currentPerformance)

    // Track remedial progress
    await trackRemedialProgress(supabase, user.id, targetSubtest, recommendedTier, session)

    return NextResponse.json({
      success: true,
      session,
      current_performance: currentPerformance,
      tier_info: REMEDIAL_TIERS[recommendedTier - 1],
      progression_path: await generateProgressionPath(supabase, user.id, targetSubtest, recommendedTier),
      recommendations: generateTierRecommendations(recommendedTier, currentPerformance)
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to start remedial session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function analyzeCurrentPerformance(supabase: any, userId: string, subtestCode: string) {
  const { data: progressData } = await supabase
    .from('student_progress')
    .select(`
      question_id,
      is_correct,
      created_at,
      questions:question_id (
        subtest_utbk,
        is_hots
      )
    `)
    .eq('student_id', userId)
    .eq('questions.subtest_utbk', subtestCode)
    .order('created_at', { ascending: false })

  if (!progressData || progressData.length === 0) {
    return {
      total_questions: 0,
      correct_answers: 0,
      accuracy: 0,
      hots_accuracy: 0,
      regular_accuracy: 0,
      recent_trend: 'insufficient_data',
      consistency_score: 0,
      ready_for_tier: 1
    }
  }

  const totalQuestions = progressData.length
  const correctAnswers = progressData.filter((p: any) => p.is_correct).length
  const accuracy = (correctAnswers / totalQuestions) * 100

  // Analyze HOTS vs Regular performance
  const hotsQuestions = progressData.filter((p: any) => {
      const question = p.questions as any
      return question?.is_hots
    })
    const regularQuestions = progressData.filter((p: any) => {
      const question = p.questions as any
      return question && !question.is_hots
    })

  const hotsAccuracy = hotsQuestions.length > 0 
    ? (hotsQuestions.filter((p: any) => p.is_correct).length / hotsQuestions.length) * 100 
    : 0
  const regularAccuracy = regularQuestions.length > 0 
    ? (regularQuestions.filter((p: any) => p.is_correct).length / regularQuestions.length) * 100 
    : 0

  // Analyze recent trend (last 10 questions)
  const recentQuestions = progressData.slice(0, 10)
  const recentAccuracy = recentQuestions.length > 0 
    ? (recentQuestions.filter((p: any) => p.is_correct).length / recentQuestions.length) * 100 
    : 0

  let recentTrend: 'improving' | 'declining' | 'stable' | 'insufficient_data'
  if (recentQuestions.length < 5) {
    recentTrend = 'insufficient_data'
  } else {
    const olderQuestions = progressData.slice(10, 20)
    const olderAccuracy = olderQuestions.length > 0 
      ? (olderQuestions.filter((p: any) => p.is_correct).length / olderQuestions.length) * 100 
      : 0
    
    if (recentAccuracy > olderAccuracy + 10) {
      recentTrend = 'improving'
    } else if (recentAccuracy < olderAccuracy - 10) {
      recentTrend = 'declining'
    } else {
      recentTrend = 'stable'
    }
  }

  // Calculate consistency score
  const consistencyScore = calculateConsistencyScore(progressData)

  return {
    total_questions: totalQuestions,
    correct_answers: correctAnswers,
    accuracy: Math.round(accuracy),
    hots_accuracy: Math.round(hotsAccuracy),
    regular_accuracy: Math.round(regularAccuracy),
    recent_trend: recentTrend,
    consistency_score: consistencyScore,
    ready_for_tier: determineReadyTier(accuracy, consistencyScore, totalQuestions)
  }
}

function calculateConsistencyScore(progressData: any[]): number {
  if (progressData.length < 5) return 0

  // Calculate rolling accuracy over windows of 5 questions
  const windows: number[] = []
  for (let i = 0; i <= progressData.length - 5; i++) {
    const window = progressData.slice(i, i + 5)
    const accuracy = (window.filter((p: any) => p.is_correct).length / 5) * 100
    windows.push(accuracy)
  }

  if (windows.length === 0) return 0

  // Calculate standard deviation
  const mean = windows.reduce((sum, acc) => sum + acc, 0) / windows.length
  const variance = windows.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / windows.length
  const standardDeviation = Math.sqrt(variance)

  // Convert to consistency score (lower deviation = higher consistency)
  const consistencyScore = Math.max(0, 100 - standardDeviation)
  return Math.round(consistencyScore)
}

function determineReadyTier(accuracy: number, consistency: number, totalQuestions: number): number {
  if (totalQuestions < 5) return 1
  if (accuracy >= 75 && consistency >= 70) return 3
  if (accuracy >= 60 && consistency >= 60) return 2
  return 1
}

async function determineRecommendedTier(
  supabase: any, 
  userId: string, 
  subtestCode: string, 
  currentPerformance: any, 
  requestedTier?: number
): Promise<number> {
  // If user specifically requests a tier and meets prerequisites
  if (requestedTier && requestedTier >= 1 && requestedTier <= 3) {
    const tier = REMEDIAL_TIERS[requestedTier - 1]
    const meetsPrerequisites = checkTierPrerequisites(tier, currentPerformance)
    
    if (meetsPrerequisites) {
      return requestedTier
    }
  }

  // Auto-determine based on performance
  return currentPerformance.ready_for_tier
}

function checkTierPrerequisites(tier: RemedialTier, performance: any): boolean {
  if (tier.prerequisites.min_accuracy && performance.accuracy < tier.prerequisites.min_accuracy) {
    return false
  }
  
  if (tier.prerequisites.min_questions && performance.total_questions < tier.prerequisites.min_questions) {
    return false
  }
  
  return true
}

async function generateRemedialSession(
  supabase: any, 
  userId: string, 
  subtestCode: string, 
  tier: number, 
  currentPerformance: any
): Promise<RemedialSession> {
  const tierConfig = REMEDIAL_TIERS[tier - 1]
  
  // Build query based on tier requirements
  let query = supabase
    .from('question_bank')
    .select('*')
    .eq('subtest_utbk', subtestCode)

  // Apply HOTS/Regular filter based on tier
  if (tierConfig.question_types.length === 1) {
    query = query.eq('is_hots', tierConfig.question_types[0] === 'hots')
  }

  // Apply difficulty-based ordering
  if (tierConfig.difficulty_level === 'easy') {
    query = query.order('id', { ascending: true }) // Older/easier questions first
  } else if (tierConfig.difficulty_level === 'hard') {
    query = query.order('id', { ascending: false }) // Newer/harder questions first
  }

  const { data: questions } = await query.limit(tierConfig.session_length)

  const sessionQuestions = questions?.map((q: any) => ({
    id: q.id,
    question_text: q.question_text,
    options: [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e],
    correct_answer: q.correct_answer,
    subtest_code: q.subtest_utbk,
    topic_name: `Tier ${tier} Remedial`,
    difficulty_level: tierConfig.difficulty_level,
    question_type: q.is_hots ? 'HOTS' : 'Regular',
    tier_context: {
      tier,
      target_accuracy: tierConfig.target_accuracy,
      is_remedial: true
    }
  })) || []

  return {
    id: `remedial_t${tier}_${Date.now()}`,
    tier,
    title: `${tierConfig.name} - ${subtestCode}`,
    description: tierConfig.description,
    questions: sessionQuestions,
    total_questions: sessionQuestions.length,
    estimated_duration_minutes: Math.ceil(sessionQuestions.length * 2.5),
    target_subtest: subtestCode,
    current_accuracy: currentPerformance.accuracy,
    target_accuracy: tierConfig.target_accuracy,
    next_tier_requirements: generateNextTierRequirements(tierConfig)
  }
}

function generateNextTierRequirements(currentTier: RemedialTier): string[] {
  if (currentTier.tier === 3) {
    return ['🎉 Maximum tier reached! Focus on maintaining performance']
  }

  const nextTier = REMEDIAL_TIERS[currentTier.tier]
  return [
    `✅ Achieve ${currentTier.progression_criteria.accuracy_threshold}% accuracy`,
    `✅ Complete ${currentTier.progression_criteria.min_questions_completed} questions`,
    `✅ Maintain consistency for ${currentTier.progression_criteria.consistency_requirement} sessions`
  ]
}

async function trackRemedialProgress(
  supabase: any, 
  userId: string, 
  subtestCode: string, 
  tier: number, 
  session: RemedialSession
) {
  const { error } = await supabase
    .from('remedial_sessions')
    .insert({
      user_id: userId,
      subtest_code: subtestCode,
      tier,
      session_id: session.id,
      started_at: new Date().toISOString(),
      target_accuracy: session.target_accuracy,
      current_accuracy: session.current_accuracy,
      total_questions: session.total_questions,
      status: 'in_progress'
    })

  if (error) {
    console.error('Error tracking remedial progress:', error)
  }
}

async function generateProgressionPath(
  supabase: any, 
  userId: string, 
  subtestCode: string, 
  currentTier: number
) {
  const path = []
  
  for (let tier = 1; tier <= 3; tier++) {
    const tierConfig = REMEDIAL_TIERS[tier - 1] as RemedialTier
    const isCompleted = tier < currentTier
    const isCurrent = tier === currentTier
    const isLocked = tier > currentTier

    path.push({
      tier,
      name: tierConfig.name,
      description: tierConfig.description,
      status: isCompleted ? 'completed' : isCurrent ? 'current' : 'locked',
      target_accuracy: tierConfig.target_accuracy,
      requirements: tierConfig.progression_criteria
    })
  }

  return path
}

function generateTierRecommendations(tier: number, performance: any): string[] {
  const recommendations: string[] = []
  
  switch (tier) {
    case 1:
      recommendations.push('📚 Focus on understanding basic concepts first')
      recommendations.push('👨‍🏫 Use step-by-step problem solving methods')
      recommendations.push('📝 Take notes on problem-solving strategies')
      if (performance.recent_trend === 'declining') {
        recommendations.push('⚠️ Your performance is declining - review fundamentals')
      }
      break
      
    case 2:
      recommendations.push('🎯 Practice mixed difficulty problems')
      recommendations.push('🧠 Start developing HOTS problem-solving skills')
      recommendations.push('📊 Track your progress regularly')
      if (performance.hots_accuracy < performance.regular_accuracy - 15) {
        recommendations.push('🔥 Focus more on HOTS question strategies')
      }
      break
      
    case 3:
      recommendations.push('🚀 Challenge yourself with complex problems')
      recommendations.push('⏱️ Practice time management for difficult questions')
      recommendations.push('🏆 Prepare for competitive exam scenarios')
      break
  }
  
  if (performance.consistency_score < 60) {
    recommendations.push('📈 Work on consistency - practice regularly')
  }
  
  return recommendations
}