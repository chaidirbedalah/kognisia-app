import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ASSESSMENT_CONFIGS, VALID_SUBTEST_CODES } from '@/lib/utbk-constants'
import type { DailyChallengeMode, SubtestCode } from '@/lib/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * POST /api/daily-challenge/start
 * 
 * Starts a Daily Challenge session with either Balanced or Focus mode
 * 
 * Requirements:
 * - 2.2: Balanced Mode with 3 questions from each of 7 subtests (21 total)
 * - 2.3: Focus Mode with 10 questions from selected subtest
 * - 3.1: Fetch exactly 3 questions per subtest in Balanced mode
 * - 3.2: Randomize selection within each subtest
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, subtestCode } = body as {
      mode: DailyChallengeMode
      subtestCode?: SubtestCode
    }

    // Validate mode
    if (!mode || !['balanced', 'focus'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "balanced" or "focus"' },
        { status: 400 }
      )
    }

    // Validate focus mode has subtest
    if (mode === 'focus' && !subtestCode) {
      return NextResponse.json(
        { error: 'Focus mode requires subtestCode parameter' },
        { status: 400 }
      )
    }

    // Validate subtest code if provided
    if (subtestCode && !VALID_SUBTEST_CODES.includes(subtestCode)) {
      return NextResponse.json(
        { error: `Invalid subtest code. Must be one of: ${VALID_SUBTEST_CODES.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    if (mode === 'balanced') {
      // Balanced Mode: Fetch 3 questions from each of 7 subtests (21 total)
      const config = ASSESSMENT_CONFIGS.daily_challenge_balanced
      type QuestionRow = { subtest_code: string } & Record<string, unknown>
      const questions: QuestionRow[] = []

      for (const dist of config.subtestDistribution) {
        // Fetch questions for this subtest with randomization
        const { data, error } = await supabase
          .from('question_bank')
          .select('*')
          .eq('subtest_code', dist.subtestCode)
          .limit(dist.questionCount * 3) // Fetch more to allow randomization
        
        if (error) {
          console.error('Error fetching questions:', error)
          return NextResponse.json(
            { error: 'Failed to fetch questions' },
            { status: 500 }
          )
        }

        if (!data || data.length < dist.questionCount) {
          return NextResponse.json(
            { 
              error: `Insufficient questions for subtest ${dist.subtestCode}. Required: ${dist.questionCount}, Available: ${data?.length || 0}` 
            },
            { status: 500 }
          )
        }

        // Randomize and select required count
        const shuffled = shuffleArray(data as QuestionRow[])
        const selected = shuffled.slice(0, dist.questionCount)
        questions.push(...selected)
      }

      // Group questions by subtest for response
      const subtestBreakdown = config.subtestDistribution.map(dist => ({
        subtestCode: dist.subtestCode,
        questionCount: dist.questionCount,
        questions: questions.filter(q => q.subtest_code === dist.subtestCode)
      }))

      return NextResponse.json({
        mode: 'balanced',
        totalQuestions: questions.length,
        questions,
        subtestBreakdown
      })
    } else {
      // Focus Mode: Fetch 10 questions from selected subtest
      const config = ASSESSMENT_CONFIGS.daily_challenge_focus
      
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .eq('subtest_code', subtestCode)
        .limit(config.totalQuestions * 3) // Fetch more to allow randomization
      
      if (error) {
        console.error('Error fetching questions:', error)
        return NextResponse.json(
          { error: 'Failed to fetch questions' },
          { status: 500 }
        )
      }

      if (!data || data.length < config.totalQuestions) {
        return NextResponse.json(
          { 
            error: `Insufficient questions for subtest ${subtestCode}. Required: ${config.totalQuestions}, Available: ${data?.length || 0}` 
          },
          { status: 500 }
        )
      }

      // Randomize and select required count
      const shuffled = shuffleArray(data)
      const selected = shuffled.slice(0, config.totalQuestions)

      return NextResponse.json({
        mode: 'focus',
        subtestCode,
        totalQuestions: selected.length,
        questions: selected
      })
    }
  } catch (error) {
    console.error('Error in daily-challenge/start:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Fisher-Yates shuffle algorithm for randomizing array
 * Ensures proper randomization as per Requirement 3.2
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
