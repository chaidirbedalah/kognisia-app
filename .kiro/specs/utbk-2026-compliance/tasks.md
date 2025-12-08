# Implementation Plan: UTBK 2026 Compliance Update

## Phase 1: Database Migration and Core Setup (Days 1-3)

- [x] 1. Create subtests reference table and seed data
  - Create `subtests` table with UTBK 2026 structure
  - Insert 7 official subtests (PU, PPU, PBM, PK, LIT_INDO, LIT_ING, PM)
  - Add display_order, question_count, duration fields
  - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [x] 2. Update question_bank schema
  - Add `subtest_code` column referencing subtests table
  - Ensure all questions are categorized into one of 7 official subtests
  - PU (Penalaran Umum) is now a separate subtest with 30 questions
  - Add NOT NULL constraint after migration
  - Create index on subtest_code for performance
  - _Requirements: 1.2, 10.5_

- [x] 2.1 Write property test for question subtest categorization
  - **Property 2: Question Subtest Categorization**
  - **Validates: Requirements 1.2**

- [x] 3. Update student_progress schema
  - Add `daily_challenge_mode` column (TEXT, CHECK: 'balanced' or 'focus')
  - Add `focus_subtest_code` column (TEXT, REFERENCES subtests)
  - Create indexes for performance (subtest_code, assessment_type)
  - _Requirements: 2.6, 4.5_

- [x] 4. Update assessments table
  - Add 'mini_tryout' to assessment_type enum
  - Update existing 'marathon' records to 'tryout_utbk' for clarity
  - _Requirements: 7.8_

- [x] 5. Create TypeScript constants and interfaces
  - Define UTBK_2026_SUBTESTS constant array
  - Define ASSESSMENT_CONFIGS for each assessment type
  - Create Subtest, AssessmentConfig, SubtestDistribution interfaces
  - Export from shared constants file
  - _Requirements: 1.1, 1.3_

- [x] 5.1 Write property test for seven subtest system configuration
  - **Property 1: Seven Subtest System Configuration**
  - **Validates: Requirements 1.1, 1.3**

## Phase 2: Daily Challenge Mode Selection (Days 4-7)

- [x] 6. Create mode selection UI component
  - Create `DailyChallengeModeSelectorComponent`
  - Display two mode cards: Balanced (21 soal) and Focus (10 soal)
  - Add icons and descriptions for each mode
  - Handle mode selection callback
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 7. Create subtest selector component for Focus mode
  - Create `SubtestSelectorComponent`
  - Display 7 subtest cards with icons and descriptions
  - Fetch subtest data from subtests table
  - Handle subtest selection callback
  - _Requirements: 2.4, 4.1, 4.2_

- [x] 8. Implement Balanced Mode question fetching
  - Update `/api/daily-challenge/start` endpoint
  - Accept mode parameter ('balanced' or 'focus')
  - Fetch 3 questions from each of 7 subtests (21 total)
  - Randomize selection within each subtest
  - Group questions by subtest in response
  - _Requirements: 2.2, 3.1, 3.2_

- [x] 8.1 Write property test for balanced mode distribution
  - **Property 3: Balanced Mode Distribution**
  - **Validates: Requirements 2.2, 3.1**

- [x] 8.2 Write property test for question randomization
  - **Property 7: Question Randomization**
  - **Validates: Requirements 3.2, 4.4, 7.3**

- [x] 9. Implement Focus Mode question fetching
  - Update `/api/daily-challenge/start` endpoint
  - Accept subtestCode parameter for focus mode
  - Validate subtestCode against official 7 subtests
  - Fetch 10 questions from selected subtest
  - Randomize selection within subtest
  - _Requirements: 2.3, 4.3, 4.4_

- [x] 9.1 Write property test for focus mode distribution
  - **Property 4: Focus Mode Distribution**
  - **Validates: Requirements 2.3, 4.3**

- [x] 10. Update Daily Challenge UI flow
  - Show mode selector before questions
  - Show subtest selector if Focus mode chosen
  - Display subtest labels during question presentation
  - Show selected subtest name prominently in Focus mode
  - Group questions by subtest in Balanced mode
  - _Requirements: 2.1, 3.3, 4.6_

- [x] 11. Update progress recording for modes
  - Store daily_challenge_mode in student_progress
  - Store focus_subtest_code if Focus mode
  - Create progress records for all 7 subtests in Balanced mode
  - Create progress record for only selected subtest in Focus mode
  - _Requirements: 2.6, 3.5, 4.5_

- [x] 11.1 Write property test for mode recording
  - **Property 5: Mode Recording**
  - **Validates: Requirements 2.6**

- [x] 11.2 Write property test for subtest progress recording
  - **Property 8: Subtest Progress Recording**
  - **Validates: Requirements 3.5, 4.5, 7.7**

- [x] 12. Update streak calculation
  - Ensure both Balanced and Focus modes count as valid completions
  - Increment streak by 1 for either mode
  - Maintain existing grace period logic
  - _Requirements: 2.7_

- [x] 12.1 Write property test for streak counting across modes
  - **Property 6: Streak Counting Across Modes**
  - **Validates: Requirements 2.7**

- [x] 13. Update results display for Daily Challenge
  - Show overall accuracy
  - Show per-subtest breakdown for Balanced mode
  - Show single subtest performance for Focus mode
  - Display mode indicator in results
  - _Requirements: 3.6_

- [x] 13.1 Write property test for per-subtest accuracy calculation
  - **Property 9: Per-Subtest Accuracy Calculation**
  - **Validates: Requirements 3.6, 8.2**

- [x] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Try Out UTBK Update (Days 8-12)

- [x] 15. Update Try Out UTBK question fetching
  - Update `/api/tryout-utbk/start` endpoint
  - Fetch exactly 160 questions distributed across 7 subtests
  - Fetch 30 questions for PU (Penalaran Umum)
  - Fetch 20 questions for PPU, PBM, PK, LIT_ING, PM
  - Fetch 30 questions for LIT_INDO
  - Order questions by subtest display_order
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [x] 15.1 Write property test for Try Out UTBK total question count
  - **Property 10: Try Out UTBK Total Question Count**
  - **Validates: Requirements 5.1**

- [x] 15.2 Write property test for Try Out UTBK subtest order
  - **Property 11: Try Out UTBK Subtest Order**
  - **Validates: Requirements 5.8**

- [x] 16. Update Try Out UTBK timer display
  - Display total timer of 195 minutes (3 hours 15 minutes)
  - Show per-subtest recommended times as guidance
  - Display current subtest and recommended time
  - Do not enforce per-subtest timers (guidance only)
  - _Requirements: 5.9, 5.10, 6.1_

- [x] 17. Update Try Out UTBK progress indicator
  - Show current subtest name
  - Show question number within subtest and overall
  - Show progress bar for overall completion
  - Allow navigation between questions
  - _Requirements: 6.2, 6.3_

- [x] 18. Update Try Out UTBK time tracking
  - Track total time from start to submission
  - Track time spent per subtest
  - Calculate time per question
  - Store timing data in student_progress
  - _Requirements: 6.4, 6.6_

- [x] 18.1 Write property test for Try Out UTBK time calculation
  - **Property 12: Try Out UTBK Time Calculation**
  - **Validates: Requirements 6.4, 6.5**

- [x] 19. Update Try Out UTBK results display
  - Show overall score and accuracy
  - Show per-subtest breakdown (7 subtests)
  - Compare actual time vs recommended time per subtest
  - Highlight timing performance (faster/slower than recommended)
  - Show strongest and weakest subtests
  - _Requirements: 6.5, 8.3, 8.4_

- [x] 19.1 Write property test for strongest/weakest subtest identification
  - **Property 15: Strongest/Weakest Subtest Identification**
  - **Validates: Requirements 8.3, 8.4, 9.3**

- [x] 20. Update MarathonTab component name and content
  - Rename component to TryOutUTBKTab (keep file for backward compatibility)
  - Update all references from "Marathon" to "Try Out UTBK"
  - Update subtest display to show 7 subtests
  - Update history to show 160 questions per session
  - Update timing display to show 195 minutes
  - _Requirements: 5.1, 9.6_

- [x] 21. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Mini Try Out Implementation (Days 13-17)

- [x] 22. Create Mini Try Out start endpoint
  - Create `/api/mini-tryout/start` endpoint
  - Fetch exactly 70 questions (10 from each of 7 subtests)
  - Randomize selection within each subtest
  - Group questions by subtest
  - Set duration to 90 minutes
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 22.1 Write property test for Mini Try Out distribution
  - **Property 13: Mini Try Out Distribution**
  - **Validates: Requirements 7.1, 7.2**

- [x] 23. Create Mini Try Out UI component
  - Create `MiniTryOutPage` component
  - Display 70 questions grouped by subtest
  - Show subtest section markers
  - Display countdown timer (90 minutes)
  - Allow navigation between questions
  - _Requirements: 7.4, 7.5_

- [x] 24. Implement Mini Try Out timer
  - Start countdown from 90 minutes
  - Show warning at 10 minutes remaining
  - Auto-submit when timer reaches 0
  - Allow manual submission before timer expires
  - _Requirements: 7.5, 7.6_

- [x] 25. Create Mini Try Out submit endpoint
  - Create `/api/mini-tryout/submit` endpoint
  - Calculate overall score and accuracy
  - Calculate per-subtest scores
  - Store assessment_type as 'mini_tryout'
  - Store progress for all 7 subtests
  - Store timing data
  - _Requirements: 7.7, 7.8_

- [x] 25.1 Write property test for Mini Try Out assessment type
  - **Property 14: Mini Try Out Assessment Type**
  - **Validates: Requirements 7.8**

- [x] 26. Create Mini Try Out results display
  - Show overall accuracy percentage
  - Show per-subtest breakdown with accuracy
  - Highlight strongest subtest (highest accuracy)
  - Highlight weakest subtest (lowest accuracy)
  - Display total time taken vs recommended 90 minutes
  - Show review option for all questions
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 27. Add Mini Try Out to dashboard
  - Update dashboard stats to include Mini Try Out count
  - Add Mini Try Out accuracy to overview
  - Create Mini Try Out quick action card
  - Link to Mini Try Out start page
  - _Requirements: 8.7_

- [x] 28. Create Mini Try Out history tab
  - Update TryOutTab component (formerly placeholder)
  - Show list of completed Mini Try Outs
  - Display date, score, and accuracy for each
  - Show per-subtest breakdown on expand
  - Show timing comparison
  - _Requirements: 9.5_

- [x] 29. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Dashboard Integration and Updates (Days 18-20)

- [x] 30. Update Progress Tab for 7 subtests
  - Update ProgressTab component to show 7 subtests
  - Include PU (Penalaran Umum) as separate subtest
  - Update subtest cards with new names and icons
  - Ensure topic breakdown works with new structure
  - Update strongest/weakest identification
  - _Requirements: 6.1, 9.1, 9.3_

- [x] 30.1 Write property test for dashboard subtest consistency
  - **Property 16: Dashboard Subtest Consistency**
  - **Validates: Requirements 9.1**

- [x] 31. Update dashboard analytics calculations
  - Update `fetchProgressBySubtest` to use 7 subtests
  - Update `findStrongestWeakest` for 7-subtest structure
  - Update `groupByAssessmentType` to include mini_tryout
  - Ensure accuracy calculations work across all assessment types
  - _Requirements: 9.2, 9.7_

- [x] 31.1 Write property test for cross-assessment accuracy aggregation
  - **Property 17: Cross-Assessment Accuracy Aggregation**
  - **Validates: Requirements 9.2**

- [x] 32. Update Daily Challenge history display
  - Add mode indicator (Balanced/Focus) to history items
  - Show subtest name for Focus mode sessions
  - Show "All Subtests" for Balanced mode sessions
  - Update history card styling to accommodate mode info
  - _Requirements: 9.4_

- [x] 32.1 Write property test for historical mode preservation
  - **Property 18: Historical Mode Preservation**
  - **Validates: Requirements 9.4**

- [x] 33. Update overview stats cards
  - Ensure all stat cards reference 7 subtests
  - Update Mini Try Out card with real data
  - Update Try Out UTBK card (formerly Marathon)
  - Update total questions calculation
  - Update accuracy calculations
  - _Requirements: 9.7_

- [x] 34. Update InsightsCard component
  - Ensure strongest/weakest display uses 7 subtests
  - Update subtest name display
  - Update icons for new subtest structure
  - _Requirements: 9.3_

## Phase 6: Backward Compatibility and Migration (Days 21-22)

- [x] 35. Implement backward compatibility handling
  - Create utility function to detect old vs new format data
  - Handle any legacy data formats gracefully
  - Handle mixed old/new data in aggregations
  - Ensure no errors when displaying old data
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 35.1 Write property test for backward compatibility
  - **Property 19: Backward Compatibility**
  - **Validates: Requirements 10.1, 10.2, 10.4**

- [x] 35.2 Write property test for data format distinction
  - **Property 20: Data Format Distinction**
  - **Validates: Requirements 10.3**

- [x] 36. Create data migration script
  - Script to update all question_bank records with new subtest_code
  - Ensure all 7 subtests are properly represented
  - Verify all questions have valid subtest_code
  - Log any unmapped questions for manual review
  - _Requirements: 10.5_

- [x] 37. Test migration on staging data
  - Run migration script on copy of production data
  - Verify all questions mapped correctly
  - Verify no data loss
  - Verify backward compatibility maintained
  - Test dashboard with migrated data
  - _Requirements: 10.1, 10.2, 10.5_

- [x] 38. Create rollback plan
  - Document rollback procedure
  - Create rollback script if needed
  - Test rollback on staging
  - Prepare monitoring for post-deployment
  - _Requirements: 10.1_

## Phase 7: Testing and Quality Assurance (Days 23-24)

- [x] 39. Run all property-based tests
  - Execute all 20 property tests with 100 iterations each
  - Verify all properties pass
  - Fix any failing properties
  - Document any edge cases discovered
  - _All Requirements_

- [x] 40. Run integration tests
  - Test complete Daily Challenge flow (Balanced mode)
  - Test complete Daily Challenge flow (Focus mode)
  - Test complete Mini Try Out flow
  - Test complete Try Out UTBK flow
  - Test dashboard data refresh after each assessment
  - Test historical data display with mixed formats
  - _All Requirements_

- [x] 41. Performance testing
  - Test question fetching performance for 160 questions
  - Test dashboard load time with large datasets
  - Test query performance with indexes
  - Verify caching works correctly
  - Optimize any slow queries
  - _All Requirements_

- [x] 42. User acceptance testing
  - Test mode selection UX
  - Test subtest selector UX
  - Test timer displays
  - Test results displays
  - Test dashboard updates
  - Gather feedback and make adjustments
  - _All Requirements_

- [x] 43. Bug fixes and polish
  - Fix any bugs discovered during testing
  - Polish UI/UX based on feedback
  - Update error messages
  - Add loading states
  - Add empty states
  - _All Requirements_

## Phase 8: Deployment (Day 25)

- [x] 44. Deploy to staging
  - Deploy all code changes to staging
  - Run migration script on staging database
  - Verify all features work correctly
  - Test with real user accounts
  - Monitor for errors
  - _All Requirements_

- [x] 45. Final pre-production checks
  - Review all code changes
  - Verify all tests pass
  - Check database migration completed successfully
  - Verify backward compatibility
  - Review monitoring and alerts setup
  - _All Requirements_

- [x] 46. Deploy to production
  - Deploy code to production
  - Run migration script on production database
  - Monitor deployment process
  - Verify all services healthy
  - Test critical user flows
  - _All Requirements_

- [x] 47. Post-deployment monitoring
  - Monitor error rates
  - Monitor performance metrics
  - Monitor user adoption of new features
  - Check for any migration issues
  - Be ready to rollback if needed
  - _All Requirements_

- [x] 48. Update documentation
  - Update user guide with new features
  - Update API documentation
  - Update database schema documentation
  - Create migration runbook
  - Document any known issues or limitations
  - _All Requirements_

---

## Summary

**Total Tasks:** 48 main tasks (all required, comprehensive testing included)  
**Actual Duration:** 25 days (as planned)  
**Phases:** 8 phases covering migration, implementation, testing, and deployment  
**Status:** ✅ **SUCCESSFULLY COMPLETED**

**Key Deliverables:**
- ✅ Database migrated to 7-subtest UTBK 2026 structure
- ✅ Daily Challenge with Balanced (21 soal) and Focus (10 soal) modes
- ✅ Try Out UTBK updated to 160 questions across 7 subtests
- ✅ Mini Try Out implemented with 70 questions (10 per subtest)
- ✅ Dashboard updated to reflect new structure
- ✅ Backward compatibility maintained
- ✅ Comprehensive testing completed
- ✅ Production deployment successful
