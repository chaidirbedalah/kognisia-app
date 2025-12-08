/**
 * Property-Based Tests for Backward Compatibility
 * 
 * These tests verify that the system handles legacy data formats gracefully
 * and maintains compatibility during the UTBK 2026 migration.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  detectDataFormat,
  isUTBK2026Format,
  isLegacyFormat,
  normalizeLegacyRecord,
  normalizeRecords,
  groupBySubtest,
  calculateAccuracyBySubtest,
  getSubtestDisplayName,
  getSubtestIcon,
  filterUTBK2026Records,
  filterLegacyRecords,
  countByFormat,
  type LegacyStudentProgress
} from '@/lib/backward-compatibility'
import { VALID_SUBTEST_CODES } from '@/lib/types'

// ============================================================================
// GENERATORS
// ============================================================================

/**
 * Generator for valid UTBK 2026 subtest codes
 */
const utbk2026SubtestCodeArb = fc.constantFrom(...VALID_SUBTEST_CODES)

/**
 * Generator for legacy subtest codes
 */
const legacySubtestCodeArb = fc.constantFrom(
  'PENALARAN_UMUM',
  'PENGETAHUAN_UMUM',
  'PEMAHAMAN_UMUM',
  'BACAAN_MENULIS',
  'PEMAHAMAN_BACAAN',
  'KUANTITATIF',
  'PENGETAHUAN_KUANTITATIF',
  'LITERASI_INDONESIA',
  'BAHASA_INDONESIA',
  'LITERASI_INGGRIS',
  'BAHASA_INGGRIS',
  'PENALARAN_MATEMATIKA',
  'MATEMATIKA'
)

/**
 * Generator for UTBK 2026 format progress records
 */
const utbk2026RecordArb: fc.Arbitrary<LegacyStudentProgress> = fc
  .tuple(
    fc.uuid(),
    fc.uuid(),
    fc.uuid(),
    fc.uuid(),
    fc.option(fc.uuid(), { nil: undefined }),
    fc.constantFrom('daily_challenge', 'tryout_utbk', 'mini_tryout'),
    utbk2026SubtestCodeArb,
    fc.boolean(),
    fc.option(fc.integer({ min: 1, max: 600 }), { nil: undefined }),
    fc.option(fc.boolean(), { nil: undefined }),
    fc.option(fc.boolean(), { nil: undefined }),
    fc.option(fc.constantFrom('balanced', 'focus'), { nil: undefined }),
    fc.option(utbk2026SubtestCodeArb, { nil: undefined }),
    fc.integer({ min: 1577836800000, max: 1893456000000 }), // 2020-01-01 to 2030-01-01 in ms
    fc.option(fc.integer({ min: 1577836800000, max: 1893456000000 }), { nil: undefined })
  )
  .map(
    ([
      id,
      user_id,
      student_id,
      question_id,
      assessment_id,
      assessment_type,
      subtest_code,
      is_correct,
      time_spent,
      hint_used,
      solution_viewed,
      daily_challenge_mode,
      focus_subtest_code,
      created_at_ms,
      updated_at_ms
    ]) => ({
      id,
      user_id,
      student_id,
      question_id,
      assessment_id,
      assessment_type,
      subtest_code,
      is_correct,
      time_spent,
      hint_used,
      solution_viewed,
      daily_challenge_mode,
      focus_subtest_code,
      created_at: new Date(created_at_ms).toISOString(),
      updated_at: updated_at_ms ? new Date(updated_at_ms).toISOString() : undefined,
      subtest: undefined
    })
  )

/**
 * Generator for legacy format progress records
 */
const legacyRecordArb: fc.Arbitrary<LegacyStudentProgress> = fc
  .tuple(
    fc.uuid(),
    fc.uuid(),
    fc.uuid(),
    fc.uuid(),
    fc.option(fc.uuid(), { nil: undefined }),
    fc.constantFrom('daily_challenge', 'tryout', 'pre_test'),
    legacySubtestCodeArb,
    fc.boolean(),
    fc.option(fc.integer({ min: 1, max: 600 }), { nil: undefined }),
    fc.option(fc.boolean(), { nil: undefined }),
    fc.option(fc.boolean(), { nil: undefined }),
    fc.integer({ min: 1577836800000, max: 1893456000000 }), // 2020-01-01 to 2030-01-01 in ms
    fc.option(fc.integer({ min: 1577836800000, max: 1893456000000 }), { nil: undefined })
  )
  .map(
    ([
      id,
      user_id,
      student_id,
      question_id,
      assessment_id,
      assessment_type,
      subtest,
      is_correct,
      time_spent,
      hint_used,
      solution_viewed,
      created_at_ms,
      updated_at_ms
    ]) => ({
      id,
      user_id,
      student_id,
      question_id,
      assessment_id,
      assessment_type,
      subtest,
      is_correct,
      time_spent,
      hint_used,
      solution_viewed,
      created_at: new Date(created_at_ms).toISOString(),
      updated_at: updated_at_ms ? new Date(updated_at_ms).toISOString() : undefined,
      subtest_code: undefined,
      daily_challenge_mode: undefined,
      focus_subtest_code: undefined
    })
  )

/**
 * Generator for mixed format records
 */
const mixedRecordsArb = fc.array(
  fc.oneof(utbk2026RecordArb, legacyRecordArb),
  { minLength: 1, maxLength: 50 }
)

// ============================================================================
// PROPERTY TESTS
// ============================================================================

describe('Backward Compatibility - Property Tests', () => {
  /**
   * Property 19: Backward Compatibility
   * Validates: Requirements 10.1, 10.2, 10.4
   */
  describe('Property 19: Backward Compatibility', () => {
    it('should normalize legacy records without data loss', () => {
      fc.assert(
        fc.property(legacyRecordArb, record => {
          const normalized = normalizeLegacyRecord(record)
          
          // All original fields should be preserved (except subtest)
          expect(normalized.id).toBe(record.id)
          expect(normalized.user_id).toBe(record.user_id)
          expect(normalized.student_id).toBe(record.student_id)
          expect(normalized.question_id).toBe(record.question_id)
          expect(normalized.is_correct).toBe(record.is_correct)
          expect(normalized.time_spent).toBe(record.time_spent)
          
          // Should have subtest_code after normalization
          expect(normalized.subtest_code).toBeDefined()
          expect(typeof normalized.subtest_code).toBe('string')
          expect(normalized.subtest_code!.length).toBeGreaterThan(0)
        }),
        { numRuns: 100 }
      )
    })

    it('should handle UTBK 2026 records without modification', () => {
      fc.assert(
        fc.property(utbk2026RecordArb, record => {
          const normalized = normalizeLegacyRecord(record)
          
          // Should be identical to original
          expect(normalized).toEqual(record)
          expect(normalized.subtest_code).toBe(record.subtest_code)
        }),
        { numRuns: 100 }
      )
    })

    it('should normalize arrays of mixed records', () => {
      fc.assert(
        fc.property(mixedRecordsArb, records => {
          const normalized = normalizeRecords(records)
          
          // Same length
          expect(normalized.length).toBe(records.length)
          
          // All records should have subtest_code
          normalized.forEach(record => {
            expect(record.subtest_code).toBeDefined()
            expect(typeof record.subtest_code).toBe('string')
          })
          
          // No data loss - all IDs preserved
          const originalIds = records.map(r => r.id).sort()
          const normalizedIds = normalized.map(r => r.id).sort()
          expect(normalizedIds).toEqual(originalIds)
        }),
        { numRuns: 100 }
      )
    })

    it('should group mixed records by subtest without errors', () => {
      fc.assert(
        fc.property(mixedRecordsArb, records => {
          const grouped = groupBySubtest(records)
          
          // Should not throw errors
          expect(grouped).toBeInstanceOf(Map)
          
          // Total records should match
          let totalGrouped = 0
          for (const subtestRecords of grouped.values()) {
            totalGrouped += subtestRecords.length
          }
          expect(totalGrouped).toBe(records.length)
          
          // Each group should have consistent subtest_code
          for (const [subtestCode, subtestRecords] of grouped.entries()) {
            subtestRecords.forEach(record => {
              expect(record.subtest_code).toBe(subtestCode)
            })
          }
        }),
        { numRuns: 100 }
      )
    })

    it('should calculate accuracy for mixed records', () => {
      fc.assert(
        fc.property(mixedRecordsArb, records => {
          const accuracy = calculateAccuracyBySubtest(records)
          
          // Should not throw errors
          expect(accuracy).toBeInstanceOf(Map)
          
          // All accuracy values should be valid percentages
          for (const percentage of accuracy.values()) {
            expect(percentage).toBeGreaterThanOrEqual(0)
            expect(percentage).toBeLessThanOrEqual(100)
            expect(Number.isFinite(percentage)).toBe(true)
          }
        }),
        { numRuns: 100 }
      )
    })

    it('should get display names for all subtest codes', () => {
      fc.assert(
        fc.property(
          fc.oneof(utbk2026SubtestCodeArb, legacySubtestCodeArb),
          subtestCode => {
            const displayName = getSubtestDisplayName(subtestCode)
            
            // Should return a non-empty string
            expect(typeof displayName).toBe('string')
            expect(displayName.length).toBeGreaterThan(0)
            
            // Should not contain underscores (formatted for display)
            expect(displayName).not.toContain('_')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should get icons for all subtest codes', () => {
      fc.assert(
        fc.property(
          fc.oneof(utbk2026SubtestCodeArb, legacySubtestCodeArb),
          subtestCode => {
            const icon = getSubtestIcon(subtestCode)
            
            // Should return a non-empty string (emoji)
            expect(typeof icon).toBe('string')
            expect(icon.length).toBeGreaterThan(0)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property 20: Data Format Distinction
   * Validates: Requirements 10.3
   */
  describe('Property 20: Data Format Distinction', () => {
    it('should correctly identify UTBK 2026 format records', () => {
      fc.assert(
        fc.property(utbk2026RecordArb, record => {
          const format = detectDataFormat(record)
          const isNew = isUTBK2026Format(record)
          const isOld = isLegacyFormat(record)
          
          // Should be identified as UTBK 2026
          expect(format).toBe('utbk_2026')
          expect(isNew).toBe(true)
          expect(isOld).toBe(false)
        }),
        { numRuns: 100 }
      )
    })

    it('should correctly identify legacy format records', () => {
      fc.assert(
        fc.property(legacyRecordArb, record => {
          const format = detectDataFormat(record)
          const isNew = isUTBK2026Format(record)
          const isOld = isLegacyFormat(record)
          
          // Should be identified as legacy
          expect(format).toBe('legacy')
          expect(isNew).toBe(false)
          expect(isOld).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should filter records by format correctly', () => {
      fc.assert(
        fc.property(mixedRecordsArb, records => {
          const newRecords = filterUTBK2026Records(records)
          const oldRecords = filterLegacyRecords(records)
          
          // All filtered records should match their format
          newRecords.forEach(record => {
            expect(isUTBK2026Format(record)).toBe(true)
          })
          
          oldRecords.forEach(record => {
            expect(isLegacyFormat(record)).toBe(true)
          })
          
          // Total should match original
          expect(newRecords.length + oldRecords.length).toBe(records.length)
        }),
        { numRuns: 100 }
      )
    })

    it('should count records by format accurately', () => {
      fc.assert(
        fc.property(mixedRecordsArb, records => {
          const counts = countByFormat(records)
          
          // Total should match
          expect(counts.total).toBe(records.length)
          
          // Sum of formats should equal total
          expect(counts.legacy + counts.utbk_2026).toBe(counts.total)
          
          // Counts should be non-negative
          expect(counts.legacy).toBeGreaterThanOrEqual(0)
          expect(counts.utbk_2026).toBeGreaterThanOrEqual(0)
          
          // Manual verification
          const manualNew = filterUTBK2026Records(records).length
          const manualOld = filterLegacyRecords(records).length
          
          expect(counts.utbk_2026).toBe(manualNew)
          expect(counts.legacy).toBe(manualOld)
        }),
        { numRuns: 100 }
      )
    })

    it('should maintain format distinction after normalization', () => {
      fc.assert(
        fc.property(mixedRecordsArb, records => {
          const originalCounts = countByFormat(records)
          const normalized = normalizeRecords(records)
          
          // After normalization, all should be UTBK 2026 format
          const normalizedCounts = countByFormat(normalized)
          
          expect(normalizedCounts.utbk_2026).toBe(records.length)
          expect(normalizedCounts.legacy).toBe(0)
          
          // Original counts should be preserved in memory
          expect(originalCounts.total).toBe(records.length)
        }),
        { numRuns: 100 }
      )
    })

    it('should handle empty arrays gracefully', () => {
      const emptyRecords: LegacyStudentProgress[] = []
      
      const normalized = normalizeRecords(emptyRecords)
      const grouped = groupBySubtest(emptyRecords)
      const accuracy = calculateAccuracyBySubtest(emptyRecords)
      const counts = countByFormat(emptyRecords)
      
      expect(normalized).toEqual([])
      expect(grouped.size).toBe(0)
      expect(accuracy.size).toBe(0)
      expect(counts.total).toBe(0)
      expect(counts.legacy).toBe(0)
      expect(counts.utbk_2026).toBe(0)
    })
  })
})
