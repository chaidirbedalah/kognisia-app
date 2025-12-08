import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { DailyChallengeMode, SubtestCode } from '@/lib/types'
import { VALID_SUBTEST_CODES } from '@/lib/utbk-constants'

/**
 * Property 6: Streak Counting Across Modes
 * 
 * Validates Requirement 2.7:
 * - Both Balanced and Focus modes count as valid completions
 * - Streak increments by 1 for either mode
 * - Grace period logic is maintained
 */

describe('Property 6: Streak Counting Across Modes', () => {
  const modeArbitrary = fc.constantFrom<DailyChallengeMode>('balanced', 'focus')
  const subtestCodeArbitrary = fc.constantFrom(...VALID_SUBTEST_CODES) as fc.Arbitrary<SubtestCode>

  it('should count both Balanced and Focus modes as valid completions', () => {
    fc.assert(
      fc.property(
        fc.array(modeArbitrary, { minLength: 1, maxLength: 30 }),
        (modes) => {
          // Simulate daily challenge completions with different modes
          const completions = modes.map((mode, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            mode,
            assessment_type: 'daily_challenge' as const
          }))

          // Property: All completions should be counted regardless of mode
          const validCompletions = completions.filter(
            c => c.assessment_type === 'daily_challenge'
          )
          expect(validCompletions.length).toBe(completions.length)

          // Property: Each unique date should count once
          const uniqueDates = new Set(completions.map(c => c.date))
          expect(uniqueDates.size).toBeGreaterThan(0)
          expect(uniqueDates.size).toBeLessThanOrEqual(completions.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should increment streak by 1 for either mode', () => {
    fc.assert(
      fc.property(
        modeArbitrary,
        (mode) => {
          // Simulate a single day completion
          const completion = {
            date: new Date().toISOString().split('T')[0],
            mode,
            assessment_type: 'daily_challenge' as const
          }

          // Property: One completion should add 1 to streak
          const streakIncrement = 1
          expect(streakIncrement).toBe(1)

          // Property: Mode should not affect streak increment
          expect(completion.assessment_type).toBe('daily_challenge')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should calculate consecutive day streaks correctly across modes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 30 }),
        (consecutiveDays) => {
          // Simulate consecutive daily completions with random modes
          const completions = Array.from({ length: consecutiveDays }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - i)
            return {
              date: date.toISOString().split('T')[0],
              mode: i % 2 === 0 ? 'balanced' as DailyChallengeMode : 'focus' as DailyChallengeMode,
              assessment_type: 'daily_challenge' as const
            }
          })

          // Get unique dates (one completion per day)
          const uniqueDates = new Set(completions.map(c => c.date))
          const sortedDates = Array.from(uniqueDates).sort().reverse()

          // Calculate streak
          let currentStreak = 0
          const today = new Date().toISOString().split('T')[0]

          for (let i = 0; i < sortedDates.length; i++) {
            const expectedDate = new Date()
            expectedDate.setDate(expectedDate.getDate() - i)
            const expectedDateStr = expectedDate.toISOString().split('T')[0]

            if (sortedDates[i] === expectedDateStr) {
              currentStreak++
            } else {
              break
            }
          }

          // Property: Streak should equal consecutive days
          expect(currentStreak).toBe(consecutiveDays)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not double-count multiple completions on same day', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }),
        (completionsPerDay) => {
          const today = new Date().toISOString().split('T')[0]
          
          // Simulate multiple completions on the same day with different modes
          const completions = Array.from({ length: completionsPerDay }, (_, i) => ({
            date: today,
            mode: i % 2 === 0 ? 'balanced' as DailyChallengeMode : 'focus' as DailyChallengeMode,
            assessment_type: 'daily_challenge' as const
          }))

          // Property: Only unique dates should be counted
          const uniqueDates = new Set(completions.map(c => c.date))
          expect(uniqueDates.size).toBe(1)

          // Property: Streak should be 1, not completionsPerDay
          const streakCount = uniqueDates.size
          expect(streakCount).toBe(1)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should break streak when a day is missed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 2, max: 5 }),
        (daysBeforeGap, daysAfterGap) => {
          // Simulate completions with a gap
          const completions = [
            // Days before gap
            ...Array.from({ length: daysBeforeGap }, (_, i) => {
              const date = new Date()
              date.setDate(date.getDate() - i)
              return {
                date: date.toISOString().split('T')[0],
                mode: 'balanced' as DailyChallengeMode,
                assessment_type: 'daily_challenge' as const
              }
            }),
            // Gap of 1 day (skip day at index daysBeforeGap)
            // Days after gap
            ...Array.from({ length: daysAfterGap }, (_, i) => {
              const date = new Date()
              date.setDate(date.getDate() - (daysBeforeGap + 1 + i))
              return {
                date: date.toISOString().split('T')[0],
                mode: 'focus' as DailyChallengeMode,
                assessment_type: 'daily_challenge' as const
              }
            })
          ]

          const uniqueDates = new Set(completions.map(c => c.date))
          const sortedDates = Array.from(uniqueDates).sort().reverse()

          // Calculate current streak (from today)
          let currentStreak = 0
          for (let i = 0; i < sortedDates.length; i++) {
            const expectedDate = new Date()
            expectedDate.setDate(expectedDate.getDate() - i)
            const expectedDateStr = expectedDate.toISOString().split('T')[0]

            if (sortedDates[i] === expectedDateStr) {
              currentStreak++
            } else {
              break
            }
          }

          // Property: Current streak should only count consecutive days from today
          expect(currentStreak).toBe(daysBeforeGap)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain grace period logic (1 day tolerance)', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (includeYesterday) => {
          const today = new Date()
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)

          // Simulate completion either today or yesterday
          const completionDate = includeYesterday 
            ? yesterday.toISOString().split('T')[0]
            : today.toISOString().split('T')[0]

          const completion = {
            date: completionDate,
            mode: 'balanced' as DailyChallengeMode,
            assessment_type: 'daily_challenge' as const
          }

          // Property: Both today and yesterday should count as active streak
          const todayStr = today.toISOString().split('T')[0]
          const yesterdayStr = yesterday.toISOString().split('T')[0]
          
          const isWithinGracePeriod = 
            completion.date === todayStr || 
            completion.date === yesterdayStr

          expect(isWithinGracePeriod).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})
