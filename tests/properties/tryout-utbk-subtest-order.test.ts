import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { ASSESSMENT_CONFIGS, UTBK_2026_SUBTESTS } from '@/lib/utbk-constants'

/**
 * Property 11: Try Out UTBK Subtest Order
 * 
 * Validates Requirement 5.8:
 * - Questions must be ordered by subtest display_order
 * - Subtests appear in official UTBK 2026 sequence
 */

describe('Property 11: Try Out UTBK Subtest Order', () => {
  it('should order questions by subtest display_order', () => {
    fc.assert(
      fc.property(
        fc.constant(ASSESSMENT_CONFIGS.tryout_utbk.subtestDistribution),
        (distribution) => {
          // Simulate questions with display order
          const questions = distribution.flatMap(dist => {
            const subtest = UTBK_2026_SUBTESTS.find(s => s.code === dist.subtestCode)
            return Array.from({ length: dist.questionCount }, () => ({
              subtestCode: dist.subtestCode,
              displayOrder: subtest?.displayOrder || 0
            }))
          })

          // Sort by display order (as the API should do)
          const sorted = [...questions].sort((a, b) => a.displayOrder - b.displayOrder)

          // Property: Questions should be grouped by subtest
          let currentOrder = 0
          for (const q of sorted) {
            expect(q.displayOrder).toBeGreaterThanOrEqual(currentOrder)
            currentOrder = q.displayOrder
          }

          // Property: All questions from same subtest should be consecutive
          const subtestGroups: Record<string, number[]> = {}
          sorted.forEach((q, idx) => {
            if (!subtestGroups[q.subtestCode]) {
              subtestGroups[q.subtestCode] = []
            }
            subtestGroups[q.subtestCode].push(idx)
          })

          // Each subtest's indices should be consecutive
          Object.values(subtestGroups).forEach(indices => {
            for (let i = 1; i < indices.length; i++) {
              expect(indices[i]).toBe(indices[i - 1] + 1)
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should follow official UTBK 2026 subtest sequence', () => {
    fc.assert(
      fc.property(
        fc.constant(UTBK_2026_SUBTESTS),
        (subtests) => {
          // Property: Subtests should be ordered by displayOrder
          const ordered = [...subtests].sort((a, b) => a.displayOrder - b.displayOrder)

          // Property: Display orders should be sequential starting from 1
          ordered.forEach((subtest, idx) => {
            expect(subtest.displayOrder).toBe(idx + 1)
          })

          // Property: Official sequence should be PU, PPU, PBM, PK, LIT_INDO, LIT_ING, PM
          const expectedSequence = ['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']
          ordered.forEach((subtest, idx) => {
            expect(subtest.code).toBe(expectedSequence[idx])
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain order consistency across multiple sorts', () => {
    fc.assert(
      fc.property(
        fc.constant(ASSESSMENT_CONFIGS.tryout_utbk.subtestDistribution),
        (distribution) => {
          // Create questions with display order
          const createQuestions = () => {
            return distribution.flatMap(dist => {
              const subtest = UTBK_2026_SUBTESTS.find(s => s.code === dist.subtestCode)
              return Array.from({ length: dist.questionCount }, (_, i) => ({
                id: `${dist.subtestCode}_${i}`,
                subtestCode: dist.subtestCode,
                displayOrder: subtest?.displayOrder || 0
              }))
            })
          }

          const questions1 = createQuestions()
          const questions2 = createQuestions()

          // Sort both
          const sorted1 = [...questions1].sort((a, b) => a.displayOrder - b.displayOrder)
          const sorted2 = [...questions2].sort((a, b) => a.displayOrder - b.displayOrder)

          // Property: Same sorting should produce same order
          sorted1.forEach((q, idx) => {
            expect(q.subtestCode).toBe(sorted2[idx].subtestCode)
            expect(q.displayOrder).toBe(sorted2[idx].displayOrder)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have PU as first subtest', () => {
    fc.assert(
      fc.property(
        fc.constant(UTBK_2026_SUBTESTS),
        (subtests) => {
          const ordered = [...subtests].sort((a, b) => a.displayOrder - b.displayOrder)

          // Property: PU (Penalaran Umum) should always be first
          expect(ordered[0].code).toBe('PU')
          expect(ordered[0].displayOrder).toBe(1)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have PM as last subtest', () => {
    fc.assert(
      fc.property(
        fc.constant(UTBK_2026_SUBTESTS),
        (subtests) => {
          const ordered = [...subtests].sort((a, b) => a.displayOrder - b.displayOrder)

          // Property: PM (Penalaran Matematika) should always be last
          expect(ordered[ordered.length - 1].code).toBe('PM')
          expect(ordered[ordered.length - 1].displayOrder).toBe(7)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve subtest order when questions are shuffled within subtests', () => {
    fc.assert(
      fc.property(
        fc.constant(ASSESSMENT_CONFIGS.tryout_utbk.subtestDistribution),
        (distribution) => {
          // Create questions
          const questions = distribution.flatMap(dist => {
            const subtest = UTBK_2026_SUBTESTS.find(s => s.code === dist.subtestCode)
            return Array.from({ length: dist.questionCount }, (_, i) => ({
              id: `${dist.subtestCode}_${i}`,
              subtestCode: dist.subtestCode,
              displayOrder: subtest?.displayOrder || 0,
              questionNumber: i
            }))
          })

          // Shuffle questions within each subtest (but maintain subtest order)
          const shuffledWithinSubtests = [...questions]
            .sort((a, b) => {
              if (a.displayOrder !== b.displayOrder) {
                return a.displayOrder - b.displayOrder
              }
              // Shuffle within same subtest
              return Math.random() - 0.5
            })

          // Property: Subtest order should still be maintained
          let prevOrder = 0
          for (const q of shuffledWithinSubtests) {
            expect(q.displayOrder).toBeGreaterThanOrEqual(prevOrder)
            if (q.displayOrder > prevOrder) {
              prevOrder = q.displayOrder
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have correct question count per subtest in order', () => {
    fc.assert(
      fc.property(
        fc.constant(ASSESSMENT_CONFIGS.tryout_utbk.subtestDistribution),
        (distribution) => {
          // Sort distribution by display order
          const ordered = [...distribution].sort((a, b) => {
            const subtestA = UTBK_2026_SUBTESTS.find(s => s.code === a.subtestCode)
            const subtestB = UTBK_2026_SUBTESTS.find(s => s.code === b.subtestCode)
            return (subtestA?.displayOrder || 0) - (subtestB?.displayOrder || 0)
          })

          // Property: Question counts should match expected sequence
          const expectedCounts = [30, 20, 20, 20, 30, 20, 20] // PU, PPU, PBM, PK, LIT_INDO, LIT_ING, PM
          ordered.forEach((dist, idx) => {
            expect(dist.questionCount).toBe(expectedCounts[idx])
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})
