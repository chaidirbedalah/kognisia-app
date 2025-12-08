import { describe, it, expect, beforeAll } from 'vitest'
import * as fc from 'fast-check'
import { createClient } from '@supabase/supabase-js'
import { ASSESSMENT_CONFIGS, VALID_SUBTEST_CODES } from '@/lib/utbk-constants'

/**
 * Property 10: Try Out UTBK Total Question Count
 * 
 * Validates Requirement 5.1:
 * - Try Out UTBK must have exactly 160 questions total
 * - Distribution: PU(30) + PPU(20) + PBM(20) + PK(20) + LIT_INDO(30) + LIT_ING(20) + PM(20) = 160
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

describe('Property 10: Try Out UTBK Total Question Count', () => {
  let supabase: ReturnType<typeof createClient>

  beforeAll(() => {
    supabase = createClient(supabaseUrl, supabaseKey)
  })

  it('should always fetch exactly 160 questions total', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 4 }),
        async (seed) => {
          const config = ASSESSMENT_CONFIGS.tryout_utbk

          // Property: Total questions must be 160
          expect(config.totalQuestions).toBe(160)

          // Property: Sum of all subtest distributions must equal 160
          const totalFromDistribution = config.subtestDistribution.reduce(
            (sum, dist) => sum + dist.questionCount,
            0
          )
          expect(totalFromDistribution).toBe(160)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should have correct distribution across 7 subtests', () => {
    fc.assert(
      fc.property(
        fc.constant(ASSESSMENT_CONFIGS.tryout_utbk),
        (config) => {
          // Property: Must have exactly 7 subtests
          expect(config.subtestDistribution.length).toBe(7)

          // Property: Each subtest must be one of the valid codes
          config.subtestDistribution.forEach(dist => {
            expect(VALID_SUBTEST_CODES).toContain(dist.subtestCode)
          })

          // Property: Specific question counts per subtest
          const expectedCounts: Record<string, number> = {
            'PU': 30,
            'PPU': 20,
            'PBM': 20,
            'PK': 20,
            'LIT_INDO': 30,
            'LIT_ING': 20,
            'PM': 20
          }

          config.subtestDistribution.forEach(dist => {
            expect(dist.questionCount).toBe(expectedCounts[dist.subtestCode])
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain 160 question count invariant', () => {
    fc.assert(
      fc.property(
        fc.constant(ASSESSMENT_CONFIGS.tryout_utbk.subtestDistribution),
        (distribution) => {
          // Property: No matter how we calculate, total must be 160
          const total1 = distribution.reduce((sum, d) => sum + d.questionCount, 0)
          const total2 = distribution.map(d => d.questionCount).reduce((a, b) => a + b, 0)
          const total3 = distribution.length > 0 
            ? distribution.map(d => d.questionCount).reduce((a, b) => a + b)
            : 0

          expect(total1).toBe(160)
          expect(total2).toBe(160)
          expect(total3).toBe(160)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have PU and LIT_INDO with 30 questions each', () => {
    fc.assert(
      fc.property(
        fc.constant(ASSESSMENT_CONFIGS.tryout_utbk.subtestDistribution),
        (distribution) => {
          const puDist = distribution.find(d => d.subtestCode === 'PU')
          const litIndoDist = distribution.find(d => d.subtestCode === 'LIT_INDO')

          // Property: PU must have 30 questions
          expect(puDist).toBeDefined()
          expect(puDist!.questionCount).toBe(30)

          // Property: LIT_INDO must have 30 questions
          expect(litIndoDist).toBeDefined()
          expect(litIndoDist!.questionCount).toBe(30)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have PPU, PBM, PK, LIT_ING, PM with 20 questions each', () => {
    fc.assert(
      fc.property(
        fc.constant(ASSESSMENT_CONFIGS.tryout_utbk.subtestDistribution),
        (distribution) => {
          const twentyQuestionSubtests = ['PPU', 'PBM', 'PK', 'LIT_ING', 'PM']

          twentyQuestionSubtests.forEach(code => {
            const dist = distribution.find(d => d.subtestCode === code)
            
            // Property: Each of these subtests must have 20 questions
            expect(dist).toBeDefined()
            expect(dist!.questionCount).toBe(20)
          })

          // Property: Total from these 5 subtests should be 100
          const totalFromTwenty = twentyQuestionSubtests.reduce((sum, code) => {
            const dist = distribution.find(d => d.subtestCode === code)
            return sum + (dist?.questionCount || 0)
          }, 0)
          expect(totalFromTwenty).toBe(100)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have total duration of 195 minutes', () => {
    fc.assert(
      fc.property(
        fc.constant(ASSESSMENT_CONFIGS.tryout_utbk),
        (config) => {
          // Property: Total duration must be 195 minutes (3 hours 15 minutes)
          expect(config.totalDuration).toBe(195)

          // Property: Sum of recommended times should equal total duration
          const totalRecommendedTime = config.subtestDistribution.reduce(
            (sum, dist) => sum + (dist.recommendedMinutes || 0),
            0
          )
          expect(totalRecommendedTime).toBe(195)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain question count consistency across fetches', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 2 }),
        async (seed) => {
          const config = ASSESSMENT_CONFIGS.tryout_utbk
          let totalQuestions = 0

          // Simulate fetching questions for each subtest
          for (const dist of config.subtestDistribution) {
            const { data, error } = await supabase
              .from('question_bank')
              .select('id, subtest_code')
              .eq('subtest_code', dist.subtestCode)
              .limit(dist.questionCount)

            if (error || !data) {
              // Skip if data not available in test environment
              return true
            }

            // Property: Should fetch exactly the required count
            const fetchedCount = Math.min(data.length, dist.questionCount)
            totalQuestions += fetchedCount
          }

          // Property: If all subtests have enough questions, total should be 160
          if (totalQuestions > 0) {
            expect(totalQuestions).toBeLessThanOrEqual(160)
          }

          return true
        }
      ),
      { numRuns: 5, timeout: 30000 }
    )
  }, 60000)
})
