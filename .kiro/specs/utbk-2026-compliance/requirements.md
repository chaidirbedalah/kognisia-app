# Requirements Document: UTBK 2026 Compliance Update

## Introduction

This feature updates the Kognisia learning platform to comply with the official UTBK 2026 structure, which consists of 6 subtests with a total of 160 questions. The update will be implemented in three phases: Daily Challenge enhancement, Try Out UTBK restructuring, and Mini Try Out implementation.

## Glossary

- **UTBK**: Ujian Tulis Berbasis Komputer (Computer-Based Written Test) - the standardized test for Indonesian university admissions
- **Subtest**: A specific subject area within the UTBK examination
- **TPS**: Tes Potensi Skolastik (Scholastic Potential Test) - one of two main UTBK components
- **Tes Literasi**: Literacy Test - the second main UTBK component
- **Daily Challenge**: A daily practice session where students answer questions to maintain learning streaks
- **Try Out UTBK**: A full-length UTBK simulation with 160 questions across 6 subtests
- **Mini Try Out**: A shorter practice session with 60 questions (10 per subtest)
- **Student**: A user with the role 'student' who practices questions
- **Question Bank**: The database table storing all practice questions
- **Student Progress**: The database table tracking student answers and performance
- **Assessment Type**: The category of practice (daily_challenge, mini_tryout, or tryout_utbk)

## Requirements

### Requirement 1: UTBK 2026 Subtest Structure

**User Story:** As a student, I want the platform to reflect the official UTBK 2026 structure with 6 subtests, so that my practice aligns with the actual exam format.

#### Acceptance Criteria

1. THE System SHALL support exactly six subtests matching UTBK 2026 specifications
2. WHEN storing questions, THE System SHALL categorize each question into one of the six official subtests
3. THE System SHALL maintain the following subtest names consistently across all features:
   - Pengetahuan & Pemahaman Umum
   - Pemahaman Bacaan & Menulis
   - Pengetahuan Kuantitatif
   - Literasi Bahasa Indonesia
   - Literasi Bahasa Inggris
   - Penalaran Matematika
4. THE System SHALL store time allocation for each subtest according to UTBK 2026 rules
5. THE System SHALL store question count for each subtest according to UTBK 2026 rules

### Requirement 2: Daily Challenge Mode Selection

**User Story:** As a student, I want to choose between practicing all subtests (18 questions) or focusing on one subtest (10 questions), so that I can customize my daily practice based on my learning needs.

#### Acceptance Criteria

1. WHEN a student starts Daily Challenge, THE System SHALL display two mode options before showing questions
2. THE System SHALL provide a "Balanced Mode" option that includes 3 questions from each of the 6 subtests (total 18 questions)
3. THE System SHALL provide a "Focus Mode" option that allows selecting one subtest for 10 questions
4. WHEN a student selects Focus Mode, THE System SHALL display all 6 subtests as selectable options
5. WHEN a student selects a mode, THE System SHALL fetch questions matching the selected mode configuration
6. THE System SHALL record the selected mode in the student progress data
7. WHEN calculating streaks, THE System SHALL count both modes as valid Daily Challenge completions

### Requirement 3: Daily Challenge Balanced Mode

**User Story:** As a student, I want to practice 3 questions from each subtest in Balanced Mode, so that I maintain well-rounded preparation across all UTBK areas.

#### Acceptance Criteria

1. WHEN a student selects Balanced Mode, THE System SHALL fetch exactly 3 questions from each of the 6 subtests
2. THE System SHALL randomize question selection within each subtest
3. THE System SHALL present questions grouped by subtest with clear subtest labels
4. THE System SHALL track which questions belong to which subtest throughout the session
5. WHEN a student completes Balanced Mode, THE System SHALL record progress for all 6 subtests
6. THE System SHALL calculate and display per-subtest accuracy in the results summary

### Requirement 4: Daily Challenge Focus Mode

**User Story:** As a student, I want to practice 10 questions from a single subtest in Focus Mode, so that I can strengthen specific weak areas.

#### Acceptance Criteria

1. WHEN a student selects Focus Mode, THE System SHALL display a subtest selection screen
2. THE System SHALL show all 6 subtests with descriptive names and icons
3. WHEN a student selects a subtest, THE System SHALL fetch exactly 10 questions from that subtest
4. THE System SHALL randomize question selection within the chosen subtest
5. WHEN a student completes Focus Mode, THE System SHALL record progress only for the selected subtest
6. THE System SHALL display the selected subtest name prominently during the practice session

### Requirement 5: Try Out UTBK Structure Update

**User Story:** As a student, I want Try Out UTBK to match the official UTBK 2026 format with 160 questions across 6 subtests, so that I experience realistic exam simulation.

#### Acceptance Criteria

1. WHEN a student starts Try Out UTBK, THE System SHALL fetch exactly 160 questions distributed across 6 subtests
2. THE System SHALL fetch exactly 20 questions for Pengetahuan & Pemahaman Umum
3. THE System SHALL fetch exactly 20 questions for Pemahaman Bacaan & Menulis
4. THE System SHALL fetch exactly 20 questions for Pengetahuan Kuantitatif
5. THE System SHALL fetch exactly 30 questions for Literasi Bahasa Indonesia
6. THE System SHALL fetch exactly 20 questions for Literasi Bahasa Inggris
7. THE System SHALL fetch exactly 20 questions for Penalaran Matematika
8. THE System SHALL present questions in subtest order matching official UTBK sequence
9. THE System SHALL display a timer showing total time of 195 minutes (3 hours 15 minutes)
10. THE System SHALL show per-subtest timers as guidance (not enforced)

### Requirement 6: Try Out UTBK Timing and Navigation

**User Story:** As a student, I want to see time allocations for each subtest during Try Out UTBK, so that I can pace myself like in the real exam.

#### Acceptance Criteria

1. WHEN displaying Try Out UTBK questions, THE System SHALL show the recommended time for the current subtest
2. THE System SHALL display a progress indicator showing current subtest and question number
3. THE System SHALL allow navigation between questions within the same Try Out session
4. WHEN a student completes all 160 questions, THE System SHALL calculate total time taken
5. THE System SHALL compare actual time per subtest with recommended time in the results
6. THE System SHALL store per-subtest timing data in student progress

### Requirement 7: Mini Try Out Implementation

**User Story:** As a student, I want to take a Mini Try Out with 60 questions (10 per subtest), so that I can practice in a shorter time commitment than the full Try Out UTBK.

#### Acceptance Criteria

1. WHEN a student starts Mini Try Out, THE System SHALL fetch exactly 60 questions distributed across 6 subtests
2. THE System SHALL fetch exactly 10 questions from each of the 6 subtests
3. THE System SHALL randomize question selection within each subtest
4. THE System SHALL present questions grouped by subtest with clear section markers
5. THE System SHALL display a countdown timer starting at 90 minutes for the entire Mini Try Out session
6. THE System SHALL allow students to complete Mini Try Out within the 90-minute time limit
7. WHEN a student completes Mini Try Out, THE System SHALL record progress for all 6 subtests
8. THE System SHALL store the assessment type as 'mini_tryout' in student progress

### Requirement 8: Mini Try Out Results and Analytics

**User Story:** As a student, I want to see detailed results after completing Mini Try Out, so that I can identify which subtests need more practice.

#### Acceptance Criteria

1. WHEN a student completes Mini Try Out, THE System SHALL display overall accuracy percentage
2. THE System SHALL display per-subtest breakdown showing questions answered and accuracy
3. THE System SHALL highlight the strongest subtest (highest accuracy)
4. THE System SHALL highlight the weakest subtest (lowest accuracy)
5. THE System SHALL display total time taken and compare with recommended time
6. THE System SHALL show a review option to see all questions with correct/incorrect indicators
7. THE System SHALL update dashboard statistics to include Mini Try Out data

### Requirement 9: Dashboard Integration

**User Story:** As a student, I want my dashboard to reflect the new UTBK 2026 structure, so that I see accurate progress across all 6 subtests.

#### Acceptance Criteria

1. WHEN displaying progress data, THE System SHALL show all 6 subtests consistently
2. THE System SHALL calculate accuracy per subtest across all assessment types
3. THE System SHALL display strongest and weakest subtests based on the 6-subtest structure
4. WHEN showing Daily Challenge history, THE System SHALL indicate whether each session was Balanced or Focus mode
5. WHEN showing Mini Try Out history, THE System SHALL display per-subtest performance
6. WHEN showing Try Out UTBK history, THE System SHALL display all 6 subtest scores
7. THE System SHALL update total question counts to reflect new assessment structures

### Requirement 10: Data Migration and Compatibility

**User Story:** As a system administrator, I want existing student data to remain valid after the UTBK 2026 update, so that students don't lose their progress history.

#### Acceptance Criteria

1. THE System SHALL maintain backward compatibility with existing student progress records
2. WHEN displaying historical data with old subtest structures, THE System SHALL handle gracefully without errors
3. THE System SHALL clearly distinguish between old format data and new UTBK 2026 format data
4. WHEN calculating overall statistics, THE System SHALL include both old and new format data
5. THE System SHALL provide a migration path for updating question bank subtest categorizations
