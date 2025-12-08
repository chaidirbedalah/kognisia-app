# Design Document: UTBK 2026 Compliance Update

## Overview

This design document outlines the technical approach for updating the Kognisia platform to comply with the official UTBK 2026 structure. The update transitions from a 7-subtest structure to the official 6-subtest structure with accurate question counts and timing allocations.

The implementation will be phased across three major features:
1. **Daily Challenge Enhancement** - Add mode selection (Balanced: 18 questions, Focus: 10 questions)
2. **Try Out UTBK Update** - Update to 160 questions across 6 subtests with proper timing
3. **Mini Try Out Implementation** - New 60-question assessment (10 per subtest, 90 minutes)

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js/React)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Daily      │  │   Try Out    │  │  Mini Try    │      │
│  │  Challenge   │  │    UTBK      │  │     Out      │      │
│  │              │  │              │  │              │      │
│  │ • Mode Select│  │ • 160 Qs     │  │ • 60 Qs      │      │
│  │ • Balanced   │  │ • 6 Subtests │  │ • 6 Subtests │      │
│  │ • Focus      │  │ • 195 min    │  │ • 90 min     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Dashboard Components                     │   │
│  │  • Progress Tab (6 subtests)                         │   │
│  │  • Marathon Tab (updated to Try Out UTBK)            │   │
│  │  • Mini Try Out Tab                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Layer (Next.js API Routes)              │
├─────────────────────────────────────────────────────────────┤
│  • /api/daily-challenge/start                               │
│  • /api/tryout-utbk/start                                   │
│  • /api/mini-tryout/start                                   │
│  • /api/progress/subtests                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (Supabase)                       │
├─────────────────────────────────────────────────────────────┤
│  • question_bank (updated subtest field)                    │
│  • student_progress (mode tracking)                         │
│  • assessments (new mini_tryout type)                       │
│  • subtests (new reference table)                           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Daily Challenge - Balanced Mode:**
```
User clicks "Start Daily Challenge"
  → Mode selection screen appears
  → User selects "Balanced Mode"
  → API fetches 3 questions from each of 6 subtests (18 total)
  → Questions presented grouped by subtest
  → User completes all 18 questions
  → Results show per-subtest breakdown
  → Progress recorded for all 6 subtests
```

**Daily Challenge - Focus Mode:**
```
User clicks "Start Daily Challenge"
  → Mode selection screen appears
  → User selects "Focus Mode"
  → Subtest selection screen appears (6 options)
  → User selects one subtest
  → API fetches 10 questions from selected subtest
  → Questions presented with subtest context
  → User completes all 10 questions
  → Results show performance for selected subtest
  → Progress recorded for selected subtest only
```

**Try Out UTBK:**
```
User clicks "Start Try Out UTBK"
  → API fetches 160 questions:
      • 20 from Pengetahuan & Pemahaman Umum
      • 20 from Pemahaman Bacaan & Menulis
      • 20 from Pengetahuan Kuantitatif
      • 30 from Literasi Bahasa Indonesia
      • 20 from Literasi Bahasa Inggris
      • 20 from Penalaran Matematika
  → Questions presented in subtest order
  → Timer shows 195 minutes total
  → Per-subtest timers shown as guidance
  → User completes assessment
  → Results show overall + per-subtest scores
  → Timing comparison with recommended times
```

**Mini Try Out:**
```
User clicks "Start Mini Try Out"
  → API fetches 60 questions (10 from each of 6 subtests)
  → Questions presented grouped by subtest
  → Timer shows 90 minutes
  → User completes assessment
  → Results show overall + per-subtest scores
  → Dashboard updated with Mini Try Out data
```

## Components and Interfaces

### Frontend Components

#### 1. DailyChallengeModeSelectorComponent
```typescript
interface DailyChallengeMode {
  type: 'balanced' | 'focus'
  selectedSubtest?: string // Only for focus mode
}

interface ModeSelectorProps {
  onModeSelect: (mode: DailyChallengeMode) => void
  subtests: Subtest[]
}

// Component displays two cards:
// - Balanced Mode: 18 soal (3 per subtest)
// - Focus Mode: 10 soal (pilih 1 subtest)
```

#### 2. SubtestSelectorComponent
```typescript
interface Subtest {
  code: string
  name: string
  icon: string
  description: string
}

interface SubtestSelectorProps {
  subtests: Subtest[]
  onSelect: (subtestCode: string) => void
}

// Displays 6 subtest cards with icons and descriptions
```

#### 3. TryOutUTBKComponent (Updated)
```typescript
interface TryOutUTBKSession {
  id: string
  questions: Question[] // 160 questions
  subtestBreakdown: SubtestSection[]
  totalDuration: number // 195 minutes
  startedAt: Date
}

interface SubtestSection {
  subtestCode: string
  subtestName: string
  questionCount: number
  recommendedMinutes: number
  questions: Question[]
}

// Updated to handle 160 questions across 6 subtests
// Shows per-subtest progress and timing
```

#### 4. MiniTryOutComponent (New)
```typescript
interface MiniTryOutSession {
  id: string
  questions: Question[] // 60 questions
  subtestBreakdown: SubtestSection[]
  totalDuration: number // 90 minutes
  startedAt: Date
}

// Similar structure to Try Out UTBK but smaller scale
// 10 questions per subtest
```

#### 5. ProgressTabComponent (Updated)
```typescript
interface SubtestProgress {
  subtestCode: string
  subtestName: string
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  topics: TopicProgress[]
}

// Updated to show 6 subtests instead of 7
// Maintains topic breakdown within each subtest
```

### API Endpoints

#### 1. Daily Challenge Endpoints

**POST /api/daily-challenge/start**
```typescript
Request: {
  mode: 'balanced' | 'focus'
  subtestCode?: string // Required if mode is 'focus'
}

Response: {
  sessionId: string
  mode: 'balanced' | 'focus'
  questions: Question[] // 18 for balanced, 10 for focus
  subtestBreakdown?: SubtestSection[] // For balanced mode
  selectedSubtest?: Subtest // For focus mode
}
```

**POST /api/daily-challenge/submit**
```typescript
Request: {
  sessionId: string
  answers: Answer[]
  mode: 'balanced' | 'focus'
  subtestCode?: string
}

Response: {
  score: number
  accuracy: number
  subtestResults: SubtestResult[] // Per-subtest breakdown
  streakUpdated: boolean
  newStreak: number
}
```

#### 2. Try Out UTBK Endpoints

**POST /api/tryout-utbk/start**
```typescript
Request: {
  userId: string
}

Response: {
  sessionId: string
  questions: Question[] // 160 questions
  subtestSections: SubtestSection[] // 6 sections with proper distribution
  totalDuration: 195 // minutes
  subtestTimings: SubtestTiming[]
}

interface SubtestTiming {
  subtestCode: string
  recommendedMinutes: number
  questionCount: number
}
```

#### 3. Mini Try Out Endpoints

**POST /api/mini-tryout/start**
```typescript
Request: {
  userId: string
}

Response: {
  sessionId: string
  questions: Question[] // 60 questions
  subtestSections: SubtestSection[] // 6 sections, 10 each
  totalDuration: 90 // minutes
}
```

**POST /api/mini-tryout/submit**
```typescript
Request: {
  sessionId: string
  answers: Answer[]
  timeSpent: number
}

Response: {
  score: number
  accuracy: number
  subtestResults: SubtestResult[]
  timeComparison: {
    actual: number
    recommended: number
    difference: number
  }
}
```

#### 4. Progress Endpoints (Updated)

**GET /api/progress/subtests**
```typescript
Request: {
  userId: string
}

Response: {
  subtests: SubtestProgress[] // 6 subtests
  overall: {
    totalQuestions: number
    accuracy: number
    strongestSubtest: string
    weakestSubtest: string
  }
}
```

## Data Models

### Database Schema Updates

#### 1. New Table: subtests
```sql
CREATE TABLE subtests (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL,
  utbk_question_count INTEGER NOT NULL,
  utbk_duration_minutes DECIMAL(4,1) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert UTBK 2026 official subtests
INSERT INTO subtests (code, name, description, icon, display_order, utbk_question_count, utbk_duration_minutes) VALUES
('PPU', 'Pengetahuan & Pemahaman Umum', 'Tes pengetahuan umum dan wawasan', '🌍', 1, 20, 15),
('PBM', 'Pemahaman Bacaan & Menulis', 'Tes pemahaman teks dan kemampuan menulis', '📖', 2, 20, 25),
('PK', 'Pengetahuan Kuantitatif', 'Tes kemampuan kuantitatif dan logika matematika', '🔢', 3, 20, 20),
('LIT_INDO', 'Literasi Bahasa Indonesia', 'Tes literasi dan pemahaman bahasa Indonesia', '📚', 4, 30, 42.5),
('LIT_ING', 'Literasi Bahasa Inggris', 'Tes literasi dan pemahaman bahasa Inggris', '🌐', 5, 20, 20),
('PM', 'Penalaran Matematika', 'Tes penalaran dan pemecahan masalah matematika', '🧮', 6, 20, 42.5);
```

#### 2. Update Table: question_bank
```sql
-- Add migration to update subtest field
-- Old values: PU, PPU, PBM, PK, LIT_INDO, LIT_ING, PM (7 subtests)
-- New values: PPU, PBM, PK, LIT_INDO, LIT_ING, PM (6 subtests)

ALTER TABLE question_bank 
  ADD COLUMN subtest_code TEXT REFERENCES subtests(code);

-- Migration script to map old to new
UPDATE question_bank 
SET subtest_code = CASE 
  WHEN subtest = 'PU' THEN 'PPU' -- Merge PU into PPU
  WHEN subtest = 'PPU' THEN 'PPU'
  WHEN subtest = 'PBM' THEN 'PBM'
  WHEN subtest = 'PK' THEN 'PK'
  WHEN subtest = 'LIT_INDO' THEN 'LIT_INDO'
  WHEN subtest = 'LIT_ING' THEN 'LIT_ING'
  WHEN subtest = 'PM' THEN 'PM'
END;

-- Add constraint after migration
ALTER TABLE question_bank 
  ALTER COLUMN subtest_code SET NOT NULL;
```

#### 3. Update Table: student_progress
```sql
ALTER TABLE student_progress
  ADD COLUMN daily_challenge_mode TEXT CHECK (daily_challenge_mode IN ('balanced', 'focus')),
  ADD COLUMN focus_subtest_code TEXT REFERENCES subtests(code);

-- Add index for performance
CREATE INDEX idx_student_progress_subtest ON student_progress(subtest_code);
CREATE INDEX idx_student_progress_assessment_type ON student_progress(assessment_type);
```

#### 4. Update Table: assessments
```sql
-- Add mini_tryout to assessment_type enum
ALTER TABLE assessments
  DROP CONSTRAINT IF EXISTS assessments_assessment_type_check;

ALTER TABLE assessments
  ADD CONSTRAINT assessments_assessment_type_check 
  CHECK (assessment_type IN ('pre_test', 'daily_challenge', 'tryout', 'marathon', 'mini_tryout', 'scheduled'));

-- Update marathon to tryout_utbk for clarity
UPDATE assessments 
SET assessment_type = 'tryout_utbk' 
WHERE assessment_type = 'marathon';
```

### TypeScript Interfaces

```typescript
// Core Subtest Interface
interface Subtest {
  code: string
  name: string
  description: string
  icon: string
  displayOrder: number
  utbkQuestionCount: number
  utbkDurationMinutes: number
}

// UTBK 2026 Constants
const UTBK_2026_SUBTESTS: Subtest[] = [
  {
    code: 'PPU',
    name: 'Pengetahuan & Pemahaman Umum',
    description: 'Tes pengetahuan umum dan wawasan',
    icon: '🌍',
    displayOrder: 1,
    utbkQuestionCount: 20,
    utbkDurationMinutes: 15
  },
  {
    code: 'PBM',
    name: 'Pemahaman Bacaan & Menulis',
    description: 'Tes pemahaman teks dan kemampuan menulis',
    icon: '📖',
    displayOrder: 2,
    utbkQuestionCount: 20,
    utbkDurationMinutes: 25
  },
  {
    code: 'PK',
    name: 'Pengetahuan Kuantitatif',
    description: 'Tes kemampuan kuantitatif dan logika matematika',
    icon: '🔢',
    displayOrder: 3,
    utbkQuestionCount: 20,
    utbkDurationMinutes: 20
  },
  {
    code: 'LIT_INDO',
    name: 'Literasi Bahasa Indonesia',
    description: 'Tes literasi dan pemahaman bahasa Indonesia',
    icon: '📚',
    displayOrder: 4,
    utbkQuestionCount: 30,
    utbkDurationMinutes: 42.5
  },
  {
    code: 'LIT_ING',
    name: 'Literasi Bahasa Inggris',
    description: 'Tes literasi dan pemahaman bahasa Inggris',
    icon: '🌐',
    displayOrder: 5,
    utbkQuestionCount: 20,
    utbkDurationMinutes: 20
  },
  {
    code: 'PM',
    name: 'Penalaran Matematika',
    description: 'Tes penalaran dan pemecahan masalah matematika',
    icon: '🧮',
    displayOrder: 6,
    utbkQuestionCount: 20,
    utbkDurationMinutes: 42.5
  }
]

// Assessment Configuration
interface AssessmentConfig {
  type: 'daily_challenge' | 'tryout_utbk' | 'mini_tryout'
  totalQuestions: number
  totalDuration: number // minutes
  subtestDistribution: SubtestDistribution[]
}

interface SubtestDistribution {
  subtestCode: string
  questionCount: number
  recommendedMinutes?: number
}

const ASSESSMENT_CONFIGS: Record<string, AssessmentConfig> = {
  daily_challenge_balanced: {
    type: 'daily_challenge',
    totalQuestions: 18,
    totalDuration: 20, // flexible
    subtestDistribution: [
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
    totalQuestions: 160,
    totalDuration: 195,
    subtestDistribution: [
      { subtestCode: 'PPU', questionCount: 20, recommendedMinutes: 15 },
      { subtestCode: 'PBM', questionCount: 20, recommendedMinutes: 25 },
      { subtestCode: 'PK', questionCount: 20, recommendedMinutes: 20 },
      { subtestCode: 'LIT_INDO', questionCount: 30, recommendedMinutes: 42.5 },
      { subtestCode: 'LIT_ING', questionCount: 20, recommendedMinutes: 20 },
      { subtestCode: 'PM', questionCount: 20, recommendedMinutes: 42.5 }
    ]
  },
  mini_tryout: {
    type: 'mini_tryout',
    totalQuestions: 60,
    totalDuration: 90,
    subtestDistribution: [
      { subtestCode: 'PPU', questionCount: 10 },
      { subtestCode: 'PBM', questionCount: 10 },
      { subtestCode: 'PK', questionCount: 10 },
      { subtestCode: 'LIT_INDO', questionCount: 10 },
      { subtestCode: 'LIT_ING', questionCount: 10 },
      { subtestCode: 'PM', questionCount: 10 }
    ]
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all properties from the prework, I've identified several areas of redundancy:

1. **Randomization properties** (3.2, 4.4, 7.3) can be combined into one comprehensive property
2. **Subtest distribution properties** (5.2-5.7) are specific examples that validate the general property 5.1
3. **Progress recording properties** (3.5, 4.5, 7.7) follow the same pattern and can be consolidated
4. **UI display properties** are examples rather than properties and don't need separate property tests

The consolidated properties below eliminate redundancy while maintaining comprehensive validation coverage.

### Property 1: Six Subtest System Configuration
*For any* system query or component, the system should reference exactly 6 subtests matching the UTBK 2026 specification (PPU, PBM, PK, LIT_INDO, LIT_ING, PM)
**Validates: Requirements 1.1, 1.3**

### Property 2: Question Subtest Categorization
*For any* question in the question_bank, the subtest_code must be one of the 6 official UTBK 2026 subtests
**Validates: Requirements 1.2**

### Property 3: Balanced Mode Distribution
*For any* Daily Challenge in Balanced Mode, the system should fetch exactly 18 questions with exactly 3 questions from each of the 6 subtests
**Validates: Requirements 2.2, 3.1**

### Property 4: Focus Mode Distribution
*For any* Daily Challenge in Focus Mode with any selected subtest, the system should fetch exactly 10 questions all from the selected subtest
**Validates: Requirements 2.3, 4.3**

### Property 5: Mode Recording
*For any* completed Daily Challenge session, the student_progress record should contain the mode ('balanced' or 'focus') and if focus mode, the selected subtest_code
**Validates: Requirements 2.6**

### Property 6: Streak Counting Across Modes
*For any* Daily Challenge completion (either balanced or focus mode), the system should increment the user's streak by 1
**Validates: Requirements 2.7**

### Property 7: Question Randomization
*For any* two consecutive assessment starts of the same type and configuration, the system should return different question sets (no exact duplicates)
**Validates: Requirements 3.2, 4.4, 7.3**

### Property 8: Subtest Progress Recording
*For any* completed assessment, the system should create student_progress records for exactly the subtests that were included in that assessment (6 for balanced/mini/tryout, 1 for focus)
**Validates: Requirements 3.5, 4.5, 7.7**

### Property 9: Per-Subtest Accuracy Calculation
*For any* completed assessment with multiple subtests, the calculated accuracy for each subtest should equal (correct_answers / total_questions) * 100 for that subtest
**Validates: Requirements 3.6, 8.2**

### Property 10: Try Out UTBK Total Question Count
*For any* Try Out UTBK session, the system should fetch exactly 160 questions distributed across the 6 subtests
**Validates: Requirements 5.1**

### Property 11: Try Out UTBK Subtest Order
*For any* Try Out UTBK session, questions should be ordered by subtest display_order (PPU → PBM → PK → LIT_INDO → LIT_ING → PM)
**Validates: Requirements 5.8**

### Property 12: Try Out UTBK Time Calculation
*For any* completed Try Out UTBK, the total_time should equal (submission_time - start_time) and per-subtest times should sum to total_time
**Validates: Requirements 6.4, 6.5**

### Property 13: Mini Try Out Distribution
*For any* Mini Try Out session, the system should fetch exactly 60 questions with exactly 10 questions from each of the 6 subtests
**Validates: Requirements 7.1, 7.2**

### Property 14: Mini Try Out Assessment Type
*For any* completed Mini Try Out, the student_progress records should have assessment_type = 'mini_tryout'
**Validates: Requirements 7.8**

### Property 15: Strongest/Weakest Subtest Identification
*For any* set of subtest results, the strongest subtest should be the one with the highest accuracy and the weakest should be the one with the lowest accuracy
**Validates: Requirements 8.3, 8.4, 9.3**

### Property 16: Dashboard Subtest Consistency
*For any* dashboard display (progress tab, stats, etc.), exactly 6 subtests should be shown consistently across all views
**Validates: Requirements 9.1**

### Property 17: Cross-Assessment Accuracy Aggregation
*For any* subtest, the overall accuracy should be calculated correctly by aggregating results across all assessment types (daily_challenge, mini_tryout, tryout_utbk)
**Validates: Requirements 9.2**

### Property 18: Historical Mode Preservation
*For any* historical Daily Challenge record, the mode information (balanced/focus) should be preserved and displayed correctly in history views
**Validates: Requirements 9.4**

### Property 19: Backward Compatibility
*For any* student progress record created before the UTBK 2026 update, the system should handle it without errors and include it in overall statistics
**Validates: Requirements 10.1, 10.2, 10.4**

### Property 20: Data Format Distinction
*For any* progress record, the system should be able to identify whether it uses the old 7-subtest format or new 6-subtest format based on the subtest_code values
**Validates: Requirements 10.3**

## Error Handling

### Question Fetching Errors

```typescript
// Insufficient questions in database
if (availableQuestions.length < requiredCount) {
  throw new InsufficientQuestionsError({
    required: requiredCount,
    available: availableQuestions.length,
    subtest: subtestCode,
    assessmentType: type
  })
}

// Fallback: Use questions from similar difficulty if exact match unavailable
// Log warning for content team to add more questions
```

### Mode Selection Errors

```typescript
// Invalid mode selection
if (!['balanced', 'focus'].includes(mode)) {
  throw new InvalidModeError({ mode, validModes: ['balanced', 'focus'] })
}

// Focus mode without subtest selection
if (mode === 'focus' && !subtestCode) {
  throw new MissingSubtestError({ mode: 'focus' })
}

// Invalid subtest code
if (subtestCode && !VALID_SUBTEST_CODES.includes(subtestCode)) {
  throw new InvalidSubtestError({ 
    subtest: subtestCode, 
    validSubtests: VALID_SUBTEST_CODES 
  })
}
```

### Timer and Session Errors

```typescript
// Session expired
if (currentTime > session.expiresAt) {
  // Auto-submit with current answers
  await autoSubmitSession(sessionId)
  throw new SessionExpiredError({ sessionId, expiresAt: session.expiresAt })
}

// Duplicate submission
if (session.status === 'completed') {
  throw new DuplicateSubmissionError({ sessionId })
}
```

### Data Migration Errors

```typescript
// Old subtest code encountered
if (OLD_SUBTEST_CODES.includes(subtestCode)) {
  // Map to new code
  const newCode = SUBTEST_MIGRATION_MAP[subtestCode]
  logger.warn('Old subtest code encountered', { 
    old: subtestCode, 
    new: newCode,
    questionId 
  })
  // Continue with mapped code
}

// Unmapped subtest code
if (!VALID_SUBTEST_CODES.includes(subtestCode) && 
    !OLD_SUBTEST_CODES.includes(subtestCode)) {
  throw new UnknownSubtestError({ subtestCode, questionId })
}
```

## Testing Strategy

### Unit Testing

Unit tests will cover specific examples and edge cases:

**Subtest Configuration Tests:**
- Verify subtests table contains exactly 6 records
- Verify each subtest has correct question count and duration
- Verify subtest codes match UTBK 2026 specification

**Mode Selection Tests:**
- Test balanced mode returns 18 questions
- Test focus mode returns 10 questions
- Test invalid mode throws error
- Test focus mode without subtest throws error

**Question Distribution Tests:**
- Test Try Out UTBK returns 160 questions with correct distribution
- Test Mini Try Out returns 60 questions with correct distribution
- Test balanced mode has 3 questions per subtest
- Test focus mode has all questions from selected subtest

**Progress Recording Tests:**
- Test balanced mode creates 6 progress records
- Test focus mode creates 1 progress record
- Test mini try out creates 6 progress records
- Test correct assessment_type is stored

**Dashboard Integration Tests:**
- Test progress tab shows 6 subtests
- Test strongest/weakest identification
- Test mode display in history
- Test backward compatibility with old data

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** library. Each test will run a minimum of 100 iterations.

**Test Framework:** fast-check (JavaScript/TypeScript property-based testing library)

**Property Test 1: Six Subtest System Configuration**
```typescript
// Feature: utbk-2026-compliance, Property 1: Six Subtest System Configuration
it('should reference exactly 6 UTBK 2026 subtests in all system queries', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('progress', 'dashboard', 'assessment', 'results'),
      async (componentType) => {
        const subtests = await getSubtestsForComponent(componentType)
        expect(subtests).toHaveLength(6)
        expect(subtests.map(s => s.code).sort()).toEqual(
          ['LIT_ING', 'LIT_INDO', 'PBM', 'PK', 'PM', 'PPU']
        )
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 2: Question Subtest Categorization**
```typescript
// Feature: utbk-2026-compliance, Property 2: Question Subtest Categorization
it('should categorize all questions into one of 6 official subtests', () => {
  fc.assert(
    fc.property(
      fc.uuid(),
      async (questionId) => {
        const question = await getQuestion(questionId)
        if (question) {
          expect(['PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'])
            .toContain(question.subtest_code)
        }
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 3: Balanced Mode Distribution**
```typescript
// Feature: utbk-2026-compliance, Property 3: Balanced Mode Distribution
it('should fetch exactly 18 questions with 3 per subtest in balanced mode', () => {
  fc.assert(
    fc.property(
      fc.uuid(),
      async (userId) => {
        const session = await startDailyChallenge(userId, { mode: 'balanced' })
        expect(session.questions).toHaveLength(18)
        
        const subtestCounts = countBySubtest(session.questions)
        expect(Object.keys(subtestCounts)).toHaveLength(6)
        Object.values(subtestCounts).forEach(count => {
          expect(count).toBe(3)
        })
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 4: Focus Mode Distribution**
```typescript
// Feature: utbk-2026-compliance, Property 4: Focus Mode Distribution
it('should fetch exactly 10 questions from selected subtest in focus mode', () => {
  fc.assert(
    fc.property(
      fc.uuid(),
      fc.constantFrom('PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'),
      async (userId, subtestCode) => {
        const session = await startDailyChallenge(userId, { 
          mode: 'focus', 
          subtestCode 
        })
        expect(session.questions).toHaveLength(10)
        session.questions.forEach(q => {
          expect(q.subtest_code).toBe(subtestCode)
        })
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 5: Mode Recording**
```typescript
// Feature: utbk-2026-compliance, Property 5: Mode Recording
it('should record mode and subtest in student progress', () => {
  fc.assert(
    fc.property(
      fc.uuid(),
      fc.constantFrom('balanced', 'focus'),
      fc.option(fc.constantFrom('PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM')),
      async (userId, mode, subtestCode) => {
        if (mode === 'focus' && !subtestCode) return // Skip invalid combination
        
        const session = await startDailyChallenge(userId, { mode, subtestCode })
        await completeSession(session.id, generateAnswers(session.questions))
        
        const progress = await getLatestProgress(userId, 'daily_challenge')
        expect(progress.daily_challenge_mode).toBe(mode)
        if (mode === 'focus') {
          expect(progress.focus_subtest_code).toBe(subtestCode)
        }
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 6: Streak Counting Across Modes**
```typescript
// Feature: utbk-2026-compliance, Property 6: Streak Counting Across Modes
it('should increment streak for both balanced and focus mode completions', () => {
  fc.assert(
    fc.property(
      fc.uuid(),
      fc.constantFrom('balanced', 'focus'),
      async (userId, mode) => {
        const initialStreak = await getUserStreak(userId)
        
        const config = mode === 'focus' 
          ? { mode, subtestCode: 'PPU' }
          : { mode }
        
        const session = await startDailyChallenge(userId, config)
        await completeSession(session.id, generateAnswers(session.questions))
        
        const newStreak = await getUserStreak(userId)
        expect(newStreak).toBe(initialStreak + 1)
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 7: Question Randomization**
```typescript
// Feature: utbk-2026-compliance, Property 7: Question Randomization
it('should return different question sets for consecutive starts', () => {
  fc.assert(
    fc.property(
      fc.uuid(),
      fc.constantFrom('balanced', 'focus'),
      async (userId, mode) => {
        const config = mode === 'focus' 
          ? { mode, subtestCode: 'PPU' }
          : { mode }
        
        const session1 = await startDailyChallenge(userId, config)
        const session2 = await startDailyChallenge(userId, config)
        
        const ids1 = session1.questions.map(q => q.id).sort()
        const ids2 = session2.questions.map(q => q.id).sort()
        
        expect(ids1).not.toEqual(ids2)
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 8: Subtest Progress Recording**
```typescript
// Feature: utbk-2026-compliance, Property 8: Subtest Progress Recording
it('should create progress records for correct subtests based on assessment', () => {
  fc.assert(
    fc.property(
      fc.uuid(),
      fc.constantFrom('balanced', 'focus', 'mini_tryout', 'tryout_utbk'),
      fc.option(fc.constantFrom('PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM')),
      async (userId, assessmentType, subtestCode) => {
        let session
        let expectedSubtestCount
        
        if (assessmentType === 'balanced') {
          session = await startDailyChallenge(userId, { mode: 'balanced' })
          expectedSubtestCount = 6
        } else if (assessmentType === 'focus') {
          if (!subtestCode) return
          session = await startDailyChallenge(userId, { mode: 'focus', subtestCode })
          expectedSubtestCount = 1
        } else if (assessmentType === 'mini_tryout') {
          session = await startMiniTryOut(userId)
          expectedSubtestCount = 6
        } else {
          session = await startTryOutUTBK(userId)
          expectedSubtestCount = 6
        }
        
        await completeSession(session.id, generateAnswers(session.questions))
        
        const progressRecords = await getProgressForSession(session.id)
        const uniqueSubtests = new Set(progressRecords.map(p => p.subtest_code))
        expect(uniqueSubtests.size).toBe(expectedSubtestCount)
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 9: Per-Subtest Accuracy Calculation**
```typescript
// Feature: utbk-2026-compliance, Property 9: Per-Subtest Accuracy Calculation
it('should calculate subtest accuracy as (correct/total) * 100', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        subtest_code: fc.constantFrom('PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'),
        is_correct: fc.boolean()
      }), { minLength: 1, maxLength: 30 }),
      (answers) => {
        const subtestStats = calculateSubtestAccuracy(answers)
        
        Object.entries(subtestStats).forEach(([subtest, stats]) => {
          const subtestAnswers = answers.filter(a => a.subtest_code === subtest)
          const correct = subtestAnswers.filter(a => a.is_correct).length
          const total = subtestAnswers.length
          const expectedAccuracy = Math.round((correct / total) * 100)
          
          expect(stats.accuracy).toBe(expectedAccuracy)
        })
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 10: Try Out UTBK Total Question Count**
```typescript
// Feature: utbk-2026-compliance, Property 10: Try Out UTBK Total Question Count
it('should fetch exactly 160 questions for Try Out UTBK', () => {
  fc.assert(
    fc.property(
      fc.uuid(),
      async (userId) => {
        const session = await startTryOutUTBK(userId)
        expect(session.questions).toHaveLength(160)
        
        const subtestCounts = countBySubtest(session.questions)
        expect(subtestCounts['PPU']).toBe(20)
        expect(subtestCounts['PBM']).toBe(20)
        expect(subtestCounts['PK']).toBe(20)
        expect(subtestCounts['LIT_INDO']).toBe(30)
        expect(subtestCounts['LIT_ING']).toBe(20)
        expect(subtestCounts['PM']).toBe(20)
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 13: Mini Try Out Distribution**
```typescript
// Feature: utbk-2026-compliance, Property 13: Mini Try Out Distribution
it('should fetch exactly 60 questions with 10 per subtest for Mini Try Out', () => {
  fc.assert(
    fc.property(
      fc.uuid(),
      async (userId) => {
        const session = await startMiniTryOut(userId)
        expect(session.questions).toHaveLength(60)
        
        const subtestCounts = countBySubtest(session.questions)
        expect(Object.keys(subtestCounts)).toHaveLength(6)
        Object.values(subtestCounts).forEach(count => {
          expect(count).toBe(10)
        })
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 15: Strongest/Weakest Subtest Identification**
```typescript
// Feature: utbk-2026-compliance, Property 15: Strongest/Weakest Subtest Identification
it('should correctly identify strongest and weakest subtests', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        subtest_code: fc.constantFrom('PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'),
        accuracy: fc.integer({ min: 0, max: 100 })
      }), { minLength: 6, maxLength: 6 }),
      (subtestResults) => {
        const { strongest, weakest } = identifyStrongestWeakest(subtestResults)
        
        const maxAccuracy = Math.max(...subtestResults.map(s => s.accuracy))
        const minAccuracy = Math.min(...subtestResults.map(s => s.accuracy))
        
        expect(strongest.accuracy).toBe(maxAccuracy)
        expect(weakest.accuracy).toBe(minAccuracy)
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 17: Cross-Assessment Accuracy Aggregation**
```typescript
// Feature: utbk-2026-compliance, Property 17: Cross-Assessment Accuracy Aggregation
it('should aggregate accuracy correctly across all assessment types', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        assessment_type: fc.constantFrom('daily_challenge', 'mini_tryout', 'tryout_utbk'),
        subtest_code: fc.constantFrom('PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'),
        correct: fc.integer({ min: 0, max: 10 }),
        total: fc.integer({ min: 1, max: 10 })
      }), { minLength: 1, maxLength: 50 }),
      (progressRecords) => {
        const aggregated = aggregateAccuracyBySubtest(progressRecords)
        
        Object.entries(aggregated).forEach(([subtest, stats]) => {
          const subtestRecords = progressRecords.filter(r => r.subtest_code === subtest)
          const totalCorrect = subtestRecords.reduce((sum, r) => sum + r.correct, 0)
          const totalQuestions = subtestRecords.reduce((sum, r) => sum + r.total, 0)
          const expectedAccuracy = Math.round((totalCorrect / totalQuestions) * 100)
          
          expect(stats.accuracy).toBe(expectedAccuracy)
        })
      }
    ),
    { numRuns: 100 }
  )
})
```

**Property Test 19: Backward Compatibility**
```typescript
// Feature: utbk-2026-compliance, Property 19: Backward Compatibility
it('should handle old 7-subtest records without errors', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        subtest_code: fc.constantFrom('PU', 'PPU', 'PBM', 'PK', 'LIT_INDO', 'LIT_ING', 'PM'),
        correct: fc.integer({ min: 0, max: 10 }),
        total: fc.integer({ min: 1, max: 10 }),
        created_at: fc.date()
      }), { minLength: 1, maxLength: 50 }),
      (mixedRecords) => {
        // Should not throw error
        expect(() => {
          const stats = calculateOverallStats(mixedRecords)
          expect(stats.totalQuestions).toBeGreaterThan(0)
        }).not.toThrow()
      }
    ),
    { numRuns: 100 }
  )
})
```

### Integration Testing

Integration tests will verify end-to-end flows:

- Complete Daily Challenge flow (both modes)
- Complete Mini Try Out flow
- Complete Try Out UTBK flow
- Dashboard data refresh after assessments
- Historical data display with mixed old/new format

### Migration Testing

- Test migration script on copy of production data
- Verify all questions mapped to new subtests
- Verify no data loss
- Verify backward compatibility maintained

## Implementation Phases

### Phase 1: Database Migration (Days 1-2)
- Create subtests reference table
- Add new columns to student_progress
- Update question_bank with subtest_code
- Run migration scripts
- Verify data integrity

### Phase 2: Daily Challenge Enhancement (Days 3-7)
- Implement mode selection UI
- Implement balanced mode logic
- Implement focus mode logic
- Update progress recording
- Update streak calculation
- Test both modes thoroughly

### Phase 3: Try Out UTBK Update (Days 8-12)
- Update question fetching to 160 questions
- Update subtest distribution logic
- Update timer display (195 minutes)
- Update results display
- Update dashboard integration
- Test full flow

### Phase 4: Mini Try Out Implementation (Days 13-17)
- Create Mini Try Out UI
- Implement 60-question fetching
- Implement 90-minute timer
- Implement results display
- Add to dashboard
- Test full flow

### Phase 5: Dashboard Updates (Days 18-20)
- Update Progress Tab for 6 subtests
- Update all analytics for 6 subtests
- Update historical displays
- Add mode indicators
- Test all dashboard views

### Phase 6: Testing & Polish (Days 21-24)
- Run all property-based tests
- Run integration tests
- Test backward compatibility
- Performance testing
- Bug fixes and polish

### Phase 7: Deployment (Day 25)
- Deploy to staging
- Final testing
- Deploy to production
- Monitor for issues

## Performance Considerations

### Query Optimization

```sql
-- Index for fast subtest filtering
CREATE INDEX idx_question_bank_subtest_code ON question_bank(subtest_code);

-- Index for progress queries
CREATE INDEX idx_student_progress_user_subtest 
  ON student_progress(user_id, subtest_code, created_at DESC);

-- Index for assessment type filtering
CREATE INDEX idx_student_progress_assessment_type 
  ON student_progress(assessment_type, user_id);
```

### Caching Strategy

```typescript
// Cache subtest configuration (rarely changes)
const SUBTEST_CACHE_TTL = 24 * 60 * 60 // 24 hours

// Cache user progress summary (update on new completion)
const PROGRESS_CACHE_TTL = 5 * 60 // 5 minutes

// Invalidate cache on:
// - New assessment completion
// - Manual refresh request
```

### Question Fetching Optimization

```typescript
// Batch fetch all questions for assessment in single query
// Rather than 6 separate queries per subtest

const questions = await supabase
  .from('question_bank')
  .select('*')
  .in('subtest_code', subtestCodes)
  .limit(totalQuestions)

// Then distribute client-side for better performance
```

## Security Considerations

- Validate mode selection on server-side
- Validate subtest codes against whitelist
- Prevent manipulation of question counts
- Ensure progress records match actual questions answered
- Rate limit assessment starts to prevent abuse

## Monitoring and Analytics

### Metrics to Track

- Daily Challenge mode distribution (balanced vs focus)
- Focus mode subtest selection frequency
- Mini Try Out completion rate
- Try Out UTBK completion rate
- Average time per assessment type
- Subtest performance trends
- Migration success rate

### Alerts

- Alert if question fetching fails
- Alert if subtest distribution is incorrect
- Alert if migration errors occur
- Alert if backward compatibility breaks

## Documentation Updates

- Update user guide with new Daily Challenge modes
- Document Mini Try Out feature
- Update API documentation
- Update database schema documentation
- Create migration runbook
