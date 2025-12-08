import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { SubtestCode } from '@/lib/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      answers,
      questions,
      totalTimeSeconds,
      subtestTimes 
    } = body as {
      userId: string
      answers: Record<number, string>
      questions: Array<{
        id: string
        correct_answer: string
        subtest_code: SubtestCode
        recommended_minutes?: number
      }>
      totalTimeSeconds: number
      subtestTimes: Record<string, number>
    }

    // Validate required fields
    if (!userId || !answers || !questions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

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
      const question = questions[idx]
      const userAnswer = answers[idx] || null
      const isCorrect = userAnswer === question.correct_answer
      
      if (isCorrect) {
        totalCorrect++
      }

      const questionScore = isCorrect ? 10 : 0
      totalScore += questionScore

      // Initialize subtest breakdown
      const code = question.subtest_code
      if (!subtestBreakdown[code]) {
        subtestBreakdown[code] = {
          correct: 0,
          total: 0,
          timeSpent: subtestTimes[code] || 0,
          recommendedTime: (question.recommended_minutes || 0) * 60
        }
      }
      subtestBreakdown[code].total++
      if (isCorrect) {
        subtestBreakdown[code].correct++
      }

      // Create progress record
      progressRecords.push({
        student_id: userId,
        question_id: question.id,
        selected_answer: userAnswer,
        is_correct: isCorrect,
        score: questionScore,
        time_spent_seconds: Math.floor(totalTimeSeconds / questions.length),
        assessment_type: 'tryout_utbk',
        subtest_code: question.subtest_code,
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
