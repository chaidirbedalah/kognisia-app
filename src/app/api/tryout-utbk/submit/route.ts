import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
export const runtime = 'nodejs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/tryout-utbk/submit
 * 
 * Submits Try Out UTBK answers and records progress
 * 
 * Requirements:
 * - 6.5: Compare actual time vs recommended time per subtest
 * - 8.3: Show strongest subtest (highest accuracy)
 * - 8.4: Show weakest subtest (lowest accuracy)
 */
const BodySchema = z.object({
  userId: z.string().min(1),
  answers: z.record(z.string(), z.string()),
  questions: z.array(z.object({ id: z.string().min(1) })),
  totalTimeSeconds: z.number().int().nonnegative(),
  subtestTimes: z.record(z.string(), z.number().int().nonnegative()).optional()
})
export async function POST(request: NextRequest) {
  try {
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const { userId, answers, questions, totalTimeSeconds, subtestTimes } = parsed.data

    // Validate required fields
    if (!userId || !answers || !questions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const admin = createClient(supabaseUrl, supabaseServiceKey)
    const questionIds = questions.map(q => q.id)
    const { data: dbQuestions, error: qErr } = await admin
      .from('question_bank')
      .select('id, correct_answer, subtest_utbk, recommended_minutes')
      .in('id', questionIds)
    if (qErr) {
      return NextResponse.json({ error: 'Failed fetching questions' }, { status: 500 })
    }
    const byId = new Map(dbQuestions?.map(q => [q.id, q]))

    // Prepare progress records
    const progressRecords = []
    let totalCorrect = 0
    let totalScore = 0

    // Calculate per-subtest breakdown
    const subtestBreakdown: Record<string, {
      correct: number
      total: number
      timeSpent: number
      recommendedTime: number
    }> = {}

    for (let idx = 0; idx < questions.length; idx++) {
      const q = byId.get(questions[idx].id)
      const userAnswer = answers[String(idx)] || null
      const isCorrect = q ? userAnswer === q.correct_answer : false
      
      if (isCorrect) {
        totalCorrect++
      }

      const questionScore = isCorrect ? 10 : 0
      totalScore += questionScore

      // Initialize subtest breakdown
      const code = q?.subtest_utbk || 'UNKNOWN'
      if (!subtestBreakdown[code]) {
        subtestBreakdown[code] = {
          correct: 0,
          total: 0,
          timeSpent: subtestTimes?.[code] || 0,
          recommendedTime: Number(q?.recommended_minutes ?? 0) * 60
        }
      }
      subtestBreakdown[code].total++
      if (isCorrect) {
        subtestBreakdown[code].correct++
      }

      // Create progress record
      progressRecords.push({
        student_id: userId,
        question_id: questions[idx].id,
        selected_answer: userAnswer,
        is_correct: isCorrect,
        score: questionScore,
        time_spent_seconds: Math.floor(totalTimeSeconds / questions.length),
        assessment_type: 'tryout_utbk',
        subtest_code: code,
      })
    }

    // Insert all progress records
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

    // Format subtest results with timing comparison
    const subtestResults = Object.entries(subtestBreakdown).map(([code, stats]) => {
      const subtestAccuracy = Math.round((stats.correct / stats.total) * 100)
      const actualMinutes = Math.floor(stats.timeSpent / 60)
      const recommendedMinutes = Math.floor(stats.recommendedTime / 60)
      const timeDifference = actualMinutes - recommendedMinutes
      
      return {
        subtestCode: code,
        totalQuestions: stats.total,
        correctAnswers: stats.correct,
        accuracy: subtestAccuracy,
        actualMinutes,
        recommendedMinutes,
        timeDifference,
        isFaster: timeDifference < 0,
        isSlower: timeDifference > 0
      }
    })

    // Find strongest and weakest subtests
    const sortedByAccuracy = [...subtestResults].sort((a, b) => b.accuracy - a.accuracy)
    const strongest = sortedByAccuracy[0]
    const weakest = sortedByAccuracy[sortedByAccuracy.length - 1]

    // Return success response
    return NextResponse.json({
      success: true,
      totalQuestions: questions.length,
      totalCorrect,
      totalScore,
      accuracy,
      totalTimeSeconds,
      totalTimeMinutes: Math.floor(totalTimeSeconds / 60),
      subtestResults,
      strongest,
      weakest
    })
  } catch (error) {
    console.error('Error in tryout-utbk/submit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
