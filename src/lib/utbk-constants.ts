/**
 * UTBK 2026 Constants and Configuration
 * 
 * This file contains the official UTBK 2026 structure with 7 subtests
 * and configuration for different assessment types.
 */

// Core Subtest Interface
export interface Subtest {
  code: string
  name: string
  description: string
  icon: string
  displayOrder: number
  utbkQuestionCount: number
  utbkDurationMinutes: number
}

// UTBK 2026 Official Subtests (7 subtests)
export const UTBK_2026_SUBTESTS: Subtest[] = [
  {
    code: 'PU',
    name: 'Penalaran Umum',
    description: 'Penalaran Induktif, Deduktif, dan Kuantitatif',
    icon: '🧠',
    displayOrder: 1,
    utbkQuestionCount: 30,
    utbkDurationMinutes: 35
  },
  {
    code: 'PPU',
    name: 'Pengetahuan & Pemahaman Umum',
    description: 'Tes pengetahuan umum dan wawasan',
    icon: '🌍',
    displayOrder: 2,
    utbkQuestionCount: 20,
    utbkDurationMinutes: 15
  },
  {
    code: 'PBM',
    name: 'Pemahaman Bacaan & Menulis',
    description: 'Tes pemahaman teks dan kemampuan menulis',
    icon: '📖',
    displayOrder: 3,
    utbkQuestionCount: 20,
    utbkDurationMinutes: 25
  },
  {
    code: 'PK',
    name: 'Pengetahuan Kuantitatif',
    description: 'Tes kemampuan kuantitatif dan logika matematika',
    icon: '🔢',
    displayOrder: 4,
    utbkQuestionCount: 20,
    utbkDurationMinutes: 20
  },
  {
    code: 'LIT_INDO',
    name: 'Literasi Bahasa Indonesia',
    description: 'Tes literasi dan pemahaman bahasa Indonesia',
    icon: '📚',
    displayOrder: 5,
    utbkQuestionCount: 30,
    utbkDurationMinutes: 40
  },
  {
    code: 'LIT_ING',
    name: 'Literasi Bahasa Inggris',
    description: 'Tes literasi dan pemahaman bahasa Inggris',
    icon: '🌐',
    displayOrder: 6,
    utbkQuestionCount: 20,
    utbkDurationMinutes: 20
  },
  {
    code: 'PM',
    name: 'Penalaran Matematika',
    description: 'Tes penalaran dan pemecahan masalah matematika',
    icon: '🧮',
    displayOrder: 7,
    utbkQuestionCount: 20,
    utbkDurationMinutes: 40
  }
]

// Valid subtest codes for validation
export const VALID_SUBTEST_CODES = UTBK_2026_SUBTESTS.map(s => s.code)

// Assessment Configuration Interface
export interface SubtestDistribution {
  subtestCode: string
  questionCount: number
  recommendedMinutes?: number
}

export interface AssessmentConfig {
  type: 'daily_challenge' | 'tryout_utbk' | 'mini_tryout'
  totalQuestions: number
  totalDuration: number // minutes
  subtestDistribution: SubtestDistribution[]
}

// Assessment Configurations
export const ASSESSMENT_CONFIGS: Record<string, AssessmentConfig> = {
  daily_challenge_balanced: {
    type: 'daily_challenge',
    totalQuestions: 21, // 3 questions × 7 subtests
    totalDuration: 25, // flexible
    subtestDistribution: [
      { subtestCode: 'PU', questionCount: 3 },
      { subtestCode: 'PPU', questionCount: 3 },
      { subtestCode: 'PBM', questionCount: 3 },
      { subtestCode: 'PK', questionCount: 3 },
      { subtestCode: 'LIT_INDO', questionCount: 3 },
      { subtestCode: 'LIT_ING', questionCount: 3 },
      { subtestCode: 'PM', questionCount: 3 }
    ]
  },
  daily_challenge_focus: {
    type: 'daily_challenge',
    totalQuestions: 10,
    totalDuration: 15, // flexible
    subtestDistribution: [] // Dynamic based on selection
  },
  tryout_utbk: {
    type: 'tryout_utbk',
    totalQuestions: 160, // 30+20+20+20+30+20+20 = 160
    totalDuration: 195, // 35+15+25+20+40+20+40 = 195
    subtestDistribution: [
      { subtestCode: 'PU', questionCount: 30, recommendedMinutes: 35 },
      { subtestCode: 'PPU', questionCount: 20, recommendedMinutes: 15 },
      { subtestCode: 'PBM', questionCount: 20, recommendedMinutes: 25 },
      { subtestCode: 'PK', questionCount: 20, recommendedMinutes: 20 },
      { subtestCode: 'LIT_INDO', questionCount: 30, recommendedMinutes: 40 },
      { subtestCode: 'LIT_ING', questionCount: 20, recommendedMinutes: 20 },
      { subtestCode: 'PM', questionCount: 20, recommendedMinutes: 40 }
    ]
  },
  mini_tryout: {
    type: 'mini_tryout',
    totalQuestions: 70, // 10 questions × 7 subtests
    totalDuration: 90,
    subtestDistribution: [
      { subtestCode: 'PU', questionCount: 10 },
      { subtestCode: 'PPU', questionCount: 10 },
      { subtestCode: 'PBM', questionCount: 10 },
      { subtestCode: 'PK', questionCount: 10 },
      { subtestCode: 'LIT_INDO', questionCount: 10 },
      { subtestCode: 'LIT_ING', questionCount: 10 },
      { subtestCode: 'PM', questionCount: 10 }
    ]
  }
}

// Helper function to get subtest by code
export function getSubtestByCode(code: string): Subtest | undefined {
  return UTBK_2026_SUBTESTS.find(s => s.code === code)
}

// Helper function to validate subtest code
export function isValidSubtestCode(code: string): boolean {
  return VALID_SUBTEST_CODES.includes(code)
}

// Helper function to get all subtest codes
export function getAllSubtestCodes(): string[] {
  return VALID_SUBTEST_CODES
}

// Helper function to get subtests ordered by display order
export function getOrderedSubtests(): Subtest[] {
  return [...UTBK_2026_SUBTESTS].sort((a, b) => a.displayOrder - b.displayOrder)
}
