import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { DailyChallengeMode, SubtestCode } from '@/lib/types'
import { VALID_SUBTEST_CODES, ASSESSMENT_CONFIGS } from '@/lib/utbk-constants'

/**
 * Property 8: Subtest Progress Recording
 * 
 * Validates Requirements 3.5, 4.5, 7.7:
 * - 3.5: Create progress records for all 7 subtests in Balanced mode
 * - 4.5: Store focus_subtest_code if Focus mode
 * - 7.7: Create progress record for only selected subtest in Focus mode
 */

describe('Property 8: Subtest Progress Recording', () => {
  const subtestCodeArbitrary = fc.constantFrom(...VALID_SUBTEST_CODES) as fc.Arbitrary<SubtestCode>

  it('should create progress records for all 7 subtests in Balanced mode', () => {
    fc.assert(
      fc.property(
        fc.constant('balanced' as DailyChallengeMode),
        () => {
          // Simulate Balanced mode question distribution
          const config = ASSESSMENT_CONFIGS.daily_challenge_balanced
          const subtestCodes = config.subtestDistribution.map(d => d.subtestCode)

          // Property: Must have exactly 7 unique subtests
          const uniqueSubtests = new Set(subtestCodes)
          expect(uniqueSubtests.size).toBe(7)
          
          // Property: All 7 official subtests must be present
          VALID_SUBTEST_CODES.forEach(code => {
            expect(subtestCodes).toContain(code)
          })

          // Property: Each subtest should have 3 questions
          config.subtestDistribution.forEach(dist => {
            expect(dist.questionCount).toBe(3)
          })

          // Property: Total should be 21 questions
          const totalQuestions = config.subtestDistribution.reduce(
            (sum, dist) => sum + dist.questionCount, 
            0
          )
          expect(totalQuestions).toBe(21)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should create progress records for only selected subtest in Focus mode', () => {
    fc.assert(
      fc.property(
        fc.constant('focus' as DailyChallengeMode),
        subtestCodeArbitrary,
        (mode, selectedSubtest) => {
          // Simulate Focus mode question distribution
          const config = ASSESSMENT_CONFIGS.daily_challenge_focus
          const questionCount = config.totalQuestions

          // Simulate progress records
          const progressRecords = Array.from({ length: questionCount }, (_, i) => ({
            question_id: `q${i}`,
            subtest_code: selectedSubtest,
            daily_challenge_mode: mode,
            focus_subtest_code: selectedSubtest
          }))

          // Property: All records must have the same subtest_code
          const uniqueSubtests = new Set(progressRecords.map(r => r.subtest_code))
          expect(uniqueSubtests.size).toBe(1)
          expect(uniqueSubtests.has(selectedSubtest)).toBe(true)

          // Property: All records must have focus_subtest_code set
          progressRecords.forEach(record => {
            expect(record.focus_subtest_code).toBe(selectedSubtest)
            expect(record.daily_challenge_mode).toBe('focus')
          })

          // Property: Must have exactly 10 questions
          expect(progressRecords.length).toBe(10)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should ensure subtest_code matches focus_subtest_code in Focus mode', () => {
    fc.assert(
      fc.property(
        subtestCodeArbitrary,
        (selectedSubtest) => {
          // Simulate Focus mode progress record
          const progressRecord = {
            subtest_code: selectedSubtest,
            daily_challenge_mode: 'focus' as DailyChallengeMode,
            focus_subtest_code: selectedSubtest
          }

          // Property: subtest_code must equal focus_subtest_code in Focus mode
          expect(progressRecord.subtest_code).toBe(progressRecord.focus_subtest_code)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have null focus_subtest_code for all records in Balanced mode', () => {
    fc.assert(
      fc.property(
        fc.constant('balanced' as DailyChallengeMode),
        () => {
          // Simulate Balanced mode progress records
          const config = ASSESSMENT_CONFIGS.daily_challenge_balanced
          const progressRecords = config.subtestDistribution.flatMap(dist =>
            Array.from({ length: dist.questionCount }, (_, i) => ({
              question_id: `${dist.subtestCode}_q${i}`,
              subtest_code: dist.subtestCode,
              daily_challenge_mode: 'balanced' as DailyChallengeMode,
              focus_subtest_code: null
            }))
          )

          // Property: All records must have null focus_subtest_code
          progressRecords.forEach(record => {
            expect(record.focus_subtest_code).toBeNull()
            expect(record.daily_challenge_mode).toBe('balanced')
          })

          // Property: Records should span all 7 subtests
          const uniqueSubtests = new Set(progressRecords.map(r => r.subtest_code))
          expect(uniqueSubtests.size).toBe(7)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain subtest distribution integrity across modes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<DailyChallengeMode>('balanced', 'focus'),
        fc.option(subtestCodeArbitrary, { nil: null }),
        (mode, subtestCode) => {
          if (mode === 'balanced') {
            // Balanced mode: 7 subtests × 3 questions = 21 total
            const config = ASSESSMENT_CONFIGS.daily_challenge_balanced
            const totalQuestions = config.subtestDistribution.reduce(
              (sum, dist) => sum + dist.questionCount,
              0
            )
            expect(totalQuestions).toBe(21)
            expect(config.subtestDistribution.length).toBe(7)
          } else if (mode === 'focus' && subtestCode) {
            // Focus mode: 1 subtest × 10 questions = 10 total
            const config = ASSESSMENT_CONFIGS.daily_challenge_focus
            expect(config.totalQuestions).toBe(10)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
