import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { DailyChallengeMode, SubtestCode } from '@/lib/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      mode, 
      subtestCode, 
      answers,
      questions,
      timeSpent 
    } = body as {
      userId: string
      mode: DailyChallengeMode
      subtestCode?: SubtestCode
      answers: Record<number, string>
      questions: Array<{
        id: string
        correct_answer: string
        subtest_code: SubtestCode
      }>
      timeSpent?: number
    }

    // Validate required fields
    if (!userId || !mode || !answers || !questions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate mode
    if (!['balanced', 'focus'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode' },
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

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Prepare progress records
    const progressRecords = []
    let totalCorrect = 0
    let totalScore = 0

    for (let idx = 0; idx < questions.length; idx++) {
      const question = questions[idx]
      const userAnswer = answers[idx] || null
      const isCorrect = userAnswer === question.correct_answer
      
      if (isCorrect) {
        totalCorrect++
      }

      // Calculate score based on 3-layer system (simplified for now)
      const questionScore = isCorrect ? 10 : 0
      totalScore += questionScore

      // Create progress record
      // Requirement 2.6: Store daily_challenge_mode
      // Requirement 4.5: Store focus_subtest_code if Focus mode
      progressRecords.push({
        student_id: userId,
        question_id: question.id,
        selected_answer: userAnswer,
        is_correct: isCorrect,
        score: questionScore,
        time_spent_seconds: timeSpent ? Math.floor(timeSpent / questions.length) : 60,
        assessment_type: 'daily_challenge',
        subtest_code: question.subtest_code,
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
    
    for (const question of questions) {
      const code = question.subtest_code
      if (!subtestBreakdown[code]) {
        subtestBreakdown[code] = { correct: 0, total: 0 }
      }
      subtestBreakdown[code].total++
      
      // Find if this question was answered correctly
      const idx = questions.indexOf(question)
      const userAnswer = answers[idx]
      if (userAnswer === question.correct_answer) {
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

    // Return success response
    return NextResponse.json({
      success: true,
      totalQuestions: questions.length,
      totalCorrect,
      totalScore,
      accuracy,
      mode,
      subtestCode: mode === 'focus' ? subtestCode : undefined,
      subtestResults
    })
  } catch (error) {
    console.error('Error in daily-challenge/submit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
