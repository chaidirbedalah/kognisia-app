import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
export const runtime = 'nodejs'
import { awardCoins, awardXP } from '@/lib/economy'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/daily-challenge/submit
 * 
 * Submits Daily Challenge answers and records progress
 * 
 * Requirements:
 * - 2.6: Store daily_challenge_mode in student_progress
 * - 3.5: Create progress records for all 7 subtests in Balanced mode
 * - 4.5: Store focus_subtest_code if Focus mode
 * - 7.7: Create progress record for only selected subtest in Focus mode
 */
const BodySchema = z.object({
  userId: z.string().min(1),
  mode: z.enum(['balanced','focus']),
  subtestCode: z.string().optional(),
  answers: z.record(z.string(), z.string()),
  questions: z.array(z.object({ id: z.string().min(1) })),
  timeSpent: z.number().int().nonnegative().optional()
})
export async function POST(request: NextRequest) {
  try {
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const { userId, mode, subtestCode, answers, questions, timeSpent } = parsed.data

    if (!userId || !mode || !answers || !questions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (mode === 'focus' && !subtestCode) {
      return NextResponse.json(
        { error: 'Focus mode requires subtestCode' },
        { status: 400 }
      )
    }

    // Validate focus mode has subtestCode
    if (mode === 'focus' && !subtestCode) {
      return NextResponse.json(
        { error: 'Focus mode requires subtestCode' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const admin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: dbQuestions, error: qErr } = await admin
      .from('question_bank')
      .select('id, correct_answer, subtest_utbk')
      .in('id', questions.map(q => q.id))
    if (qErr) {
      return NextResponse.json({ error: 'Failed fetching questions' }, { status: 500 })
    }
    const byId = new Map(dbQuestions?.map(q => [q.id, q]))

    // Prepare progress records
    const progressRecords = []
    let totalCorrect = 0
    let totalScore = 0

    for (let idx = 0; idx < questions.length; idx++) {
      const q = byId.get(questions[idx].id)
      const userAnswer = answers[String(idx)] || null
      const isCorrect = q ? userAnswer === q.correct_answer : false
      
      if (isCorrect) {
        totalCorrect++
      }

      // Calculate score based on 3-layer system (simplified for now)
      const questionScore = isCorrect ? 10 : 0
      totalScore += questionScore

      progressRecords.push({
        student_id: userId,
        question_id: questions[idx].id,
        selected_answer: userAnswer,
        is_correct: isCorrect,
        score: questionScore,
        time_spent_seconds: timeSpent ? Math.floor(timeSpent / questions.length) : 60,
        assessment_type: 'daily_challenge',
        subtest_code: q?.subtest_utbk || 'UNKNOWN',
        daily_challenge_mode: mode,
        focus_subtest_code: mode === 'focus' ? subtestCode : null,
      })
    }

    // Insert all progress records
    // Requirement 3.5: Create progress records for all 7 subtests in Balanced mode
    // Requirement 7.7: Create progress record for only selected subtest in Focus mode
    const { error: insertError } = await supabase
      .from('student_progress')
      .insert(progressRecords)

    if (insertError) {
      console.error('Error inserting progress:', insertError)
      return NextResponse.json(
        { error: 'Failed to save progress', details: insertError.message },
        { status: 500 }
      )
    }

    // Calculate accuracy
    const accuracy = Math.round((totalCorrect / questions.length) * 100)

    // Calculate per-subtest breakdown
    const subtestBreakdown: Record<string, { correct: number; total: number }> = {}
    
    for (let idx = 0; idx < questions.length; idx++) {
      const q = byId.get(questions[idx].id)
      const code = q?.subtest_utbk || 'UNKNOWN'
      if (!subtestBreakdown[code]) {
        subtestBreakdown[code] = { correct: 0, total: 0 }
      }
      subtestBreakdown[code].total++
      const userAnswer = answers[String(idx)]
      if (q && userAnswer === q.correct_answer) {
        subtestBreakdown[code].correct++
      }
    }

    // Format subtest results
    const subtestResults = Object.entries(subtestBreakdown).map(([code, stats]) => ({
      subtestCode: code,
      subtestName: code, // Will be resolved on client side
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      accuracy: Math.round((stats.correct / stats.total) * 100)
    }))

    // Economy rewards: Tickets + XP bonus on completion
    const answeredCount = Object.keys(answers).length
    const requiredForCompletion = Math.floor(questions.length * 0.8)
    let xpAwarded = 0
    let coinsAwarded = 0
    if (answeredCount >= requiredForCompletion) {
      if (accuracy > 60) {
        coinsAwarded = 1
      }
      if (accuracy >= 70) {
        xpAwarded = 150
      } else if (accuracy >= 50) {
        xpAwarded = 100
      } else {
        xpAwarded = 50
      }
      try {
        if (coinsAwarded > 0) {
          await awardCoins(
            userId,
            coinsAwarded,
            'daily_challenge_reward',
            undefined,
            { mode, subtestCode: subtestCode || null, totalQuestions: questions.length, accuracy }
          )
        }
        await awardXP(
          userId,
          xpAwarded,
          'daily_challenge',
          undefined,
          { mode, subtestCode: subtestCode || null }
        )
      } catch (e) {
        console.error('Economy reward error:', e)
      }
    }

    return NextResponse.json({
      success: true,
      totalQuestions: questions.length,
      totalCorrect,
      totalScore,
      accuracy,
      mode,
      subtestCode: mode === 'focus' ? subtestCode : undefined,
      subtestResults,
      rewards: {
        coins: coinsAwarded,
        xp: xpAwarded,
        completion: answeredCount >= requiredForCompletion
      }
    })
  } catch (error) {
    console.error('Error in daily-challenge/submit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
