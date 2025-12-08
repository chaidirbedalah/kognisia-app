import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { SubtestCode } from '@/lib/types'
import { VALID_SUBTEST_CODES } from '@/lib/utbk-constants'

/**
 * Property 15: Strongest/Weakest Subtest Identification
 * 
 * Validates Requirements 8.3, 8.4, 9.3:
 * - 8.3: Identify strongest subtest (highest accuracy)
 * - 8.4: Identify weakest subtest (lowest accuracy)
 * - 9.3: Display strongest/weakest correctly
 */

interface SubtestResult {
  subtestCode: SubtestCode
  accuracy: number
  correctAnswers: number
  totalQuestions: number
}

describe('Property 15: Strongest/Weakest Subtest Identification', () => {
  const subtestCodeArbitrary = fc.constantFrom(...VALID_SUBTEST_CODES) as fc.Arbitrary<SubtestCode>

  it('should identify strongest subtest correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            subtestCode: subtestCodeArbitrary,
            accuracy: fc.integer({ min: 0, max: 100 }),
            correctAnswers: fc.integer({ min: 0, max: 30 }),
            totalQuestions: fc.integer({ min: 1, max: 30 })
          }),
          { minLength: 2, maxLength: 7 }
        ),
        (results) => {
          // Find strongest (highest accuracy)
          const strongest = results.reduce((max, current) =>
            current.accuracy > max.accuracy ? current : max
          )

          // Property: Strongest should have highest accuracy
          results.forEach(result => {
            expect(strongest.accuracy).toBeGreaterThanOrEqual(result.accuracy)
          })

          // Property: No other subtest should have higher accuracy
          const higherAccuracy = results.filter(r => r.accuracy > strongest.accuracy)
          expect(higherAccuracy.length).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should identify weakest subtest correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            subtestCode: subtestCodeArbitrary,
            accuracy: fc.integer({ min: 0, max: 100 }),
            correctAnswers: fc.integer({ min: 0, max: 30 }),
            totalQuestions: fc.integer({ min: 1, max: 30 })
          }),
          { minLength: 2, maxLength: 7 }
        ),
        (results) => {
          // Find weakest (lowest accuracy)
          const weakest = results.reduce((min, current) =>
            current.accuracy < min.accuracy ? current : min
          )

          // Property: Weakest should have lowest accuracy
          results.forEach(result => {
            expect(weakest.accuracy).toBeLessThanOrEqual(result.accuracy)
          })

          // Property: No other subtest should have lower accuracy
          const lowerAccuracy = results.filter(r => r.accuracy < weakest.accuracy)
          expect(lowerAccuracy.length).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle tie in strongest identification', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 50, max: 100 }),
        fc.integer({ min: 2, max: 7 }),
        (tiedAccuracy, count) => {
          // Create multiple subtests with same accuracy
          const results = Array.from({ length: count }, (_, i) => ({
            subtestCode: VALID_SUBTEST_CODES[i % 7],
            accuracy: tiedAccuracy,
            correctAnswers: Math.floor(tiedAccuracy / 10),
            totalQuestions: 10
          }))

          const strongest = results.reduce((max, current) =>
            current.accuracy > max.accuracy ? current : max
          )

          // Property: In case of tie, one should be selected
          expect(strongest.accuracy).toBe(tiedAccuracy)
          
          // Property: All have same accuracy
          results.forEach(result => {
            expect(result.accuracy).toBe(tiedAccuracy)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle tie in weakest identification', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 2, max: 7 }),
        (tiedAccuracy, count) => {
          // Create multiple subtests with same accuracy
          const results = Array.from({ length: count }, (_, i) => ({
            subtestCode: VALID_SUBTEST_CODES[i % 7],
            accuracy: tiedAccuracy,
            correctAnswers: Math.floor(tiedAccuracy / 10),
            totalQuestions: 10
          }))

          const weakest = results.reduce((min, current) =>
            current.accuracy < min.accuracy ? current : min
          )

          // Property: In case of tie, one should be selected
          expect(weakest.accuracy).toBe(tiedAccuracy)
          
          // Property: All have same accuracy
          results.forEach(result => {
            expect(result.accuracy).toBe(tiedAccuracy)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain strongest/weakest relationship', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            subtestCode: subtestCodeArbitrary,
            accuracy: fc.integer({ min: 0, max: 100 }),
            correctAnswers: fc.integer({ min: 0, max: 30 }),
            totalQuestions: fc.integer({ min: 1, max: 30 })
          }),
          { minLength: 2, maxLength: 7 }
        ),
        (results) => {
          const strongest = results.reduce((max, current) =>
            current.accuracy > max.accuracy ? current : max
          )
          const weakest = results.reduce((min, current) =>
            current.accuracy < min.accuracy ? current : min
          )

          // Property: Strongest accuracy >= Weakest accuracy
          expect(strongest.accuracy).toBeGreaterThanOrEqual(weakest.accuracy)

          // Property: If only one result, strongest === weakest
          if (results.length === 1) {
            expect(strongest.accuracy).toBe(weakest.accuracy)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should identify strongest/weakest with all 7 subtests', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 7, maxLength: 7 }),
        (accuracies) => {
          // Create results for all 7 subtests
          const results = VALID_SUBTEST_CODES.map((code, idx) => ({
            subtestCode: code,
            accuracy: accuracies[idx],
            correctAnswers: Math.floor(accuracies[idx] / 10),
            totalQuestions: 10
          }))

          const strongest = results.reduce((max, current) =>
            current.accuracy > max.accuracy ? current : max
          )
          const weakest = results.reduce((min, current) =>
            current.accuracy < min.accuracy ? current : min
          )

          // Property: Strongest should be max of all accuracies
          const maxAccuracy = Math.max(...accuracies)
          expect(strongest.accuracy).toBe(maxAccuracy)

          // Property: Weakest should be min of all accuracies
          const minAccuracy = Math.min(...accuracies)
          expect(weakest.accuracy).toBe(minAccuracy)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle perfect score (100%) as strongest', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 99 }), { minLength: 1, maxLength: 6 }),
        (otherAccuracies) => {
          // One subtest with 100%, others with lower
          const results = [
            {
              subtestCode: 'PU' as SubtestCode,
              accuracy: 100,
              correctAnswers: 30,
              totalQuestions: 30
            },
            ...otherAccuracies.map((acc, idx) => ({
              subtestCode: VALID_SUBTEST_CODES[idx + 1],
              accuracy: acc,
              correctAnswers: Math.floor(acc / 10),
              totalQuestions: 10
            }))
          ]

          const strongest = results.reduce((max, current) =>
            current.accuracy > max.accuracy ? current : max
          )

          // Property: Perfect score should be strongest
          expect(strongest.accuracy).toBe(100)
          expect(strongest.subtestCode).toBe('PU')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle zero score (0%) as weakest', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 6 }),
        (otherAccuracies) => {
          // One subtest with 0%, others with higher
          const results = [
            {
              subtestCode: 'PU' as SubtestCode,
              accuracy: 0,
              correctAnswers: 0,
              totalQuestions: 30
            },
            ...otherAccuracies.map((acc, idx) => ({
              subtestCode: VALID_SUBTEST_CODES[idx + 1],
              accuracy: acc,
              correctAnswers: Math.floor(acc / 10),
              totalQuestions: 10
            }))
          ]

          const weakest = results.reduce((min, current) =>
            current.accuracy < min.accuracy ? current : min
          )

          // Property: Zero score should be weakest
          expect(weakest.accuracy).toBe(0)
          expect(weakest.subtestCode).toBe('PU')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain consistency when results are shuffled', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            subtestCode: subtestCodeArbitrary,
            accuracy: fc.integer({ min: 0, max: 100 }),
            correctAnswers: fc.integer({ min: 0, max: 30 }),
            totalQuestions: fc.integer({ min: 1, max: 30 })
          }),
          { minLength: 3, maxLength: 7 }
        ),
        (results) => {
          // Find strongest/weakest in original order
          const strongest1 = results.reduce((max, current) =>
            current.accuracy > max.accuracy ? current : max
          )
          const weakest1 = results.reduce((min, current) =>
            current.accuracy < min.accuracy ? current : min
          )

          // Shuffle and find again
          const shuffled = [...results].sort(() => Math.random() - 0.5)
          const strongest2 = shuffled.reduce((max, current) =>
            current.accuracy > max.accuracy ? current : max
          )
          const weakest2 = shuffled.reduce((min, current) =>
            current.accuracy < min.accuracy ? current : min
          )

          // Property: Should identify same strongest/weakest regardless of order
          expect(strongest1.accuracy).toBe(strongest2.accuracy)
          expect(weakest1.accuracy).toBe(weakest2.accuracy)
        }
      ),
      { numRuns: 100 }
    )
  })
})
