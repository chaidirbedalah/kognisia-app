/**
 * Property-Based Test: Seven Subtest System Configuration
 * 
 * Feature: utbk-2026-compliance
 * Property 1: Seven Subtest System Configuration
 * Validates: Requirements 1.1, 1.3
 * 
 * Property: For any system query or component, the system should reference 
 * exactly 7 subtests matching the UTBK 2026 specification 
 * (PU, PPU, PBM, PK, LIT_INDO, LIT_ING, PM)
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { 
  UTBK_2026_SUBTESTS, 
  VALID_SUBTEST_CODES,
  ASSESSMENT_CONFIGS,
  getSubtestByCode,
  getAllSubtestCodes,
  getOrderedSubtests,
  type Subtest,
  type AssessmentConfig
} from '@/lib/utbk-constants'

describe('Property 1: Seven Subtest System Configuration', () => {
  it('should have exactly 7 subtests in UTBK_2026_SUBTESTS constant', () => {
    expect(UTBK_2026_SUBTESTS).toHaveLength(7)
  })

  it('should have exactly 7 valid subtest codes', () => {
    expect(VALID_SUBTEST_CODES).toHaveLength(7)
  })

  it('should contain all official UTBK 2026 subtest codes', () => {
    const officialCodes = ['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']
    
    expect(VALID_SUBTEST_CODES.sort()).toEqual(officialCodes.sort())
    
    officialCodes.forEach(code => {
      expect(VALID_SUBTEST_CODES).toContain(code)
    })
  })

  it('should have consistent subtest codes across UTBK_2026_SUBTESTS and VALID_SUBTEST_CODES', () => {
    const subtestCodes = UTBK_2026_SUBTESTS.map(s => s.code).sort()
    const validCodes = [...VALID_SUBTEST_CODES].sort()
    
    expect(subtestCodes).toEqual(validCodes)
  })

  it('should reference exactly 7 subtests for any assessment configuration', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'daily_challenge_balanced',
          'tryout_utbk',
          'mini_tryout'
        ),
        (configKey) => {
          const config = ASSESSMENT_CONFIGS[configKey]
          
          // Count unique subtests in distribution
          const uniqueSubtests = new Set(
            config.subtestDistribution.map(d => d.subtestCode)
          )
          
          expect(uniqueSubtests.size).toBe(7)
          
          // Verify all are valid codes
          config.subtestDistribution.forEach(dist => {
            expect(VALID_SUBTEST_CODES).toContain(dist.subtestCode)
          })
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have all 7 subtests with required properties', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_SUBTEST_CODES),
        (code) => {
          const subtest = getSubtestByCode(code)
          
          expect(subtest).toBeDefined()
          expect(subtest?.code).toBe(code)
          expect(subtest?.name).toBeTruthy()
          expect(subtest?.description).toBeTruthy()
          expect(subtest?.icon).toBeTruthy()
          expect(subtest?.displayOrder).toBeGreaterThan(0)
          expect(subtest?.displayOrder).toBeLessThanOrEqual(7)
          expect(subtest?.utbkQuestionCount).toBeGreaterThan(0)
          expect(subtest?.utbkDurationMinutes).toBeGreaterThan(0)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain correct UTBK 2026 question counts for each subtest', () => {
    const expectedCounts: Record<string, number> = {
      'PU': 30,
      'PPU': 20,
      'PBM': 20,
      'PK': 20,
      'LIT_INDO': 30,
      'LIT_ING': 20,
      'PM': 20
    }

    UTBK_2026_SUBTESTS.forEach(subtest => {
      expect(subtest.utbkQuestionCount).toBe(expectedCounts[subtest.code])
    })
  })

  it('should maintain correct UTBK 2026 duration for each subtest', () => {
    const expectedDurations: Record<string, number> = {
      'PU': 35,
      'PPU': 15,
      'PBM': 25,
      'PK': 20,
      'LIT_INDO': 40,
      'LIT_ING': 20,
      'PM': 40
    }

    UTBK_2026_SUBTESTS.forEach(subtest => {
      expect(subtest.utbkDurationMinutes).toBe(expectedDurations[subtest.code])
    })
  })

  it('should have unique display orders for all subtests', () => {
    const displayOrders = UTBK_2026_SUBTESTS.map(s => s.displayOrder)
    const uniqueOrders = new Set(displayOrders)
    
    expect(uniqueOrders.size).toBe(7)
    expect(displayOrders.sort()).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('should return ordered subtests in correct sequence', () => {
    const ordered = getOrderedSubtests()
    
    expect(ordered).toHaveLength(7)
    
    // Verify they are in display order
    for (let i = 0; i < ordered.length - 1; i++) {
      expect(ordered[i].displayOrder).toBeLessThan(ordered[i + 1].displayOrder)
    }
    
    // Verify correct order: PU, PPU, PBM, PK, LIT_INDO, LIT_ING, PM
    expect(ordered[0].code).toBe('PU')
    expect(ordered[1].code).toBe('PPU')
    expect(ordered[2].code).toBe('PBM')
    expect(ordered[3].code).toBe('PK')
    expect(ordered[4].code).toBe('LIT_INDO')
    expect(ordered[5].code).toBe('LIT_ING')
    expect(ordered[6].code).toBe('PM')
  })

  it('should return all 7 subtest codes from getAllSubtestCodes', () => {
    const codes = getAllSubtestCodes()
    
    expect(codes).toHaveLength(7)
    // Check that all official codes are present (order doesn't matter)
    expect(codes).toEqual(expect.arrayContaining(['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']))
  })

  it('should have total of 160 questions across all subtests', () => {
    const totalQuestions = UTBK_2026_SUBTESTS.reduce(
      (sum, subtest) => sum + subtest.utbkQuestionCount,
      0
    )
    
    // 30+20+20+20+30+20+20 = 160
    expect(totalQuestions).toBe(160)
  })

  it('should have total of 195 minutes across all subtests', () => {
    const totalMinutes = UTBK_2026_SUBTESTS.reduce(
      (sum, subtest) => sum + subtest.utbkDurationMinutes,
      0
    )
    
    // 35+15+25+20+40+20+40 = 195
    expect(totalMinutes).toBe(195)
  })

  it('should match Try Out UTBK assessment config with subtest specifications', () => {
    const tryoutConfig = ASSESSMENT_CONFIGS.tryout_utbk
    
    const expectedQuestions = UTBK_2026_SUBTESTS.reduce((sum, s) => sum + s.utbkQuestionCount, 0)
    const expectedMinutes = UTBK_2026_SUBTESTS.reduce((sum, s) => sum + s.utbkDurationMinutes, 0)
    
    expect(tryoutConfig.totalQuestions).toBe(expectedQuestions)
    expect(tryoutConfig.totalDuration).toBe(195) // Adjusted from 200 to 195 for official UTBK
    expect(tryoutConfig.subtestDistribution).toHaveLength(7)
    
    // Verify each subtest in config matches the specification
    tryoutConfig.subtestDistribution.forEach(dist => {
      const subtest = getSubtestByCode(dist.subtestCode)
      expect(subtest).toBeDefined()
      expect(dist.questionCount).toBe(subtest?.utbkQuestionCount)
    })
  })

  it('should have balanced mode with 21 questions (3 per subtest)', () => {
    const balancedConfig = ASSESSMENT_CONFIGS.daily_challenge_balanced
    
    expect(balancedConfig.totalQuestions).toBe(21)
    expect(balancedConfig.subtestDistribution).toHaveLength(7)
    
    // Each subtest should have 3 questions
    balancedConfig.subtestDistribution.forEach(dist => {
      expect(dist.questionCount).toBe(3)
    })
  })

  it('should have mini tryout with 70 questions (10 per subtest)', () => {
    const miniConfig = ASSESSMENT_CONFIGS.mini_tryout
    
    expect(miniConfig.totalQuestions).toBe(70)
    expect(miniConfig.totalDuration).toBe(90)
    expect(miniConfig.subtestDistribution).toHaveLength(7)
    
    // Each subtest should have 10 questions
    miniConfig.subtestDistribution.forEach(dist => {
      expect(dist.questionCount).toBe(10)
    })
  })

  it('should maintain consistency across all system components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('subtests', 'codes', 'configs'),
        (component) => {
          switch (component) {
            case 'subtests':
              // UTBK_2026_SUBTESTS should have 7 items
              expect(UTBK_2026_SUBTESTS).toHaveLength(7)
              break
            case 'codes':
              // VALID_SUBTEST_CODES should have 7 items
              expect(VALID_SUBTEST_CODES).toHaveLength(7)
              break
            case 'configs':
              // Assessment configs should reference 7 subtests
              const balancedDist = ASSESSMENT_CONFIGS.daily_challenge_balanced.subtestDistribution
              expect(balancedDist).toHaveLength(7)
              
              const tryoutDist = ASSESSMENT_CONFIGS.tryout_utbk.subtestDistribution
              expect(tryoutDist).toHaveLength(7)
              
              const miniDist = ASSESSMENT_CONFIGS.mini_tryout.subtestDistribution
              expect(miniDist).toHaveLength(7)
              break
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should include PU as a valid subtest code', () => {
    // PU (Penalaran Umum) is now a separate subtest in UTBK 2026
    expect(VALID_SUBTEST_CODES).toContain('PU')
    
    // Verify we have all 7 codes
    const expectedCodes = ['PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM']
    expect(VALID_SUBTEST_CODES.sort()).toEqual(expectedCodes.sort())
  })

  it('should have all subtests with valid metadata', () => {
    UTBK_2026_SUBTESTS.forEach(subtest => {
      // Code should be uppercase and non-empty
      expect(subtest.code).toBeTruthy()
      expect(subtest.code).toBe(subtest.code.toUpperCase())
      
      // Name should be descriptive
      expect(subtest.name.length).toBeGreaterThan(5)
      
      // Description should exist
      expect(subtest.description).toBeTruthy()
      
      // Icon should be an emoji (single character or emoji)
      expect(subtest.icon).toBeTruthy()
      
      // Display order should be 1-7
      expect(subtest.displayOrder).toBeGreaterThanOrEqual(1)
      expect(subtest.displayOrder).toBeLessThanOrEqual(7)
      
      // Question count should be 20 or 30
      expect([20, 30]).toContain(subtest.utbkQuestionCount)
      
      // Duration should be reasonable (15-40 minutes)
      expect(subtest.utbkDurationMinutes).toBeGreaterThanOrEqual(15)
      expect(subtest.utbkDurationMinutes).toBeLessThanOrEqual(40)
    })
  })
})
