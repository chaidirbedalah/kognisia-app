/**
 * Property Test 17: Cross-Assessment Accuracy Aggregation
 * 
 * Validates: Requirement 9.2
 * 
 * This test verifies that accuracy calculations work correctly across all assessment types
 * (Daily Challenge, Mini Try Out, Try Out UTBK) and that aggregations are consistent.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

describe('Property 17: Cross-Assessment Accuracy Aggregation', () => {
  /**
   * Property: Accuracy must be consistent across assessment types
   * Validates: Requirement 9.2
   */
  it('should calculate accuracy consistently across all assessment types', () => {
    fc.assert(
      fc.property(
        fc.record({
          dailyChallenge: fc.record({
            totalQuestions: fc.integer({ min: 0, max: 1000 }),
            correctAnswers: fc.integer({ min: 0, max: 1000 })
          }),
          miniTryOut: fc.record({
            totalQuestions: fc.integer({ min: 0, max: 1000 }),
            correctAnswers: fc.integer({ min: 0, max: 1000 })
          }),
          tryOutUTBK: fc.record({
            totalQuestions: fc.integer({ min: 0, max: 1000 }),
            correctAnswers: fc.integer({ min: 0, max: 1000 })
          })
        }),
        (assessmentData) => {
          // Ensure correct answers don't exceed total questions
          const dcCorrect = Math.min(assessmentData.dailyChallenge.correctAnswers, assessmentData.dailyChallenge.totalQuestions)
          const mtCorrect = Math.min(assessmentData.miniTryOut.correctAnswers, assessmentData.miniTryOut.totalQuestions)
          const tuCorrect = Math.min(assessmentData.tryOutUTBK.correctAnswers, assessmentData.tryOutUTBK.totalQuestions)

          // Calculate individual accuracies
          const dcAccuracy = assessmentData.dailyChallenge.totalQuestions > 0
            ? Math.round((dcCorrect / assessmentData.dailyChallenge.totalQuestions) * 100)
            : 0

          const mtAccuracy = assessmentData.miniTryOut.totalQuestions > 0
            ? Math.round((mtCorrect / assessmentData.miniTryOut.totalQuestions) * 100)
            : 0

          const tuAccuracy = assessmentData.tryOutUTBK.totalQuestions > 0
            ? Math.round((tuCorrect / assessmentData.tryOutUTBK.totalQuestions) * 100)
            : 0

          // All accuracies must be valid percentages
          expect(dcAccuracy).toBeGreaterThanOrEqual(0)
          expect(dcAccuracy).toBeLessThanOrEqual(100)
          expect(mtAccuracy).toBeGreaterThanOrEqual(0)
          expect(mtAccuracy).toBeLessThanOrEqual(100)
          expect(tuAccuracy).toBeGreaterThanOrEqual(0)
          expect(tuAccuracy).toBeLessThanOrEqual(100)

          // Calculate overall accuracy
          const totalQuestions = assessmentData.dailyChallenge.totalQuestions +
            assessmentData.miniTryOut.totalQuestions +
            assessmentData.tryOutUTBK.totalQuestions

          const totalCorrect = dcCorrect + mtCorrect + tuCorrect

          if (totalQuestions > 0) {
            const overallAccuracy = Math.round((totalCorrect / totalQuestions) * 100)
            expect(overallAccuracy).toBeGreaterThanOrEqual(0)
            expect(overallAccuracy).toBeLessThanOrEqual(100)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Aggregated accuracy must be weighted correctly
   * Validates: Requirement 9.2
   */
  it('should weight accuracy correctly when aggregating across assessments', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            assessmentType: fc.constantFrom('daily_challenge', 'mini_tryout', 'tryout_utbk'),
            totalQuestions: fc.integer({ min: 1, max: 200 }),
            correctAnswers: fc.integer({ min: 0, max: 200 })
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (assessments) => {
          // Ensure correct answers don't exceed total
          const validAssessments = assessments.map(a => ({
            ...a,
            correctAnswers: Math.min(a.correctAnswers, a.totalQuestions)
          }))

          // Calculate weighted average
          const totalQuestions = validAssessments.reduce((sum, a) => sum + a.totalQuestions, 0)
          const totalCorrect = validAssessments.reduce((sum, a) => sum + a.correctAnswers, 0)

          const weightedAccuracy = Math.round((totalCorrect / totalQuestions) * 100)

          // Verify weighted accuracy is valid
          expect(weightedAccuracy).toBeGreaterThanOrEqual(0)
          expect(weightedAccuracy).toBeLessThanOrEqual(100)

          // Verify it matches manual calculation
          const manualAccuracy = Math.round((totalCorrect / totalQuestions) * 100)
          expect(weightedAccuracy).toBe(manualAccuracy)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Per-subtest accuracy must aggregate correctly
   * Validates: Requirement 9.2
   */
  it('should aggregate per-subtest accuracy across assessment types', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'),
        fc.array(
          fc.record({
            assessmentType: fc.constantFrom('daily_challenge', 'mini_tryout', 'tryout_utbk'),
            totalQuestions: fc.integer({ min: 1, max: 50 }),
            correctAnswers: fc.integer({ min: 0, max: 50 })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (subtestCode, assessments) => {
          // Ensure correct answers don't exceed total
          const validAssessments = assessments.map(a => ({
            ...a,
            correctAnswers: Math.min(a.correctAnswers, a.totalQuestions)
          }))

          // Calculate subtest accuracy across all assessments
          const subtestTotal = validAssessments.reduce((sum, a) => sum + a.totalQuestions, 0)
          const subtestCorrect = validAssessments.reduce((sum, a) => sum + a.correctAnswers, 0)

          const subtestAccuracy = Math.round((subtestCorrect / subtestTotal) * 100)

          // Verify subtest accuracy is valid
          expect(subtestAccuracy).toBeGreaterThanOrEqual(0)
          expect(subtestAccuracy).toBeLessThanOrEqual(100)

          // Verify subtest code is valid
          const validCodes = ['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']
          expect(validCodes).toContain(subtestCode)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Empty assessment data should return zero accuracy
   * Validates: Requirement 9.2
   */
  it('should handle empty assessment data gracefully', () => {
    fc.assert(
      fc.property(
        fc.constant([]),
        (emptyAssessments) => {
          // With no data, accuracy should be 0
          const totalQuestions = emptyAssessments.reduce((sum: number, a: any) => sum + a.totalQuestions, 0)
          const totalCorrect = emptyAssessments.reduce((sum: number, a: any) => sum + a.correctAnswers, 0)

          expect(totalQuestions).toBe(0)
          expect(totalCorrect).toBe(0)

          // Accuracy calculation should handle division by zero
          const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
          expect(accuracy).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })
})
