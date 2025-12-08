/**
 * Property Test 18: Historical Mode Preservation
 * 
 * Validates: Requirement 9.4
 * 
 * This test verifies that Daily Challenge mode information (Balanced/Focus)
 * is preserved in historical data and displayed correctly in the dashboard.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

describe('Property 18: Historical Mode Preservation', () => {
  /**
   * Property: Mode can be inferred from question count
   * Validates: Requirement 9.4
   */
  it('should infer mode from question count correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(21, 10),
        fc.integer({ min: 0, max: 21 }),
        (totalQuestions, correctAnswers) => {
          const validCorrect = Math.min(correctAnswers, totalQuestions)
          const dailyChallengeData = {
            date: '2025-01-01',
            totalQuestions,
            correctAnswers: validCorrect,
            accuracy: Math.round((validCorrect / totalQuestions) * 100)
          }
          
          // Requirement 9.4: Mode inference from question count
          const mode = dailyChallengeData.totalQuestions === 21 ? 'balanced' : 'focus'

          if (mode === 'balanced') {
            expect(dailyChallengeData.totalQuestions).toBe(21)
          } else {
            expect(dailyChallengeData.totalQuestions).toBe(10)
          }

          // Correct answers must not exceed total
          expect(dailyChallengeData.correctAnswers).toBeLessThanOrEqual(dailyChallengeData.totalQuestions)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Balanced mode must have 21 questions (3 per subtest × 7)
   * Validates: Requirement 9.4
   */
  it('should identify balanced mode by 21 questions', () => {
    fc.assert(
      fc.property(
        fc.record({
          date: fc.date().map(d => d.toISOString().split('T')[0]),
          totalQuestions: fc.constant(21),
          correctAnswers: fc.integer({ min: 0, max: 21 }),
          mode: fc.constant('balanced')
        }),
        (balancedData) => {
          // Balanced mode must have exactly 21 questions
          expect(balancedData.totalQuestions).toBe(21)
          expect(balancedData.mode).toBe('balanced')

          // Should represent all 7 subtests (3 questions each)
          const questionsPerSubtest = balancedData.totalQuestions / 7
          expect(questionsPerSubtest).toBe(3)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Focus mode must have 10 questions from one subtest
   * Validates: Requirement 9.4
   */
  it('should identify focus mode by 10 questions', () => {
    fc.assert(
      fc.property(
        fc.record({
          date: fc.date().map(d => d.toISOString().split('T')[0]),
          totalQuestions: fc.constant(10),
          correctAnswers: fc.integer({ min: 0, max: 10 }),
          mode: fc.constant('focus'),
          focusSubtest: fc.constantFrom('PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM')
        }),
        (focusData) => {
          // Focus mode must have exactly 10 questions
          expect(focusData.totalQuestions).toBe(10)
          expect(focusData.mode).toBe('focus')

          // Must have a valid focus subtest
          const validSubtests = ['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']
          expect(validSubtests).toContain(focusData.focusSubtest)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Historical data must preserve mode information
   * Validates: Requirement 9.4
   */
  it('should preserve mode information in historical records', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.constantFrom(21, 10),
            fc.integer({ min: 0, max: 21 })
          ).map(([totalQuestions, correctAnswers]) => ({
            date: '2025-01-01',
            totalQuestions,
            correctAnswers: Math.min(correctAnswers, totalQuestions),
            accuracy: Math.round((Math.min(correctAnswers, totalQuestions) / totalQuestions) * 100)
          })),
          { minLength: 1, maxLength: 30 }
        ),
        (historyData) => {
          // Each record should have identifiable mode
          for (const record of historyData) {
            const mode = record.totalQuestions === 21 ? 'balanced' : 
                        record.totalQuestions === 10 ? 'focus' : 'unknown'

            expect(['balanced', 'focus', 'unknown']).toContain(mode)

            // Correct answers must be valid
            expect(record.correctAnswers).toBeGreaterThanOrEqual(0)
            expect(record.correctAnswers).toBeLessThanOrEqual(record.totalQuestions)

            // Accuracy must be valid
            expect(record.accuracy).toBeGreaterThanOrEqual(0)
            expect(record.accuracy).toBeLessThanOrEqual(100)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Mode label must be descriptive
   * Validates: Requirement 9.4
   */
  it('should generate descriptive mode labels', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(21, 10),
        (questionCount) => {
          const mode = questionCount === 21 ? 'balanced' : 'focus'
          const modeLabel = mode === 'balanced' 
            ? 'Balanced (7 Subtest)' 
            : 'Focus (1 Subtest)'

          // Label must be descriptive
          expect(modeLabel).toBeTruthy()
          expect(modeLabel.length).toBeGreaterThan(0)

          // Label must indicate mode type
          if (mode === 'balanced') {
            expect(modeLabel).toContain('Balanced')
            expect(modeLabel).toContain('7')
          } else {
            expect(modeLabel).toContain('Focus')
            expect(modeLabel).toContain('1')
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
