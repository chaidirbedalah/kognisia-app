/**
 * Mini Try Out Start Endpoint
 * 
 * Fetches 70 questions (10 from each of 7 subtests) for Mini Try Out
 * Requirements: 7.1, 7.2, 7.3
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ASSESSMENT_CONFIGS, getOrderedSubtests } from '@/lib/utbk-constants'

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

    // Get Mini Try Out configuration
    const config = ASSESSMENT_CONFIGS.mini_tryout
    const orderedSubtests = getOrderedSubtests()

    // Fetch 10 questions from each subtest (randomized)
    const questionsBySubtest: Record<string, any[]> = {}
    
    for (const subtest of orderedSubtests) {
      const { data: questions, error: questionsError } = await supabase
        .from('question_bank')
        .select('*')
        .eq('subtest_code', subtest.code)
        .limit(10)
        .order('id', { ascending: false }) // Random-ish selection

      if (questionsError) {
        console.error(`Error fetching questions for ${subtest.code}:`, questionsError)
        return NextResponse.json(
          { error: `Failed to fetch questions for ${subtest.name}` },
          { status: 500 }
        )
      }

      if (!questions || questions.length < 10) {
        return NextResponse.json(
          { error: `Insufficient questions for ${subtest.name}. Need 10, found ${questions?.length || 0}` },
          { status: 400 }
        )
      }

      // Shuffle questions within subtest (Requirement 7.3)
      const shuffled = [...questions].sort(() => Math.random() - 0.5)
      questionsBySubtest[subtest.code] = shuffled.slice(0, 10)
    }

    // Flatten questions in subtest order
    const allQuestions = orderedSubtests.flatMap(
      subtest => questionsBySubtest[subtest.code]
    )

    return NextResponse.json({
      success: true,
      config: {
        type: 'mini_tryout',
        totalQuestions: config.totalQuestions,
        totalDuration: config.totalDuration,
        subtestDistribution: config.subtestDistribution
      },
      questions: allQuestions,
      subtests: orderedSubtests.map(s => ({
        code: s.code,
        name: s.name,
        questionCount: 10,
        startIndex: orderedSubtests.slice(0, orderedSubtests.indexOf(s)).reduce((sum, st) => sum + 10, 0)
      }))
    })
  } catch (error) {
    console.error('Error starting Mini Try Out:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
