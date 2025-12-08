/**
 * Backward Compatibility Utilities for UTBK 2026 Migration
 * 
 * This module provides utilities to handle legacy data formats gracefully
 * during the transition to the new 7-subtest UTBK 2026 structure.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

import { SubtestCode, VALID_SUBTEST_CODES } from './types'
import { UTBK_2026_SUBTESTS } from './utbk-constants'

// ============================================================================
// LEGACY DATA TYPES
// ============================================================================

/**
 * Legacy student progress record (before UTBK 2026 migration)
 * May have 'subtest' field instead of 'subtest_code'
 */
export interface LegacyStudentProgress {
  id: string
  user_id: string
  student_id: string
  question_id: string
  assessment_id?: string
  assessment_type: string
  subtest?: string // Old field name
  subtest_code?: string // New field name
  is_correct: boolean
  time_spent?: number
  hint_used?: boolean
  solution_viewed?: boolean
  daily_challenge_mode?: string
  focus_subtest_code?: string
  created_at: string
  updated_at?: string
}

/**
 * Data format version
 */
export type DataFormatVersion = 'legacy' | 'utbk_2026'

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

/**
 * Detects whether a progress record uses the old or new format
 * 
 * Requirements: 10.3
 * 
 * @param record - Student progress record (may be legacy or new format)
 * @returns 'legacy' if old format, 'utbk_2026' if new format
 */
export function detectDataFormat(record: LegacyStudentProgress): DataFormatVersion {
  // New format has subtest_code and it's a valid UTBK 2026 code
  if (record.subtest_code && isValidUTBK2026Code(record.subtest_code)) {
    return 'utbk_2026'
  }
  
  // Old format has subtest field (without _code suffix)
  if (record.subtest && !record.subtest_code) {
    return 'legacy'
  }
  
  // If subtest_code exists but is not a valid UTBK 2026 code, treat as legacy
  if (record.subtest_code && !isValidUTBK2026Code(record.subtest_code)) {
    return 'legacy'
  }
  
  // Default to legacy for safety
  return 'legacy'
}

/**
 * Checks if a subtest code is valid for UTBK 2026
 * 
 * @param code - Subtest code to validate
 * @returns true if valid UTBK 2026 code
 */
function isValidUTBK2026Code(code: string): boolean {
  return VALID_SUBTEST_CODES.includes(code as SubtestCode)
}

/**
 * Checks if a record is in the new UTBK 2026 format
 * 
 * Requirements: 10.3
 * 
 * @param record - Student progress record
 * @returns true if new format
 */
export function isUTBK2026Format(record: LegacyStudentProgress): boolean {
  return detectDataFormat(record) === 'utbk_2026'
}

/**
 * Checks if a record is in the legacy format
 * 
 * Requirements: 10.3
 * 
 * @param record - Student progress record
 * @returns true if legacy format
 */
export function isLegacyFormat(record: LegacyStudentProgress): boolean {
  return detectDataFormat(record) === 'legacy'
}

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * Normalizes a legacy record to UTBK 2026 format
 * 
 * Requirements: 10.1, 10.2
 * 
 * @param record - Legacy student progress record
 * @returns Normalized record with subtest_code
 */
export function normalizeLegacyRecord(record: LegacyStudentProgress): LegacyStudentProgress {
  // If already in new format, return as-is
  if (isUTBK2026Format(record)) {
    return record
  }
  
  // If has old 'subtest' field, map it to subtest_code
  if (record.subtest && !record.subtest_code) {
    return {
      ...record,
      subtest_code: mapLegacySubtestCode(record.subtest),
      subtest: undefined // Remove old field
    }
  }
  
  // If subtest_code exists but is invalid, try to map it
  if (record.subtest_code && !isValidUTBK2026Code(record.subtest_code)) {
    return {
      ...record,
      subtest_code: mapLegacySubtestCode(record.subtest_code)
    }
  }
  
  return record
}

/**
 * Maps legacy subtest codes to UTBK 2026 codes
 * 
 * Requirements: 10.1, 10.2
 * 
 * @param legacyCode - Legacy subtest code
 * @returns UTBK 2026 subtest code
 */
function mapLegacySubtestCode(legacyCode: string): string {
  // Normalize to uppercase for comparison
  const normalized = legacyCode.toUpperCase().trim()
  
  // Direct mappings for known legacy codes
  const mappings: Record<string, SubtestCode> = {
    // Current UTBK 2026 codes (pass through)
    'PU': 'PU',
    'PPU': 'PPU',
    'PBM': 'PBM',
    'PK': 'PK',
    'LIT_INDO': 'LIT_INDO',
    'LIT_ING': 'LIT_ING',
    'PM': 'PM',
    
    // Legacy code variations
    'PENALARAN_UMUM': 'PU',
    'PENGETAHUAN_UMUM': 'PPU',
    'PEMAHAMAN_UMUM': 'PPU',
    'BACAAN_MENULIS': 'PBM',
    'PEMAHAMAN_BACAAN': 'PBM',
    'KUANTITATIF': 'PK',
    'PENGETAHUAN_KUANTITATIF': 'PK',
    'LITERASI_INDONESIA': 'LIT_INDO',
    'BAHASA_INDONESIA': 'LIT_INDO',
    'LITERASI_INGGRIS': 'LIT_ING',
    'BAHASA_INGGRIS': 'LIT_ING',
    'PENALARAN_MATEMATIKA': 'PM',
    'MATEMATIKA': 'PM'
  }
  
  // Return mapped code or original if no mapping found
  return mappings[normalized] || normalized
}

/**
 * Normalizes an array of records (mixed legacy and new format)
 * 
 * Requirements: 10.1, 10.2, 10.4
 * 
 * @param records - Array of student progress records
 * @returns Array of normalized records
 */
export function normalizeRecords(records: LegacyStudentProgress[]): LegacyStudentProgress[] {
  return records.map(normalizeLegacyRecord)
}

// ============================================================================
// AGGREGATION HELPERS
// ============================================================================

/**
 * Groups records by subtest code, handling mixed formats
 * 
 * Requirements: 10.1, 10.2, 10.4
 * 
 * @param records - Array of student progress records (mixed formats)
 * @returns Map of subtest code to records
 */
export function groupBySubtest(
  records: LegacyStudentProgress[]
): Map<string, LegacyStudentProgress[]> {
  const normalized = normalizeRecords(records)
  const grouped = new Map<string, LegacyStudentProgress[]>()
  
  for (const record of normalized) {
    const subtestCode = record.subtest_code || 'UNKNOWN'
    
    if (!grouped.has(subtestCode)) {
      grouped.set(subtestCode, [])
    }
    
    grouped.get(subtestCode)!.push(record)
  }
  
  return grouped
}

/**
 * Calculates accuracy per subtest, handling mixed formats
 * 
 * Requirements: 10.1, 10.2, 10.4
 * 
 * @param records - Array of student progress records (mixed formats)
 * @returns Map of subtest code to accuracy percentage
 */
export function calculateAccuracyBySubtest(
  records: LegacyStudentProgress[]
): Map<string, number> {
  const grouped = groupBySubtest(records)
  const accuracy = new Map<string, number>()
  
  for (const [subtestCode, subtestRecords] of grouped.entries()) {
    const correct = subtestRecords.filter(r => r.is_correct).length
    const total = subtestRecords.length
    const percentage = total > 0 ? (correct / total) * 100 : 0
    
    accuracy.set(subtestCode, percentage)
  }
  
  return accuracy
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Gets display name for a subtest code (handles legacy codes)
 * 
 * Requirements: 10.1, 10.2
 * 
 * @param subtestCode - Subtest code (may be legacy)
 * @returns Display name for the subtest
 */
export function getSubtestDisplayName(subtestCode: string): string {
  // Normalize the code first
  const normalized = mapLegacySubtestCode(subtestCode)
  
  // Find in UTBK 2026 subtests
  const subtest = UTBK_2026_SUBTESTS.find(s => s.code === normalized)
  
  if (subtest) {
    return subtest.name
  }
  
  // Fallback for unknown codes
  return subtestCode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Gets icon for a subtest code (handles legacy codes)
 * 
 * Requirements: 10.1, 10.2
 * 
 * @param subtestCode - Subtest code (may be legacy)
 * @returns Icon emoji for the subtest
 */
export function getSubtestIcon(subtestCode: string): string {
  // Normalize the code first
  const normalized = mapLegacySubtestCode(subtestCode)
  
  // Find in UTBK 2026 subtests
  const subtest = UTBK_2026_SUBTESTS.find(s => s.code === normalized)
  
  if (subtest) {
    return subtest.icon
  }
  
  // Fallback icon for unknown codes
  return '📝'
}

// ============================================================================
// FILTERING HELPERS
// ============================================================================

/**
 * Filters records to only include UTBK 2026 format
 * 
 * Requirements: 10.3
 * 
 * @param records - Array of student progress records (mixed formats)
 * @returns Array of only UTBK 2026 format records
 */
export function filterUTBK2026Records(
  records: LegacyStudentProgress[]
): LegacyStudentProgress[] {
  return records.filter(isUTBK2026Format)
}

/**
 * Filters records to only include legacy format
 * 
 * Requirements: 10.3
 * 
 * @param records - Array of student progress records (mixed formats)
 * @returns Array of only legacy format records
 */
export function filterLegacyRecords(
  records: LegacyStudentProgress[]
): LegacyStudentProgress[] {
  return records.filter(isLegacyFormat)
}

/**
 * Counts records by format version
 * 
 * Requirements: 10.3
 * 
 * @param records - Array of student progress records (mixed formats)
 * @returns Object with counts for each format
 */
export function countByFormat(records: LegacyStudentProgress[]): {
  legacy: number
  utbk_2026: number
  total: number
} {
  const legacy = filterLegacyRecords(records).length
  const utbk_2026 = filterUTBK2026Records(records).length
  
  return {
    legacy,
    utbk_2026,
    total: records.length
  }
}
