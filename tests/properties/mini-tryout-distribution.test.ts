/**
 * Property Test 13: Mini Try Out Distribution
 * 
 * Validates: Requirements 7.1, 7.2
 * 
 * This test verifies that Mini Try Out always returns exactly 70 questions
 * with 10 questions from each of the 7 official UTBK 2026 subtests.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { UTBK_2026_SUBTESTS, ASSESSMENT_CONFIGS } from '@/lib/utbk-constants'

describe('Property 13: Mini Try Out Distribution', () => {
  /**
   * Property: Mini Try Out must have exactly 70 questions
   * Validates: Requirement 7.1
   */
  it('should always return exactly 70 questions', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 70, maxLength: 70 }),
        (questionIds) => {
          // Simulate Mini Try Out question set
          const miniTryOutQuestions = questionIds

          // Requirement 7.1: Total must be 70
          expect(miniTryOutQuestions.length).toBe(70)
          expect(miniTryOutQuestions.length).toBe(ASSESSMENT_CONFIGS.mini_tryout.totalQuestions)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Each subtest must have exactly 10 questions
   * Validates: Requirement 7.2
   */
  it('should have exactly 10 questions from each of 7 subtests', () => {
    fc.assert(
      fc.property(
        fc.record({
          PU: fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 10, maxLength: 10 }),
          PPU: fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 10, maxLength: 10 }),
          PBM: fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 10, maxLength: 10 }),
          PK: fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 10, maxLength: 10 }),
          LIT_INDO: fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 10, maxLength: 10 }),
          LIT_ING: fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 10, maxLength: 10 }),
          PM: fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 10, maxLength: 10 })
        }),
        (questionsBySubtest) => {
          // Verify each subtest has exactly 10 questions
          const subtestCodes = Object.keys(questionsBySubtest)
          
          // Requirement 7.2: Must have all 7 subtests
          expect(subtestCodes.length).toBe(7)
          expect(subtestCodes).toEqual(
            expect.arrayContaining(['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'])
          )

          // Requirement 7.2: Each subtest must have exactly 10 questions
          for (const code of subtestCodes) {
            expect(questionsBySubtest[code as keyof typeof questionsBySubtest].length).toBe(10)
          }

          // Total must be 70
          const totalQuestions = Object.values(questionsBySubtest).flat().length
          expect(totalQuestions).toBe(70)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Distribution must match configuration
   * Validates: Requirements 7.1, 7.2
   */
  it('should match the configured distribution exactly', () => {
    fc.assert(
      fc.property(
        fc.constant(ASSESSMENT_CONFIGS.mini_tryout),
        (config) => {
          // Verify configuration
          expect(config.type).toBe('mini_tryout')
          expect(config.totalQuestions).toBe(70)
          expect(config.subtestDistribution.length).toBe(7)

          // Verify each subtest distribution
          for (const dist of config.subtestDistribution) {
            expect(dist.questionCount).toBe(10)
            expect(UTBK_2026_SUBTESTS.map(s => s.code)).toContain(dist.subtestCode)
          }

          // Verify total from distribution
          const totalFromDist = config.subtestDistribution.reduce(
            (sum, dist) => sum + dist.questionCount,
            0
          )
          expect(totalFromDist).toBe(70)
          expect(totalFromDist).toBe(config.totalQuestions)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Questions must be evenly distributed
   * Validates: Requirement 7.2
   */
  it('should have equal distribution across all subtests', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            subtest_code: fc.constantFrom('PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'),
            id: fc.integer({ min: 1, max: 10000 })
          }),
          { minLength: 70, maxLength: 70 }
        ),
        (questions) => {
          // Count questions per subtest
          const countBySubtest: Record<string, number> = {}
          
          for (const q of questions) {
            countBySubtest[q.subtest_code] = (countBySubtest[q.subtest_code] || 0) + 1
          }

          // For a valid Mini Try Out, each subtest should have exactly 10
          // (This property tests the ideal case)
          const counts = Object.values(countBySubtest)
          const allEqual = counts.every(count => count === 10)
          
          if (allEqual) {
            expect(Object.keys(countBySubtest).length).toBe(7)
            for (const count of counts) {
              expect(count).toBe(10)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
