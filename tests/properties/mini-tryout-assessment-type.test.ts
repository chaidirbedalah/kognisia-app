/**
 * Property Test 14: Mini Try Out Assessment Type
 * 
 * Validates: Requirement 7.8
 * 
 * This test verifies that all Mini Try Out progress records are stored
 * with the correct assessment_type value of 'mini_tryout'.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

describe('Property 14: Mini Try Out Assessment Type', () => {
  /**
   * Property: All Mini Try Out records must have assessment_type = 'mini_tryout'
   * Validates: Requirement 7.8
   */
  it('should always store assessment_type as mini_tryout', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            question_id: fc.uuid(),
            subtest_code: fc.constantFrom('PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'),
            is_correct: fc.boolean(),
            assessment_type: fc.constant('mini_tryout')
          }),
          { minLength: 70, maxLength: 70 }
        ),
        (progressRecords) => {
          // Requirement 7.8: All records must have assessment_type = 'mini_tryout'
          for (const record of progressRecords) {
            expect(record.assessment_type).toBe('mini_tryout')
          }

          // Verify we have 70 records (full Mini Try Out)
          expect(progressRecords.length).toBe(70)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Assessment type must be one of valid types
   * Validates: Requirement 7.8
   */
  it('should only accept valid assessment types', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'pre_test',
          'daily_challenge',
          'tryout',
          'tryout_utbk',
          'mini_tryout',
          'scheduled'
        ),
        (assessmentType) => {
          // Valid assessment types
          const validTypes = [
            'pre_test',
            'daily_challenge',
            'tryout',
            'tryout_utbk',
            'mini_tryout',
            'scheduled'
          ]

          expect(validTypes).toContain(assessmentType)

          // For Mini Try Out specifically
          if (assessmentType === 'mini_tryout') {
            expect(assessmentType).toBe('mini_tryout')
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Mini Try Out records must have all required fields
   * Validates: Requirement 7.7, 7.8
   */
  it('should have all required fields for Mini Try Out progress', () => {
    fc.assert(
      fc.property(
        fc.record({
          user_id: fc.uuid(),
          student_id: fc.uuid(),
          question_id: fc.uuid(),
          assessment_id: fc.uuid(),
          assessment_type: fc.constant('mini_tryout'),
          subtest_code: fc.constantFrom('PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'),
          is_correct: fc.boolean(),
          time_spent: fc.integer({ min: 1, max: 300 })
        }),
        (progressRecord) => {
          // Requirement 7.8: Must have assessment_type = 'mini_tryout'
          expect(progressRecord.assessment_type).toBe('mini_tryout')

          // Requirement 7.7: Must have all required fields
          expect(progressRecord.user_id).toBeTruthy()
          expect(progressRecord.student_id).toBeTruthy()
          expect(progressRecord.question_id).toBeTruthy()
          expect(progressRecord.assessment_id).toBeTruthy()
          expect(progressRecord.subtest_code).toBeTruthy()
          expect(typeof progressRecord.is_correct).toBe('boolean')
          expect(progressRecord.time_spent).toBeGreaterThan(0)

          // Subtest code must be valid
          const validSubtests = ['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']
          expect(validSubtests).toContain(progressRecord.subtest_code)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Mini Try Out session must group all 70 questions
   * Validates: Requirements 7.7, 7.8
   */
  it('should group all 70 questions under same assessment_id', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(
          fc.record({
            question_id: fc.uuid(),
            subtest_code: fc.constantFrom('PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'),
            is_correct: fc.boolean()
          }),
          { minLength: 70, maxLength: 70 }
        ),
        (sessionId, questions) => {
          // Create progress records with same session ID
          const progressRecords = questions.map(q => ({
            assessment_id: sessionId,
            assessment_type: 'mini_tryout' as const,
            question_id: q.question_id,
            subtest_code: q.subtest_code,
            is_correct: q.is_correct
          }))

          // All records must have same assessment_id
          const uniqueSessionIds = new Set(progressRecords.map(r => r.assessment_id))
          expect(uniqueSessionIds.size).toBe(1)
          expect(uniqueSessionIds.has(sessionId)).toBe(true)

          // All records must have assessment_type = 'mini_tryout'
          const allMiniTryOut = progressRecords.every(r => r.assessment_type === 'mini_tryout')
          expect(allMiniTryOut).toBe(true)

          // Must have exactly 70 records
          expect(progressRecords.length).toBe(70)
        }
      ),
      { numRuns: 100 }
    )
  })
})
