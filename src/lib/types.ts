/**
 * Type definitions for database tables and API responses
 * Updated for UTBK 2026 compliance
 */

// ============================================================================
// DAILY CHALLENGE TYPES
// ============================================================================

/**
 * Daily Challenge mode selection
 * - balanced: 18 questions (3 from each of 6 subtests)
 * - focus: 10 questions (all from one selected subtest)
 */
export type DailyChallengeMode = 'balanced' | 'focus'

/**
 * Assessment type for student progress tracking
 * Note: 'marathon' has been deprecated in favor of 'tryout_utbk'
 */
export type AssessmentType = 
  | 'pre_test' 
  | 'daily_challenge' 
  | 'tryout' 
  | 'tryout_utbk'
  | 'mini_tryout' 
  | 'scheduled'

// ============================================================================
// STUDENT PROGRESS TYPES
// ============================================================================

/**
 * Student progress record from the database
 * Tracks individual question answers and performance
 */
export interface StudentProgress {
  id: string
  user_id: string
  student_id: string
  question_id: string
  assessment_id?: string
  assessment_type: AssessmentType
  subtest_code: string
  is_correct: boolean
  time_spent?: number
  hint_used?: boolean
  solution_viewed?: boolean
  
  // Daily Challenge mode tracking (Requirements 2.6, 4.5)
  daily_challenge_mode?: DailyChallengeMode
  focus_subtest_code?: string
  
  created_at: string
  updated_at?: string
}

/**
 * Partial student progress for inserts
 */
export type StudentProgressInsert = Omit<StudentProgress, 'id' | 'created_at' | 'updated_at'>

/**
 * Student progress with mode information for Daily Challenge
 */
export interface DailyChallengeProgress extends StudentProgress {
  daily_challenge_mode: DailyChallengeMode
  focus_subtest_code?: string
}

// ============================================================================
// SUBTEST TYPES
// ============================================================================

/**
 * Official UTBK 2026 subtest codes (7 subtests)
 */
export type SubtestCode = 'PU' | 'PPU' | 'PBM' | 'PK' | 'LIT_INDO' | 'LIT_ING' | 'PM'

/**
 * Subtest reference data from the database
 */
export interface Subtest {
  code: SubtestCode
  name: string
  description: string
  icon: string
  display_order: number
  utbk_question_count: number
  utbk_duration_minutes: number
  created_at: string
  updated_at: string
}

// ============================================================================
// QUERY FILTERS
// ============================================================================

/**
 * Filter options for querying student progress
 */
export interface ProgressFilter {
  userId?: string
  studentId?: string
  assessmentType?: AssessmentType
  subtestCode?: SubtestCode
  dailyChallengeMode?: DailyChallengeMode
  dateFrom?: string
  dateTo?: string
}

/**
 * Options for Daily Challenge start
 */
export interface DailyChallengeStartOptions {
  mode: DailyChallengeMode
  subtestCode?: SubtestCode // Required if mode is 'focus'
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates that focus_subtest_code is only set when mode is 'focus'
 */
export function validateDailyChallengeProgress(
  progress: Partial<StudentProgress>
): boolean {
  const { daily_challenge_mode, focus_subtest_code } = progress

  // If no mode is set, focus_subtest_code must be null
  if (!daily_challenge_mode && focus_subtest_code) {
    return false
  }

  // If mode is balanced, focus_subtest_code must be null
  if (daily_challenge_mode === 'balanced' && focus_subtest_code) {
    return false
  }

  // If mode is focus, focus_subtest_code must be set
  if (daily_challenge_mode === 'focus' && !focus_subtest_code) {
    return false
  }

  return true
}

/**
 * Type guard to check if progress is a Daily Challenge progress
 */
export function isDailyChallengeProgress(
  progress: StudentProgress
): progress is DailyChallengeProgress {
  return progress.assessment_type === 'daily_challenge' && 
         progress.daily_challenge_mode !== undefined
}

/**
 * Valid subtest codes for UTBK 2026 (7 subtests)
 */
export const VALID_SUBTEST_CODES: SubtestCode[] = [
  'PU',
  'PPU',
  'PBM', 
  'PK',
  'LIT_INDO',
  'LIT_ING',
  'PM'
]

/**
 * Validates that a subtest code is valid
 */
export function isValidSubtestCode(code: string): code is SubtestCode {
  return VALID_SUBTEST_CODES.includes(code as SubtestCode)
}
