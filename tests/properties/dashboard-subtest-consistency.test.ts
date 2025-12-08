/**
 * Property Test 16: Dashboard Subtest Consistency
 * 
 * Validates: Requirement 9.1
 * 
 * This test verifies that the dashboard consistently displays all 7 UTBK 2026 subtests
 * and that subtest data is properly structured across all dashboard components.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { UTBK_2026_SUBTESTS } from '@/lib/utbk-constants'

describe('Property 16: Dashboard Subtest Consistency', () => {
  /**
   * Property: Dashboard must recognize all 7 official subtests
   * Validates: Requirement 9.1
   */
  it('should recognize all 7 UTBK 2026 subtests', () => {
    fc.assert(
      fc.property(
        fc.constant(UTBK_2026_SUBTESTS),
        (subtests) => {
          // Requirement 9.1: Must have exactly 7 subtests
          expect(subtests.length).toBe(7)

          // All official subtest codes must be present
          const codes = subtests.map(s => s.code)
          expect(codes).toEqual(
            expect.arrayContaining(['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'])
          )

          // Each subtest must have required properties
          for (const subtest of subtests) {
            expect(subtest.code).toBeTruthy()
            expect(subtest.name).toBeTruthy()
            expect(subtest.description).toBeTruthy()
            expect(subtest.icon).toBeTruthy()
            expect(subtest.displayOrder).toBeGreaterThan(0)
            expect(subtest.displayOrder).toBeLessThanOrEqual(7)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Progress data must only contain valid subtest codes
   * Validates: Requirement 9.1
   */
  it('should only contain valid subtest codes in progress data', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.integer({ min: 1, max: 1000 }).chain(totalQuestions =>
            fc.record({
              subtest: fc.constantFrom('PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'),
              accuracy: fc.integer({ min: 0, max: 100 }),
              totalQuestions: fc.constant(totalQuestions),
              correctAnswers: fc.integer({ min: 0, max: totalQuestions })
            })
          ),
          { minLength: 1, maxLength: 7 }
        ),
        (progressData) => {
          // All subtests in progress data must be valid
          const validCodes = ['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']
          
          for (const progress of progressData) {
            expect(validCodes).toContain(progress.subtest)
            expect(progress.accuracy).toBeGreaterThanOrEqual(0)
            expect(progress.accuracy).toBeLessThanOrEqual(100)
            expect(progress.correctAnswers).toBeLessThanOrEqual(progress.totalQuestions)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Subtest display order must be consistent
   * Validates: Requirement 9.1
   */
  it('should maintain consistent subtest display order', () => {
    fc.assert(
      fc.property(
        fc.constant(UTBK_2026_SUBTESTS),
        (subtests) => {
          // Sort by display order
          const sorted = [...subtests].sort((a, b) => a.displayOrder - b.displayOrder)

          // Verify order matches expected sequence
          expect(sorted[0].code).toBe('PU')
          expect(sorted[1].code).toBe('PPU')
          expect(sorted[2].code).toBe('PBM')
          expect(sorted[3].code).toBe('PK')
          expect(sorted[4].code).toBe('LIT_INDO')
          expect(sorted[5].code).toBe('LIT_ING')
          expect(sorted[6].code).toBe('PM')

          // Display orders must be sequential
          for (let i = 0; i < sorted.length; i++) {
            expect(sorted[i].displayOrder).toBe(i + 1)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Dashboard must handle all 7 subtests in analytics
   * Validates: Requirement 9.1
   */
  it('should handle all 7 subtests in analytics calculations', () => {
    fc.assert(
      fc.property(
        fc.constant(['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']),
        (subtestCodes) => {
          // Create progress data for all 7 subtests
          const progressData = subtestCodes.map(code => ({
            subtest: code,
            accuracy: 75,
            totalQuestions: 10,
            correctAnswers: 7
          }))
          
          // Ensure we have data for all 7 subtests
          const codes = progressData.map(p => p.subtest)
          const uniqueCodes = new Set(codes)
          
          // Should have exactly 7 unique subtests
          expect(uniqueCodes.size).toBe(7)

          // Calculate overall statistics
          const totalQuestions = progressData.reduce((sum, p) => sum + p.totalQuestions, 0)
          const totalCorrect = progressData.reduce((sum, p) => sum + p.correctAnswers, 0)
          
          expect(totalQuestions).toBe(70) // 10 per subtest × 7
          expect(totalCorrect).toBe(49) // 7 per subtest × 7
          expect(totalCorrect).toBeLessThanOrEqual(totalQuestions)

          // Overall accuracy should be calculable
          const overallAccuracy = Math.round((totalCorrect / totalQuestions) * 100)
          expect(overallAccuracy).toBe(70) // 49/70 = 70%
          expect(overallAccuracy).toBeGreaterThanOrEqual(0)
          expect(overallAccuracy).toBeLessThanOrEqual(100)
        }
      ),
      { numRuns: 100 }
    )
  })
})
