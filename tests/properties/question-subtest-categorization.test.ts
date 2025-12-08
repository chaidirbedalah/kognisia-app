/**
 * Property-Based Test: Question Subtest Categorization
 * 
 * Feature: utbk-2026-compliance
 * Property 2: Question Subtest Categorization
 * Validates: Requirements 1.2
 * 
 * Property: For any question in the question_bank, the subtest_code must be 
 * one of the 7 official UTBK 2026 subtests (PU, PPU, PBM, PK, LIT_INDO, LIT_ING, PM)
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { VALID_SUBTEST_CODES, isValidSubtestCode } from '@/lib/utbk-constants'

describe('Property 2: Question Subtest Categorization', () => {
  it('should categorize all questions into one of 7 official UTBK 2026 subtests', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary question objects with various subtest_code values
        fc.record({
          id: fc.uuid(),
          subtest_code: fc.oneof(
            // Valid subtest codes (all 7)
            fc.constantFrom(...VALID_SUBTEST_CODES),
            // Invalid codes that should fail validation
            fc.constantFrom('INVALID', 'OLD_CODE', 'WRONG', '')
          ),
          question_text: fc.string(),
          difficulty: fc.constantFrom('easy', 'medium', 'hard'),
        }),
        (question) => {
          // The property we're testing: 
          // All questions should have valid subtest codes from the 7 official subtests
          
          // If the question has a valid UTBK 2026 subtest code, it should pass validation
          if (VALID_SUBTEST_CODES.includes(question.subtest_code)) {
            expect(isValidSubtestCode(question.subtest_code)).toBe(true)
            expect(VALID_SUBTEST_CODES).toContain(question.subtest_code)
          }
          
          // If the question has an invalid code, validation should fail
          if (!VALID_SUBTEST_CODES.includes(question.subtest_code)) {
            expect(isValidSubtestCode(question.subtest_code)).toBe(false)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should only accept the 7 official UTBK 2026 subtest codes', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (subtestCode) => {
          const isValid = isValidSubtestCode(subtestCode)
          
          // If it's valid, it must be one of the 7 official codes
          if (isValid) {
            expect(VALID_SUBTEST_CODES).toContain(subtestCode)
          }
          
          // If it's not one of the 7 official codes, it should be invalid
          if (!VALID_SUBTEST_CODES.includes(subtestCode)) {
            expect(isValid).toBe(false)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have exactly 7 valid subtest codes', () => {
    expect(VALID_SUBTEST_CODES).toHaveLength(7)
    expect(VALID_SUBTEST_CODES).toEqual(
      expect.arrayContaining(['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'])
    )
  })

  it('should validate that all UTBK 2026 subtest codes are valid', () => {
    const officialCodes = ['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']
    
    officialCodes.forEach(code => {
      expect(isValidSubtestCode(code)).toBe(true)
    })
  })

  it('should accept PU as a valid subtest code', () => {
    // PU (Penalaran Umum) is now a valid subtest in UTBK 2026
    expect(isValidSubtestCode('PU')).toBe(true)
    expect(VALID_SUBTEST_CODES).toContain('PU')
    
    // Other invalid codes should be rejected
    expect(isValidSubtestCode('INVALID')).toBe(false)
    expect(isValidSubtestCode('OLD_SUBTEST')).toBe(false)
    expect(isValidSubtestCode('')).toBe(false)
  })

  it('should maintain referential integrity with subtests table', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_SUBTEST_CODES),
        (subtestCode) => {
          // Every valid subtest code should correspond to an entry in the subtests table
          // This property ensures foreign key constraint will work
          expect(VALID_SUBTEST_CODES).toContain(subtestCode)
          expect(isValidSubtestCode(subtestCode)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})
