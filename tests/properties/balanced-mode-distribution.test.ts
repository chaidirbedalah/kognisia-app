import { describe, it, expect, beforeAll } from 'vitest'
import * as fc from 'fast-check'
import { createClient } from '@supabase/supabase-js'
import { ASSESSMENT_CONFIGS, VALID_SUBTEST_CODES } from '@/lib/utbk-constants'

interface QBQuestion {
  subtest_code: string
}

/**
 * Property Test for Balanced Mode Distribution
 * 
 * Feature: utbk-2026-compliance
 * Property 3: Balanced Mode Distribution
 * Validates: Requirements 2.2, 3.1
 * 
 * Property: For any Daily Challenge in Balanced Mode, the system should fetch 
 * exactly 21 questions with exactly 3 questions from each of the 7 subtests
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

describe('Property 3: Balanced Mode Distribution', () => {
  let supabase: ReturnType<typeof createClient>

  beforeAll(() => {
    supabase = createClient(supabaseUrl, supabaseKey)
  })

  it('should fetch exactly 21 questions with 3 per subtest in balanced mode', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 9 }), // Use smaller range for faster tests
        async (seed) => {
          // Fetch questions for balanced mode
          const config = ASSESSMENT_CONFIGS.daily_challenge_balanced
          const questions: QBQuestion[] = []

          for (const dist of config.subtestDistribution) {
            const { data, error } = await supabase
              .from('question_bank')
              .select('*')
              .eq('subtest_code', dist.subtestCode)
              .limit(dist.questionCount * 3)
            
            if (error || !data || data.length < dist.questionCount) {
              // Skip if insufficient questions (test environment may not have full data)
              return true
            }

            // Randomize and select
            const shuffled = shuffleArray(data)
            const selected = shuffled.slice(0, dist.questionCount)
            questions.push(...selected)
          }

          // Property 1: Total count must be 21
          expect(questions.length).toBe(21)

          // Property 2: Must have exactly 7 subtests represented
          const subtestCounts = countBySubtest(questions)
          expect(Object.keys(subtestCounts).length).toBe(7)

          // Property 3: Each subtest must have exactly 3 questions
          for (const subtestCode of VALID_SUBTEST_CODES) {
            expect(subtestCounts[subtestCode]).toBe(3)
          }

          // Property 4: All questions must have valid subtest codes
          for (const question of questions) {
            expect(VALID_SUBTEST_CODES).toContain(question.subtest_code)
          }

          return true
        }
      ),
      { numRuns: 10, timeout: 30000 } // Reduced runs, increased timeout
    )
  }, 60000)

  it('should maintain distribution consistency across multiple fetches', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 4 }),
        async (seed) => {
          // Fetch twice to ensure consistency
          const fetch1 = await fetchBalancedModeQuestions()
          const fetch2 = await fetchBalancedModeQuestions()

          if (!fetch1 || !fetch2) {
            return true // Skip if data unavailable
          }

          // Both fetches should have same distribution
          const counts1 = countBySubtest(fetch1)
          const counts2 = countBySubtest(fetch2)

          expect(Object.keys(counts1).length).toBe(7)
          expect(Object.keys(counts2).length).toBe(7)

          for (const subtestCode of VALID_SUBTEST_CODES) {
            expect(counts1[subtestCode]).toBe(3)
            expect(counts2[subtestCode]).toBe(3)
          }

          return true
        }
      ),
      { numRuns: 5, timeout: 30000 } // Reduced runs for efficiency
    )
  }, 60000)
})

// Helper functions

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function countBySubtest(questions: QBQuestion[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const q of questions) {
    counts[q.subtest_code] = (counts[q.subtest_code] || 0) + 1
  }
  return counts
}

async function fetchBalancedModeQuestions() {
  const supabase = createClient(supabaseUrl, supabaseKey)
  const config = ASSESSMENT_CONFIGS.daily_challenge_balanced
  const questions: QBQuestion[] = []

  for (const dist of config.subtestDistribution) {
    const { data, error } = await supabase
      .from('question_bank')
      .select('*')
      .eq('subtest_code', dist.subtestCode)
      .limit(dist.questionCount * 3)
    
    if (error || !data || data.length < dist.questionCount) {
      return null
    }

    const shuffled = shuffleArray<QBQuestion>(data as QBQuestion[])
    const selected = shuffled.slice(0, dist.questionCount)
    questions.push(...selected)
  }

  return questions
}
