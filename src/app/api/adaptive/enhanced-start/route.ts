import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface WeaknessAnalysis {
  subtest_code: string
  accuracy: number
  total_questions: number
  weakness_level: 'critical' | 'moderate' | 'minor' | 'none'
  confidence_score: number
  recommended_actions: string[]
}

interface AdaptiveSession {
  id: string
  type: 'remedial' | 'practice' | 'challenge' | 'mixed'
  title: string
  description: string
  questions: any[]
  total_questions: number
  estimated_duration_minutes: number
  difficulty_progression: 'easy_to_medium' | 'medium_to_hard' | 'mixed'
  target_improvement: number
}

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
    const { sessionId, targetSubtest } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    // Enhanced weakness analysis
    const weaknessAnalysis = await analyzeWeakness(supabase, user.id)
    const assessmentId = `adaptive_${Date.now()}`

    let session: AdaptiveSession | null = null

    switch (sessionId) {
      case 'comprehensive-remedial':
        session = await generateComprehensiveRemedial(supabase, user.id, weaknessAnalysis, targetSubtest)
        break
        
      case 'targeted-practice':
        session = await generateTargetedPractice(supabase, user.id, weaknessAnalysis, targetSubtest)
        break
        
      case 'progressive-challenge':
        session = await generateProgressiveChallenge(supabase, user.id, weaknessAnalysis, targetSubtest)
        break
        
      case 'smart-mix':
        session = await generateSmartMix(supabase, user.id, weaknessAnalysis)
        break
        
      default:
        // Fallback to original logic
        session = await generateFallbackSession(supabase, user.id, sessionId)
        break
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to generate session' },
        { status: 500 }
      )
    }

    // Create assessment record with enhanced metadata
    const { error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        id: assessmentId,
        user_id: user.id,
        type: 'adaptive_session',
        status: 'in_progress',
        metadata: {
          session_id: sessionId,
          question_count: session.total_questions,
          weakness_analysis: weaknessAnalysis,
          target_improvement: session.target_improvement,
          difficulty_progression: session.difficulty_progression
        }
      })

    if (assessmentError) {
      console.error('Error creating assessment:', assessmentError)
    }

    return NextResponse.json({
      success: true,
      session: session,
      weakness_analysis: weaknessAnalysis,
      recommendations: generatePersonalizedRecommendations(weaknessAnalysis)
    })

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to start adaptive session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function analyzeWeakness(supabase: any, userId: string): Promise<WeaknessAnalysis[]> {
  // Get comprehensive performance data
  const { data: progressData } = await supabase
    .from('student_progress')
    .select(`
      question_id,
      is_correct,
      created_at,
      questions:question_id (
        subtest_utbk,
        is_hots,
        topic_id
      )
    `)
    .eq('student_id', userId)
    .order('created_at', { ascending: false })

  if (!progressData || progressData.length === 0) {
    return []
  }

  // Analyze performance by subtest and question type
  const subtestStats = new Map<string, {
    total: number
    correct: number
    hots_total: number
    hots_correct: number
    regular_total: number
    regular_correct: number
  }>()

  progressData.forEach((p: any) => {
    const question = p.questions as any
    if (!question?.subtest_utbk) return

    const subtest = question.subtest_utbk
    if (!subtestStats.has(subtest)) {
      subtestStats.set(subtest, {
        total: 0,
        correct: 0,
        hots_total: 0,
        hots_correct: 0,
        regular_total: 0,
        regular_correct: 0
      })
    }

    const stats = subtestStats.get(subtest)!
    stats.total++
    
    if (p.is_correct) {
      stats.correct++
    }

    if (question.is_hots) {
      stats.hots_total++
      if (p.is_correct) stats.hots_correct++
    } else {
      stats.regular_total++
      if (p.is_correct) stats.regular_correct++
    }
  })

  // Generate weakness analysis for each subtest
  const analysis: WeaknessAnalysis[] = []

  subtestStats.forEach((stats, subtest_code) => {
    const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
    const hots_accuracy = stats.hots_total > 0 ? (stats.hots_correct / stats.hots_total) * 100 : 0
    const regular_accuracy = stats.regular_total > 0 ? (stats.regular_correct / stats.regular_total) * 100 : 0

    // Determine weakness level
    let weakness_level: WeaknessAnalysis['weakness_level']
    let confidence_score = 0
    let recommended_actions: string[] = []

    if (accuracy < 40) {
      weakness_level = 'critical'
      confidence_score = 0.9
      recommended_actions = [
        `Intensive remedial for ${subtest_code}`,
        'Focus on basic concepts',
        'Step-by-step problem solving practice',
        'Consider peer tutoring'
      ]
    } else if (accuracy < 60) {
      weakness_level = 'moderate'
      confidence_score = 0.7
      recommended_actions = [
        `Targeted practice for ${subtest_code}`,
        'Review fundamental concepts',
        'Practice with guided solutions'
      ]
    } else if (accuracy < 75) {
      weakness_level = 'minor'
      confidence_score = 0.5
      recommended_actions = [
        `Occasional practice for ${subtest_code}`,
        'Focus on advanced topics'
      ]
    } else {
      weakness_level = 'none'
      confidence_score = 0.3
      recommended_actions = [
        'Challenge yourself with harder problems',
        'Explore advanced topics'
      ]
    }

    // Additional analysis for HOTS vs Regular performance
    if (hots_accuracy < regular_accuracy - 15) {
      recommended_actions.push('Special focus on HOTS problem-solving strategies')
    }

    analysis.push({
      subtest_code,
      accuracy: Math.round(accuracy),
      total_questions: stats.total,
      weakness_level,
      confidence_score,
      recommended_actions
    })
  })

  return analysis.sort((a, b) => b.accuracy - a.accuracy) // Sort by worst performance first
}

async function generateComprehensiveRemedial(supabase: any, userId: string, weaknessAnalysis: WeaknessAnalysis[], targetSubtest?: string): Promise<AdaptiveSession> {
  // Focus on critical and moderate weakness areas
  const targetAreas = weaknessAnalysis.filter(w => 
    w.weakness_level === 'critical' || w.weakness_level === 'moderate'
  )

  if (targetAreas.length === 0) {
    throw new Error('No significant weakness areas found for remedial')
  }

  // Get questions from weak areas
  const subtestCodes = targetAreas.map(w => w.subtest_code)
  const { data: questions } = await supabase
    .from('question_bank')
    .select('*')
    .in('subtest_utbk', subtestCodes)
    .eq('is_hots', false) // Start with regular questions
    .limit(20)

  const remedialQuestions = questions?.map((q: any) => ({
    id: q.id,
    question_text: q.question_text,
    options: [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e],
    correct_answer: q.correct_answer,
    subtest_code: q.subtest_utbk,
    topic_name: 'Remedial',
    difficulty_level: 'easy' as const,
    question_type: q.is_hots ? 'HOTS' : 'Regular'
  })) || []

  return {
    id: `remedial_${Date.now()}`,
    type: 'remedial',
    title: `Comprehensive Remedial - ${targetAreas.length} Areas`,
    description: `Focus on ${targetAreas.map(a => a.subtest_code).join(', ')}`,
    questions: remedialQuestions,
    total_questions: remedialQuestions.length,
    estimated_duration_minutes: Math.ceil(remedialQuestions.length * 2),
    difficulty_progression: 'easy_to_medium',
    target_improvement: 20 // Target 20% improvement
  }
}

async function generateTargetedPractice(supabase: any, userId: string, weaknessAnalysis: WeaknessAnalysis[], targetSubtest?: string): Promise<AdaptiveSession> {
  const target = targetSubtest || weaknessAnalysis[0]?.subtest_code
  if (!target) {
    throw new Error('No target subtest specified')
  }

  const weakness = weaknessAnalysis.find(w => w.subtest_code === target)
  const startDifficulty = weakness?.weakness_level === 'critical' ? 'easy' : 
                       weakness?.weakness_level === 'moderate' ? 'medium' : 'hard'

  const { data: questions } = await supabase
    .from('question_bank')
    .select('*')
    .eq('subtest_utbk', target)
    .eq('is_hots', startDifficulty === 'easy')
    .limit(15)

  const practiceQuestions = questions?.map((q: any) => ({
    id: q.id,
    question_text: q.question_text,
    options: [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e],
    correct_answer: q.correct_answer,
    subtest_code: q.subtest_utbk,
    topic_name: 'Targeted Practice',
    difficulty_level: startDifficulty,
    question_type: q.is_hots ? 'HOTS' : 'Regular'
  })) || []

  return {
    id: `practice_${Date.now()}`,
    type: 'practice',
    title: `Targeted Practice - ${target}`,
    description: `Focused practice for ${target} starting at ${startDifficulty} level`,
    questions: practiceQuestions,
    total_questions: practiceQuestions.length,
    estimated_duration_minutes: Math.ceil(practiceQuestions.length * 1.5),
    difficulty_progression: startDifficulty === 'easy' ? 'easy_to_medium' : 'medium_to_hard',
    target_improvement: 15
  }
}

async function generateProgressiveChallenge(supabase: any, userId: string, weaknessAnalysis: WeaknessAnalysis[], targetSubtest?: string): Promise<AdaptiveSession> {
  // Focus on strongest areas with progressive difficulty
  const strongAreas = weaknessAnalysis.filter(w => w.weakness_level === 'none' || w.weakness_level === 'minor')
  const target = targetSubtest || strongAreas[0]?.subtest_code

  if (!target) {
    throw new Error('No suitable challenge area found')
  }

  // Get mix of regular and HOTS questions
  const { data: questions } = await supabase
    .from('question_bank')
    .select('*')
    .eq('subtest_utbk', target)
    .or(`(is_hots.eq.true),(is_hots.eq.false)`)
    .limit(12)

  const challengeQuestions = questions?.map((q: any) => ({
    id: q.id,
    question_text: q.question_text,
    options: [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e],
    correct_answer: q.correct_answer,
    subtest_code: q.subtest_utbk,
    topic_name: 'Progressive Challenge',
    difficulty_level: q.is_hots ? 'hard' : 'medium',
    question_type: q.is_hots ? 'HOTS' : 'Regular'
  })) || []

  return {
    id: `challenge_${Date.now()}`,
    type: 'challenge',
    title: `Progressive Challenge - ${target}`,
    description: `Challenging mix of regular and HOTS problems for ${target}`,
    questions: challengeQuestions,
    total_questions: challengeQuestions.length,
    estimated_duration_minutes: Math.ceil(challengeQuestions.length * 2),
    difficulty_progression: 'mixed',
    target_improvement: 5 // Small improvement target for strong areas
  }
}

async function generateSmartMix(supabase: any, userId: string, weaknessAnalysis: WeaknessAnalysis[]): Promise<AdaptiveSession> {
  // Create balanced mix based on overall performance
  const criticalAreas = weaknessAnalysis.filter(w => w.weakness_level === 'critical').slice(0, 2)
  const moderateAreas = weaknessAnalysis.filter(w => w.weakness_level === 'moderate').slice(0, 2)
  const strongAreas = weaknessAnalysis.filter(w => w.weakness_level === 'none').slice(0, 1)

  const allTargets = [...criticalAreas, ...moderateAreas, ...strongAreas].map(w => w.subtest_code)
  
  const { data: questions } = await supabase
    .from('question_bank')
    .select('*')
    .in('subtest_utbk', allTargets)
    .limit(18)

  const mixedQuestions = questions?.map((q: any) => ({
    id: q.id,
    question_text: q.question_text,
    options: [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e],
    correct_answer: q.correct_answer,
    subtest_code: q.subtest_utbk,
    topic_name: 'Smart Mix',
    difficulty_level: q.is_hots ? 'hard' : 'medium',
    question_type: q.is_hots ? 'HOTS' : 'Regular'
  })) || []

  return {
    id: `smart_mix_${Date.now()}`,
    type: 'mixed',
    title: 'Smart Adaptive Mix',
    description: 'Balanced mix of topics based on your performance profile',
    questions: mixedQuestions,
    total_questions: mixedQuestions.length,
    estimated_duration_minutes: Math.ceil(mixedQuestions.length * 1.8),
    difficulty_progression: 'mixed',
    target_improvement: 10
  }
}

async function generateFallbackSession(supabase: any, userId: string, sessionId: string): Promise<AdaptiveSession> {
  // Fallback to original logic for backward compatibility
  const { data: questions } = await supabase
    .from('question_bank')
    .select('*')
    .limit(10)

  const fallbackQuestions = questions?.map((q: any) => ({
    id: q.id,
    question_text: q.question_text,
    options: [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e],
    correct_answer: q.correct_answer,
    subtest_code: q.subtest_utbk,
    topic_name: 'General Practice',
    difficulty_level: 'medium',
    question_type: q.is_hots ? 'HOTS' : 'Regular'
  })) || []

  return {
    id: `fallback_${Date.now()}`,
    type: 'practice',
    title: 'General Practice',
    description: 'Mixed practice session',
    questions: fallbackQuestions,
    total_questions: fallbackQuestions.length,
    estimated_duration_minutes: Math.ceil(fallbackQuestions.length * 1.5),
    difficulty_progression: 'mixed',
    target_improvement: 10
  }
}

function generatePersonalizedRecommendations(weaknessAnalysis: WeaknessAnalysis[]): string[] {
  const recommendations: string[] = []
  
  const criticalAreas = weaknessAnalysis.filter(w => w.weakness_level === 'critical')
  const moderateAreas = weaknessAnalysis.filter(w => w.weakness_level === 'moderate')
  
  if (criticalAreas.length > 0) {
    recommendations.push('🔴 Priority: Focus on critical weakness areas first')
    recommendations.push('📚 Use step-by-step problem solving methods')
    recommendations.push('👥 Consider seeking help from teachers or tutors')
  }
  
  if (moderateAreas.length > 0) {
    recommendations.push('🟡 Moderate: Review fundamental concepts')
    recommendations.push('🎯 Practice with guided solutions')
  }
  
  if (criticalAreas.length === 0 && moderateAreas.length === 0) {
    recommendations.push('🟢 Good: Challenge yourself with advanced problems')
    recommendations.push('🚀 Explore competitive exam formats')
  }
  
  return recommendations
}