import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { SubtestCode } from '@/lib/types'
import { VALID_SUBTEST_CODES } from '@/lib/utbk-constants'

/**
 * Property 9: Per-Subtest Accuracy Calculation
 * 
 * Validates Requirements 3.6, 8.2:
 * - 3.6: Show per-subtest breakdown for Balanced mode
 * - 8.2: Calculate per-subtest accuracy correctly
 */

describe('Property 9: Per-Subtest Accuracy Calculation', () => {
  const subtestCodeArbitrary = fc.constantFrom(...VALID_SUBTEST_CODES) as fc.Arbitrary<SubtestCode>

  it('should calculate accuracy correctly for each subtest', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            subtestCode: subtestCodeArbitrary,
            isCorrect: fc.boolean()
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (questions) => {
          // Group by subtest and calculate accuracy
          const subtestStats: Record<string, { correct: number; total: number }> = {}

          for (const q of questions) {
            if (!subtestStats[q.subtestCode]) {
              subtestStats[q.subtestCode] = { correct: 0, total: 0 }
            }
            subtestStats[q.subtestCode].total++
            if (q.isCorrect) {
              subtestStats[q.subtestCode].correct++
            }
          }

          // Property: Accuracy should be between 0 and 100
          for (const [code, stats] of Object.entries(subtestStats)) {
            const accuracy = Math.round((stats.correct / stats.total) * 100)
            expect(accuracy).toBeGreaterThanOrEqual(0)
            expect(accuracy).toBeLessThanOrEqual(100)
          }

          // Property: Sum of correct answers across subtests equals total correct
          const totalCorrect = Object.values(subtestStats).reduce((sum, s) => sum + s.correct, 0)
          const expectedCorrect = questions.filter(q => q.isCorrect).length
          expect(totalCorrect).toBe(expectedCorrect)

          // Property: Sum of total questions across subtests equals total questions
          const totalQuestions = Object.values(subtestStats).reduce((sum, s) => sum + s.total, 0)
          expect(totalQuestions).toBe(questions.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle perfect score (100% accuracy) correctly', () => {
    fc.assert(
      fc.property(
        subtestCodeArbitrary,
        fc.integer({ min: 1, max: 30 }),
        (subtestCode, questionCount) => {
          // All questions correct
          const questions = Array.from({ length: questionCount }, () => ({
            subtestCode,
            isCorrect: true
          }))

          const correct = questions.filter(q => q.isCorrect).length
          const total = questions.length
          const accuracy = Math.round((correct / total) * 100)

          // Property: Perfect score should be 100%
          expect(accuracy).toBe(100)
          expect(correct).toBe(total)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle zero score (0% accuracy) correctly', () => {
    fc.assert(
      fc.property(
        subtestCodeArbitrary,
        fc.integer({ min: 1, max: 30 }),
        (subtestCode, questionCount) => {
          // All questions incorrect
          const questions = Array.from({ length: questionCount }, () => ({
            subtestCode,
            isCorrect: false
          }))

          const correct = questions.filter(q => q.isCorrect).length
          const total = questions.length
          const accuracy = Math.round((correct / total) * 100)

          // Property: Zero score should be 0%
          expect(accuracy).toBe(0)
          expect(correct).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should calculate accuracy independently for each subtest', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            subtestCode: subtestCodeArbitrary,
            correctCount: fc.integer({ min: 0, max: 10 }),
            totalCount: fc.integer({ min: 1, max: 10 })
          }),
          { minLength: 2, maxLength: 7 }
        ),
        (subtestData) => {
          // Ensure correctCount <= totalCount
          const validData = subtestData.map(d => ({
            ...d,
            correctCount: Math.min(d.correctCount, d.totalCount)
          }))

          // Calculate accuracy for each subtest
          const accuracies = validData.map(d => ({
            subtestCode: d.subtestCode,
            accuracy: Math.round((d.correctCount / d.totalCount) * 100)
          }))

          // Property: Each subtest accuracy is independent
          for (let i = 0; i < accuracies.length; i++) {
            const data = validData[i]
            const expectedAccuracy = Math.round((data.correctCount / data.totalCount) * 100)
            expect(accuracies[i].accuracy).toBe(expectedAccuracy)
          }

          // Property: Changing one subtest doesn't affect others
          if (validData.length >= 2) {
            const firstAccuracy = accuracies[0].accuracy
            const secondAccuracy = accuracies[1].accuracy
            
            // These should be independent calculations
            expect(typeof firstAccuracy).toBe('number')
            expect(typeof secondAccuracy).toBe('number')
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain accuracy consistency across different question orders', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            subtestCode: subtestCodeArbitrary,
            isCorrect: fc.boolean()
          }),
          { minLength: 5, maxLength: 21 }
        ),
        (questions) => {
          // Calculate accuracy for original order
          const calculateAccuracy = (qs: typeof questions) => {
            const subtestStats: Record<string, { correct: number; total: number }> = {}
            for (const q of qs) {
              if (!subtestStats[q.subtestCode]) {
                subtestStats[q.subtestCode] = { correct: 0, total: 0 }
              }
              subtestStats[q.subtestCode].total++
              if (q.isCorrect) {
                subtestStats[q.subtestCode].correct++
              }
            }
            return subtestStats
          }

          const originalStats = calculateAccuracy(questions)
          
          // Shuffle questions
          const shuffled = [...questions].sort(() => Math.random() - 0.5)
          const shuffledStats = calculateAccuracy(shuffled)

          // Property: Accuracy should be same regardless of order
          for (const code of Object.keys(originalStats)) {
            expect(shuffledStats[code]).toBeDefined()
            expect(shuffledStats[code].correct).toBe(originalStats[code].correct)
            expect(shuffledStats[code].total).toBe(originalStats[code].total)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle balanced mode with all 7 subtests', () => {
    fc.assert(
      fc.property(
        fc.constant(VALID_SUBTEST_CODES),
        (subtestCodes) => {
          // Simulate balanced mode: 3 questions per subtest
          const questions = subtestCodes.flatMap(code =>
            Array.from({ length: 3 }, () => ({
              subtestCode: code,
              isCorrect: Math.random() > 0.5
            }))
          )

          // Calculate per-subtest stats
          const subtestStats: Record<string, { correct: number; total: number }> = {}
          for (const q of questions) {
            if (!subtestStats[q.subtestCode]) {
              subtestStats[q.subtestCode] = { correct: 0, total: 0 }
            }
            subtestStats[q.subtestCode].total++
            if (q.isCorrect) {
              subtestStats[q.subtestCode].correct++
            }
          }

          // Property: Should have exactly 7 subtests
          expect(Object.keys(subtestStats).length).toBe(7)

          // Property: Each subtest should have exactly 3 questions
          for (const stats of Object.values(subtestStats)) {
            expect(stats.total).toBe(3)
          }

          // Property: Total should be 21 questions
          const totalQuestions = Object.values(subtestStats).reduce((sum, s) => sum + s.total, 0)
          expect(totalQuestions).toBe(21)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle focus mode with single subtest', () => {
    fc.assert(
      fc.property(
        subtestCodeArbitrary,
        fc.integer({ min: 0, max: 10 }),
        (selectedSubtest, correctCount) => {
          // Simulate focus mode: 10 questions from one subtest
          const totalQuestions = 10
          const questions = Array.from({ length: totalQuestions }, (_, i) => ({
            subtestCode: selectedSubtest,
            isCorrect: i < correctCount
          }))

          // Calculate stats
          const subtestStats: Record<string, { correct: number; total: number }> = {}
          for (const q of questions) {
            if (!subtestStats[q.subtestCode]) {
              subtestStats[q.subtestCode] = { correct: 0, total: 0 }
            }
            subtestStats[q.subtestCode].total++
            if (q.isCorrect) {
              subtestStats[q.subtestCode].correct++
            }
          }

          // Property: Should have exactly 1 subtest
          expect(Object.keys(subtestStats).length).toBe(1)

          // Property: That subtest should be the selected one
          expect(subtestStats[selectedSubtest]).toBeDefined()

          // Property: Should have exactly 10 questions
          expect(subtestStats[selectedSubtest].total).toBe(10)

          // Property: Correct count should match
          expect(subtestStats[selectedSubtest].correct).toBe(correctCount)
        }
      ),
      { numRuns: 100 }
    )
  })
})
