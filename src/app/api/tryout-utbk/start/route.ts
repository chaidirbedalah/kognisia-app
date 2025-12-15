import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ASSESSMENT_CONFIGS, UTBK_2026_SUBTESTS } from '@/lib/utbk-constants'

type DBQuestion = {
  subtest_code: string
} & Record<string, unknown>

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * POST /api/tryout-utbk/start
 * 
 * Starts a Try Out UTBK session with 160 questions across 7 subtests
 * 
 * Requirements:
 * - 5.1: Fetch exactly 160 questions total
 * - 5.2: 30 questions for PU (Penalaran Umum)
 * - 5.3: 20 questions for PPU (Pengetahuan & Pemahaman Umum)
 * - 5.4: 20 questions for PBM (Pemahaman Bacaan & Menulis)
 * - 5.5: 20 questions for PK (Pengetahuan Kuantitatif)
 * - 5.6: 30 questions for LIT_INDO (Literasi Bahasa Indonesia)
 * - 5.7: 20 questions for LIT_ING (Literasi Bahasa Inggris)
 * - 5.8: 20 questions for PM (Penalaran Matematika)
 * - 5.9: Order questions by subtest display_order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body as { userId: string }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const config = ASSESSMENT_CONFIGS.tryout_utbk

    // Fetch questions for each subtest according to UTBK 2026 distribution
    const allQuestions: Array<DBQuestion & { subtest_display_order: number; recommended_minutes: number }> = []
    
    for (const dist of config.subtestDistribution) {
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .eq('subtest_code', dist.subtestCode)
        .limit(dist.questionCount * 2) // Fetch more to allow randomization
      
      if (error) {
        console.error(`Error fetching questions for ${dist.subtestCode}:`, error)
        return NextResponse.json(
          { error: `Failed to fetch questions for subtest ${dist.subtestCode}` },
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
      const shuffled = shuffleArray(data as DBQuestion[])
      const selected = shuffled.slice(0, dist.questionCount)
      
      // Add subtest metadata
      const questionsWithMeta = selected.map(q => ({
        ...q,
        subtest_display_order: UTBK_2026_SUBTESTS.find(s => s.code === dist.subtestCode)?.displayOrder || 0,
        recommended_minutes: Number(dist.recommendedMinutes)
      }))
      
      allQuestions.push(...questionsWithMeta)
    }

    // Sort questions by subtest display order (Requirement 5.9)
    allQuestions.sort((a, b) => a.subtest_display_order - b.subtest_display_order)

    // Group questions by subtest for response
    const subtestBreakdown = config.subtestDistribution.map(dist => {
      const subtestInfo = UTBK_2026_SUBTESTS.find(s => s.code === dist.subtestCode)
      return {
        subtestCode: dist.subtestCode,
        subtestName: subtestInfo?.name || dist.subtestCode,
        subtestIcon: subtestInfo?.icon || '📚',
        questionCount: dist.questionCount,
        recommendedMinutes: dist.recommendedMinutes,
        questions: allQuestions.filter(q => q.subtest_code === dist.subtestCode)
      }
    })

    return NextResponse.json({
      assessmentType: 'tryout_utbk',
      totalQuestions: allQuestions.length,
      totalDuration: config.totalDuration,
      questions: allQuestions,
      subtestBreakdown
    })
  } catch (error) {
    console.error('Error in tryout-utbk/start:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Fisher-Yates shuffle algorithm for randomizing array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
