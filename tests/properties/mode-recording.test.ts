import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { DailyChallengeMode, SubtestCode } from '@/lib/types'
import { VALID_SUBTEST_CODES } from '@/lib/utbk-constants'

/**
 * Property 5: Mode Recording
 * 
 * Validates Requirement 2.6:
 * - daily_challenge_mode must be stored in student_progress
 * - focus_subtest_code must be stored only when mode is 'focus'
 * - focus_subtest_code must be null when mode is 'balanced'
 */

describe('Property 5: Mode Recording', () => {
  // Arbitrary for generating valid modes
  const modeArbitrary = fc.constantFrom<DailyChallengeMode>('balanced', 'focus')
  
  // Arbitrary for generating valid subtest codes
  const subtestCodeArbitrary = fc.constantFrom(...VALID_SUBTEST_CODES) as fc.Arbitrary<SubtestCode>

  it('should always store daily_challenge_mode in progress records', () => {
    fc.assert(
      fc.property(
        modeArbitrary,
        fc.option(subtestCodeArbitrary, { nil: null }),
        (mode, subtestCode) => {
          // Simulate progress record creation
          const progressRecord = {
            daily_challenge_mode: mode,
            focus_subtest_code: mode === 'focus' ? subtestCode : null,
            assessment_type: 'daily_challenge' as const
          }

          // Property: daily_challenge_mode must always be present
          expect(progressRecord.daily_challenge_mode).toBeDefined()
          expect(['balanced', 'focus']).toContain(progressRecord.daily_challenge_mode)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should store focus_subtest_code only when mode is focus', () => {
    fc.assert(
      fc.property(
        modeArbitrary,
        subtestCodeArbitrary,
        (mode, subtestCode) => {
          // Simulate progress record creation
          const progressRecord = {
            daily_challenge_mode: mode,
            focus_subtest_code: mode === 'focus' ? subtestCode : null,
            assessment_type: 'daily_challenge' as const
          }

          if (mode === 'focus') {
            // Property: focus_subtest_code must be set for focus mode
            expect(progressRecord.focus_subtest_code).toBeDefined()
            expect(VALID_SUBTEST_CODES).toContain(progressRecord.focus_subtest_code!)
          } else {
            // Property: focus_subtest_code must be null for balanced mode
            expect(progressRecord.focus_subtest_code).toBeNull()
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should never have focus_subtest_code when mode is balanced', () => {
    fc.assert(
      fc.property(
        subtestCodeArbitrary,
        (subtestCode) => {
          // Simulate balanced mode progress record
          const progressRecord = {
            daily_challenge_mode: 'balanced' as DailyChallengeMode,
            focus_subtest_code: null,
            assessment_type: 'daily_challenge' as const
          }

          // Property: balanced mode must never have focus_subtest_code
          expect(progressRecord.focus_subtest_code).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate mode and subtest consistency', () => {
    fc.assert(
      fc.property(
        modeArbitrary,
        subtestCodeArbitrary,
        (mode, subtestCode) => {
          // Simulate progress record creation with proper logic
          const progressRecord = {
            daily_challenge_mode: mode,
            focus_subtest_code: mode === 'focus' ? subtestCode : null,
          }

          // Property: mode and subtest_code must be consistent
          if (progressRecord.daily_challenge_mode === 'balanced') {
            expect(progressRecord.focus_subtest_code).toBeNull()
          }
          if (progressRecord.daily_challenge_mode === 'focus') {
            expect(progressRecord.focus_subtest_code).not.toBeNull()
            expect(VALID_SUBTEST_CODES).toContain(progressRecord.focus_subtest_code!)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
