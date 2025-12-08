/**
 * Mini Try Out Submit Endpoint
 * 
 * Processes Mini Try Out submission and stores results
 * Requirements: 7.7, 7.8
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import { getOrderedSubtests } from '@/lib/utbk-constants'

interface SubmitRequest {
  questions: Array<{
    id: string
    subtest_code: string
    correct_answer: string
  }>
  answers: Record<number, string>
  totalTimeSeconds: number
  startTime: number
  endTime: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: SubmitRequest = await request.json()
    const { questions, answers, totalTimeSeconds } = body

    // Generate session ID
    const sessionId = uuidv4()

    // Calculate overall results
    let correctCount = 0
    const subtestResults: Record<string, { correct: number; total: number; timeSpent: number }> = {}

    // Initialize subtest results
    const orderedSubtests = getOrderedSubtests()
    for (const subtest of orderedSubtests) {
      subtestResults[subtest.code] = { correct: 0, total: 0, timeSpent: 0 }
    }

    // Process each question
    const progressRecords = []
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const userAnswer = answers[i]
      const isCorrect = userAnswer === question.correct_answer

      if (isCorrect) {
        correctCount++
        subtestResults[question.subtest_code].correct++
      }
      subtestResults[question.subtest_code].total++

      // Create progress record (Requirement 7.7)
      progressRecords.push({
        user_id: user.id,
        student_id: user.id,
        question_id: question.id,
        assessment_id: sessionId,
        assessment_type: 'mini_tryout', // Requirement 7.8
        subtest_code: question.subtest_code,
        is_correct: isCorrect,
        time_spent: Math.floor(totalTimeSeconds / questions.length), // Approximate per question
        created_at: new Date().toISOString()
      })
    }

    // Insert all progress records
    const { error: progressError } = await supabase
      .from('student_progress')
      .insert(progressRecords)

    if (progressError) {
      console.error('Error inserting progress:', progressError)
      return NextResponse.json(
        { error: 'Failed to save progress' },
        { status: 500 }
      )
    }

    // Calculate per-subtest breakdown
    const subtestBreakdown = orderedSubtests.map(subtest => {
      const result = subtestResults[subtest.code]
      return {
        subtestCode: subtest.code,
        subtestName: subtest.name,
        correct: result.correct,
        total: result.total,
        accuracy: result.total > 0 ? (result.correct / result.total) * 100 : 0
      }
    })

    // Find strongest and weakest subtests
    const sortedByAccuracy = [...subtestBreakdown].sort((a, b) => b.accuracy - a.accuracy)
    const strongest = sortedByAccuracy[0]
    const weakest = sortedByAccuracy[sortedByAccuracy.length - 1]

    // Calculate overall accuracy
    const overallAccuracy = questions.length > 0 
      ? (correctCount / questions.length) * 100 
      : 0

    return NextResponse.json({
      success: true,
      sessionId,
      results: {
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        accuracy: overallAccuracy,
        totalTimeSeconds,
        recommendedTimeSeconds: 90 * 60, // 90 minutes
        subtestBreakdown,
        strongest,
        weakest
      }
    })
  } catch (error) {
    console.error('Error submitting Mini Try Out:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
